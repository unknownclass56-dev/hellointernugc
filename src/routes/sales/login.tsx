import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase, supabaseConfigured } from "@/lib/supabase";

import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/sales/login")({
  component: SalesLogin,
});

function SalesLogin() {
  const navigate = useNavigate();
  if (!supabaseConfigured) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-white">Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in a .env file.</p>
      </div>
    );
  }
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const { error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password: trimmedPassword });
    if (error) {
      toast.error(error.message);
    } else {
      const { data: { session } } = await supabase.auth.getSession();
      const role = session?.user?.user_metadata?.role as string;
      if (role === "sales") {
        navigate({ to: "/dashboard/sales" });
      } else {
        toast.warning("You are not assigned a sales role.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <Card className="w-full max-w-md bg-gradient-to-br from-gray-800 to-gray-700 text-white p-6 rounded-xl shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Sales Team Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
