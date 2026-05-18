import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { SectionHeader } from "@/components/SectionHeader";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FAQS } from "@/lib/mock-data";

export const Route = createFileRoute("/faq")({
  component: FAQPage,
  head: () => ({
    meta: [
      { title: "FAQ — UGC INTERN" },
      { name: "description", content: "Frequently asked questions about UGC INTERN's internships, certificates, programs and applications." },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }),
    }],
  }),
});

function FAQPage() {
  return (
    <PageShell>
      <section className="bg-gradient-to-b from-navy-deep to-navy py-14 text-ivory">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Frequently Asked Questions</h1>
          <p className="mx-auto mt-3 max-w-xl text-ivory/80">Everything students and companies ask, in one place.</p>
        </div>
      </section>

      <section className="container mx-auto max-w-3xl px-4 py-16">
        <SectionHeader eyebrow="Help" title="Have a question? Start here." />
        <Accordion type="single" collapsible className="space-y-2">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`q${i}`} className="rounded-xl border border-border bg-card px-5 shadow-sm">
              <AccordionTrigger className="py-4 text-left font-display text-base font-semibold text-navy-deep hover:no-underline">{f.q}</AccordionTrigger>
              <AccordionContent className="pb-4 text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-secondary/40 p-6 text-center">
          <p className="text-sm text-muted-foreground">Didn't find what you were looking for?</p>
          <a href="mailto:support@ugcintern.in" className="mt-2 inline-block font-semibold text-navy hover:text-gold">support@ugcintern.in</a>
        </div>
      </section>
    </PageShell>
  );
}
