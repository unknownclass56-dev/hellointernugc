import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MOCK_INTERNSHIPS } from "@/lib/mock-data";
import { supabase, supabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/apply/$id")({
  component: ApplyPage,
  loader: ({ params }) => {
    const item = MOCK_INTERNSHIPS.find((i) => i.id === params.id);
    if (!item) throw notFound();
    return item;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Apply: ${loaderData?.title ?? "Internship"} — UGC INTERN` },
      { name: "description", content: `Apply for ${loaderData?.title} via UGC INTERN.` },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function ApplyPage() {
  const it = Route.useLoaderData();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [resume, setResume] = useState<File | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (supabaseConfigured && resume) {
        const { data: u } = await supabase.auth.getUser();
        const userId = u.user?.id ?? "anon";
        const path = `${userId}/${Date.now()}-${resume.name}`;
        const { error } = await supabase.storage.from("resumes").upload(path, resume);
        if (error && !String(error.message).toLowerCase().includes("bucket")) throw error;
      }
      toast.success("Application submitted! We've sent a confirmation to your email.");
      setTimeout(() => navigate({ to: "/dashboard/student" }), 800);
    } catch (err) {
      const m = err instanceof Error ? err.message : "Submission failed";
      toast.error(m);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell>
      <section className="container mx-auto max-w-3xl px-4 py-16">
        <div className="mb-6">
          <Link to="/internships/$id" params={{ id: it.id }} className="text-sm text-muted-foreground hover:text-navy">← Back to internship</Link>
          <h1 className="mt-3 font-display text-3xl font-bold text-navy-deep">Apply: {it.title}</h1>
          <p className="text-muted-foreground">{it.company} · {it.location}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-7 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" required />
            </div>
            <div>
              <Label htmlFor="college">College / University</Label>
              <Input id="college" required />
            </div>
            <div>
              <Label htmlFor="degree">Degree</Label>
              <Input id="degree" placeholder="B.Tech, MBA, B.Sc..." required />
            </div>
            <div>
              <Label htmlFor="year">Year of study</Label>
              <Input id="year" placeholder="2nd year" required />
            </div>
          </div>

          <div>
            <Label htmlFor="cover">Cover letter</Label>
            <Textarea id="cover" rows={5} placeholder="Why are you a good fit for this internship?" required />
          </div>

          <div>
            <Label htmlFor="resume">Resume (PDF)</Label>
            <label htmlFor="resume" className="mt-1 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-secondary/40 px-4 py-8 text-center hover:border-gold">
              <UploadCloud className="size-7 text-muted-foreground" />
              <div className="text-sm">{resume ? <span className="font-medium text-navy-deep">{resume.name}</span> : "Click to upload your resume"}</div>
              <div className="text-xs text-muted-foreground">PDF, up to 5MB</div>
              <input id="resume" type="file" accept="application/pdf" className="hidden" onChange={(e) => setResume(e.target.files?.[0] ?? null)} />
            </label>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-secondary p-3 text-xs text-muted-foreground">
            <CheckCircle2 className="size-4 text-gold mt-0.5" />
            By submitting, you confirm the information above is accurate and consent to our privacy policy.
          </div>

          <Button type="submit" disabled={submitting} className="w-full bg-navy text-ivory hover:bg-navy-deep">
            {submitting ? "Submitting…" : "Submit Application"}
          </Button>
        </form>
      </section>
    </PageShell>
  );
}
