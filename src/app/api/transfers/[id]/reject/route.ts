import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth';
import { rejectCashRequest } from '@/lib/transfers';
import { logAuditEvent } from '@/lib/audit';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request);
  if (auth.response) return auth.response;
  const session = auth.session!;

  const roleCheck = requireRole(session, ['FINANCE_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER']);
  if (!roleCheck.allowed) return roleCheck.response!;

  const { id } = await params;

  try {
    const body = await request.json();
    const reason = body.reason?.trim();

    if (!reason) {
      return NextResponse.json({ error: 'Rejection reason is mandatory for audit compliance' }, { status: 400 });
    }

    const updated = await rejectCashRequest(session, id, reason);

    await logAuditEvent({
      session,
      action: 'CASH_REQUEST_REJECTED',
      resource: 'CashTransfer',
      resourceId: updated.id,
      details: {
        transferNumber: updated.transferNumber,
        reason,
      },
      status: 'SUCCESS',
    });

    return NextResponse.json({ success: true, transfer: updated });
  } catch (error: any) {
    console.error('Reject transfer error:', error);
    return NextResponse.json({ error: error.message || 'Failed to reject cash request' }, { status: 400 });
  }
}
