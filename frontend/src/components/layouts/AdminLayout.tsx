import { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, HardHat, ClipboardList, LogOut, Shield } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { PortalTheme } from "@/components/PortalTheme";

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const items = [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/providers", label: "Providers", icon: HardHat },
    { to: "/admin/bookings", label: "Bookings", icon: ClipboardList },
  ];

  return (
    <PortalTheme theme="admin">
      <div className="min-h-screen bg-background text-foreground flex">
        <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-gradient-soft p-5 sticky top-0 h-screen">
          <Logo />
          <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary"><Shield className="h-3.5 w-3.5" /> ADMIN</div>
          <nav className="mt-8 space-y-1">
            {items.map(it => (
              <NavLink key={it.to} to={it.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-smooth ${
                    isActive ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`
                }
              >
                <it.icon className="h-4 w-4" /> {it.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto rounded-xl border border-border bg-card p-4">
            <div className="text-sm font-semibold">{user?.name}</div>
            <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
            <Button onClick={() => { logout(); navigate("/admin/login"); }} variant="outline" size="sm" className="w-full mt-3">
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </div>
        </aside>
        <div className="flex-1 min-w-0">
          <header className="md:hidden border-b border-border p-4 flex items-center justify-between">
            <Logo />
            <Button onClick={() => { logout(); navigate("/admin/login"); }} variant="outline" size="sm"><LogOut className="h-4 w-4" /></Button>
          </header>
          {children}
        </div>
      </div>
    </PortalTheme>
  );
}
