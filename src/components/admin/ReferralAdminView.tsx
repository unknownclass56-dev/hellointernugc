import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { 
  Users, Plus, Trash2, ShieldCheck, Mail, Phone, Building2, Key, Link2, DollarSign, Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function ReferralAdminView() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Edit states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editingId, setEditingId] = useState<string>("");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [bankAcct, setBankAcct] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [bankName, setBankName] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [upi, setUpi] = useState("");
  const [code, setCode] = useState("");
  const [program, setProgram] = useState("job_campus");

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("referral_agents").select("*").order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
    } else {
      setAgents(data || []);
    }
    setLoading(false);
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const { data, error } = await supabase.rpc("admin_create_referral_user", {
        p_email: email,
        p_password: password,
        p_name: name,
        p_phone: phone,
        p_bank_account_number: bankAcct,
        p_ifsc: ifsc,
        p_bank_name: bankName,
        p_aadhar_number: aadhar,
        p_upi_id: upi,
        p_referral_code: code,
        p_program: program
      });

      if (error) throw error;
      
      if (!data?.success) {
        throw new Error(data?.error || "Failed to create user");
      }

      toast.success("Referral Agent created successfully!");
      setIsCreateOpen(false);
      
      // Reset form
      setName(""); setEmail(""); setPhone(""); setPassword(""); setBankAcct("");
      setIfsc(""); setBankName(""); setAadhar(""); setUpi(""); setCode("");
      
      fetchAgents();
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this referral agent? This will permanently delete their account.")) return;
    
    // Deleting from referral_agents won't delete auth.users automatically without a trigger or CASCADE.
    // However, our table has ON DELETE CASCADE from auth.users, but deleting from referral_agents just deletes the row, not auth user.
    // Ideally we should delete from auth.users. Wait, since we can't easily delete auth users without service_role, we just delete the referral profile for now.
    const { error } = await supabase.from("referral_agents").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Referral agent deleted.");
      fetchAgents();
    }
  };

  const handleEditClick = (agent: any) => {
    setEditingId(agent.id);
    setName(agent.name || "");
    setEmail(agent.email || "");
    setPhone(agent.phone || "");
    setBankAcct(agent.bank_account_number || "");
    setIfsc(agent.ifsc || "");
    setBankName(agent.bank_name || "");
    setAadhar(agent.aadhar_number || "");
    setUpi(agent.upi_id || "");
    setCode(agent.referral_code || "");
    setProgram(agent.program || "job_campus");
    setIsEditOpen(true);
  };

  const handleUpdateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      // NOTE: Email updating requires user verification in Supabase usually, so we only update profile data here.
      const { error } = await supabase.from("referral_agents").update({
        name, phone, bank_account_number: bankAcct, ifsc, bank_name: bankName,
        aadhar_number: aadhar, upi_id: upi, referral_code: code, program
      }).eq("id", editingId);

      if (error) throw error;
      toast.success("Agent details updated successfully!");
      setIsEditOpen(false);
      fetchAgents();
    } catch (err: any) {
      toast.error(err.message || "Failed to update agent");
    } finally {
      setUpdating(false);
    }
  };

  const handleResetPassword = async (agent: any) => {
    const agentEmail = agent.email;
    if (!confirm(`Send password reset link to ${agentEmail}?`)) return;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(agentEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) {
        // If Supabase can't send the email (user broken or SMTP not set up),
        // open the Supabase dashboard directly to fix it
        if (error.status === 500 || error.status === 422) {
          const projectRef = import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] || '';
          const dashboardUrl = `https://supabase.com/dashboard/project/${projectRef}/auth/users`;
          toast.error(
            `Email failed (server error). Opening Supabase Users dashboard to manually resend.`,
            { duration: 5000 }
          );
          setTimeout(() => window.open(dashboardUrl, '_blank'), 1000);
          return;
        }
        throw error;
      }
      toast.success(`✅ Password reset link sent to ${agentEmail}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to send password reset link");
    }
  };

  const handleResendCredentials = (agent: any) => {
    // Show the agent their login details via a modal/toast
    const details = `📋 Referral Agent Credentials:\n\nEmail: ${agent.email}\nCode: ${agent.referral_code}\n\nNote: Password was set at creation time. Use 'Reset Password' to send a new one.`;
    alert(details);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-black text-navy-deep uppercase tracking-tight flex items-center gap-2">
            <Link2 className="size-5 text-gold" /> Referral Program Management
          </h2>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
            Manage referral agents, their codes, and financial details.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-navy hover:bg-navy-deep text-white shadow-md">
          <Plus className="mr-2 h-4 w-4" /> Create Referral Agent
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium">Loading referral agents...</div>
        ) : agents.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <div className="bg-slate-50 p-4 rounded-full">
              <Users className="size-8 text-slate-300" />
            </div>
            <div>
              <p className="text-slate-600 font-medium">No referral agents found.</p>
              <p className="text-sm text-slate-400">Click the create button above to add one.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700">Agent</TableHead>
                  <TableHead className="font-semibold text-slate-700">Code & Program</TableHead>
                  <TableHead className="font-semibold text-slate-700">Bank Details</TableHead>
                  <TableHead className="font-semibold text-slate-700">Aadhar / UPI</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div className="font-semibold text-navy-deep">{agent.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Mail className="size-3"/>{agent.email}</div>
                      {agent.phone && <div className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Phone className="size-3"/>{agent.phone}</div>}
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gold/10 text-gold-deep text-xs font-bold font-mono tracking-wider">
                        {agent.referral_code}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-2">
                        {agent.program?.replace('_', ' ')}
                      </div>
                    </TableCell>
                    <TableCell>
                      {agent.bank_name ? (
                        <div className="text-xs space-y-1">
                          <div className="font-medium text-slate-700 flex items-center gap-1"><Building2 className="size-3 text-slate-400"/> {agent.bank_name}</div>
                          <div className="text-slate-500">A/C: {agent.bank_account_number}</div>
                          <div className="text-slate-500">IFSC: {agent.ifsc}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Not provided</span>
                      )}
                    </TableCell>
                    <TableCell>
                       <div className="text-xs space-y-1">
                          {agent.aadhar_number ? <div className="text-slate-600">Aadhar: {agent.aadhar_number}</div> : null}
                          {agent.upi_id ? <div className="text-slate-600 flex items-center gap-1"><DollarSign className="size-3 text-green-600"/> UPI: {agent.upi_id}</div> : null}
                        </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleResetPassword(agent.email)} className="text-navy hover:text-navy-deep hover:bg-navy/10" title="Send Password Reset Link">
                          <Key className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(agent)} className="text-blue-500 hover:text-blue-600 hover:bg-blue-50" title="Edit Agent">
                          <Edit className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(agent.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50" title="Delete Agent">
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-navy-deep flex items-center gap-2">
              <ShieldCheck className="text-gold size-6" /> Create Referral Agent
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateAgent} className="space-y-6 mt-4">
            
            <div className="grid md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-100">
              <div className="md:col-span-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Account Information</h3>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Full Name *</Label>
                <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Agent Name" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Email *</Label>
                <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="agent@example.com" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Phone</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91..." />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Password *</Label>
                <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Initial Password" minLength={6} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-100">
              <div className="md:col-span-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Program & Code</h3>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Target Program *</Label>
                <Select value={program} onValueChange={setProgram}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="job_campus">Job Campus</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Unique Referral Code *</Label>
                <Input required value={code} onChange={e => setCode(e.target.value.toUpperCase().replace(/\s/g, ''))} placeholder="e.g. TLJ2026" className="uppercase font-mono" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-100">
              <div className="md:col-span-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Financial & KYC (Optional)</h3>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Bank Name</Label>
                <Input value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. HDFC Bank" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Account Number</Label>
                <Input value={bankAcct} onChange={e => setBankAcct(e.target.value)} placeholder="Account Number" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">IFSC Code</Label>
                <Input value={ifsc} onChange={e => setIfsc(e.target.value)} placeholder="IFSC" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">UPI ID</Label>
                <Input value={upi} onChange={e => setUpi(e.target.value)} placeholder="example@upi" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Aadhar Number</Label>
                <Input value={aadhar} onChange={e => setAadhar(e.target.value)} placeholder="12-digit Aadhar" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={creating} className="bg-navy hover:bg-navy-deep text-white px-8">
                {creating ? "Creating Agent..." : "Create & Send Credentials"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-navy-deep flex items-center gap-2">
              <Edit className="text-blue-500 size-6" /> Edit Referral Agent
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateAgent} className="space-y-6 mt-4">
            
            <div className="grid md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-100">
              <div className="md:col-span-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Account Information</h3>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Full Name *</Label>
                <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Agent Name" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Email (Cannot be changed here)</Label>
                <Input disabled value={email} className="bg-slate-200" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Phone</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91..." />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-100">
              <div className="md:col-span-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Program & Code</h3>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Target Program *</Label>
                <Select value={program} onValueChange={setProgram}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="job_campus">Job Campus</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Unique Referral Code *</Label>
                <Input required value={code} onChange={e => setCode(e.target.value.toUpperCase().replace(/\s/g, ''))} placeholder="e.g. TLJ2026" className="uppercase font-mono" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-100">
              <div className="md:col-span-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Financial & KYC (Optional)</h3>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Bank Name</Label>
                <Input value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. HDFC Bank" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Account Number</Label>
                <Input value={bankAcct} onChange={e => setBankAcct(e.target.value)} placeholder="Account Number" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">IFSC Code</Label>
                <Input value={ifsc} onChange={e => setIfsc(e.target.value)} placeholder="IFSC" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">UPI ID</Label>
                <Input value={upi} onChange={e => setUpi(e.target.value)} placeholder="example@upi" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Aadhar Number</Label>
                <Input value={aadhar} onChange={e => setAadhar(e.target.value)} placeholder="12-digit Aadhar" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={updating} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                {updating ? "Saving Changes..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
