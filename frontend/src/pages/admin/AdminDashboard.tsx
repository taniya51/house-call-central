import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, HardHat, ClipboardList, IndianRupee, ArrowUpRight } from "lucide-react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { mockDb, Booking } from "@/lib/mockDb";
import { api, safeRequest } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

interface Stats { totalUsers: number; totalProviders: number; totalBookings: number; revenue: number }
interface BackendBooking { id: number; user_id: number; provider_id: number; service: string; booking_date: string; booking_time: string; address: string; status: string; user_name: string; provider_name: string }

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalProviders: 0, totalBookings: 0, revenue: 0 });
  const [recent, setRecent] = useState<Booking[]>([]);

  useEffect(() => {
    (async () => {
      const s = await safeRequest<Stats>(() => api.get("/admin/stats"), () => mockDb.stats());
      setStats(s);
      const bookingsData = await safeRequest<BackendBooking[]>(() => api.get("/admin/bookings"), () => mockDb.listBookings() as any);
      const mapped: Booking[] = bookingsData.slice(0, 6).map((b: any) => ({
        id: String(b.id),
        userId: String(b.user_id),
        userName: b.user_name || b.userName,
        providerId: String(b.provider_id),
        service: b.service,
        date: b.booking_date || b.date,
        time: b.booking_time || b.time,
        address: b.address,
        status: b.status as any,
        price: 999,
        createdAt: new Date().toISOString(),
      }));
      setRecent(mapped);
    })();
  }, []);

  const cards = [
    { label: "Total users", value: stats.totalUsers, icon: Users, change: "+12%" },
    { label: "Providers", value: stats.totalProviders, icon: HardHat, change: "+8%" },
    { label: "Bookings", value: stats.totalBookings, icon: ClipboardList, change: "+24%" },
    { label: "Revenue", value: `₹${(stats.revenue || 0).toLocaleString()}`, icon: IndianRupee, change: "+18%" },
  ];

  return (
    <AdminLayout>
      <div className="p-6 md:p-10 max-w-7xl">
        <div>
          <p className="text-sm text-muted-foreground">Operations</p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold">Dashboard</h1>
        </div>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c, i) => (
            <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-elegant transition-smooth"
            >
              <div className="flex items-start justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-cta text-primary-foreground"><c.icon className="h-5 w-5" /></div>
                <span className="inline-flex items-center text-xs font-semibold text-success"><ArrowUpRight className="h-3 w-3" /> {c.change}</span>
              </div>
              <div className="mt-5 text-sm text-muted-foreground">{c.label}</div>
              <div className="mt-1 font-display text-3xl font-extrabold">{c.value}</div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-card shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Recent bookings</h2>
            <a href="/admin/bookings" className="text-sm font-semibold text-primary hover:underline">View all</a>
          </div>
          <div className="divide-y divide-border">
            {recent.length === 0 && (
              <div className="px-6 py-8 text-center text-muted-foreground">No bookings yet.</div>
            )}
            {recent.map(b => (
              <div key={b.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-semibold">{b.service} · {b.userName}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">{b.address}</div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <StatusBadge status={b.status} />
                  <div className="font-display font-bold w-20 text-right">₹{b.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}