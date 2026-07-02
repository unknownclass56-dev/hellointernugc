import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { supabase, supabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/referral/login")({
  component: ReferralLoginPage,
  head: () => ({
    meta: [{ title: "Partner Login — TechLaunchpad" }],
  }),
});

function ReferralLoginPage() {
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
      if (error.status === 500 || error.message?.toLowerCase().includes('internal')) {
        return toast.error(
          "Login failed. Please try again or contact support at support@techlaunchpad.in",
          { duration: 6000 }
        );
      }
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

      const profileRole = profile?.role || "";
      const metaRole = data.user?.user_metadata?.role || "";
      const role = profileRole || metaRole;

      if (role === "admin" || role === "referral") {
        isAllowed = true;
      } else if (role === "student") {
        actualPortal = "Internship Portal";
      } else if (role === "training") {
        actualPortal = "Training Portal";
      } else if (role === "candidate") {
        actualPortal = "Candidate Portal";
      } else if (role === "sales") {
        actualPortal = "Sales Portal";
      }
    } catch (_) {}

    if (!isAllowed) {
      await supabase.auth.signOut();
      setBusy(false);
      const msg = actualPortal
        ? `🚫 Access Not Allowed! Your account belongs to the ${actualPortal}. Please login from the correct portal.`
        : "🚫 Access Not Allowed! This portal is for Referral Partners only.";
      return toast.error(msg, { duration: 6000 });
    }

    setBusy(false);
    toast.success("Welcome to your Partner Dashboard!");
    navigate({ to: "/dashboard/referral" });
  }

  return (
    <PageShell>
      <section className="container mx-auto max-w-md px-4 py-24">
        <div className="overflow-hidden rounded-2xl border border-green-200 bg-card shadow-2xl">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-center text-white">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-white/20 text-white">
              <ShieldCheck className="size-6" />
            </div>
            <h1 className="font-display text-2xl font-bold uppercase tracking-widest">Partner Portal</h1>
            <p className="text-xs opacity-80">REFERRAL AGENT ACCESS</p>
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
              className="w-full bg-green-600 hover:bg-green-700 py-6 text-base font-bold text-white shadow-lg"
            >
              {busy ? "Authenticating..." : "SIGN IN"}
            </Button>
          </form>

          <div className="border-t border-border bg-secondary/10 p-4 text-center">
            <Link to="/login" className="text-xs text-muted-foreground hover:text-navy hover:underline">
              Return to Portal Selection
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
