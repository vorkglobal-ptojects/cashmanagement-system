import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { recordAuditEvent } from '@/lib/audit';

export async function GET(request: NextRequest) {
  const { session, response } = requireAuth(request);
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status')?.trim();
  const branchId = searchParams.get('branchId')?.trim();
  const customerId = searchParams.get('customerId')?.trim();

  try {
    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (branchId && branchId !== 'All') {
      where.OR = [
        { requestingBranchId: branchId },
        { fundingBranchId: branchId },
      ];
    }

    if (customerId) {
      where.customerId = customerId;
    }

    const transfers = await prisma.fundTransferRequest.findMany({
      where,
      include: {
        customer: true,
        requestingBranch: {
          select: { id: true, name: true, code: true, city: true },
        },
        fundingBranch: {
          select: { id: true, name: true, code: true, city: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ transfers });
  } catch (err: any) {
    console.error('Error fetching fund transfers:', err);
    return NextResponse.json({ error: 'Failed to retrieve transfers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { session, response } = requireAuth(request);
  if (response) return response;

  try {
    const body = await request.json();
    const {
      customerId,
      requestingBranchId,
      fundingBranchId,
      requestedAmount,
      reason,
      additionalNotes,
    } = body;

    // 1. Validation
    if (!customerId || !requestingBranchId || !fundingBranchId || !requestedAmount || !reason) {
      return NextResponse.json(
        { error: 'Customer, Requesting Branch, Funding Branch, Requested Amount, and Reason are required.' },
        { status: 400 }
      );
    }

    const amountNum = parseFloat(requestedAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { error: 'Requested amount must be a valid positive number.' },
        { status: 400 }
      );
    }

    // 2. Verify Customer
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      return NextResponse.json({ error: 'Selected customer was not found.' }, { status: 404 });
    }

    // 3. Generate Request ID: BFT-2026-XXXX
    const count = await prisma.fundTransferRequest.count();
    const nextSeq = String(count + 1).padStart(4, '0');
    const requestId = `BFT-2026-${nextSeq}`;

    const newTransfer = await prisma.fundTransferRequest.create({
      data: {
        id: requestId,
        customerId,
        requestingBranchId,
        fundingBranchId,
        requestedAmount: amountNum,
        currency: 'LKR',
        reason: reason.trim(),
        additionalNotes: additionalNotes ? additionalNotes.trim() : null,
        requestingUserId: session!.userId,
        requestingUserName: `${session!.firstName} ${session!.lastName}`.trim() || session!.username,
        status: 'PENDING_APPROVAL',
      },
      include: {
        customer: true,
        requestingBranch: true,
        fundingBranch: true,
      },
    });

    // 4. Notify both the Funding Branch Manager and Mr. Sanjay (Main Admin)
    await prisma.notification.createMany({
      data: [
        {
          recipientRole: 'MAIN_ADMIN',
          title: `New Fund Transfer Request ${requestId}`,
          message: `${newTransfer.requestingBranch.name} requested LKR ${amountNum.toLocaleString()} from ${newTransfer.fundingBranch.name} for ${customer.fullName}.`,
          link: `/transfers?id=${requestId}`,
          type: 'REQUEST_SUBMITTED',
          isRead: false,
        },
        {
          recipientRole: 'BRANCH_MANAGER',
          recipientBranchId: fundingBranchId,
          title: `Funding Request Received: ${requestId}`,
          message: `${newTransfer.requestingBranch.name} is requesting LKR ${amountNum.toLocaleString()} from your branch for customer ${customer.fullName}.`,
          link: `/transfers?id=${requestId}`,
          type: 'REQUEST_SUBMITTED',
          isRead: false,
        },
      ],
    });

    // 5. Audit log
    await recordAuditEvent({
      userId: session!.userId,
      username: session!.username,
      role: session!.role,
      branchId: requestingBranchId,
      action: 'TRANSFER_REQUESTED',
      resource: 'FundTransferRequest',
      resourceId: requestId,
      details: {
        customer: customer.fullName,
        amount: amountNum,
        requestingBranch: newTransfer.requestingBranch.name,
        fundingBranch: newTransfer.fundingBranch.name,
        reason,
      },
      status: 'SUCCESS',
    });

    return NextResponse.json({ transfer: newTransfer }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating fund transfer:', err);
    return NextResponse.json({ error: err.message || 'Failed to submit transfer request' }, { status: 500 });
  }
}
