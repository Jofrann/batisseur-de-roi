import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Stethoscope,
  BarChart2,
  CalendarDays,
  Target,
  Menu,
  X,
  Crown
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Tableau de Bord", path: "/", icon: LayoutDashboard },
  { label: "Objectifs", path: "/goals", icon: Target },
  { label: "Journal Quotidien", path: "/journal", icon: BookOpen },
  { label: "Actions Quotidiennes", path: "/actions", icon: CheckSquare },
  { label: "Diagnostic Mensuel", path: "/diagnostic", icon: Stethoscope },
  { label: "Bilan Mensuel", path: "/bilan", icon: BarChart2 },
  { label: "Calendrier", path: "/calendrier", icon: CalendarDays },
];

export default function AppLayout({ children }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Crown className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight text-foreground">Bâtisseur de Roi</h1>
            <p className="text-xs text-muted-foreground">Plan 3 ans</p>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                location.pathname === path
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Crown className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-sm">Bâtisseur de Roi</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background pt-14">
          <nav className="p-4 space-y-1">
            {navItems.map(({ label, path, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto md:p-0 pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}