import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase, supabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPage,
  head: () => ({ meta: [{ title: "Forgot Password — TechLaunchpad" }, { name: "robots", content: "noindex" }] }),
});

function ForgotPage() {
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "");
    if (!supabaseConfigured) return toast.error("Supabase not configured.");
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Reset link sent. Check your email.");
  }
  return (
    <PageShell>
      <section className="container mx-auto max-w-md px-4 py-20">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h1 className="font-display text-2xl font-bold text-navy-deep">Forgot your password?</h1>
          <p className="mt-1 text-sm text-muted-foreground">We'll email you a reset link.</p>
          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required /></div>
            <Button type="submit" disabled={busy} className="w-full bg-navy text-ivory hover:bg-navy-deep">{busy ? "Sending…" : "Send Reset Link"}</Button>
          </form>
          <p className="mt-4 text-center text-sm"><Link to="/login" className="text-navy hover:text-gold">Back to login</Link></p>
        </div>
      </section>
    </PageShell>
  );
}
