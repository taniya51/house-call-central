import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Check, X, MapPin, CalendarDays, Clock, Briefcase } from "lucide-react";
import { ProviderLayout } from "@/components/layouts/ProviderLayout";
import { useAuth } from "@/context/AuthContext";
import { Booking, mockDb } from "@/lib/mockDb";
import { api, safeRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    const data = await safeRequest<Booking[]>(
      () => api.get(`/bookings/provider/${user.id}`),
      () => mockDb.bookingsForProvider(user.id, user.service),
    );
    setJobs(data);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  if (!user) return null;

  if (user.approved === false) {
    return (
      <ProviderLayout>
        <div className="container max-w-2xl py-20">
          <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-card">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-warning/20 text-warning"><Briefcase className="h-6 w-6" /></div>
            <h2 className="mt-4 font-display text-2xl font-bold">Application under review</h2>
            <p className="mt-2 text-muted-foreground">Your provider account is awaiting admin approval. You'll be able to accept jobs as soon as you're approved.</p>
          </div>
        </div>
      </ProviderLayout>
    );
  }

  async function update(id: string, status: Booking["status"]) {
    await safeRequest(
      () => api.patch(`/bookings/${id}/status`, { status, providerId: user!.id }),
      () => { mockDb.updateBookingStatus(id, status, user!.id, user!.name); return null; },
    );
    toast.success(status === "accepted" ? "Job accepted!" : status === "rejected" ? "Job rejected" : `Marked ${status}`);
    load();
  }

  const pending = jobs.filter(j => j.status === "pending");
  const active = jobs.filter(j => ["accepted", "in_progress"].includes(j.status));
  const completed = jobs.filter(j => j.status === "completed");

  return (
    <ProviderLayout>
      <div className="p-6 md:p-10 max-w-6xl">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold">{user.name}</h1>
          <p className="text-muted-foreground mt-1">{user.service} · Approved provider</p>
        </div>

        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          {[
            { label: "Pending", value: pending.length, accent: "warning" },
            { label: "Active", value: active.length, accent: "primary" },
            { label: "Completed", value: completed.length, accent: "success" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="text-sm text-muted-foreground">{s.label}</div>
              <div className="mt-1 font-display text-3xl font-extrabold">{s.value}</div>
            </div>
          ))}
        </div>

        <Section title="New job requests" empty="No new requests right now.">
          {pending.map((b, i) => (
            <JobCard key={b.id} b={b} delay={i * 0.04}>
              <Button onClick={() => update(b.id, "accepted")} className="bg-gradient-cta text-primary-foreground hover:opacity-95">
                <Check className="mr-1 h-4 w-4" /> Accept
              </Button>
              <Button onClick={() => update(b.id, "rejected")} variant="outline">
                <X className="mr-1 h-4 w-4" /> Reject
              </Button>
            </JobCard>
          ))}
        </Section>

        <Section title="Active jobs" empty="No active jobs yet.">
          {active.map((b, i) => (
            <JobCard key={b.id} b={b} delay={i * 0.04}>
              {b.status === "accepted" && (
                <Button onClick={() => update(b.id, "in_progress")} className="bg-gradient-cta text-primary-foreground hover:opacity-95">Start job</Button>
              )}
              {b.status === "in_progress" && (
                <Button onClick={() => update(b.id, "completed")} className="bg-gradient-cta text-primary-foreground hover:opacity-95">Mark completed</Button>
              )}
            </JobCard>
          ))}
        </Section>

        <Section title="Recently completed" empty="Completed jobs will show up here.">
          {completed.slice(0, 5).map((b, i) => <JobCard key={b.id} b={b} delay={i * 0.04} />)}
        </Section>

        {loading && <div className="text-muted-foreground">Loading...</div>}
      </div>
    </ProviderLayout>
  );
}

function Section({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  const arr = Array.isArray(children) ? children : [children];
  const isEmpty = arr.filter(Boolean).length === 0;
  return (
    <div className="mt-10">
      <h2 className="font-display text-xl font-bold mb-4">{title}</h2>
      {isEmpty ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">{empty}</div>
      ) : <div className="grid gap-3">{children}</div>}
    </div>
  );
}

function JobCard({ b, delay = 0, children }: { b: Booking; delay?: number; children?: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="rounded-2xl border border-border bg-card p-5 shadow-card flex flex-wrap gap-4 items-start justify-between"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <h3 className="font-display text-lg font-bold">{b.service}</h3>
          <StatusBadge status={b.status} />
        </div>
        <div className="text-sm text-muted-foreground mt-1">For {b.userName}</div>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {b.date}</span>
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {b.time}</span>
          <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {b.address}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-3">
        <div className="font-display text-xl font-extrabold">₹{b.price}</div>
        {children && <div className="flex gap-2">{children}</div>}
      </div>
    </motion.div>
  );
}
