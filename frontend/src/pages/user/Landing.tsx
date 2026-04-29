import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Bolt, Wrench, Hammer, Sparkles, PaintRoller, ShieldCheck, Clock, Star, MapPin, BadgeCheck } from "lucide-react";
import { UserLayout } from "@/components/layouts/UserLayout";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero.jpg";

export const SERVICES = [
  { name: "Electrician", icon: Bolt, desc: "Wiring, fans, fittings, repairs", from: 799, hue: "from-amber-400/20 to-amber-500/5" },
  { name: "Plumber", icon: Wrench, desc: "Leaks, taps, blockages, fittings", from: 599, hue: "from-sky-400/20 to-sky-500/5" },
  { name: "Carpenter", icon: Hammer, desc: "Furniture, doors, woodwork", from: 899, hue: "from-orange-400/20 to-orange-500/5" },
  { name: "Cleaner", icon: Sparkles, desc: "Deep cleaning, kitchen, bath", from: 1299, hue: "from-emerald-400/20 to-emerald-500/5" },
  { name: "Painter", icon: PaintRoller, desc: "Walls, ceilings, touch-ups", from: 1499, hue: "from-violet-400/20 to-violet-500/5" },
];

const HighlightItem = ({ icon: Icon, title, desc }: { icon: typeof ShieldCheck; title: string; desc: string }) => (
  <div className="flex gap-4">
    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{desc}</p>
    </div>
  </div>
);

export default function Landing() {
  return (
    <UserLayout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-soft" />
        <div className="absolute -top-32 -right-32 -z-10 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

        <div className="container grid lg:grid-cols-2 gap-12 items-center py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-card">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse-soft" />
              Trusted by 50,000+ homes across India
            </div>
            <h1 className="mt-5 font-display text-4xl md:text-6xl font-extrabold leading-[1.05] text-primary">
              Home help, <span className="text-gradient">handled.</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl">
              Vetted electricians, plumbers, carpenters, cleaners and painters — booked in minutes,
              tracked in real-time, backed by the HomeServe quality guarantee.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gradient-cta text-primary-foreground shadow-glow hover:opacity-95">
                <Link to="/book">Book a service <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/provider/register">Become a provider</Link>
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              {[
                { k: "50K+", v: "Jobs completed" },
                { k: "4.9★", v: "Average rating" },
                { k: "<30m", v: "Avg response" },
              ].map(s => (
                <div key={s.k}>
                  <div className="text-2xl font-display font-extrabold text-primary">{s.k}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.v}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-elegant border border-border">
              <img src={heroImage} alt="Friendly HomeServe professional with a toolbox in a modern living room" width={1536} height={1280} className="w-full h-auto" />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 via-transparent to-transparent" />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="absolute -left-4 bottom-8 hidden md:flex items-center gap-3 rounded-2xl bg-card border border-border p-3 pr-4 shadow-card"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-success/15 text-success"><BadgeCheck className="h-5 w-5" /></div>
              <div>
                <div className="text-sm font-semibold">Verified pro on the way</div>
                <div className="text-xs text-muted-foreground">ETA 18 min · Live tracking</div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
              className="absolute -right-2 top-8 hidden md:flex items-center gap-3 rounded-2xl bg-card border border-border p-3 pr-4 shadow-card"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-warning/20 text-warning"><Star className="h-5 w-5 fill-current" /></div>
              <div>
                <div className="text-sm font-semibold">4.9 / 5</div>
                <div className="text-xs text-muted-foreground">From 12,400 reviews</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="container py-16 md:py-24">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">Our services</p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-extrabold text-primary">Every job around the house.</h2>
          </div>
          <p className="text-muted-foreground max-w-md">Pick a category to see live pricing and book a vetted professional.</p>
        </div>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                to={`/book?service=${encodeURIComponent(s.name)}`}
                className="group relative block overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card transition-smooth hover:shadow-elegant hover:-translate-y-1"
              >
                <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${s.hue} opacity-0 group-hover:opacity-100 transition-smooth`} />
                <div className="flex items-start justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground shadow-card">
                    <s.icon className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">From</div>
                    <div className="font-display text-lg font-bold text-primary">₹{s.from}</div>
                  </div>
                </div>
                <h3 className="mt-5 font-display text-xl font-bold">{s.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                <div className="mt-5 inline-flex items-center text-sm font-semibold text-accent">
                  Book now <ArrowRight className="ml-1 h-4 w-4 transition-smooth group-hover:translate-x-1" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-secondary/40 border-y border-border/60">
        <div className="container py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">Why HomeServe</p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-extrabold text-primary">A better way to fix things at home.</h2>
            <p className="mt-4 text-muted-foreground">No more sketchy phone numbers. Get the right pro for the job, with transparent pricing and a quality guarantee.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <HighlightItem icon={ShieldCheck} title="Background-verified pros" desc="Every professional is ID-verified and rated." />
            <HighlightItem icon={Clock} title="On-time, every time" desc="Real-time ETA & live job tracking." />
            <HighlightItem icon={MapPin} title="Right at your door" desc="Available across 60+ cities." />
            <HighlightItem icon={Star} title="Quality guarantee" desc="Free re-do if you're not satisfied." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-16 md:py-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-10 md:p-16 text-primary-foreground shadow-elegant">
          <div className="absolute -right-16 -top-16 h-80 w-80 rounded-full bg-accent/40 blur-3xl" />
          <div className="relative max-w-2xl">
            <h2 className="font-display text-3xl md:text-5xl font-extrabold leading-tight">Ready to get something fixed?</h2>
            <p className="mt-4 text-primary-foreground/80 text-lg">Book in under a minute. Pay only after the job is done.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-background text-primary hover:bg-background/90">
                <Link to="/book">Book a service</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/register">Create free account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}
