import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CalendarCheck, Clock, MapPin } from "lucide-react";
import { UserLayout } from "@/components/layouts/UserLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { api, safeRequest } from "@/lib/api";
import { mockDb, SERVICE_PRICES } from "@/lib/mockDb";
import { SERVICES } from "@/pages/user/Landing";

const schema = z.object({
  service: z.string().min(1, "Pick a service"),
  date: z.string().min(1, "Pick a date"),
  time: z.string().min(1, "Pick a time"),
  address: z.string().trim().min(8, "Enter a complete address").max(240),
  notes: z.string().max(500).optional(),
});

export default function BookService() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    service: params.get("service") ?? "Electrician",
    date: "",
    time: "10:00",
    address: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { toast.message("Please sign in to book a service"); navigate("/login"); }
  }, [user, navigate]);

  const price = useMemo(() => SERVICE_PRICES[form.service] ?? 799, [form.service]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    if (!user) return;
    setLoading(true);
    try {
      // Redirect to payment page with booking details
      const params = new URLSearchParams({
        service: form.service,
        date: form.date,
        time: form.time,
        address: form.address,
        amount: String(price),
        notes: form.notes || "",
      });
      navigate(`/payment?${params.toString()}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not proceed");
    } finally { setLoading(false); }
  }

  const update = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  return (
    <UserLayout>
      <div className="container py-12 md:py-16 grid lg:grid-cols-[1fr_380px] gap-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-6 md:p-10 shadow-card">
          <h1 className="font-display text-3xl font-extrabold text-primary">Book a service</h1>
          <p className="text-muted-foreground mt-1">Tell us what you need. We'll match you with a vetted pro.</p>

          <form onSubmit={onSubmit} className="mt-8 grid gap-5">
            <div className="space-y-1.5">
              <Label>Service</Label>
              <Select value={form.service} onValueChange={(v) => update("service", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SERVICES.map(s => <SelectItem key={s.name} value={s.name}>{s.name} — ₹{s.from}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" value={form.date} min={new Date().toISOString().slice(0, 10)} onChange={e => update("date", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Time</Label>
                <Input type="time" value={form.time} onChange={e => update("time", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Address</Label>
              <Input value={form.address} onChange={e => update("address", e.target.value)} placeholder="House / flat, street, area, city" />
            </div>
            <div className="space-y-1.5">
              <Label>Notes (optional)</Label>
              <Textarea rows={4} value={form.notes} onChange={e => update("notes", e.target.value)} placeholder="Any details that would help the pro come prepared." />
            </div>
            <Button type="submit" disabled={loading} className="bg-gradient-cta text-primary-foreground hover:opacity-95 mt-2">
              {loading ? "Confirming..." : `Confirm booking · ₹${price}`}
            </Button>
          </form>
        </motion.div>

        <motion.aside initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="space-y-4">
          <div className="rounded-2xl border border-border bg-gradient-hero text-primary-foreground p-6 shadow-elegant">
            <div className="text-xs uppercase tracking-widest text-primary-foreground/70">Order summary</div>
            <div className="mt-3 font-display text-2xl font-bold">{form.service}</div>
            <div className="mt-1 text-primary-foreground/80 text-sm">Standard visit · 60–90 min</div>
            <div className="mt-6 flex items-baseline justify-between">
              <span className="text-primary-foreground/80">Estimated total</span>
              <span className="font-display text-3xl font-extrabold">₹{price}</span>
            </div>
            <div className="mt-1 text-xs text-primary-foreground/70">Pay only after the job is done</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4 text-sm">
            <div className="flex gap-3"><CalendarCheck className="h-5 w-5 text-accent" /><span>Free rescheduling up to 2 hrs before the slot</span></div>
            <div className="flex gap-3"><Clock className="h-5 w-5 text-accent" /><span>Average response time under 30 minutes</span></div>
            <div className="flex gap-3"><MapPin className="h-5 w-5 text-accent" /><span>Live tracking once a pro accepts your job</span></div>
          </div>
        </motion.aside>
      </div>
    </UserLayout>
  );
}
