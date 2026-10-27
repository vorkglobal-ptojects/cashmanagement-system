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

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth.response) return auth.response;

  if (auth.session!.role !== 'MAIN_ADMIN' && auth.session!.role !== 'SYSTEM_ADMIN') {
    return NextResponse.json({ error: 'Only Main Administrator (Mr. Sanjay) can configure branches.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, name, code, city, address, phone, cashLimit } = body;

    if (!id || !name || !code || !city) {
      return NextResponse.json({ error: 'Branch ID, Name, Code, and City are required.' }, { status: 400 });
    }

    const existing = await prisma.branch.findFirst({
      where: { OR: [{ id }, { code }] },
    });
    if (existing) {
      return NextResponse.json({ error: 'Branch with this ID or Code already exists.' }, { status: 409 });
    }

    const branch = await prisma.branch.create({
      data: {
        id: id.trim().toUpperCase(),
        name: name.trim(),
        code: code.trim().toUpperCase(),
        city: city.trim(),
        address: address ? address.trim() : null,
        phone: phone ? phone.trim() : null,
        cashLimit: cashLimit ? parseFloat(cashLimit) : 10000000.0,
        isActive: true,
      },
    });

    return NextResponse.json({ branch }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create branch' }, { status: 500 });
  }
}
