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
  Loader2,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  Car,
  Bike,
  Truck,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { ParkingLotGrid, OccupancyBar, type SlotData } from "@/components/ParkingLotGrid";
import { toast } from "sonner";

const vehicleTypeConfig = {
  car: { icon: Car, label: "Car", rate: "$5.00/hr" },
  bike: { icon: Bike, label: "Bike", rate: "$2.00/hr" },
  truck: { icon: Truck, label: "Truck", rate: "$8.00/hr" },
};

export default function VehicleEntry() {
  const entry = useMutation(api.transactions.vehicleEntry);
  const slots = useQuery(api.parkingSlots.list, {});
  const counts = useQuery(api.parkingSlots.counts);

  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState<"car" | "bike" | "truck">(
    "car",
  );
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    slotNumber: string;
    vehicleNumber: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter available slots by selected vehicle type
  const availableForType =
    slots?.filter(
      (s) => s.vehicleType === vehicleType && s.status === "available",
    ) || [];

  const currentConfig = vehicleTypeConfig[vehicleType];
  const Icon = currentConfig.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);
    setError(null);

    try {
      const res = await entry({
        vehicleNumber: vehicleNumber.trim(),
        vehicleType,
        ownerName: ownerName.trim(),
        ownerPhone: ownerPhone.trim() || undefined,
      });
      setResult({
        slotNumber: res.slotNumber,
        vehicleNumber: vehicleNumber.toUpperCase(),
      });
      toast.success(
        `Vehicle ${vehicleNumber.toUpperCase()} parked in slot ${res.slotNumber}`,
      );
      setVehicleNumber("");
      setOwnerName("");
      setOwnerPhone("");
      setVehicleType("car");
    } catch (err: any) {
      const msg = err.message || "Failed to register vehicle entry";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="text-xs text-muted-foreground mb-2 font-mono">
          <span className="text-[var(--term-green)]">$</span> parking
          --action=entry --auto-assign
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Vehicle Entry</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Register a new vehicle. An available slot is assigned automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="lg:col-span-2 border-border shadow-none bg-card">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--term-green-bg)] text-[var(--term-green)]">
                <PlusCircle className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm">Check In Vehicle</CardTitle>
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                  Fill in vehicle details and submit to auto-assign a slot
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Vehicle Number */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider font-mono text-muted-foreground">
                  Vehicle Number (Plate)
                </Label>
                <Input
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="e.g. ABC-1234"
                  className="font-mono text-sm"
                  required
                />
              </div>

              {/* Vehicle Type — visual selector */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider font-mono text-muted-foreground">
                  Vehicle Type
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    ["car", "bike", "truck"] as const
                  ).map((vt) => {
                    const cfg = vehicleTypeConfig[vt];
                    const VIcon = cfg.icon;
                    const isSelected = vehicleType === vt;
                    const availCount =
                      slots?.filter(
                        (s) => s.vehicleType === vt && s.status === "available",
                      ).length ?? 0;
                    return (
                      <button
                        key={vt}
                        type="button"
                        onClick={() => setVehicleType(vt)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border bg-card hover:border-primary/30"
                        }`}
                      >
                        <VIcon
                          className={`w-5 h-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                        />
                        <span
                          className={`text-xs font-mono font-medium ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                        >
                          {cfg.label}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {availCount} free
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Owner Name */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider font-mono text-muted-foreground">
                  Owner Name
                </Label>
                <Input
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. John Smith"
                  className="font-mono text-sm"
                  required
                />
              </div>

              {/* Phone (optional) */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider font-mono text-muted-foreground">
                  Owner Phone{" "}
                  <span className="text-muted-foreground/60">(optional)</span>
                </Label>
                <Input
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  placeholder="e.g. +1 555 0123"
                  className="font-mono text-sm"
                />
              </div>

              {/* Inline error */}
              {error && (
                <div className="border border-[var(--term-red)]/30 bg-[var(--term-red-bg)] rounded-lg px-4 py-3 text-xs font-mono text-[var(--term-red)]">
                  <span className="font-bold">ERROR:</span> {error}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="w-full font-mono text-sm"
                disabled={
                  isSubmitting ||
                  !vehicleNumber.trim() ||
                  !ownerName.trim()
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning Slot...
                  </>
                ) : (
                  <>
                    Check In Vehicle
                    <PlusCircle className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Success result */}
          {result && (
            <Card className="border-[var(--term-green)] bg-[var(--term-green-bg)] shadow-none">
              <CardContent className="pt-5 pb-4 px-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-[var(--term-green)]" />
                  <span className="text-sm font-bold text-[var(--term-green)] font-mono">
                    CHECKED IN ✓
                  </span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plate</span>
                    <span className="font-bold">{result.vehicleNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Slot</span>
                    <span className="font-bold text-[var(--term-green)] text-base">
                      {result.slotNumber}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Occupancy bar */}
          {counts && (
            <Card className="border-border shadow-none bg-card">
              <CardContent className="pt-4 pb-3 px-5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono mb-2">
                  Lot Occupancy
                </p>
                <OccupancyBar
                  available={counts.available}
                  occupied={counts.occupied}
                  total={counts.total}
                />
              </CardContent>
            </Card>
          )}

          {/* Fee schedule with icons */}
          <Card className="border-border shadow-none bg-card">
            <CardContent className="pt-4 pb-3 px-5">
              <div className="flex items-center gap-1.5 mb-3">
                <AlertTriangle className="w-3.5 h-3.5 text-[var(--term-amber)]" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                  Fee Schedule
                </p>
              </div>
              <div className="space-y-2 text-xs font-mono">
                {(
                  ["car", "bike", "truck"] as const
                ).map((vt) => {
                  const cfg = vehicleTypeConfig[vt];
                  const VIcon = cfg.icon;
                  const count =
                    slots?.filter(
                      (s) => s.vehicleType === vt && s.status === "available",
                    ).length ?? 0;
                  return (
                    <div
                      key={vt}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <VIcon className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{cfg.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">
                          {count} free
                        </span>
                        <span className="font-medium">{cfg.rate}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Mini lot preview */}
          {slots && slots.length > 0 && (
            <Card className="border-border shadow-none bg-card">
              <CardContent className="pt-4 pb-3 px-5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono mb-2">
                  Lot Preview ({currentConfig.label} Zone)
                </p>
                <ParkingLotGrid
                  slots={
                    slots.filter(
                      (s) => s.vehicleType === vehicleType,
                    ) as SlotData[]
                  }
                  compact
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
