import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { 
  Search, Loader2, CheckCircle2, UserPlus, Fingerprint, Printer, 
  CreditCard, Award, GraduationCap, ShieldCheck, Eye, EyeOff, 
  School, BookOpen, Calendar, MapPin, Briefcase, Mail, ChevronRight 
} from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import logo from "@/assets/techlaunchpad-logo.png";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      program: search.program as string | undefined,
    };
  },
});

function RegisterPage() {
  const navigate = useNavigate();
  const { program: preSelectedProgram } = (Route as any).useSearch();
  
  const [busy, setBusy] = useState(false);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [mode, setMode] = useState<"choice" | "lookup" | "view" | "form" | "payment_gateway" | "payment_success">("choice");
  const [rollNumber, setRollNumber] = useState("");
  const [foundStudent, setFoundStudent] = useState<any>(null);
  const [registeredUser, setRegisteredUser] = useState<any>(null);
  const [registeredPassword, setRegisteredPassword] = useState("");
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [paying, setPaying] = useState(false);

  const [unis, setUnis] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  const [dbInternships, setDbInternships] = useState<any[]>([]);
  
  const [selectedUni, setSelectedUni] = useState("");
  const [selectedCol, setSelectedCol] = useState("");
  const [regFee, setRegFee] = useState(1500);
  const [globalSettings, setGlobalSettings] = useState<any>(null);

  useEffect(() => {
    supabase.from("portal_settings").select("*").eq("id", "global").maybeSingle()
      .then(({ data }) => {
        setGlobalSettings(data);
        if (data?.registration_fee) {
          setRegFee(Number(data.registration_fee));
        }
      });
  }, []);

  useEffect(() => {
    fetchStaticData();
  }, []);

  async function fetchStaticData() {
    const { data: u } = await supabase.from("universities").select("*").order("name");
    setUnis(u || []);
    const { data: i } = await supabase.from("internships").select("*").order("title");
    setDbInternships(i || []);
  }

  async function handleUniChange(uniId: string) {
    setSelectedUni(uniId);
    setSelectedCol("");
    setStructures([]);
    const { data } = await supabase.from("colleges").select("*").eq("university_id", uniId).order("name");
    setColleges(data || []);
  }

  async function handleColChange(colId: string) {
    setSelectedCol(colId);
    const { data } = await supabase.from("academic_structures").select("*").eq("college_id", colId);
    setStructures(data || []);
    
    if (globalSettings?.college_fees && globalSettings.college_fees[colId]) {
      setRegFee(Number(globalSettings.college_fees[colId]));
    } else if (globalSettings?.registration_fee) {
      setRegFee(Number(globalSettings.registration_fee));
    } else {
      setRegFee(1500);
    }
  }

  async function handleLookup() {
    if (!rollNumber) return toast.error("Please enter roll number.");
    setLookupBusy(true);
    const { data, error } = await supabase.from("pre_registrations").select("*").eq("university_roll_number", rollNumber).maybeSingle();
    setLookupBusy(false);
    if (data) {
      if (data.is_claimed) {
        toast.error("Already registered. Please login.");
        navigate({ to: "/login" });
      } else {
        setFoundStudent(data);
        setMode("view");
        if (data.college_name) {
          supabase.from("colleges").select("id").eq("name", data.college_name).maybeSingle()
            .then(({ data: colMatch }) => {
              if (colMatch && globalSettings?.college_fees && globalSettings.college_fees[colMatch.id]) {
                setRegFee(Number(globalSettings.college_fees[colMatch.id]));
              } else if (globalSettings?.registration_fee) {
                setRegFee(Number(globalSettings.registration_fee));
              } else {
                setRegFee(1500);
              }
            });
        }
      }
    } else {
      setMode("form");
    }
  }

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRegistrationPayment = async () => {
    if (!registeredUser) return;
    setPaying(true);

    const loaded = await loadRazorpay();
    if (!loaded) {
      setPaying(false);
      return toast.error("Failed to load Razorpay payment gateway. Please check your internet connection.");
    }

    const options = {
      key: "rzp_live_SWf4eSr5QxJyrn",
      amount: Math.round(regFee * 100), // Dynamic fee in paise
      currency: "INR",
      name: "TechLaunchpad",
      description: "Platform Registration & Verification Fee",
      handler: async function (response: any) {
        try {
          // --- 1. SIGN UP THE USER AUTH IN SUPABASE ---
          const tempClient = createClient(
            import.meta.env.VITE_SUPABASE_URL,
            import.meta.env.VITE_SUPABASE_ANON_KEY,
            { auth: { persistSession: false } }
          );

          const { data: authData, error: authError } = await tempClient.auth.signUp({
            email: registeredUser.email,
            password: registeredPassword,
            options: { 
              data: { 
                full_name: registeredUser.full_name,
                role: "student", 
                raw_password: registeredPassword 
              }
            }
          });

          if (authError) throw authError;

          // --- 2. CREATE STUDENT PROFILE ---
          const profileData: any = {
            id: authData.user?.id,
            full_name: registeredUser.full_name,
            email: registeredUser.email,
            contact_number: registeredUser.contact_number,
            university_name: registeredUser.raw_lead_data.university_name,
            college_name: registeredUser.raw_lead_data.college_name,
            gender: registeredUser.raw_lead_data.gender,
            parent_name: registeredUser.raw_lead_data.parent_name,
            degree: registeredUser.raw_lead_data.degree,
            department: registeredUser.raw_lead_data.department || registeredUser.raw_lead_data.department_stream,
            semester: registeredUser.raw_lead_data.semester || registeredUser.raw_lead_data.class_semester,
            academic_session: registeredUser.raw_lead_data.academic_session,
            university_roll_number: registeredUser.university_roll_number,
            program: registeredUser.program,
            role: "student",
            raw_password: registeredPassword,
            created_at: new Date().toISOString()
          };

          const { error: profileError } = await supabase.from("profiles").insert([profileData]);
          if (profileError) throw profileError;

          // --- 3. MARK LEAD AS CLAIMED/PAID ---
          await supabase
            .from("leads")
            .update({ is_claimed: true })
            .eq("id", registeredUser.id);

          if (foundStudent) {
            await supabase
              .from("pre_registrations")
              .update({ is_claimed: true })
              .eq("id", foundStudent.id);
          } else {
            await supabase
              .from("pre_registrations")
              .update({ is_claimed: true })
              .eq("university_roll_number", registeredUser.university_roll_number);
          }

          // --- 4. RECORD SUCCESSFUL PAYMENT ---
          const newPayment = {
            student_id: authData.user?.id,
            amount: regFee,
            status: "Paid",
            slip_url: `https://dashboard.razorpay.com/app/payments/${response.razorpay_payment_id}`,
            created_at: new Date().toISOString()
          };
          const { error: payError } = await supabase.from("payments").insert([newPayment]);
          if (payError) throw payError;

          toast.success("Payment & Registration Completed successfully!");
          
          setPaymentResult({
            transactionId: response.razorpay_payment_id,
            amount: regFee,
            date: new Date().toLocaleString(),
            slipUrl: `https://dashboard.razorpay.com/app/payments/${response.razorpay_payment_id}`
          });
          setMode("payment_success");
        } catch (err: any) {
          toast.error("Failed to complete account registration: " + err.message);
        } finally {
          setPaying(false);
        }
      },
      prefill: {
        name: registeredUser.full_name,
        email: registeredUser.email,
        contact: registeredUser.contact_number
      },
      theme: {
        color: "#1e40af"
      },
      modal: {
        ondismiss: function () {
          setPaying(false);
        }
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  const handleAutoLogin = async () => {
    if (!registeredUser || !registeredPassword) {
      navigate({ to: "/login" });
      return;
    }
    setPaying(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: registeredUser.email,
        password: registeredPassword
      });
      if (error) throw error;
      toast.success("Welcome to your TechLaunchpad Student Dashboard!");
      navigate({ to: "/dashboard/student" });
    } catch (err: any) {
      toast.error("Auto-login failed: " + err.message + ". Please login manually.");
      navigate({ to: "/login" });
    } finally {
      setPaying(false);
    }
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!agreed) return toast.error("Please agree to terms.");
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd);
    if (data.password !== data.confirmPassword) return toast.error("Passwords do not match.");

    setBusy(true);
    try {
      const emailToUse = String(data.email || foundStudent?.email);
      
      // Let's construct the complete lead record
      const universityName = foundStudent?.university_name || unis.find(u => u.id === selectedUni)?.name || "";
      const collegeName = foundStudent?.college_name || colleges.find(c => c.id === selectedCol)?.name || "";
      
      const leadData: any = {
        full_name: String(data.full_name || foundStudent?.full_name),
        email: emailToUse,
        contact_number: String(data.contact_number || foundStudent?.contact_number),
        gender: String(data.gender || foundStudent?.gender || "Male"),
        parent_name: String(data.parent_name || foundStudent?.parent_name || ""),
        university_name: universityName,
        college_name: collegeName,
        degree: String(data.degree || foundStudent?.degree),
        department: String(data.department || foundStudent?.department || foundStudent?.department_stream),
        semester: String(data.semester || foundStudent?.semester || foundStudent?.class_semester),
        academic_session: String(data.academic_session || foundStudent?.academic_session),
        university_roll_number: String(data.university_roll_number || foundStudent?.university_roll_number),
        program: String(data.program),
        raw_password: String(data.password),
        is_claimed: false,
        created_at: new Date().toISOString()
      };

      let leadId = "";
      
      // Double check if this roll number is already registered in profiles
      const { data: profileCheck } = await supabase
        .from("profiles")
        .select("id")
        .eq("university_roll_number", leadData.university_roll_number)
        .maybeSingle();
      if (profileCheck) {
        throw new Error("This Roll Number is already registered in the system. Please login.");
      }

      // Check if lead already exists in our dedicated leads table
      const { data: existingLead } = await supabase
        .from("leads")
        .select("id, is_claimed")
        .eq("university_roll_number", leadData.university_roll_number)
        .maybeSingle();

      if (existingLead) {
        leadId = existingLead.id;
        // Update details of existing unclaimed lead in leads table
        const { error: updateError } = await supabase
          .from("leads")
          .update({ ...leadData, is_claimed: false })
          .eq("id", existingLead.id);
        if (updateError) throw updateError;
      } else {
        // Create new manual registration lead row in dedicated leads table
        const { data: insertedLead, error: insertError } = await supabase
          .from("leads")
          .insert([leadData])
          .select()
          .single();
        if (insertError) throw insertError;
        leadId = insertedLead.id;
      }

      // If they were pre-registered, also sync details to pre_registrations
      if (foundStudent) {
        await supabase
          .from("pre_registrations")
          .update({
            program: String(data.program),
            raw_password: String(data.password),
            created_at: new Date().toISOString()
          })
          .eq("id", foundStudent.id);
      }

      toast.success("Details saved successfully! Proceed to platform payment.");
      setRegisteredUser({
        id: leadId,
        full_name: leadData.full_name,
        email: leadData.email,
        contact_number: leadData.contact_number,
        university_roll_number: leadData.university_roll_number,
        program: leadData.program,
        raw_lead_data: leadData
      });
      setRegisteredPassword(String(data.password));
      setMode("payment_gateway");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      
      {/* COMPACT TOP BAR */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-8" />
            <div className="h-6 w-px bg-slate-200"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Portal Access</span>
          </div>
          <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest" onClick={() => navigate({ to: "/" })}>Close Form</Button>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 max-w-6xl">
        
        <div className="mb-6">
          <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tighter mb-1">REGISTRATION FORM</h2>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Online Portal</span> <ChevronRight size={12}/> <span>Enrollment</span> <ChevronRight size={12}/> <span className="text-[#1e40af]">{mode.toUpperCase()}</span>
          </div>
        </div>

        {/* NOTE BOX */}
        <div className="bg-[#fff9f9] border border-red-100 p-5 rounded-xl mb-8 flex gap-4 items-start shadow-sm">
          <div className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase">Note</div>
          <div className="text-[11px] text-slate-600 font-medium leading-relaxed">
            <p>• Special Characters are not allowed (e.g., <span className="font-mono text-red-500">{'< > ( ) [ ] { } ; :'}</span>).</p>
            <p>• Fields marked with <span className="text-red-500 font-bold">*</span> are mandatory and must be completed accurately.</p>
            <p>• Ensure your Email and Mobile Number are active for receiving program updates.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border overflow-hidden">
          
          {/* CHOICE MODE */}
          {mode === "choice" && (
            <div className="p-12 text-center space-y-12">
              <div className="max-w-xl mx-auto space-y-4">
                <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">Choose Your Path</h3>
                <p className="text-sm text-slate-500 font-medium">Verify your pre-authorized college record or register manually.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <button onClick={() => setMode("lookup")} className="group bg-slate-50 p-10 rounded-[2.5rem] border-2 border-slate-100 hover:border-[#1e40af] hover:bg-white transition-all text-left space-y-6">
                  <div className="size-20 rounded-2xl bg-blue-100 text-[#1e40af] grid place-items-center group-hover:bg-[#1e40af] group-hover:text-white transition-all shadow-lg"><Fingerprint size={40} /></div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Verify Enrollment</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium mt-2">Use your University Roll Number to fetch records shared by your college.</p>
                  </div>
                </button>

                <button onClick={() => setMode("form")} className="group bg-slate-50 p-10 rounded-[2.5rem] border-2 border-slate-100 hover:border-amber-600 hover:bg-white transition-all text-left space-y-6">
                  <div className="size-20 rounded-2xl bg-amber-100 text-amber-600 grid place-items-center group-hover:bg-amber-600 group-hover:text-white transition-all shadow-lg"><UserPlus size={40} /></div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Manual Register</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium mt-2">Fresh registration for students whose colleges are not yet on the portal.</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* LOOKUP MODE */}
          {mode === "lookup" && (
            <div className="p-20 text-center space-y-8">
              <div className="max-w-md mx-auto space-y-6">
                <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Verify Roll Number</h3>
                <Input 
                  placeholder="e.g. 210010103001" 
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="h-20 text-center font-mono text-3xl font-black border-4 rounded-3xl focus:border-[#1e40af]"
                />
                <Button onClick={handleLookup} disabled={lookupBusy} className="w-full h-16 bg-[#1e40af] hover:bg-blue-800 text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl">
                  {lookupBusy ? <Loader2 className="animate-spin" /> : "SEARCH RECORDS"}
                </Button>
                <button onClick={() => setMode("choice")} className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">Go Back</button>
              </div>
            </div>
          )}

          {/* VIEW MODE (PRE-AUTHORIZED) */}
          {mode === "view" && foundStudent && (
            <form onSubmit={onSubmit} className="space-y-0">
              <div className="bg-[#1e40af] px-8 py-4 flex items-center gap-3">
                <CheckCircle2 size={24} className="text-white" />
                <h3 className="text-white font-black uppercase tracking-widest text-sm">Enrollment Verified — Complete Your Profile</h3>
              </div>
              <div className="p-10 space-y-12">
                <div className="grid md:grid-cols-4 gap-8 bg-slate-50 p-10 rounded-3xl border border-slate-100">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Full Name</Label>
                    <div className="text-xl font-black text-[#1e40af] uppercase">{foundStudent.full_name}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">University</Label>
                    <div className="text-xl font-bold text-slate-800">{foundStudent.university_name}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Roll Number</Label>
                    <div className="text-xl font-black text-amber-600 font-mono">{foundStudent.university_roll_number}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Academic Session</Label>
                    <div className="text-xl font-black text-slate-700">{foundStudent.academic_session || "—"}</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Select Internship Domain <span className="text-red-500">*</span></Label>
                    <select name="program" defaultValue={foundStudent.program || ""} required className="w-full h-12 border-2 border-slate-100 rounded-xl px-4 text-xs font-bold bg-white focus:border-[#1e40af] outline-none">
                      <option value="">-- CHOOSE DOMAIN --</option>
                      {dbInternships.map(i => <option key={i.id} value={i.title}>{i.title}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Confirm Email Address <span className="text-red-500">*</span></Label>
                    <Input name="email" type="email" defaultValue={foundStudent.email} required className="h-12 border-2 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Create Login Password <span className="text-red-500">*</span></Label>
                    <Input name="password" type="password" required minLength={6} className="h-12 border-2 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Confirm Password <span className="text-red-500">*</span></Label>
                    <Input name="confirmPassword" type="password" required minLength={6} className="h-12 border-2 rounded-xl" />
                  </div>
                </div>

                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex items-center gap-4">
                  <Checkbox id="terms-v" checked={agreed} onCheckedChange={(c) => setAgreed(!!c)} className="size-6 border-2 border-[#1e40af]" />
                  <Label htmlFor="terms-v" className="text-xs font-bold text-[#1e40af] italic cursor-pointer select-none">"I declare that the information provided is correct and I agree to the program terms."</Label>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={busy} className="flex-1 h-16 bg-[#1e40af] hover:bg-blue-800 text-white font-black text-lg rounded-2xl shadow-xl uppercase tracking-widest">
                     {busy ? <Loader2 className="animate-spin mr-2" /> : "COMPLETE ENROLLMENT"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setMode("choice")} className="h-16 px-8 text-slate-400 font-black uppercase text-[10px] tracking-widest">Cancel</Button>
                </div>
              </div>
            </form>
          )}

          {/* FORM MODE (MANUAL) */}
          {mode === "form" && (
            <form onSubmit={onSubmit} className="space-y-0">
              
              {/* 1. PERSONAL IDENTITY */}
              <div className="bg-[#1e40af] px-8 py-3 flex items-center gap-3">
                <UserPlus size={18} className="text-white" />
                <h3 className="text-white font-black uppercase tracking-widest text-[11px]">01 — Personal Identity (व्यक्तिगत विवरण)</h3>
              </div>
              <div className="p-8 grid md:grid-cols-3 gap-6 border-b">
                <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-400">Full Name <span className="text-red-500">*</span></Label><Input name="full_name" required className="h-11 border-2 rounded-lg" /></div>
                <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-400">Gender <span className="text-red-500">*</span></Label>
                  <select name="gender" required className="w-full h-11 border-2 rounded-lg px-3 text-xs font-bold bg-white outline-none focus:border-[#1e40af]">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-400">Father's Name <span className="text-red-500">*</span></Label><Input name="parent_name" required className="h-11 border-2 rounded-lg" /></div>
                <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-400">Mobile No <span className="text-red-500">*</span></Label><Input name="contact_number" required className="h-11 border-2 rounded-lg" /></div>
                <div className="space-y-1.5 md:col-span-2"><Label className="text-[10px] font-black uppercase text-slate-400">Email Address <span className="text-red-500">*</span></Label><Input name="email" type="email" required className="h-11 border-2 rounded-lg" /></div>
              </div>

              {/* 2. ACADEMIC DETAILS */}
              <div className="bg-[#1e40af] px-8 py-3 flex items-center gap-3">
                <School size={18} className="text-white" />
                <h3 className="text-white font-black uppercase tracking-widest text-[11px]">02 — Academic Details (शैक्षणिक विवरण)</h3>
              </div>
              <div className="p-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6 border-b">
                <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-400">University <span className="text-red-500">*</span></Label>
                  <select value={selectedUni} onChange={(e) => handleUniChange(e.target.value)} required className="w-full h-11 border-2 rounded-lg px-3 text-[11px] font-bold bg-white">
                    <option value="">-- SELECT --</option>
                    {unis.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-400">College <span className="text-red-500">*</span></Label>
                  <select value={selectedCol} onChange={(e) => handleColChange(e.target.value)} disabled={!selectedUni} required className="w-full h-11 border-2 rounded-lg px-3 text-[11px] font-bold bg-white">
                    <option value="">-- SELECT --</option>
                    {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-400">Branch <span className="text-red-500">*</span></Label>
                  <select name="department" disabled={!selectedCol} required className="w-full h-11 border-2 rounded-lg px-3 text-[11px] font-bold bg-white">
                    <option value="">-- SELECT --</option>
                    {Array.from(new Set(structures.map(s => s.department))).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-400">Degree <span className="text-red-500">*</span></Label>
                  <select name="degree" disabled={!selectedCol} required className="w-full h-11 border-2 rounded-lg px-3 text-[11px] font-bold bg-white">
                    <option value="">-- SELECT --</option>
                    {Array.from(new Set(structures.map(s => s.degree))).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-400">Roll Number <span className="text-red-500">*</span></Label><Input name="university_roll_number" required className="h-11 border-2 rounded-lg font-mono" /></div>
                <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-400">Semester <span className="text-red-500">*</span></Label><Input name="semester" placeholder="e.g. 4th" required className="h-11 border-2 rounded-lg" /></div>
                <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-400">Academic Session <span className="text-red-500">*</span></Label>
                  <select name="academic_session" disabled={!selectedCol} required className="w-full h-11 border-2 rounded-lg px-3 text-[11px] font-bold bg-white">
                    <option value="">-- SELECT --</option>
                    {(structures.some(s => s.session) ? Array.from(new Set(structures.map(s => s.session).filter(Boolean))) : ["2021-25", "2022-26", "2023-27", "2024-28"]).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. ACCESS & SECURITY */}
              <div className="bg-[#1e40af] px-8 py-3 flex items-center gap-3">
                <ShieldCheck size={18} className="text-white" />
                <h3 className="text-white font-black uppercase tracking-widest text-[11px]">03 — Access & Security (प्रवेश और सुरक्षा)</h3>
              </div>
              <div className="p-8 space-y-10">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-400">Internship Domain <span className="text-red-500">*</span></Label>
                    <select name="program" defaultValue={preSelectedProgram || ""} required className="w-full h-11 border-2 border-[#1e40af]/20 bg-blue-50/50 rounded-lg px-3 text-[10px] font-black uppercase tracking-widest text-[#1e40af]">
                      <option value="">-- CHOOSE --</option>
                      {dbInternships.map(i => <option key={i.id} value={i.title}>{i.title}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-400">Create Password <span className="text-red-500">*</span></Label><Input name="password" type="password" required minLength={6} className="h-11 border-2 rounded-lg" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-400">Confirm Password <span className="text-red-500">*</span></Label><Input name="confirmPassword" type="password" required minLength={6} className="h-11 border-2 rounded-lg" /></div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border flex items-start gap-4">
                  <Checkbox id="terms-m" checked={agreed} onCheckedChange={(c) => setAgreed(!!c)} className="mt-1 border-2 border-[#1e40af]" />
                  <Label htmlFor="terms-m" className="text-xs font-bold leading-tight text-slate-500 italic">"I hereby declare that all information given above is true and correct."</Label>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={busy} className="flex-1 h-14 bg-[#1e40af] hover:bg-blue-800 text-white font-black text-sm rounded-xl uppercase tracking-widest shadow-lg shadow-blue-500/10">
                     {busy ? <Loader2 className="animate-spin" /> : "PROCEED TO REGISTER"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setMode("choice")} className="h-14 px-8 font-black uppercase text-[10px] text-slate-400 tracking-widest">Cancel</Button>
                </div>
              </div>
            </form>
          )}

          {/* PAYMENT GATEWAY MODE */}
          {mode === "payment_gateway" && registeredUser && (
            <div className="p-12 space-y-8 max-w-xl mx-auto text-center animate-in fade-in duration-500">
              <div className="size-20 rounded-2xl bg-amber-50 text-gold grid place-items-center mx-auto shadow-md">
                <CreditCard size={40} className="text-[#1e40af]" />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Registration Fee</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Secure Platform Processing & Enrollment Verification</p>
              </div>

              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 space-y-4 text-left">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span>Student Name:</span>
                  <span className="text-slate-800 font-black">{registeredUser.full_name}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span>Selected Program:</span>
                  <span className="text-slate-800 font-black">{registeredUser.program}</span>
                </div>
                <div className="h-px bg-slate-200"></div>
                <div className="flex justify-between items-center text-sm font-black text-slate-700 uppercase">
                  <span>Platform Verification Fee:</span>
                  <span className="text-slate-800 font-black">₹{regFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-black text-slate-700 uppercase">
                  <span>Gateway Taxes & Processing:</span>
                  <span className="text-green-600 text-xs font-black">Waived (₹0)</span>
                </div>
                <div className="h-px bg-slate-200"></div>
                <div className="flex justify-between items-center text-lg font-black text-navy-deep uppercase">
                  <span>Total Amount Payable:</span>
                  <span className="text-gold text-2xl font-black">₹{regFee.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <Button 
                onClick={handleRegistrationPayment} 
                disabled={paying}
                className="w-full h-16 bg-[#1e40af] hover:bg-blue-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"
              >
                {paying ? <Loader2 className="animate-spin mr-2" /> : <CreditCard size={18} />}
                PAY ₹{regFee.toLocaleString('en-IN')} via Razorpay
              </Button>
            </div>
          )}

          {/* PAYMENT SUCCESS MODE */}
          {mode === "payment_success" && paymentResult && (
            <div className="p-12 space-y-8 max-w-xl mx-auto text-center animate-in fade-in duration-500">
              <div className="size-20 rounded-full bg-green-50 text-green-500 grid place-items-center mx-auto shadow-md">
                <CheckCircle2 size={44} />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-black text-green-600 uppercase tracking-tighter">Payment Successful!</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Your enrollment is verified and official digital receipt is ready.</p>
              </div>

              {/* RECEIPT BOX */}
              <div className="bg-white rounded-3xl p-8 border-2 border-dashed border-slate-200 text-left space-y-4 shadow-sm relative">
                <div className="absolute top-4 right-4 text-[9px] font-black text-green-600 uppercase bg-green-50 border border-green-200 px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={10} /> Paid
                </div>
                
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Digital Receipt</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span>Transaction ID:</span>
                    <span className="text-slate-800 font-mono font-black">{paymentResult.transactionId}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span>Paid For:</span>
                    <span className="text-slate-800 font-black">Platform Verification Fee</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span>Amount Paid:</span>
                    <span className="text-slate-800 font-black">₹{paymentResult.amount}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span>Date & Time:</span>
                    <span className="text-slate-800 font-black">{paymentResult.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Button 
                  onClick={() => window.open(paymentResult.slipUrl, "_blank")}
                  className="w-full h-14 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest border"
                >
                  <Printer size={16} className="mr-2" /> Download Receipt
                </Button>
                
                <Button 
                  onClick={handleAutoLogin} 
                  disabled={paying}
                  className="w-full h-16 bg-[#1e40af] hover:bg-blue-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"
                >
                  {paying ? <Loader2 className="animate-spin" /> : "GO TO STUDENT DASHBOARD"}
                </Button>
              </div>
            </div>
          )}

        </div>

        <div className="mt-12 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
          © 2026 OFFICIAL PORTAL — TechLaunchpad
        </div>

      </div>
      <SiteFooter />
      <ChatbotWidget />
    </div>
  );
}
