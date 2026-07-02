import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Briefcase, Plus, Users, Edit, Trash2, MoreVertical, Eye, BookOpen, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function JobCampusAdminView() {
  const [tab, setTab] = useState<"postings" | "enrollments" | "transactions" | "trainings" | "vacancies">("postings");
  const [postings, setPostings] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [trainings, setTrainings] = useState<any[]>([]);
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Job Form states
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [isEditingJob, setIsEditingJob] = useState(false);
  const [editingJobId, setEditingJobId] = useState("");
  
  const [title, setTitle] = useState("");
  const [jobId, setJobId] = useState("");
  const [desc, setDesc] = useState("");
  const [salary, setSalary] = useState("");
  const [fee, setFee] = useState("0");
  const [saving, setSaving] = useState(false);

  // Enroll state
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [enrolling, setEnrolling] = useState(false);

  // Edit Enrollment State
  const [isEditEnrollmentOpen, setIsEditEnrollmentOpen] = useState(false);
  const [editingEnrollmentId, setEditingEnrollmentId] = useState("");
  const [enrollmentStatus, setEnrollmentStatus] = useState("");

  // Training Form states
  const [isTrainingOpen, setIsTrainingOpen] = useState(false);
  const [tTitle, setTTitle] = useState("");
  const [tType, setTType] = useState("youtube");
  const [tMode, setTMode] = useState("online");
  const [tLink, setTLink] = useState("");
  const [tTargets, setTTargets] = useState<string[]>([]);

  // Vacancy Form states
  const [isVacancyOpen, setIsVacancyOpen] = useState(false);
  const [vTitle, setVTitle] = useState("");
  const [vSalary, setVSalary] = useState("");
  const [vExp, setVExp] = useState("");
  const [vDesc, setVDesc] = useState("");
  const [vLink, setVLink] = useState("");
  const [vPostDate, setVPostDate] = useState("");
  const [vEndDate, setVEndDate] = useState("");
  const [vTargets, setVTargets] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    if (tab === "postings") {
      const { data } = await supabase.from("job_campus_postings").select("*").order("created_at", { ascending: false });
      if (data) setPostings(data);
    } else if (tab === "enrollments") {
      const { data } = await supabase.from("job_campus_enrollments").select("*, job_campus_postings(*), profiles(*)").order("created_at", { ascending: false });
      if (data) setEnrollments(data);
      const { data: studentsData } = await supabase.from("profiles").select("id, full_name, email").eq("role", "student");
      if (studentsData) setStudents(studentsData);
    } else if (tab === "transactions") {
      const { data } = await supabase.from("job_campus_transactions").select("*, job_campus_enrollments(*, profiles(*), job_campus_postings(*))").order("created_at", { ascending: false });
      if (data) setTransactions(data);
    } else if (tab === "trainings") {
      const { data } = await supabase.from("job_campus_candidate_trainings").select("*").order("created_at", { ascending: false });
      if (data) setTrainings(data);
      const { data: pData } = await supabase.from("job_campus_postings").select("id, title, job_id").order("created_at", { ascending: false });
      if (pData) setPostings(pData);
    } else if (tab === "vacancies") {
      const { data } = await supabase.from("job_campus_candidate_vacancies").select("*").order("created_at", { ascending: false });
      if (data) setVacancies(data);
      const { data: pData } = await supabase.from("job_campus_postings").select("id, title, job_id").order("created_at", { ascending: false });
      if (pData) setPostings(pData);
    }
    setLoading(false);
  };

  const openAddJob = () => {
    setIsEditingJob(false);
    setEditingJobId("");
    setTitle("");
    setJobId("");
    setDesc("");
    setSalary("");
    setFee("0");
    setIsJobDialogOpen(true);
  };

  const openEditJob = (job: any) => {
    setIsEditingJob(true);
    setEditingJobId(job.id);
    setTitle(job.title);
    setJobId(job.job_id);
    setDesc(job.description);
    setSalary(job.salary);
    setFee(job.training_fee.toString());
    setIsJobDialogOpen(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title,
        job_id: jobId,
        description: desc,
        salary,
        training_fee: parseFloat(fee) || 0
      };

      if (isEditingJob) {
        const { error } = await supabase.from("job_campus_postings").update(payload).eq("id", editingJobId);
        if (error) throw error;
        toast.success("Job posting updated!");
      } else {
        const { error } = await supabase.from("job_campus_postings").insert(payload);
        if (error) throw error;
        toast.success("Job posting created!");
      }
      setIsJobDialogOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job posting?")) return;
    try {
      const { error } = await supabase.from("job_campus_postings").delete().eq("id", id);
      if (error) throw error;
      toast.success("Job deleted!");
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnrolling(true);
    try {
      const { error } = await supabase.from("job_campus_enrollments").insert({
        posting_id: selectedJob,
        candidate_id: selectedStudent,
        status: "enrolled"
      });
      if (error) throw error;
      toast.success("Candidate enrolled!");
      setIsEnrollOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setEnrolling(false);
    }
  };

  const openEditEnrollment = (enc: any) => {
    setEditingEnrollmentId(enc.id);
    setEnrollmentStatus(enc.status);
    setIsEditEnrollmentOpen(true);
  };

  const handleUpdateEnrollmentStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnrolling(true);
    try {
      const { error } = await supabase.from("job_campus_enrollments").update({ status: enrollmentStatus }).eq("id", editingEnrollmentId);
      if (error) throw error;
      toast.success("Enrollment updated!");
      setIsEditEnrollmentOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setEnrolling(false);
    }
  };

  const handleDeleteEnrollment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this enrollment?")) return;
    try {
      const { error } = await supabase.from("job_campus_enrollments").delete().eq("id", id);
      if (error) throw error;
      toast.success("Enrollment deleted!");
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSaveTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const savePromise = supabase.from("job_campus_candidate_trainings").insert({
        title: tTitle,
        training_type: tType,
        mode: tMode,
        link: tLink,
        target_postings: tTargets
      });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out. The table may not exist yet. Please run the migration SQL first.")), 8000)
      );
      const { error } = await Promise.race([savePromise, timeoutPromise]) as any;
      if (error) throw new Error(error.message || JSON.stringify(error));
      toast.success("Training created successfully!");
      setIsTrainingOpen(false);
      fetchData();
    } catch (err: any) {
      console.error("Training save error:", err);
      toast.error(err.message || "Failed to save. Check console for details.", { duration: 8000 });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveVacancy = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const savePromise = supabase.from("job_campus_candidate_vacancies").insert({
        job_title: vTitle,
        salary: vSalary,
        experience: vExp,
        description: vDesc,
        apply_link: vLink,
        posting_date: vPostDate || null,
        end_date: vEndDate || null,
        target_postings: vTargets
      });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out. The table may not exist yet. Please run the migration SQL first.")), 8000)
      );
      const { error } = await Promise.race([savePromise, timeoutPromise]) as any;
      if (error) throw new Error(error.message || JSON.stringify(error));
      toast.success("Vacancy created successfully!");
      setIsVacancyOpen(false);
      fetchData();
    } catch (err: any) {
      console.error("Vacancy save error:", err);
      toast.error(err.message || "Failed to save. Check console for details.", { duration: 8000 });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTraining = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const { error } = await supabase.from("job_campus_candidate_trainings").delete().eq("id", id);
    if (!error) fetchData();
  };

  const handleDeleteVacancy = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const { error } = await supabase.from("job_campus_candidate_vacancies").delete().eq("id", id);
    if (!error) fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-black text-navy-deep uppercase tracking-tight flex items-center gap-2">
            <Briefcase className="size-5 text-gold" /> Job Campus Administration
          </h2>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
            Manage postings, candidates, and payments.
          </p>
        </div>
        <div className="flex gap-2 bg-slate-50 p-1 rounded-xl flex-wrap">
          <Button variant={tab === "postings" ? "default" : "ghost"} onClick={() => setTab("postings")} className={`rounded-lg ${tab==="postings"?"bg-navy text-white":""}`}>Postings</Button>
          <Button variant={tab === "enrollments" ? "default" : "ghost"} onClick={() => setTab("enrollments")} className={`rounded-lg ${tab==="enrollments"?"bg-navy text-white":""}`}>Enrollments</Button>
          <Button variant={tab === "transactions" ? "default" : "ghost"} onClick={() => setTab("transactions")} className={`rounded-lg ${tab==="transactions"?"bg-navy text-white":""}`}>Transactions</Button>
          <Button variant={tab === "trainings" ? "default" : "ghost"} onClick={() => setTab("trainings")} className={`rounded-lg ${tab==="trainings"?"bg-navy text-white":""}`}>Trainings</Button>
          <Button variant={tab === "vacancies" ? "default" : "ghost"} onClick={() => setTab("vacancies")} className={`rounded-lg ${tab==="vacancies"?"bg-navy text-white":""}`}>Vacancies</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin size-8 text-gold" /></div>
      ) : (
        <>
          {tab === "postings" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={openAddJob} className="bg-navy hover:bg-navy/90 text-white rounded-xl">
                  <Plus className="size-4 mr-2" /> Add Job
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {postings.map(p => (
                  <Card key={p.id} className="rounded-2xl shadow-sm flex flex-col">
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{p.title}</CardTitle>
                        <div className="text-sm text-gray-500">ID: {p.job_id}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => openEditJob(p)}>
                          <Edit className="size-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteJob(p.id)}>
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="text-sm mb-2 max-h-[200px] overflow-y-auto bg-slate-50 p-2 rounded">
                        <MarkdownRenderer content={p.description} />
                      </div>
                      <div className="flex justify-between font-bold text-sm mt-4">
                        <span className="text-green-600">{p.salary}</span>
                        <span className="text-navy">Fee: ₹{p.training_fee}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {tab === "trainings" && (
            <div className="space-y-4">
               <div className="flex justify-end">
                <Button onClick={() => {
                  setTTitle(""); setTType("youtube"); setTMode("online"); setTLink(""); setTTargets([]);
                  setIsTrainingOpen(true);
                }} className="bg-navy hover:bg-navy/90 text-white rounded-xl">
                  <Plus className="size-4 mr-2" /> Add Training
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {trainings.map(t => (
                  <Card key={t.id} className="rounded-2xl shadow-sm">
                    <CardHeader className="flex flex-row justify-between">
                      <div>
                        <CardTitle className="text-lg">{t.title}</CardTitle>
                        <p className="text-sm text-gray-500 capitalize">{t.training_type} • {t.mode}</p>
                      </div>
                      <Button variant="outline" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteTraining(t.id)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-blue-600 mb-2 truncate"><a href={t.link} target="_blank" rel="noreferrer">{t.link}</a></p>
                      <p className="text-xs text-gray-500">Targeted to {t.target_postings?.length || 0} job postings</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {tab === "vacancies" && (
            <div className="space-y-4">
               <div className="flex justify-end">
                <Button onClick={() => {
                  setVTitle(""); setVSalary(""); setVExp(""); setVDesc(""); setVLink(""); setVPostDate(""); setVEndDate(""); setVTargets([]);
                  setIsVacancyOpen(true);
                }} className="bg-navy hover:bg-navy/90 text-white rounded-xl">
                  <Plus className="size-4 mr-2" /> Add Vacancy
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {vacancies.map(v => (
                  <Card key={v.id} className="rounded-2xl shadow-sm flex flex-col">
                    <CardHeader className="flex flex-row justify-between">
                      <div>
                        <CardTitle className="text-lg">{v.job_title}</CardTitle>
                        <p className="text-sm text-gray-500">{v.experience} • {v.salary}</p>
                      </div>
                      <Button variant="outline" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteVacancy(v.id)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col">
                      <p className="text-xs text-gray-700 mb-4 line-clamp-3">{v.description}</p>
                      <div className="mt-auto">
                        <p className="text-xs text-blue-600 mb-2 truncate"><a href={v.apply_link} target="_blank" rel="noreferrer">{v.apply_link}</a></p>
                        <p className="text-xs text-gray-500">Targeted to {v.target_postings?.length || 0} job postings</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {tab === "enrollments" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setIsEnrollOpen(true)} className="bg-navy hover:bg-navy/90 text-white rounded-xl">
                  <Users className="size-4 mr-2" /> Enroll Candidate
                </Button>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3 border-b">Candidate</th>
                      <th className="px-4 py-3 border-b">Email</th>
                      <th className="px-4 py-3 border-b">Job</th>
                      <th className="px-4 py-3 border-b">Status</th>
                      <th className="px-4 py-3 border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map(e => (
                      <tr key={e.id} className="hover:bg-slate-50 transition-colors border-b">
                        <td className="px-4 py-3 font-bold">{e.profiles?.full_name}</td>
                        <td className="px-4 py-3 text-slate-500">{e.profiles?.email}</td>
                        <td className="px-4 py-3 text-navy font-bold">{e.job_campus_postings?.title}</td>
                        <td className="px-4 py-3">
                          <span className={`uppercase text-[10px] font-black px-2 py-1 rounded-md ${
                            e.status === 'enrolled' ? 'bg-blue-100 text-blue-700' :
                            e.status === 'completed' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {e.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreVertical className="size-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem onClick={() => alert(`Showing details for ${e.profiles?.full_name}`)}>
                                <Eye className="size-4 mr-2" /> Show
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditEnrollment(e)}>
                                <Edit className="size-4 mr-2" /> Edit Status
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteEnrollment(e.id)}>
                                <Trash2 className="size-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "transactions" && (
             <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3 border-b">Candidate</th>
                      <th className="px-4 py-3 border-b">Job</th>
                      <th className="px-4 py-3 border-b">Amount</th>
                      <th className="px-4 py-3 border-b">Status</th>
                      <th className="px-4 py-3 border-b">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(t => (
                      <tr key={t.id} className="border-b">
                        <td className="px-4 py-3 font-bold">{t.job_campus_enrollments?.profiles?.full_name}</td>
                        <td className="px-4 py-3">{t.job_campus_enrollments?.job_campus_postings?.title}</td>
                        <td className="px-4 py-3 font-bold text-green-600">₹{t.amount}</td>
                        <td className="px-4 py-3 uppercase text-xs">{t.status}</td>
                        <td className="px-4 py-3 text-xs">{new Date(t.transaction_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Training Dialog */}
      <Dialog open={isTrainingOpen} onOpenChange={setIsTrainingOpen}>
        <DialogContent className="rounded-3xl max-w-lg">
          <DialogHeader><DialogTitle>Create Candidate Training</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveTraining} className="space-y-4">
             <div className="space-y-1">
              <Label>Training Title</Label>
              <Input required value={tTitle} onChange={e=>setTTitle(e.target.value)} placeholder="e.g. Resume Building Session" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Type</Label>
                <select className="w-full h-10 border rounded-lg px-3" value={tType} onChange={e=>setTType(e.target.value)}>
                  <option value="youtube">YouTube</option>
                  <option value="meet">Google Meet</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Mode</Label>
                <select className="w-full h-10 border rounded-lg px-3" value={tMode} onChange={e=>setTMode(e.target.value)}>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Link (URL)</Label>
              <Input value={tLink} onChange={e=>setTLink(e.target.value)} placeholder="https://youtube.com/..." />
            </div>
            <div className="space-y-2 pt-2 border-t">
              <Label>Select Target Enrolled Job Postings (Check to allow)</Label>
              <div className="max-h-[150px] overflow-y-auto border rounded-lg p-2 bg-slate-50 space-y-2">
                {postings.map(p => (
                  <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-100 p-1 rounded">
                    <input type="checkbox" checked={tTargets.includes(p.id)} onChange={(e) => {
                      if(e.target.checked) setTTargets([...tTargets, p.id]);
                      else setTTargets(tTargets.filter(id => id !== p.id));
                    }} />
                    {p.title} ({p.job_id})
                  </label>
                ))}
                {postings.length === 0 && <span className="text-xs text-gray-500">No job postings found.</span>}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={()=>setIsTrainingOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Create Training"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Vacancy Dialog */}
      <Dialog open={isVacancyOpen} onOpenChange={setIsVacancyOpen}>
        <DialogContent className="rounded-3xl max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create Candidate Job Vacancy</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveVacancy} className="space-y-4">
             <div className="space-y-1">
              <Label>Job Title</Label>
              <Input required value={vTitle} onChange={e=>setVTitle(e.target.value)} placeholder="e.g. Frontend Developer" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Salary</Label>
                <Input value={vSalary} onChange={e=>setVSalary(e.target.value)} placeholder="e.g. 5-7 LPA" />
              </div>
              <div className="space-y-1">
                <Label>Experience</Label>
                <Input value={vExp} onChange={e=>setVExp(e.target.value)} placeholder="e.g. 0-2 Years" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea value={vDesc} onChange={e=>setVDesc(e.target.value)} rows={3} placeholder="Job description..." />
            </div>
            <div className="space-y-1">
              <Label>Apply Link</Label>
              <Input required value={vLink} onChange={e=>setVLink(e.target.value)} placeholder="https://forms.google.com/..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Posting Date</Label>
                <Input type="date" value={vPostDate} onChange={e=>setVPostDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>End Date</Label>
                <Input type="date" value={vEndDate} onChange={e=>setVEndDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t">
              <Label>Select Target Enrolled Job Postings (Check to allow)</Label>
              <div className="max-h-[120px] overflow-y-auto border rounded-lg p-2 bg-slate-50 space-y-2">
                {postings.map(p => (
                  <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-100 p-1 rounded">
                    <input type="checkbox" checked={vTargets.includes(p.id)} onChange={(e) => {
                      if(e.target.checked) setVTargets([...vTargets, p.id]);
                      else setVTargets(vTargets.filter(id => id !== p.id));
                    }} />
                    {p.title} ({p.job_id})
                  </label>
                ))}
                {postings.length === 0 && <span className="text-xs text-gray-500">No job postings found.</span>}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={()=>setIsVacancyOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Create Vacancy"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>


      {/* Existing Dialogs (Job, Enroll, Edit) */}
      <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditingJob ? "Edit Job Posting" : "Create New Job Posting"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveJob} className="space-y-4">
            <div className="space-y-1">
              <Label>Job ID</Label>
              <Input required value={jobId} onChange={e=>setJobId(e.target.value)} placeholder="e.g. JB-100" />
            </div>
            <div className="space-y-1">
              <Label>Title</Label>
              <Input required value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Software Engineer" />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={6} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Salary</Label>
                <Input required value={salary} onChange={e=>setSalary(e.target.value)} placeholder="e.g. 5 LPA" />
              </div>
              <div className="space-y-1">
                <Label>Training Fee (₹)</Label>
                <Input type="number" required value={fee} onChange={e=>setFee(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={()=>setIsJobDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : (isEditingJob ? "Update Job" : "Create Job")}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEnrollOpen} onOpenChange={setIsEnrollOpen}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle>Enroll Candidate</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEnroll} className="space-y-4">
            <div className="space-y-1">
              <Label>Select Job</Label>
              <select required className="w-full h-10 border rounded-lg px-3 bg-white" value={selectedJob} onChange={e=>setSelectedJob(e.target.value)}>
                <option value="">-- Choose Job --</option>
                {postings.map(p => <option key={p.id} value={p.id}>{p.title} ({p.job_id})</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Select Student</Label>
              <select required className="w-full h-10 border rounded-lg px-3 bg-white" value={selectedStudent} onChange={e=>setSelectedStudent(e.target.value)}>
                <option value="">-- Choose Candidate --</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.email})</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={()=>setIsEnrollOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={enrolling}>{enrolling ? "Enrolling..." : "Enroll"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditEnrollmentOpen} onOpenChange={setIsEditEnrollmentOpen}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Enrollment Status</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateEnrollmentStatus} className="space-y-4">
            <div className="space-y-1">
              <Label>Status</Label>
              <select required className="w-full h-10 border rounded-lg px-3 bg-white" value={enrollmentStatus} onChange={e=>setEnrollmentStatus(e.target.value)}>
                <option value="enrolled">Enrolled</option>
                <option value="completed">Completed</option>
                <option value="dropped">Dropped</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={()=>setIsEditEnrollmentOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={enrolling}>{enrolling ? "Updating..." : "Update Status"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
