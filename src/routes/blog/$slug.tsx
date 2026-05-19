import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { BLOG_POSTS } from "@/lib/mock-data";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPost,
  loader: ({ params }) => {
    const post = BLOG_POSTS.find((p) => p.slug === params.slug);
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData, params }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Article"} — TechLaunchpad Blog` },
      { name: "description", content: loaderData?.excerpt ?? "" },
      { property: "og:title", content: loaderData?.title ?? "Article" },
      { property: "og:description", content: loaderData?.excerpt ?? "" },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `/blog/${params.slug}` },
    ],
    links: [{ rel: "canonical", href: `/blog/${params.slug}` }],
  }),
  notFoundComponent: () => (
    <PageShell>
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="font-display text-3xl font-bold">Article not found</h1>
        <Link to="/blog" className="mt-4 inline-block text-navy underline">Back to blog</Link>
      </div>
    </PageShell>
  ),
});

function BlogPost() {
  const p = Route.useLoaderData();
  return (
    <PageShell>
      <article className="container mx-auto max-w-3xl px-4 py-16">
        <Link to="/blog" className="text-sm text-muted-foreground hover:text-navy">← Back to blog</Link>
        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <span className="rounded-full bg-secondary px-3 py-1 font-medium text-navy">{p.tag}</span>
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4" />{p.date}</span>
        </div>
        <h1 className="mt-4 font-display text-4xl font-bold text-navy-deep text-balance">{p.title}</h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{p.excerpt}</p>
        <div className="prose mt-8 max-w-none text-foreground">
          <p>This article covers practical advice for students aiming to build standout careers in 2026 and beyond. The internship landscape in India has changed rapidly — what worked five years ago no longer guarantees a competitive edge.</p>
          <p>Across our partner companies, the most-requested intern qualities are consistent: a portfolio of real projects, the ability to communicate ideas clearly, and ownership of outcomes rather than tasks.</p>
          <h2>Why this matters now</h2>
          <p>Employers increasingly screen for demonstrated ability. A verified internship certificate from a recognised platform — paired with a portfolio — outperforms a long list of generic certifications.</p>
          <h2>What to do this week</h2>
          <ul>
            <li>Audit your resume against three real internship listings.</li>
            <li>Pick one project you've shipped and write a 200-word case study about it.</li>
            <li>Apply to at least two AICTE or UGC aligned internships through TechLaunchpad.</li>
          </ul>
        </div>
      </article>
    </PageShell>
  );
}
