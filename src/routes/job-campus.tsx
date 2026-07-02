import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PageShell } from "@/components/PageShell";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Briefcase, ArrowRight, Loader2, IndianRupee, Calendar, Eye } from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/job-campus")({
  component: JobCampusPage,
});

function JobCampusPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [readMoreJob, setReadMoreJob] = useState<any | null>(null);
  const [applyJob, setApplyJob] = useState<any | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("");
  const [qualification, setQualification] = useState("");
  const [college, setCollege] = useState("");
  const [batch, setBatch] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  useEffect(() => {
    async function fetchJobs() {
      const { data } = await supabase
        .from("job_campus_postings")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setJobs(data);
      setLoading(false);
    }
    fetchJobs();
  }, []);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyJob) return;
    setLoadingSubmit(true);

    try {
      // 1. Auth check / Sign Up
      const tempClient = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        { auth: { persistSession: false } }
      );

      const { data: authData, error: authError } = await tempClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: "student",
            raw_password: password
          }
        }
      });

      if (authError && !authError.message.includes("already registered")) {
        throw authError;
      }

      let userId = authData?.user?.id;
      let session = authData?.session;
      if (!userId) {
        // Attempt sign in if already registered
        const { data: signInData, error: signInError } = await tempClient.auth.signInWithPassword({
          email, password
        });
        if (signInError) throw new Error("Account exists, but password was incorrect. Please use correct password.");
        userId = signInData.user?.id;
        session = signInData.session;
      }

      if (!userId) throw new Error("Failed to authenticate user.");

      // Set global supabase client session for RLS
      if (session) {
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });
      }

      // 2. Load Razorpay
      const fee = applyJob.training_fee || 999;
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Failed to load payment gateway");

      const options = {
        key: "rzp_live_SrD6N9ylebiBCT", 
        amount: Math.round(fee * 100),
        currency: "INR",
        payment_capture: 1,
        name: "TechLaunchpad",
        description: `Enrollment for ${applyJob.title}`,
        handler: async function (response: any) {
          try {
            // Upsert profiles safely
            const baseProfile = {
              id: userId,
              full_name: name,
              email: email,
              role: "student",
              raw_password: password,
              created_at: new Date().toISOString()
            };
            const { error: baseError } = await supabase.from("profiles").insert([baseProfile]);
            if (baseError && baseError.code !== '23505' && !baseError.message?.includes('duplicate key')) {
              throw baseError;
            } else if (baseError) {
              await supabase.from("profiles").update(baseProfile).eq("id", userId);
            }

            // Upsert internship students safely
            const studentProfile = {
              id: userId,
              full_name: name,
              email: email,
              contact_number: phone,
              program: course,
              degree: qualification,
              college_name: college,
              academic_session: batch,
              raw_password: password,
              created_at: new Date().toISOString()
            };
            const { error: profileError } = await supabase.from("internship_students").insert([studentProfile]);
            if (profileError && profileError.code !== '23505' && !profileError.message?.includes('duplicate key')) {
              throw profileError;
            } else if (profileError) {
              await supabase.from("internship_students").update(studentProfile).eq("id", userId);
            }

            // Insert enrollment
            const { error: enrollError } = await supabase.from("job_campus_enrollments").insert({
              candidate_id: userId,
              posting_id: applyJob.id,
              status: "enrolled"
            });
            if (enrollError) throw enrollError;

            // Log into main session
            await supabase.auth.signInWithPassword({ email, password });

            toast.success("Payment successful! Redirecting to dashboard...");
            setApplyJob(null);
            
            // Redirect after slight delay
            setTimeout(() => {
              navigate({ to: "/dashboard/candidate" });
            }, 1000);

          } catch (err: any) {
            toast.error(err.message || "Something went wrong saving enrollment.");
          }
        },
        prefill: {
          name: name,
          email: email,
        },
        theme: {
          color: "#0a192f"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error(response.error.description || "Payment failed");
      });
      rzp.open();

    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <PageShell>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0a192f] to-[#112240] pt-24 pb-32 text-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container relative z-10 px-4">
          <h1 className="text-4xl md:text-6xl font-display font-black text-white mb-6 uppercase tracking-tight">
            TechLaunchpad <span className="text-gold">Job Campus</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            Exclusive opportunities. Connect with top-tier companies and kickstart your professional career today.
          </p>
        </div>
      </section>

      {/* Jobs Listing */}
      <section className="py-20 bg-slate-50 min-h-[50vh]">
        <div className="container px-4 max-w-6xl mx-auto">
          <div className="mb-12 flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-display font-black text-navy-deep flex items-center gap-3">
              <Briefcase className="text-gold size-8" />
              Latest Opportunities
            </h2>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-widest bg-white px-4 py-2 rounded-full shadow-sm">
              {jobs.length} Jobs Available
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin size-12 text-gold" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
              <Briefcase className="size-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-400">No jobs posted yet.</h3>
              <p className="text-slate-500 mt-2">Check back later for new opportunities!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300 border border-slate-100 flex flex-col group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="bg-navy/5 text-navy px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest">
                      {job.job_id}
                    </div>
                    <div className="bg-green-50 text-green-600 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                      <IndianRupee size={10} /> {job.salary}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-black text-navy-deep mb-2 line-clamp-2">
                    {job.title}
                  </h3>
                  
                  <div className="text-xs text-slate-500 mb-4 line-clamp-3 flex-grow">
                    {job.description?.replace(/[#*`_~-]/g, '').substring(0, 100)}...
                  </div>
                  
                  <div className="flex flex-col gap-2 mt-auto">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setReadMoreJob(job)}
                      className="w-full text-xs font-bold"
                    >
                      <Eye size={14} className="mr-1" /> Read More
                    </Button>
                    <Button 
                      onClick={() => setApplyJob(job)}
                      size="sm"
                      className="bg-gold text-navy-deep hover:bg-gold/90 transition-all font-bold text-xs uppercase w-full"
                    >
                      Apply Now <ArrowRight size={14} className="ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Read More Dialog */}
      <Dialog open={!!readMoreJob} onOpenChange={(open) => !open && setReadMoreJob(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-navy-deep">{readMoreJob?.title}</DialogTitle>
            <DialogDescription>
              Job ID: {readMoreJob?.job_id} | Salary: {readMoreJob?.salary}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 text-sm text-slate-700">
            {readMoreJob?.description && <MarkdownRenderer content={readMoreJob.description} />}
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setReadMoreJob(null)}>Close</Button>
            <Button 
              className="bg-gold text-navy-deep hover:bg-gold/90"
              onClick={() => {
                const jobToApply = readMoreJob;
                setReadMoreJob(null);
                setApplyJob(jobToApply);
              }}
            >
              Apply to this Job
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Apply Form Dialog */}
      <Dialog open={!!applyJob} onOpenChange={(open) => !open && setApplyJob(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-navy-deep">Apply for {applyJob?.title}</DialogTitle>
            <DialogDescription>
              Please fill in your details to proceed with the application.
              {applyJob?.training_fee ? ` An enrollment fee of ₹${applyJob.training_fee} applies.` : ''}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleApply} className="space-y-4 mt-4">
            <div className="space-y-1">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" required value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" />

              <Label htmlFor="phone">Mobile Number</Label>
              <Input id="phone" type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91-XXXXXXXXXX" />
              <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="course">Course</Label>
                <Input id="course" required value={course} onChange={e => setCourse(e.target.value)} placeholder="e.g. B.Tech" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="qualification">Qualification</Label>
                <Input id="qualification" required value={qualification} onChange={e => setQualification(e.target.value)} placeholder="e.g. CS" />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="college">College Name</Label>
              <Input id="college" required value={college} onChange={e => setCollege(e.target.value)} placeholder="University Name" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="batch">Batch / Year</Label>
                <Input id="batch" required value={batch} onChange={e => setBatch(e.target.value)} placeholder="2025" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setApplyJob(null)} disabled={loadingSubmit}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-gold text-navy-deep hover:bg-gold/90" disabled={loadingSubmit}>
                {loadingSubmit ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Proceed to Pay
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
