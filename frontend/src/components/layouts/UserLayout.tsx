import { Link, NavLink, useNavigate } from "react-router-dom";
import { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Menu } from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function UserLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/book", label: "Book a service" },
    { to: "/my-bookings", label: "My bookings" },
    { to: "/track", label: "Track helper" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Logo />
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-smooth ${
                    isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-cta text-[11px] font-bold text-primary-foreground">
                      {user.name.charAt(0)}
                    </span>
                    <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/my-bookings")}>My bookings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { logout(); navigate("/"); }}>
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm"><Link to="/login">Sign in</Link></Button>
                <Button asChild size="sm" className="bg-gradient-cta text-primary-foreground hover:opacity-95">
                  <Link to="/register">Get started</Link>
                </Button>
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 md:hidden">
                {navItems.map(n => (
                  <DropdownMenuItem key={n.to} onClick={() => navigate(n.to)}>{n.label}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/60 bg-secondary/40">
        <div className="container py-10 grid gap-8 md:grid-cols-4 text-sm">
          <div className="space-y-3">
            <Logo />
            <p className="text-muted-foreground">Trusted home services, on demand. Vetted pros for every job around the house.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>About</li><li>Careers</li><li>Press</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">For Pros</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/provider/register" className="hover:text-foreground">Become a provider</Link></li>
              <li><Link to="/provider/login" className="hover:text-foreground">Provider login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>Terms</li><li>Privacy</li>
              <li><Link to="/admin/login" className="hover:text-foreground">Admin</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} HomeServe Technologies. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
