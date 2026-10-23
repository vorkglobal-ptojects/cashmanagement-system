import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth.response) return auth.response;
  const session = auth.session!;

  const { searchParams } = new URL(request.url);
  const branchId = searchParams.get('branchId');

  const whereClause: any = {};
  if (session.role === 'BRANCH_MANAGER' || session.role === 'CASHIER') {
    whereClause.branchId = session.branchId;
  } else if (branchId) {
    whereClause.branchId = branchId;
  }

  const entries = await prisma.glJournalEntry.findMany({
    where: whereClause,
    include: {
      lines: true,
      cashTransfer: true,
    },
    orderBy: { postingDate: 'desc' },
  });

  return NextResponse.json({ entries });
}
