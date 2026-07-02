import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ShieldCheck, Briefcase, BookOpen, ChevronRight, UserCheck } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginSelectorPage,
  head: () => ({ meta: [{ title: "Select Login Portal — TechLaunchpad" }] }),
});

function LoginSelectorPage() {
  return (
    <PageShell>
      <section className="container mx-auto max-w-4xl px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold text-navy-deep uppercase tracking-widest">Login Portals</h1>
          <p className="mt-2 text-muted-foreground max-w-lg mx-auto">Please select your designated portal to access your dashboard. Access is strictly restricted by user type.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {/* Internship Portal Card */}
          <Link to="/internship/login" className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-navy flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-navy/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-navy/10 text-navy transition-transform group-hover:scale-110">
              <Briefcase className="size-6" />
            </div>
            <h3 className="mb-2 font-display text-lg font-bold text-navy-deep">Internship</h3>
            <p className="text-xs text-slate-500 mb-6 flex-grow">For students enrolled in internship programs.</p>
            <div className="flex items-center text-xs font-bold text-navy uppercase tracking-widest group-hover:text-gold transition-colors mt-auto">
              Access <ChevronRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Candidate Portal Card */}
          <Link to="/candidate/login" className="group relative overflow-hidden rounded-3xl border border-amber-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-amber-500 flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 transition-transform group-hover:scale-110">
              <UserCheck className="size-6" />
            </div>
            <h3 className="mb-2 font-display text-lg font-bold text-navy-deep">Candidate</h3>
            <p className="text-xs text-slate-500 mb-6 flex-grow">For job campus candidates to access career resources.</p>
            <div className="flex items-center text-xs font-bold text-amber-600 uppercase tracking-widest group-hover:text-amber-800 transition-colors mt-auto">
              Access <ChevronRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Training Portal Card */}
          <Link to="/training/login" className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-blue-600 flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 transition-transform group-hover:scale-110">
              <BookOpen className="size-6" />
            </div>
            <h3 className="mb-2 font-display text-lg font-bold text-navy-deep">Training</h3>
            <p className="text-xs text-slate-500 mb-6 flex-grow">For candidates enrolled in online learning courses.</p>
            <div className="flex items-center text-xs font-bold text-blue-600 uppercase tracking-widest group-hover:text-blue-800 transition-colors mt-auto">
              Access <ChevronRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Referral Portal Card */}
          <Link to="/referral/login" className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-green-600 flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-green-100 text-green-600 transition-transform group-hover:scale-110">
              <UserCheck className="size-6" />
            </div>
            <h3 className="mb-2 font-display text-lg font-bold text-navy-deep">Partner</h3>
            <p className="text-xs text-slate-500 mb-6 flex-grow">For referral agents to track signups and commissions.</p>
            <div className="flex items-center text-xs font-bold text-green-600 uppercase tracking-widest group-hover:text-green-800 transition-colors mt-auto">
              Access <ChevronRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

        </div>
        
        <div className="mt-12 text-center">
          <Link to="/register" className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-100 px-8 text-sm font-bold text-navy-deep transition-colors hover:bg-slate-200">
            Don't have an account? Register here
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
