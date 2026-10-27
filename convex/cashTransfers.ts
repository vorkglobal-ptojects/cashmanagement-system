import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    status: v.optional(v.string()),
    fromBranchId: v.optional(v.id("branches")),
    toBranchId: v.optional(v.id("branches")),
  },
  handler: async (ctx, args) => {
    let transfers = await ctx.db.query("cashTransfers").order("desc").collect();
    if (args.status) {
      transfers = transfers.filter((t) => t.status === args.status);
    }
    if (args.fromBranchId) {
      transfers = transfers.filter((t) => t.fromBranchId === args.fromBranchId);
    }
    if (args.toBranchId) {
      transfers = transfers.filter((t) => t.toBranchId === args.toBranchId);
    }
    return transfers;
  },
});

export const getByTransferNumber = query({
  args: { transferNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cashTransfers")
      .withIndex("by_transferNumber", (q) => q.eq("transferNumber", args.transferNumber))
      .first();
  },
});

export const requestTransfer = mutation({
  args: {
    transferNumber: v.string(),
    transferType: v.string(),
    sourceAccountId: v.id("cashAccounts"),
    destinationAccountId: v.id("cashAccounts"),
    fromBranchId: v.optional(v.id("branches")),
    toBranchId: v.optional(v.id("branches")),
    requestedAmount: v.number(),
    currency: v.string(),
    urgency: v.string(),
    purpose: v.string(),
    requestedByUserId: v.string(),
    requestedByUsername: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("cashTransfers", {
      ...args,
      status: "REQUESTED",
      varianceAmount: 0.0,
      requestedAt: now,
      updatedAt: now,
    });

    // Record audit event
    await ctx.db.insert("auditEvents", {
      timestamp: now,
      userId: args.requestedByUserId,
      username: args.requestedByUsername,
      action: "REQUEST_SUBMITTED",
      resource: "CashTransfer",
      resourceId: args.transferNumber,
      details: JSON.stringify({ amount: args.requestedAmount, purpose: args.purpose }),
      status: "SUCCESS",
    });

    return id;
  },
});
