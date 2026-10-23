import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, validateBranchScope } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createCashRequest } from '@/lib/transfers';
import { logAuditEvent } from '@/lib/audit';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth.response) return auth.response;
  const session = auth.session!;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const branchId = searchParams.get('branchId');

  // Branch filtering based on session scope
  let branchFilter: any = {};
  if (session.role === 'BRANCH_MANAGER' || session.role === 'CASHIER' || session.role === 'RECEIVING_OFFICER') {
    // Restricted to user's assigned branch
    branchFilter = {
      OR: [{ fromBranchId: session.branchId }, { toBranchId: session.branchId }],
    };
  } else if (branchId) {
    branchFilter = {
      OR: [{ fromBranchId: branchId }, { toBranchId: branchId }],
    };
  }

  const whereClause: any = {
    ...branchFilter,
  };

  if (status) {
    whereClause.status = status;
  }
  if (type) {
    whereClause.transferType = type;
  }

  const transfers = await prisma.cashTransfer.findMany({
    where: whereClause,
    include: {
      sourceAccount: true,
      destinationAccount: true,
      fromBranch: true,
      toBranch: true,
      denominationTallies: true,
      journalEntries: {
        include: { lines: true },
      },
    },
    orderBy: { requestedAt: 'desc' },
  });

  return NextResponse.json({ transfers });
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth.response) return auth.response;
  const session = auth.session!;

  // Auditors cannot create transfers
  if (session.role === 'AUDITOR') {
    return NextResponse.json({ error: 'Auditors have read-only access' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      transferType,
      sourceAccountId,
      destinationAccountId,
      fromBranchId,
      toBranchId,
      requestedAmount,
      purpose,
      urgency,
    } = body;

    if (!transferType || !sourceAccountId || !destinationAccountId || !requestedAmount || !purpose) {
      return NextResponse.json(
        { error: 'Missing required fields: transferType, sourceAccountId, destinationAccountId, requestedAmount, purpose' },
        { status: 400 }
      );
    }

    // Verify branch scope
    const targetBranch = toBranchId || session.branchId;
    if (!validateBranchScope(session, targetBranch)) {
      return NextResponse.json({ error: 'Forbidden: You cannot request cash for an unauthorized branch' }, { status: 403 });
    }

    const transfer = await createCashRequest(session, {
      transferType,
      sourceAccountId,
      destinationAccountId,
      fromBranchId,
      toBranchId: targetBranch,
      requestedAmount: Number(requestedAmount),
      purpose,
      urgency,
    });

    await logAuditEvent({
      session,
      action: 'CASH_REQUEST_CREATED',
      resource: 'CashTransfer',
      resourceId: transfer.id,
      details: {
        transferNumber: transfer.transferNumber,
        transferType,
        requestedAmount,
        fromBranchId,
        toBranchId: targetBranch,
      },
      status: 'SUCCESS',
    });

    return NextResponse.json({ success: true, transfer }, { status: 201 });
  } catch (error: any) {
    console.error('Create transfer error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create cash transfer' }, { status: 400 });
  }
}
