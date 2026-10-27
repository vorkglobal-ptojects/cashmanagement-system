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

  // Authorization check: Managers, Main Admin, or authorized employees
  const isAuthorized =
    session!.role === 'MAIN_ADMIN' ||
    session!.role === 'SYSTEM_ADMIN' ||
    session!.role === 'BRANCH_MANAGER' ||
    session!.role === 'BRANCH_EMPLOYEE';

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized to record payments.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      actualAmountPaid,
      paymentMethod,
      bankTransactionReference,
      paymentNotes,
      receiptUrl,
      receiptFileName,
      receiptMimeType,
    } = body;

    if (!actualAmountPaid || !paymentMethod || !bankTransactionReference) {
      return NextResponse.json(
        { error: 'Actual Amount Paid, Payment Method, and Bank Transaction Reference are required.' },
        { status: 400 }
      );
    }

    if (!receiptUrl) {
      return NextResponse.json(
        { error: 'Payment receipt / transfer confirmation file is mandatory to submit for verification.' },
        { status: 400 }
      );
    }

    // Validate file type
    const validMimes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'image/svg+xml'];
    if (receiptMimeType && !validMimes.some((m) => receiptMimeType.includes(m.split('/')[1]))) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed formats: PDF, JPG, PNG.' },
        { status: 400 }
      );
    }

    const paidNum = parseFloat(actualAmountPaid);
    if (isNaN(paidNum) || paidNum <= 0) {
      return NextResponse.json({ error: 'Actual amount paid must be a positive number.' }, { status: 400 });
    }

    // Fetch transfer
    const transfer = await prisma.fundTransferRequest.findUnique({
      where: { id },
      include: { customer: true, requestingBranch: true, fundingBranch: true },
    });

    if (!transfer) {
      return NextResponse.json({ error: 'Transfer not found.' }, { status: 404 });
    }

    // State check
    if (
      transfer.status !== 'APPROVED_AWAITING_PAYMENT' &&
      transfer.status !== 'VERIFICATION_REQUIRED'
    ) {
      return NextResponse.json(
        { error: `Cannot record payment for transfer in '${transfer.status}' status. Transfer must be Approved.` },
        { status: 400 }
      );
    }

    const now = new Date();
    const payerName =
      session!.role === 'MAIN_ADMIN'
        ? 'Mr. Sanjay'
        : `${session!.firstName} ${session!.lastName}`.trim() || session!.username;

    const updated = await prisma.fundTransferRequest.update({
      where: { id },
      data: {
        status: 'PAYMENT_SUBMITTED_AWAITING_VERIFICATION',
        actualAmountPaid: paidNum,
        paymentDate: now,
        paymentMethod,
        bankTransactionReference: bankTransactionReference.trim(),
        paidByUserId: session!.userId,
        paidByUserName: payerName,
        paymentNotes: paymentNotes ? paymentNotes.trim() : null,
        receiptUrl,
        receiptFileName: receiptFileName || 'receipt.png',
        receiptMimeType: receiptMimeType || 'image/png',
        receiptUploadedAt: now,
        receiptUploadedByUserId: session!.userId,
        receiptUploadedByUserName: payerName,
      },
      include: { customer: true, requestingBranch: true, fundingBranch: true },
    });

    // Notify Approvers & Mr. Sanjay that payment receipt is ready for verification
    await prisma.notification.createMany({
      data: [
        {
          recipientRole: 'MAIN_ADMIN',
          title: `Payment Submitted for ${id}`,
          message: `${payerName} recorded direct bank payment of LKR ${paidNum.toLocaleString()} and uploaded receipt (Ref: ${bankTransactionReference}). Awaiting verification.`,
          link: `/transfers?id=${id}`,
          type: 'PAYMENT_SUBMITTED',
          isRead: false,
        },
        {
          recipientUserId: transfer.requestingUserId,
          title: `Payment Processed for ${id}`,
          message: `Direct bank transfer of LKR ${paidNum.toLocaleString()} was executed for ${transfer.customer.fullName}. Receipt uploaded and awaiting verification.`,
          link: `/transfers?id=${id}`,
          type: 'PAYMENT_SUBMITTED',
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
      action: 'PAYMENT_RECORDED',
      resource: 'FundTransferRequest',
      resourceId: id,
      details: {
        customer: transfer.customer.fullName,
        actualAmountPaid: paidNum,
        method: paymentMethod,
        bankRef: bankTransactionReference,
        receiptFileName: receiptFileName || 'receipt.png',
      },
      status: 'SUCCESS',
    });

    return NextResponse.json({ transfer: updated });
  } catch (err: any) {
    console.error('Error recording payment:', err);
    return NextResponse.json({ error: err.message || 'Failed to submit payment' }, { status: 500 });
  }
}
