import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/techlaunchpad-logo.png";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/programs", label: "Programs" },
  { to: "/internships", label: "Internships" },
  { to: "/trainings", label: "Trainings" },
  { to: "/verify", label: "Verify Certificate" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { pathname } = useRouterState({ select: (s) => s.location });
  const { session, role } = useAuth();
  const dashboard = role === "admin" ? "/dashboard/admin" : role === "company" ? "/dashboard/company" : "/dashboard/student";

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="bg-navy-deep text-ivory/80 text-xs">
        <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-1.5">
          <span className="hidden sm:inline">UGC Guided · AICTE Aligned · ISO Certified · BSDM Supported</span>
          <span>support@techlaunchpad.in</span>
        </div>
      </div>
      <div className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="TechLaunchpad" className="h-11 w-11 object-contain" />
            <div className="leading-tight">
              <div className="font-display text-lg font-bold text-navy-deep">TechLaunchpad</div>
              <div className="text-[10px] tracking-[0.2em] text-gold">LEARN · GROW · LAUNCH.</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === n.to
                    ? "text-navy-deep"
                    : "text-muted-foreground hover:text-navy-deep",
                )}
              >
                {n.label}
                {pathname === n.to && (
                  <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gold" />
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {session ? (
              <Button asChild className="bg-navy hover:bg-navy-deep text-ivory">
                <Link to={dashboard}>Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost"><Link to="/login">Login</Link></Button>
                <Button asChild className="bg-gold text-navy-deep hover:bg-gold-soft">
                  <Link to="/register">Register</Link>
                </Button>
              </>
            )}
          </div>

          <button onClick={() => setOpen((o) => !o)} className="rounded-md p-2 lg:hidden" aria-label="Menu">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-border bg-background lg:hidden">
            <div className="container mx-auto flex flex-col gap-1 px-4 py-3">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium",
                    pathname === n.to ? "bg-secondary text-navy-deep" : "text-muted-foreground",
                  )}
                >
                  {n.label}
                </Link>
              ))}
              <div className="mt-2 flex gap-2">
                {session ? (
                  <Button asChild className="flex-1 bg-navy text-ivory"><Link to={dashboard} onClick={() => setOpen(false)}>Dashboard</Link></Button>
                ) : (
                  <>
                    <Button asChild variant="outline" className="flex-1"><Link to="/login" onClick={() => setOpen(false)}>Login</Link></Button>
                    <Button asChild className="flex-1 bg-gold text-navy-deep hover:bg-gold-soft"><Link to="/register" onClick={() => setOpen(false)}>Register</Link></Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
