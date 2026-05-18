import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Building2, CalendarClock, IndianRupee, MapPin, Briefcase, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { ApprovalBadge } from "@/components/ApprovalBadge";
import { MOCK_INTERNSHIPS } from "@/lib/mock-data";

export const Route = createFileRoute("/internships/$id")({
  component: InternshipDetail,
  loader: ({ params }) => {
    const item = MOCK_INTERNSHIPS.find((i) => i.id === params.id);
    if (!item) throw notFound();
    return item;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Internship"} — UGC INTERN` },
      { name: "description", content: `${loaderData?.title} at ${loaderData?.company} — apply via UGC INTERN.` },
      { property: "og:url", content: `/internships/${loaderData?.id}` },
    ],
    links: [{ rel: "canonical", href: `/internships/${loaderData?.id}` }],
  }),
  notFoundComponent: () => (
    <PageShell>
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="font-display text-3xl font-bold">Internship not found</h1>
        <Link to="/internships" className="mt-4 inline-block text-navy underline">Back to internships</Link>
      </div>
    </PageShell>
  ),
});

function InternshipDetail() {
  const it = Route.useLoaderData();
  return (
    <PageShell>
      <section className="bg-gradient-to-b from-navy-deep to-navy py-14 text-ivory">
        <div className="container mx-auto px-4">
          <Link to="/internships" className="text-sm text-ivory/70 hover:text-gold">← Back to internships</Link>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="flex flex-wrap gap-2">
                {it.tags.map((t: string) => <span key={t} className="rounded-full border border-gold/40 bg-gold/15 px-3 py-1 text-xs font-medium text-gold">{t}</span>)}
              </div>
              <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{it.title}</h1>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ivory/80">
                <span className="inline-flex items-center gap-1.5"><Building2 className="size-4" />{it.company}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" />{it.location}</span>
                <span className="inline-flex items-center gap-1.5"><CalendarClock className="size-4" />{it.duration}</span>
                <span className="inline-flex items-center gap-1.5"><Briefcase className="size-4" />{it.mode}</span>
                <span className="inline-flex items-center gap-1.5"><IndianRupee className="size-4" />{it.stipend}</span>
              </div>
            </div>
            <Button asChild size="lg" className="bg-gold text-navy-deep hover:bg-gold-soft"><Link to="/apply/$id" params={{ id: it.id }}>Apply Now</Link></Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto grid gap-10 px-4 py-14 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold text-navy-deep">About the role</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Join {it.company} as a {it.title.replace(" Intern", "")} for {it.duration.toLowerCase()}. You'll work on production-grade projects alongside experienced mentors and ship measurable outcomes.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-navy-deep">Responsibilities</h2>
            <ul className="mt-3 space-y-2">
              {["Collaborate with the core team on live projects", "Document learnings and present findings weekly", "Contribute to code reviews and design reviews", "Complete a capstone project for certification"].map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm text-foreground"><CheckCircle2 className="mt-0.5 size-4 text-gold" />{r}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-navy-deep">Eligibility</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 size-4 text-gold" />Currently enrolled in a recognised UG/PG program in India</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 size-4 text-gold" />Available for the entire duration ({it.duration.toLowerCase()})</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 size-4 text-gold" />Updated resume in PDF format</li>
            </ul>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-display text-lg font-bold text-navy-deep">Quick actions</h3>
            <Button asChild className="mt-4 w-full bg-navy text-ivory hover:bg-navy-deep"><Link to="/apply/$id" params={{ id: it.id }}>Apply Now</Link></Button>
            <Button asChild variant="outline" className="mt-2 w-full"><Link to="/internships">View similar</Link></Button>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-display text-lg font-bold text-navy-deep mb-3">Recognitions</h3>
            <div className="space-y-2">
              {it.tags.includes("AICTE") && <ApprovalBadge kind="AICTE" />}
              {it.tags.includes("UGC") && <ApprovalBadge kind="UGC" />}
              {it.tags.includes("BSDM") && <ApprovalBadge kind="BSDM" />}
              {it.tags.includes("ISO") && <ApprovalBadge kind="ISO" />}
            </div>
          </div>
        </aside>
      </section>
    </PageShell>
  );
}
