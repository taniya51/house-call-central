import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Clock, Plus } from "lucide-react";
import { UserLayout } from "@/components/layouts/UserLayout";
import { useAuth } from "@/context/AuthContext";
import { api, safeRequest } from "@/lib/api";
import { mockDb, Booking } from "@/lib/mockDb";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const data = await safeRequest<Booking[]>(
        () => api.get(`/bookings/user/${user.id}`),
        () => mockDb.bookingsForUser(user.id),
      );
      if (active) { setBookings(data); setLoading(false); }
    })();
    return () => { active = false; };
  }, [user]);

  if (!user) {
    return (
      <UserLayout>
        <div className="container py-24 text-center">
          <h1 className="font-display text-3xl font-extrabold">Sign in to see your bookings</h1>
          <Button asChild className="mt-6 bg-gradient-cta text-primary-foreground"><Link to="/login">Sign in</Link></Button>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="container py-12 md:py-16">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-primary">My bookings</h1>
            <p className="text-muted-foreground mt-1">All your past, current, and upcoming home services.</p>
          </div>
          <Button asChild className="bg-gradient-cta text-primary-foreground hover:opacity-95">
            <Link to="/book"><Plus className="mr-1 h-4 w-4" /> New booking</Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-4">
          {loading && <div className="text-muted-foreground">Loading...</div>}
          {!loading && bookings.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground">No bookings yet.</p>
              <Button asChild className="mt-4 bg-gradient-cta text-primary-foreground"><Link to="/book">Book your first service</Link></Button>
            </div>
          )}
          {bookings.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-elegant transition-smooth"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-display text-xl font-bold text-primary">{b.service}</h3>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {b.date}</span>
                    <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {b.time}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {b.address}</span>
                  </div>
                  {b.providerName && (
                    <div className="mt-3 inline-flex items-center gap-2 text-sm">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-cta text-xs font-bold text-primary-foreground">{b.providerName.charAt(0)}</span>
                      <span className="text-foreground font-medium">{b.providerName}</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-display text-2xl font-extrabold text-primary">₹{b.price}</div>
                  {(b.status === "accepted" || b.status === "in_progress") && (
                    <Button asChild variant="outline" size="sm" className="mt-3">
                      <Link to={`/track?booking=${b.id}`}>Track helper</Link>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </UserLayout>
  );
}
