import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";
import { supabase, supabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/internship/login")({
  component: InternshipLoginPage,
  head: () => ({ 
    meta: [
      { title: "Internship Login — TechLaunchpad" }
    ] 
  }),
});

function InternshipLoginPage() {
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

    let isAllowed = false;
    let actualPortal = "";

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      const role = profile?.role || "";

      // Block wrong roles immediately with specific guidance
      if (role === "candidate") {
        actualPortal = "Candidate Portal";
      } else if (role === "training") {
        actualPortal = "Training Portal";
      } else if (role === "sales") {
        actualPortal = "Sales Portal";
      } else if (role === "admin") {
        isAllowed = true; // Admins can access any portal
      } else if (role === "student") {
        isAllowed = true;
      } else {
        // Check internship_students as fallback
        const { data: studentMatch } = await supabase
          .from("internship_students")
          .select("id")
          .eq("id", data.user.id)
          .maybeSingle();
        if (studentMatch) {
          isAllowed = true;
        } else {
          // They exist but not as an internship student — check where they belong
          const { data: enrollment } = await supabase
            .from("job_campus_enrollments")
            .select("id")
            .eq("candidate_id", data.user.id)
            .maybeSingle();
          if (enrollment) actualPortal = "Candidate Portal";
        }
      }
    } catch (_) {}

    // Strict Role Enforcement
    if (!isAllowed) {
      await supabase.auth.signOut();
      setBusy(false);
      const msg = actualPortal
        ? `🚫 Access Not Allowed! Your account belongs to the ${actualPortal}. Please login from the correct portal.`
        : "🚫 Access Not Allowed! This portal is for Internship Students only. Please use the correct login portal.";
      return toast.error(msg, { duration: 6000 });
    }

    setBusy(false);
    toast.success("Welcome back to your Internship Dashboard!");
    navigate({ to: "/dashboard/student" });
  }

  return (
    <PageShell>
      <section className="container mx-auto max-w-md px-4 py-24">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="bg-gradient-to-r from-navy to-navy-deep p-6 text-center text-white">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-white/10 text-white">
              <Briefcase className="size-6" />
            </div>
            <h1 className="font-display text-2xl font-bold uppercase tracking-widest">Internship Portal</h1>
            <p className="text-xs opacity-70">STUDENT ACCESS</p>
          </div>

          <form onSubmit={onSubmit} className="p-8 space-y-5">
            <div className="space-y-1">
              <Label htmlFor="email text-xs font-bold uppercase">Email Address</Label>
              <Input id="email" name="email" type="email" placeholder="your@email.com" required className="bg-secondary/20" />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="password text-xs font-bold uppercase">Password</Label>
              <Input id="password" name="password" type="password" required className="bg-secondary/20" />
            </div>

            <Button type="submit" disabled={busy} className="w-full bg-navy py-6 text-base font-bold text-ivory hover:bg-navy-deep shadow-lg">
              {busy ? "Authenticating..." : "SIGN IN"}
            </Button>
          </form>

          <div className="border-t border-border bg-secondary/10 p-4 text-center flex flex-col gap-2">
            <Link to="/register" className="text-sm font-semibold text-navy hover:text-gold">Need an account? Register here</Link>
            <Link to="/login" className="text-xs text-muted-foreground hover:text-navy hover:underline">Return to Portal Selection</Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
