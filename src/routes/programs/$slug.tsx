import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { SectionHeader } from "@/components/SectionHeader";
import { ApprovalBadge } from "@/components/ApprovalBadge";
import { Button } from "@/components/ui/button";

const DETAILS: Record<string, {
  badge: "AICTE" | "UGC" | "BSDM" | "ISO";
  title: string;
  intro: string;
  features: string[];
  outcomes: string[];
}> = {
  aicte: {
    badge: "AICTE",
    title: "AICTE Approved Internships",
    intro: "Internships aligned with the All India Council for Technical Education's frameworks for engineering, technology and management students.",
    features: ["Aligned with AICTE Internship Policy 2.0", "Industry-mentored projects", "Recognised across technical universities", "Verifiable certificates with unique IDs"],
    outcomes: ["Enhanced placement readiness", "Live project portfolio", "Letters of recommendation from industry mentors"],
  },
  ugc: {
    badge: "UGC",
    title: "UGC Approved Programs",
    intro: "Research and academic internships designed in alignment with University Grants Commission frameworks for higher education.",
    features: ["UGC NEP 2020 alignment", "Faculty-mentored research tracks", "Suitable for B.A., B.Sc., M.A., M.Sc. and Ph.D. students", "Publishable project deliverables"],
    outcomes: ["Research publications & whitepapers", "Conference participation opportunities", "Pathway to higher studies abroad"],
  },
  bsdm: {
    badge: "BSDM",
    title: "BSDM Approved Training",
    intro: "Skill-first vocational training programs in collaboration with the Bihar Skill Development Mission framework — open to students from across India.",
    features: ["NSQF aligned skill training", "Hands-on workshops with master trainers", "Industry-validated assessments", "Job placement assistance"],
    outcomes: ["Recognised skill credential", "Direct hiring pipeline with MSME partners", "Stipend-supported training"],
  },
  iso: {
    badge: "ISO",
    title: "ISO Certified Programs",
    intro: "All TechLaunchpad processes — from candidate screening to certification — operate under ISO 9001:2015 quality management standards.",
    features: ["ISO 9001:2015 process documentation", "Independent audits", "Standardised mentor onboarding", "Transparent grievance redressal"],
    outcomes: ["Globally recognised quality benchmark", "Trusted by international universities", "Predictable, premium intern experience"],
  },
};

export const Route = createFileRoute("/programs/$slug")({
  component: ProgramDetail,
  loader: ({ params }) => {
    if (!DETAILS[params.slug]) throw notFound();
    return DETAILS[params.slug];
  },
  head: ({ params }) => {
    const d = DETAILS[params.slug];
    return {
      meta: [
        { title: `${d?.title ?? "Program"} — TechLaunchpad` },
        { name: "description", content: d?.intro ?? "" },
        { property: "og:title", content: d?.title ?? "Program" },
        { property: "og:description", content: d?.intro ?? "" },
        { property: "og:url", content: `/programs/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/programs/${params.slug}` }],
    };
  },
  notFoundComponent: () => (
    <PageShell>
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="font-display text-3xl font-bold">Program not found</h1>
        <Link to="/programs" className="mt-4 inline-block text-navy underline">Back to programs</Link>
      </div>
    </PageShell>
  ),
});

function ProgramDetail() {
  const d = Route.useLoaderData();
  return (
    <PageShell>
      <section className="bg-gradient-to-b from-navy-deep to-navy py-20 text-ivory">
        <div className="container mx-auto px-4">
          <div className="mb-4 max-w-fit"><ApprovalBadge kind={d.badge} variant="dark" /></div>
          <h1 className="font-display text-4xl font-bold sm:text-5xl text-balance">{d.title}</h1>
          <p className="mt-5 max-w-3xl text-ivory/80 leading-relaxed">{d.intro}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild className="bg-gold text-navy-deep hover:bg-gold-soft"><Link to="/internships">Browse Internships</Link></Button>
            <Button asChild variant="outline" className="border-ivory/30 bg-transparent text-ivory hover:bg-ivory/10"><Link to="/register">Apply Now</Link></Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto grid gap-10 px-4 py-20 lg:grid-cols-2">
        <div>
          <SectionHeader align="left" eyebrow="Key Features" title="What's included" />
          <ul className="space-y-3">
            {d.features.map((f: string) => (
              <li key={f} className="flex items-start gap-3 rounded-xl bg-card p-4 shadow-sm">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-gold" />
                <span className="text-sm text-foreground">{f}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <SectionHeader align="left" eyebrow="Outcomes" title="What you walk away with" />
          <ul className="space-y-3">
            {d.outcomes.map((o: string) => (
              <li key={o} className="flex items-start gap-3 rounded-xl bg-card p-4 shadow-sm">
                <ArrowRight className="mt-0.5 size-5 shrink-0 text-navy" />
                <span className="text-sm text-foreground">{o}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <div className="rounded-3xl bg-gradient-to-br from-navy-deep to-navy p-10 text-ivory">
          <h3 className="font-display text-2xl font-bold sm:text-3xl">Ready to start?</h3>
          <p className="mt-2 text-ivory/80">Create a free account and apply to {d.title.toLowerCase()} today.</p>
          <Button asChild className="mt-5 bg-gold text-navy-deep hover:bg-gold-soft"><Link to="/register">Create Free Account</Link></Button>
        </div>
      </section>
    </PageShell>
  );
}
