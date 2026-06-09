import { Link, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/techlaunchpad-logo.png";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const SKIP_SUBDOMAINS = new Set(["www", "api", "mail", "smtp", "ftp", "cdn"]);

/**
 * Routes that have their own dedicated subdomain.
 * Key = route path, Value = subdomain prefix
 */
const SUBDOMAIN_ROUTES: Record<string, string> = {
  "/trainings": "trainings",
  "/counselor": "counselor",
  "/internships": "internships",
  "/blog": "blog",
  "/about": "about",
  "/contact": "contact",
  "/programs": "programs",
  "/verify": "verify",
};

/** Extract the root domain (e.g. "techlaunchpad.in") from hostname */
function getRootDomain(hostname: string): string {
  const parts = hostname.split(".");
  if (parts.length >= 3 && !SKIP_SUBDOMAINS.has(parts[0])) {
    return parts.slice(1).join(".");
  }
  return hostname;
}

/** Get main domain base URL (e.g. "https://techlaunchpad.in") */
function getMainDomainBase(hostname: string): string {
  const protocol = window.location.protocol;
  const root = getRootDomain(hostname);
  return `${protocol}//${root}`;
}

/** Build the correct href for a nav item */
function buildNavHref(to: string, hostname: string): string {
  if (typeof window === "undefined") return to;
  const root = getRootDomain(hostname);
  const protocol = window.location.protocol;
  const subdomain = SUBDOMAIN_ROUTES[to];

  if (subdomain) {
    // This route has a dedicated subdomain → use it
    return `${protocol}//${subdomain}.${root}`;
  }
  // No subdomain for this route → use main domain
  return `${protocol}//${root}${to}`;
}

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/programs", label: "Programs" },
  { to: "/internships", label: "Internships" },
  { to: "/trainings", label: "Trainings" },
  { to: "/counselor", label: "Counselor" },
  { to: "/verify", label: "Verify Certificate" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { pathname } = useRouterState({ select: (s) => s.location });
  const { session, role } = useAuth();
  const dashboard =
    role === "admin" ? "/dashboard/admin" : role === "company" ? "/dashboard/company" : "/dashboard/student";

  const [hostname, setHostname] = useState<string>("");

  useEffect(() => {
    setHostname(window.location.hostname);
  }, []);

  const isOnSubdomain = hostname
    ? hostname.split(".").length >= 3 && !SKIP_SUBDOMAINS.has(hostname.split(".")[0])
    : false;

  const mainBase = hostname ? getMainDomainBase(hostname) : null;

  const href = (to: string) =>
    hostname ? buildNavHref(to, hostname) : to;

  const logoHref = hostname ? `${mainBase}/` : null;
  const dashboardHref = isOnSubdomain && mainBase ? `${mainBase}${dashboard}` : null;
  const loginHref = isOnSubdomain && mainBase ? `${mainBase}/login` : null;
  const registerHref = isOnSubdomain && mainBase ? `${mainBase}/register` : null;

  const isActive = (to: string) =>
    pathname === to || (to !== "/" && pathname.startsWith(to));

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

          {/* Logo → always goes to main domain home */}
          {logoHref ? (
            <a href={logoHref} className="flex items-center gap-3">
              <img src={logo} alt="TechLaunchpad" className="h-11 w-11 object-contain" />
              <div className="leading-tight">
                <div className="font-display text-lg font-bold text-navy-deep">TechLaunchpad</div>
                <div className="text-[10px] tracking-[0.2em] text-gold">LEARN · GROW · LAUNCH.</div>
              </div>
            </a>
          ) : (
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="TechLaunchpad" className="h-11 w-11 object-contain" />
              <div className="leading-tight">
                <div className="font-display text-lg font-bold text-navy-deep">TechLaunchpad</div>
                <div className="text-[10px] tracking-[0.2em] text-gold">LEARN · GROW · LAUNCH.</div>
              </div>
            </Link>
          )}

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <a
                key={n.to}
                href={hostname ? href(n.to) : n.to}
                className={cn(
                  "relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive(n.to) ? "text-navy-deep" : "text-muted-foreground hover:text-navy-deep",
                )}
              >
                {n.label}
                {isActive(n.to) && (
                  <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gold" />
                )}
              </a>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden items-center gap-2 lg:flex">
            {session ? (
              <Button asChild className="bg-navy hover:bg-navy-deep text-ivory">
                {dashboardHref ? (
                  <a href={dashboardHref}>Dashboard</a>
                ) : (
                  <Link to={dashboard}>Dashboard</Link>
                )}
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost">
                  {loginHref ? <a href={loginHref}>Login</a> : <Link to="/login">Login</Link>}
                </Button>
                <Button asChild className="bg-gold text-navy-deep hover:bg-gold-soft">
                  {registerHref ? <a href={registerHref}>Register</a> : <Link to="/register">Register</Link>}
                </Button>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button onClick={() => setOpen((o) => !o)} className="rounded-md p-2 lg:hidden" aria-label="Menu">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="border-t border-border bg-background lg:hidden">
            <div className="container mx-auto flex flex-col gap-1 px-4 py-3">
              {NAV.map((n) => (
                <a
                  key={n.to}
                  href={hostname ? href(n.to) : n.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium",
                    isActive(n.to) ? "bg-secondary text-navy-deep" : "text-muted-foreground",
                  )}
                >
                  {n.label}
                </a>
              ))}
              <div className="mt-2 flex gap-2">
                {session ? (
                  <Button asChild className="flex-1 bg-navy text-ivory">
                    {dashboardHref ? (
                      <a href={dashboardHref} onClick={() => setOpen(false)}>Dashboard</a>
                    ) : (
                      <Link to={dashboard} onClick={() => setOpen(false)}>Dashboard</Link>
                    )}
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="outline" className="flex-1">
                      {loginHref ? (
                        <a href={loginHref} onClick={() => setOpen(false)}>Login</a>
                      ) : (
                        <Link to="/login" onClick={() => setOpen(false)}>Login</Link>
                      )}
                    </Button>
                    <Button asChild className="flex-1 bg-gold text-navy-deep hover:bg-gold-soft">
                      {registerHref ? (
                        <a href={registerHref} onClick={() => setOpen(false)}>Register</a>
                      ) : (
                        <Link to="/register" onClick={() => setOpen(false)}>Register</Link>
                      )}
                    </Button>
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
