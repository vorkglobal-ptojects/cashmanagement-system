import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { calculateTallyTotal } from '@/lib/tallies';
import { logAuditEvent } from '@/lib/audit';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth.response) return auth.response;
  const session = auth.session!;

  const whereClause: any = {};
  if (session.role === 'CASHIER') {
    whereClause.cashierUserId = session.userId;
  } else if (session.branchId) {
    whereClause.branchId = session.branchId;
  }

  const sessions = await prisma.tillSession.findMany({
    where: whereClause,
    include: {
      tillAccount: true,
      branch: true,
      cashier: {
        select: { id: true, firstName: true, lastName: true, username: true },
      },
      denominationTallies: true,
    },
    orderBy: { openedAt: 'desc' },
  });

  return NextResponse.json({ sessions });
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth.response) return auth.response;
  const session = auth.session!;

  try {
    const body = await request.json();
    const { tillAccountId, tally, notes } = body;

    if (!tillAccountId || !tally) {
      return NextResponse.json({ error: 'Till account and opening denomination tally are required' }, { status: 400 });
    }

    const tillAccount = await prisma.cashAccount.findUnique({
      where: { id: tillAccountId },
    });

    if (!tillAccount || tillAccount.type !== 'TILL') {
      return NextResponse.json({ error: 'Selected account is not a valid cash counter till' }, { status: 400 });
    }

    // Check if cashier already has an OPEN till session
    const activeSession = await prisma.tillSession.findFirst({
      where: {
        cashierUserId: session.userId,
        status: 'OPEN',
      },
    });

    if (activeSession) {
      return NextResponse.json(
        { error: `You already have an active open till session (${activeSession.sessionCode}). Close it before opening a new one.` },
        { status: 400 }
      );
    }

    const openingAmount = calculateTallyTotal(tally);
    const count = await prisma.tillSession.count();
    const sessionCode = `TIL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${session.branchId || 'HQ'}-${String(count + 1).padStart(3, '0')}`;

    const newSession = await prisma.$transaction(async (tx) => {
      const created = await tx.tillSession.create({
        data: {
          sessionCode,
          tillAccountId,
          cashierUserId: session.userId,
          cashierUsername: `${session.firstName} ${session.lastName}`.trim() || session.username,
          branchId: tillAccount.branchId || session.branchId || 'HQ',
          openingBalance: openingAmount,
          expectedClosingBalance: openingAmount,
          status: 'OPEN',
          reconciliationNotes: notes,
        },
      });

      await tx.denominationTally.create({
        data: {
          stage: 'TILL_OPEN',
          tillSessionId: created.id,
          note5000: tally.note5000,
          note1000: tally.note1000,
          note500: tally.note500,
          note100: tally.note100,
          note50: tally.note50,
          note20: tally.note20,
          coins: tally.coins,
          totalCalculated: openingAmount,
          countedByUserId: session.userId,
          countedByName: `${session.firstName} ${session.lastName}`.trim() || session.username,
          notes,
        },
      });

      return created;
    });

    await logAuditEvent({
      session,
      action: 'TILL_SESSION_OPENED',
      resource: 'TillSession',
      resourceId: newSession.id,
      details: {
        sessionCode: newSession.sessionCode,
        openingBalance: openingAmount,
      },
      status: 'SUCCESS',
    });

    return NextResponse.json({ success: true, session: newSession }, { status: 201 });
  } catch (error: any) {
    console.error('Till session open error:', error);
    return NextResponse.json({ error: error.message || 'Failed to open till session' }, { status: 400 });
  }
}
