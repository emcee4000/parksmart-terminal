import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

// Vehicle types for parking
export const VEHICLE_TYPES = {
  CAR: "car",
  BIKE: "bike",
  TRUCK: "truck",
} as const;

export const vehicleTypeValidator = v.union(
  v.literal(VEHICLE_TYPES.CAR),
  v.literal(VEHICLE_TYPES.BIKE),
  v.literal(VEHICLE_TYPES.TRUCK),
);
export type VehicleType = Infer<typeof vehicleTypeValidator>;

// Slot statuses
export const SLOT_STATUSES = {
  AVAILABLE: "available",
  OCCUPIED: "occupied",
} as const;

// Transaction statuses
export const TX_STATUSES = {
  ACTIVE: "active",
  COMPLETED: "completed",
} as const;

// Fee rates per hour by vehicle type (in cents to avoid floating point)
export const FEE_RATES: Record<VehicleType, number> = {
  car: 500, // $5.00/hr
  bike: 200, // $2.00/hr
  truck: 800, // $8.00/hr
};

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
    }).index("email", ["email"]),

    // Parking slots
    parkingSlots: defineTable({
      slotNumber: v.string(), // e.g. "A-01", "B-03"
      vehicleType: vehicleTypeValidator, // what vehicle type this slot fits
      status: v.string(), // "available" | "occupied"
    })
      .index("by_status", ["status"])
      .index("by_slotNumber", ["slotNumber"])
      .index("by_vehicleType_status", ["vehicleType", "status"]),

    // Parking transactions (vehicle entry/exit records)
    transactions: defineTable({
      vehicleNumber: v.string(), // license plate
      vehicleType: vehicleTypeValidator,
      ownerName: v.string(),
      ownerPhone: v.optional(v.string()),
      entryTime: v.number(), // unix timestamp ms
      exitTime: v.optional(v.number()),
      slotId: v.id("parkingSlots"),
      fee: v.optional(v.number()), // fee in cents
      duration: v.optional(v.number()), // duration in minutes
      status: v.string(), // "active" | "completed"
      paymentStatus: v.string(), // "pending" | "paid"
    })
      .index("by_status", ["status"])
      .index("by_vehicleNumber", ["vehicleNumber"])
      .index("by_slotId", ["slotId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
