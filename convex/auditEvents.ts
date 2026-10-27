import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    resource: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let events = await ctx.db.query("auditEvents").order("desc").collect();
    if (args.resource) {
      events = events.filter((e) => e.resource === args.resource);
    }
    return events.slice(0, args.limit ?? 100);
  },
});

export const log = mutation({
  args: {
    userId: v.optional(v.string()),
    username: v.optional(v.string()),
    role: v.optional(v.string()),
    branchId: v.optional(v.string()),
    action: v.string(),
    resource: v.string(),
    resourceId: v.optional(v.string()),
    details: v.string(),
    ipAddress: v.optional(v.string()),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("auditEvents", {
      ...args,
      timestamp: Date.now(),
    });
  },
});
