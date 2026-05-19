import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase, supabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/reset-password")({
  component: ResetPage,
  head: () => ({ meta: [{ title: "Reset Password — TechLaunchpad" }, { name: "robots", content: "noindex" }] }),
});

function ResetPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password") ?? "");
    if (!supabaseConfigured) return toast.error("Supabase not configured.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated. Please sign in.");
    navigate({ to: "/login" });
  }
  return (
    <PageShell>
      <section className="container mx-auto max-w-md px-4 py-20">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h1 className="font-display text-2xl font-bold text-navy-deep">Set a new password</h1>
          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <div><Label htmlFor="password">New password</Label><Input id="password" name="password" type="password" required minLength={8} /></div>
            <Button type="submit" disabled={busy} className="w-full bg-navy text-ivory hover:bg-navy-deep">{busy ? "Updating…" : "Update Password"}</Button>
          </form>
        </div>
      </section>
    </PageShell>
  );
}
