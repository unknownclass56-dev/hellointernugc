import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserCheck } from "lucide-react";
import { supabase, supabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/candidate/login")({
  component: CandidateLoginPage,
  head: () => ({
    meta: [{ title: "Candidate Login — TechLaunchpad" }],
  }),
});

function CandidateLoginPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");

    if (!supabaseConfigured) {
      toast.error("Supabase not configured.");
      return;
    }

    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setBusy(false);
      return toast.error(error.message);
    }

    let isCandidate = false;
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      const role = profile?.role;

      if (role === "admin") {
        // Admins can access everything
        isCandidate = true;
      } else if (role === "candidate") {
        isCandidate = true;
      } else {
        // Also check job_campus_enrollments as a fallback
        const { data: enrollment } = await supabase
          .from("job_campus_enrollments")
          .select("id")
          .eq("candidate_id", data.user.id)
          .maybeSingle();
        if (enrollment) {
          isCandidate = true;
        }
      }
    } catch (_) {}

    if (!isCandidate) {
      await supabase.auth.signOut();
      setBusy(false);
      return toast.error("Access denied. This portal is for Job Campus Candidates only. Please use the correct login portal.");
    }

    setBusy(false);
    toast.success("Welcome to your Candidate Dashboard!");
    navigate({ to: "/dashboard/candidate" });
  }

  return (
    <PageShell>
      <section className="container mx-auto max-w-md px-4 py-24">
        <div className="overflow-hidden rounded-2xl border border-amber-200 bg-card shadow-2xl">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-center text-white">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-white/20 text-white">
              <UserCheck className="size-6" />
            </div>
            <h1 className="font-display text-2xl font-bold uppercase tracking-widest">Candidate Portal</h1>
            <p className="text-xs opacity-80">JOB CAMPUS ACCESS</p>
          </div>

          <form onSubmit={onSubmit} className="p-8 space-y-5">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs font-bold uppercase">Email Address</Label>
              <Input id="email" name="email" type="email" placeholder="your@email.com" required className="bg-secondary/20" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-xs font-bold uppercase">Password</Label>
              <Input id="password" name="password" type="password" required className="bg-secondary/20" />
            </div>

            <Button
              type="submit"
              disabled={busy}
              className="w-full bg-amber-500 hover:bg-amber-600 py-6 text-base font-bold text-white shadow-lg"
            >
              {busy ? "Authenticating..." : "SIGN IN"}
            </Button>
          </form>

          <div className="border-t border-border bg-secondary/10 p-4 text-center flex flex-col gap-2">
            <Link to="/job-campus" className="text-sm font-semibold text-amber-600 hover:text-amber-800">
              New to Job Campus? Apply here
            </Link>
            <Link to="/login" className="text-xs text-muted-foreground hover:text-navy hover:underline">
              Return to Portal Selection
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
