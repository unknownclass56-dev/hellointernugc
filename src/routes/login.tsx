import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase, supabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Login — UGC INTERN" }, { name: "robots", content: "noindex" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    if (!supabaseConfigured) {
      toast.error("Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    const role = (data.user?.user_metadata?.role as string) ?? "student";
    toast.success("Welcome back!");
    navigate({ to: role === "admin" ? "/dashboard/admin" : role === "company" ? "/dashboard/company" : "/dashboard/student" });
  }

  return (
    <PageShell>
      <section className="container mx-auto max-w-md px-4 py-20">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-elegant)]">
          <h1 className="font-display text-3xl font-bold text-navy-deep">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your UGC INTERN account.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required /></div>
            <div><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" required /></div>
            <Button type="submit" disabled={busy} className="w-full bg-navy text-ivory hover:bg-navy-deep">{busy ? "Signing in…" : "Sign In"}</Button>
          </form>
          <div className="mt-4 flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="text-muted-foreground hover:text-navy">Forgot password?</Link>
            <Link to="/register" className="font-semibold text-navy hover:text-gold">Create account</Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
