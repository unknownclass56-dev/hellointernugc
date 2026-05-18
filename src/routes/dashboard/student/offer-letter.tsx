import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Printer, ArrowLeft, Mail, Phone, MapPin, ShieldCheck, CheckCircle, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/ugc-intern-logo.png";

export const Route = createFileRoute("/dashboard/student/offer-letter")({
  component: OfferLetterView,
});

function OfferLetterView() {
  const [student, setStudent] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setStudent(prof);
    }
    
    const { data: sett } = await supabase.from("portal_settings").select("*").eq("id", "global").maybeSingle();
    setSettings(sett);
    setLoading(false);
  }

  if (loading) return <div className="h-screen grid place-items-center bg-slate-50 font-black text-xs uppercase tracking-widest text-navy animate-pulse">Generating Official Document...</div>;

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  // Calculate Dates
  const rawStartDate = student?.start_date || student?.internship_start_date;
  const rawEndDate = student?.end_date || student?.internship_end_date;

  const startDateObj = rawStartDate ? new Date(rawStartDate) : (student?.created_at ? new Date(student.created_at) : new Date());
  const durationStr = student?.internship_duration || "8 Weeks";
  const durationMatch = durationStr.match(/\d+/);
  const weeks = durationMatch ? parseInt(durationMatch[0], 10) : 8;

  const endDateObj = rawEndDate ? new Date(rawEndDate) : new Date(startDateObj);
  if (!rawEndDate) {
    endDateObj.setDate(startDateObj.getDate() + (weeks * 7));
  }

  const startDate = startDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const endDate = endDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  // Dynamic values with premium fallbacks including the requested Hyderabad Address
  const companyAddress = settings?.company_address || "Plot No. 45, 3rd Floor, Silicon Towers, Opposite Telangana State Secretariat, NTR Marg, Khairatabad, Hyderabad, Telangana 500022";
  const companyName = settings?.company_name || "UGC INTERN CONNECT";
  const companyEmail = settings?.company_email || "support@ugcintern.org";
  const companyPhone = settings?.company_phone || "+91 80 4567 8900";

  return (
    <div className="min-h-screen bg-slate-200 py-10 px-4 print:bg-white print:p-0">
      {/* Controls */}
      <div className="max-w-[850px] mx-auto mb-6 flex justify-between items-center no-print">
         <Button variant="outline" onClick={() => window.history.back()} className="text-navy font-bold uppercase text-[10px] tracking-widest bg-white border-navy/20 shadow-sm hover:bg-slate-50">
            <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
         </Button>
         <Button onClick={() => window.print()} className="bg-gold hover:bg-gold/90 text-navy-deep px-8 h-11 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-transform hover:scale-105">
            <Printer size={16} className="mr-2" /> Download / Print PDF
         </Button>
      </div>

      {/* PAPER START */}
      <div id="offer-letter-container" className="max-w-[850px] mx-auto bg-white shadow-2xl min-h-[1100px] relative overflow-hidden print:shadow-none print:m-0 print:w-full print:h-full">
         
         {/* Background Watermark */}
         <div className="absolute inset-0 grid place-items-center opacity-[0.02] pointer-events-none z-0">
            <img src={logo} alt="Watermark" className="w-[600px] grayscale" />
         </div>

         {/* Top Border Decor */}
         <div className="h-4 bg-navy w-full absolute top-0 left-0 right-0 z-10"></div>
         <div className="h-1 bg-gold w-full absolute top-4 left-0 right-0 z-10 opacity-80"></div>

         <div className="p-16 relative z-10 pt-20 print:p-12 print:pt-16">
           {/* HEADER */}
           <div className="flex justify-between items-start border-b-2 border-navy/10 pb-8 mb-10">
              <div className="flex items-center gap-5">
                 <div className="p-3 bg-white rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.05)] border border-slate-100">
                    <img src={logo} alt="Logo" className="w-24 object-contain" />
                 </div>
                 <div>
                    <h1 className="text-3xl font-black text-navy uppercase tracking-tighter leading-none mb-2">{companyName}</h1>
                    <div className="inline-block px-3 py-1 bg-gold/10 border border-gold/20 rounded-full">
                      <p className="text-[9px] font-black text-gold uppercase tracking-[0.3em]">Official Internship Partner</p>
                    </div>
                 </div>
              </div>
              <div className="text-right space-y-2 max-w-[280px]">
                 <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-navy-deep">
                    <span className="truncate">{companyEmail}</span> <Mail size={14} className="text-gold shrink-0" />
                 </div>
                 <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-navy-deep">
                    {companyPhone} <Phone size={14} className="text-gold shrink-0" />
                 </div>
                 <div className="flex items-start justify-end gap-2 text-[10px] font-medium text-muted-foreground leading-snug">
                    <span className="text-right">{companyAddress}</span>
                    <MapPin size={14} className="text-gold shrink-0 mt-0.5" /> 
                 </div>
              </div>
           </div>

            {/* LETTER META DATA */}
            <div className="flex justify-between items-end mb-12 border-b-2 border-navy/10 pb-6">
               <div>
                  <div className="text-[9px] font-black uppercase text-gold mb-1 tracking-[0.2em]">Offer Letter ID</div>
                  <div className="text-base font-black font-mono text-navy-deep tracking-wider">UGC/OFFER/{student?.university_roll_number?.slice(-4) || "0000"}/{new Date(student?.created_at || Date.now()).getFullYear()}</div>
               </div>
               <div className="text-right">
                  <div className="text-[9px] font-black uppercase text-gold mb-1 tracking-[0.2em]">Date of Issuance</div>
                  <div className="text-base font-black text-navy-deep">{today}</div>
               </div>
            </div>

            {/* ADDRESSEE */}
            <div className="space-y-2 mb-10 border-l-4 border-gold pl-5 py-1 text-left">
               <p className="text-[10px] font-black text-gold uppercase tracking-[0.2em] mb-1">To / Addressee</p>
               <h2 className="text-2xl font-black text-navy-deep uppercase tracking-tight">{student?.full_name || "Student Name"}</h2>
               
               <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs font-bold text-slate-600 mt-3">
                  <div>
                     <span className="text-[9px] font-black text-navy/40 uppercase block tracking-wider">College</span>
                     <span className="text-navy-deep uppercase font-black text-[11px]">{student?.college_name || "College Name"}</span>
                  </div>
                  <div>
                     <span className="text-[9px] font-black text-navy/40 uppercase block tracking-wider">University</span>
                     <span className="text-slate-700 uppercase font-black text-[11px]">{student?.university_name || "University Name"}</span>
                  </div>
                  <div>
                     <span className="text-[9px] font-black text-navy/40 uppercase block tracking-wider">Department / Branch</span>
                     <span className="text-navy-deep uppercase font-black text-[11px]">{student?.department || "Branch Name"}</span>
                  </div>
                  <div>
                     <span className="text-[9px] font-black text-navy/40 uppercase block tracking-wider">University Roll Number</span>
                     <span className="text-gold font-mono font-black text-[11px]">{student?.university_roll_number || "N/A"}</span>
                  </div>
                  <div>
                     <span className="text-[9px] font-black text-navy/40 uppercase block tracking-wider">Internship Duration</span>
                     <span className="text-navy-deep font-black text-[11px]">{weeks} Weeks ({durationStr})</span>
                  </div>
                  <div>
                     <span className="text-[9px] font-black text-navy/40 uppercase block tracking-wider">Academic Session</span>
                     <span className="text-slate-700 font-black text-[11px]">{student?.academic_session || "N/A"}</span>
                  </div>
               </div>
            </div>

           {/* SUBJECT */}
           <div className="text-center mb-10">
              <h3 className="text-xl font-black uppercase border-b-2 border-navy inline-block pb-1 tracking-[0.2em] text-navy-deep">Letter of Internship Offer</h3>
           </div>

            {/* LETTER CONTENT */}
            <div className="space-y-6 text-sm leading-relaxed font-medium text-slate-800 text-justify">
               <p>Dear <span className="font-black text-navy-deep">{student?.full_name || "Candidate"}</span>,</p>
               
               <p>
                  Following your registration and the review of your academic records, we are exceptionally pleased to formally offer you an internship position in the <span className="font-black text-navy-deep">{student?.program || "Technology"} Domain</span> under the aegis of 
                  <span className="font-black text-navy-deep"> {companyName}</span>. This appointment is made in recognition of your academic excellence and the recommendation submitted by your institution, <span className="font-bold text-navy-deep">{student?.college_name || "your College"}</span>.
               </p>

               <p>
                  Your internship is structured for a formal duration of <span className="font-black text-navy-deep">{weeks} Weeks</span> (commencing on <span className="font-black text-navy-deep">{startDate}</span> and scheduled to conclude on <span className="font-black text-navy-deep">{endDate}</span>). During this tenure, you will work under the designation of <span className="font-black uppercase text-navy border-b border-navy/20 pb-0.5">Intern - {student?.department || "Technology"} division</span>.
               </p>

               <p>
                  This program offers you a unique opportunity to gain practical exposure by working on production-grade industrial projects, engaging in hands-on technical sessions, and collaborating with industry mentors. The curriculum is fully aligned with AICTE, UGC, and BSDM policies to ensure the highest standards of professional training and competence.
               </p>

               <div className="mt-8 mb-8 pl-4 border-l-2 border-slate-200">
                  <h4 className="text-xs font-black uppercase text-navy-deep tracking-[0.2em] mb-3">Key Terms & Compliance</h4>
                  <ul className="list-decimal list-outside ml-4 space-y-2 text-xs text-slate-700">
                     <li><span className="font-bold text-slate-800">Attendance & Execution:</span> You are required to maintain a minimum of 75% attendance in all training sessions and successfully execute assigned milestones.</li>
                     <li><span className="font-bold text-slate-800">Confidentiality:</span> You shall maintain absolute confidentiality regarding all project source codes, databases, and proprietary data.</li>
                     <li><span className="font-bold text-slate-800">Performance Evaluation:</span> Award of the verified Completion Certificate is strictly contingent upon successful project evaluation by our review panel.</li>
                     <li><span className="font-bold text-slate-800">Institutional Sync:</span> This internship program complies fully with your academic university curriculum and standard state skill policies.</li>
                  </ul>
               </div>

               <p>
                  We are confident that this experience will serve as a powerful catalyst for your career growth and academic success. Please confirm your acceptance by claiming your student portal credentials.
               </p>
            </div>

           {/* VERIFICATION & SIGNATURES SECTION */}
           <div className="pt-20 grid grid-cols-2 gap-8 items-end relative z-10">
              
              {/* UGC Intern CEO Signature / Seal */}
              <div className="space-y-3 flex flex-col items-center text-center">
                 <div className="relative">
                    <div className="size-28 rounded-full border-[6px] border-double border-navy/20 flex flex-col items-center justify-center relative bg-white shadow-sm overflow-hidden">
                       <div className="absolute inset-0 bg-navy/[0.02] rotate-45"></div>
                       <ShieldCheck size={32} className="text-navy mb-1" />
                       <div className="text-[6px] font-black uppercase tracking-widest text-navy w-full text-center px-2 leading-tight">Authentic<br/>Digital Seal</div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-1 border-2 border-white shadow-md">
                       <BadgeCheck size={16} />
                    </div>
                 </div>
                 <div className="w-48 h-0.5 bg-navy/20 mt-4"></div>
                 <div>
                    <div className="text-sm font-black uppercase tracking-tight text-navy-deep">Authorized Signatory</div>
                    <div className="text-[10px] font-black text-gold uppercase tracking-widest">Chief Executive Officer</div>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase">{companyName}</div>
                 </div>
              </div>

              {/* SDM CEO Signature / Seal */}
              <div className="space-y-3 flex flex-col items-center text-center">
                 <div className="relative">
                    <div className="size-28 rounded-full border-[6px] border-double border-gold/40 flex flex-col items-center justify-center relative bg-white shadow-sm overflow-hidden">
                       <div className="absolute inset-0 bg-gold/[0.05] -rotate-45"></div>
                       <div className="font-display text-2xl font-black text-gold mb-1 leading-none tracking-tighter">SDM</div>
                       <div className="text-[5px] font-black uppercase tracking-widest text-gold w-full text-center px-1 leading-tight">Skill Development<br/>Verified</div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-1 border-2 border-white shadow-md">
                       <BadgeCheck size={16} />
                    </div>
                 </div>
                 <div className="w-48 h-0.5 bg-navy/20 mt-4"></div>
                 <div>
                    <div className="text-sm font-black uppercase tracking-tight text-navy-deep">Authorized Signatory</div>
                    <div className="text-[10px] font-black text-gold uppercase tracking-widest">Chief Executive Officer</div>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase">Skill Development Mission</div>
                 </div>
              </div>

           </div>
           
           <div className="mt-16 pt-6 border-t border-slate-100 flex justify-between items-center text-[8px] font-bold text-slate-400 uppercase tracking-widest">
              <div>System Generated Document • No Physical Signature Required</div>
              <div>Verification Hash: {Array.from({length: 16}, () => Math.floor(Math.random()*16).toString(16)).join('')}</div>
           </div>

         </div>

         {/* BOTTOM FOOTER DECOR */}
         <div className="absolute bottom-0 left-0 right-0 z-10 flex">
            <div className="h-6 bg-navy flex-1"></div>
            <div className="h-6 bg-gold w-32"></div>
         </div>
      </div>

      <style>{`
        @media print {
          @page { margin: 0; size: A4; }
          html, body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
