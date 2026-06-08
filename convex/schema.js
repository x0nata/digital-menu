import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  menuCategories: defineTable({
    tab: v.string(),
    id: v.string(),
    title: v.string(),
    image: v.string(),
  }),
  menuItems: defineTable({
    categoryId: v.string(),
    title: v.string(),
    description: v.string(),
    price: v.string(),
    imgSrc: v.string(),
    imgAlt: v.string(),
  }),
  settings: defineTable({
    tabs: v.array(v.string()),
    taxRate: v.number(),
    theme: v.object({
      brandRed: v.string(),
      creamy: v.string(),
    }),
  }),
  scannedOrders: defineTable({
    orderData: v.object({
      items: v.array(v.object({
        quantity: v.number(),
        name: v.string(),
      })),
      subtotal: v.string(),
      tax: v.string(),
      total: v.string(),
    }),
    discarded: v.boolean(),
  }),
});