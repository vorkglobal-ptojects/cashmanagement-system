import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    branchId: v.optional(v.id("branches")),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let sessions = await ctx.db.query("tillSessions").order("desc").collect();
    if (args.branchId) {
      sessions = sessions.filter((s) => s.branchId === args.branchId);
    }
    if (args.status) {
      sessions = sessions.filter((s) => s.status === args.status);
    }
    return sessions;
  },
});

export const getActiveSessionForCashier = query({
  args: { cashierUserId: v.id("users") },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("tillSessions")
      .withIndex("by_cashier", (q) => q.eq("cashierUserId", args.cashierUserId))
      .filter((q) => q.eq(q.field("status"), "OPEN"))
      .first();
    return sessions;
  },
});

export const openTillSession = mutation({
  args: {
    sessionCode: v.string(),
    tillAccountId: v.id("cashAccounts"),
    cashierUserId: v.id("users"),
    cashierUsername: v.string(),
    branchId: v.id("branches"),
    openingBalance: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("tillSessions")
      .withIndex("by_cashier", (q) => q.eq("cashierUserId", args.cashierUserId))
      .filter((q) => q.eq(q.field("status"), "OPEN"))
      .first();

    if (existing) {
      throw new Error(`Cashier already has an active till session (${existing.sessionCode}).`);
    }

    const now = Date.now();
    const id = await ctx.db.insert("tillSessions", {
      ...args,
      status: "OPEN",
      openedAt: now,
      cashIn: 0.0,
      cashOut: 0.0,
      expectedClosingBalance: args.openingBalance,
      variance: 0.0,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("auditEvents", {
      timestamp: now,
      userId: args.cashierUserId,
      username: args.cashierUsername,
      action: "TILL_OPEN",
      resource: "TillSession",
      resourceId: args.sessionCode,
      details: JSON.stringify({ openingBalance: args.openingBalance }),
      status: "SUCCESS",
    });

    return id;
  },
});
