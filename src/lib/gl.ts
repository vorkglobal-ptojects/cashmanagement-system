import { prisma } from './db';

export interface GlPostingLine {
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
  memo?: string;
}

export interface GlPostingInput {
  branchId?: string | null;
  referenceType: string;
  referenceId: string;
  description: string;
  lines: GlPostingLine[];
}

/**
 * Creates an atomic, balanced General Ledger Journal Entry
 * Rejects any entry where sum(debits) != sum(credits)
 */
export async function postGlJournalEntry(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  input: GlPostingInput
) {
  let totalDebit = 0;
  let totalCredit = 0;

  for (const line of input.lines) {
    totalDebit += Math.max(0, line.debit || 0);
    totalCredit += Math.max(0, line.credit || 0);
  }

  totalDebit = Math.round(totalDebit * 100) / 100;
  totalCredit = Math.round(totalCredit * 100) / 100;

  // Strict double-entry invariant
  if (Math.abs(totalDebit - totalCredit) > 0.001) {
    throw new Error(
      `GL Posting Rejected: Unbalanced journal entry. Total Debit (${totalDebit}) does not equal Total Credit (${totalCredit})`
    );
  }

  if (totalDebit <= 0) {
    throw new Error('GL Posting Rejected: Journal entry amount must be greater than zero');
  }

  // Generate unique entry number
  const entryCount = await tx.glJournalEntry.count();
  const entryNumber = `JV-${new Date().getFullYear()}-${String(entryCount + 1).padStart(5, '0')}`;

  const entry = await tx.glJournalEntry.create({
    data: {
      entryNumber,
      branchId: input.branchId ?? null,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      description: input.description,
      totalDebit,
      totalCredit,
      lines: {
        create: input.lines.map((l) => ({
          accountId: l.accountId,
          accountName: l.accountName,
          debit: Math.round((l.debit || 0) * 100) / 100,
          credit: Math.round((l.credit || 0) * 100) / 100,
          memo: l.memo ?? null,
        })),
      },
    },
    include: {
      lines: true,
    },
  });

  return entry;
}
