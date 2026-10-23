import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth.response) return auth.response;

  const branches = await prisma.branch.findMany({
    include: {
      cashAccounts: true,
      _count: {
        select: {
          users: true,
          tillSessions: true,
        },
      },
    },
    orderBy: { id: 'asc' },
  });

  // Calculate current branch cash holdings
  const branchesWithTotals = branches.map((b) => {
    const totalCash = b.cashAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const utilizationPercent = b.cashLimit > 0 ? Math.min(100, Math.round((totalCash / b.cashLimit) * 100)) : 0;
    return {
      ...b,
      totalCash,
      utilizationPercent,
    };
  });

  return NextResponse.json({ branches: branchesWithTotals });
}
