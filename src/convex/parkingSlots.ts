import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * List all parking slots, optionally filtered by vehicle type and status.
 */
export const list = query({
  args: {
    vehicleType: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.vehicleType) {
      const vt = args.vehicleType as "car" | "bike" | "truck";
      if (args.status) {
        return await ctx.db
          .query("parkingSlots")
          .withIndex("by_vehicleType_status", (q) =>
            q.eq("vehicleType", vt).eq("status", args.status!),
          )
          .collect();
      }
      return await ctx.db
        .query("parkingSlots")
        .withIndex("by_vehicleType_status", (q) =>
          q.eq("vehicleType", vt),
        )
        .collect();
    }
    if (args.status) {
      return await ctx.db
        .query("parkingSlots")
        .withIndex("by_status", (q) =>
          q.eq("status", args.status!),
        )
        .collect();
    }
    return await ctx.db.query("parkingSlots").collect();
  },
});

/**
 * Get counts by status for the dashboard.
 */
export const counts = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("parkingSlots").collect();
    const total = all.length;
    const available = all.filter((s) => s.status === "available").length;
    const occupied = all.filter((s) => s.status === "occupied").length;
    return { total, available, occupied };
  },
});

/**
 * Add a new parking slot. Requires auth.
 */
export const add = mutation({
  args: {
    slotNumber: v.string(),
    vehicleType: v.union(
      v.literal("car"),
      v.literal("bike"),
      v.literal("truck"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check for duplicate slot number
    const existing = await ctx.db
      .query("parkingSlots")
      .withIndex("by_slotNumber", (q) => q.eq("slotNumber", args.slotNumber))
      .first();
    if (existing) throw new Error("Slot number already exists");

    return await ctx.db.insert("parkingSlots", {
      slotNumber: args.slotNumber,
      vehicleType: args.vehicleType,
      status: "available",
    });
  },
});

/**
 * Update a parking slot's number or vehicle type. Requires auth.
 */
export const update = mutation({
  args: {
    id: v.id("parkingSlots"),
    slotNumber: v.optional(v.string()),
    vehicleType: v.optional(
      v.union(v.literal("car"), v.literal("bike"), v.literal("truck")),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const slot = await ctx.db.get(args.id);
    if (!slot) throw new Error("Slot not found");

    await ctx.db.patch(args.id, {
      ...(args.slotNumber !== undefined && { slotNumber: args.slotNumber }),
      ...(args.vehicleType !== undefined && { vehicleType: args.vehicleType }),
    });
  },
});

/**
 * Delete a parking slot. Cannot delete if occupied. Requires auth.
 */
export const remove = mutation({
  args: { id: v.id("parkingSlots") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const slot = await ctx.db.get(args.id);
    if (!slot) throw new Error("Slot not found");
    if (slot.status === "occupied")
      throw new Error("Cannot delete an occupied slot");

    await ctx.db.delete(args.id);
  },
});

/**
 * Seed default parking slots. Only creates if the table is empty.
 */
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db.query("parkingSlots").first();
    if (existing) return "already_seeded";

    const slots: { slotNumber: string; vehicleType: "car" | "bike" | "truck" }[] = [];

    // A-zone: cars
    for (let i = 1; i <= 20; i++) {
      slots.push({ slotNumber: `A-${String(i).padStart(2, "0")}`, vehicleType: "car" });
    }
    // B-zone: bikes
    for (let i = 1; i <= 15; i++) {
      slots.push({ slotNumber: `B-${String(i).padStart(2, "0")}`, vehicleType: "bike" });
    }
    // C-zone: trucks
    for (let i = 1; i <= 10; i++) {
      slots.push({ slotNumber: `C-${String(i).padStart(2, "0")}`, vehicleType: "truck" });
    }

    for (const s of slots) {
      await ctx.db.insert("parkingSlots", {
        slotNumber: s.slotNumber,
        vehicleType: s.vehicleType,
        status: "available",
      });
    }

    return "seeded";
  },
});
