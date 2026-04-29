import { Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Logo({ className, to = "/" }: { className?: string; to?: string }) {
  return (
    <Link to={to} className={cn("inline-flex items-center gap-2 font-display font-extrabold tracking-tight", className)}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-cta text-primary-foreground shadow-glow">
        <Wrench className="h-5 w-5" strokeWidth={2.4} />
      </span>
      <span className="text-xl">
        Home<span className="text-gradient">Serve</span>
      </span>
    </Link>
  );
}
