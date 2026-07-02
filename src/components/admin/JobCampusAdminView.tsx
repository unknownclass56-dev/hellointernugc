import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Briefcase, Plus, Users, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function JobCampusAdminView() {
  const [tab, setTab] = useState<"postings" | "enrollments" | "transactions">("postings");
  const [postings, setPostings] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isAddOpen, setIsAddOpen] = useState(false);
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
    }
    setLoading(false);
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from("job_campus_postings").insert({
        title,
        job_id: jobId,
        description: desc,
        salary,
        training_fee: parseFloat(fee) || 0
      });
      if (error) throw error;
      toast.success("Job posting created!");
      setIsAddOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-black text-navy-deep uppercase tracking-tight flex items-center gap-2">
            <Briefcase className="size-5 text-gold" /> Job Campus Administration
          </h2>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
            Manage postings, candidates, and payments.
          </p>
        </div>
        <div className="flex gap-2 bg-slate-50 p-1 rounded-xl">
          <Button variant={tab === "postings" ? "default" : "ghost"} onClick={() => setTab("postings")} className={`rounded-lg ${tab==="postings"?"bg-navy text-white":""}`}>Postings</Button>
          <Button variant={tab === "enrollments" ? "default" : "ghost"} onClick={() => setTab("enrollments")} className={`rounded-lg ${tab==="enrollments"?"bg-navy text-white":""}`}>Enrollments</Button>
          <Button variant={tab === "transactions" ? "default" : "ghost"} onClick={() => setTab("transactions")} className={`rounded-lg ${tab==="transactions"?"bg-navy text-white":""}`}>Transactions</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin size-8 text-gold" /></div>
      ) : (
        <>
          {tab === "postings" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setIsAddOpen(true)} className="bg-navy hover:bg-navy/90 text-white rounded-xl">
                  <Plus className="size-4 mr-2" /> Add Job
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {postings.map(p => (
                  <Card key={p.id} className="rounded-2xl shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">{p.title}</CardTitle>
                      <div className="text-sm text-gray-500">ID: {p.job_id}</div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm line-clamp-3 mb-2">{p.description}</p>
                      <div className="flex justify-between font-bold text-sm">
                        <span className="text-green-600">{p.salary}</span>
                        <span className="text-navy">Fee: ₹{p.training_fee}</span>
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
              <div className="grid md:grid-cols-2 gap-4">
                {enrollments.map(e => (
                  <Card key={e.id} className="rounded-2xl shadow-sm border-l-4 border-l-gold">
                    <CardHeader>
                      <CardTitle className="text-md">{e.profiles?.full_name}</CardTitle>
                      <div className="text-xs text-gray-500">{e.profiles?.email}</div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm font-bold text-navy mb-1">{e.job_campus_postings?.title}</div>
                      <div className="text-xs uppercase bg-slate-100 p-1 rounded inline-block">Status: {e.status}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {tab === "transactions" && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Candidate</th>
                      <th className="px-4 py-3">Job</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Date</th>
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

      {/* Add Job Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Job Posting</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateJob} className="space-y-4">
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
              <Textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={3} />
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
              <Button type="button" variant="ghost" onClick={()=>setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Create Job"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Enroll Dialog */}
      <Dialog open={isEnrollOpen} onOpenChange={setIsEnrollOpen}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle>Enroll Candidate</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEnroll} className="space-y-4">
            <div className="space-y-1">
              <Label>Select Job</Label>
              <select required className="w-full h-10 border rounded-lg px-3" value={selectedJob} onChange={e=>setSelectedJob(e.target.value)}>
                <option value="">-- Choose Job --</option>
                {postings.map(p => <option key={p.id} value={p.id}>{p.title} ({p.job_id})</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Select Student</Label>
              <select required className="w-full h-10 border rounded-lg px-3" value={selectedStudent} onChange={e=>setSelectedStudent(e.target.value)}>
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
    </div>
  );
}
