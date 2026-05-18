import { ShieldCheck, Award, GraduationCap, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = {
  AICTE: GraduationCap,
  UGC: BadgeCheck,
  BSDM: Award,
  ISO: ShieldCheck,
} as const;

const COPY: Record<keyof typeof ICONS, { title: string; sub: string }> = {
  AICTE: { title: "AICTE Approved", sub: "All India Council Aligned" },
  UGC: { title: "UGC Approved", sub: "University Grants Commission" },
  BSDM: { title: "BSDM Supported", sub: "Skill Development Mission" },
  ISO: { title: "ISO Certified", sub: "Quality Standards 9001:2015" },
};

interface Props {
  kind: keyof typeof ICONS;
  className?: string;
  variant?: "light" | "dark";
}

export function ApprovalBadge({ kind, className, variant = "light" }: Props) {
  const Icon = ICONS[kind];
  const c = COPY[kind];
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl px-4 py-3 transition-transform hover:-translate-y-0.5",
        variant === "light"
          ? "glass shadow-sm"
          : "border border-white/15 bg-white/5 text-white",
        className,
      )}
    >
      <div className={cn(
        "grid size-12 place-items-center rounded-lg",
        variant === "light" ? "bg-navy text-ivory" : "bg-gold text-navy-deep",
      )}>
        <Icon className="size-6" />
      </div>
      <div className="leading-tight">
        <div className={cn("text-sm font-semibold", variant === "light" ? "text-navy" : "text-ivory")}>{c.title}</div>
        <div className={cn("text-xs", variant === "light" ? "text-muted-foreground" : "text-ivory/70")}>{c.sub}</div>
      </div>
    </div>
  );
}
