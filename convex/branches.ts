import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("branches").order("desc").collect();
  },
});

export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("branches")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();
  },
});

export const create = mutation({
  args: {
    code: v.string(),
    name: v.string(),
    city: v.string(),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    cashLimit: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("branches")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();
    if (existing) {
      throw new Error(`Branch with code ${args.code} already exists.`);
    }

    const now = Date.now();
    return await ctx.db.insert("branches", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});
