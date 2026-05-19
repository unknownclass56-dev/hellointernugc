import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { SectionHeader } from "@/components/SectionHeader";
import { ApprovalBadge } from "@/components/ApprovalBadge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/programs/")({
  component: ProgramsIndex,
  head: () => ({
    meta: [
      { title: "Programs — TechLaunchpad" },
      { name: "description", content: "Explore AICTE, UGC, BSDM and ISO certified internship programs across engineering, management, design, data and more." },
      { property: "og:url", content: "/programs" },
    ],
    links: [{ rel: "canonical", href: "/programs" }],
  }),
});

const PROGRAMS = [
  { slug: "aicte", title: "AICTE Approved Internships", desc: "Engineering, technology and management internships meeting AICTE's National Internship Portal alignment.", tags: ["Engineering", "Tech", "Management"] },
  { slug: "ugc", title: "UGC Approved Programs", desc: "Research, humanities, sciences and academia-aligned programs guided by UGC frameworks.", tags: ["Research", "Humanities", "Academic"] },
  { slug: "bsdm", title: "BSDM Approved Training", desc: "Skill-first vocational training programs in collaboration with the Bihar Skill Development Mission framework.", tags: ["Skill", "Vocational", "Applied"] },
  { slug: "iso", title: "ISO Certified Programs", desc: "All processes — selection, mentorship, evaluation and certification — meet ISO 9001:2015 standards.", tags: ["ISO 9001", "Quality", "Standards"] },
] as const;

function ProgramsIndex() {
  return (
    <PageShell>
      <section className="bg-gradient-to-b from-navy-deep to-navy py-20 text-ivory">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold">Internship Programs</div>
          <h1 className="font-display text-4xl font-bold sm:text-5xl text-balance">Choose a path. Earn a recognition.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-ivory/80">Every program on TechLaunchpad aligns with at least one national framework. Pick the recognition that matches your career goals.</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          <ApprovalBadge kind="AICTE" />
          <ApprovalBadge kind="UGC" />
          <ApprovalBadge kind="BSDM" />
          <ApprovalBadge kind="ISO" />
        </div>
        <SectionHeader eyebrow="All Programs" title="Pick the recognition that fits you" />
        <div className="grid gap-5 md:grid-cols-2">
          {PROGRAMS.map((p) => (
            <Link key={p.slug} to="/programs/$slug" params={{ slug: p.slug }} className="group flex flex-col rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:border-gold hover:shadow-[var(--shadow-elegant)]">
              <h3 className="font-display text-2xl font-bold text-navy-deep group-hover:text-navy">{p.title}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{p.desc}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {p.tags.map((t) => <span key={t} className="rounded-full border border-border bg-secondary px-3 py-1 text-xs">{t}</span>)}
              </div>
              <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-navy group-hover:text-gold">
                Explore program <ArrowRight className="size-4" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 rounded-3xl border border-border bg-secondary/40 p-10 text-center">
          <h3 className="font-display text-2xl font-bold text-navy-deep">Not sure which program is right?</h3>
          <p className="mt-2 text-muted-foreground">Browse all live internships and filter by recognition, duration and mode.</p>
          <Button asChild className="mt-5 bg-navy text-ivory hover:bg-navy-deep"><Link to="/internships">Browse Internships</Link></Button>
        </div>
      </section>
    </PageShell>
  );
}
