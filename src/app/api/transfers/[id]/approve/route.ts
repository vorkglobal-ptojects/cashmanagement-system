import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth';
import { approveCashRequest } from '@/lib/transfers';
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
    let approvedAmount: number | undefined;
    try {
      const body = await request.json();
      if (body.approvedAmount) {
        approvedAmount = Number(body.approvedAmount);
      }
    } catch {
      // Body is optional
    }

    const updated = await approveCashRequest(session, id, approvedAmount);

    await logAuditEvent({
      session,
      action: 'CASH_REQUEST_APPROVED',
      resource: 'CashTransfer',
      resourceId: updated.id,
      details: {
        transferNumber: updated.transferNumber,
        approvedAmount: updated.approvedAmount,
      },
      status: 'SUCCESS',
    });

    return NextResponse.json({ success: true, transfer: updated });
  } catch (error: any) {
    console.error('Approve transfer error:', error);
    return NextResponse.json({ error: error.message || 'Failed to approve cash request' }, { status: 400 });
  }
}
