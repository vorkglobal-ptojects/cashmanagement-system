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

  // Authorization: Manager or Mr. Sanjay (MAIN_ADMIN / SYSTEM_ADMIN)
  const isAuthorized =
    session!.role === 'MAIN_ADMIN' ||
    session!.role === 'SYSTEM_ADMIN' ||
    session!.role === 'BRANCH_MANAGER';

  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Forbidden: Only authorized Managers or Mr. Sanjay can verify payment receipts.' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { action, notes } = body; // action: 'VERIFY' or 'FLAG_FOR_REVIEW'

    if (action !== 'VERIFY' && action !== 'FLAG_FOR_REVIEW') {
      return NextResponse.json(
        { error: "Action must be 'VERIFY' or 'FLAG_FOR_REVIEW'." },
        { status: 400 }
      );
    }

    const transfer = await prisma.fundTransferRequest.findUnique({
      where: { id },
      include: { customer: true, requestingBranch: true, fundingBranch: true },
    });

    if (!transfer) {
      return NextResponse.json({ error: 'Transfer not found.' }, { status: 404 });
    }

    if (transfer.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Immutability protection: Completed transactions cannot be re-verified or altered.' },
        { status: 400 }
      );
    }

    const now = new Date();
    const verifierName =
      session!.role === 'MAIN_ADMIN'
        ? 'Mr. Sanjay'
        : `${session!.firstName} ${session!.lastName}`.trim() || session!.username;

    const newStatus = action === 'VERIFY' ? 'COMPLETED' : 'VERIFICATION_REQUIRED';

    const updated = await prisma.fundTransferRequest.update({
      where: { id },
      data: {
        status: newStatus,
        verifiedByUserId: session!.userId,
        verifiedByUserName: verifierName,
        verifiedAt: now,
        verificationStatus: action === 'VERIFY' ? 'VERIFIED' : 'FLAGGED_FOR_REVIEW',
        verificationNotes: notes ? notes.trim() : null,
      },
      include: { customer: true, requestingBranch: true, fundingBranch: true },
    });

    // Notify parties
    await prisma.notification.createMany({
      data: [
        {
          recipientUserId: transfer.requestingUserId,
          title: action === 'VERIFY' ? `Transfer ${id} Completed` : `Verification Required for ${id}`,
          message:
            action === 'VERIFY'
              ? `Payment receipt for ${transfer.customer.fullName} was verified and confirmed by ${verifierName}. Transaction is Completed.`
              : `Transaction ${id} was flagged for review by ${verifierName}: ${notes || 'Please review receipt details.'}`,
          link: `/transfers?id=${id}`,
          type: action === 'VERIFY' ? 'PAYMENT_VERIFIED' : 'VERIFICATION_FLAGGED',
          isRead: false,
        },
      ],
    });

    // Audit log
    await recordAuditEvent({
      userId: session!.userId,
      username: session!.username,
      role: session!.role,
      branchId: transfer.fundingBranchId,
      action: action === 'VERIFY' ? 'PAYMENT_VERIFIED' : 'VERIFICATION_FLAGGED',
      resource: 'FundTransferRequest',
      resourceId: id,
      details: {
        verified: action === 'VERIFY',
        verifier: verifierName,
        status: newStatus,
        notes: notes || 'Receipt verified against banking channel confirmation',
      },
      status: 'SUCCESS',
    });

    return NextResponse.json({ transfer: updated });
  } catch (err: any) {
    console.error('Error verifying payment:', err);
    return NextResponse.json({ error: err.message || 'Failed to verify transaction' }, { status: 500 });
  }
}
