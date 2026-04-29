import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Phone, MessageCircle, Navigation } from "lucide-react";
import { UserLayout } from "@/components/layouts/UserLayout";
import { useAuth } from "@/context/AuthContext";
import { Booking, mockDb } from "@/lib/mockDb";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";

export default function TrackHelper() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [eta, setEta] = useState(18);
  const [progress, setProgress] = useState(35);

  const booking = useMemo<Booking | undefined>(() => {
    if (!user) return;
    const list = mockDb.bookingsForUser(user.id);
    const id = params.get("booking");
    return list.find(b => b.id === id) ?? list.find(b => b.status === "accepted" || b.status === "in_progress") ?? list[0];
  }, [user, params]);

  useEffect(() => {
    const t = setInterval(() => {
      setEta(e => Math.max(1, e - 1));
      setProgress(p => Math.min(95, p + 2));
    }, 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <UserLayout>
      <div className="container py-10 md:py-14">
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-primary">Track helper</h1>
        <p className="text-muted-foreground mt-1">Live location updates from your HomeServe pro.</p>

        <div className="mt-8 grid lg:grid-cols-[1fr_380px] gap-6">
          {/* MAP PLACEHOLDER */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="relative h-[480px] overflow-hidden rounded-2xl border border-border bg-card shadow-card"
          >
            {/* Stylized map */}
            <div className="absolute inset-0 bg-[linear-gradient(135deg,hsl(200_70%_92%),hsl(210_60%_96%))]">
              <svg className="absolute inset-0 h-full w-full opacity-60" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                {/* Roads */}
                <path d="M0 320 Q 200 280 400 340 T 900 300" stroke="hsl(var(--accent))" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.5" />
                <path d="M120 0 L 180 200 L 240 400 L 320 600" stroke="hsl(var(--primary))" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.4" />
                <path d="M600 0 L 580 220 L 640 400 L 700 620" stroke="hsl(var(--primary))" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.4" />
              </svg>
            </div>

            {/* Helper pin */}
            <motion.div
              initial={{ x: 60, y: 320 }} animate={{ x: 280, y: 220 }} transition={{ duration: 18, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
              className="absolute"
            >
              <div className="relative">
                <div className="absolute inset-0 -m-3 rounded-full bg-accent/30 animate-ping" />
                <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-cta text-primary-foreground shadow-glow">
                  <Navigation className="h-5 w-5" />
                </div>
              </div>
            </motion.div>

            {/* User pin */}
            <div className="absolute right-16 bottom-20">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-elegant">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-card border border-border px-2 py-1 text-xs font-semibold shadow-card">
                Your address
              </div>
            </div>

            {/* ETA badge */}
            <div className="absolute top-4 left-4 rounded-2xl bg-card/95 backdrop-blur border border-border px-4 py-3 shadow-card">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">ETA</div>
              <div className="font-display text-2xl font-extrabold text-primary">{eta} min</div>
            </div>
          </motion.div>

          {/* SIDEBAR */}
          <div className="space-y-4">
            {booking ? (
              <>
                <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <div className="font-display text-xl font-bold">{booking.service}</div>
                    <StatusBadge status={booking.status} />
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{booking.date} · {booking.time}</div>
                  <div className="text-sm text-muted-foreground mt-2 flex items-start gap-1.5">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" /> {booking.address}
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-cta text-primary-foreground font-bold">
                      {(booking.providerName ?? "Pro").charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold">{booking.providerName ?? "Matching a pro..."}</div>
                      <div className="text-xs text-muted-foreground">★ 4.9 · 320 jobs</div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" className="flex-1"><Phone className="mr-2 h-4 w-4" /> Call</Button>
                    <Button variant="outline" className="flex-1"><MessageCircle className="mr-2 h-4 w-4" /> Chat</Button>
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                  <div className="text-sm font-semibold mb-3">Trip progress</div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <motion.div className="h-full bg-gradient-cta" animate={{ width: `${progress}%` }} transition={{ duration: 1 }} />
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">Pro is on the way to your location.</div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
                No active booking to track.
              </div>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
