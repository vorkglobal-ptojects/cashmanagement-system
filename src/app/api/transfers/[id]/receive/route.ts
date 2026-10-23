import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth';
import { receiveAndAcceptCashTransfer } from '@/lib/transfers';
import { logAuditEvent } from '@/lib/audit';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request);
  if (auth.response) return auth.response;
  const session = auth.session!;

  const roleCheck = requireRole(session, ['RECEIVING_OFFICER', 'BRANCH_MANAGER', 'SYSTEM_ADMIN']);
  if (!roleCheck.allowed) return roleCheck.response!;

  const { id } = await params;

  try {
    const body = await request.json();
    const { tally, notes } = body;

    if (!tally) {
      return NextResponse.json({ error: 'Physical denomination count tally is required' }, { status: 400 });
    }

    const updated = await receiveAndAcceptCashTransfer(session, id, {
      tally,
      notes,
    });

    const isDiscrepancy = updated.status === 'DISCREPANCY_FLAGGED';

    await logAuditEvent({
      session,
      action: isDiscrepancy ? 'CASH_RECEIPT_DISCREPANCY' : 'CASH_RECEIVED_AND_ACCEPTED',
      resource: 'CashTransfer',
      resourceId: updated.id,
      details: {
        transferNumber: updated.transferNumber,
        receivedAmount: updated.receivedAmount,
        varianceAmount: updated.varianceAmount,
        status: updated.status,
      },
      status: isDiscrepancy ? 'FAILURE' : 'SUCCESS',
    });

    return NextResponse.json({
      success: true,
      transfer: updated,
      discrepancy: isDiscrepancy,
    });
  } catch (error: any) {
    console.error('Receive transfer error:', error);
    return NextResponse.json({ error: error.message || 'Failed to receive cash' }, { status: 400 });
  }
}
