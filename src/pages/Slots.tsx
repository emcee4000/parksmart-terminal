import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PlusCircle,
  Trash2,
  Loader2,
  Car,
  Bike,
  Truck as TruckIcon,
  CircleCheck,
  CircleDot,
  AlertTriangle,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { ParkingLotGrid, OccupancyBar, type SlotData } from "@/components/ParkingLotGrid";
import { toast } from "sonner";

export default function Slots() {
  const slots = useQuery(api.parkingSlots.list, {});
  const counts = useQuery(api.parkingSlots.counts);
  const addSlot = useMutation(api.parkingSlots.add);
  const removeSlot = useMutation(api.parkingSlots.remove);
  const seedSlots = useMutation(api.parkingSlots.seed);

  const [newNumber, setNewNumber] = useState("");
  const [newType, setNewType] = useState<"car" | "bike" | "truck">("car");
  const [isAdding, setIsAdding] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");

  const filteredSlots =
    slots?.filter(
      (s) => filterType === "all" || s.vehicleType === filterType,
    ) || [];

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNumber.trim()) return;
    setIsAdding(true);
    try {
      await addSlot({
        slotNumber: newNumber.trim().toUpperCase(),
        vehicleType: newType,
      });
      toast.success(`Slot ${newNumber.trim().toUpperCase()} added`);
      setNewNumber("");
    } catch (err: any) {
      toast.error(err.message || "Failed to add slot");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string, slotNumber: string) => {
    try {
      await removeSlot({ id: id as any });
      toast.success(`Slot ${slotNumber} deleted`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete slot");
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const res = await seedSlots({});
      if (res === "seeded") {
        toast.success(
          "Default slots seeded: A-zone (car), B-zone (bike), C-zone (truck)",
        );
      } else {
        toast.info("Slots already exist — skipping seed");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to seed slots");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="text-xs text-muted-foreground mb-2 font-mono">
          <span className="text-[var(--term-green)]">$</span> ls -la
          /etc/parking/slots/
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Parking Slots</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage the parking lot layout and monitor slot occupancy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Occupancy bar */}
          {counts && counts.total > 0 && (
            <Card className="border-border shadow-none bg-card">
              <CardContent className="pt-4 pb-3 px-5">
                <OccupancyBar
                  available={counts.available}
                  occupied={counts.occupied}
                  total={counts.total}
                />
              </CardContent>
            </Card>
          )}

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-36 font-mono text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="car">🚗 Car</SelectItem>
                  <SelectItem value="bike">🏍 Bike</SelectItem>
                  <SelectItem value="truck">🚛 Truck</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-[10px] text-muted-foreground font-mono">
                {filteredSlots.length} slots shown
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="font-mono text-xs gap-1.5"
              onClick={handleSeed}
              disabled={isSeeding}
            >
              {isSeeding ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : null}
              Seed Default Slots
            </Button>
          </div>

          {/* Visual parking lot grid */}
          {slots === undefined ? (
            <div className="text-xs text-muted-foreground font-mono animate-pulse py-12 text-center">
              Loading slots...
            </div>
          ) : filteredSlots.length === 0 ? (
            <Card className="border-border shadow-none bg-card">
              <CardContent className="py-12 text-center">
                <Car className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-mono text-muted-foreground mb-1">
                  {filterType !== "all"
                    ? `No ${filterType} slots found.`
                    : "No parking slots yet."}
                </p>
                <p className="text-xs text-muted-foreground/70 font-mono">
                  Click "Seed Default Slots" to create 45 slots across 3 zones.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border shadow-none bg-card">
              <CardContent className="pt-4 pb-3 px-5">
                <ParkingLotGrid
                  slots={filteredSlots as SlotData[]}
                  onSlotClick={(slot) => {
                    if (slot.status === "available") {
                      handleDelete(slot._id, slot.slotNumber);
                    } else {
                      toast.error(
                        `Cannot delete ${slot.slotNumber} — it is currently occupied.`,
                      );
                    }
                  }}
                />
                <p className="text-[10px] text-muted-foreground font-mono mt-3 text-center">
                  Click an available slot to delete it. Occupied slots cannot be
                  deleted.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Add slot form */}
          <Card className="border-border shadow-none bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary">
                  <PlusCircle className="w-3.5 h-3.5" />
                </div>
                <CardTitle className="text-sm">Add Slot</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">
                    Slot Number
                  </Label>
                  <Input
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    placeholder="e.g. D-01"
                    className="font-mono text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">
                    Vehicle Type
                  </Label>
                  <Select
                    value={newType}
                    onValueChange={(v: string) =>
                      setNewType(v as "car" | "bike" | "truck")
                    }
                  >
                    <SelectTrigger className="font-mono text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="bike">Bike</SelectItem>
                      <SelectItem value="truck">Truck</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="w-full font-mono text-xs"
                  disabled={isAdding || !newNumber.trim()}
                >
                  {isAdding ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  ) : (
                    <PlusCircle className="w-3.5 h-3.5 mr-1" />
                  )}
                  Add Slot
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Summary by zone */}
          {slots && slots.length > 0 && (
            <Card className="border-border shadow-none bg-card">
              <CardContent className="pt-4 pb-3 px-5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono mb-3">
                  Zone Summary
                </p>
                <div className="space-y-2.5 text-xs font-mono">
                  {["A", "B", "C"].map((zone) => {
                    const zoneSlots = slots.filter((s) =>
                      s.slotNumber.startsWith(`${zone}-`),
                    );
                    const zoneAvail = zoneSlots.filter(
                      (s) => s.status === "available",
                    ).length;
                    const zoneTotal = zoneSlots.length;
                    const zoneType =
                      zone === "A" ? "Car" : zone === "B" ? "Bike" : "Truck";
                    return (
                      <div
                        key={zone}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-4 text-muted-foreground font-bold">
                            {zone}
                          </span>
                          <span className="text-muted-foreground">
                            {zoneType}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--term-green)]">
                            {zoneAvail}
                          </span>
                          <span className="text-muted-foreground">/</span>
                          <span>{zoneTotal}</span>
                          <span className="text-muted-foreground">free</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
