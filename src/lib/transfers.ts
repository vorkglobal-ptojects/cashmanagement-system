import { prisma } from './db';
import { AuthSession, DenominationBreakdown } from './types';
import { postGlJournalEntry } from './gl';
import { calculateTallyTotal } from './tallies';

/**
 * Creates a new Cash Transfer Request
 */
export async function createCashRequest(
  session: AuthSession,
  data: {
    transferType: string;
    sourceAccountId: string;
    destinationAccountId: string;
    fromBranchId?: string | null;
    toBranchId?: string | null;
    requestedAmount: number;
    purpose: string;
    urgency?: string;
  }
) {
  if (data.requestedAmount <= 0) {
    throw new Error('Requested amount must be strictly greater than zero');
  }

  // Generate unique transfer number CTR-YYYY-XXXXX
  const count = await prisma.cashTransfer.count();
  const transferNumber = `CTR-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

  return prisma.cashTransfer.create({
    data: {
      transferNumber,
      transferType: data.transferType,
      sourceAccountId: data.sourceAccountId,
      destinationAccountId: data.destinationAccountId,
      fromBranchId: data.fromBranchId ?? null,
      toBranchId: data.toBranchId ?? session.branchId ?? null,
      requestedAmount: data.requestedAmount,
      purpose: data.purpose,
      urgency: data.urgency || 'NORMAL',
      status: 'REQUESTED',
      requestedByUserId: session.userId,
      requestedByUsername: `${session.firstName} ${session.lastName}`.trim() || session.username,
      requestedAt: new Date(),
    },
    include: {
      sourceAccount: true,
      destinationAccount: true,
      fromBranch: true,
      toBranch: true,
    },
  });
}

/**
 * Approve a Cash Transfer Request
 * Separation of Duties: Approver cannot be the requester!
 */
export async function approveCashRequest(
  session: AuthSession,
  transferId: string,
  approvedAmount?: number
) {
  const transfer = await prisma.cashTransfer.findUnique({
    where: { id: transferId },
  });

  if (!transfer) throw new Error('Cash transfer not found');
  if (transfer.status !== 'REQUESTED') {
    throw new Error(`Cannot approve transfer in status '${transfer.status}'. Expected 'REQUESTED'`);
  }

  // Strict Separation of Duties check
  if (transfer.requestedByUserId === session.userId) {
    throw new Error('Separation of Duties Violation: You cannot approve a cash request that you created');
  }

  const finalAmount = approvedAmount && approvedAmount > 0 ? approvedAmount : transfer.requestedAmount;

  return prisma.cashTransfer.update({
    where: { id: transferId },
    data: {
      status: 'APPROVED',
      approvedAmount: finalAmount,
      approvedByUserId: session.userId,
      approvedByUsername: `${session.firstName} ${session.lastName}`.trim() || session.username,
      approvedAt: new Date(),
    },
  });
}

/**
 * Reject a Cash Transfer Request
 */
export async function rejectCashRequest(
  session: AuthSession,
  transferId: string,
  reason: string
) {
  const transfer = await prisma.cashTransfer.findUnique({
    where: { id: transferId },
  });

  if (!transfer) throw new Error('Cash transfer not found');
  if (transfer.status !== 'REQUESTED' && transfer.status !== 'APPROVED') {
    throw new Error(`Cannot reject transfer in status '${transfer.status}'`);
  }

  return prisma.cashTransfer.update({
    where: { id: transferId },
    data: {
      status: 'REJECTED',
      discrepancyReason: reason,
      updatedAt: new Date(),
    },
  });
}

/**
 * Dispatch Cash Transfer
 * Executes atomic deduction from source vault/till and credit to In-Transit escrow
 */
export async function dispatchCashTransfer(
  session: AuthSession,
  transferId: string,
  dispatchData: {
    tally: DenominationBreakdown;
    securityBagNumber: string;
    vehicleNumber?: string;
    courierName?: string;
    courierNic?: string;
    waybillNumber?: string;
  }
) {
  return prisma.$transaction(async (tx) => {
    const transfer = await tx.cashTransfer.findUnique({
      where: { id: transferId },
      include: { sourceAccount: true, destinationAccount: true },
    });

    if (!transfer) throw new Error('Cash transfer not found');
    if (transfer.status !== 'APPROVED') {
      throw new Error(`Cannot dispatch transfer in status '${transfer.status}'. Expected 'APPROVED'`);
    }

    const calculatedTotal = calculateTallyTotal(dispatchData.tally);
    const expectedAmount = transfer.approvedAmount || transfer.requestedAmount;

    if (Math.abs(calculatedTotal - expectedAmount) > 0.01) {
      throw new Error(
        `Dispatch Tally Mismatch: Physical denomination total (LKR ${calculatedTotal.toLocaleString()}) does not match approved amount (LKR ${expectedAmount.toLocaleString()})`
      );
    }

    // Verify sufficient funds in source account
    if (transfer.sourceAccount.balance < calculatedTotal) {
      throw new Error(
        `Insufficient Funds: Source account '${transfer.sourceAccount.name}' has balance LKR ${transfer.sourceAccount.balance.toLocaleString()}, required LKR ${calculatedTotal.toLocaleString()}`
      );
    }

    // 1. Deduct from source account
    await tx.cashAccount.update({
      where: { id: transfer.sourceAccountId },
      data: {
        balance: { decrement: calculatedTotal },
      },
    });

    // 2. Record Denomination Tally
    await tx.denominationTally.create({
      data: {
        stage: 'DISPATCH',
        transferId: transfer.id,
        note5000: dispatchData.tally.note5000,
        note1000: dispatchData.tally.note1000,
        note500: dispatchData.tally.note500,
        note100: dispatchData.tally.note100,
        note50: dispatchData.tally.note50,
        note20: dispatchData.tally.note20,
        coins: dispatchData.tally.coins,
        totalCalculated: calculatedTotal,
        countedByUserId: session.userId,
        countedByName: `${session.firstName} ${session.lastName}`.trim() || session.username,
      },
    });

    // 3. Post Balanced Double-Entry General Ledger Voucher
    await postGlJournalEntry(tx, {
      branchId: transfer.fromBranchId,
      referenceType: 'CASH_TRANSFER_DISPATCH',
      referenceId: transfer.id,
      description: `Cash Dispatch ${transfer.transferNumber} from ${transfer.sourceAccount.name}`,
      lines: [
        {
          accountId: 'IN_TRANSIT_ESCROW',
          accountName: 'Cash In-Transit (Escrow Asset)',
          debit: calculatedTotal,
          credit: 0,
          memo: `Dispatched to ${transfer.destinationAccount.name}`,
        },
        {
          accountId: transfer.sourceAccountId,
          accountName: transfer.sourceAccount.name,
          debit: 0,
          credit: calculatedTotal,
          memo: `Dispatched under Seal #${dispatchData.securityBagNumber}`,
        },
      ],
    });

    // 4. Update Transfer Status to IN_TRANSIT
    const updated = await tx.cashTransfer.update({
      where: { id: transfer.id },
      data: {
        status: 'IN_TRANSIT',
        dispatchedAmount: calculatedTotal,
        securityBagNumber: dispatchData.securityBagNumber,
        vehicleNumber: dispatchData.vehicleNumber,
        courierName: dispatchData.courierName,
        courierNic: dispatchData.courierNic,
        waybillNumber: dispatchData.waybillNumber,
        dispatchedByUserId: session.userId,
        dispatchedByUsername: `${session.firstName} ${session.lastName}`.trim() || session.username,
        dispatchedAt: new Date(),
      },
      include: {
        sourceAccount: true,
        destinationAccount: true,
      },
    });

    return updated;
  });
}

/**
 * Receive and Accept Cash Transfer at Destination
 * Separation of Duties: Receiver cannot be the dispatcher!
 */
export async function receiveAndAcceptCashTransfer(
  session: AuthSession,
  transferId: string,
  receiveData: {
    tally: DenominationBreakdown;
    notes?: string;
  }
) {
  return prisma.$transaction(async (tx) => {
    const transfer = await tx.cashTransfer.findUnique({
      where: { id: transferId },
      include: { sourceAccount: true, destinationAccount: true },
    });

    if (!transfer) throw new Error('Cash transfer not found');
    if (transfer.status !== 'IN_TRANSIT') {
      throw new Error(`Cannot receive transfer in status '${transfer.status}'. Expected 'IN_TRANSIT'`);
    }

    // Strict Separation of Duties check
    if (transfer.dispatchedByUserId === session.userId) {
      throw new Error(
        'Separation of Duties Violation: The dispatcher who handed over physical cash cannot be the receiving officer'
      );
    }

    const countedTotal = calculateTallyTotal(receiveData.tally);
    const expectedDispatched = transfer.dispatchedAmount || transfer.approvedAmount || transfer.requestedAmount;
    const variance = Math.round((countedTotal - expectedDispatched) * 100) / 100;

    // Record Receiving Denomination Tally
    await tx.denominationTally.create({
      data: {
        stage: 'RECEIPT',
        transferId: transfer.id,
        note5000: receiveData.tally.note5000,
        note1000: receiveData.tally.note1000,
        note500: receiveData.tally.note500,
        note100: receiveData.tally.note100,
        note50: receiveData.tally.note50,
        note20: receiveData.tally.note20,
        coins: receiveData.tally.coins,
        totalCalculated: countedTotal,
        countedByUserId: session.userId,
        countedByName: `${session.firstName} ${session.lastName}`.trim() || session.username,
        notes: receiveData.notes,
      },
    });

    // Check if there is a discrepancy
    if (Math.abs(variance) >= 0.01) {
      // Flag Discrepancy! Do not credit normal destination until resolved or credit actual count
      await tx.cashAccount.update({
        where: { id: transfer.destinationAccountId },
        data: {
          balance: { increment: countedTotal },
        },
      });

      // Post GL entry reflecting actual cash received and discrepancy account
      await postGlJournalEntry(tx, {
        branchId: transfer.toBranchId,
        referenceType: 'CASH_TRANSFER_DISCREPANCY',
        referenceId: transfer.id,
        description: `Cash Receipt Discrepancy ${transfer.transferNumber} Variance LKR ${variance}`,
        lines: [
          {
            accountId: transfer.destinationAccountId,
            accountName: transfer.destinationAccount.name,
            debit: countedTotal,
            credit: 0,
            memo: 'Actual cash received into account',
          },
          variance < 0
            ? {
                accountId: 'CASH_TRANSIT_SHORTAGE',
                accountName: 'Transit Cash Shortage (Receivable/Loss)',
                debit: Math.abs(variance),
                credit: 0,
                memo: `Missing in-transit physical cash: LKR ${Math.abs(variance)}`,
              }
            : {
                accountId: 'CASH_TRANSIT_OVERAGE',
                accountName: 'Transit Cash Overage (Unearned/Payable)',
                debit: 0,
                credit: variance,
                memo: `Excess in-transit physical cash: LKR ${variance}`,
              },
          {
            accountId: 'IN_TRANSIT_ESCROW',
            accountName: 'Cash In-Transit (Escrow Asset)',
            debit: 0,
            credit: expectedDispatched,
            memo: 'Cleared in-transit escrow balance',
          },
        ],
      });

      return tx.cashTransfer.update({
        where: { id: transfer.id },
        data: {
          status: 'DISCREPANCY_FLAGGED',
          receivedAmount: countedTotal,
          varianceAmount: variance,
          discrepancyReason: `Physical count variance detected: Expected LKR ${expectedDispatched.toLocaleString()}, Received LKR ${countedTotal.toLocaleString()} (Variance: LKR ${variance.toLocaleString()}). ${receiveData.notes || ''}`.trim(),
          receivedByUserId: session.userId,
          receivedByUsername: `${session.firstName} ${session.lastName}`.trim() || session.username,
          receivedAt: new Date(),
        },
        include: {
          sourceAccount: true,
          destinationAccount: true,
        },
      });
    }

    // Normal Clean Acceptance: Exact Match
    // 1. Credit destination account
    await tx.cashAccount.update({
      where: { id: transfer.destinationAccountId },
      data: {
        balance: { increment: countedTotal },
      },
    });

    // 2. Post balanced GL entry
    await postGlJournalEntry(tx, {
      branchId: transfer.toBranchId,
      referenceType: 'CASH_TRANSFER_ACCEPT',
      referenceId: transfer.id,
      description: `Cash Acceptance ${transfer.transferNumber} into ${transfer.destinationAccount.name}`,
      lines: [
        {
          accountId: transfer.destinationAccountId,
          accountName: transfer.destinationAccount.name,
          debit: countedTotal,
          credit: 0,
          memo: 'Received and accepted into vault/till',
        },
        {
          accountId: 'IN_TRANSIT_ESCROW',
          accountName: 'Cash In-Transit (Escrow Asset)',
          debit: 0,
          credit: countedTotal,
          memo: 'Cleared in-transit escrow balance',
        },
      ],
    });

    // 3. Update status to ACCEPTED
    return tx.cashTransfer.update({
      where: { id: transfer.id },
      data: {
        status: 'ACCEPTED',
        receivedAmount: countedTotal,
        varianceAmount: 0.0,
        receivedByUserId: session.userId,
        receivedByUsername: `${session.firstName} ${session.lastName}`.trim() || session.username,
        receivedAt: new Date(),
        acceptedByUserId: session.userId,
        acceptedByUsername: `${session.firstName} ${session.lastName}`.trim() || session.username,
        acceptedAt: new Date(),
      },
      include: {
        sourceAccount: true,
        destinationAccount: true,
      },
    });
  });
}
