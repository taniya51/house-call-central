import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { Shield } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { PortalTheme } from "@/components/PortalTheme";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
});

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@homeserve.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;
      if (user.role !== "admin") {
        toast.error("Admin access required");
        return;
      }
      localStorage.setItem("hs_token", token);
      localStorage.setItem("hs_user", JSON.stringify(user));
      toast.success("Welcome, admin");
      navigate("/admin/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid credentials");
    } finally { setLoading(false); }
  }

  return (
    <PortalTheme theme="admin">
      <AuthShell
        title="Admin sign in"
        subtitle="Restricted access. Authorized personnel only."
        footer={<span className="inline-flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Secured by HomeServe</span>}
        side={
          <div className="max-w-md">
            <div className="text-sm uppercase tracking-widest text-primary-foreground/70">Operations Console</div>
            <h2 className="font-display text-4xl font-extrabold mt-2">Run the entire HomeServe network.</h2>
            <p className="mt-4 text-primary-foreground/80">Approve providers, monitor bookings, manage users — all from one beautiful dashboard.</p>
          </div>
        }
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-cta text-primary-foreground hover:opacity-95">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">Demo: <span className="font-mono">admin@homeserve.com</span> / <span className="font-mono">admin123</span></p>
        </form>
      </AuthShell>
    </PortalTheme>
  );
}
