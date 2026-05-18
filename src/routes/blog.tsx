import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CalendarDays, ArrowRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { SectionHeader } from "@/components/SectionHeader";
import { BLOG_POSTS } from "@/lib/mock-data";

export const Route = createFileRoute("/blog")({
  component: BlogIndex,
  head: () => ({
    meta: [
      { title: "Blog & News — UGC INTERN" },
      { name: "description", content: "Career guides, internship tips, and platform news from UGC INTERN." },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
});

function BlogIndex() {
  return (
    <PageShell>
      <section className="bg-gradient-to-b from-navy-deep to-navy py-16 text-ivory">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Blog & News</h1>
          <p className="mt-4 text-ivory/80">Insights, guides and updates from the UGC INTERN team.</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <SectionHeader eyebrow="Latest" title="Career advice you'll actually use" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-2">
          {BLOG_POSTS.map((p, i) => (
            <motion.article
              key={p.slug}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group rounded-2xl border border-border bg-card p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-gold hover:shadow-[var(--shadow-elegant)]"
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="rounded-full bg-secondary px-2.5 py-1 font-medium text-navy">{p.tag}</span>
                <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" />{p.date}</span>
              </div>
              <h3 className="mt-4 font-display text-xl font-bold text-navy-deep group-hover:text-navy">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.excerpt}</p>
              <Link to="/blog/$slug" params={{ slug: p.slug }} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-navy hover:text-gold">Read article <ArrowRight className="size-3.5" /></Link>
            </motion.article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
