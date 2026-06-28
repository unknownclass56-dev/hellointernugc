import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

// Server‑side endpoint (requires Supabase service key) to create a sales‑team user.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { email, password, full_name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }
  // Use Supabase admin API to create user with role "sales"
  const { data, error } = await supabase.auth.api.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "sales", full_name },
  });
  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json({ user: data });
}
