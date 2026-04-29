import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { AuthShell } from "@/components/AuthShell";
import { PortalTheme } from "@/components/PortalTheme";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6).max(72),
});

export default function ProviderLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("ravi@pro.com");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    try {
      await login(email, password, "provider");
      toast.success("Welcome back!");
      navigate("/provider/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally { setLoading(false); }
  }

  return (
    <PortalTheme theme="provider">
      <AuthShell
        title="Provider sign in"
        subtitle="Pick up new jobs nearby and grow your earnings."
        footer={<>New here? <Link to="/provider/register" className="font-semibold text-primary hover:underline">Apply to become a pro</Link></>}
        side={
          <div className="max-w-md">
            <div className="text-sm uppercase tracking-widest text-primary-foreground/70">For Professionals</div>
            <h2 className="font-display text-4xl font-extrabold mt-2">Earn on your own schedule.</h2>
            <p className="mt-4 text-primary-foreground/80">Get matched with high-quality jobs in your service area. Weekly payouts, zero hidden fees.</p>
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
          <p className="text-xs text-muted-foreground text-center">Demo: <span className="font-mono">ravi@pro.com</span> / <span className="font-mono">demo1234</span></p>
        </form>
      </AuthShell>
    </PortalTheme>
  );
}
