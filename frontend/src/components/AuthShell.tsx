import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";

interface Props {
  title: string;
  subtitle: string;
  footer: ReactNode;
  theme?: "user" | "provider" | "admin";
  side?: ReactNode;
  children: ReactNode;
}

export function AuthShell({ title, subtitle, footer, side, children }: Props) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="flex flex-col p-6 md:p-12">
        <Logo />
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="my-auto w-full max-w-md mx-auto"
        >
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-foreground">{title}</h1>
          <p className="mt-2 text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-sm text-muted-foreground">{footer}</div>
        </motion.div>
        <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} HomeServe</div>
      </div>
      <div className="relative hidden lg:block bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary-glow)/0.35),transparent_50%)]" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative h-full flex items-end p-12 text-primary-foreground">
          {side ?? (
            <div className="max-w-md">
              <div className="text-sm uppercase tracking-widest text-primary-foreground/70">HomeServe</div>
              <h2 className="font-display text-4xl font-extrabold mt-2">Help at home, in minutes.</h2>
              <p className="mt-4 text-primary-foreground/80">Join thousands of households that trust HomeServe for everyday repairs and deep cleaning.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
