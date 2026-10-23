import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth';
import { dispatchCashTransfer } from '@/lib/transfers';
import { logAuditEvent } from '@/lib/audit';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request);
  if (auth.response) return auth.response;
  const session = auth.session!;

  const roleCheck = requireRole(session, ['DISPATCHER', 'FINANCE_ADMIN', 'SYSTEM_ADMIN']);
  if (!roleCheck.allowed) return roleCheck.response!;

  const { id } = await params;

  try {
    const body = await request.json();
    const { tally, securityBagNumber, vehicleNumber, courierName, courierNic, waybillNumber } = body;

    if (!tally || !securityBagNumber) {
      return NextResponse.json(
        { error: 'Denomination tally and security seal bag number are required for dispatch' },
        { status: 400 }
      );
    }

    const updated = await dispatchCashTransfer(session, id, {
      tally,
      securityBagNumber,
      vehicleNumber,
      courierName,
      courierNic,
      waybillNumber,
    });

    await logAuditEvent({
      session,
      action: 'CASH_DISPATCHED',
      resource: 'CashTransfer',
      resourceId: updated.id,
      details: {
        transferNumber: updated.transferNumber,
        dispatchedAmount: updated.dispatchedAmount,
        securityBagNumber,
        waybillNumber,
      },
      status: 'SUCCESS',
    });

    return NextResponse.json({ success: true, transfer: updated });
  } catch (error: any) {
    console.error('Dispatch transfer error:', error);
    return NextResponse.json({ error: error.message || 'Failed to dispatch cash' }, { status: 400 });
  }
}
