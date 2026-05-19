import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { 
  Users, Building2, Briefcase, ShieldCheck, Download, Search, Plus, Edit, Trash2, 
  Key, Filter, Eye, EyeOff, GraduationCap, CreditCard, Award, FileUp, ListChecks, 
  LayoutDashboard, School, BookOpen, Calendar, Clock, ClipboardList, Building, 
  Phone, User, Heart, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, Zap,
  TrendingUp, Activity, Globe, MoreHorizontal, ChevronRight, FileText, Printer,
  Loader2, MoreVertical, XCircle, Scan, Linkedin, Mail, Percent, UserPlus, Settings
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

export const Route = createFileRoute("/dashboard/admin")({
  component: AdminDashboard,
  validateSearch: (search: Record<string, unknown>) => {
    return { view: (search.view as string) || "overview" };
  },
});

function AdminDashboard() {
  const { view } = (Route as any).useSearch();
  const [students, setStudents] = useState<any[]>([]);
  const [preRegList, setPreRegList] = useState<any[]>([]);
  const [internships, setInternships] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [allAttendance, setAllAttendance] = useState<any[]>([]);
  const [allAssignments, setAllAssignments] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [internshipSearch, setInternshipSearch] = useState("");
  const [assignmentSearch, setAssignmentSearch] = useState("");
  const [minAttendancePercent, setMinAttendancePercent] = useState(75);
  
  // Dialog States
  const [isAddPreRegOpen, setIsAddPreRegOpen] = useState(false);
  const [isAddUniOpen, setIsAddUniOpen] = useState(false);
  const [isAddCollegeOpen, setIsAddCollegeOpen] = useState(false);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [selectedUniForCollege, setSelectedUniForCollege] = useState<any>(null);
  const [selectedColForStructure, setSelectedColForStructure] = useState<any>(null);
  const [viewingStudent, setViewingStudent] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedInternship, setSelectedInternship] = useState<any>(null);
  const [selectedPreReg, setSelectedPreReg] = useState<any>(null);
  const [viewingPreReg, setViewingPreReg] = useState<any>(null);
  const [viewingAttendance, setViewingAttendance] = useState<any>(null);
  const [isEditPreRegOpen, setIsEditPreRegOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isInternshipDialogOpen, setIsInternshipDialogOpen] = useState(false);
  const [isBulkAttendanceOpen, setIsBulkAttendanceOpen] = useState(false);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  
  // HIERARCHICAL EXPLORER STATE
  const [explorerUni, setExplorerUni] = useState<any>(null);
  const [explorerCol, setExplorerCol] = useState<any>(null);
  const [uniSearch, setUniSearch] = useState("");
  const [colSearch, setColSearch] = useState("");
  const [isEditUniOpen, setIsEditUniOpen] = useState(false);
  const [isEditColOpen, setIsEditColOpen] = useState(false);

  // Cascading Selection State for Forms
  const [activeUni, setActiveUni] = useState("");
  const [activeCol, setActiveCol] = useState("");
  const [activeStructures, setActiveStructures] = useState<any[]>([]);
  const [filteredColleges, setFilteredColleges] = useState<any[]>([]);

  useEffect(() => { 
    if (selectedStudent) {
      const uni = universities.find(u => u.name === selectedStudent.university_name);
      if (uni) {
        setActiveUni(uni.id);
        const col = uni.colleges?.find((c: any) => c.name === selectedStudent.college_name);
        if (col) {
          setActiveCol(col.id);
          setFilteredColleges(uni.colleges || []);
          setActiveStructures(col.academic_structures || []);
        }
      }
    } else {
      setActiveUni("");
      setActiveCol("");
      setFilteredColleges([]);
      setActiveStructures([]);
    }
  }, [selectedStudent, universities]);

  useEffect(() => { fetchData(); }, [view]);

  async function fetchData() {
    setLoading(true);
    const { data: s } = await supabase.from("profiles").select("*").eq("role", "student").order("created_at", { ascending: false });
    setStudents(s || []);
    const { data: p } = await supabase.from("pre_registrations").select("*").order("created_at", { ascending: false });
    setPreRegList(p || []);
    const { data: u } = await supabase.from("universities").select("*, colleges(*, academic_structures(*))").order("name");
    setUniversities(u || []);
    const { data: i } = await supabase.from("internships").select("*").order("created_at", { ascending: false });
    setInternships(i || []);
    const { data: att } = await supabase.from("attendance").select("*");
    setAllAttendance(att || []);
    const { data: ass } = await supabase.from("assignments").select("*").order("created_at", { ascending: false });
    setAllAssignments(ass || []);
    const { data: pay } = await supabase.from("payments").select("*, profiles(full_name, email, university_roll_number)").order("created_at", { ascending: false });
    setPayments(pay || []);
    const { data: sett } = await supabase.from("portal_settings").select("*").eq("id", "global").maybeSingle();
    setSettings(sett || { id: 'global', coordinator_name: 'Coordinator Name', company_name: 'TechLaunchpad' });
    setLoading(false);
  }

  // --- CSV Handlers ---
  const handlePreRegCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const rows = (ev.target?.result as string).split("\n").slice(1);
      const recs = rows.map(r => {
        const p = r.split(",").map(s => s.trim()); if (p.length < 11) return null;
        return { 
          full_name: p[0], 
          gender: p[1],
          parent_name: p[2],
          contact_number: p[3],
          email: p[4], 
          university_name: p[5], 
          college_name: p[6],
          department: p[7],
          degree: p[8],
          university_roll_number: p[9],
          semester: p[10]
        };
      }).filter(Boolean);
      const { error } = await supabase.from("pre_registrations").insert(recs);
      if (!error) { 
        toast.success("Bulk Sync Complete!"); 
        fetchData(); 
      } else {
        toast.error("Error: " + error.message);
      }
    };
    reader.readAsText(file);
  };

  const handleInstituteCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const rows = (ev.target?.result as string).split("\n").slice(1);
      for (const row of rows) {
        const [uN, cN, deg, dep, ses] = row.split(",").map(s => s.trim()); if (!uN || !cN) continue;
        const { data: u } = await supabase.from("universities").upsert({ name: uN }).select().single();
        if (u) {
          const { data: c } = await supabase.from("colleges").upsert({ university_id: u.id, name: cN }).select().single();
          if (c && deg && dep && ses) await supabase.from("academic_structures").insert({ college_id: c.id, degree: deg, department: dep, session: ses });
        }
      }
      toast.success("Network Updated!"); fetchData();
    };
    reader.readAsText(file);
  };

  async function onSaveStudent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget); 
    const { password, program, ...formData } = Object.fromEntries(fd);
    
    const uN = universities.find(u => u.id === activeUni)?.name;
    const cN = filteredColleges.find(c => c.id === activeCol)?.name;
    
    setBusy(true);
    let userId = selectedStudent?.id;

    if (!userId) {
      const tempClient = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        { auth: { persistSession: false } }
      );

      const { data: authData, error: authError } = await tempClient.auth.signUp({
        email: String(formData.email),
        password: String(password || "123456"),
        options: { 
          data: { 
            role: "student", 
            full_name: String(formData.full_name),
            ...formData,
            university_name: uN || selectedStudent?.university_name,
            college_name: cN || selectedStudent?.college_name,
            raw_password: String(password || "123456")
          }
        }
      });

      if (authError) {
        toast.error("Account Creation Failed: " + authError.message);
        setBusy(false);
        return;
      }
      userId = authData.user?.id;
    }

    const studentData: any = {
      id: userId,
      ...formData,
      university_name: uN || selectedStudent?.university_name,
      college_name: cN || selectedStudent?.college_name,
      role: "student",
      raw_password: String(password || selectedStudent?.raw_password || "123456")
    };

    const { error } = await supabase.from("profiles").upsert(studentData);
    
    setBusy(false);
    if (!error) { 
      toast.success(selectedStudent ? "Student Updated!" : "Student & Login Account Created!"); 
      setIsAddDialogOpen(false); 
      setIsEditDialogOpen(false); 
      fetchData(); 
    } else {
      toast.error("Profile Sync Error: " + error.message);
    }
  }

  async function onSaveInternship(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd);
    
    const internshipData: any = {
      title: data.title,
      duration: data.duration,
      description: data.description,
      company: data.company || "TechLaunchpad",
      category: data.category || "General",
    };

    if (selectedInternship?.id) {
      internshipData.id = selectedInternship.id;
    }

    const { error } = await supabase.from("internships").upsert(internshipData);
    if (!error) { 
      toast.success("Domain Saved!"); 
      setIsInternshipDialogOpen(false); 
      fetchData(); 
    } else {
      toast.error("Error: " + error.message);
    }
  }

  async function handleUniSelect(id: string) { setActiveUni(id); setActiveCol(""); const { data } = await supabase.from("colleges").select("*").eq("university_id", id); setFilteredColleges(data || []); }
  async function handleColSelect(id: string) { setActiveCol(id); const { data } = await supabase.from("academic_structures").select("*").eq("college_id", id); setActiveStructures(data || []); }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-10">
      
      {/* COMPACT HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print border-b pb-4">
         <div>
            <div className="flex items-center gap-2 text-[10px] font-black text-gold uppercase tracking-widest mb-1">
               <Activity className="size-3" /> System Control
            </div>
            <h1 className="text-3xl font-display font-black text-navy-deep uppercase tracking-tighter">
               {view === "overview" && "Dashboard"}
               {view === "students" && "Students"}
               {view === "pre-reg" && "Staging"}
               {view === "institutes" && "Network"}
               {view === "internships" && "Internships"}
               {view === "attendance" && "Attendance Control"}
               {view === "assignments" && "Assignment Hub"}
               {view === "transactions" && "Financial Transactions"}
               {view === "settings" && "Portal Configuration"}
            </h1>
         </div>
         <div className="flex gap-2">
            <div className="bg-white px-4 py-2 rounded-xl border shadow-sm flex items-center gap-3">
               <div className="size-8 rounded-lg bg-gold/10 text-gold grid place-items-center"><Zap size={16}/></div>
               <div><div className="text-[8px] font-black opacity-40 uppercase tracking-widest">Status</div><div className="text-[10px] font-black text-navy">ACTIVE</div></div>
            </div>
            <Button onClick={fetchData} variant="outline" className="size-11 rounded-xl border-2 hover:bg-gold/10 transition-all bg-white shadow-sm">
               <RefreshCw className={`size-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
         </div>
      </div>

      {/* COMPACT STATS */}
      {view === "overview" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
           {[
              { icon: Users, label: "Students", value: students.length, color: "bg-blue-600" },
              { icon: Briefcase, label: "Domains", value: internships.length, color: "bg-gold" },
              { icon: School, label: "Universities", value: universities.length, color: "bg-green-600" },
              { icon: ShieldCheck, label: "Certificates", value: "1.2K", color: "bg-navy" },
           ].map((card) => (
              <div key={card.label} className="bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                 <div className={`size-12 rounded-xl ${card.color} text-white grid place-items-center shadow-lg`}>
                    <card.icon size={24} />
                 </div>
                 <div>
                    <div className="text-xl font-black text-navy-deep leading-none mb-1">{card.value}</div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{card.label}</div>
                 </div>
              </div>
           ))}
        </div>
      )}

      {/* COMPACT REGISTRY (STUDENTS) */}
      {view === "students" && (
        <div className="space-y-4">
           <div className="bg-white p-5 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-lg font-black text-navy-deep uppercase tracking-tight">Active Student Registry</h2>
              <div className="flex gap-2">
                 <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input placeholder="Search Students..." className="w-full bg-secondary/10 pl-9 h-10 border rounded-xl outline-none text-xs font-bold" value={search} onChange={(e) => setSearch(e.target.value)} />
                 </div>
                 <Button className="h-10 px-6 bg-navy text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg" onClick={() => { setSelectedStudent(null); setIsAddDialogOpen(true); }}>
                    <Plus size={16} className="mr-1" /> New
                 </Button>
              </div>
           </div>

           <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <Table>
                 <TableHeader className="bg-secondary/5">
                    <TableRow>
                       <TableHead className="px-5 py-3 font-black uppercase text-[9px] tracking-widest">Student</TableHead>
                       <TableHead className="font-black uppercase text-[9px] tracking-widest">Roll Number</TableHead>
                       <TableHead className="font-black uppercase text-[9px] tracking-widest">Domain</TableHead>
                       <TableHead className="text-right px-5 font-black uppercase text-[9px] tracking-widest">Actions</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    {students.filter(s => (s.full_name||"").toLowerCase().includes(search.toLowerCase()) || (s.university_roll_number||"").toLowerCase().includes(search.toLowerCase())).map(s => (
                       <TableRow key={s.id} className="hover:bg-gold/5 transition-all group border-b last:border-0 h-14">
                          <TableCell className="px-5">
                             <div className="flex items-center gap-3">
                                <div className="size-8 rounded-lg bg-secondary/20 grid place-items-center font-black text-xs text-navy uppercase">{s.full_name?.charAt(0)}</div>
                                <div className="font-black text-navy-deep uppercase tracking-tight text-xs leading-none">{s.full_name}</div>
                             </div>
                          </TableCell>
                          <TableCell className="font-mono font-bold text-gold text-xs">{s.university_roll_number}</TableCell>
                          <TableCell>
                             <span className="bg-navy text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{s.program || "UNSELECTED"}</span>
                          </TableCell>
                          <TableCell className="text-right px-5">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                   <Button size="icon" variant="ghost" className="size-8 rounded-lg">
                                      <MoreVertical size={16} />
                                   </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 rounded-xl border-2 shadow-xl">
                                   <DropdownMenuLabel className="text-[9px] font-black uppercase opacity-40">Actions</DropdownMenuLabel>
                                   <DropdownMenuItem className="gap-2 font-bold text-xs cursor-pointer" onClick={() => setViewingStudent(s)}>
                                      <Eye size={14} className="text-navy" /> View Full Profile
                                   </DropdownMenuItem>
                                   <DropdownMenuItem className="gap-2 font-bold text-xs cursor-pointer" onClick={() => { setSelectedStudent(s); setIsEditDialogOpen(true); }}>
                                      <Edit size={14} className="text-navy" /> Edit Student
                                   </DropdownMenuItem>
                                   <DropdownMenuItem className="gap-2 font-bold text-xs cursor-pointer" onClick={async () => {
                                      const { data } = await supabase.from("attendance").select("*").eq("student_id", s.id).order("date", { ascending: false });
                                      setViewingAttendance({ student: s, records: data || [] });
                                   }}>
                                      <ListChecks size={14} className="text-navy" /> Attendance History
                                   </DropdownMenuItem>
                                   <DropdownMenuSeparator />
                                   <DropdownMenuItem className="gap-2 font-bold text-xs cursor-pointer text-destructive" onClick={async () => { if(confirm("DANGER: Delete student and their LOGIN permanently?")) { await supabase.from("profiles").delete().eq("id", s.id); fetchData(); } }}>
                                      <Trash2 size={14} /> Delete Permanently
                                   </DropdownMenuItem>
                                </DropdownMenuContent>
                             </DropdownMenu>
                          </TableCell>
                       </TableRow>
                    ))}
                 </TableBody>
              </Table>
           </div>
        </div>
      )}

      {/* COMPACT STAGING (PRE-REG) */}
      {view === "pre-reg" && (
        <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-4">
               <h2 className="text-lg font-black text-navy-deep uppercase tracking-tight">Authorization Staging</h2>
               <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => { const h = "full_name,gender,parent_name,contact_number,email,university_name,college_name,department,degree,university_roll_number,semester"; const b = new Blob([h], { type: "text/csv" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = "format.csv"; a.click(); }} className="h-9 px-4 rounded-xl border border-gold text-navy font-black uppercase text-[9px] tracking-widest hover:bg-gold hover:text-white transition-all">
                     <Download size={14} className="mr-1"/> Format
                  </Button>
                  <div className="relative">
                     <Button variant="outline" className="h-9 px-4 rounded-xl border border-dashed border-navy text-navy font-black uppercase text-[9px] tracking-widest">
                        <FileUp size={14} className="mr-1"/> Bulk Upload
                     </Button>
                     <input type="file" accept=".csv" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handlePreRegCSV} />
                  </div>
                  <Button className="h-9 px-5 bg-navy text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg" onClick={() => setIsAddPreRegOpen(true)}>
                     <Plus size={14} className="mr-1" /> Add Manual
                  </Button>
               </div>
            </div>
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden overflow-x-auto">
               <Table>
                  <TableHeader className="bg-secondary/10 h-10">
                     <TableRow>
                        <TableHead className="px-5 font-black uppercase text-[9px] tracking-widest">Name</TableHead>
                        <TableHead className="font-black uppercase text-[9px] tracking-widest">Roll Number</TableHead>
                        <TableHead className="font-black uppercase text-[9px] tracking-widest">Email</TableHead>
                        <TableHead className="font-black uppercase text-[9px] tracking-widest">Institution</TableHead>
                        <TableHead className="font-black uppercase text-[9px] tracking-widest">Course Structure</TableHead>
                        <TableHead className="font-black uppercase text-[9px] tracking-widest">Status</TableHead>
                        <TableHead className="text-right px-5 font-black uppercase text-[9px] tracking-widest">Actions</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {preRegList.map((p) => (
                        <TableRow key={p.id} className="hover:bg-secondary/5 h-12 text-xs group border-b last:border-0">
                           <TableCell className="px-5 font-black text-navy-deep uppercase">{p.full_name}</TableCell>
                           <TableCell className="font-mono text-gold font-bold">{p.university_roll_number}</TableCell>
                           <TableCell className="font-bold text-slate-500">{p.email || "—"}</TableCell>
                           <TableCell className="font-medium text-slate-600 max-w-[200px] truncate">
                              <div>{p.college_name || "—"}</div>
                              <div className="text-[9px] text-slate-400 uppercase tracking-tight">{p.university_name}</div>
                           </TableCell>
                           <TableCell className="font-bold text-navy">
                              <div>{p.degree || "—"}</div>
                              <div className="text-[9px] text-gold uppercase tracking-tight">{p.department} (Sem: {p.semester || "—"})</div>
                           </TableCell>
                           <TableCell>
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${p.is_claimed ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                 {p.is_claimed ? "Claimed" : "Pending"}
                              </span>
                           </TableCell>
                           <TableCell className="text-right px-5">
                              <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100">
                                 <Button size="icon" variant="ghost" className="size-8 rounded-lg border" onClick={() => setViewingPreReg(p)}><Eye size={16}/></Button>
                                 <Button size="icon" variant="ghost" className="size-8 rounded-lg border" onClick={() => { setSelectedPreReg(p); setIsEditPreRegOpen(true); }}><Edit size={16}/></Button>
                                 <Button size="icon" variant="ghost" className="size-8 rounded-lg border text-red-500" onClick={async () => { if(confirm("Delete record?")) { await supabase.from("pre_registrations").delete().eq("id", p.id); fetchData(); } }}><Trash2 size={16}/></Button>
                              </div>
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </div>
        </div>
      )}

      {/* HIERARCHICAL ACADEMIC NETWORK */}
      {view === "institutes" && (
        <div className="space-y-4">
           <div className="bg-white p-4 rounded-2xl border shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-hidden">
                 <Button variant="ghost" size="sm" className={`h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest ${!explorerUni ? 'text-[#1e40af] bg-blue-50' : 'text-slate-400'}`} onClick={() => { setExplorerUni(null); setExplorerCol(null); }}>Universities</Button>
                 {explorerUni && (
                    <>
                       <ChevronRight size={14} className="text-slate-300" />
                       <Button variant="ghost" size="sm" className={`h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest ${explorerUni && !explorerCol ? 'text-[#1e40af] bg-blue-50' : 'text-slate-400'} truncate max-w-[150px]`} onClick={() => setExplorerCol(null)}>{explorerUni.name}</Button>
                    </>
                 )}
                 {explorerCol && (
                    <>
                       <ChevronRight size={14} className="text-slate-300" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-[#1e40af] bg-blue-50 h-8 px-3 rounded-lg flex items-center truncate max-w-[150px]">{explorerCol.name}</span>
                    </>
                 )}
              </div>
              <div className="flex gap-2">
                 {!explorerUni && <Button className="h-9 px-5 bg-[#1e40af] text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg" onClick={() => setIsAddUniOpen(true)}>Add University</Button>}
                 {explorerUni && !explorerCol && <Button className="h-9 px-5 bg-[#1e40af] text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg" onClick={() => { setSelectedUniForCollege(explorerUni); setIsAddCollegeOpen(true); }}>Add College</Button>}
              </div>
           </div>

           <div className="bg-white p-3 rounded-2xl border shadow-sm">
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                 <input placeholder={!explorerUni ? "Search Universities..." : "Search Colleges..."} className="w-full h-10 bg-slate-50 pl-10 pr-4 rounded-xl border-none font-bold text-xs" value={!explorerUni ? uniSearch : colSearch} onChange={(e) => !explorerUni ? setUniSearch(e.target.value) : setColSearch(e.target.value)} />
              </div>
           </div>

           <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              {!explorerUni ? (
                 <div className="divide-y">
                    {universities.filter(u => u.name.toLowerCase().includes(uniSearch.toLowerCase())).map(uni => (
                       <div key={uni.id} className="group flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setExplorerUni(uni)}>
                          <div className="flex items-center gap-4">
                             <div className="size-10 rounded-xl bg-blue-50 text-[#1e40af] grid place-items-center"><School size={20}/></div>
                             <div>
                                <div className="text-sm font-black text-slate-800 uppercase tracking-tight">{uni.name}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{uni.colleges?.length || 0} Affiliated Colleges</div>
                             </div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                             <Button size="icon" variant="ghost" className="size-8 rounded-lg border" onClick={() => { setSelectedUniForCollege(uni); setIsEditUniOpen(true); }}><Edit size={16}/></Button>
                             <Button size="icon" variant="ghost" className="size-8 rounded-lg border text-red-500" onClick={async () => { if(confirm("Delete University?")) { await supabase.from("universities").delete().eq("id", uni.id); fetchData(); } }}><Trash2 size={16}/></Button>
                             <ChevronRight size={18} className="text-slate-300 ml-2" />
                          </div>
                       </div>
                    ))}
                 </div>
              ) : !explorerCol ? (
                 <div className="divide-y">
                    {explorerUni.colleges?.filter((c: any) => c.name.toLowerCase().includes(colSearch.toLowerCase())).map((col: any) => (
                       <div key={col.id} className="group flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => { setSelectedColForStructure(col); setIsAddCourseOpen(true); }}>
                          <div className="flex items-center gap-4">
                             <div className="size-10 rounded-xl bg-amber-50 text-amber-600 grid place-items-center"><Building2 size={20}/></div>
                             <div>
                                <div className="text-sm font-black text-slate-800 uppercase tracking-tight">{col.name}</div>
                                <div className="flex gap-3 mt-1 text-[9px] font-black text-slate-400 uppercase">
                                   <span>{Array.from(new Set(col.academic_structures?.map((s: any) => s.department))).filter(Boolean).length} Dept</span>
                                   <span>{Array.from(new Set(col.academic_structures?.map((s: any) => s.degree))).filter(Boolean).length} Courses</span>
                                </div>
                             </div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                             <Button size="icon" variant="ghost" className="size-8 rounded-lg border" onClick={() => { setSelectedColForStructure(col); setIsEditColOpen(true); }}><Edit size={16}/></Button>
                             <Button size="icon" variant="ghost" className="size-8 rounded-lg border text-red-500" onClick={async () => { if(confirm("Delete College?")) { await supabase.from("colleges").delete().eq("id", col.id); fetchData(); } }}><Trash2 size={16}/></Button>
                             <ChevronRight size={18} className="text-slate-300 ml-2" />
                          </div>
                       </div>
                    ))}
                 </div>
              ) : (
                 <div className="p-10 text-center"><Button onClick={() => setExplorerCol(null)}>Back to Colleges</Button></div>
              )}
           </div>

           {explorerUni && !explorerCol && (
              <div className="bg-white p-6 rounded-2xl border shadow-sm">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Bulk Add Colleges to {explorerUni.name}</h4>
                 <form onSubmit={async (e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const names = (fd.get("colleges") as string).split("\n").map(n => n.trim()).filter(Boolean);
                    if (!names.length) return;
                    await supabase.from("colleges").insert(names.map(name => ({ name, university_id: explorerUni.id })));
                    toast.success("Added!"); fetchData(); (e.target as any).reset();
                 }} className="flex flex-col md:flex-row gap-4">
                    <textarea name="colleges" placeholder="Enter College Names (One per line)..." className="flex-1 h-20 bg-slate-50 border rounded-xl p-3 text-xs font-bold outline-none" />
                    <Button type="submit" className="bg-[#1e40af] text-white px-8 h-20 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl">Bulk Save</Button>
                 </form>
              </div>
           )}
        </div>
      )}

      {/* COMPACT PORTFOLIO (INTERNSHIPS) */}
      {view === "internships" && (
        <div className="space-y-6">
           <div className="bg-white p-5 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-lg font-black text-navy-deep uppercase tracking-tighter leading-tight">Internship Domains</h2>
              <div className="flex flex-wrap gap-2">
                 <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input placeholder="Filter..." className="w-full bg-[#f8f9fa] pl-10 h-10 border rounded-xl font-bold text-xs" value={internshipSearch} onChange={(e) => setInternshipSearch(e.target.value)} />
                 </div>
                 <Button className="h-10 px-6 bg-navy text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg" onClick={() => { setSelectedInternship(null); setIsInternshipDialogOpen(true); }}>
                    <Plus size={16} className="mr-1" /> Add Domain
                 </Button>
              </div>
           </div>
           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {internships.filter(i => i.title.toLowerCase().includes(internshipSearch.toLowerCase())).map(intern => (
                 <div key={intern.id} className="bg-white rounded-2xl border hover:border-gold/50 p-5 shadow-sm transition-all group relative">
                    <div className="flex items-center justify-between mb-4">
                       <div className="size-10 rounded-xl bg-gold/10 text-gold grid place-items-center"><Building size={20}/></div>
                       <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                          <Button size="icon" variant="ghost" className="size-8 rounded-lg" onClick={() => { setSelectedInternship(intern); setIsInternshipDialogOpen(true); }}><Edit size={14}/></Button>
                          <Button size="icon" variant="ghost" className="size-8 rounded-lg text-destructive" onClick={async () => { if(confirm("Delete?")) { await supabase.from("internships").delete().eq("id", intern.id); fetchData(); } }}><Trash2 size={14}/></Button>
                       </div>
                    </div>
                    <h3 className="text-lg font-black text-navy-deep uppercase mb-1 tracking-tight leading-tight">{intern.title}</h3>
                    <div className="text-[9px] font-black text-gold uppercase tracking-widest mb-4"><Clock size={14} className="inline mr-1"/> {intern.duration || "8 Weeks"} PROGRAM</div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-5">{intern.description}</p>
                 </div>
              ))}
           </div>
        </div>
      )}

      {/* COMPACT ATTENDANCE CONTROL */}
      {view === "attendance" && (
        <div className="space-y-4">
           <div className="bg-white p-5 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div>
                 <h2 className="text-lg font-black text-navy-deep uppercase tracking-tight">Global Attendance Registry</h2>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Management and bulk updates</p>
              </div>
              <div className="flex flex-wrap gap-3">
                 <div className="bg-navy/5 px-4 py-2 rounded-xl border flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-navy text-white grid place-items-center"><Percent size={16}/></div>
                    <div>
                       <div className="text-[8px] font-black opacity-40 uppercase tracking-widest">Min Requirement</div>
                       <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            value={minAttendancePercent} 
                            onChange={(e) => setMinAttendancePercent(Number(e.target.value))}
                            className="w-8 bg-transparent font-black text-navy text-xs outline-none"
                          />
                          <span className="text-[10px] font-black text-navy">%</span>
                       </div>
                    </div>
                 </div>
                 <Button className="h-10 px-6 bg-navy text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg" onClick={() => setIsBulkAttendanceOpen(true)}>
                    <UserPlus size={16} className="mr-2" /> Bulk Mark Presence
                 </Button>
              </div>
           </div>

           <div className="bg-white p-4 rounded-2xl border shadow-sm">
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                 <input 
                    placeholder="Search by name or roll number..." 
                    className="w-full h-10 bg-secondary/10 pl-10 pr-4 rounded-xl border-none font-bold text-xs" 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                 />
              </div>
           </div>

           <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <Table>
                 <TableHeader className="bg-secondary/5">
                    <TableRow>
                       <TableHead className="px-6 py-4 font-black uppercase text-[9px] tracking-widest text-navy/40">Student Detail</TableHead>
                       <TableHead className="font-black uppercase text-[9px] tracking-widest text-navy/40">University Roll</TableHead>
                       <TableHead className="font-black uppercase text-[9px] tracking-widest text-navy/40">Present Days</TableHead>
                       <TableHead className="font-black uppercase text-[9px] tracking-widest text-navy/40">Percentage</TableHead>
                       <TableHead className="text-right px-6 font-black uppercase text-[9px] tracking-widest text-navy/40">Actions</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    {students.filter(s => (s.full_name||"").toLowerCase().includes(search.toLowerCase()) || (s.university_roll_number||"").toLowerCase().includes(search.toLowerCase())).map(s => {
                       const count = allAttendance.filter(a => a.student_id === s.id && a.status === 'present').length;
                       // Total days from start of month or program (simulated as 30)
                       const totalPossible = 30; 
                       const percent = Math.round((count / totalPossible) * 100);
                       const isAtRisk = percent < minAttendancePercent;

                       return (
                          <TableRow key={s.id} className="hover:bg-gold/5 transition-all border-b last:border-0 h-16">
                             <TableCell className="px-6">
                                <div className="flex items-center gap-3">
                                   <div className="size-9 rounded-xl bg-navy/5 text-navy grid place-items-center font-black text-xs uppercase">{s.full_name?.charAt(0)}</div>
                                   <div>
                                      <div className="font-black text-navy-deep uppercase tracking-tight text-xs">{s.full_name}</div>
                                      <div className="text-[9px] font-bold text-muted-foreground uppercase">{s.college_name}</div>
                                   </div>
                                </div>
                             </TableCell>
                             <TableCell className="font-mono font-bold text-gold text-xs">{s.university_roll_number}</TableCell>
                             <TableCell>
                                <div className="flex items-center gap-2">
                                   <span className="text-sm font-black text-navy">{count}</span>
                                   <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Days</span>
                                </div>
                             </TableCell>
                             <TableCell>
                                <div className="flex items-center gap-3">
                                   <div className="w-16 h-1.5 bg-secondary/20 rounded-full overflow-hidden">
                                      <div 
                                         className={`h-full rounded-full ${isAtRisk ? 'bg-red-500' : 'bg-green-500'}`} 
                                         style={{ width: `${Math.min(percent, 100)}%` }} 
                                      />
                                   </div>
                                   <span className={`text-xs font-black ${isAtRisk ? 'text-red-600' : 'text-green-600'}`}>{percent}%</span>
                                </div>
                             </TableCell>
                             <TableCell className="text-right px-6">
                                <Button 
                                   size="sm" 
                                   variant="outline" 
                                   className="h-8 px-4 rounded-lg border-2 border-navy/10 text-[9px] font-black uppercase tracking-widest hover:bg-navy hover:text-white transition-all"
                                   onClick={async () => {
                                      const { data } = await supabase.from("attendance").select("*").eq("student_id", s.id).order("date", { ascending: false });
                                      setViewingAttendance({ student: s, records: data || [] });
                                   }}
                                >
                                   Adjust Record
                                </Button>
                             </TableCell>
                          </TableRow>
                       );
                    })}
                 </TableBody>
              </Table>
           </div>
        </div>
      )}

      {/* COMPACT ASSIGNMENT HUB */}
      {view === "assignments" && (
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div>
                 <h2 className="text-xl font-black text-navy-deep uppercase tracking-tighter leading-tight">Academic Assignments</h2>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Manage online tasks and secure testing</p>
              </div>
              <div className="flex flex-wrap gap-2">
                 <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input 
                       placeholder="Search assignments..." 
                       className="w-full bg-[#f8f9fa] pl-10 h-10 border rounded-xl font-bold text-xs" 
                       value={assignmentSearch} 
                       onChange={(e) => setAssignmentSearch(e.target.value)} 
                    />
                 </div>
                 <Button className="h-10 px-6 bg-navy text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg" onClick={() => { setSelectedAssignment(null); setIsAssignmentDialogOpen(true); }}>
                    <Plus size={16} className="mr-1" /> Create Assignment
                 </Button>
              </div>
           </div>

           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {allAssignments.filter(a => a.title.toLowerCase().includes(assignmentSearch.toLowerCase())).map(task => (
                 <div key={task.id} className="bg-white rounded-3xl border hover:border-gold/50 p-6 shadow-sm transition-all group relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><BookOpen size={80}/></div>
                    <div className="flex items-center justify-between mb-5 relative z-10">
                       <div className="px-3 py-1 bg-navy/5 text-navy text-[9px] font-black uppercase tracking-widest rounded-full border">ONLINE TASK</div>
                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <Button size="icon" variant="ghost" className="size-8 rounded-lg" onClick={() => { setSelectedAssignment(task); setIsAssignmentDialogOpen(true); }}><Edit size={14}/></Button>
                          <Button size="icon" variant="ghost" className="size-8 rounded-lg text-destructive" onClick={async () => { if(confirm("Delete assignment?")) { await supabase.from("assignments").delete().eq("id", task.id); fetchData(); } }}><Trash2 size={14}/></Button>
                       </div>
                    </div>
                    <h3 className="text-xl font-black text-navy-deep uppercase mb-2 tracking-tight leading-tight relative z-10">{task.title}</h3>
                    <div className="flex items-center gap-2 text-[9px] font-bold text-gold uppercase tracking-widest mb-4">
                       <Calendar size={12}/> Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No Deadline"}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-6 flex-1">{task.description}</p>
                    <div className="pt-4 border-t flex items-center justify-between">
                       <div className="flex items-center gap-2 text-[10px] font-black uppercase text-navy/40">
                          <Users size={14} /> {task.domain || "Global Task"}
                       </div>
                       <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${new Date(task.due_date) < new Date() ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                          {new Date(task.due_date) < new Date() ? "Expired" : "Active"}
                       </div>
                    </div>
                 </div>
              ))}
              {allAssignments.length === 0 && (
                 <div className="col-span-full py-20 bg-navy/5 rounded-3xl border border-dashed text-center">
                    <BookOpen size={48} className="mx-auto text-navy/20 mb-4" />
                    <h3 className="text-lg font-black text-navy-deep uppercase tracking-widest opacity-40">No assignments created yet</h3>
                    <Button variant="link" onClick={() => setIsAssignmentDialogOpen(true)} className="text-gold font-bold uppercase text-[10px] mt-2 tracking-widest">Click here to add your first task</Button>
                 </div>
              )}
           </div>
        </div>
      )}

      {/* COMPACT TRANSACTIONS */}
      {view === "transactions" && (
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div>
                 <h2 className="text-xl font-black text-navy-deep uppercase tracking-tighter leading-tight">Financial Transactions</h2>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Review student payments and fee processing</p>
              </div>
              <div className="flex flex-wrap gap-2">
                 <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input 
                       placeholder="Search by student name..." 
                       className="w-full bg-[#f8f9fa] pl-10 h-10 border rounded-xl font-bold text-xs outline-none" 
                       value={search} 
                       onChange={(e) => setSearch(e.target.value)} 
                    />
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <Table>
                 <TableHeader className="bg-secondary/5">
                    <TableRow>
                       <TableHead className="px-6 py-4 font-black uppercase text-[9px] tracking-widest text-navy/40">Date</TableHead>
                       <TableHead className="font-black uppercase text-[9px] tracking-widest text-navy/40">Student</TableHead>
                       <TableHead className="font-black uppercase text-[9px] tracking-widest text-navy/40">Roll Number</TableHead>
                       <TableHead className="font-black uppercase text-[9px] tracking-widest text-navy/40">Amount</TableHead>
                       <TableHead className="font-black uppercase text-[9px] tracking-widest text-navy/40">Status</TableHead>
                       <TableHead className="text-right px-6 font-black uppercase text-[9px] tracking-widest text-navy/40">Receipt</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    {payments.filter(p => (p.profiles?.full_name || "").toLowerCase().includes(search.toLowerCase())).map((p) => (
                       <TableRow key={p.id} className="hover:bg-gold/5 transition-all border-b last:border-0 h-16">
                          <TableCell className="px-6 font-bold text-xs text-muted-foreground">
                             {new Date(p.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-black text-navy-deep uppercase tracking-tight text-xs">
                             {p.profiles?.full_name || "Unknown"}
                             <div className="text-[9px] font-bold text-muted-foreground uppercase">{p.profiles?.email}</div>
                          </TableCell>
                          <TableCell className="font-mono font-bold text-gold text-xs">
                             {p.profiles?.university_roll_number || "—"}
                          </TableCell>
                          <TableCell className="font-black text-navy text-sm">
                             ₹{p.amount}
                          </TableCell>
                          <TableCell>
                             <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-green-50 text-green-600 flex items-center gap-1 w-max">
                                <CheckCircle2 className="size-3" /> Paid
                             </span>
                          </TableCell>
                          <TableCell className="text-right px-6">
                             {p.slip_url ? (
                                <Button size="sm" variant="ghost" className="text-navy hover:bg-navy/5" onClick={() => window.open(p.slip_url, '_blank')}>
                                   <Download className="size-4 mr-2" /> View
                                </Button>
                             ) : (
                                <span className="text-xs text-muted-foreground italic">No Slip</span>
                             )}
                          </TableCell>
                       </TableRow>
                    ))}
                    {payments.length === 0 && (
                       <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground italic text-sm">
                             No transactions found.
                          </TableCell>
                       </TableRow>
                    )}
                 </TableBody>
              </Table>
           </div>
        </div>
      )}

      {/* COMPACT PORTAL SETTINGS */}
      {view === "settings" && (
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h2 className="text-xl font-black text-navy-deep uppercase tracking-tighter mb-4">Institutional Configuration</h2>
              <form onSubmit={async (e) => {
                 e.preventDefault();
                 const fd = new FormData(e.currentTarget);
                 const data = Object.fromEntries(fd);
                 setBusy(true);
                 const { error } = await supabase.from("portal_settings").upsert({ id: 'global', ...data });
                 setBusy(false);
                 if(!error) { toast.success("Settings Updated!"); fetchData(); }
              }} className="space-y-8">
                 
                 <div className="grid md:grid-cols-2 gap-8">
                    {/* Company Details */}
                    <div className="space-y-4">
                       <h3 className="text-[10px] font-black uppercase text-gold tracking-[0.2em] border-b pb-2">Corporate Identity</h3>
                       <div className="space-y-4">
                          <div className="space-y-2">
                             <Label className="text-[9px] font-black uppercase opacity-40">Company Name</Label>
                             <Input name="company_name" defaultValue={settings?.company_name} className="h-11 rounded-xl font-bold border-2" />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[9px] font-black uppercase opacity-40">Official Address</Label>
                             <textarea name="company_address" defaultValue={settings?.company_address} className="w-full h-24 bg-navy/5 border-2 rounded-xl p-3 text-xs font-bold outline-none focus:border-gold" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label className="text-[9px] font-black uppercase opacity-40">Contact Email</Label>
                                <Input name="company_email" defaultValue={settings?.company_email} className="h-11 rounded-xl font-bold border-2" />
                             </div>
                             <div className="space-y-2">
                                <Label className="text-[9px] font-black uppercase opacity-40">Contact Phone</Label>
                                <Input name="company_phone" defaultValue={settings?.company_phone} className="h-11 rounded-xl font-bold border-2" />
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Authentication Details */}
                    <div className="space-y-4">
                       <h3 className="text-[10px] font-black uppercase text-gold tracking-[0.2em] border-b pb-2">Document Authentication</h3>
                       <div className="space-y-4">
                          <div className="space-y-2">
                             <Label className="text-[9px] font-black uppercase opacity-40">Internship Coordinator Name</Label>
                             <Input name="coordinator_name" defaultValue={settings?.coordinator_name} className="h-11 rounded-xl font-bold border-2" />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[9px] font-black uppercase opacity-40">Signature (Image URL or Base64)</Label>
                             <textarea name="coordinator_signature_url" defaultValue={settings?.coordinator_signature_url} placeholder="Paste image URL or Base64 data..." className="w-full h-24 bg-navy/5 border-2 rounded-xl p-3 text-[10px] font-mono outline-none focus:border-gold" />
                          </div>
                          {settings?.coordinator_signature_url && (
                             <div className="p-4 bg-navy/5 rounded-xl border border-dashed text-center">
                                <div className="text-[8px] font-black uppercase opacity-40 mb-2">Signature Preview</div>
                                <img src={settings.coordinator_signature_url} alt="Signature" className="h-16 mx-auto object-contain bg-white p-2 rounded-lg border shadow-sm" />
                             </div>
                          )}
                       </div>
                    </div>
                 </div>

                 <div className="pt-6 border-t flex justify-end">
                    <Button type="submit" disabled={busy} className="bg-navy text-white px-12 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2">
                       {busy ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={18} /> Save Portal Configuration</>}
                    </Button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* DIALOGS */}
      {/* Attendance History Dialog */}
      <Dialog open={!!viewingAttendance} onOpenChange={(o) => !o && setViewingAttendance(null)}>
         <DialogContent className="max-w-3xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl bg-white">
            <div className="bg-navy p-6 text-white flex items-center justify-between">
               <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter leading-none mb-1">Attendance History</h2>
                  <p className="text-[10px] font-bold text-gold uppercase tracking-widest">{viewingAttendance?.student?.full_name} | {viewingAttendance?.student?.university_roll_number}</p>
               </div>
               <Button size="icon" variant="ghost" className="text-white/40 hover:text-white" onClick={() => setViewingAttendance(null)}>✕</Button>
            </div>
            <div className="p-0 max-h-[60vh] overflow-y-auto">
               <Table>
                  <TableHeader className="bg-secondary/10 sticky top-0 z-10">
                     <TableRow>
                        <TableHead className="px-6 py-3 font-black uppercase text-[9px] tracking-widest">Date</TableHead>
                        <th className="px-6 py-3 font-black uppercase text-[9px] tracking-widest text-left">Status</th>
                        <th className="px-6 py-3 font-black uppercase text-[9px] tracking-widest text-left">Verified At</th>
                        <th className="px-6 py-3 font-black uppercase text-[9px] tracking-widest text-right">Action</th>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {viewingAttendance?.records?.length === 0 ? (
                        <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground font-bold uppercase text-[10px]">No records found.</TableCell></TableRow>
                     ) : viewingAttendance?.records?.map((r: any) => (
                        <TableRow key={r.id} className="hover:bg-gold/5 transition-colors border-b">
                           <TableCell className="px-6 py-4 font-bold text-navy-deep">{new Date(r.date).toLocaleDateString()}</TableCell>
                           <TableCell className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${r.status === 'present' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                 {r.status}
                              </span>
                           </TableCell>
                           <TableCell className="px-6 py-4 text-[10px] font-bold text-navy/60">{new Date(r.created_at).toLocaleTimeString()}</TableCell>
                           <TableCell className="px-6 py-4 text-right">
                              <Button size="icon" variant="ghost" className="size-7 text-red-500 hover:bg-red-50" onClick={async () => {
                                 if(confirm("Delete this log?")) {
                                    await supabase.from("attendance").delete().eq("id", r.id);
                                    const { data } = await supabase.from("attendance").select("*").eq("student_id", viewingAttendance.student.id).order("date", { ascending: false });
                                    setViewingAttendance({ ...viewingAttendance, records: data || [] });
                                 }
                              }}><Trash2 size={14}/></Button>
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </div>
            <div className="p-6 bg-secondary/5 border-t space-y-4">
               <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border">
                  <div className="flex-1">
                     <div className="text-[8px] font-black uppercase opacity-40 mb-1">Add Manual Record</div>
                     <form onSubmit={async (e) => {
                        e.preventDefault();
                        const fd = new FormData(e.currentTarget);
                        const date = fd.get("date") as string;
                        if(!date) return;
                        
                        const { error } = await supabase.from("attendance").insert({
                           student_id: viewingAttendance.student.id,
                           date,
                           status: "present"
                        });
                        
                        if(!error) {
                           toast.success("Record Added!");
                           const { data } = await supabase.from("attendance").select("*").eq("student_id", viewingAttendance.student.id).order("date", { ascending: false });
                           setViewingAttendance({ ...viewingAttendance, records: data || [] });
                           fetchData();
                        } else {
                           toast.error("Duplicate or Error: " + error.message);
                        }
                     }} className="flex gap-2">
                        <Input name="date" type="date" className="h-9 rounded-xl text-xs font-bold" required />
                        <Button type="submit" className="bg-gold text-navy-deep px-6 h-9 rounded-xl font-black text-[9px] uppercase tracking-widest">Add Present</Button>
                     </form>
                  </div>
               </div>
               <div className="flex justify-end gap-3">
                  <Button onClick={() => setViewingAttendance(null)} className="bg-navy text-white px-10 h-10 rounded-xl font-black text-[10px] uppercase">Close Window</Button>
               </div>
            </div>
         </DialogContent>
      </Dialog>

      {/* Student Form Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(o) => { if(!o) { setIsAddDialogOpen(false); setIsEditDialogOpen(false); setSelectedStudent(null); } }}>
         <DialogContent className="max-w-5xl rounded-3xl p-0 border-none shadow-2xl overflow-hidden bg-white">
            <div className="bg-navy p-8 text-white flex items-center justify-between relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10"><GraduationCap size={120} /></div>
               <div className="relative z-10">
                  <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-1">{selectedStudent ? "Update Record" : "Enrollment Control"}</h2>
                  <p className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] opacity-80">Manual Student Provisioning System</p>
               </div>
               <Button size="icon" variant="ghost" className="text-white/40 hover:text-white relative z-10" onClick={() => { setIsAddDialogOpen(false); setIsEditDialogOpen(false); }}>✕</Button>
            </div>
            <form onSubmit={onSaveStudent} className="grid md:grid-cols-3 gap-6 p-10 max-h-[70vh] overflow-y-auto">
                <div className="space-y-1"><Label className="font-black text-[9px] uppercase">Name *</Label><Input name="full_name" defaultValue={selectedStudent?.full_name} required className="h-10 rounded-xl font-bold bg-secondary/5 text-xs" /></div>
                <div className="space-y-1"><Label className="font-black text-[9px] uppercase">Email *</Label><Input name="email" defaultValue={selectedStudent?.email} type="email" required className="h-10 rounded-xl font-bold bg-secondary/5 text-xs" /></div>
                <div className="space-y-1"><Label className="font-black text-[9px] uppercase">Contact *</Label><Input name="contact_number" defaultValue={selectedStudent?.contact_number} required className="h-10 rounded-xl font-bold bg-secondary/5 text-xs" /></div>
                <div className="space-y-1"><Label className="font-black text-[9px] uppercase">Gender</Label><select name="gender" defaultValue={selectedStudent?.gender} className="w-full h-10 border rounded-xl px-3 font-bold text-xs bg-secondary/5"><option value="Male">MALE</option><option value="Female">FEMALE</option></select></div>
                <div className="space-y-1"><Label className="font-black text-[9px] uppercase">Parent</Label><Input name="parent_name" defaultValue={selectedStudent?.parent_name} className="h-10 border rounded-xl font-bold bg-secondary/5 text-xs" /></div>
                <div className="space-y-1"><Label className="font-black text-[9px] uppercase text-gold">University *</Label><select className="w-full h-10 border border-gold/20 rounded-xl px-3 font-black text-xs bg-gold/5" value={activeUni} onChange={(e) => handleUniSelect(e.target.value)} required><option value="">SELECT UNI</option>{universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
                <div className="space-y-1"><Label className="font-black text-[9px] uppercase text-gold">College *</Label><select className="w-full h-10 border border-gold/20 rounded-xl px-3 font-black text-xs bg-gold/5" value={activeCol} disabled={!activeUni} onChange={(e) => handleColSelect(e.target.value)} required><option value="">SELECT COLLEGE</option>{filteredColleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div className="space-y-1"><Label className="font-black text-[9px] uppercase">Branch</Label><select name="department" defaultValue={selectedStudent?.department} className="w-full h-10 border rounded-xl px-3 font-black text-xs" disabled={!activeCol} required><option value="">BRANCH</option>{Array.from(new Set(activeStructures.map(s => s.department))).map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                <div className="space-y-1"><Label className="font-black text-[9px] uppercase">Degree</Label><select name="degree" defaultValue={selectedStudent?.degree} className="w-full h-10 border rounded-xl px-3 font-black text-xs" disabled={!activeCol} required>{Array.from(new Set(activeStructures.map(s => s.degree))).map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                <div className="space-y-1"><Label className="font-black text-[9px] uppercase">Session</Label><select name="academic_session" defaultValue={selectedStudent?.academic_session} className="w-full h-10 border rounded-xl px-3 font-black text-xs" disabled={!activeCol} required>{Array.from(new Set(activeStructures.map(s => s.session))).map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                <div className="space-y-1"><Label className="font-black text-[9px] uppercase">Roll No *</Label><Input name="university_roll_number" defaultValue={selectedStudent?.university_roll_number} required className="h-10 rounded-xl font-mono text-xs" /></div>
                <div className="space-y-1"><Label className="font-black text-[9px] uppercase">Semester *</Label><Input name="semester" defaultValue={selectedStudent?.semester} required placeholder="e.g. 4th" className="h-10 rounded-xl text-xs" /></div>
                <div className="space-y-1"><Label className="font-black text-[9px] uppercase text-navy">Internship *</Label><select name="program" defaultValue={selectedStudent?.program} className="w-full h-10 border-2 border-navy/20 rounded-xl px-3 font-black text-xs bg-navy/5">{internships.map(i => <option key={i.id} value={i.title}>{i.title}</option>)}</select></div>
                <div className="space-y-1"><Label className="font-black text-[9px] uppercase">Password</Label><Input name="password" type="password" placeholder="••••••••" className="h-10 rounded-xl text-xs" /></div>
                <div className="pt-6 md:col-span-3 flex justify-end gap-3 border-t">
                  <Button type="button" variant="ghost" onClick={() => { setIsAddDialogOpen(false); setIsEditDialogOpen(false); }} className="px-6 text-[10px] uppercase font-black" disabled={busy}>Abort</Button>
                  <Button type="submit" disabled={busy} className="bg-navy text-white px-10 h-11 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl">
                    {busy ? <Loader2 className="animate-spin mr-2" /> : "SAVE DATA & CREATE ACCOUNT"}
                  </Button>
                </div>
             </form>
         </DialogContent>
      </Dialog>

      {/* Manual Modal (Staging) */}
      <Dialog open={isAddPreRegOpen || isEditPreRegOpen} onOpenChange={(o) => { if(!o) { setIsAddPreRegOpen(false); setIsEditPreRegOpen(false); setSelectedPreReg(null); } }}>
         <DialogContent className="max-w-4xl rounded-2xl p-6">
            <DialogHeader>
               <DialogTitle className="text-lg font-black text-navy uppercase border-b pb-2">Manual Entry (Staging Profile)</DialogTitle>
               <DialogDescription className="text-[10px] font-bold text-gold uppercase tracking-widest">Provide Academic & Identity Details</DialogDescription>
            </DialogHeader>
            <form onSubmit={async (e) => { 
               e.preventDefault(); 
               const fd = new FormData(e.currentTarget); 
               const data = Object.fromEntries(fd);
               await supabase.from("pre_registrations").upsert({ id: selectedPreReg?.id, ...data });
               toast.success("Done!"); setIsAddPreRegOpen(false); setIsEditPreRegOpen(false); fetchData(); 
            }} className="grid gap-4 py-4 md:grid-cols-3">
               <div className="space-y-1"><Label className="text-[9px] uppercase">Full Name *</Label><Input name="full_name" defaultValue={selectedPreReg?.full_name} required className="h-9 rounded-xl text-xs" /></div>
               <div className="space-y-1">
                  <Label className="text-[9px] uppercase">Gender *</Label>
                  <select name="gender" defaultValue={selectedPreReg?.gender || "Male"} required className="w-full h-9 border rounded-xl px-2 text-xs bg-white outline-none">
                     <option value="Male">Male</option>
                     <option value="Female">Female</option>
                  </select>
               </div>
               <div className="space-y-1"><Label className="text-[9px] uppercase">Father's Name *</Label><Input name="parent_name" defaultValue={selectedPreReg?.parent_name} required className="h-9 rounded-xl text-xs" /></div>
               
               <div className="space-y-1"><Label className="text-[9px] uppercase">Mobile No *</Label><Input name="contact_number" defaultValue={selectedPreReg?.contact_number} required className="h-9 rounded-xl text-xs" /></div>
               <div className="space-y-1"><Label className="text-[9px] uppercase">Email Address *</Label><Input name="email" defaultValue={selectedPreReg?.email} type="email" required className="h-9 rounded-xl text-xs" /></div>
               <div className="space-y-1"><Label className="text-[9px] uppercase">University Name *</Label><Input name="university_name" defaultValue={selectedPreReg?.university_name} required className="h-9 rounded-xl text-xs" /></div>
               
               <div className="space-y-1"><Label className="text-[9px] uppercase">College Name *</Label><Input name="college_name" defaultValue={selectedPreReg?.college_name} required className="h-9 rounded-xl text-xs" /></div>
               <div className="space-y-1"><Label className="text-[9px] uppercase">Branch *</Label><Input name="department" defaultValue={selectedPreReg?.department} required className="h-9 rounded-xl text-xs" /></div>
               <div className="space-y-1"><Label className="text-[9px] uppercase">Degree *</Label><Input name="degree" defaultValue={selectedPreReg?.degree} required className="h-9 rounded-xl text-xs" /></div>
               
               <div className="space-y-1"><Label className="text-[9px] uppercase">Roll Number *</Label><Input name="university_roll_number" defaultValue={selectedPreReg?.university_roll_number} required className="h-9 rounded-xl text-xs font-mono" /></div>
               <div className="space-y-1"><Label className="text-[9px] uppercase">Semester *</Label><Input name="semester" defaultValue={selectedPreReg?.semester} required className="h-9 rounded-xl text-xs" /></div>
               
               <div className="pt-6 md:col-span-3 flex justify-end gap-3 border-t">
                  <Button type="button" variant="ghost" onClick={() => { setIsAddPreRegOpen(false); setIsEditPreRegOpen(false); }} className="text-xs uppercase font-black">Cancel</Button>
                  <Button type="submit" className="bg-navy text-white px-8 h-10 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">COMMIT TO STAGING</Button>
               </div>
            </form>
         </DialogContent>
      </Dialog>

      <Dialog open={isAddUniOpen || isEditUniOpen} onOpenChange={(o) => { if(!o) { setIsAddUniOpen(false); setIsEditUniOpen(false); setSelectedUniForCollege(null); } }}>
         <DialogContent className="max-w-md rounded-2xl p-6">
            <DialogHeader><DialogTitle className="text-lg font-black text-[#1e40af] uppercase">{selectedUniForCollege ? "Edit University" : "Add University"}</DialogTitle></DialogHeader>
            <form onSubmit={async (e) => { 
               e.preventDefault(); 
               const fd = new FormData(e.currentTarget); 
               await supabase.from("universities").upsert({ id: selectedUniForCollege?.id, name: fd.get("name") }); 
               toast.success("Success!"); setIsAddUniOpen(false); setIsEditUniOpen(false); fetchData(); 
            }} className="space-y-4 py-4">
               <div className="space-y-1"><Label className="text-[9px] uppercase">University Name</Label><Input name="name" defaultValue={selectedUniForCollege?.name} required className="h-10 rounded-xl text-xs" /></div>
               <div className="flex justify-end gap-3 pt-4"><Button type="button" variant="ghost" onClick={() => { setIsAddUniOpen(false); setIsEditUniOpen(false); }}>Cancel</Button><Button type="submit" className="bg-[#1e40af] text-white px-8 h-10 rounded-xl font-black text-[10px] uppercase tracking-widest">SAVE</Button></div>
            </form>
         </DialogContent>
      </Dialog>

      <Dialog open={isAddCollegeOpen || isEditColOpen} onOpenChange={(o) => { if(!o) { setIsAddCollegeOpen(false); setIsEditColOpen(false); setSelectedColForStructure(null); } }}>
         <DialogContent className="max-w-md rounded-2xl p-6">
            <DialogHeader><DialogTitle className="text-lg font-black text-[#1e40af] uppercase">{selectedColForStructure ? "Edit College" : "Add College"}</DialogTitle></DialogHeader>
            <form onSubmit={async (e) => { 
               e.preventDefault(); 
               const fd = new FormData(e.currentTarget); 
               await supabase.from("colleges").upsert({ id: selectedColForStructure?.id, name: fd.get("name"), university_id: selectedUniForCollege?.id || explorerUni?.id }); 
               toast.success("Success!"); setIsAddCollegeOpen(false); setIsEditColOpen(false); fetchData(); 
            }} className="space-y-4 py-4">
               <div className="space-y-1"><Label className="text-[9px] uppercase">College Name</Label><Input name="name" defaultValue={selectedColForStructure?.name} required className="h-10 rounded-xl text-xs" /></div>
               <div className="flex justify-end gap-3 pt-4"><Button type="button" variant="ghost" onClick={() => { setIsAddCollegeOpen(false); setIsEditColOpen(false); }}>Cancel</Button><Button type="submit" className="bg-[#1e40af] text-white px-8 h-10 rounded-xl font-black text-[10px] uppercase tracking-widest">SAVE</Button></div>
            </form>
         </DialogContent>
      </Dialog>

      <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
         <DialogContent className="max-w-4xl rounded-3xl p-0 border-4 border-gold/5 shadow-2xl overflow-hidden bg-white">
            <div className="bg-navy p-6 text-white flex items-center justify-between">
               <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter">Academic Management</h2>
                  <p className="text-[10px] font-bold text-gold uppercase tracking-widest">{selectedColForStructure?.name}</p>
               </div>
               <Button size="icon" variant="ghost" className="text-white/40 hover:text-white" onClick={() => setIsAddCourseOpen(false)}>✕</Button>
            </div>
            <div className="p-8 grid md:grid-cols-3 gap-6">
                <div className="space-y-4 bg-secondary/5 p-5 rounded-2xl border">
                   <div className="flex items-center gap-2 text-navy font-black text-[10px] uppercase border-b pb-2"><BookOpen size={14} className="text-gold"/> Add Courses (Bulk)</div>
                   <form onSubmit={async (e) => { 
                      e.preventDefault(); 
                      const fd = new FormData(e.currentTarget); 
                      const degrees = (fd.get("degrees") as string).split("\n").map(d => d.trim()).filter(Boolean);
                      if (!degrees.length) return;
                      await supabase.from("academic_structures").insert(degrees.map(d => ({ college_id: selectedColForStructure.id, degree: d, department: "General", session: "2024-28" }))); 
                      toast.success("Added!"); fetchData(); (e.target as any).reset();
                   }} className="space-y-3">
                      <div className="space-y-1"><Label className="text-[8px] font-black uppercase opacity-40">Degrees</Label><textarea name="degrees" placeholder="B.Tech" required className="w-full h-20 border rounded-xl p-2 text-xs" /></div>
                      <Button type="submit" className="w-full bg-navy text-white h-9 rounded-xl font-black text-[9px] uppercase">Bulk Add</Button>
                   </form>
                </div>
                <div className="space-y-4 bg-secondary/5 p-5 rounded-2xl border">
                   <div className="flex items-center gap-2 text-navy font-black text-[10px] uppercase border-b pb-2"><School size={14} className="text-gold"/> Add Depts (Bulk)</div>
                   <form onSubmit={async (e) => { 
                      e.preventDefault(); 
                      const fd = new FormData(e.currentTarget); 
                      const depts = (fd.get("departments") as string).split("\n").map(d => d.trim()).filter(Boolean);
                      if (!depts.length) return;
                      await supabase.from("academic_structures").insert(depts.map(d => ({ college_id: selectedColForStructure.id, department: d, degree: "General", session: "2024-28" }))); 
                      toast.success("Added!"); fetchData(); (e.target as any).reset();
                   }} className="space-y-3">
                      <div className="space-y-1"><Label className="text-[8px] font-black uppercase opacity-40">Departments</Label><textarea name="departments" placeholder="CSE" required className="w-full h-20 border rounded-xl p-2 text-xs" /></div>
                      <Button type="submit" className="w-full bg-navy text-white h-9 rounded-xl font-black text-[9px] uppercase">Bulk Add</Button>
                   </form>
                </div>
                <div className="space-y-4 bg-secondary/5 p-5 rounded-2xl border">
                   <div className="flex items-center gap-2 text-navy font-black text-[10px] uppercase border-b pb-2"><Calendar size={14} className="text-gold"/> Add Sessions</div>
                   <form onSubmit={async (e) => { 
                      e.preventDefault(); 
                      const fd = new FormData(e.currentTarget); 
                      const sessions = (fd.get("sessions") as string).split("\n").map(s => s.trim()).filter(Boolean);
                      if (!sessions.length) return;
                      await supabase.from("academic_structures").insert(sessions.map(s => ({ college_id: selectedColForStructure.id, session: s, degree: "General", department: "General" })));
                      toast.success("Added!"); fetchData(); (e.target as any).reset();
                   }} className="space-y-3">
                      <div className="space-y-1"><Label className="text-[8px] font-black uppercase opacity-40">Sessions</Label><textarea name="sessions" placeholder="2021-25" required className="w-full h-20 border rounded-xl p-2 text-xs" /></div>
                      <Button type="submit" className="w-full bg-navy text-white h-9 rounded-xl font-black text-[9px] uppercase">Bulk Add</Button>
                   </form>
                </div>
            </div>
            <div className="p-8 pt-0">
               <div className="bg-navy/5 rounded-2xl border p-4">
                  <h3 className="text-[10px] font-black text-navy uppercase mb-3 flex items-center gap-2"><ListChecks size={14}/> Existing Infrastructure</h3>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                     {selectedColForStructure?.academic_structures?.map((s: any) => (
                        <div key={s.id} className="flex items-center justify-between bg-white p-2 px-4 rounded-xl border text-[10px] font-bold text-navy-deep group">
                           <div className="flex gap-4"><span>Deg: {s.degree}</span><span>Dept: {s.department}</span><span>Ses: {s.session}</span></div>
                           <Button size="icon" variant="ghost" className="size-6 opacity-0 group-hover:opacity-100 text-red-500" onClick={async () => { await supabase.from("academic_structures").delete().eq("id", s.id); fetchData(); }}><Trash2 size={12}/></Button>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
            <div className="p-6 bg-secondary/5 border-t flex justify-end"><Button onClick={() => setIsAddCourseOpen(false)} className="bg-navy text-white px-10 h-10 rounded-xl font-black text-[10px] uppercase tracking-widest">Close</Button></div>
         </DialogContent>
      </Dialog>

      <Dialog open={isInternshipDialogOpen} onOpenChange={setIsInternshipDialogOpen}>
         <DialogContent className="max-w-xl bg-white rounded-2xl p-6">
            <DialogHeader><DialogTitle className="text-xl font-black text-navy-deep border-b pb-2 uppercase tracking-tighter">{selectedInternship ? "Update Domain" : "New Domain"}</DialogTitle></DialogHeader>
            <form onSubmit={onSaveInternship} className="space-y-4 py-4">
               <div className="space-y-1"><Label className="text-[9px] uppercase">Title *</Label><Input name="title" defaultValue={selectedInternship?.title} required className="h-10 rounded-xl text-xs" /></div>
               <div className="space-y-1"><Label className="text-[9px] uppercase">Company *</Label><Input name="company" defaultValue={selectedInternship?.company || "TechLaunchpad"} required className="h-10 rounded-xl text-xs" /></div>
               <div className="space-y-1"><Label className="text-[9px] uppercase">Category *</Label><Input name="category" defaultValue={selectedInternship?.category || "General"} required className="h-10 rounded-xl text-xs" /></div>
               <div className="space-y-1"><Label className="text-[9px] uppercase">Duration</Label><Input name="duration" defaultValue={selectedInternship?.duration} className="h-10 rounded-xl text-xs" /></div>
               <div className="space-y-1"><Label className="text-[9px] uppercase">Overview</Label><textarea name="description" defaultValue={selectedInternship?.description} className="w-full h-24 border rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-gold/10"></textarea></div>
               <div className="flex justify-end gap-3 pt-4"><Button type="button" variant="ghost" onClick={() => setIsInternshipDialogOpen(false)}>Cancel</Button><Button type="submit" className="bg-navy text-white px-10 h-11 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl">PUBLISH</Button></div>
            </form>
         </DialogContent>
      </Dialog>

      <Dialog open={!!viewingPreReg} onOpenChange={(o) => !o && setViewingPreReg(null)}>
         <DialogContent className="max-w-3xl rounded-2xl p-0 overflow-hidden border-none shadow-2xl bg-white">
            <DialogHeader className="sr-only">
               <DialogTitle>Staging Record Details</DialogTitle>
               <DialogDescription>Full description of staged academic and identity details</DialogDescription>
            </DialogHeader>
            <div className="bg-navy p-6 text-white flex items-center justify-between">
               <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter">Staging Record Details</h2>
                  <p className="text-[9px] font-bold text-gold uppercase tracking-widest mt-1">Status: {viewingPreReg?.is_claimed ? "Claimed" : "Pending Registration"}</p>
               </div>
               <Button size="icon" variant="ghost" className="text-white/40 hover:text-white" onClick={() => setViewingPreReg(null)}>✕</Button>
            </div>
            {viewingPreReg && (
               <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                     <div className="bg-secondary/5 p-3 rounded-xl border">
                        <div className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">Full Name</div>
                        <div className="text-xs font-bold text-navy-deep uppercase">{viewingPreReg.full_name}</div>
                     </div>
                     <div className="bg-secondary/5 p-3 rounded-xl border">
                        <div className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">Gender</div>
                        <div className="text-xs font-bold text-navy-deep uppercase">{viewingPreReg.gender || "—"}</div>
                     </div>
                     <div className="bg-secondary/5 p-3 rounded-xl border">
                        <div className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">Father's Name</div>
                        <div className="text-xs font-bold text-navy-deep uppercase">{viewingPreReg.parent_name || "—"}</div>
                     </div>

                     <div className="bg-secondary/5 p-3 rounded-xl border">
                        <div className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">Mobile No</div>
                        <div className="text-xs font-bold text-navy-deep font-mono">{viewingPreReg.contact_number || "—"}</div>
                     </div>
                     <div className="bg-secondary/5 p-3 rounded-xl border col-span-2">
                        <div className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">Email Address</div>
                        <div className="text-xs font-bold text-navy-deep">{viewingPreReg.email || "—"}</div>
                     </div>

                     <div className="bg-secondary/5 p-3 rounded-xl border col-span-2">
                        <div className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">University Name</div>
                        <div className="text-xs font-bold text-slate-600 uppercase">{viewingPreReg.university_name || "—"}</div>
                     </div>
                     <div className="bg-secondary/5 p-3 rounded-xl border">
                        <div className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">Degree</div>
                        <div className="text-xs font-bold text-navy-deep uppercase">{viewingPreReg.degree || "—"}</div>
                     </div>

                     <div className="bg-secondary/5 p-3 rounded-xl border col-span-2">
                        <div className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">College Name</div>
                        <div className="text-xs font-bold text-slate-600 uppercase">{viewingPreReg.college_name || "—"}</div>
                     </div>
                     <div className="bg-secondary/5 p-3 rounded-xl border">
                        <div className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">Branch</div>
                        <div className="text-xs font-bold text-navy-deep uppercase">{viewingPreReg.department || "—"}</div>
                     </div>

                     <div className="bg-secondary/5 p-3 rounded-xl border">
                        <div className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">Roll Number</div>
                        <div className="text-xs font-black text-gold font-mono">{viewingPreReg.university_roll_number}</div>
                     </div>
                     <div className="bg-secondary/5 p-3 rounded-xl border">
                        <div className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">Semester</div>
                        <div className="text-xs font-bold text-navy-deep uppercase">{viewingPreReg.semester || "—"}</div>
                     </div>
                     <div className="bg-secondary/5 p-3 rounded-xl border">
                        <div className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">Staged On</div>
                        <div className="text-xs font-bold text-navy-deep">{new Date(viewingPreReg.created_at).toLocaleDateString()}</div>
                     </div>
                  </div>
                  <div className="pt-4 flex justify-end border-t"><Button onClick={() => setViewingPreReg(null)} className="bg-navy text-white px-10 h-10 rounded-xl font-black text-[10px] uppercase tracking-widest">Close Details</Button></div>
               </div>
            )}
         </DialogContent>
      </Dialog>

      {/* View Student Full Profile Dialog */}
      <Dialog open={!!viewingStudent} onOpenChange={(o) => !o && setViewingStudent(null)}>
         <DialogContent className="max-w-4xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl bg-white max-h-[90vh] flex flex-col">
            <DialogHeader className="sr-only">
               <DialogTitle>Student Profile: {viewingStudent?.full_name}</DialogTitle>
               <DialogDescription>Full details of the selected student record.</DialogDescription>
            </DialogHeader>
            <div className="bg-[#0a192f] p-8 text-white relative overflow-hidden flex-shrink-0">
               <div className="absolute top-0 right-0 p-8 opacity-10"><Scan size={120} /></div>
               <div className="relative z-10">
                  <div className="flex items-center gap-2 text-gold font-black text-[10px] uppercase tracking-[0.3em] mb-2">
                     <ShieldCheck size={14} /> Official Student Record
                  </div>
                  <h1 className="font-display text-4xl font-black uppercase tracking-tighter leading-none">
                     {viewingStudent?.full_name}
                  </h1>
                  <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-2">
                     Roll No: <span className="text-gold">{viewingStudent?.university_roll_number || "N/A"}</span>
                  </p>
               </div>
            </div>

            <div className="p-8 overflow-y-auto flex-1 space-y-8">
               {/* 01 — Personal & Academic Overview */}
               <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <h3 className="text-[10px] font-black uppercase text-navy/40 border-b pb-1">Personal Identity</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <div className="text-[8px] font-black uppercase opacity-40 mb-0.5">Gender</div>
                           <div className="text-xs font-bold uppercase">{viewingStudent?.gender || "N/A"}</div>
                        </div>
                        <div>
                           <div className="text-[8px] font-black uppercase opacity-40 mb-0.5">Category</div>
                           <div className="text-xs font-bold uppercase">{viewingStudent?.category || "N/A"}</div>
                        </div>
                        <div className="col-span-2">
                           <div className="text-[8px] font-black uppercase opacity-40 mb-0.5">Parent's Name</div>
                           <div className="text-xs font-bold uppercase">{viewingStudent?.parent_name || viewingStudent?.father_name || "N/A"}</div>
                        </div>
                        <div>
                           <div className="text-[8px] font-black uppercase opacity-40 mb-0.5">Date of Birth</div>
                           <div className="text-xs font-bold">{viewingStudent?.dob || "N/A"}</div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <h3 className="text-[10px] font-black uppercase text-navy/40 border-b pb-1">Academic Credentials</h3>
                     <div className="space-y-3">
                        <div>
                           <div className="text-[8px] font-black uppercase opacity-40 mb-0.5">University</div>
                           <div className="text-xs font-bold text-navy-deep uppercase">{viewingStudent?.university_name}</div>
                        </div>
                        <div>
                           <div className="text-[8px] font-black uppercase opacity-40 mb-0.5">College</div>
                           <div className="text-xs font-bold text-navy-deep uppercase">{viewingStudent?.college_name}</div>
                        </div>
                        <div className="flex gap-6">
                           <div>
                              <div className="text-[8px] font-black uppercase opacity-40 mb-0.5">Degree</div>
                              <div className="text-xs font-black text-gold uppercase">{viewingStudent?.degree}</div>
                           </div>
                           <div>
                              <div className="text-[8px] font-black uppercase opacity-40 mb-0.5">Branch</div>
                              <div className="text-xs font-black text-gold uppercase">{viewingStudent?.department}</div>
                           </div>
                           <div>
                              <div className="text-[8px] font-black uppercase opacity-40 mb-0.5">Semester</div>
                              <div className="text-xs font-black text-gold uppercase">{viewingStudent?.semester || viewingStudent?.class_semester}</div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* 02 — Professional & Location */}
               <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <h3 className="text-[10px] font-black uppercase text-navy/40 border-b pb-1">Professional Portfolio</h3>
                     <div className="space-y-3">
                        <div className="flex items-center gap-2">
                           <Mail size={12} className="text-navy/40" />
                           <span className="text-xs font-bold">{viewingStudent?.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <Phone size={12} className="text-navy/40" />
                           <span className="text-xs font-bold">{viewingStudent?.contact_number}</span>
                        </div>
                        {viewingStudent?.linkedin_url && (
                           <div className="flex items-center gap-2">
                              <Linkedin size={12} className="text-blue-600" />
                              <a href={viewingStudent.linkedin_url} target="_blank" className="text-xs font-bold text-blue-600 hover:underline">LinkedIn Profile</a>
                           </div>
                        )}
                        {viewingStudent?.resume_url && (
                           <div className="flex items-center gap-2">
                              <FileText size={12} className="text-red-500" />
                              <a href={viewingStudent.resume_url} target="_blank" className="text-xs font-bold text-red-500 hover:underline">View Resume</a>
                           </div>
                        )}
                        <div>
                           <div className="text-[8px] font-black uppercase opacity-40 mb-1">Skills</div>
                           <div className="flex flex-wrap gap-1">
                              {(viewingStudent?.skills || "").split(",").map((s: string) => s.trim()).filter(Boolean).map((skill: string) => (
                                 <span key={skill} className="px-2 py-0.5 bg-navy/5 rounded-md text-[9px] font-black uppercase text-navy/60 border">{skill}</span>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <h3 className="text-[10px] font-black uppercase text-navy/40 border-b pb-1">Address Details</h3>
                     <div className="space-y-3">
                        <div>
                           <div className="text-[8px] font-black uppercase opacity-40 mb-0.5">Permanent Address</div>
                           <div className="text-xs font-bold leading-relaxed">{viewingStudent?.address || "N/A"}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                           <div>
                              <div className="text-[8px] font-black uppercase opacity-40 mb-0.5">City</div>
                              <div className="text-xs font-bold uppercase">{viewingStudent?.city || "N/A"}</div>
                           </div>
                           <div>
                              <div className="text-[8px] font-black uppercase opacity-40 mb-0.5">State</div>
                              <div className="text-xs font-bold uppercase">{viewingStudent?.state || "N/A"}</div>
                           </div>
                           <div>
                              <div className="text-[8px] font-black uppercase opacity-40 mb-0.5">PIN</div>
                              <div className="text-xs font-bold">{viewingStudent?.pin_code || "N/A"}</div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-6 bg-secondary/5 border-t flex justify-between items-center flex-shrink-0">
               <div className="flex items-center gap-2 text-[10px] font-black uppercase text-navy/40">
                  <Clock size={14} /> Record created on {new Date(viewingStudent?.created_at).toLocaleDateString()}
               </div>
               <div className="flex gap-3">
                  <Button variant="outline" onClick={() => window.print()} className="rounded-xl font-black text-[10px] uppercase border-2 h-10 px-6"><Printer size={16} className="mr-2" /> Print</Button>
                  <Button onClick={() => setViewingStudent(null)} className="bg-navy text-white px-10 h-10 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">Close Profile</Button>
               </div>
            </div>
         </DialogContent>
      </Dialog>

      {/* Bulk Attendance Dialog */}
      <Dialog open={isBulkAttendanceOpen} onOpenChange={setIsBulkAttendanceOpen}>
         <DialogContent className="max-w-4xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl bg-white">
            <div className="bg-navy p-8 text-white flex items-center justify-between">
               <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter leading-none mb-1">Bulk Presence Control</h2>
                  <p className="text-[10px] font-bold text-gold uppercase tracking-widest opacity-80">Mark multiple students present for a specific date</p>
               </div>
               <Button size="icon" variant="ghost" className="text-white/40 hover:text-white" onClick={() => setIsBulkAttendanceOpen(false)}>✕</Button>
            </div>
            
            <form onSubmit={async (e) => {
               e.preventDefault();
               const fd = new FormData(e.currentTarget);
               const date = fd.get("date") as string;
               const selectedIds = Array.from(fd.getAll("student_ids")).map(String);
               
               if(!date || selectedIds.length === 0) {
                  toast.error("Select date and at least one student!");
                  return;
               }

               setBusy(true);
               const records = selectedIds.map(id => ({
                  student_id: id,
                  date,
                  status: "present"
               }));

               const { error } = await supabase.from("attendance").upsert(records, { onConflict: 'student_id,date' });
               
               setBusy(false);
               if(!error) {
                  toast.success(`Success! Marked ${selectedIds.length} students present.`);
                  setIsBulkAttendanceOpen(false);
                  fetchData();
               } else {
                  toast.error("Error: " + error.message);
               }
            }} className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-6 bg-secondary/5 p-6 rounded-2xl border">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-navy/40">1. Select Target Date</Label>
                     <Input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="h-12 rounded-xl font-black text-navy border-2 focus:border-gold" />
                  </div>
                  <div className="flex items-end">
                     <div className="bg-gold/10 p-4 rounded-xl border border-gold/20 flex items-center gap-3 w-full">
                        <AlertCircle className="text-gold" size={20} />
                        <div className="text-[9px] font-bold text-navy-deep leading-tight uppercase">Bulk marks will bypass biometric checks and overwrite existing logs.</div>
                     </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-navy/40">2. Select Students ({students.length})</Label>
                     <div className="flex gap-2">
                        <Button type="button" variant="ghost" size="sm" className="text-[8px] font-black uppercase tracking-widest" onClick={() => {
                           const checks = document.querySelectorAll('input[name="student_ids"]');
                           checks.forEach((c: any) => c.checked = true);
                        }}>Select All</Button>
                        <Button type="button" variant="ghost" size="sm" className="text-[8px] font-black uppercase tracking-widest" onClick={() => {
                           const checks = document.querySelectorAll('input[name="student_ids"]');
                           checks.forEach((c: any) => c.checked = false);
                        }}>Deselect All</Button>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[30vh] overflow-y-auto p-4 bg-navy/5 rounded-2xl border">
                     {students.map(s => (
                        <label key={s.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border hover:border-gold cursor-pointer transition-all group">
                           <input type="checkbox" name="student_ids" value={s.id} className="size-4 accent-navy rounded" />
                           <div className="overflow-hidden">
                              <div className="text-[10px] font-black text-navy-deep uppercase truncate">{s.full_name}</div>
                              <div className="text-[8px] font-bold text-muted-foreground uppercase truncate">{s.university_roll_number}</div>
                           </div>
                        </label>
                     ))}
                  </div>
               </div>

               <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button type="button" variant="ghost" onClick={() => setIsBulkAttendanceOpen(false)} className="px-10 h-12 rounded-xl font-black uppercase text-[10px]">Cancel</Button>
                  <Button type="submit" disabled={busy} className="bg-navy text-white px-12 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2">
                     {busy ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={18} /> Apply Bulk Presence</>}
                  </Button>
               </div>
            </form>
         </DialogContent>
      </Dialog>

      {/* Assignment Creator Dialog */}
      <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
         <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl bg-white">
            <div className="bg-navy p-8 text-white">
               <h2 className="text-2xl font-black uppercase tracking-tighter leading-none mb-1">
                  {selectedAssignment ? "Modify Assignment" : "New Academic Task"}
               </h2>
               <p className="text-[10px] font-bold text-gold uppercase tracking-widest opacity-80">
                  Define instructions and set deadlines for students
               </p>
            </div>
            <form onSubmit={async (e) => {
               e.preventDefault();
               const fd = new FormData(e.currentTarget);
               const data = Object.fromEntries(fd);
               
               setBusy(true);
               const payload: any = {
                  title: data.title,
                  description: data.description,
                  due_date: data.due_date,
                  domain: data.domain || "Global",
               };

               if (selectedAssignment) payload.id = selectedAssignment.id;

               const { error } = await supabase.from("assignments").upsert(payload);
               
               setBusy(false);
               if (!error) {
                  toast.success(selectedAssignment ? "Assignment Updated!" : "Task Deployed to Students!");
                  setIsAssignmentDialogOpen(false);
                  fetchData();
               } else {
                  toast.error("Error: " + error.message);
               }
            }} className="p-8 space-y-6">
               <div className="space-y-4">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-navy/40">Assignment Title</Label>
                     <Input name="title" defaultValue={selectedAssignment?.title} placeholder="e.g. Final Project Documentation" required className="h-12 rounded-xl font-bold text-navy border-2 focus:border-gold" />
                  </div>
                  
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-navy/40">Target Internship Domain</Label>
                     <Select name="domain" defaultValue={selectedAssignment?.domain || "Global"}>
                        <SelectTrigger className="h-12 rounded-xl font-bold border-2">
                           <SelectValue placeholder="Select Domain" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-2">
                           <SelectItem value="Global" className="font-bold">Global (All Students)</SelectItem>
                           {internships.map(i => (
                              <SelectItem key={i.id} value={i.title} className="font-bold">{i.title}</SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>

                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-navy/40">Due Date</Label>
                     <Input name="due_date" type="date" defaultValue={selectedAssignment?.due_date} required className="h-12 rounded-xl font-bold text-navy border-2 focus:border-gold" />
                  </div>

                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-navy/40">Detailed Instructions</Label>
                     <textarea 
                        name="description" 
                        defaultValue={selectedAssignment?.description}
                        placeholder="Explain the task requirements, format, and submission guidelines..." 
                        required 
                        className="w-full h-40 bg-navy/5 border-2 rounded-2xl p-4 text-sm font-bold text-navy outline-none focus:border-gold transition-all"
                     />
                  </div>
               </div>

               <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button type="button" variant="ghost" onClick={() => setIsAssignmentDialogOpen(false)} className="px-10 h-12 rounded-xl font-black uppercase text-[10px]">Cancel</Button>
                  <Button type="submit" disabled={busy} className="bg-navy text-white px-12 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2">
                     {busy ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={18} /> {selectedAssignment ? "Update Task" : "Deploy Task"}</>}
                  </Button>
               </div>
            </form>
         </DialogContent>
      </Dialog>

    </div>
  );
}
