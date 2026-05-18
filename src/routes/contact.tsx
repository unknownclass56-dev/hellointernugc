import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { z } from "zod";
import { PageShell } from "@/components/PageShell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact — UGC INTERN" },
      { name: "description", content: "Get in touch with the UGC INTERN team for support, partnerships, or media enquiries." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
});

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.string().trim().email("Enter a valid email").max(120),
  subject: z.string().trim().min(2, "Please add a subject").max(120),
  message: z.string().trim().min(10, "Please add a message").max(2000),
});

function ContactPage() {
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      toast.success("Message sent! We'll respond within 24 hours.");
      e.currentTarget.reset();
    }, 700);
  }
  return (
    <PageShell>
      <section className="bg-gradient-to-b from-navy-deep to-navy py-14 text-ivory">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Get in touch</h1>
          <p className="mx-auto mt-3 max-w-xl text-ivory/80">For students, partners, press, or general questions — we're here.</p>
        </div>
      </section>
      <section className="container mx-auto grid gap-10 px-4 py-16 lg:grid-cols-3">
        <div className="space-y-4">
          {[
            { icon: Mail, title: "Email", lines: ["support@ugcintern.in"] },
            { icon: MapPin, title: "Office", lines: ["Plot 14, Knowledge Park", "New Delhi, India 110001"] },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="grid size-11 place-items-center rounded-xl bg-navy text-ivory"><c.icon className="size-5" /></div>
              <h3 className="mt-4 font-display text-lg font-semibold text-navy-deep">{c.title}</h3>
              <div className="mt-1 text-sm text-muted-foreground">{c.lines.map((l) => <div key={l}>{l}</div>)}</div>
            </div>
          ))}
        </div>
        <form onSubmit={onSubmit} className="lg:col-span-2 rounded-2xl border border-border bg-card p-7 shadow-sm space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label htmlFor="name">Name</Label><Input id="name" name="name" required maxLength={80} /></div>
            <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required maxLength={120} /></div>
          </div>
          <div><Label htmlFor="subject">Subject</Label><Input id="subject" name="subject" required maxLength={120} /></div>
          <div><Label htmlFor="message">Message</Label><Textarea id="message" name="message" rows={6} required maxLength={2000} /></div>
          <Button type="submit" disabled={busy} className="bg-navy text-ivory hover:bg-navy-deep">
            <Send className="mr-1.5 size-4" /> {busy ? "Sending…" : "Send Message"}
          </Button>
        </form>
      </section>
    </PageShell>
  );
}
