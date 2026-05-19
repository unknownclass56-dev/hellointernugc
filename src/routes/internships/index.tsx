import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/internships/")({
  component: InternshipsIndex,
  head: () => ({
    meta: [
      { title: "Internships — TechLaunchpad" },
      { name: "description", content: "Browse live AICTE, UGC, BSDM and ISO aligned internships across India. Filter by category, duration and mode." },
      { property: "og:url", content: "/internships" },
    ],
    links: [{ rel: "canonical", href: "/internships" }],
  }),
});

function InternshipsIndex() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const [mode, setMode] = useState<"All" | "Remote" | "Hybrid" | "Onsite">("All");
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInternships() {
      setLoading(true);
      const { data, error } = await supabase
        .from("internships")
        .select("*")
        .eq("approved", true)
        .order("created_at", { ascending: false });
      
      if (!error && data) {
        setInternships(data);
      }
      setLoading(false);
    }
    fetchInternships();
  }, []);

  const filtered = useMemo(() => internships.filter((i) =>
    (cat === "All" || i.category === cat) &&
    (mode === "All" || i.mode === mode) &&
    (i.title.toLowerCase().includes(q.toLowerCase()) || i.company.toLowerCase().includes(q.toLowerCase()))
  ), [internships, q, cat, mode]);

  return (
    <PageShell>
      <section className="bg-gradient-to-b from-navy-deep to-navy py-14 text-ivory">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Find your internship</h1>
          <p className="mt-2 text-ivory/75">Curated, approved opportunities updated weekly.</p>

          <div className="mt-7 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur md:grid-cols-[2fr_1fr_1fr]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ivory/60" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search role or company..." className="pl-10 bg-white/10 border-white/15 text-ivory placeholder:text-ivory/50" />
            </div>
            <select value={cat} onChange={(e) => setCat(e.target.value as typeof CATEGORIES[number])} className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm text-ivory">
              {CATEGORIES.map((c) => <option key={c} value={c} className="text-foreground">{c}</option>)}
            </select>
            <select value={mode} onChange={(e) => setMode(e.target.value as typeof mode)} className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm text-ivory">
              {["All", "Remote", "Hybrid", "Onsite"].map((m) => <option key={m} value={m} className="text-foreground">{m}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="mb-5 text-sm text-muted-foreground">
          {loading ? "Searching for opportunities..." : `${filtered.length} internships found`}
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-10 animate-spin text-navy/20" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((it, i) => (
                <motion.div key={it.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:border-gold hover:shadow-[var(--shadow-elegant)]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="grid size-12 place-items-center rounded-xl bg-secondary font-display text-xl font-bold text-navy">{it.company.charAt(0)}</div>
                    <div className="flex flex-wrap gap-1">
                      {it.tags.map((t) => <span key={t} className="rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10px] font-medium text-navy">{t}</span>)}
                    </div>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-navy-deep">{it.title}</h3>
                  <p className="text-sm text-muted-foreground">{it.company} · {it.location}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-md bg-secondary px-2 py-1">{it.duration}</span>
                    <span className="rounded-md bg-secondary px-2 py-1">{it.mode}</span>
                    <span className="rounded-md bg-secondary px-2 py-1">{it.stipend}</span>
                  </div>
                  <Link to="/register" search={{ program: it.category }} className="mt-5 inline-flex items-center justify-center rounded-md bg-navy py-2 text-sm font-medium text-ivory hover:bg-navy-deep">View & Apply</Link>
                </motion.div>
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
                No internships match your filters. Try clearing them.
              </div>
            )}
          </>
        )}
      </section>
    </PageShell>
  );
}
