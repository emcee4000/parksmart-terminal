import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  XCircle,
  CheckCircle2,
  Search,
  Clock,
  DollarSign,
  Car,
  Bike,
  Truck,
  LogOut,
  CircleDot,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

const vehicleIcon: Record<string, React.ReactNode> = {
  car: <Car className="w-4 h-4" />,
  bike: <Bike className="w-4 h-4" />,
  truck: <Truck className="w-4 h-4" />,
};

const rateMap: Record<string, number> = {
  car: 500,
  bike: 200,
  truck: 800,
};

export default function VehicleExit() {
  const exit = useMutation(api.transactions.vehicleExit);
  const [searchNumber, setSearchNumber] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [exitResult, setExitResult] = useState<any>(null);
  const [exitError, setExitError] = useState<string | null>(null);

  const activeList = useQuery(api.transactions.list, { status: "active" });

  const filteredActive =
    activeList?.filter(
      (t) =>
        !searchNumber.trim() ||
        t.vehicleNumber.toUpperCase().includes(searchNumber.toUpperCase()),
    ) || [];

  const handleProcessExit = async (txId: string) => {
    setProcessingId(txId);
    setExitError(null);
    try {
      const res = await exit({ transactionId: txId as any });
      setExitResult(res);
      toast.success(
        `Vehicle exited. Duration: ${res.durationFormatted}, Fee: ${res.feeFormatted}`,
      );
    } catch (err: any) {
      const msg = err.message || "Failed to process exit";
      setExitError(msg);
      toast.error(msg);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="text-xs text-muted-foreground mb-2 font-mono">
          <span className="text-[var(--term-green)]">$</span> parking
          --action=exit --calculate-fee
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Vehicle Exit</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Process a departure — duration and parking fees are calculated
          automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active sessions */}
        <Card className="lg:col-span-2 border-border shadow-none bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1 font-mono">
                  <span className="text-[var(--term-green)]">$</span> grep
                  --status=active /var/log/parking.log
                </div>
                <CardTitle className="text-sm flex items-center gap-2">
                  Active Sessions
                  {activeList && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--term-amber)]/10 text-[var(--term-amber)] text-[10px] font-bold font-mono">
                      {filteredActive.length}
                    </span>
                  )}
                </CardTitle>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={searchNumber}
                  onChange={(e) => setSearchNumber(e.target.value)}
                  placeholder="Filter by plate..."
                  className="pl-8 w-48 font-mono text-xs"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!activeList ? (
              <div className="text-xs text-muted-foreground font-mono animate-pulse py-8 text-center">
                Loading active sessions...
              </div>
            ) : filteredActive.length === 0 ? (
              <div className="text-xs text-muted-foreground font-mono py-10 text-center border border-dashed border-border rounded-lg">
                {searchNumber
                  ? `No active vehicles match "${searchNumber}".`
                  : "No active parking sessions. All slots are free."}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredActive.map((t) => {
                  const durationMs = Date.now() - t.entryTime;
                  const durationMin = Math.max(
                    1,
                    Math.ceil(durationMs / 60000),
                  );
                  const durationHrs = Math.ceil(durationMin / 60);
                  const estFee = (rateMap[t.vehicleType] || 500) * durationHrs;
                  const entryDate = new Date(t.entryTime);
                  const isProcessing = processingId === t._id;

                  return (
                    <div
                      key={t._id}
                      className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                    >
                      {/* Top row: plate + badge + exit button */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted text-foreground">
                            {vehicleIcon[t.vehicleType] || (
                              <Car className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold font-mono text-sm">
                                {t.vehicleNumber}
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--term-amber)]/10 text-[var(--term-amber)] text-[10px] font-mono font-bold">
                                <CircleDot className="w-2.5 h-2.5" />
                                ACTIVE
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                              {t.ownerName} · {t.vehicleType} · Slot{" "}
                              {t.slot?.slotNumber || "—"}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="font-mono text-xs gap-1.5"
                          onClick={() => handleProcessExit(t._id)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <LogOut className="w-3.5 h-3.5" />
                          )}
                          Exit
                        </Button>
                      </div>

                      {/* Bottom row: time stats */}
                      <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground ml-[52px]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          In:{" "}
                          {entryDate.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span>
                          Duration:{" "}
                          {durationMin >= 60
                            ? `${Math.floor(durationMin / 60)}h ${durationMin % 60}m`
                            : `${durationMin}m`}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Est. {formatCents(estFee)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Exit result */}
          {exitResult && (
            <Card className="border-[var(--term-green)] bg-[var(--term-green-bg)] shadow-none">
              <CardContent className="pt-5 pb-4 px-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-[var(--term-green)]" />
                  <span className="text-sm font-bold text-[var(--term-green)] font-mono">
                    EXIT PROCESSED ✓
                  </span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-bold text-base">
                      {exitResult.durationFormatted}
                    </span>
                  </div>
                  <div className="h-px bg-[var(--term-green)]/20" />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fee Collected</span>
                    <span className="font-bold text-[var(--term-green)] text-lg">
                      {exitResult.feeFormatted}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="w-full mt-3 font-mono text-xs"
                  onClick={() => setExitResult(null)}
                >
                  Dismiss
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Inline error */}
          {exitError && (
            <Card className="border-[var(--term-red)]/30 bg-[var(--term-red-bg)] shadow-none">
              <CardContent className="pt-4 pb-3 px-5">
                <p className="text-xs font-mono text-[var(--term-red)]">
                  <span className="font-bold">ERROR:</span> {exitError}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 font-mono text-xs"
                  onClick={() => setExitError(null)}
                >
                  Dismiss
                </Button>
              </CardContent>
            </Card>
          )}

          {/* How it works */}
          <Card className="border-border shadow-none bg-card">
            <CardContent className="pt-5 pb-4 px-5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono mb-3">
                How Exit Works
              </p>
              <div className="space-y-3 text-xs font-mono text-muted-foreground">
                <div className="flex gap-3">
                  <span className="flex items-center justify-center w-5 h-5 rounded bg-[var(--term-green)]/10 text-[var(--term-green)] text-[10px] font-bold shrink-0">
                    01
                  </span>
                  <p>Find the vehicle by plate in the active session list.</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex items-center justify-center w-5 h-5 rounded bg-[var(--term-green)]/10 text-[var(--term-green)] text-[10px] font-bold shrink-0">
                    02
                  </span>
                  <p>
                    Click <strong>Exit</strong> — the system calculates the
                    duration and parking fee.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="flex items-center justify-center w-5 h-5 rounded bg-[var(--term-green)]/10 text-[var(--term-green)] text-[10px] font-bold shrink-0">
                    03
                  </span>
                  <p>
                    The slot is freed and the payment is recorded as{" "}
                    <strong>paid</strong>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
