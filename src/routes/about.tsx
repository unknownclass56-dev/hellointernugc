import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Building2, Compass, Eye, Goal, HeartHandshake, History, Sparkles, Users } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { SectionHeader } from "@/components/SectionHeader";
import { ApprovalBadge } from "@/components/ApprovalBadge";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About Us — UGC INTERN" },
      { name: "description", content: "UGC INTERN's mission is to make industry-aligned internships accessible to every Indian student through AICTE, UGC, BSDM and ISO frameworks." },
      { property: "og:title", content: "About — UGC INTERN" },
      { property: "og:description", content: "Our mission, vision and the people behind India's premium internship platform." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
});

function AboutPage() {
  return (
    <PageShell>
      <section className="bg-gradient-to-b from-navy-deep to-navy py-20 text-ivory">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold">About UGC INTERN</div>
          <h1 className="font-display text-4xl font-bold text-balance sm:text-5xl">Building India's most trusted bridge between students and industry</h1>
          <p className="mx-auto mt-5 max-w-2xl text-ivory/80">A platform built by educators, technologists and policymakers — for the next generation of Indian professionals.</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          {[
            { icon: Goal, title: "Our Mission", text: "To make industry-aligned internships and verifiable certification accessible to every student in India — from Tier-1 institutes to remote campuses." },
            { icon: Eye, title: "Our Vision", text: "A future where every graduate enters the workforce with at least one meaningful, certified internship to their name." },
          ].map((c) => (
            <motion.div key={c.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <div className="grid size-12 place-items-center rounded-xl bg-navy text-ivory mb-4"><c.icon className="size-6" /></div>
              <h3 className="font-display text-2xl font-bold text-navy-deep">{c.title}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{c.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-secondary/40 py-20">
        <div className="container mx-auto px-4">
          <SectionHeader eyebrow="Our Values" title="What we stand for" />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: HeartHandshake, title: "Trust", text: "Every internship is verified. Every certificate is checkable." },
              { icon: Sparkles, title: "Quality", text: "Curated programs aligned with national educational frameworks." },
              { icon: Users, title: "Inclusion", text: "Open to students from every state, stream and background." },
              { icon: Compass, title: "Guidance", text: "Mentorship that helps interns succeed beyond the placement." },
            ].map((v) => (
              <div key={v.title} className="rounded-2xl bg-card p-6 shadow-sm">
                <v.icon className="size-7 text-gold" />
                <h4 className="mt-3 font-display text-lg font-semibold text-navy-deep">{v.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <SectionHeader eyebrow="Recognitions" title="Aligned with India's leading frameworks" description="UGC INTERN's programs are designed in alignment with the standards of these national bodies." />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ApprovalBadge kind="AICTE" />
          <ApprovalBadge kind="UGC" />
          <ApprovalBadge kind="BSDM" />
          <ApprovalBadge kind="ISO" />
        </div>
      </section>

      <section className="bg-gradient-to-br from-navy-deep to-navy py-20 text-ivory">
        <div className="container mx-auto grid gap-10 px-4 lg:grid-cols-2">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-medium text-gold"><History className="size-3.5" /> Our Story</div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">From a campus problem to a national platform</h2>
            <p className="mt-4 leading-relaxed text-ivory/80">Founded by a small team of educators and engineers, UGC INTERN began as a research project documenting the gap between academic learning and industry expectations across Indian universities. Today it serves students from over 800 institutions and partners with 1,200+ companies.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[{ k: "Founded", v: "2022" }, { k: "Institutions", v: "800+" }, { k: "Cities", v: "120+" }, { k: "Internships posted", v: "12,000+" }].map((s) => (
              <div key={s.k} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="font-display text-3xl font-bold text-gold">{s.v}</div>
                <div className="text-sm text-ivory/70">{s.k}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <SectionHeader eyebrow="Leadership" title="People behind the platform" />
        <div className="grid gap-5 md:grid-cols-3">
          {[{n:"Dr. R. Iyer",r:"Founder & Academic Director"},{n:"Ananya Gupta",r:"Head of Industry Partnerships"},{n:"Karthik R.",r:"Chief Technology Officer"}].map((p) => (
            <div key={p.n} className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
              <div className="mx-auto grid size-20 place-items-center rounded-full bg-gradient-to-br from-navy to-navy-soft text-ivory font-display text-2xl font-bold">{p.n.charAt(0)}</div>
              <div className="mt-4 font-display font-semibold text-navy-deep">{p.n}</div>
              <div className="text-sm text-muted-foreground">{p.r}</div>
              <div className="mt-3 inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground"><Building2 className="size-3" /> Bengaluru</div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
