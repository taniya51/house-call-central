import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { AuthShell } from "@/components/AuthShell";
import { PortalTheme } from "@/components/PortalTheme";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(7).max(20),
  password: z.string().min(6).max(72),
  service: z.string().min(1, "Pick a service"),
});

const SERVICES = ["Electrician", "Plumber", "Carpenter", "Cleaner", "Painter"];

export default function ProviderRegister() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", service: "Electrician" });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    try {
      await register({ ...form, role: "provider" });
      toast.success("Application received! An admin will review your account shortly.");
      navigate("/provider/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not register");
    } finally { setLoading(false); }
  }

  const update = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm(f => ({ ...f, [k]: v }));

  return (
    <PortalTheme theme="provider">
      <AuthShell
        title="Become a provider"
        subtitle="Apply in 60 seconds. We'll verify and approve your account."
        footer={<>Already approved? <Link to="/provider/login" className="font-semibold text-primary hover:underline">Sign in</Link></>}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Full name</Label>
            <Input value={form.name} onChange={e => update("name", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => update("email", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={e => update("phone", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Service category</Label>
            <Select value={form.service} onValueChange={v => update("service", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{SERVICES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <Input type="password" value={form.password} onChange={e => update("password", e.target.value)} />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-cta text-primary-foreground hover:opacity-95">
            {loading ? "Submitting..." : "Submit application"}
          </Button>
        </form>
      </AuthShell>
    </PortalTheme>
  );
}
