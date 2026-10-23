import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { calculateTallyTotal } from '@/lib/tallies';
import { postGlJournalEntry } from '@/lib/gl';
import { logAuditEvent } from '@/lib/audit';

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth.response) return auth.response;
  const session = auth.session!;

  try {
    const body = await request.json();
    const { sessionId, tally, notes } = body;

    if (!sessionId || !tally) {
      return NextResponse.json({ error: 'Session ID and physical closing tally are required' }, { status: 400 });
    }

    const tillSession = await prisma.tillSession.findUnique({
      where: { id: sessionId },
      include: { tillAccount: true },
    });

    if (!tillSession) {
      return NextResponse.json({ error: 'Till session not found' }, { status: 404 });
    }

    if (tillSession.status !== 'OPEN') {
      return NextResponse.json({ error: `Cannot reconcile a session that is '${tillSession.status}'` }, { status: 400 });
    }

    const actualClosing = calculateTallyTotal(tally);
    const expectedClosing = tillSession.expectedClosingBalance;
    const variance = Math.round((actualClosing - expectedClosing) * 100) / 100;

    let finalStatus = 'BALANCED';
    if (variance < -0.01) finalStatus = 'SHORT';
    if (variance > 0.01) finalStatus = 'OVER';

    const updatedSession = await prisma.$transaction(async (tx) => {
      // 1. Record Closing Denomination Tally
      await tx.denominationTally.create({
        data: {
          stage: 'TILL_CLOSE',
          tillSessionId: tillSession.id,
          note5000: tally.note5000,
          note1000: tally.note1000,
          note500: tally.note500,
          note100: tally.note100,
          note50: tally.note50,
          note20: tally.note20,
          coins: tally.coins,
          totalCalculated: actualClosing,
          countedByUserId: session.userId,
          countedByName: `${session.firstName} ${session.lastName}`.trim() || session.username,
          notes,
        },
      });

      // 2. Adjust Till Cash Account Balance to match actual physical count
      await tx.cashAccount.update({
        where: { id: tillSession.tillAccountId },
        data: {
          balance: actualClosing,
        },
      });

      // 3. Post General Ledger Entry if there is any variance
      if (Math.abs(variance) >= 0.01) {
        if (variance < 0) {
          // Cash Shortage: Debit Expense, Credit Till
          await postGlJournalEntry(tx, {
            branchId: tillSession.branchId,
            referenceType: 'TILL_VARIANCE_SHORTAGE',
            referenceId: tillSession.id,
            description: `Till Reconciliation Shortage ${tillSession.sessionCode} Variance LKR ${variance}`,
            lines: [
              {
                accountId: 'EXPENSE_CASH_SHORTAGE',
                accountName: 'Cash Shortage Expense',
                debit: Math.abs(variance),
                credit: 0,
                memo: `Physical count short by LKR ${Math.abs(variance)}`,
              },
              {
                accountId: tillSession.tillAccountId,
                accountName: tillSession.tillAccount.name,
                debit: 0,
                credit: Math.abs(variance),
                memo: 'Adjusted till account to actual counted physical cash',
              },
            ],
          });
        } else {
          // Cash Overage: Debit Till, Credit Income
          await postGlJournalEntry(tx, {
            branchId: tillSession.branchId,
            referenceType: 'TILL_VARIANCE_OVERAGE',
            referenceId: tillSession.id,
            description: `Till Reconciliation Overage ${tillSession.sessionCode} Variance LKR ${variance}`,
            lines: [
              {
                accountId: tillSession.tillAccountId,
                accountName: tillSession.tillAccount.name,
                debit: variance,
                credit: 0,
                memo: 'Adjusted till account to actual counted physical cash',
              },
              {
                accountId: 'INCOME_CASH_OVERAGE',
                accountName: 'Cash Overage Income (Unearned)',
                debit: 0,
                credit: variance,
                memo: `Physical count surplus by LKR ${variance}`,
              },
            ],
          });
        }
      }

      // 4. Update session status
      return tx.tillSession.update({
        where: { id: tillSession.id },
        data: {
          status: finalStatus,
          actualClosingBalance: actualClosing,
          variance,
          closedAt: new Date(),
          reconciliationNotes: notes,
        },
        include: {
          tillAccount: true,
          denominationTallies: true,
        },
      });
    });

    await logAuditEvent({
      session,
      action: 'TILL_SESSION_CLOSED',
      resource: 'TillSession',
      resourceId: updatedSession.id,
      details: {
        sessionCode: updatedSession.sessionCode,
        expectedClosing,
        actualClosing,
        variance,
        status: finalStatus,
      },
      status: 'SUCCESS',
    });

    return NextResponse.json({
      success: true,
      session: updatedSession,
      status: finalStatus,
      variance,
    });
  } catch (error: any) {
    console.error('Till session reconcile error:', error);
    return NextResponse.json({ error: error.message || 'Failed to reconcile till session' }, { status: 400 });
  }
}
