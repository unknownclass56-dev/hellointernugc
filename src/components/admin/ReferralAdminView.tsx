import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Users, Plus, Eye, Trash2, Loader2, Link as LinkIcon, Edit } from "lucide-react";

export function ReferralAdminView() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState("");
  
  const [aName, setAName] = useState("");
  const [aEmail, setAEmail] = useState("");
  const [aPassword, setAPassword] = useState("");
  const [aPhone, setAPhone] = useState("");
  const [aCode, setACode] = useState("");
  const [aProgram, setAProgram] = useState("internship");
  const [saving, setSaving] = useState(false);

  // History State
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [referredStudents, setReferredStudents] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("referral_agents").select("*").order("created_at", { ascending: false });
    if (!error && data) {
      setAgents(data);
    }
    setLoading(false);
  };

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setACode(code);
  };

  const resetForm = () => {
    setAName(""); setAEmail(""); setAPassword(""); setAPhone(""); setACode(""); setAProgram("internship");
  };

  const openAddAgent = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aName || !aEmail || !aPassword || !aCode) {
      toast.error("Please fill required fields");
      return;
    }
    setSaving(true);
    try {
      const tempClient = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        { auth: { persistSession: false } }
      );

      const { data: authData, error: authError } = await tempClient.auth.signUp({
        email: aEmail,
        password: aPassword,
        options: {
          data: { role: "referral", full_name: aName }
        }
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("User creation failed");

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: authData.user.id,
        full_name: aName,
        email: aEmail,
        phone: aPhone,
        role: "referral",
        raw_password: aPassword
      });
      if (profileError) throw profileError;

      const { error: agentError } = await supabase.from("referral_agents").insert({
        id: authData.user.id,
        name: aName,
        email: aEmail,
        phone: aPhone,
        referral_code: aCode,
        program: aProgram
      });
      if (agentError) throw agentError;

      toast.success("Referral Agent created successfully!");
      setIsAddOpen(false);
      resetForm();
      fetchAgents();
    } catch (err: any) {
      toast.error(err.message || "Failed to create agent");
    } finally {
      setSaving(false);
    }
  };

  const openEditAgent = (agent: any) => {
    setEditingId(agent.id);
    setAName(agent.name);
    setAEmail(agent.email);
    setAPhone(agent.phone || "");
    setACode(agent.referral_code);
    setAProgram(agent.program || "internship");
    setIsEditOpen(true);
  };

  const handleEditAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error: profileError } = await supabase.from("profiles").update({
        full_name: aName,
        phone: aPhone,
      }).eq("id", editingId);
      if (profileError) throw profileError;

      const { error: agentError } = await supabase.from("referral_agents").update({
        name: aName,
        phone: aPhone,
        referral_code: aCode,
        program: aProgram
      }).eq("id", editingId);
      if (agentError) throw agentError;

      toast.success("Agent updated successfully!");
      setIsEditOpen(false);
      fetchAgents();
    } catch (err: any) {
      toast.error(err.message || "Failed to update agent");
    } finally {
      setSaving(false);
    }
  };

  const openHistory = async (agent: any) => {
    setSelectedAgent(agent);
    setHistoryOpen(true);
    setLoadingHistory(true);
    setReferredStudents([]);

    try {
      let students = [];
      if (agent.program === "internship") {
        const { data } = await supabase.from("internship_students").select("*").eq("referral_code", agent.referral_code);
        students = data || [];
      } else if (agent.program === "training") {
        const { data } = await supabase.from("training_enrollments").select("*, profiles(full_name, email, phone)").eq("referral_code", agent.referral_code);
        students = data ? data.map((d: any) => ({ ...d, full_name: d.profiles?.full_name, email: d.profiles?.email })) : [];
      } else if (agent.program === "job_campus") {
        const { data } = await supabase.from("job_campus_enrollments").select("*, profiles(full_name, email, phone)").eq("referral_code", agent.referral_code);
        students = data ? data.map((d: any) => ({ ...d, full_name: d.profiles?.full_name, email: d.profiles?.email })) : [];
      }
      setReferredStudents(students);
    } catch (err: any) {
      toast.error("Failed to fetch history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDeleteAgent = async (id: string) => {
    if (!confirm("Are you sure? This will delete the referral agent and their login access.")) return;
    try {
      const { error } = await supabase.from("referral_agents").delete().eq("id", id);
      if (error) throw error;
      await supabase.from("profiles").delete().eq("id", id);
      toast.success("Agent deleted locally. (Auth user remains but has no access)");
      fetchAgents();
    } catch(err:any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-black text-navy-deep uppercase tracking-tight flex items-center gap-2">
            <Users className="size-5 text-gold" /> Referral Administration
          </h2>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
            Manage referral agents and tracked students.
          </p>
        </div>
        <Button onClick={openAddAgent} className="bg-navy hover:bg-navy/90 text-white rounded-xl">
          <Plus className="size-4 mr-2" /> Add Agent
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin size-8 text-gold" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 border-b">Name</th>
                  <th className="px-4 py-3 border-b">Email</th>
                  <th className="px-4 py-3 border-b">Code</th>
                  <th className="px-4 py-3 border-b">Program</th>
                  <th className="px-4 py-3 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {agents.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors border-b">
                    <td className="px-4 py-3 font-bold">{a.name}</td>
                    <td className="px-4 py-3 text-slate-500">{a.email}</td>
                    <td className="px-4 py-3 font-bold text-navy">{a.referral_code}</td>
                    <td className="px-4 py-3 uppercase text-xs">{a.program}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditAgent(a)} className="h-8">
                        <Edit className="size-3 mr-1" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openHistory(a)} className="h-8">
                        <Eye className="size-3 mr-1" /> History
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteAgent(a.id)} className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="size-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {agents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No referral agents found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Agent Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="rounded-3xl max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create Referral Agent</DialogTitle></DialogHeader>
          <form onSubmit={handleAddAgent} className="space-y-4">
            <div className="space-y-1">
              <Label>Full Name</Label>
              <Input required value={aName} onChange={e=>setAName(e.target.value)} placeholder="John Doe" />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input required type="email" value={aEmail} onChange={e=>setAEmail(e.target.value)} placeholder="agent@example.com" />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input value={aPhone} onChange={e=>setAPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" />
            </div>
            <div className="space-y-1">
              <Label>Password</Label>
              <Input required type="password" value={aPassword} onChange={e=>setAPassword(e.target.value)} placeholder="Password for agent login" />
            </div>
            <div className="space-y-1">
              <Label>Target Program</Label>
              <select className="w-full h-10 border rounded-lg px-3 bg-white" value={aProgram} onChange={e=>setAProgram(e.target.value)}>
                <option value="internship">Internship</option>
                <option value="training">Training</option>
                <option value="job_campus">Job Campus</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>Referral Code</Label>
              <div className="flex gap-2">
                <Input required value={aCode} onChange={e=>setACode(e.target.value.toUpperCase())} placeholder="e.g. TL-JOHN" className="uppercase" />
                <Button type="button" variant="outline" onClick={generateCode}>Auto</Button>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={()=>setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Create Agent"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Agent Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="rounded-3xl max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Referral Agent</DialogTitle></DialogHeader>
          <form onSubmit={handleEditAgent} className="space-y-4">
            <div className="space-y-1">
              <Label>Full Name</Label>
              <Input required value={aName} onChange={e=>setAName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Email (Cannot be changed here)</Label>
              <Input disabled type="email" value={aEmail} className="bg-slate-50" />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input value={aPhone} onChange={e=>setAPhone(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Target Program</Label>
              <select className="w-full h-10 border rounded-lg px-3 bg-white" value={aProgram} onChange={e=>setAProgram(e.target.value)}>
                <option value="internship">Internship</option>
                <option value="training">Training</option>
                <option value="job_campus">Job Campus</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>Referral Code</Label>
              <div className="flex gap-2">
                <Input required value={aCode} onChange={e=>setACode(e.target.value.toUpperCase())} className="uppercase" />
                <Button type="button" variant="outline" onClick={generateCode}>Auto</Button>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={()=>setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Update Agent"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="rounded-3xl max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Referral History - {selectedAgent?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto mt-4">
            {loadingHistory ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin size-6 text-gold" /></div>
            ) : referredStudents.length === 0 ? (
              <div className="text-center p-8 text-slate-500">
                <p>No students have been referred yet.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 border-b">Student Name</th>
                    <th className="px-4 py-3 border-b">Email</th>
                    <th className="px-4 py-3 border-b">Status</th>
                    <th className="px-4 py-3 border-b">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {referredStudents.map((s, idx) => (
                    <tr key={s.id || idx} className="hover:bg-slate-50 border-b">
                      <td className="px-4 py-3 font-bold">{s.full_name}</td>
                      <td className="px-4 py-3 text-slate-500">{s.email}</td>
                      <td className="px-4 py-3 uppercase text-xs">
                        <span className="bg-slate-100 px-2 py-1 rounded">{s.status || 'Active'}</span>
                      </td>
                      <td className="px-4 py-3 text-xs">{new Date(s.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
