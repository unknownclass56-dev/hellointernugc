import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  ShieldCheck, 
  Printer, 
  Search, 
  Users, 
  Briefcase, 
  Award, 
  BadgeCheck, 
  UserCheck,
  CheckSquare,
  Square
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/techlaunchpad-logo.png";

export const Route = createFileRoute("/dashboard/certificates")({
  component: AdminCertificatesPage,
});

function AdminCertificatesPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Bulk selection state
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [generatedStudents, setGeneratedStudents] = useState<any[]>([]);
  const [showCertificates, setShowCertificates] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name", { ascending: true });

      if (data) {
        setStudents(data);
        setFilteredStudents(data);

        // Gather unique domains (programs) from profiles
        const uniqueDomains = Array.from(
          new Set(
            data
              .map((s: any) => s.program)
              .filter((p: any) => p && p.trim() !== "")
          )
        ) as string[];
        
        if (uniqueDomains.length === 0) {
          setDomains([
            "Web Development",
            "Artificial Intelligence",
            "Cybersecurity",
            "Data Science",
            "Python Programming",
            "Machine Learning",
            "Android Development"
          ]);
        } else {
          setDomains(uniqueDomains);
        }
      }
    } catch (err) {
      console.error("Error fetching students for certificate generator:", err);
    } finally {
      setLoading(false);
    }
  }

  // Filter students based on Domain selection and Search query
  useEffect(() => {
    let result = students;

    if (selectedDomain) {
      result = result.filter(
        (s) => s.program && s.program.toLowerCase() === selectedDomain.toLowerCase()
      );
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          (s.full_name && s.full_name.toLowerCase().includes(q)) ||
          (s.university_roll_number && s.university_roll_number.toLowerCase().includes(q)) ||
          (s.college_name && s.college_name.toLowerCase().includes(q))
      );
    }

    setFilteredStudents(result);
    // Reset selected student IDs when filters change to prevent accidental printing of hidden students
    setSelectedStudentIds([]);
    setShowCertificates(false);
  }, [selectedDomain, searchQuery, students]);

  // Bulk Selection Handlers
  const handleToggleSelectStudent = (studentId: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
    setShowCertificates(false);
  };

  const handleToggleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      // Unselect all
      setSelectedStudentIds([]);
    } else {
      // Select all visible matching students
      setSelectedStudentIds(filteredStudents.map(s => s.id));
    }
    setShowCertificates(false);
  };

  const handleGenerateCertificates = async () => {
    const selectedProfiles = students.filter(s => selectedStudentIds.includes(s.id));
    if (selectedProfiles.length > 0) {
      setLoading(true);
      for (const p of selectedProfiles) {
        await supabase.from("profiles").update({ certificate_generated: true }).eq("id", p.id);
      }
      setLoading(false);
      setGeneratedStudents(selectedProfiles);
      setShowCertificates(true);
      
      const updatedStudents = students.map(s => selectedStudentIds.includes(s.id) ? { ...s, certificate_generated: true } : s);
      setStudents(updatedStudents);
    }
  };

  const today = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6 pb-20 print:p-0 print:m-0">
      
      {/* HEADER SECTION */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 print:hidden">
        <div>
          <div className="text-xs uppercase tracking-wider text-gold font-bold">Administration Control</div>
          <h1 className="font-display text-3xl font-bold text-navy-deep flex items-center gap-2">
            <Award className="text-gold" /> Bulk Student Certificate Hub
          </h1>
          <p className="text-muted-foreground text-sm">Select multiple students domain-wise & batch-generate official Completion Certificates.</p>
        </div>
      </div>

      {/* GENERATOR WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start print:block">
        
        {/* LEFT COLUMN: FILTERS & STUDENT SELECTION TABLE */}
        <div className="lg:col-span-1 space-y-6 print:hidden">
          
          {/* SEARCH & FILTER CONTROLS */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-navy-deep uppercase tracking-wider flex items-center gap-2">
              <Briefcase size={16} className="text-gold" /> Filter Criteria
            </h3>
            
            {/* DOMAIN SELECTOR */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Internship Domain</label>
              <select
                value={selectedDomain}
                onChange={(e) => {
                  setSelectedDomain(e.target.value);
                }}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-navy focus:outline-none focus:ring-2 focus:ring-navy/20"
              >
                <option value="">All Domains / Programs</option>
                {domains.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* SEARCH INPUT */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Search Student</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by Name, Roll No, College..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-11 rounded-xl text-xs font-bold text-navy"
                />
              </div>
            </div>
          </div>

          {/* STUDENT SELECTION CARD */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col max-h-[500px]">
            <div className="bg-navy p-4 flex items-center justify-between">
              <span className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Users size={14} className="text-gold" /> Students ({filteredStudents.length})
              </span>
              {filteredStudents.length > 0 && (
                <button 
                  onClick={handleToggleSelectAll}
                  className="text-[10px] font-black uppercase text-gold hover:text-white transition-colors flex items-center gap-1.5"
                >
                  {selectedStudentIds.length === filteredStudents.length ? "Deselect All" : "Select All"}
                </button>
              )}
            </div>
            
            <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
              {loading ? (
                <div className="p-8 text-center text-xs text-muted-foreground italic flex flex-col items-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-navy"></span>
                  Loading student profiles...
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground italic">
                  No matching registered students found.
                </div>
              ) : (
                filteredStudents.map((s) => {
                  const isSelected = selectedStudentIds.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      onClick={() => handleToggleSelectStudent(s.id)}
                      className={`p-3 text-left transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected 
                          ? "bg-gold/5" 
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        {isSelected ? (
                          <CheckSquare className="size-4 text-gold shrink-0 mt-0.5" />
                        ) : (
                          <Square className="size-4 text-slate-300 shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-1 min-w-0">
                          <div className="text-xs font-black text-navy-deep truncate capitalize">{s.full_name || "Anonymous"}</div>
                          <div className="text-[9px] font-black text-gold font-mono truncate">{s.university_roll_number || "NO ROLL NO"}</div>
                          <div className="text-[9px] font-bold text-slate-400 truncate capitalize">{s.college_name || "No College"}</div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* GENERATE ACTION BUTTON */}
          {selectedStudentIds.length > 0 && (
            <Button
              onClick={handleGenerateCertificates}
              className="w-full bg-gold hover:bg-gold/90 text-navy-deep font-black text-xs uppercase tracking-widest h-14 rounded-2xl gap-3 shadow-lg shadow-gold/20 hover:scale-[1.02] transition-transform"
            >
              <UserCheck size={18} /> Generate Certificates ({selectedStudentIds.length})
            </Button>
          )}
        </div>

        {/* RIGHT COLUMN: CERTIFICATE RENDERING AND PREVIEW */}
        <div className="lg:col-span-2 print:w-full">
          
          {selectedStudentIds.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl h-[600px] flex flex-col items-center justify-center text-center p-8 print:hidden">
              <Award size={64} className="text-slate-300 mb-4" />
              <h3 className="text-base font-black text-navy-deep uppercase tracking-wider">No Students Selected</h3>
              <p className="text-xs text-muted-foreground mt-2 max-w-sm">
                Filter students by their internship domain using the panels on the left, check the students you wish to generate, and click "Generate Certificates".
              </p>
            </div>
          ) : !showCertificates ? (
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 h-[600px] flex flex-col items-center justify-center text-center space-y-4 print:hidden">
              <div className="size-16 rounded-full bg-gold/10 grid place-items-center mb-2">
                <Users size={28} className="text-gold" />
              </div>
              <h3 className="text-lg font-black text-navy-deep uppercase tracking-wider capitalize">
                Batch Generation Configured
              </h3>
              <div className="bg-white p-4 rounded-2xl border text-left text-xs max-w-md w-full space-y-2 font-medium text-slate-600">
                <div className="flex justify-between border-b pb-1">
                  <span className="font-bold text-navy-deep">Selected Candidates:</span>
                  <span className="font-black text-gold">{selectedStudentIds.length} Students</span>
                </div>
                <div className="max-h-[150px] overflow-y-auto divide-y space-y-1 pt-1">
                  {students.filter(s => selectedStudentIds.includes(s.id)).map((s, idx) => (
                    <div key={s.id} className="text-[10px] py-1 flex justify-between">
                      <span className="capitalize font-bold text-navy truncate max-w-[200px]">{s.full_name}</span>
                      <span className="font-mono text-slate-400">{s.university_roll_number}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                Click the Generate button below to batch-populate certificates. All certificates will print on individual A4 pages automatically.
              </p>
              <Button
                onClick={handleGenerateCertificates}
                className="bg-gold hover:bg-gold/90 text-navy-deep font-black text-xs uppercase tracking-widest h-12 px-8 rounded-xl gap-2 shadow-lg shadow-gold/10"
              >
                Generate Certificates Now
              </Button>
            </div>
          ) : (
            /* BATCH GENERATED CERTIFICATES SCREEN */
            <div className="space-y-6 print:space-y-0">
              
              {/* BATCH ACTIONS (HIDES DURING PRINT) */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4 print:hidden">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Previewing Batch: {generatedStudents.length} Certificates</span>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => window.print()} className="bg-navy hover:bg-navy-deep text-white font-black text-xs uppercase tracking-widest h-10 px-5 rounded-xl gap-2 shadow-md">
                    <Printer size={14} /> Print All ({generatedStudents.length})
                  </Button>
                  <Button onClick={() => setShowCertificates(false)} variant="outline" className="text-xs font-black uppercase tracking-widest h-10 px-5 rounded-xl border-slate-200 text-slate-500 hover:bg-slate-50">
                    Close Preview
                  </Button>
                </div>
              </div>

              {/* VERTICAL PREVIEW STACK OF LANDSCAPE CERTIFICATES */}
              <div className="space-y-8 bg-slate-50/50 p-6 rounded-3xl border print:p-0 print:bg-white print:border-none print:space-y-0">
                {generatedStudents.map((s, idx) => {
                  const sCertId = `TL/OFFER/${s.university_roll_number?.slice(-4) || "0000"}/${new Date(s.created_at || Date.now()).getFullYear()}`;
                  const sDuration = s.internship_duration || "8 Weeks";
                  
                  return (
                    <div 
                      key={s.id} 
                      className="flex flex-col items-center relative print:block print:w-full print:m-0 print:border-none page-break-after"
                    >
                      {/* LANDSCAPE CERTIFICATE BOX */}
                      <div 
                        className="w-[960px] h-[678px] bg-white p-12 shadow-xl relative border-[12px] border-double border-navy flex flex-col justify-between items-center text-center select-none print:shadow-none print:m-0 print:w-full print:h-[100vh] print:border-[10px]"
                        style={{ boxSizing: "border-box" }}
                      >
                        {/* WATERMARK BACKGROUND */}
                        <div className="absolute inset-0 opacity-[0.02] flex items-center justify-center pointer-events-none z-0">
                          <img src={logo} alt="Watermark" className="w-[380px] grayscale object-contain" />
                        </div>

                        {/* INNER BORDER */}
                        <div className="absolute inset-2 border-2 border-gold/40 pointer-events-none z-10"></div>

                        {/* TOP HEADER */}
                        <div className="w-full flex justify-between items-start relative z-20">
                          <div className="text-left">
                            <span className="text-[10px] font-black text-gold uppercase tracking-[0.25em] block mb-1">Aligned Verification ID</span>
                            <span className="font-mono text-xs font-bold text-navy-deep bg-slate-100 px-3 py-1 rounded-md border">{sCertId}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-black text-gold uppercase tracking-[0.25em] block mb-1">Security Standard</span>
                            <span className="text-[9px] font-black text-navy border border-navy/30 px-2 py-0.5 rounded bg-white">ISO 9001:2015 · AICTE · BSDM</span>
                          </div>
                        </div>

                        {/* MAIN CERTIFICATE DETAILS */}
                        <div className="space-y-3 max-w-4xl relative z-20 mt-2">
                          <div className="flex justify-center mb-1">
                            <Award className="text-gold size-12" />
                          </div>
                          <h1 className="font-display text-3xl font-black text-navy-deep uppercase tracking-[0.15em]">
                            Certificate of Completion
                          </h1>
                          <div className="h-0.5 w-60 bg-gold mx-auto my-2 relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                              <BadgeCheck className="text-gold size-5" />
                            </div>
                          </div>
                          
                          <p className="text-xs font-medium text-slate-500 italic uppercase tracking-[0.1em] mt-1">
                            This is proudly presented to
                          </p>
                          
                          {/* STUDENT NAME */}
                          <h2 className="text-3xl font-black font-display text-navy-deep underline decoration-gold/40 underline-offset-8 decoration-2 capitalize tracking-wide py-1">
                            {s.full_name || "STUDENT NAME"}
                          </h2>

                          {/* STAGED DETAILS STATEMENT */}
                          <div className="text-[12px] text-slate-700 leading-relaxed max-w-3xl mx-auto space-y-1.5 font-medium px-4 mt-3">
                            <p>
                              for successfully completing a structured technical internship program in the domain of{" "}
                              <span className="font-black text-navy-deep text-xs underline decoration-gold/60">{s.program || "Software Engineering"}</span>.
                            </p>
                            <p className="text-slate-600 text-[10px]">
                              Institution: <span className="font-bold text-navy-deep">{s.college_name || "COLLEGE NAME"}</span> 
                              <span className="mx-2 text-slate-300">|</span> 
                              University: <span className="font-bold text-navy-deep">{s.university_name || "UNIVERSITY NAME"}</span>
                            </p>
                            <p className="text-slate-600 text-[10px]">
                              Department: <span className="font-bold text-navy-deep">{s.department || "BRANCH"}</span>
                              <span className="mx-2 text-slate-300">|</span> 
                              Degree: <span className="font-bold text-navy-deep">{s.degree || "DEGREE"}</span>
                              <span className="mx-2 text-slate-300">|</span> 
                              University Roll No: <span className="font-mono font-bold text-gold">{s.university_roll_number || "ROLL NUMBER"}</span>
                            </p>
                            <p className="text-slate-600 text-[10px]">
                              The candidate has fully satisfied all project milestones, assignments, and training requirements over a formal program duration of{" "}
                              <span className="font-bold text-navy-deep bg-slate-100 px-2 py-0.5 rounded">{sDuration}</span>.
                            </p>
                          </div>
                        </div>

                        {/* BOTTOM SIGNATURE SECTION */}
                        <div className="w-full grid grid-cols-3 items-end mt-4 relative z-20">
                          <div className="flex flex-col items-center">
                            <div className="text-xs font-black text-navy-deep font-mono mb-1">TECHLAUNCHPAD</div>
                            <div className="h-px w-32 bg-slate-300 my-1"></div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Director, TechLaunchpad</span>
                          </div>

                          <div className="flex flex-col items-center justify-center">
                            <div className="size-16 rounded-full border-4 border-gold/40 flex flex-col items-center justify-center bg-gold/5 relative p-1 shadow-inner">
                              <ShieldCheck className="text-gold size-6" />
                              <span className="text-[6px] font-black text-navy-deep uppercase tracking-tighter mt-0.5">VERIFIED</span>
                            </div>
                            <span className="text-[7px] font-black text-slate-400 uppercase tracking-wider mt-1.5">Issued: {today}</span>
                          </div>

                          <div className="flex flex-col items-center">
                            <div className="text-xs font-black text-navy-deep font-mono mb-1">BSDM / BOARD</div>
                            <div className="h-px w-32 bg-slate-300 my-1"></div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Authorized Coordinator</span>
                          </div>
                        </div>

                        {/* STYLIZED CERTIFICATE FOOTER */}
                        <div className="w-full text-center text-[7px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100 pt-3 mt-1">
                          This is a system generated authenticated credential. Scan Verification ID on our public verification portal to inspect record.
                        </div>
                      </div>

                      {/* Screen-Only Visual Spacing Helper */}
                      <div className="h-4 w-full bg-slate-100 border-y border-slate-200 mt-6 print:hidden"></div>
                    </div>
                  );
                })}
              </div>

              {/* BATCH PRINT-ONLY CSS OVERRIDES */}
              <style>{`
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  #certificate-container, #certificate-container *, .page-break-after, .page-break-after * {
                    visibility: visible;
                  }
                  .page-break-after {
                    page-break-after: always !important;
                    break-after: page !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    width: 100% !important;
                    height: 100vh !important;
                    box-sizing: border-box !important;
                  }
                  .page-break-after:last-child {
                    page-break-after: avoid !important;
                    break-after: avoid !important;
                  }
                  #certificate-container {
                    width: 100% !important;
                    height: 100% !important;
                    border: 10px double #0d1e3d !important;
                    box-shadow: none !important;
                    transform: scale(1) !important;
                    margin: 0 !important;
                    padding: 24px !important;
                    box-sizing: border-box !important;
                  }
                  @page {
                    size: landscape;
                    margin: 0;
                  }
                }
              `}</style>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
