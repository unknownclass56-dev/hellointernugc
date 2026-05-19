import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Search, BadgeCheck, XCircle, Phone, Mail, Loader2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/verify")({
  component: VerifyPage,
  head: () => ({
    meta: [
      { title: "Verify Certificate — TechLaunchpad" },
      { name: "description", content: "Verify any TechLaunchpad certificate by entering its unique verification ID." },
      { property: "og:url", content: "/verify" },
    ],
    links: [{ rel: "canonical", href: "/verify" }],
  }),
});

function VerifyPage() {
  const [id, setId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<"idle" | "valid" | "invalid">("idle");
  const [loading, setLoading] = useState(false);
  const [verifiedStudent, setVerifiedStudent] = useState<any>(null);

  async function check() {
    if (!id.trim() || !email.trim() || !phone.trim()) return;
    setLoading(true);
    setResult("idle");
    setVerifiedStudent(null);
    
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email.trim())
        .eq("contact_number", phone.trim())
        .eq("certificate_generated", true)
        .maybeSingle();

      if (data) {
        const generatedId = `TL/OFFER/${data.university_roll_number?.slice(-4) || "0000"}/${new Date(data.created_at || Date.now()).getFullYear()}`;
        if (generatedId.toUpperCase() === id.trim().toUpperCase()) {
          setVerifiedStudent({
            ...data,
            verifiedId: generatedId.toUpperCase()
          });
          setResult("valid");
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error(err);
    }
    
    setResult("invalid");
    setLoading(false);
  }

  return (
    <PageShell>
      <section className="bg-gradient-to-b from-navy-deep to-navy py-16 text-ivory">
        <div className="container mx-auto max-w-2xl px-4 text-center">
          <ShieldCheck className="mx-auto size-12 text-gold" />
          <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Certificate Verification</h1>
          <p className="mt-3 text-ivory/80">Enter the unique verification ID printed on your certificate to verify its authenticity.</p>
        </div>
      </section>

      <section className="container mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="pl-10" />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" className="pl-10" />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={id} onChange={(e) => setId(e.target.value)} placeholder="Certificate ID" className="pl-10 font-mono uppercase" />
            </div>
          </div>
          <Button onClick={check} disabled={loading || !id || !email || !phone} className="w-full mt-4 bg-navy text-ivory hover:bg-navy-deep h-12">
            {loading ? <Loader2 className="animate-spin mr-2" /> : "Verify Authenticity"}
          </Button>
        </div>

        {result === "valid" && verifiedStudent && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-2xl border border-gold/40 bg-gold/10 p-7">
            <div className="flex items-center gap-2 text-navy-deep">
              <BadgeCheck className="size-6 text-gold" />
              <h3 className="font-display text-xl font-bold">Certificate Verified</h3>
            </div>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div><dt className="text-xs uppercase text-muted-foreground">Holder</dt><dd className="font-semibold uppercase">{verifiedStudent.full_name}</dd></div>
              <div><dt className="text-xs uppercase text-muted-foreground">Program</dt><dd className="font-semibold">{verifiedStudent.program || "Internship Program"}</dd></div>
              <div><dt className="text-xs uppercase text-muted-foreground">University</dt><dd className="font-semibold">{verifiedStudent.university_name || "N/A"}</dd></div>
              <div><dt className="text-xs uppercase text-muted-foreground">Recognition</dt><dd className="font-semibold">AICTE · UGC · BSDM · ISO</dd></div>
              <div><dt className="text-xs uppercase text-muted-foreground">Verification ID</dt><dd className="font-mono">{verifiedStudent.verifiedId}</dd></div>
              <div><dt className="text-xs uppercase text-muted-foreground">Status</dt><dd className="font-semibold text-green-700">Active · Official Record</dd></div>
            </dl>
          </motion.div>
        )}
        {result === "invalid" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-2xl border border-destructive/40 bg-destructive/5 p-7">
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="size-6" />
              <h3 className="font-display text-xl font-bold">No certificate found</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">We couldn't find a certificate with that verification ID. Please check the ID and try again, or contact <a href="mailto:support@techlaunchpad.in" className="text-navy underline">support@techlaunchpad.in</a>.</p>
          </motion.div>
        )}
      </section>
    </PageShell>
  );
}
