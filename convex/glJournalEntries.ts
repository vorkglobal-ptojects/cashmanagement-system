import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    branchId: v.optional(v.id("branches")),
    referenceType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let entries = await ctx.db.query("glJournalEntries").order("desc").collect();
    if (args.branchId) {
      entries = entries.filter((e) => e.branchId === args.branchId);
    }
    if (args.referenceType) {
      entries = entries.filter((e) => e.referenceType === args.referenceType);
    }
    return entries;
  },
});

export const create = mutation({
  args: {
    entryNumber: v.string(),
    branchId: v.optional(v.id("branches")),
    referenceType: v.string(),
    referenceId: v.string(),
    description: v.string(),
    totalDebit: v.number(),
    totalCredit: v.number(),
    lines: v.array(
      v.object({
        accountId: v.string(),
        accountName: v.string(),
        debit: v.number(),
        credit: v.number(),
        memo: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Balancing validation (double entry rule)
    if (Math.abs(args.totalDebit - args.totalCredit) > 0.01) {
      throw new Error(`Double-entry out of balance: Debit=${args.totalDebit}, Credit=${args.totalCredit}`);
    }

    const now = Date.now();
    return await ctx.db.insert("glJournalEntries", {
      ...args,
      postingDate: now,
      createdAt: now,
    });
  },
});
