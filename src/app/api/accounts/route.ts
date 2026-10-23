import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth.response) return auth.response;
  const session = auth.session!;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const branchId = searchParams.get('branchId');

  const whereClause: any = {};
  if (type) whereClause.type = type;
  if (branchId) whereClause.branchId = branchId;

  // Branch managers and tellers can see their branch accounts + global transit/bank accounts for transfers
  if (session.role === 'CASHIER' || session.role === 'RECEIVING_OFFICER') {
    whereClause.OR = [{ branchId: session.branchId }, { branchId: null }];
  }

  const accounts = await prisma.cashAccount.findMany({
    where: whereClause,
    include: {
      branch: true,
    },
    orderBy: [{ type: 'asc' }, { accountNumber: 'asc' }],
  });

  return NextResponse.json({ accounts });
}
