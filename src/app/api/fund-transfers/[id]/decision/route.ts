import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { recordAuditEvent } from '@/lib/audit';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = requireAuth(request);
  if (response) return response;

  const { id } = await params;

  // Authorization check: Either a Manager or Mr. Sanjay (MAIN_ADMIN / SYSTEM_ADMIN)
  const isAuthorizedApprover =
    session!.role === 'MAIN_ADMIN' ||
    session!.role === 'SYSTEM_ADMIN' ||
    session!.role === 'BRANCH_MANAGER';

  if (!isAuthorizedApprover) {
    return NextResponse.json(
      { error: 'Forbidden: Only authorized Managers or Mr. Sanjay can approve or reject funding requests.' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { decision, notes, rejectionReason } = body;

    if (decision !== 'APPROVE' && decision !== 'REJECT') {
      return NextResponse.json({ error: "Decision must be 'APPROVE' or 'REJECT'." }, { status: 400 });
    }

    if (decision === 'REJECT' && !rejectionReason?.trim() && !notes?.trim()) {
      return NextResponse.json({ error: 'A specific reason is mandatory when rejecting a transfer request.' }, { status: 400 });
    }

    // 1. Fetch current transfer to prevent duplicate approvals or conflicting decisions
    const transfer = await prisma.fundTransferRequest.findUnique({
      where: { id },
      include: { customer: true, requestingBranch: true, fundingBranch: true },
    });

    if (!transfer) {
      return NextResponse.json({ error: 'Transfer request not found.' }, { status: 404 });
    }

    // Invariant: Once decision has been made, prevent duplicate approvals or conflicting decisions
    if (transfer.status !== 'PENDING_APPROVAL') {
      return NextResponse.json(
        {
          error: `Decision already recorded! Transfer ${transfer.id} is currently in '${transfer.status}' status (decided by ${transfer.approvedByUserName || 'authorized officer'}). Duplicate or conflicting decision prevented.`,
        },
        { status: 409 }
      );
    }

    const now = new Date();
    const approverName =
      session!.role === 'MAIN_ADMIN'
        ? 'Mr. Sanjay'
        : `${session!.firstName} ${session!.lastName}`.trim() || session!.username;

    const newStatus = decision === 'APPROVE' ? 'APPROVED_AWAITING_PAYMENT' : 'REJECTED';

    const updated = await prisma.fundTransferRequest.update({
      where: { id },
      data: {
        status: newStatus,
        approvedByUserId: session!.userId,
        approvedByUserName: approverName,
        approvalDecision: decision === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        approvalNotes: notes ? notes.trim() : null,
        rejectionReason: decision === 'REJECT' ? (rejectionReason || notes).trim() : null,
        approvalDate: now,
      },
      include: { customer: true, requestingBranch: true, fundingBranch: true },
    });

    // 2. Send Notification to Requesting Branch & Mr. Sanjay
    await prisma.notification.createMany({
      data: [
        {
          recipientUserId: transfer.requestingUserId,
          title: `Request ${id} ${decision === 'APPROVE' ? 'Approved' : 'Rejected'}`,
          message: `Your request of LKR ${transfer.requestedAmount.toLocaleString()} for ${transfer.customer.fullName} was ${decision.toLowerCase()}d by ${approverName}.`,
          link: `/transfers?id=${id}`,
          type: decision === 'APPROVE' ? 'REQUEST_APPROVED' : 'REQUEST_REJECTED',
          isRead: false,
        },
        ...(session!.role !== 'MAIN_ADMIN'
          ? [
              {
                recipientRole: 'MAIN_ADMIN',
                title: `Request ${id} ${decision === 'APPROVE' ? 'Approved' : 'Rejected'} by ${approverName}`,
                message: `${approverName} has ${decision.toLowerCase()}d the LKR ${transfer.requestedAmount.toLocaleString()} transfer from ${transfer.fundingBranch.name}.`,
                link: `/transfers?id=${id}`,
                type: decision === 'APPROVE' ? 'REQUEST_APPROVED' : 'REQUEST_REJECTED',
                isRead: false,
              },
            ]
          : []),
      ],
    });

    // 3. Record Audit Log
    await recordAuditEvent({
      userId: session!.userId,
      username: session!.username,
      role: session!.role,
      branchId: transfer.fundingBranchId,
      action: decision === 'APPROVE' ? 'TRANSFER_APPROVED' : 'TRANSFER_REJECTED',
      resource: 'FundTransferRequest',
      resourceId: id,
      details: {
        decision: updated.approvalDecision,
        approver: approverName,
        amount: transfer.requestedAmount,
        notes: notes || rejectionReason,
      },
      status: 'SUCCESS',
    });

    return NextResponse.json({ transfer: updated });
  } catch (err: any) {
    console.error('Error recording approval decision:', err);
    return NextResponse.json({ error: err.message || 'Failed to process decision' }, { status: 500 });
  }
}
