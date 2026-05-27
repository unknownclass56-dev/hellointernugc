import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  User, Mail, Phone, MapPin, Building2, GraduationCap, Lock, ChevronLeft,
  Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, BookOpen
} from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/trainings/$id/register")({
  component: TrainingRegisterPage,
});

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Chandigarh","Puducherry"
];

function TrainingRegisterPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const [training, setTraining] = useState<any>(null);
  const [universities, setUniversities] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [step, setStep] = useState<"form" | "payment" | "success">("form");
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", state: "",
    university: "", universityId: "", college: "", collegeId: "", password: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    setLoading(true);
    const { data: t } = await supabase.from("trainings").select("*").eq("id", id).maybeSingle();
    const { data: unis } = await supabase.from("universities").select("*, colleges(*)").order("name");
    setTraining(t);
    setUniversities(unis || []);
    setLoading(false);
  }

  function handleUniChange(uniId: string) {
    const uni = universities.find(u => u.id === uniId);
    setColleges(uni?.colleges || []);
    setForm(f => ({ ...f, universityId: uniId, university: uni?.name || "", college: "", collegeId: "" }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.phone.trim() || form.phone.length < 10) e.phone = "Valid phone required";
    if (!form.state) e.state = "State is required";
    if (!form.university) e.university = "University is required";
    if (!form.college) e.college = "College is required";
    if (!form.password || form.password.length < 6) e.password = "Password must be at least 6 characters";
    return e;
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);

    try {
      // Save lead first (in case payment fails)
      const { data: lead } = await supabase.from("training_leads").insert([{
        training_id: id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        state: form.state,
        university: form.university,
        college: form.college,
        status: "registration_failed",
        raw_password: form.password
      }]).select().single();

      if (!lead) throw new Error("Failed to create registration. Please try again.");

      // Update status to payment_failed (registration succeeded)
      await supabase.from("training_leads").update({ status: "payment_failed" }).eq("id", lead.id);

      // Move to payment step
      setStep("payment");
      // Initiate Razorpay payment
      initiatePayment(lead.id);
    } catch (err: any) {
      setErrors({ form: err.message || "Registration failed. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  function initiatePayment(leadId: string) {
    const options = {
      key: "rzp_test_placeholder", // Replace with actual Razorpay key
      amount: 99900, // ₹999 in paise (example)
      currency: "INR",
      name: "TechLaunchpad",
      description: training?.name || "Training Enrollment",
      prefill: { name: form.name, email: form.email, contact: form.phone },
      handler: async function (response: any) {
        await completeEnrollment(leadId, response.razorpay_payment_id);
      },
      modal: {
        ondismiss: function () {
          setStep("form");
        }
      },
      theme: { color: "#0a192f" }
    };

    if ((window as any).Razorpay) {
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } else {
      // Fallback: complete enrollment for demo
      completeEnrollment(leadId, "demo_" + Date.now());
    }
  }

  async function completeEnrollment(leadId: string, paymentId: string) {
    setSubmitting(true);
    try {
      // Check if user exists or create new one
      const { data: existingProfile } = await supabase
        .from("profiles").select("id").eq("email", form.email).maybeSingle();

      let studentId = existingProfile?.id;

      if (!studentId) {
        // Create auth user
        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: { full_name: form.name, role: "student" }
          }
        });
        if (authErr) throw authErr;
        studentId = authData.user?.id;

        // Create profile
        if (studentId) {
          await supabase.from("profiles").insert([{
            id: studentId,
            full_name: form.name,
            email: form.email,
            contact_number: form.phone,
            university_name: form.university,
            college_name: form.college,
            role: "student",
            raw_password: form.password,
            created_at: new Date().toISOString()
          }]);
        }
      }

      if (!studentId) throw new Error("Failed to create account.");

      // Create enrollment
      const { data: enrollment } = await supabase.from("training_enrollments").insert([{
        student_id: studentId,
        training_id: id,
        status: "enrolled",
        created_at: new Date().toISOString()
      }]).select().single();

      if (enrollment) {
        // Record transaction
        await supabase.from("training_transactions").insert([{
          enrollment_id: enrollment.id,
          amount: 999,
          status: "success",
          transaction_id: paymentId,
          created_at: new Date().toISOString()
        }]);
        setEnrollmentId(enrollment.id);
      }

      // Mark lead as claimed
      await supabase.from("training_leads").update({ status: "claimed" }).eq("id", leadId);

      // Sign in the user
      await supabase.auth.signInWithPassword({ email: form.email, password: form.password });

      setStep("success");
    } catch (err: any) {
      setErrors({ form: "Payment recorded but enrollment failed: " + err.message });
      setStep("form");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin size-10 text-[#0a192f]" />
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a192f] to-[#1e40af] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
          <div className="size-20 rounded-full bg-green-50 border-4 border-green-200 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="size-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-[#0a192f] uppercase tracking-tight mb-3">Enrollment Successful!</h2>
          <p className="text-slate-500 text-sm mb-2">You have successfully enrolled in</p>
          <p className="font-black text-[#fbbf24] text-lg uppercase mb-6">{training?.name}</p>
          <p className="text-slate-400 text-xs mb-8 font-medium">Access your training sessions and track progress from your student dashboard.</p>
          <button
            onClick={() => navigate({ to: "/dashboard/student/trainings" })}
            className="w-full h-12 bg-[#0a192f] text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-[#1e40af] transition-all shadow-lg"
          >
            Go to My Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (step === "payment") {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl border border-slate-100">
          <Loader2 className="animate-spin size-12 text-[#0a192f] mx-auto mb-4" />
          <h2 className="text-xl font-black text-[#0a192f] uppercase tracking-tight mb-2">Processing Payment</h2>
          <p className="text-slate-500 text-sm">Please wait while we open the payment gateway...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <SiteHeader />

      <div className="bg-[#0a192f] py-12 px-4">
        <div className="container mx-auto">
          <Link to="/trainings/$id" params={{ id }} className="inline-flex items-center gap-2 text-white/50 hover:text-white text-xs font-bold uppercase tracking-widest mb-4 transition-colors">
            <ChevronLeft className="size-4" /> Back
          </Link>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">
            Register for <span className="text-[#fbbf24]">{training?.name}</span>
          </h1>
          <p className="text-white/50 text-sm mt-2 font-medium">Fill in your details to enroll in this training program</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0a192f] to-[#1e40af] p-6 flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-white/10 flex items-center justify-center">
                <BookOpen className="size-7 text-[#fbbf24]" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-0.5">Training Enrollment</div>
                <div className="text-white font-black text-lg uppercase tracking-tight">{training?.name}</div>
                {training?.duration_days && (
                  <div className="text-[#fbbf24] text-xs font-bold">{training.duration_days} Days Program</div>
                )}
              </div>
            </div>

            <form onSubmit={handleRegister} className="p-8 space-y-5">
              {errors.form && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                  <AlertCircle className="size-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-600 text-sm font-bold">{errors.form}</p>
                </div>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Enter your full name"
                    className={`w-full h-12 pl-11 pr-4 rounded-xl border-2 font-medium text-sm outline-none focus:border-[#0a192f] transition-colors ${errors.name ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"}`}
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs font-bold">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="your@email.com"
                    className={`w-full h-12 pl-11 pr-4 rounded-xl border-2 font-medium text-sm outline-none focus:border-[#0a192f] transition-colors ${errors.email ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"}`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs font-bold">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="10-digit mobile number"
                    className={`w-full h-12 pl-11 pr-4 rounded-xl border-2 font-medium text-sm outline-none focus:border-[#0a192f] transition-colors ${errors.phone ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"}`}
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs font-bold">{errors.phone}</p>}
              </div>

              {/* State */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">State *</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <select
                    value={form.state}
                    onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                    className={`w-full h-12 pl-11 pr-4 rounded-xl border-2 font-medium text-sm outline-none focus:border-[#0a192f] transition-colors appearance-none ${errors.state ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"}`}
                  >
                    <option value="">Select your state</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {errors.state && <p className="text-red-500 text-xs font-bold">{errors.state}</p>}
              </div>

              {/* University */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">University *</label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    value={form.university}
                    onChange={e => setForm(f => ({ ...f, university: e.target.value }))}
                    placeholder="Enter your university name"
                    className={`w-full h-12 pl-11 pr-4 rounded-xl border-2 font-medium text-sm outline-none focus:border-[#0a192f] transition-colors ${errors.university ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"}`}
                  />
                </div>
                {errors.university && <p className="text-red-500 text-xs font-bold">{errors.university}</p>}
              </div>

              {/* College */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">College *</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    value={form.college}
                    onChange={e => setForm(f => ({ ...f, college: e.target.value }))}
                    placeholder="Enter your college name"
                    className={`w-full h-12 pl-11 pr-4 rounded-xl border-2 font-medium text-sm outline-none focus:border-[#0a192f] transition-colors ${errors.college ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"}`}
                  />
                </div>
                {errors.college && <p className="text-red-500 text-xs font-bold">{errors.college}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Create Password *</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Minimum 6 characters"
                    className={`w-full h-12 pl-11 pr-12 rounded-xl border-2 font-medium text-sm outline-none focus:border-[#0a192f] transition-colors ${errors.password ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"}`}
                  />
                  <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs font-bold">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-14 bg-[#0a192f] hover:bg-[#1e40af] disabled:opacity-60 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl flex items-center justify-center gap-3"
              >
                {submitting ? <Loader2 className="animate-spin size-5" /> : (
                  <>
                    <CheckCircle2 className="size-5" />
                    Register & Proceed to Payment
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-400 font-medium">
                By registering you agree to our{" "}
                <Link to="/terms" className="text-[#0a192f] font-bold underline">Terms of Service</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
