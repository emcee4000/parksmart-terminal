import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { FEE_RATES } from "./schema";

/**
 * Seed default parking slots if the table is empty.
 * Called automatically during vehicle entry when no slots exist.
 */
async function seedDefaultSlots(ctx: any) {
  const zones: { prefix: string; type: "car" | "bike" | "truck"; count: number }[] = [
    { prefix: "A", type: "car", count: 20 },
    { prefix: "B", type: "bike", count: 15 },
    { prefix: "C", type: "truck", count: 10 },
  ];
  for (const zone of zones) {
    for (let i = 1; i <= zone.count; i++) {
      await ctx.db.insert("parkingSlots", {
        slotNumber: `${zone.prefix}-${String(i).padStart(2, "0")}`,
        vehicleType: zone.type,
        status: "available",
      });
    }
  }
}

/**
 * Get all transactions, optionally filtered by status.
 * Ordered by entry time descending (newest first).
 */
export const list = query({
  args: {
    status: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let results;

    if (args.status) {
      const st = args.status;
      results = await ctx.db
        .query("transactions")
        .withIndex("by_status", (q) => q.eq("status", st))
        .order("desc")
        .collect();
    } else {
      results = await ctx.db
        .query("transactions")
        .order("desc")
        .collect();
    }

    // Client-side search by vehicle number
    if (args.search && args.search.trim()) {
      const term = args.search.trim().toUpperCase();
      results = results.filter((t) =>
        t.vehicleNumber.toUpperCase().includes(term),
      );
    }

    // Enrich with slot info
    const enriched = await Promise.all(
      results.map(async (t) => {
        const slot = await ctx.db.get(t.slotId);
        return { ...t, slot };
      }),
    );

    return enriched;
  },
});

/**
 * Get a single active transaction by vehicle number.
 */
export const getActiveByVehicle = query({
  args: { vehicleNumber: v.string() },
  handler: async (ctx, args) => {
    const term = args.vehicleNumber.trim().toUpperCase();
    const active = await ctx.db
      .query("transactions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
    const match = active.find(
      (t) => t.vehicleNumber.toUpperCase() === term,
    );
    if (!match) return null;
    const slot = await ctx.db.get(match.slotId);
    return { ...match, slot };
  },
});

/**
 * Get dashboard statistics: total revenue, active count, completed count.
 */
export const dashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const active = await ctx.db
      .query("transactions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
    const completed = await ctx.db
      .query("transactions")
      .withIndex("by_status", (q) => q.eq("status", "completed"))
      .collect();

    const totalRevenue = completed.reduce((sum, t) => sum + (t.fee || 0), 0);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayTs = todayStart.getTime();

    const todayTransactions = completed.filter(
      (t) => (t.exitTime || t.entryTime) >= todayTs,
    );
    const todayRevenue = todayTransactions.reduce(
      (sum, t) => sum + (t.fee || 0),
      0,
    );

    // Recent 5 transactions
    const recent = await ctx.db
      .query("transactions")
      .order("desc")
      .take(5);
    const recentEnriched = await Promise.all(
      recent.map(async (t) => {
        const slot = await ctx.db.get(t.slotId);
        return { ...t, slot };
      }),
    );

    return {
      activeCount: active.length,
      completedCount: completed.length,
      totalRevenue,
      todayRevenue,
      recent: recentEnriched,
    };
  },
});

/**
 * Vehicle entry: create a transaction and auto-assign an available slot.
 * Returns the assigned slot info.
 */
export const vehicleEntry = mutation({
  args: {
    vehicleNumber: v.string(),
    vehicleType: v.union(
      v.literal("car"),
      v.literal("bike"),
      v.literal("truck"),
    ),
    ownerName: v.string(),
    ownerPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const vNum = args.vehicleNumber.trim().toUpperCase();
    if (!vNum) throw new Error("Vehicle number is required");
    if (!args.ownerName.trim()) throw new Error("Owner name is required");

    // Check if vehicle is already parked
    const active = await ctx.db
      .query("transactions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
    const alreadyParked = active.find(
      (t) => t.vehicleNumber.toUpperCase() === vNum,
    );
    if (alreadyParked) {
      throw new Error(
        `Vehicle ${vNum} is already parked in slot ${alreadyParked.slotId}`,
      );
    }

    // Auto-seed parking slots if none exist
    const anySlot = await ctx.db.query("parkingSlots").first();
    if (!anySlot) {
      await seedDefaultSlots(ctx);
    }

    // Find an available slot for this vehicle type
    const availableSlots = await ctx.db
      .query("parkingSlots")
      .withIndex("by_vehicleType_status", (q) =>
        q
          .eq("vehicleType", args.vehicleType)
          .eq("status", "available"),
      )
      .first();

    if (!availableSlots) {
      throw new Error(
        `No available ${args.vehicleType} parking slots`,
      );
    }

    // Mark slot as occupied
    await ctx.db.patch(availableSlots._id, { status: "occupied" });

    // Create transaction
    const txId = await ctx.db.insert("transactions", {
      vehicleNumber: vNum,
      vehicleType: args.vehicleType,
      ownerName: args.ownerName.trim(),
      ownerPhone: args.ownerPhone?.trim(),
      entryTime: Date.now(),
      slotId: availableSlots._id,
      status: "active",
      paymentStatus: "pending",
    });

    return {
      transactionId: txId,
      slotNumber: availableSlots.slotNumber,
    };
  },
});

/**
 * Vehicle exit: mark transaction as completed, calculate fee and duration.
 */
export const vehicleExit = mutation({
  args: { transactionId: v.id("transactions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const tx = await ctx.db.get(args.transactionId);
    if (!tx) throw new Error("Transaction not found");
    if (tx.status !== "active")
      throw new Error("This vehicle has already exited");

    const exitTime = Date.now();
    const durationMs = exitTime - tx.entryTime;
    const durationMinutes = Math.max(
      1,
      Math.ceil(durationMs / (1000 * 60)),
    ); // minimum 1 minute
    const durationHours = Math.ceil(durationMinutes / 60); // round up to full hours

    // Calculate fee
    const ratePerHour = FEE_RATES[tx.vehicleType];
    const fee = ratePerHour * durationHours;

    // Free the slot — verify it still exists first
    const slot = await ctx.db.get(tx.slotId);
    if (slot) {
      await ctx.db.patch(tx.slotId, { status: "available" });
    }

    // Update transaction
    await ctx.db.patch(args.transactionId, {
      exitTime,
      duration: durationMinutes,
      fee,
      status: "completed",
      paymentStatus: "paid",
    });

    return {
      duration: durationMinutes,
      fee,
      feeFormatted: `$${(fee / 100).toFixed(2)}`,
      durationFormatted:
        durationMinutes >= 60
          ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`
          : `${durationMinutes}m`,
    };
  },
});
