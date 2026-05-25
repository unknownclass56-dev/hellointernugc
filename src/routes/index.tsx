import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { ArrowRight, Award, BadgeCheck, Briefcase, FileCheck, GraduationCap, Search, ShieldCheck, Sparkles, Star, Users } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { ApprovalBadge } from "@/components/ApprovalBadge";
import { StatCounter } from "@/components/StatCounter";
import { SectionHeader } from "@/components/SectionHeader";
import { MOCK_INTERNSHIPS, PARTNERS, STATS, TESTIMONIALS } from "@/lib/mock-data";
import hero from "@/assets/hero-illustration.jpg";
import logo from "@/assets/techlaunchpad-logo.png";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [liveInternships, setLiveInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInternships();
  }, []);

  async function fetchInternships() {
    setLoading(true);
    const { data } = await supabase
      .from("internships")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6);
    
    if (data && data.length > 0) {
      setLiveInternships(data);
    } else {
      setLiveInternships(MOCK_INTERNSHIPS.slice(0, 6));
    }
    setLoading(false);
  }

  return (
    <PageShell>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0a192f] via-[#112240] to-[#0a192f] text-ivory">
        <div className="container mx-auto grid gap-10 px-4 py-16 lg:grid-cols-2 lg:gap-6 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 flex flex-col justify-center"
          >
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
              <Sparkles className="size-3.5" /> AICTE · UGC · BSDM · ISO
            </div>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
              India's premium <span className="text-gold">internship</span> & training platform
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ivory/80 sm:text-lg">
              Industry-focused internships, government-aligned training, and verifiable certificates — all in one place.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gold text-navy-deep hover:bg-gold-soft shadow-lg">
                <Link to="/internships">Browse Internships <ArrowRight className="ml-1 size-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-ivory/30 bg-transparent text-ivory hover:bg-ivory/10">
                <Link to="/register">Create Free Account</Link>
              </Button>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur">
                  <div className="font-display text-2xl font-bold text-gold">
                    <StatCounter to={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-ivory/65">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative mx-auto max-w-xl">
              <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-gold/30 to-navy/40 blur-2xl opacity-20" />
              <img src={hero} alt="Students" width={1600} height={1024} className="relative rounded-2xl border border-white/10 shadow-2xl" />
              <div className="absolute -bottom-6 -left-4 hidden rounded-xl border border-white/10 bg-navy/90 p-4 backdrop-blur-md shadow-2xl sm:flex items-center gap-3">
                <img src={logo} alt="" className="size-10 rounded-full bg-white p-0.5" />
                <div>
                  <div className="text-xs text-ivory/70 font-bold">Verified Certificate</div>
                  <div className="font-mono text-sm text-gold">TL-IN-2026-V88X</div>
                </div>
                <BadgeCheck className="size-5 text-gold" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* APPROVALS */}
      <section className="border-y border-border bg-secondary/20">
        <div className="container mx-auto grid gap-3 px-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
          <ApprovalBadge kind="AICTE" />
          <ApprovalBadge kind="UGC" />
          <ApprovalBadge kind="BSDM" />
          <ApprovalBadge kind="ISO" />
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="container mx-auto px-4 py-20">
        <SectionHeader eyebrow="Programs" title="Internships for every ambition" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: GraduationCap, title: "AICTE Approved", desc: "Engineering and technology internships." },
            { icon: BadgeCheck, title: "UGC Approved", desc: "Research and academia programs." },
            { icon: Award, title: "BSDM Supported", desc: "Skill-first vocational training." },
            { icon: ShieldCheck, title: "ISO Certified", desc: "Quality standards 9001:2015." },
          ].map((c, i) => (
            <div key={c.title} className="rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 grid size-12 place-items-center rounded-xl bg-navy text-ivory">
                <c.icon className="size-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-navy-deep">{c.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LIVE INTERNSHIPS */}
      <section className="container mx-auto px-4 py-20 bg-secondary/10">
        <SectionHeader eyebrow="Live Now" title="Featured Opportunities" />
        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
             {[1,2,3].map(n => <div key={n} className="h-64 rounded-2xl bg-white animate-pulse border border-dashed border-navy/10" />)}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {liveInternships.map((it) => (
              <div key={it.id} className="group flex flex-col rounded-2xl border border-border bg-white p-6 shadow-sm transition-all hover:border-gold hover:shadow-xl">
                <div className="flex items-start justify-between">
                  <div className="grid size-12 place-items-center rounded-xl bg-slate-100 font-display text-xl font-black text-navy">{it.company?.[0]}</div>
                  <span className="rounded-full bg-gold/10 px-3 py-1 text-[10px] font-black uppercase text-navy tracking-widest">{it.category}</span>
                </div>
                <h3 className="mt-4 font-display text-xl font-black text-navy-deep">{it.title}</h3>
                <p className="text-xs font-bold text-muted-foreground">{it.company} · India</p>
                <div className="mt-4 flex flex-wrap gap-2">
                   <span className="bg-slate-100 px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter">{it.duration}</span>
                   <span className="bg-slate-100 px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter">{it.mode}</span>
                   <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter">{it.stipend}</span>
                </div>
                <Link to="/register" search={{ program: it.title }} className="mt-6 w-full h-12 bg-navy text-white rounded-xl flex items-center justify-center font-black uppercase text-[10px] tracking-widest hover:bg-navy-deep transition-all">
                   Enroll Now
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* TESTIMONIALS */}
      <section className="container mx-auto px-4 py-20">
        <SectionHeader eyebrow="Success Stories" title="Student Experiences" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-white p-6 rounded-2xl border shadow-sm">
               <div className="flex gap-1 text-gold mb-4">
                  {Array.from({length: t.rating}).map((_, i) => <Star key={i} size={14} className="fill-current" />)}
               </div>
               <p className="text-sm font-medium italic text-slate-600">"{t.quote}"</p>
               <div className="mt-6 pt-6 border-t">
                  <div className="font-black uppercase text-xs text-navy tracking-tight">{t.name}</div>
                  <div className="text-[10px] font-bold text-muted-foreground">{t.role}</div>
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-20">
        <div className="rounded-[3rem] bg-navy p-12 text-center text-ivory shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 size-64 bg-gold/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
           <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 relative z-10">Ready to launch your career?</h2>
           <p className="max-w-xl mx-auto text-ivory/60 mb-8 relative z-10 font-medium">Join thousands of students building real-world skills with our verified internships.</p>
           <div className="flex flex-wrap justify-center gap-4 relative z-10">
              <Button asChild size="lg" className="bg-gold text-navy-deep hover:bg-gold-soft font-black uppercase text-xs tracking-widest h-14 px-10 rounded-2xl shadow-xl">
                 <Link to="/register">Register Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 hover:bg-white/10 font-black uppercase text-xs tracking-widest h-14 px-10 rounded-2xl">
                 <Link to="/internships">Explore All</Link>
              </Button>
           </div>
           
           <div className="mt-10 pt-8 border-t border-white/10 flex flex-col items-center justify-center gap-1.5 relative z-10">
              <div className="text-[10px] font-black uppercase tracking-widest text-gold flex items-center gap-1.5">
                 <Sparkles className="size-3" /> 24/7 Help & Support
              </div>
              <p className="text-sm font-medium text-ivory/80">
                For immediate assistance and replies, email us at: <a href="mailto:techlaunchpad01@gmail.com" className="text-white font-bold hover:text-gold transition-colors underline underline-offset-4">techlaunchpad01@gmail.com</a>
              </p>
           </div>
        </div>
      </section>
    </PageShell>
  );
}
