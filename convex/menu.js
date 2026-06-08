import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const verifyPin = mutation({
  args: { pin: v.string() },
  handler: async (ctx, args) => {
    // Uses the ADMIN_PIN from Convex environment variables, defaults to "12345" if not set
    const correctPin = process.env.ADMIN_PIN || "12345";
    return args.pin === correctPin;
  },
});

export const getCategories = query({
  args: { tab: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const categories = args.tab
      ? await ctx.db
          .query("menuCategories")
          .filter((q) => q.eq(q.field("tab"), args.tab))
          .collect()
      : await ctx.db.query("menuCategories").collect();

    return await Promise.all(
      categories.map(async (category) => {
        const items = await ctx.db
          .query("menuItems")
          .filter((q) => q.eq(q.field("categoryId"), category.id))
          .collect();
        return { ...category, itemCount: items.length };
      })
    );
  },
});

export const getAllCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("menuCategories").collect();
  },
});

export const getItemsForCategory = query({
  args: { categoryId: v.string() },
  handler: async (ctx, args) => {
    // Get all items that belong to a specific category
    return await ctx.db
      .query("menuItems")
      .filter((q) => q.eq(q.field("categoryId"), args.categoryId))
      .collect();
  },
});

export const getAllItems = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("menuItems").collect();
  },
});

export const addMenuItem = mutation({
  args: {
    categoryId: v.string(),
    title: v.string(),
    description: v.string(),
    price: v.string(),
    imgSrc: v.string(),
    imgAlt: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("menuItems", {
      categoryId: args.categoryId,
      title: args.title,
      description: args.description,
      price: args.price,
      imgSrc: args.imgSrc,
      imgAlt: args.imgAlt,
    });
  },
});

export const updateMenuItem = mutation({
  args: {
    id: v.id("menuItems"),
    categoryId: v.string(),
    title: v.string(),
    description: v.string(),
    price: v.string(),
    imgSrc: v.string(),
    imgAlt: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      categoryId: args.categoryId,
      title: args.title,
      description: args.description,
      price: args.price,
      imgSrc: args.imgSrc,
      imgAlt: args.imgAlt,
    });
  },
});

export const deleteMenuItem = mutation({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const addCategory = mutation({
  args: {
    tab: v.string(),
    id: v.string(),
    title: v.string(),
    image: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("menuCategories", {
      tab: args.tab,
      id: args.id,
      title: args.title,
      image: args.image,
    });
  },
});

export const updateCategory = mutation({
  args: {
    _id: v.id("menuCategories"),
    tab: v.string(),
    id: v.string(),
    title: v.string(),
    image: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args._id, {
      tab: args.tab,
      id: args.id,
      title: args.title,
      image: args.image,
    });
  },
});

export const deleteCategory = mutation({
  args: { id: v.id("menuCategories") },
  handler: async (ctx, args) => {
    // Optional: Could also delete all associated items here, or leave them orphaned
    return await ctx.db.delete(args.id);
  },
});

export const migrateAppetizersToStarters = mutation({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("menuCategories")
      .filter((q) => q.eq(q.field("tab"), "Appetizers"))
      .collect();

    for (const cat of categories) {
      await ctx.db.patch(cat._id, { tab: "Starters" });
    }

    return `Migrated ${categories.length} categories from "Appetizers" to "Starters"`;
  },
});

export const seedMenuData = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("menuCategories").first();
    if (existing) {
      return "Data already exists!";
    }

    // Insert Starters
    await ctx.db.insert("menuCategories", {
      tab: "Starters",
      id: "starters",
      title: "Starters",
      image: "/food/Rose Tteokbokki.jpg"
    });
    
    await ctx.db.insert("menuItems", {
      categoryId: "starters",
      title: "ROSE TTEOKBOKKI",
      description: "Chewy rice cakes in a sweet and creamy gochujang sauce.",
      price: "450 ETB",
      imgSrc: "/food/Rose Tteokbokki.jpg",
      imgAlt: "Rose Tteokbokki"
    });

    await ctx.db.insert("menuCategories", {
      tab: "Starters",
      id: "dumplings",
      title: "Dumplings",
      image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?q=80&w=400&auto=format&fit=crop"
    });

    await ctx.db.insert("menuItems", {
      categoryId: "dumplings",
      title: "MANDU",
      description: "Pan-fried Korean dumplings filled with pork and vegetables.",
      price: "350 ETB",
      imgSrc: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?q=80&w=400&auto=format&fit=crop",
      imgAlt: "Mandu"
    });

    // Insert Main
    await ctx.db.insert("menuCategories", {
      tab: "Main",
      id: "burgers",
      title: "Sandwiches & Burgers",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&auto=format&fit=crop"
    });

    await ctx.db.insert("menuItems", {
      categoryId: "burgers",
      title: "CLASSIC BEEF BURGER",
      description: "Juicy beef patty, cheddar, lettuce, tomato on a brioche bun.",
      price: "500 ETB",
      imgSrc: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&auto=format&fit=crop",
      imgAlt: "Classic Burger"
    });

    await ctx.db.insert("menuItems", {
      categoryId: "burgers",
      title: "CLUB SANDWICH",
      description: "Triple-decker with roasted chicken, bacon, egg, lettuce, and mayo.",
      price: "450 ETB",
      imgSrc: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=400&auto=format&fit=crop",
      imgAlt: "Club Sandwich"
    });

    await ctx.db.insert("menuCategories", {
      tab: "Main",
      id: "pasta",
      title: "Pasta",
      image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=400&auto=format&fit=crop"
    });

    await ctx.db.insert("menuItems", {
      categoryId: "pasta",
      title: "SPAGHETTI CARBONARA",
      description: "Classic Italian pasta with egg, parmesan, and crispy bacon.",
      price: "600 ETB",
      imgSrc: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=400&auto=format&fit=crop",
      imgAlt: "Carbonara"
    });

    await ctx.db.insert("menuCategories", {
      tab: "Main",
      id: "pizza",
      title: "Pizza",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400&auto=format&fit=crop"
    });

    await ctx.db.insert("menuItems", {
      categoryId: "pizza",
      title: "MARGHERITA PIZZA",
      description: "Fresh tomato sauce, mozzarella, and fragrant basil leaves.",
      price: "650 ETB",
      imgSrc: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400&auto=format&fit=crop",
      imgAlt: "Margherita"
    });

    // Insert Drinks
    await ctx.db.insert("menuCategories", {
      tab: "Drinks",
      id: "alcohol",
      title: "Alcoholic Beverages",
      image: "/food/Jinro Strawberry Soju.jpg"
    });

    await ctx.db.insert("menuItems", {
      categoryId: "alcohol",
      title: "SOJU",
      description: "Classic clear, low-alcohol Korean distilled spirit.",
      price: "300 ETB",
      imgSrc: "/food/Jinro Strawberry Soju.jpg",
      imgAlt: "Soju"
    });

    return "Menu successfully seeded!";
  }
});