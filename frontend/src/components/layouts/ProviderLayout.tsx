import { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Wallet, LogOut, Briefcase } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { PortalTheme } from "@/components/PortalTheme";

export function ProviderLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const items = [
    { to: "/provider/dashboard", label: "Jobs", icon: Briefcase },
    { to: "/provider/earnings", label: "Earnings", icon: Wallet },
  ];

  return (
    <PortalTheme theme="provider">
      <div className="min-h-screen bg-background text-foreground flex">
        <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-gradient-soft p-5 sticky top-0 h-screen">
          <Logo />
          <div className="mt-2 text-xs text-muted-foreground uppercase tracking-widest">Provider</div>
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
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-cta text-primary-foreground font-bold">
                {user?.name.charAt(0) ?? "P"}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{user?.name}</div>
                <div className="text-xs text-muted-foreground truncate">{user?.service ?? "Provider"}</div>
              </div>
            </div>
            <Button onClick={() => { logout(); navigate("/provider/login"); }} variant="outline" size="sm" className="w-full mt-3">
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="md:hidden border-b border-border p-4 flex items-center justify-between">
            <Logo />
            <Button onClick={() => { logout(); navigate("/provider/login"); }} variant="outline" size="sm"><LogOut className="h-4 w-4" /></Button>
          </header>
          {children}
        </div>
      </div>
    </PortalTheme>
  );
}
