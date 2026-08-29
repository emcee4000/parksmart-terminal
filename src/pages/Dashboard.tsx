import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Car,
  Clock,
  DollarSign,
  TrendingUp,
  CircleCheck,
  CircleDot,
  LogIn,
  LogOut,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import {
  ParkingLotGrid,
  OccupancyBar,
  type SlotData,
} from "@/components/ParkingLotGrid";

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatVehicleType(t: string) {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export default function Dashboard() {
  const stats = useQuery(api.transactions.dashboardStats);
  const slotCounts = useQuery(api.parkingSlots.counts);
  const allSlots = useQuery(api.parkingSlots.list, {});

  const loading = !stats || !slotCounts;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="text-xs text-muted-foreground mb-2 font-mono">
          <span className="text-[var(--term-green)]">$</span> dashboard
          --overview --live
        </div>
        <h1 className="text-2xl font-bold tracking-tight">System Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time parking system status, occupancy, and revenue.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <Card className="border-border shadow-none bg-card">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                Total Slots
              </span>
              <Car className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold font-mono">
              {loading ? "—" : slotCounts.total}
            </p>
          </CardContent>
        </Card>

        <Card className="border-[var(--term-green)]/30 shadow-none bg-[var(--term-green-bg)]">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                Available
              </span>
              <CircleCheck className="w-3.5 h-3.5 text-[var(--term-green)]" />
            </div>
            <p className="text-2xl font-bold font-mono text-[var(--term-green)]">
              {loading ? "—" : slotCounts.available}
            </p>
          </CardContent>
        </Card>

        <Card className="border-[var(--term-amber)]/30 shadow-none bg-[var(--term-amber-bg)]">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                Occupied
              </span>
              <CircleDot className="w-3.5 h-3.5 text-[var(--term-amber)]" />
            </div>
            <p className="text-2xl font-bold font-mono text-[var(--term-amber)]">
              {loading ? "—" : slotCounts.occupied}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-none bg-card">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                Active Now
              </span>
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold font-mono">
              {loading ? "—" : stats.activeCount}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-none bg-card">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                Today's Rev
              </span>
              <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold font-mono">
              {loading ? "—" : formatCents(stats.todayRevenue)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Visual Parking Lot */}
        <Card className="lg:col-span-2 border-border shadow-none bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1 font-mono">
                  <span className="text-[var(--term-green)]">$</span> ls
                  /var/lib/parking/lot/
                </div>
                <CardTitle className="text-sm">Parking Lot View</CardTitle>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
                <LogIn className="w-3 h-3 text-[var(--term-green)]" />
                <span>entry</span>
                <span className="mx-1">│</span>
                <LogOut className="w-3 h-3 text-[var(--term-red)]" />
                <span>exit</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {allSlots ? (
              <>
                <OccupancyBar
                  available={slotCounts?.available ?? 0}
                  occupied={slotCounts?.occupied ?? 0}
                  total={slotCounts?.total ?? 0}
                  className="mb-4"
                />
                <ParkingLotGrid slots={allSlots as SlotData[]} compact />
              </>
            ) : (
              <div className="text-xs text-muted-foreground font-mono animate-pulse py-8 text-center">
                Loading lot layout...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue summary */}
        <div className="space-y-4">
          <Card className="border-border shadow-none bg-card">
            <CardContent className="pt-5 pb-4 px-5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono mb-3">
                Revenue Summary
              </p>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    Today
                  </p>
                  <p className="text-xl font-bold font-mono">
                    {loading ? "—" : formatCents(stats.todayRevenue)}
                  </p>
                </div>
                <div className="h-px bg-border" />
                <div>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    All Time
                  </p>
                  <p className="text-xl font-bold font-mono">
                    {loading ? "—" : formatCents(stats.totalRevenue)}
                  </p>
                </div>
                <div className="h-px bg-border" />
                <div>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    Completed Sessions
                  </p>
                  <p className="text-xl font-bold font-mono">
                    {loading ? "—" : stats.completedCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="border-border shadow-none bg-card">
            <CardContent className="pt-4 pb-3 px-5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono mb-3">
                Quick Actions
              </p>
              <div className="space-y-2">
                <a
                  href="/dashboard/entry"
                  className="flex items-center gap-2 text-xs font-mono px-3 py-2 rounded bg-[var(--term-green-bg)] border border-[var(--term-green)]/30 text-[var(--term-green)] hover:border-[var(--term-green)] transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Check In Vehicle →
                </a>
                <a
                  href="/dashboard/exit"
                  className="flex items-center gap-2 text-xs font-mono px-3 py-2 rounded bg-[var(--term-amber-bg)] border border-[var(--term-amber)]/30 text-[var(--term-amber)] hover:border-[var(--term-amber)] transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Check Out Vehicle →
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="border-border shadow-none bg-card">
        <CardHeader className="pb-3">
          <div className="text-xs text-muted-foreground mb-1 font-mono">
            <span className="text-[var(--term-green)]">$</span> tail -n 5
            /var/log/parking.log
          </div>
          <CardTitle className="text-sm">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-xs text-muted-foreground font-mono animate-pulse py-6 text-center">
              Loading records...
            </div>
          ) : stats.recent.length === 0 ? (
            <div className="text-xs text-muted-foreground font-mono py-8 text-center border border-dashed border-border rounded">
              No records yet. Check in your first vehicle from the sidebar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="pb-2 font-medium">TIME</th>
                    <th className="pb-2 font-medium">PLATE</th>
                    <th className="pb-2 font-medium">TYPE</th>
                    <th className="pb-2 font-medium">SLOT</th>
                    <th className="pb-2 font-medium">STATUS</th>
                    <th className="pb-2 font-medium text-right">FEE</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent.map((t) => (
                    <tr
                      key={t._id}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-2.5 text-muted-foreground">
                        {formatTime(t.entryTime)}
                      </td>
                      <td className="py-2.5 font-semibold">{t.vehicleNumber}</td>
                      <td className="py-2.5">{formatVehicleType(t.vehicleType)}</td>
                      <td className="py-2.5 text-muted-foreground">
                        {t.slot?.slotNumber || "—"}
                      </td>
                      <td className="py-2.5">
                        <Badge
                          variant="outline"
                          className={
                            t.status === "active"
                              ? "border-[var(--term-amber)] text-[var(--term-amber)] bg-[var(--term-amber-bg)]"
                              : "border-[var(--term-green)] text-[var(--term-green)] bg-[var(--term-green-bg)]"
                          }
                        >
                          {t.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-right">
                        {t.fee != null ? formatCents(t.fee) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
