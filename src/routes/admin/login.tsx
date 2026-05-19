import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { supabase, supabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
  head: () => ({ 
    meta: [
      { title: "Admin Login — TechLaunchpad" }, 
      { name: "robots", content: "noindex" }
    ] 
  }),
});

function AdminLoginPage() {
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

    const role = (data.user?.user_metadata?.role as string) ?? "student";
    
    if (role !== "admin") {
      await supabase.auth.signOut();
      setBusy(false);
      return toast.error("Access denied. You do not have administrator privileges.");
    }

    setBusy(false);
    toast.success("Welcome, Admin!");
    navigate({ to: "/dashboard/admin" });
  }

  return (
    <PageShell>
      <section className="container mx-auto max-w-md px-4 py-24">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="bg-navy p-6 text-center text-white">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-gold/20 text-gold">
              <ShieldCheck className="size-6" />
            </div>
            <h1 className="font-display text-2xl font-bold uppercase tracking-widest">Admin Access</h1>
            <p className="text-xs opacity-70">AUTHORIZED PERSONNEL ONLY</p>
          </div>

          <form onSubmit={onSubmit} className="p-8 space-y-5">
            <div className="space-y-1">
              <Label htmlFor="email text-xs font-bold uppercase">Administrator Email</Label>
              <Input id="email" name="email" type="email" placeholder="support@techlaunchpad.in" required className="bg-secondary/20" />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="password text-xs font-bold uppercase">Secret Password</Label>
              <Input id="password" name="password" type="password" required className="bg-secondary/20" />
            </div>

            <Button type="submit" disabled={busy} className="w-full bg-navy py-6 text-base font-bold text-ivory hover:bg-navy-deep shadow-lg">
              {busy ? "Authenticating..." : "VERIFY & LOGIN"}
            </Button>
          </form>

          <div className="border-t border-border bg-secondary/10 p-4 text-center">
            <a href="/" className="text-xs text-muted-foreground hover:text-navy hover:underline">Return to public site</a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
