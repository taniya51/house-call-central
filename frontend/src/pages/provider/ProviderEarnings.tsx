import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, CheckCircle2 } from "lucide-react";
import { ProviderLayout } from "@/components/layouts/ProviderLayout";
import { useAuth } from "@/context/AuthContext";
import { Booking, mockDb } from "@/lib/mockDb";
import { api, safeRequest } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

export default function ProviderEarnings() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Booking[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const data = await safeRequest<Booking[]>(
        () => api.get(`/bookings/provider/${user.id}`),
        () => mockDb.bookingsForProvider(user.id, user.service),
      );
      setJobs(data);
    })();
  }, [user]);

  const stats = useMemo(() => {
    const completed = jobs.filter(j => j.status === "completed");
    const total = completed.reduce((s, j) => s + j.price, 0);
    const week = completed.slice(0, 5).reduce((s, j) => s + j.price, 0);
    return { total, week, jobs: completed.length };
  }, [jobs]);

  return (
    <ProviderLayout>
      <div className="p-6 md:p-10 max-w-6xl">
        <h1 className="font-display text-3xl md:text-4xl font-extrabold">Earnings</h1>
        <p className="text-muted-foreground mt-1">Your performance and payouts at a glance.</p>

        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          <Stat icon={Wallet} label="Total earnings" value={`₹${stats.total.toLocaleString()}`} hue="bg-gradient-cta" />
          <Stat icon={TrendingUp} label="This week" value={`₹${stats.week.toLocaleString()}`} />
          <Stat icon={CheckCircle2} label="Completed jobs" value={stats.jobs.toString()} />
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-card shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-display text-lg font-bold">Recent payouts</h2>
          </div>
          <div className="divide-y divide-border">
            {jobs.length === 0 && <div className="p-10 text-center text-muted-foreground">No earnings yet.</div>}
            {jobs.map(j => (
              <div key={j.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{j.service} · {j.userName}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{j.date} · {j.time}</div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={j.status} />
                  <div className="font-display text-lg font-bold">₹{j.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProviderLayout>
  );
}

function Stat({ icon: Icon, label, value, hue }: { icon: typeof Wallet; label: string; value: string; hue?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-border p-6 shadow-card ${hue ?? "bg-card"} ${hue ? "text-primary-foreground" : ""}`}
    >
      <Icon className="h-6 w-6 opacity-80" />
      <div className={`mt-4 text-sm ${hue ? "opacity-80" : "text-muted-foreground"}`}>{label}</div>
      <div className="mt-1 font-display text-3xl font-extrabold">{value}</div>
    </motion.div>
  );
}
