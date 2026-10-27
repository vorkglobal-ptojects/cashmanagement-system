import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { branchId: v.optional(v.id("branches")) },
  handler: async (ctx, args) => {
    if (args.branchId) {
      return await ctx.db
        .query("cashAccounts")
        .withIndex("by_branch", (q) => q.eq("branchId", args.branchId))
        .collect();
    }
    return await ctx.db.query("cashAccounts").collect();
  },
});

export const getByAccountNumber = query({
  args: { accountNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cashAccounts")
      .withIndex("by_accountNumber", (q) => q.eq("accountNumber", args.accountNumber))
      .first();
  },
});

export const updateBalance = mutation({
  args: {
    accountId: v.id("cashAccounts"),
    delta: v.number(),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    if (!account) {
      throw new Error("Account not found");
    }
    const newBalance = account.balance + args.delta;
    if (newBalance < 0) {
      throw new Error(`Insufficient funds in account ${account.accountNumber}. Current: ${account.balance}, Requested deduction: ${Math.abs(args.delta)}`);
    }
    await ctx.db.patch(args.accountId, {
      balance: newBalance,
      updatedAt: Date.now(),
    });
    return newBalance;
  },
});
