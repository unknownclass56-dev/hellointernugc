import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { supabase, supabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/training/login")({
  component: TrainingLoginPage,
  head: () => ({ 
    meta: [
      { title: "Training Login — TechLaunchpad" }
    ] 
  }),
});

function TrainingLoginPage() {
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

    let isTrainingStudent = false;
    let role = "student";
    try {
      // Check if user is admin or training in profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();
      if (profile?.role) role = profile.role;

      if (role === "admin" || role === "training") {
        isTrainingStudent = true;
      } else {
        // Fallback check: check if they have a training enrollment
        const { data: hasEnrollment } = await supabase
          .from("training_enrollments")
          .select("id")
          .eq("student_id", data.user.id)
          .maybeSingle();
        
        if (hasEnrollment) {
          isTrainingStudent = true;
        } else {
          // Check training leads table
          const { data: hasLead } = await supabase
            .from("training_leads")
            .select("id")
            .eq("student_id", data.user.id)
            .eq("status", "claimed")
            .maybeSingle();
          if (hasLead) {
            isTrainingStudent = true;
          }
        }
      }
    } catch (_) {}

    // Strict Role Enforcement
    if (!isTrainingStudent) {
      await supabase.auth.signOut();
      setBusy(false);
      return toast.error("Access denied. Please use the correct login portal for your program type.");
    }

    setBusy(false);
    toast.success("Welcome back to your Training Dashboard!");
    navigate({ to: "/dashboard/training", search: { tab: "learning" } });
  }

  return (
    <PageShell>
      <section className="container mx-auto max-w-md px-4 py-24">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-6 text-center text-white">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-white/10 text-white">
              <BookOpen className="size-6" />
            </div>
            <h1 className="font-display text-2xl font-bold uppercase tracking-widest">Training Portal</h1>
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

            <Button type="submit" disabled={busy} className="w-full bg-blue-800 py-6 text-base font-bold text-white hover:bg-blue-900 shadow-lg">
              {busy ? "Authenticating..." : "SIGN IN"}
            </Button>
          </form>

          <div className="border-t border-border bg-secondary/10 p-4 text-center flex flex-col gap-2">
            <Link to="/trainings" className="text-sm font-semibold text-blue-700 hover:text-blue-900">Browse Trainings to Register</Link>
            <Link to="/login" className="text-xs text-muted-foreground hover:text-navy hover:underline">Return to Portal Selection</Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
