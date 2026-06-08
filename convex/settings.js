import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const SETTINGS_ID = "singleton";

export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("settings").first();
    return settings ?? null;
  },
});

export const updateSettings = mutation({
  args: {
    tabs: v.array(v.string()),
    taxRate: v.number(),
    theme: v.object({
      brandRed: v.string(),
      creamy: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("settings").first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("settings", args);
  },
});

export const seedSettings = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("settings").first();
    if (existing) return "Settings already exist";
    return await ctx.db.insert("settings", {
      tabs: ["Starters", "Main", "Drinks"],
      taxRate: 15,
      theme: {
        brandRed: "#E60000",
        creamy: "#F5EBE0",
      },
    });
  },
});
