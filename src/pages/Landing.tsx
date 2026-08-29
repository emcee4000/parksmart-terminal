import { motion } from "framer-motion";
import {
  ArrowRight,
  Car,
  Bike,
  Truck,
  Clock,
  Shield,
  CircleCheck,
  CircleDot,
  DollarSign,
  Search,
} from "lucide-react";
import { Link } from "react-router";

// ASCII-art parking lot for the hero
const LOT_ROWS = [
  { zone: "A", type: "car", slots: ["A-01", "A-02", "A-03", "A-04", "A-05"] },
  { zone: "B", type: "bike", slots: ["B-01", "B-02", "B-03", "B-04", "B-05"] },
  { zone: "C", type: "truck", slots: ["C-01", "C-02", "C-03", "C-04", "C-05"] },
];

const features = [
  {
    icon: Car,
    title: "Instant Check-In",
    desc: "Register a vehicle, get an auto-assigned slot in seconds. No manual sorting.",
    color: "var(--term-green)",
  },
  {
    icon: Clock,
    title: "Auto Fee Calc",
    desc: "Duration tracked from entry to exit. Fees computed by vehicle type and hours.",
    color: "var(--term-amber)",
  },
  {
    icon: Search,
    title: "Search & History",
    desc: "Look up any plate number. Full audit trail with payment records.",
    color: "var(--term-green)",
  },
  {
    icon: Shield,
    title: "Real-Time Dashboard",
    desc: "Occupancy, revenue, active sessions — all live, all at a glance.",
    color: "var(--term-amber)",
  },
];

const rates = [
  { icon: Car, type: "Car", rate: "$5.00/hr", color: "var(--term-green)" },
  { icon: Bike, type: "Bike", rate: "$2.00/hr", color: "var(--term-green)" },
  { icon: Truck, type: "Truck", rate: "$8.00/hr", color: "var(--term-amber)" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      {/* Top bar */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight">PARK.MGR</span>
              <span className="text-[10px] text-muted-foreground ml-2 uppercase tracking-widest">
                v1.0
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-muted-foreground hidden sm:block">
              $ systemctl status parking —{" "}
              <span className="text-[var(--term-green)]">active</span>
            </span>
            <Link
              to="/auth"
              className="text-xs border border-border rounded px-4 py-2 hover:bg-muted transition-colors font-medium"
            >
              Operator Login →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-xs text-muted-foreground mb-4">
              <span className="text-[var(--term-green)]">$</span> ./parking_system
              --mode=management
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
              Vehicle Parking
              <br />
              <span className="text-[var(--term-green)]">Management</span>
            </h1>
            <p className="mt-5 text-muted-foreground max-w-md leading-relaxed text-sm">
              Manage parking slots, track vehicle entry & exit, auto-calculate
              fees, and view payment history — all from one clean dashboard.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-8">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Open Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#rates"
                className="inline-flex items-center gap-2 border border-border rounded-lg px-6 py-3 text-sm font-medium hover:bg-muted transition-colors"
              >
                View Rates ↓
              </a>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-6 mt-8 text-xs font-mono text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CircleCheck className="w-3.5 h-3.5 text-[var(--term-green)]" />
                <span>45 Slots</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CircleDot className="w-3.5 h-3.5 text-[var(--term-amber)]" />
                <span>3 Zones</span>
              </div>
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Auto Billing</span>
              </div>
            </div>
          </motion.div>

          {/* Right: Visual parking lot */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="border border-border rounded-xl bg-card p-6 shadow-sm"
          >
            <div className="text-[10px] text-muted-foreground mb-4 uppercase tracking-widest">
              ┌─ Live Parking Lot ──────────────┐
            </div>

            {/* Entry/exit arrows */}
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-3 font-mono">
              <span className="text-[var(--term-green)]">▲ ENTRY</span>
              <span className="text-[var(--term-red)]">▼ EXIT</span>
            </div>

            {LOT_ROWS.map((row, ri) => (
              <motion.div
                key={row.zone}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + ri * 0.1 }}
                className="mb-2"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-muted-foreground w-4">
                    {row.zone}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {row.type}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 ml-6">
                  {row.slots.map((sl, si) => {
                    // Simulate some occupied slots for the demo
                    const occupied =
                      (ri === 0 && (si === 0 || si === 2 || si === 4)) ||
                      (ri === 1 && si === 1) ||
                      (ri === 2 && si === 3);
                    return (
                      <div
                        key={sl}
                        className={`flex flex-col items-center justify-center rounded border py-2 px-1 transition-all ${
                          occupied
                            ? "border-[var(--term-amber)]/40 bg-[var(--term-amber-bg)]"
                            : "border-[var(--term-green)]/40 bg-[var(--term-green-bg)]"
                        }`}
                      >
                        <span
                          className={`text-[10px] font-bold font-mono leading-none ${
                            occupied
                              ? "text-[var(--term-amber)]"
                              : "text-[var(--term-green)]"
                          }`}
                        >
                          {sl}
                        </span>
                        <span className="mt-0.5">
                          {row.type === "car" && (
                            <Car
                              className={`w-3 h-3 ${occupied ? "text-[var(--term-amber)]" : "text-[var(--term-green)]"}`}
                            />
                          )}
                          {row.type === "bike" && (
                            <Bike
                              className={`w-3 h-3 ${occupied ? "text-[var(--term-amber)]" : "text-[var(--term-green)]"}`}
                            />
                          )}
                          {row.type === "truck" && (
                            <Truck
                              className={`w-3 h-3 ${occupied ? "text-[var(--term-amber)]" : "text-[var(--term-green)]"}`}
                            />
                          )}
                        </span>
                        <span
                          className={`text-[7px] font-mono uppercase ${
                            occupied
                              ? "text-[var(--term-amber)]/60"
                              : "text-[var(--term-green)]/60"
                          }`}
                        >
                          {occupied ? "busy" : "open"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}

            <div className="text-[10px] text-muted-foreground mt-4 font-mono">
              └─────────────────────────────────┘
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-xs text-muted-foreground mb-8">
            <span className="text-[var(--term-green)]">$</span> cat
            /specs/v1_features.txt
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
                className="border border-border rounded-xl bg-background p-5 hover:border-primary/30 transition-colors"
              >
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-lg mb-3"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${f.color} 10%, transparent)`,
                  }}
                >
                  <f.icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <h3 className="text-sm font-bold mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Rates */}
      <section id="rates" className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-xs text-muted-foreground mb-8">
            <span className="text-[var(--term-green)]">$</span> cat
            /etc/parking/rates.conf
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
            {rates.map((r, i) => (
              <motion.div
                key={r.type}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 * i }}
                className="border border-border rounded-xl bg-card p-5 text-center hover:border-primary/30 transition-colors"
              >
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-xl mx-auto mb-3"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${r.color} 10%, transparent)`,
                  }}
                >
                  <r.icon className="w-6 h-6" style={{ color: r.color }} />
                </div>
                <p className="text-sm font-bold">{r.type}</p>
                <p className="text-lg font-bold mt-1" style={{ color: r.color }}>
                  {r.rate}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-muted-foreground uppercase tracking-widest">
          <span className="flex items-center gap-2">
            <Car className="w-3 h-3" />
            PARK.MGR v1.0 — Parking Management System
          </span>
          <span>Built with Convex + React + TypeScript</span>
        </div>
      </footer>
    </div>
  );
}
