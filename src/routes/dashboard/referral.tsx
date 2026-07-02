import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { 
  Users, Copy, UserPlus, Link2, Target, Briefcase, Activity, CheckCircle2, ShieldCheck, Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/dashboard/referral")({
  component: ReferralDashboard,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      tab: (search.tab as string) || "overview"
    };
  }
});

function ReferralDashboard() {
  const { user, role } = useAuth();
  const { tab } = (Route as any).useSearch();
  const [activeTab, setActiveTab] = useState(tab || "overview");
  const [agentProfile, setAgentProfile] = useState<any>(null);
  const [referredStudents, setReferredStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Student manual states
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addAdding, setAddAdding] = useState(false);

  useEffect(() => {
    if (tab) setActiveTab(tab);
  }, [tab]);

  useEffect(() => {
    if (!user) return;

    async function fetchReferralData() {
      // Get Referral Profile
      const { data: profile } = await supabase
        .from("referral_agents")
        .select("*")
        .eq("id", user?.id)
        .single();
      
      if (profile) setAgentProfile(profile);

      // Get Referred Students based on program
      if (profile?.referral_code) {
        let students = [];
        if (profile.program === "internship") {
          const { data } = await supabase.from("internship_students").select("*").eq("referral_code", profile.referral_code);
          students = data || [];
        } else if (profile.program === "training") {
          const { data } = await supabase.from("training_enrollments").select("*, profiles(full_name, email, phone)").eq("referral_code", profile.referral_code);
          students = data ? data.map(d => ({ ...d, full_name: d.profiles?.full_name, email: d.profiles?.email })) : [];
        } else if (profile.program === "job_campus") {
          const { data } = await supabase.from("job_campus_enrollments").select("*, profiles(full_name, email, phone)").eq("referral_code", profile.referral_code);
          students = data ? data.map(d => ({ ...d, full_name: d.profiles?.full_name, email: d.profiles?.email })) : [];
        }
        setReferredStudents(students);
      }
      setLoading(false);
    }
    
    fetchReferralData();
  }, [user]);

  const referralLink = agentProfile 
    ? `${window.location.origin}/${agentProfile.program === 'internship' ? 'register' : agentProfile.program === 'job_campus' ? 'job-campus' : 'trainings'}?ref=${agentProfile.referral_code}`
    : "";

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral Link copied to clipboard!");
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentProfile?.referral_code) return;
    setAddAdding(true);
    
    // In a real scenario, we might just send an email invite or insert into a leads table.
    // For this demonstration, we'll tell them to use the link.
    toast.info("Manual student addition is currently in review. Please share your referral link with the student.");
    setAddAdding(false);
  };

  if (loading) return <div className="p-8 text-center">Loading your dashboard...</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
           <div className="flex items-center gap-2 text-[10px] font-black text-gold uppercase tracking-widest mb-1">
              <Activity className="size-3" /> Partner Portal
           </div>
           <h1 className="text-3xl font-display font-black text-navy-deep uppercase tracking-tighter">
              Referral Dashboard
           </h1>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border shadow-sm flex items-center gap-3">
           <div className="size-8 rounded-lg bg-green-500/10 text-green-600 grid place-items-center"><ShieldCheck size={16}/></div>
           <div>
              <div className="text-[8px] font-black opacity-40 uppercase tracking-widest">Code Status</div>
              <div className="text-[10px] font-black text-navy">ACTIVE ({agentProfile?.referral_code})</div>
           </div>
        </div>
      </div>

      <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
        <Button variant={activeTab === "overview" ? "default" : "ghost"} onClick={() => setActiveTab("overview")} className={activeTab === "overview" ? "bg-navy text-white" : ""}>Overview & Link</Button>
        <Button variant={activeTab === "students" ? "default" : "ghost"} onClick={() => setActiveTab("students")} className={activeTab === "students" ? "bg-navy text-white" : ""}>My Students</Button>
        <Button variant={activeTab === "add_student" ? "default" : "ghost"} onClick={() => setActiveTab("add_student")} className={activeTab === "add_student" ? "bg-navy text-white" : ""}>Add Student</Button>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-navy shadow-sm">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Referrals</CardTitle>
                <Users className="size-4 text-navy opacity-50" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-navy-deep">{referredStudents.length}</div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-gold shadow-sm">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Program Type</CardTitle>
                <Target className="size-4 text-gold opacity-50" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-black text-navy-deep uppercase">{agentProfile?.program?.replace('_', ' ') || 'N/A'}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm border-gold/20 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 p-6">
              <CardTitle className="flex items-center gap-2 text-navy-deep mb-2">
                <Link2 className="text-gold" /> Your Unique Referral Link
              </CardTitle>
              <CardDescription className="text-navy/70 max-w-2xl">
                Share this link with students. When they register using this link, they will automatically be tracked as your referral.
              </CardDescription>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center">
                <div className="bg-white border-2 border-gold/30 p-4 rounded-xl flex-1 w-full text-sm font-mono font-bold text-navy-deep truncate shadow-inner">
                  {referralLink}
                </div>
                <Button onClick={handleCopyLink} size="lg" className="w-full sm:w-auto bg-gold hover:bg-gold-light text-navy-deep font-bold shadow-md">
                  <Copy className="size-4 mr-2" /> Copy Link
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "students" && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="text-gold"/> Referred Students</CardTitle>
            <CardDescription>Students who registered using your referral code: <strong>{agentProfile?.referral_code}</strong></CardDescription>
          </CardHeader>
          <CardContent>
            {referredStudents.length === 0 ? (
              <div className="text-center p-12 bg-slate-50 rounded-xl border-2 border-dashed">
                <Users className="size-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No students referred yet.</p>
                <p className="text-xs text-slate-400 mt-1">Share your link to get started!</p>
              </div>
            ) : (
              <div className="overflow-x-auto border rounded-xl">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-bold">Name</TableHead>
                      <TableHead className="font-bold">Email</TableHead>
                      <TableHead className="font-bold text-right">Join Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referredStudents.map((s, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium text-navy">{s.full_name || 'N/A'}</TableCell>
                        <TableCell>{s.email || 'N/A'}</TableCell>
                        <TableCell className="text-right text-slate-500">{new Date(s.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "add_student" && (
        <Card className="shadow-sm max-w-2xl mx-auto">
          <CardHeader className="bg-slate-50 rounded-t-xl border-b">
            <CardTitle className="flex items-center gap-2 text-navy-deep"><UserPlus className="text-gold" /> Manually Register Student</CardTitle>
            <CardDescription>Enter student details to send them a registration invite containing your referral code.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="space-y-2">
                <Label>Student Full Name</Label>
                <Input required value={addName} onChange={e => setAddName(e.target.value)} placeholder="e.g. Rahul Kumar" />
              </div>
              <div className="space-y-2">
                <Label>Student Email Address</Label>
                <Input required type="email" value={addEmail} onChange={e => setAddEmail(e.target.value)} placeholder="rahul@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Phone Number (Optional)</Label>
                <Input value={addPhone} onChange={e => setAddPhone(e.target.value)} placeholder="+91..." />
              </div>
              <Button type="submit" disabled={addAdding} className="w-full bg-navy text-white hover:bg-navy-deep">
                {addAdding ? "Sending Invite..." : "Send Referral Invite"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
