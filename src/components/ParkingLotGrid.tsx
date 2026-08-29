import { cn } from "@/lib/utils";
import { Car, Bike, Truck, CircleCheck, CircleDot } from "lucide-react";
import type { ReactNode } from "react";

export type SlotData = {
  _id: string;
  slotNumber: string;
  vehicleType: string;
  status: string;
};

const vehicleIcon: Record<string, ReactNode> = {
  car: <Car className="w-3 h-3" />,
  bike: <Bike className="w-3 h-3" />,
  truck: <Truck className="w-3 h-3" />,
};

/**
 * Visual parking lot grid — each slot is a small tile colored by status.
 * Compact mode for dashboards, full mode for the Slots page.
 */
export function ParkingLotGrid({
  slots,
  compact = false,
  onSlotClick,
}: {
  slots: SlotData[];
  compact?: boolean;
  onSlotClick?: (slot: SlotData) => void;
}) {
  // Group slots by zone prefix (A, B, C…)
  const zones: Record<string, SlotData[]> = {};
  for (const s of slots) {
    const zone = s.slotNumber.split("-")[0] || "Z";
    if (!zones[zone]) zones[zone] = [];
    zones[zone].push(s);
  }

  if (slots.length === 0) {
    return (
      <div className="text-xs text-muted-foreground font-mono py-6 text-center border border-dashed border-border rounded">
        No slots found. Seed default slots or add new ones.
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      {Object.entries(zones).map(([zone, zoneSlots]) => (
        <div key={zone}>
          {!compact && (
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                Zone {zone}
              </span>
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] font-mono text-muted-foreground">
                {zoneSlots.filter((s) => s.status === "available").length}/
                {zoneSlots.length} free
              </span>
            </div>
          )}
          <div
            className={cn(
              "grid gap-1.5",
              compact
                ? "grid-cols-8 sm:grid-cols-10"
                : "grid-cols-5 sm:grid-cols-8 md:grid-cols-10",
            )}
          >
            {zoneSlots.map((slot) => (
              <button
                key={slot._id}
                type="button"
                onClick={() => onSlotClick?.(slot)}
                disabled={!onSlotClick}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded border text-center transition-all",
                  compact ? "py-1.5 px-0.5" : "py-2 px-1",
                  slot.status === "available"
                    ? "border-[var(--term-green)]/40 bg-[var(--term-green-bg)] hover:border-[var(--term-green)] hover:shadow-sm"
                    : "border-[var(--term-amber)]/40 bg-[var(--term-amber-bg)] hover:border-[var(--term-amber)] hover:shadow-sm",
                  onSlotClick && "cursor-pointer",
                  !onSlotClick && "cursor-default",
                )}
              >
                <span
                  className={cn(
                    "font-mono font-bold leading-none",
                    compact ? "text-[10px]" : "text-xs",
                  )}
                >
                  {slot.slotNumber}
                </span>
                <span
                  className={cn(
                    "mt-0.5",
                    slot.status === "available"
                      ? "text-[var(--term-green)]"
                      : "text-[var(--term-amber)]",
                  )}
                >
                  {vehicleIcon[slot.vehicleType] || (
                    <Car className="w-3 h-3" />
                  )}
                </span>
                {!compact && (
                  <span
                    className={cn(
                      "text-[8px] font-mono uppercase tracking-wider mt-0.5",
                      slot.status === "available"
                        ? "text-[var(--term-green)]/70"
                        : "text-[var(--term-amber)]/70",
                    )}
                  >
                    {slot.status === "available" ? "open" : "busy"}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Compact occupancy bar with zone breakdown.
 */
export function OccupancyBar({
  available,
  occupied,
  total,
  className,
}: {
  available: number;
  occupied: number;
  total: number;
  className?: string;
}) {
  const pct = total > 0 ? (occupied / total) * 100 : 0;
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
        <span>
          {occupied} occupied / {total} total
        </span>
        <span>{total - occupied} available</span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden flex">
        <div
          className="h-full bg-[var(--term-amber)] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
        <div
          className="h-full bg-[var(--term-green)] transition-all duration-500"
          style={{ width: `${100 - pct}%` }}
        />
      </div>
      <div className="flex items-center gap-3 text-[10px] font-mono">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[var(--term-green)]" />
          Available
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[var(--term-amber)]" />
          Occupied
        </span>
      </div>
    </div>
  );
}
