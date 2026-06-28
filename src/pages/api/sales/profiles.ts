import { createHandler } from "@/lib/api-handler"; // placeholder for any generic handler utilities
import { supabase } from "@/lib/supabase";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { data, error } = await supabase.from("profiles").select("*, sales_notes(*)");
  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json(data);
}
