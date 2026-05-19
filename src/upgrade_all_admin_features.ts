import fs from 'fs';

const filePath = 'c:/Users/rauna/Desktop/hellointernugc/src/routes/dashboard/admin.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize to LF
content = content.replace(/\r\n/g, '\n');

// 1. Revert any partial changes first to guarantee a perfectly clean state
console.log('Reverting files to clean HEAD state...');
import { execSync } from 'child_process';
execSync('git checkout src/routes/dashboard/admin.tsx');
content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

// 2. Inject states and academic helper functions
const stateTarget = `  const [activeUni, setActiveUni] = useState("");
  const [activeCol, setActiveCol] = useState("");
  const [activeStructures, setActiveStructures] = useState<any[]>([]);
  const [filteredColleges, setFilteredColleges] = useState<any[]>([]);`;

const stateReplacement = `  const [activeUni, setActiveUni] = useState("");
  const [activeCol, setActiveCol] = useState("");
  const [activeStructures, setActiveStructures] = useState<any[]>([]);
  const [filteredColleges, setFilteredColleges] = useState<any[]>([]);

  const activeUniData = explorerUni ? universities.find(u => u.id === explorerUni.id) : null;

  async function syncNewCollegesStructures(uniId: string) {
    const { data: cols } = await supabase.from("colleges").select("id").eq("university_id", uniId);
    if (!cols || cols.length === 0) return;
    
    const { data: structs } = await supabase.from("academic_structures").select("*").in("college_id", cols.map(c => c.id));
    const degrees = Array.from(new Set(structs?.map(s => s.degree))).filter(Boolean);
    const departments = Array.from(new Set(structs?.map(s => s.department))).filter(Boolean);
    const sessions = Array.from(new Set(structs?.map(s => s.session))).filter(Boolean);
    
    const allInserts: any[] = [];
    for (const col of cols) {
      const colStructs = structs?.filter(s => s.college_id === col.id) || [];
      const colDegrees = new Set(colStructs.map(s => s.degree));
      const colDepts = new Set(colStructs.map(s => s.department));
      const colSessions = new Set(colStructs.map(s => s.session));
      
      for (const deg of degrees) {
        if (!colDegrees.has(deg)) {
          allInserts.push({ college_id: col.id, degree: deg, department: "General", session: "2024-28" });
        }
      }
      for (const dept of departments) {
        if (!colDepts.has(dept)) {
          allInserts.push({ college_id: col.id, department: dept, degree: "General", session: "2024-28" });
        }
      }
      for (const ses of sessions) {
        if (!colSessions.has(ses)) {
          allInserts.push({ college_id: col.id, session: ses, degree: "General", department: "General" });
        }
      }
    }
    
    if (allInserts.length > 0) {
      await supabase.from("academic_structures").insert(allInserts);
    }
  }

  async function addUniversityDepartment(deptName: string) {
    if (!deptName) return;
    const collegesList = activeUniData?.colleges || [];
    if (collegesList.length === 0) {
      toast.error("Please add at least one college to this university first!");
      return;
    }
    setBusy(true);
    const inserts = collegesList.map((col: any) => ({
      college_id: col.id,
      department: deptName,
      degree: "General",
      session: "2024-28"
    }));
    const { error } = await supabase.from("academic_structures").insert(inserts);
    setBusy(false);
    if (!error) {
      toast.success(\`Department "\&quot;\${deptName}\&quot;" added successfully!\`);
      fetchData();
    } else {
      toast.error("Failed to add department: " + error.message);
    }
  }

  async function addUniversityCourse(courseName: string) {
    if (!courseName) return;
    const collegesList = activeUniData?.colleges || [];
    if (collegesList.length === 0) {
      toast.error("Please add at least one college to this university first!");
      return;
    }
    setBusy(true);
    const inserts = collegesList.map((col: any) => ({
      college_id: col.id,
      degree: courseName,
      department: "General",
      session: "2024-28"
    }));
    const { error } = await supabase.from("academic_structures").insert(inserts);
    setBusy(false);
    if (!error) {
      toast.success(\`Course "\&quot;\${courseName}\&quot;" added successfully!\`);
      fetchData();
    } else {
      toast.error("Failed to add course: " + error.message);
    }
  }

  async function addUniversitySession(sessionName: string) {
    if (!sessionName) return;
    const collegesList = activeUniData?.colleges || [];
    if (collegesList.length === 0) {
      toast.error("Please add at least one college to this university first!");
      return;
    }
    setBusy(true);
    const inserts = collegesList.map((col: any) => ({
      college_id: col.id,
      session: sessionName,
      degree: "General",
      department: "General"
    }));
    const { error } = await supabase.from("academic_structures").insert(inserts);
    setBusy(false);
    if (!error) {
      toast.success(\`Session "\&quot;\${sessionName}\&quot;" added successfully!\`);
      fetchData();
    } else {
      toast.error("Failed to add session: " + error.message);
    }
  }

  async function deleteUniversityDepartment(deptName: string) {
    if (!confirm(\`Are you sure you want to delete department "\${deptName}" from all colleges?\`)) return;
    const colIds = (activeUniData?.colleges || []).map((c: any) => c.id);
    if (colIds.length === 0) return;
    setBusy(true);
    const { error } = await supabase.from("academic_structures").delete().in("college_id", colIds).eq("department", deptName);
    setBusy(false);
    if (!error) {
      toast.success("Department deleted.");
      fetchData();
    } else {
      toast.error("Error deleting department: " + error.message);
    }
  }

  async function deleteUniversityCourse(courseName: string) {
    if (!confirm(\`Are you sure you want to delete course "\${courseName}" from all colleges?\`)) return;
    const colIds = (activeUniData?.colleges || []).map((c: any) => c.id);
    if (colIds.length === 0) return;
    setBusy(true);
    const { error } = await supabase.from("academic_structures").delete().in("college_id", colIds).eq("degree", courseName);
    setBusy(false);
    if (!error) {
      toast.success("Course deleted.");
      fetchData();
    } else {
      toast.error("Error deleting course: " + error.message);
    }
  }

  async function deleteUniversitySession(sessionName: string) {
    if (!confirm(\`Are you sure you want to delete session "\${sessionName}" from all colleges?\`)) return;
    const colIds = (activeUniData?.colleges || []).map((c: any) => c.id);
    if (colIds.length === 0) return;
    setBusy(true);
    const { error } = await supabase.from("academic_structures").delete().in("college_id", colIds).eq("session", sessionName);
    setBusy(false);
    if (!error) {
      toast.success("Session deleted.");
      fetchData();
    } else {
      toast.error("Error deleting session: " + error.message);
    }
  }`;

if (content.includes(stateTarget)) {
  content = content.replace(stateTarget, stateReplacement);
  console.log('1. Helper functions & activeUniData injected successfully.');
} else {
  console.error('1. Helper state target failed!');
}

// 3. Inject full upgraded network view block (including inline fee inputs next to edit/delete)
const networkStart = `{/* HIERARCHICAL ACADEMIC NETWORK */}`;
const networkEnd = `{/* COMPACT PORTFOLIO (INTERNSHIPS) */}`;

const startIndex = content.indexOf(networkStart);
const endIndex = content.indexOf(networkEnd);

if (startIndex !== -1 && endIndex !== -1) {
  const originalBlock = content.substring(startIndex, endIndex);
  
  const upgradedBlock = `{/* HIERARCHICAL ACADEMIC NETWORK */}
      {view === "institutes" && (
         <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border shadow-sm flex items-center justify-between gap-4">
               <div className="flex items-center gap-2 overflow-hidden">
                  <Button variant="ghost" size="sm" className={\`h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest \${!explorerUni ? 'text-[#1e40af] bg-blue-50' : 'text-slate-400'}\`} onClick={() => { setExplorerUni(null); setExplorerCol(null); }}>Universities</Button>
                  {activeUniData && (
                     <>
                        <ChevronRight size={14} className="text-slate-300" />
                        <Button variant="ghost" size="sm" className={\`h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest \${activeUniData && !explorerCol ? 'text-[#1e40af] bg-blue-50' : 'text-slate-400'} truncate max-w-[150px]\`} onClick={() => setExplorerCol(null)}>{activeUniData.name}</Button>
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

            {activeUniData && !explorerCol && (
               <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6 mb-6">
                  <div className="border-b pb-4 flex items-center justify-between">
                     <div>
                        <h3 className="text-sm font-black text-navy uppercase tracking-tight">University Academic Infrastructure</h3>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                           Configure departments, degrees/courses, and sessions shared across all affiliated colleges of {activeUniData.name}.
                        </p>
                     </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                     {/* Courses */}
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                           <span className="text-[10px] font-black text-navy uppercase tracking-wider flex items-center gap-1.5">
                              <BookOpen className="size-3 text-gold" /> Courses
                           </span>
                           <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 px-2 text-[9px] font-black uppercase text-[#1e40af] hover:bg-[#1e40af]/5"
                              onClick={() => {
                                 const course = prompt("Enter course/degree name (e.g. B.Tech, BCA):");
                                 if (course) addUniversityCourse(course);
                              }}
                           >
                              + Add Course
                           </Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                           {Array.from(new Set((activeUniData.colleges || []).flatMap((c: any) => c.academic_structures || []).map((s: any) => s.degree))).filter(d => d && d !== "General").map((degree: any) => (
                              <span key={degree} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border text-[9px] font-bold text-slate-600">
                                 {degree}
                                 <button onClick={() => deleteUniversityCourse(degree)} className="text-slate-400 hover:text-red-500 font-bold ml-1">✕</button>
                              </span>
                           ))}
                           {Array.from(new Set((activeUniData.colleges || []).flatMap((c: any) => c.academic_structures || []).map((s: any) => s.degree))).filter(d => d && d !== "General").length === 0 && (
                              <span className="text-[9px] italic text-slate-400">No courses defined</span>
                           )}
                        </div>
                     </div>

                     {/* Departments */}
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                           <span className="text-[10px] font-black text-navy uppercase tracking-wider flex items-center gap-1.5">
                              <School className="size-3 text-gold" /> Departments
                           </span>
                           <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 px-2 text-[9px] font-black uppercase text-[#1e40af] hover:bg-[#1e40af]/5"
                              onClick={() => {
                                 const dept = prompt("Enter department/branch name (e.g. CSE, ECE):");
                                 if (dept) addUniversityDepartment(dept);
                              }}
                           >
                              + Add Dept
                           </Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                           {Array.from(new Set((activeUniData.colleges || []).flatMap((c: any) => c.academic_structures || []).map((s: any) => s.department))).filter(d => d && d !== "General").map((dept: any) => (
                              <span key={dept} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border text-[9px] font-bold text-slate-600">
                                 {dept}
                                 <button onClick={() => deleteUniversityDepartment(dept)} className="text-slate-400 hover:text-red-500 font-bold ml-1">✕</button>
                              </span>
                           ))}
                           {Array.from(new Set((activeUniData.colleges || []).flatMap((c: any) => c.academic_structures || []).map((s: any) => s.department))).filter(d => d && d !== "General").length === 0 && (
                              <span className="text-[9px] italic text-slate-400">No departments defined</span>
                           )}
                        </div>
                     </div>

                     {/* Sessions */}
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                           <span className="text-[10px] font-black text-navy uppercase tracking-wider flex items-center gap-1.5">
                              <Calendar className="size-3 text-gold" /> Sessions
                           </span>
                           <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 px-2 text-[9px] font-black uppercase text-[#1e40af] hover:bg-[#1e40af]/5"
                              onClick={() => {
                                 const ses = prompt("Enter session (e.g. 2024-28, 2023-27):");
                                 if (ses) addUniversitySession(ses);
                              }}
                           >
                              + Add Session
                           </Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                           {Array.from(new Set((activeUniData.colleges || []).flatMap((c: any) => c.academic_structures || []).map((s: any) => s.session))).filter(s => s && s !== "2024-28").map((session: any) => (
                              <span key={session} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border text-[9px] font-bold text-slate-600">
                                 {session}
                                 <button onClick={() => deleteUniversitySession(session)} className="text-slate-400 hover:text-red-500 font-bold ml-1">✕</button>
                              </span>
                           ))}
                           {Array.from(new Set((activeUniData.colleges || []).flatMap((c: any) => c.academic_structures || []).map((s: any) => s.session))).filter(s => s && s !== "2024-28").length === 0 && (
                              <span className="text-[9px] italic text-slate-400">No sessions defined</span>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            )}

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
                     {activeUniData?.colleges?.filter((c: any) => c.name.toLowerCase().includes(colSearch.toLowerCase())).map((col: any) => (
                        <div key={col.id} className="group flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                           <div className="flex items-center gap-4">
                              <div className="size-10 rounded-xl bg-amber-50 text-amber-600 grid place-items-center"><Building2 size={20}/></div>
                              <div>
                                 <div className="text-sm font-black text-slate-800 uppercase tracking-tight">{col.name}</div>
                                 <div className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">Affiliated Institute</div>
                              </div>
                           </div>
                           <div className="flex items-center gap-6" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-2">
                                 <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest">Fee (₹):</span>
                                 <input
                                    type="number"
                                    defaultValue={settings?.college_fees?.[col.id] || ""}
                                    placeholder={settings?.registration_fee || "1500"}
                                    onChange={async (e) => {
                                       const val = e.target.value;
                                       const newFees = { ...(settings?.college_fees || {}) };
                                       if (val) {
                                          newFees[col.id] = Number(val);
                                       } else {
                                          delete newFees[col.id];
                                       }
                                       const { error } = await supabase
                                          .from("portal_settings")
                                          .upsert({ 
                                             id: 'global', 
                                             ...settings,
                                             college_fees: newFees 
                                          });
                                       if (!error) {
                                          setSettings({ ...(settings || {}), college_fees: newFees });
                                          toast.success("Fee updated!");
                                       } else {
                                          toast.error("Failed to update fee: " + error.message);
                                       }
                                    }}
                                    className="h-8 w-24 font-bold text-right text-xs rounded-lg border-2 px-2 focus:border-gold outline-none"
                                 />
                              </div>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                                 <Button size="icon" variant="ghost" className="size-8 rounded-lg border" onClick={() => { setSelectedColForStructure(col); setSelectedUniForCollege(activeUniData); setIsEditColOpen(true); }}><Edit size={16}/></Button>
                                 <Button size="icon" variant="ghost" className="size-8 rounded-lg border text-red-500" onClick={async () => { if(confirm("Delete College?")) { await supabase.from("colleges").delete().eq("id", col.id); fetchData(); } }}><Trash2 size={16}/></Button>
                              </div>
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
                     const names = (fd.get("colleges") as string).split("\\n").map(n => n.trim()).filter(Boolean);
                     if (!names.length) return;
                     await supabase.from("colleges").insert(names.map(name => ({ name, university_id: explorerUni.id })));
                     await syncNewCollegesStructures(explorerUni.id);
                     toast.success("Added!"); fetchData(); (e.target as any).reset();
                  }} className="flex flex-col md:flex-row gap-4">
                     <textarea name="colleges" placeholder="Enter College Names (One per line)..." className="flex-1 h-20 bg-slate-50 border rounded-xl p-3 text-xs font-bold outline-none" />
                     <Button type="submit" className="bg-[#1e40af] text-white px-8 h-20 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl">Bulk Save</Button>
                  </form>
               </div>
            )}
         </div>
      )}`;

  content = content.replace(originalBlock, upgradedBlock);
  console.log('2. Network view block successfully upgraded (including inline college fees inputs).');
} else {
  console.error('2. Failed to match HIERARCHICAL ACADEMIC NETWORK block indices!');
}

// 4. Inject settings panel customized form with global default & college-wise configs
const settingsStart = `{/* COMPACT PORTAL SETTINGS */}`;
const settingsEnd = `{/* DIALOGS */}`;

const sIndex = content.indexOf(settingsStart);
const eIndex = content.indexOf(settingsEnd);

if (sIndex !== -1 && eIndex !== -1) {
  const originalSettingsBlock = content.substring(sIndex, eIndex);
  
  const upgradedSettingsBlock = `{/* COMPACT PORTAL SETTINGS */}
      {view === "settings" && (
         <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
               <h2 className="text-xl font-black text-navy-deep uppercase tracking-tighter mb-4">Institutional Configuration</h2>
               <form onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const rawData = Object.fromEntries(fd);
                  
                  // Construct college-wise fees object
                  const collegeFeesObj: Record<string, number> = {};
                  for (const key in rawData) {
                     if (key.startsWith('college_fee_')) {
                        const colId = key.substring('college_fee_'.length);
                        const val = rawData[key];
                        if (val) {
                           collegeFeesObj[colId] = Number(val);
                        }
                     }
                  }

                  const payload = {
                     id: 'global',
                     company_name: rawData.company_name,
                     company_address: rawData.company_address,
                     company_email: rawData.company_email,
                     company_phone: rawData.company_phone,
                     coordinator_name: rawData.coordinator_name,
                     coordinator_signature_url: rawData.coordinator_signature_url,
                     registration_fee: Number(rawData.registration_fee || 1500),
                     college_fees: collegeFeesObj
                  };

                  setBusy(true);
                  const { error } = await supabase.from("portal_settings").upsert(payload);
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

                  {/* Fee Configurations */}
                  <div className="space-y-4 border-t pt-6">
                     <h3 className="text-[10px] font-black uppercase text-gold tracking-[0.2em] border-b pb-2">Registration Fee Configurations</h3>
                     <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                           <Label className="text-[9px] font-black uppercase opacity-40">Default Registration Fee (₹)</Label>
                           <Input 
                              name="registration_fee" 
                              type="number" 
                              defaultValue={settings?.registration_fee || "1500"} 
                              className="h-11 rounded-xl font-bold border-2" 
                              placeholder="1500"
                           />
                           <p className="text-[9px] font-medium text-slate-400">Used as fallback if college-wise fee is not set.</p>
                        </div>
                     </div>

                     <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 mt-4">
                        <div>
                           <h4 className="text-xs font-black text-navy uppercase tracking-tight">College-wise Fee Customization</h4>
                           <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                              Set specific registration fees per institution. Leave empty to use the default fee.
                           </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2">
                           {universities.map(uni => (
                              <div key={uni.id} className="bg-white p-4 rounded-xl border space-y-3">
                                 <div className="text-[9px] font-black text-navy uppercase tracking-wider border-b pb-1.5 flex items-center gap-1.5">
                                    <School className="size-3 text-gold" /> {uni.name}
                                 </div>
                                 <div className="space-y-2">
                                    {(uni.colleges || []).map((col: any) => (
                                       <div key={col.id} className="flex items-center justify-between gap-3 text-xs">
                                          <span className="font-bold text-slate-600 truncate max-w-[180px]">{col.name}</span>
                                          <Input 
                                             name={\`college_fee_\${col.id}\`} 
                                             type="number" 
                                             defaultValue={settings?.college_fees?.[col.id] || ""} 
                                             placeholder={settings?.registration_fee || "1500"} 
                                             className="h-8 w-24 font-bold text-right text-xs rounded-lg border-2"
                                          />
                                       </div>
                                    ))}
                                    {(!uni.colleges || uni.colleges.length === 0) && (
                                       <span className="text-[9px] italic text-slate-400">No colleges registered</span>
                                    )}
                                 </div>
                              </div>
                           ))}
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
      `;

  content = content.replace(originalSettingsBlock, upgradedSettingsBlock);
  console.log('3. Settings panel customized configs injected successfully.');
} else {
  console.error('3. Settings block target failed!');
}

// 5. Update single Add/Edit College dialog onSubmit to include syncNewCollegesStructures
const collegeDialogSubmitTarget = `            <form onSubmit={async (e) => { 
               e.preventDefault(); 
               const fd = new FormData(e.currentTarget); 
               await supabase.from("colleges").upsert({ id: selectedColForStructure?.id, name: fd.get("name"), university_id: selectedUniForCollege?.id || explorerUni?.id }); 
               toast.success("Success!"); setIsAddCollegeOpen(false); setIsEditColOpen(false); fetchData(); 
            }} className="space-y-4 py-4">`;

const collegeDialogSubmitReplacement = `            <form onSubmit={async (e) => { 
               e.preventDefault(); 
               const fd = new FormData(e.currentTarget); 
               const uId = selectedUniForCollege?.id || explorerUni?.id;
               await supabase.from("colleges").upsert({ id: selectedColForStructure?.id, name: fd.get("name"), university_id: uId }); 
               if (uId) await syncNewCollegesStructures(uId);
               toast.success("Success!"); setIsAddCollegeOpen(false); setIsEditColOpen(false); fetchData(); 
            }} className="space-y-4 py-4">`;

if (content.includes(collegeDialogSubmitTarget)) {
  content = content.replace(collegeDialogSubmitTarget, collegeDialogSubmitReplacement);
  console.log('4. Single college submit dialog updated.');
} else {
  console.error('4. Single college submit target not found!');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Unified compilation build upgrade completed successfully!');
