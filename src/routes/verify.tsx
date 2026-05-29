import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, BadgeCheck, XCircle, Phone, Mail, Hash,
  Loader2, Search, Award, Building2, GraduationCap, CheckCircle2
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

import { useEffect } from "react";

export const Route = createFileRoute("/verify")({
  component: VerifyPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      id: search.id as string | undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Verify Certificate — TechLaunchpad" },
      { name: "description", content: "Verify any TechLaunchpad certificate using mobile number, email address, or certificate ID." },
      { property: "og:url", content: "/verify" },
    ],
    links: [{ rel: "canonical", href: "/verify" }],
  }),
});

type VerifyMode = "mobile" | "email" | "id";
type ResultState = "idle" | "valid" | "invalid";

function VerifyPage() {
  const { id } = Route.useSearch();
  const [mode, setMode] = useState<VerifyMode>("mobile");
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState<ResultState>("idle");
  const [loading, setLoading] = useState(false);
  const [verifiedData, setVerifiedData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      setMode("id");
      setInputValue(id);
      autoVerify(id);
    }
  }, [id]);

  async function autoVerify(certIdVal: string) {
    setLoading(true);
    setResult("idle");
    setVerifiedData(null);
    try {
      let profileData: any = null;
      
      const { data: all } = await supabase
        .from("profiles")
        .select("*")
        .eq("certificate_generated", true);
      if (all) {
        profileData = all.find((p: any) => {
          const genId = `TL/OFFER/${p.university_roll_number?.slice(-4) || "0000"}/${new Date(p.created_at || Date.now()).getFullYear()}`;
          return genId.toUpperCase() === certIdVal.toUpperCase();
        }) ?? null;
      }

      if (profileData) {
        const fullId = `TL/OFFER/${profileData.university_roll_number?.slice(-4) || "0000"}/${new Date(profileData.created_at || Date.now()).getFullYear()}`;
        setVerifiedData({
          type: "internship",
          name: profileData.full_name,
          program: profileData.program || profileData.department || "Internship Program",
          college: profileData.college_name || "N/A",
          university: profileData.university_name || "N/A",
          department: profileData.department || "N/A",
          rollNo: profileData.university_roll_number || "N/A",
          certId: fullId.toUpperCase(),
          recognition: "AICTE · UGC · BSDM · ISO 9001:2015",
          issueYear: new Date(profileData.created_at || Date.now()).getFullYear(),
        });
        setResult("valid");
        setLoading(false);
        return;
      }

      let trainingEnroll: any = null;
      if (certIdVal.toUpperCase().startsWith("TL/TRG/")) {
        const parts = certIdVal.toUpperCase().split("/");
        const rollSuffix = parts[2];
        const yr = parts[3];
        const { data: allProfs } = await supabase
          .from("profiles")
          .select("id, full_name, college_name, university_name, department, university_roll_number");
        const matched = (allProfs || []).find((p: any) => {
          const suffix = p.university_roll_number?.slice(-4) || "0000";
          return suffix === rollSuffix && String(new Date(p.created_at || Date.now()).getFullYear()) === yr;
        });
        if (matched) {
          const { data: enr } = await supabase
            .from("training_enrollments")
            .select("*, trainings(*)")
            .eq("student_id", matched.id)
            .eq("status", "completed")
            .limit(1)
            .maybeSingle();
          if (enr) trainingEnroll = { enr, prof: matched };
        }
      }

      if (trainingEnroll) {
        const { enr, prof } = trainingEnroll;
        const fullId = `TL/TRG/${prof.university_roll_number?.slice(-4) || "0000"}/${new Date(enr.created_at).getFullYear()}`;
        setVerifiedData({
          type: "training",
          name: prof.full_name,
          program: enr.trainings?.name || "Training Program",
          college: prof.college_name || "N/A",
          university: prof.university_name || "N/A",
          department: prof.department || "N/A",
          rollNo: prof.university_roll_number || "N/A",
          certId: fullId.toUpperCase(),
          durationDays: enr.trainings?.duration_days || "N/A",
          recognition: "AICTE · MSME · TechLaunchpad",
          issueYear: new Date(enr.created_at).getFullYear(),
        });
        setResult("valid");
        setLoading(false);
        return;
      }

      setResult("invalid");
    } catch (err) {
      console.error(err);
      setResult("invalid");
    }
    setLoading(false);
  }

  const modes: { key: VerifyMode; label: string; icon: React.ReactNode; placeholder: string }[] = [
    { key: "mobile", label: "Mobile Number", icon: <Phone className="size-4" />, placeholder: "Enter mobile number" },
    { key: "email",  label: "Email Address",  icon: <Mail className="size-4" />,  placeholder: "Enter email address" },
    { key: "id",     label: "Certificate ID", icon: <Hash className="size-4" />,  placeholder: "e.g. TL/OFFER/1234/2025" },
  ];

  function reset() {
    setResult("idle");
    setVerifiedData(null);
    setInputValue("");
  }

  async function check() {
    const val = inputValue.trim();
    if (!val) return;

    setLoading(true);
    setResult("idle");
    setVerifiedData(null);

    try {
      /* ── 1. Search internship/profile certificates ── */
      let profileData: any = null;

      if (mode === "mobile") {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("contact_number", val)
          .eq("certificate_generated", true)
          .maybeSingle();
        profileData = data;
      } else if (mode === "email") {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", val.toLowerCase())
          .eq("certificate_generated", true)
          .maybeSingle();
        profileData = data;
      } else if (mode === "id") {
        // Try to match internship cert ID (TL/OFFER/xxxx/yyyy)
        const { data: all } = await supabase
          .from("profiles")
          .select("*")
          .eq("certificate_generated", true);
        if (all) {
          profileData = all.find((p: any) => {
            const genId = `TL/OFFER/${p.university_roll_number?.slice(-4) || "0000"}/${new Date(p.created_at || Date.now()).getFullYear()}`;
            return genId.toUpperCase() === val.toUpperCase();
          }) ?? null;
        }
      }

      if (profileData) {
        const certId = `TL/OFFER/${profileData.university_roll_number?.slice(-4) || "0000"}/${new Date(profileData.created_at || Date.now()).getFullYear()}`;
        setVerifiedData({
          type: "internship",
          name: profileData.full_name,
          program: profileData.program || profileData.department || "Internship Program",
          college: profileData.college_name || "N/A",
          university: profileData.university_name || "N/A",
          department: profileData.department || "N/A",
          rollNo: profileData.university_roll_number || "N/A",
          certId: certId.toUpperCase(),
          recognition: "AICTE · UGC · BSDM · ISO 9001:2015",
          issueYear: new Date(profileData.created_at || Date.now()).getFullYear(),
        });
        setResult("valid");
        setLoading(false);
        return;
      }

      /* ── 2. Search training certificates ── */
      let trainingEnroll: any = null;

      if (mode === "mobile") {
        const { data: prof } = await supabase
          .from("profiles")
          .select("id, full_name, college_name, university_name, department, university_roll_number")
          .eq("contact_number", val)
          .maybeSingle();
        if (prof) {
          const { data: enr } = await supabase
            .from("training_enrollments")
            .select("*, trainings(*)")
            .eq("student_id", prof.id)
            .eq("status", "completed")
            .limit(1)
            .maybeSingle();
          if (enr) trainingEnroll = { enr, prof };
        }
      } else if (mode === "email") {
        const { data: prof } = await supabase
          .from("profiles")
          .select("id, full_name, college_name, university_name, department, university_roll_number")
          .eq("email", val.toLowerCase())
          .maybeSingle();
        if (prof) {
          const { data: enr } = await supabase
            .from("training_enrollments")
            .select("*, trainings(*)")
            .eq("student_id", prof.id)
            .eq("status", "completed")
            .limit(1)
            .maybeSingle();
          if (enr) trainingEnroll = { enr, prof };
        }
      } else if (mode === "id") {
        // TL/TRG/xxxx/yyyy
        if (val.toUpperCase().startsWith("TL/TRG/")) {
          const parts = val.toUpperCase().split("/");
          const rollSuffix = parts[2];
          const yr = parts[3];
          const { data: all } = await supabase
            .from("profiles")
            .select("id, full_name, college_name, university_name, department, university_roll_number");
          const matched = (all || []).find((p: any) => {
            const suffix = p.university_roll_number?.slice(-4) || "0000";
            return suffix === rollSuffix && String(new Date(p.created_at || Date.now()).getFullYear()) === yr;
          });
          if (matched) {
            const { data: enr } = await supabase
              .from("training_enrollments")
              .select("*, trainings(*)")
              .eq("student_id", matched.id)
              .eq("status", "completed")
              .limit(1)
              .maybeSingle();
            if (enr) trainingEnroll = { enr, prof: matched };
          }
        }
      }

      if (trainingEnroll) {
        const { enr, prof } = trainingEnroll;
        const certId = `TL/TRG/${prof.university_roll_number?.slice(-4) || "0000"}/${new Date(enr.created_at).getFullYear()}`;
        setVerifiedData({
          type: "training",
          name: prof.full_name,
          program: enr.trainings?.name || "Training Program",
          college: prof.college_name || "N/A",
          university: prof.university_name || "N/A",
          department: prof.department || "N/A",
          rollNo: prof.university_roll_number || "N/A",
          certId: certId.toUpperCase(),
          durationDays: enr.trainings?.duration_days || "N/A",
          recognition: "AICTE · MSME · TechLaunchpad",
          issueYear: new Date(enr.created_at).getFullYear(),
        });
        setResult("valid");
        setLoading(false);
        return;
      }

      setResult("invalid");
    } catch (err) {
      console.error(err);
      setResult("invalid");
    }

    setLoading(false);
  }

  const activeMode = modes.find(m => m.key === mode)!;

  return (
    <PageShell>
      {/* HERO */}
      <section className="bg-gradient-to-br from-[#0a192f] via-[#1e3a5f] to-[#1e40af] py-20 text-white">
        <div className="container mx-auto max-w-2xl px-4 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
            <ShieldCheck className="size-9 text-[#fbbf24]" />
          </div>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight sm:text-4xl">
            Certificate Verification
          </h1>
          <p className="mt-3 text-white/70 text-sm leading-relaxed">
            Verify any TechLaunchpad certificate instantly using your <strong className="text-[#fbbf24]">mobile number</strong>,{" "}
            <strong className="text-[#fbbf24]">email address</strong>, or <strong className="text-[#fbbf24]">certificate ID</strong>.
            Any one is sufficient.
          </p>
        </div>
      </section>

      {/* FORM */}
      <section className="container mx-auto max-w-xl px-4 py-14">
        {/* Mode Selector */}
        <div className="flex rounded-2xl border border-border bg-card p-1.5 mb-6 shadow-sm gap-1">
          {modes.map(m => (
            <button
              key={m.key}
              onClick={() => { setMode(m.key); reset(); }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black uppercase tracking-widest transition-all ${
                mode === m.key
                  ? "bg-[#0a192f] text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {m.icon}
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">
            Enter {activeMode.label}
          </label>
          <div className="relative mb-4">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{activeMode.icon}</span>
            <Input
              id="verify-input"
              value={inputValue}
              onChange={e => { setInputValue(e.target.value); if (result !== "idle") reset(); }}
              onKeyDown={e => e.key === "Enter" && check()}
              placeholder={activeMode.placeholder}
              className={`pl-10 h-12 font-medium ${mode === "id" ? "font-mono uppercase" : ""}`}
            />
          </div>
          <Button
            id="verify-btn"
            onClick={check}
            disabled={loading || !inputValue.trim()}
            className="w-full h-12 bg-[#0a192f] text-white hover:bg-[#1e40af] font-black uppercase tracking-widest rounded-xl transition-all"
          >
            {loading
              ? <><Loader2 className="animate-spin size-4 mr-2" /> Verifying...</>
              : <><Search className="size-4 mr-2" /> Verify Certificate</>}
          </Button>
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {result === "valid" && verifiedData && (
            <motion.div
              key="valid"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="mt-6 rounded-2xl border-2 border-green-400/40 bg-green-50 p-6"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex size-10 items-center justify-center rounded-full bg-green-100">
                  <BadgeCheck className="size-6 text-green-600" />
                </div>
                <div>
                  <div className="font-black text-green-800 text-base uppercase tracking-wide">Certificate Verified ✓</div>
                  <div className="text-xs text-green-600 font-medium">
                    {verifiedData.type === "training" ? "Training Program Certificate" : "Internship Completion Certificate"}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <dl className="grid gap-3 sm:grid-cols-2">
                {[
                  { icon: <Award className="size-3.5" />, label: "Certificate Holder", value: verifiedData.name },
                  { icon: <CheckCircle2 className="size-3.5" />, label: "Program", value: verifiedData.program },
                  { icon: <Building2 className="size-3.5" />, label: "College", value: verifiedData.college },
                  { icon: <GraduationCap className="size-3.5" />, label: "University", value: verifiedData.university },
                  { icon: <Hash className="size-3.5" />, label: "Certificate ID", value: verifiedData.certId },
                  { icon: <ShieldCheck className="size-3.5" />, label: "Recognition", value: verifiedData.recognition },
                  { icon: <CheckCircle2 className="size-3.5" />, label: "Department", value: verifiedData.department },
                  { icon: <CheckCircle2 className="size-3.5" />, label: "Status", value: "Active · Authentic Record" },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex gap-2 items-start">
                    <span className="mt-0.5 text-green-600">{icon}</span>
                    <div>
                      <dt className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">{label}</dt>
                      <dd className={`text-sm font-bold text-[#0a192f] ${label === "Certificate ID" ? "font-mono" : ""}`}>{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>

              <div className="mt-5 rounded-xl bg-green-100 px-4 py-2.5 text-center text-xs font-bold text-green-700 uppercase tracking-widest">
                🔒 This certificate is officially issued by TechLaunchpad and is authentic.
              </div>
            </motion.div>
          )}

          {result === "invalid" && (
            <motion.div
              key="invalid"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="mt-6 rounded-2xl border-2 border-red-300/40 bg-red-50 p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-red-100">
                  <XCircle className="size-6 text-red-500" />
                </div>
                <div>
                  <div className="font-black text-red-700 text-base uppercase tracking-wide">Not Found</div>
                  <div className="text-xs text-red-500 font-medium">No matching certificate record</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We couldn't find a valid certificate matching the {activeMode.label.toLowerCase()} you entered.
                Please double-check the details or try a different verification method.
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Need help?{" "}
                <a href="mailto:support@techlaunchpad.in" className="text-[#0a192f] font-bold underline">
                  support@techlaunchpad.in
                </a>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </PageShell>
  );
}
