import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth.response) return auth.response;
  const session = auth.session!;

  // Financial audit review is permitted for AUDITOR, SYSTEM_ADMIN, FINANCE_ADMIN, and BRANCH_MANAGER (scoped)
  const roleCheck = requireRole(session, ['AUDITOR', 'SYSTEM_ADMIN', 'FINANCE_ADMIN', 'BRANCH_MANAGER']);
  if (!roleCheck.allowed) return roleCheck.response!;

  const whereClause: any = {};
  if (session.role === 'BRANCH_MANAGER') {
    whereClause.branchId = session.branchId;
  }

  const logs = await prisma.auditEvent.findMany({
    where: whereClause,
    orderBy: { timestamp: 'desc' },
    take: 100,
  });

  return NextResponse.json({ logs });
}
