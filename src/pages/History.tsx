import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Search, ArrowLeft, History, CreditCard, Clock, Car } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

export default function HistoryPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed">("all");
  
  const transactions = useQuery(api.transactions.list, {
    status: statusFilter === "all" ? undefined : statusFilter,
  }) ?? [];

  const filtered = search.trim()
    ? transactions.filter(
        (t) =>
          t.vehicleNumber.toLowerCase().includes(search.toLowerCase()) ||
          t.ownerName.toLowerCase().includes(search.toLowerCase())
      )
    : transactions;

  const totalRevenue = filtered.reduce(
    (sum: number, t: (typeof filtered)[number]) => sum + (t.fee || 0),
    0,
  );

  function formatCents(cents: number) {
    return `$${(cents / 100).toFixed(2)}`;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="p-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </a>
            <div>
              <h1 className="text-2xl font-bold text-foreground font-mono tracking-tight flex items-center gap-2">
                <History className="w-6 h-6 text-primary" />
                PARKING HISTORY
              </h1>
              <p className="text-muted-foreground font-mono text-sm mt-0.5">
                TRANSACTION LOGS & PAYMENT RECORDS
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by plate number or owner name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "active", "completed"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-2.5 rounded-lg font-mono text-xs uppercase tracking-wider border transition-all ${
                    statusFilter === s
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Summary bar */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
            <span className="font-mono text-xs text-muted-foreground">
              RECORDS: {filtered.length}
            </span>
            <span className="text-border">│</span>
            <span className="font-mono text-xs text-primary">
              REVENUE: {formatCents(totalRevenue)}
            </span>
          </div>
        </div>

        {/* Records table */}
        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Car className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="font-mono text-muted-foreground">
              {search ? "NO RECORDS MATCH YOUR SEARCH" : "NO TRANSACTIONS FOUND"}
            </p>
            <p className="font-mono text-xs text-muted-foreground/60 mt-1">
              {search
                ? "Try a different plate number or name"
                : "Transactions will appear here once vehicles enter"}
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-8 gap-2 px-5 py-3 bg-muted/50 border-b border-border">
              <span className="col-span-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                ID
              </span>
              <span className="col-span-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                PLATE
              </span>
              <span className="col-span-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                OWNER
              </span>
              <span className="col-span-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                SLOT
              </span>
              <span className="col-span-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                ENTRY
              </span>
              <span className="col-span-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                EXIT
              </span>
              <span className="col-span-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                DURATION
              </span>
              <span className="col-span-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                FEE
              </span>
            </div>

            {/* Table rows */}
            {filtered.map((t) => {
              const slot = t.slot as
                | { slotNumber?: string; vehicleType?: string }
                | undefined;
              const duration = t.duration || 0;
              const hours = Math.floor(duration / 60);
              const mins = duration % 60;
              const durationStr =
                duration > 0
                  ? hours > 0
                    ? `${hours}h ${mins}m`
                    : `${mins}m`
                  : "—";

              return (
                <div
                  key={t._id}
                  className="grid grid-cols-8 gap-2 px-5 py-3.5 border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <span className="col-span-1 font-mono text-xs text-muted-foreground truncate">
                    #{t._id.slice(-6).toUpperCase()}
                  </span>
                  <span className="col-span-1 font-mono text-sm font-bold text-foreground tracking-wider">
                    {t.vehicleNumber}
                  </span>
                  <span className="col-span-1 font-mono text-xs text-foreground truncate">
                    {t.ownerName}
                  </span>
                  <span className="col-span-1">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted border border-border">
                      {slot?.slotNumber || "—"}
                    </span>
                  </span>
                  <span className="col-span-1 font-mono text-xs text-muted-foreground">
                    {new Date(t.entryTime).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="col-span-1 font-mono text-xs text-muted-foreground">
                    {t.exitTime
                      ? new Date(t.exitTime).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </span>
                  <span className="col-span-1 font-mono text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {durationStr}
                  </span>
                  <span className="col-span-1 font-mono text-xs font-bold text-primary flex items-center gap-1">
                    {t.fee ? (
                      <>
                        <CreditCard className="w-3 h-3" />{formatCents(t.fee)}
                      </>
                    ) : (
                      "—"
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
