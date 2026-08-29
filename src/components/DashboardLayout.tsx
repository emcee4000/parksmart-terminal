import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  Car,
  Clock,
  History,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  XCircle,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Overview", end: true },
  { to: "/dashboard/entry", icon: PlusCircle, label: "Vehicle Entry" },
  { to: "/dashboard/exit", icon: XCircle, label: "Vehicle Exit" },
  { to: "/dashboard/slots", icon: Car, label: "Parking Slots" },
  { to: "/dashboard/history", icon: History, label: "History" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col shrink-0">
        {/* Header */}
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-primary text-primary-foreground text-sm font-bold">
              P
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">
                PARK.MGR
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                v1.0.0
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-border space-y-2">
          <div className="px-3 py-2 rounded bg-muted text-xs">
            <p className="text-muted-foreground uppercase tracking-wider text-[10px] mb-1">
              Operator
            </p>
            <p className="font-medium truncate">
              {user?.name || user?.email || "Admin"}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
