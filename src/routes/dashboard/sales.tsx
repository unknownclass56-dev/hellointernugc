import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { LogoLoader } from "@/components/LogoLoader";
import { toast } from "sonner";
import { 
  Users, Briefcase, DollarSign, Activity, Calendar, Phone, 
  CheckCircle2, ClipboardList, TrendingUp, Search, UserCheck, 
  AlertCircle, PhoneCall, Copy, Save, X, BookOpen, Star,
  Lock, Mail, Key, ShieldCheck, User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export const Route = createFileRoute("/dashboard/sales")({
  component: SalesDashboard,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      tab: (search.tab as string) || "overview"
    };
  }
});

function SalesDashboard() {
  const { user, role } = useAuth();
  const { tab } = (Route as any).useSearch();
  const [activeTab, setActiveTab] = useState(tab || "overview");

  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab]);
  const [summary, setSummary] = useState<{ total_sales: number; profit_yesterday: number; total_earnings: number } | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]); // chart data
  const [rawTransactions, setRawTransactions] = useState<any[]>([]); // table data
  const [assignedStudents, setAssignedStudents] = useState<any[]>([]);
  const [trainingsList, setTrainingsList] = useState<any[]>([]);
  const [internshipsList, setInternshipsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Profile management states
  const [repProfile, setRepProfile] = useState<any>(null);
  const [repName, setRepName] = useState("");
  const [repContact, setRepContact] = useState("");
  const [repEmail, setRepEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Modal & Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [remark, setRemark] = useState("");
  const [status, setStatus] = useState("assigned");
  const [enrolledCourse, setEnrolledCourse] = useState("");
  const [referralCourse, setReferralCourse] = useState("");
  const [enrolledType, setEnrolledType] = useState("training");
  const [selectedTrainingId, setSelectedTrainingId] = useState("");
  const [saleAmount, setSaleAmount] = useState("");
  const [followupDate, setFollowupDate] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    // Fetch overview statistics
    async function fetchSummary() {
      const { data, error } = await supabase.rpc("fn_sales_summary");
      if (error) {
        console.error("Failed to fetch sales summary", error);
      } else if (data) {
        setSummary(data);
      }
    }

    // Fetch transactions linked to this rep
    async function fetchTransactions() {
      const { data, error } = await supabase
        .from("training_transactions")
        .select("*, training_enrollments(*, profiles(full_name, email), trainings(name))")
        .eq("sales_rep_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Failed to fetch transactions", error);
      } else {
        setRawTransactions(data || []);
        // Map chart data
        const mapped = (data || []).map((tx: any) => ({
          date: new Date(tx.created_at).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' }),
          amount: Number(tx.amount || 0)
        })).reverse();
        setTransactions(mapped);
      }
    }

    // Fetch assigned students
    async function fetchAssigned() {
      const { data, error } = await supabase
        .from("sales_notes")
        .select("*, profile:profile_id(*)")
        .eq("sales_rep_id", user.id)
        .order("updated_at", { ascending: false });
      if (error) {
        console.error("Failed to fetch sales notes", error);
      } else {
        setAssignedStudents(data || []);
      }
    }

    // Fetch listings
    async function fetchListings() {
      const { data: t } = await supabase.from("trainings").select("id, name, fee");
      setTrainingsList(t || []);
      const { data: i } = await supabase.from("internships").select("id, title");
      setInternshipsList(i || []);
    }

    // Fetch Representative Profile
    async function fetchRepProfile() {
      setProfileLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (!error && data) {
        setRepProfile(data);
        setRepName(data.full_name || "");
        setRepContact(data.contact_number || "");
        setRepEmail(user.email || data.email || "");
      }
      setProfileLoading(false);
    }

    async function loadAllData() {
      try {
        await Promise.all([
          fetchSummary(),
          fetchTransactions(),
          fetchAssigned(),
          fetchListings(),
          fetchRepProfile()
        ]);
      } catch (e) {
        console.error("Error loading sales data:", e);
      } finally {
        setLoading(false);
      }
    }

    loadAllData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0b1329]">
        <LogoLoader size="lg" />
      </div>
    );
  }

  if (role !== "sales" && role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 font-bold">
        Access Denied. Sales team credentials required.
      </div>
    );
  }

  // Filter logic for Leads
  const filteredStudents = assignedStudents.filter((item) => {
    const student = item.profile || {};
    const matchesSearch = 
      (student.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.contact_number || "").includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter logic for Follow-ups
  const followupStudents = assignedStudents.filter((item) => {
    const student = item.profile || {};
    const matchesSearch = 
      (student.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.contact_number || "").includes(searchTerm);
    
    // Followups are students who are 'called', 'interested', or have a followup_date set
    const isFollowup = item.status === "called" || item.status === "interested" || item.followup_date;
    return matchesSearch && isFollowup;
  }).sort((a, b) => {
    if (!a.followup_date) return 1;
    if (!b.followup_date) return -1;
    return new Date(a.followup_date).getTime() - new Date(b.followup_date).getTime();
  });

  const openStudentModal = (item: any) => {
    setSelectedStudent(item);
    setRemark(item.remark || "");
    setStatus(item.status || "assigned");
    setEnrolledCourse(item.enrolled_course || "");
    setReferralCourse(item.referral_course || "");
    setEnrolledType(item.enrolled_type || "training");
    setSelectedTrainingId("");
    setSaleAmount("");
    setFollowupDate(item.followup_date || "");
    setIsModalOpen(true);
  };

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleSaveStudentNote = async () => {
    if (!selectedStudent || !user) return;
    setSavingNote(true);
    try {
      const updatePayload: any = {
        remark,
        status,
        enrolled_course: enrolledCourse,
        referral_course: referralCourse,
        enrolled_type: enrolledType,
        followup_date: followupDate || null,
        updated_at: new Date().toISOString()
      };

      // Perform updates
      const { error: noteError } = await supabase
        .from("sales_notes")
        .update(updatePayload)
        .eq("id", selectedStudent.id);

      if (noteError) throw noteError;

      // If they completed a course/internship sale, create enrollment & transaction records
      if (status === "enrolled" && selectedTrainingId) {
        const selectedTraining = trainingsList.find(t => t.id === selectedTrainingId);
        
        // 1. Create training enrollment
        const { data: enrollment, error: enrollmentError } = await supabase
          .from("training_enrollments")
          .insert({
            student_id: selectedStudent.profile_id,
            training_id: selectedTrainingId,
            status: "enrolled"
          })
          .select()
          .single();

        if (enrollmentError) throw enrollmentError;

        // 2. Create training transaction credited to this sales rep
        const { error: txError } = await supabase
          .from("training_transactions")
          .insert({
            enrollment_id: enrollment.id,
            amount: Number(saleAmount || selectedTraining?.fee || 0),
            status: "captured",
            transaction_id: "SALES-" + Math.floor(Math.random() * 1000000),
            sales_rep_id: user.id
          });

        if (txError) throw txError;
        
        toast.success("Successfully completed sale and enrolled student!");
      }

      toast.success("Lead details updated!");
      setIsModalOpen(false);
      
      // Refresh list
      const { data } = await supabase
        .from("sales_notes")
        .select("*, profile:profile_id(*)")
        .eq("sales_rep_id", user.id)
        .order("updated_at", { ascending: false });
      setAssignedStudents(data || []);
      
      // Refresh transactions
      const { data: txData } = await supabase
        .from("training_transactions")
        .select("*, training_enrollments(*, profiles(full_name, email), trainings(name))")
        .eq("sales_rep_id", user.id)
        .order("created_at", { ascending: false });
      setRawTransactions(txData || []);
      
      // Refresh Stats
      const { data: newSummary } = await supabase.rpc("fn_sales_summary");
      if (newSummary) setSummary(newSummary);
      
    } catch (error: any) {
      toast.error("Failed to update note: " + error.message);
    } finally {
      setSavingNote(false);
    }
  };

  // Profile update handlers
  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) return;
    setUpdatingProfile(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: repName,
        contact_number: repContact,
        updated_at: new Date().toISOString()
      })
      .eq("id", user.id);
    setUpdatingProfile(false);
    if (error) {
      toast.error("Error updating profile details: " + error.message);
    } else {
      toast.success("Profile details updated successfully!");
    }
  }

  async function handleUpdateEmail(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail) {
      toast.error("Please enter a new email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setUpdatingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: cleanEmail });
    setUpdatingEmail(false);
    if (error) {
      toast.error("Error updating email: " + error.message);
    } else {
      toast.success("Verification emails sent! Please check both your old and new email addresses to confirm.");
      setNewEmail("");
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!newPassword) {
      toast.error("Please enter a new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    setUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setUpdatingPassword(false);
    if (error) {
      toast.error("Error updating password: " + error.message);
    } else {
      toast.success("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  return (
    <div className="p-6 space-y-8 bg-[#0b1329] min-h-screen text-slate-100 font-sans">
      
      {/* Profile / Header greeting */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-amber-500 uppercase tracking-widest mb-1">
            <Star className="size-3 fill-amber-500" /> Sales Representative Workspace
          </div>
          <h1 className="text-3xl font-extrabold uppercase tracking-tight text-white">
            Welcome Back, <span className="text-blue-400">{repName || "Sales Rep"}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Here is your sales summary, performance charts, and assigned leads.
          </p>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex bg-slate-900/85 p-1 rounded-xl border border-slate-800/85 shadow-lg">
          <button 
            onClick={() => setActiveTab("overview")} 
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "overview" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab("leads")} 
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "leads" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"}`}
          >
            Leads ({assignedStudents.length})
          </button>
          <button 
            onClick={() => setActiveTab("followups")} 
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "followups" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"}`}
          >
            Followups ({followupStudents.length})
          </button>
          <button 
            onClick={() => setActiveTab("transactions")} 
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "transactions" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"}`}
          >
            My Sales ({rawTransactions.length})
          </button>
          <button 
            onClick={() => setActiveTab("profile")} 
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "profile" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"}`}
          >
            My Profile
          </button>
        </div>
      </div>

      {/* ==================== OVERVIEW TAB ==================== */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* KPI Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Total Sales Count", value: summary?.total_sales ?? 0, icon: TrendingUp, color: "from-blue-500 to-indigo-600" },
              { label: "Profit Yesterday", value: `₹${(summary?.profit_yesterday ?? 0).toLocaleString()}`, icon: DollarSign, color: "from-emerald-500 to-teal-600" },
              { label: "Total Earnings", value: `₹${(summary?.total_earnings ?? 0).toLocaleString()}`, icon: Activity, color: "from-amber-500 to-orange-600" }
            ].map((kpi, idx) => (
              <Card key={idx} className="bg-slate-900/60 border border-slate-800 shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${kpi.color}`} />
                <CardHeader className="flex flex-row items-center justify-between pb-2 pl-6">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{kpi.label}</span>
                  <div className="size-8 rounded-lg bg-slate-800 grid place-items-center text-slate-300">
                    <kpi.icon size={16} />
                  </div>
                </CardHeader>
                <CardContent className="pl-6 pb-6">
                  <div className="text-3xl font-black text-white">{kpi.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts / Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-slate-900/60 border border-slate-800 shadow-2xl lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity className="size-4 text-blue-400" /> Sales Trend Over Time
                </CardTitle>
                <CardDescription className="text-slate-400">Daily sales earnings based on transactions completed</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                {transactions.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-500 text-sm font-bold">No sales records to show in chart yet.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={transactions}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                      <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Achievements Card */}
            <Card className="bg-slate-900/60 border border-slate-800 shadow-2xl flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="text-sm font-black text-amber-500 uppercase tracking-wider flex items-center gap-2">
                  <Star className="size-4 fill-amber-500 text-amber-500" /> Rep Achievements
                </CardTitle>
                <CardDescription className="text-slate-400">Keep striving for excellence</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Target progress</div>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-xl font-extrabold text-white">72%</span>
                    <span className="text-xs text-slate-400">36 / 50 Enrolled</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: '72%' }} />
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  "Great sales team reps don't just sell courses, they shape careers. Keep helping students find their best path!"
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ==================== ASSIGNED LEADS TAB ==================== */}
      {activeTab === "leads" && (
        <Card className="bg-slate-900/60 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in duration-300">
          <CardHeader className="bg-slate-900/80 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 py-6">
            <div>
              <CardTitle className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="size-4 text-blue-400" /> Assigned Student Leads
              </CardTitle>
              <CardDescription className="text-slate-400">Select any lead to call, remark, and complete sales registrations.</CardDescription>
            </div>

            {/* Quick search and filter bar */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-48 h-9 pl-9 pr-4 bg-slate-800 border-none rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="h-9 rounded-xl bg-slate-800 text-xs text-slate-200 border-none px-3 outline-none"
              >
                <option value="all">All Status</option>
                <option value="assigned">Assigned</option>
                <option value="called">Called</option>
                <option value="interested">Interested</option>
                <option value="not_interested">Not Interested</option>
                <option value="enrolled">Enrolled</option>
              </select>
            </div>
          </CardHeader>

          {/* Lead table list */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-900/20 border-b border-slate-800">
                <TableRow>
                  <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-wider py-4">Student</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-wider py-4">Contact Info</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-wider py-4">Course Details</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-wider py-4">Lead Status</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-wider py-4">Referral</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-wider py-4">Followup Date</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-wider py-4 text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-800/40">
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-slate-500 font-bold text-sm">
                      No matching leads found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((item) => {
                    const s = item.profile || {};
                    return (
                      <TableRow key={item.id} className="hover:bg-slate-800/10 transition-colors">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-lg bg-blue-500/10 text-blue-400 grid place-items-center font-black">
                              {s.full_name?.charAt(0) || "?"}
                            </div>
                            <div>
                              <div className="font-bold text-white uppercase text-xs">{s.full_name || "-"}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">{s.university_name || "-"}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-xs text-slate-300 font-medium">{s.email || "-"}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{s.contact_number || "-"}</div>
                        </TableCell>
                        <TableCell className="py-4">
                          {item.enrolled_course ? (
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${item.enrolled_type === 'internship' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                {item.enrolled_type || 'course'}
                              </span>
                              <span className="text-xs text-slate-200 font-semibold">{item.enrolled_course}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] italic text-slate-500">Not enrolled yet</span>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                            item.status === 'enrolled' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            item.status === 'called' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            item.status === 'interested' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            item.status === 'not_interested' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            'bg-slate-800 text-slate-400 border-slate-700/50'
                          }`}>
                            {item.status || 'assigned'}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-xs text-slate-300 font-medium">{item.referral_course || "-"}</div>
                        </TableCell>
                        <TableCell className="py-4 font-mono text-xs">
                          {item.followup_date ? (
                            <span className="text-amber-500 font-bold flex items-center gap-1">
                              <Calendar size={12} /> {new Date(item.followup_date).toLocaleDateString("en-IN")}
                            </span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </TableCell>
                        <TableCell className="py-4 text-right pr-6">
                          <Button
                            onClick={() => openStudentModal(item)}
                            className="h-8 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-[10px] uppercase tracking-wider shadow-sm flex items-center gap-1.5 ml-auto"
                          >
                            <PhoneCall size={12} /> Call & Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* ==================== FOLLOWUPS TAB ==================== */}
      {activeTab === "followups" && (
        <Card className="bg-slate-900/60 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in duration-300">
          <CardHeader className="bg-slate-900/80 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 py-6">
            <div>
              <CardTitle className="text-sm font-black text-amber-500 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="size-4 text-amber-500" /> Active Lead Follow-ups
              </CardTitle>
              <CardDescription className="text-slate-400">Leads categorized as interested, called, or scheduled for follow-up.</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search followups..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-48 h-9 pl-9 pr-4 bg-slate-800 border-none rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </CardHeader>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-900/20 border-b border-slate-800">
                <TableRow>
                  <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-wider py-4">Student</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-wider py-4">Contact Info</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-wider py-4">Call Status</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-wider py-4">Last Remark</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-wider py-4">Scheduled Followup</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-wider py-4 text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-800/40">
                {followupStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-slate-500 font-bold text-sm">
                      No pending follow-ups found.
                    </TableCell>
                  </TableRow>
                ) : (
                  followupStudents.map((item) => {
                    const s = item.profile || {};
                    const isOverdue = item.followup_date && new Date(item.followup_date).getTime() < new Date().setHours(0,0,0,0);
                    return (
                      <TableRow key={item.id} className="hover:bg-slate-800/10 transition-colors">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-lg bg-amber-500/10 text-amber-500 grid place-items-center font-black">
                              {s.full_name?.charAt(0) || "?"}
                            </div>
                            <div>
                              <div className="font-bold text-white uppercase text-xs">{s.full_name || "-"}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">{s.university_name || "-"}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-xs text-slate-300 font-medium">{s.email || "-"}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{s.contact_number || "-"}</div>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                            item.status === 'interested' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                            {item.status || 'assigned'}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 max-w-[200px] truncate text-xs text-slate-400">
                          {item.remark || "—"}
                        </TableCell>
                        <TableCell className="py-4 font-mono text-xs">
                          {item.followup_date ? (
                            <span className={`font-bold flex items-center gap-1 ${isOverdue ? 'text-rose-500' : 'text-emerald-500'}`}>
                              <Calendar size={12} /> 
                              {new Date(item.followup_date).toLocaleDateString("en-IN")}
                              {isOverdue && <span className="text-[9px] uppercase tracking-widest font-black bg-rose-500/10 px-1 rounded">OVERDUE</span>}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic">No date set</span>
                          )}
                        </TableCell>
                        <TableCell className="py-4 text-right pr-6">
                          <Button
                            onClick={() => openStudentModal(item)}
                            className="h-8 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-[10px] uppercase tracking-wider shadow-sm flex items-center gap-1.5 ml-auto"
                          >
                            <PhoneCall size={12} /> Call & Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* ==================== TRANSACTIONS / MY SALES TAB ==================== */}
      {activeTab === "transactions" && (
        <Card className="bg-slate-900/60 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in duration-300">
          <CardHeader className="bg-slate-900/80 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 py-6">
            <div>
              <CardTitle className="text-sm font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="size-4 text-emerald-400" /> My Closed Sales / Transactions
              </CardTitle>
              <CardDescription className="text-slate-400">Real-time credit log of course and training sales completed by you.</CardDescription>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
              Total closed: ₹{rawTransactions.reduce((s, t) => s + (Number(t.amount) || 0), 0).toLocaleString()}
            </div>
          </CardHeader>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-900/20 border-b border-slate-800">
                <TableRow>
                  <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-wider py-4">Transaction ID</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-wider py-4">Date</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-wider py-4">Student</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-wider py-4">Course / Program</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-wider py-4">Amount</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-wider py-4">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-800/40">
                {rawTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-slate-500 font-bold text-sm">
                      No sales transactions recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  rawTransactions.map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-slate-850/50 transition-colors">
                      <TableCell className="py-4 font-mono text-xs text-slate-400">
                        {tx.transaction_id || "Manual"}
                      </TableCell>
                      <TableCell className="py-4 font-mono text-xs">
                        {tx.created_at ? new Date(tx.created_at).toLocaleDateString("en-IN") : "-"}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="font-bold text-white uppercase text-xs">
                          {tx.training_enrollments?.profiles?.full_name || "—"}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {tx.training_enrollments?.profiles?.email || ""}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="bg-blue-950 text-blue-400 px-2 py-0.5 rounded-full text-[9px] border border-blue-900 font-black uppercase">
                          {tx.training_enrollments?.trainings?.name || "Training Course"}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 font-black text-sm text-emerald-400">
                        ₹{Number(tx.amount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {tx.status || "captured"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* ==================== PROFILE TAB ==================== */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          
          {/* Details Column */}
          <Card className="bg-slate-900/60 border border-slate-800 shadow-2xl lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <User className="size-4 text-blue-400" /> Account Information
              </CardTitle>
              <CardDescription className="text-slate-400">Update your profile details and contact information.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-400">Full Name *</Label>
                    <Input 
                      required 
                      value={repName} 
                      onChange={e => setRepName(e.target.value)} 
                      className="h-10 rounded-xl bg-slate-950 border-slate-800 text-xs text-white" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-400">Contact Number</Label>
                    <Input 
                      value={repContact} 
                      onChange={e => setRepContact(e.target.value)} 
                      placeholder="e.g. +91 9876543210"
                      className="h-10 rounded-xl bg-slate-950 border-slate-800 text-xs text-white" 
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit" 
                    disabled={updatingProfile}
                    className="px-6 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-lg flex items-center gap-1.5"
                  >
                    {updatingProfile ? <Activity className="animate-spin size-3" /> : <Save size={12} />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Settings / Credentials Column */}
          <div className="space-y-6">
            
            {/* Email card */}
            <Card className="bg-slate-900/60 border border-slate-800 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Mail className="size-4 text-blue-400" /> Change Email
                </CardTitle>
                <CardDescription className="text-slate-400">Change your login email address.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateEmail} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-400">Current Email</Label>
                    <Input disabled value={repEmail} className="h-10 rounded-xl bg-slate-950/50 border-slate-800 text-xs text-slate-500" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-400">New Email Address *</Label>
                    <Input 
                      required 
                      type="email" 
                      value={newEmail} 
                      onChange={e => setNewEmail(e.target.value)} 
                      placeholder="new-email@example.com"
                      className="h-10 rounded-xl bg-slate-950 border-slate-800 text-xs text-white" 
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={updatingEmail}
                    className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5"
                  >
                    {updatingEmail ? <Activity className="animate-spin size-3" /> : <Mail size={12} />}
                    Update Email
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Password card */}
            <Card className="bg-slate-900/60 border border-slate-800 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Key className="size-4 text-blue-400" /> Change Password
                </CardTitle>
                <CardDescription className="text-slate-400">Secure your workspace credentials.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-400">New Password *</Label>
                    <Input 
                      required 
                      type="password" 
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)} 
                      placeholder="••••••••"
                      className="h-10 rounded-xl bg-slate-950 border-slate-800 text-xs text-white" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-400">Confirm New Password *</Label>
                    <Input 
                      required 
                      type="password" 
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)} 
                      placeholder="••••••••"
                      className="h-10 rounded-xl bg-slate-950 border-slate-800 text-xs text-white" 
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={updatingPassword}
                    className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5"
                  >
                    {updatingPassword ? <Activity className="animate-spin size-3" /> : <Lock size={12} />}
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>

          </div>
        </div>
      )}

      {/* Student detail drawer modal */}
      {selectedStudent && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-xl rounded-2xl border-none shadow-2xl bg-slate-900 text-slate-100 p-6 overflow-y-auto max-h-[90vh]">
            <DialogHeader className="border-b border-slate-800 pb-4 mb-4">
              <DialogTitle className="text-lg font-black uppercase text-white flex items-center gap-2">
                <PhoneCall size={18} className="text-blue-400" /> Call Workspace
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs">
                Manage contact calls, log conversation remarks, and record enrolled products.
              </DialogDescription>
            </DialogHeader>

            {/* Profile section with user info */}
            <div className="space-y-6">
              
              {/* Client detailed card */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-white text-sm uppercase">{selectedStudent.profile?.full_name}</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">{selectedStudent.profile?.university_name || "No University"}</p>
                    <p className="text-[10px] text-slate-500">{selectedStudent.profile?.college_name || "No College"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleCopy(selectedStudent.profile?.contact_number)}
                      className="h-7 px-2 bg-slate-800 text-[10px] font-bold text-slate-300 rounded-lg hover:bg-slate-700"
                    >
                      <Copy size={12} className="mr-1" /> Copy Phone
                    </Button>
                    <a 
                      href={`tel:${selectedStudent.profile?.contact_number}`} 
                      className="inline-flex items-center justify-center h-7 px-3 bg-blue-600 text-[10px] font-bold text-white rounded-lg hover:bg-blue-500 shadow-md"
                    >
                      <Phone size={12} className="mr-1" /> Call Now
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-800/80 pt-2 text-[10px] text-slate-400">
                  <div><span className="font-bold uppercase text-slate-500">Email:</span> {selectedStudent.profile?.email}</div>
                  <div><span className="font-bold uppercase text-slate-500">Phone:</span> {selectedStudent.profile?.contact_number || "-"}</div>
                  <div><span className="font-bold uppercase text-slate-500">Roll No:</span> {selectedStudent.profile?.university_roll_number || "-"}</div>
                  <div><span className="font-bold uppercase text-slate-500">Department:</span> {selectedStudent.profile?.department || "-"}</div>
                </div>
              </div>

              {/* Call update remark form */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-400">Lead Status</Label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value)}
                      className="w-full h-10 rounded-xl bg-slate-950 border border-slate-800 font-bold text-xs px-3 text-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="assigned">Assigned</option>
                      <option value="called">Called</option>
                      <option value="interested">Interested</option>
                      <option value="not_interested">Not Interested</option>
                      <option value="enrolled">Enrolled & Sell</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-400">Followup Date</Label>
                    <Input 
                      type="date"
                      value={followupDate} 
                      onChange={e => setFollowupDate(e.target.value)}
                      className="h-10 rounded-xl bg-slate-950 border-slate-800 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-400">Enrolled Course Name</Label>
                    <Input 
                      value={enrolledCourse} 
                      onChange={e => setEnrolledCourse(e.target.value)}
                      placeholder="e.g. Fullstack Development"
                      className="h-10 rounded-xl bg-slate-950 border-slate-800 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-400">Enrolled Type</Label>
                    <select
                      value={enrolledType}
                      onChange={e => setEnrolledType(e.target.value)}
                      className="w-full h-10 rounded-xl bg-slate-950 border border-slate-800 font-bold text-xs px-3 text-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="training">Training Course</option>
                      <option value="internship">Internship Enrollment</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-400">Referral Course Enrolled</Label>
                  <Input 
                    value={referralCourse} 
                    onChange={e => setReferralCourse(e.target.value)}
                    placeholder="e.g. Devops (Referral)"
                    className="h-10 rounded-xl bg-slate-950 border-slate-800 text-xs text-white"
                  />
                </div>

                {/* Complete Sale Form (only visible if status is enrolled) */}
                {status === "enrolled" && (
                  <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Star className="size-3 text-emerald-400 fill-emerald-400" /> Complete Enrollment & Sale
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {enrolledType === "training" ? (
                        <div className="space-y-1.5">
                          <Label className="text-[9px] font-black uppercase text-slate-400">Select Training Product</Label>
                          <select
                            value={selectedTrainingId}
                            onChange={e => {
                              setSelectedTrainingId(e.target.value);
                              const selected = trainingsList.find(t => t.id === e.target.value);
                              if (selected) {
                                setSaleAmount(selected.fee?.toString() || "");
                                setEnrolledCourse(selected.name || "");
                              }
                            }}
                            className="w-full h-9 rounded-lg bg-slate-950 border border-slate-800 font-bold text-[11px] px-2 text-slate-200 outline-none"
                          >
                            <option value="">-- Choose Course --</option>
                            {trainingsList.map(t => (
                              <option key={t.id} value={t.id}>{t.name} (Fee: ₹{t.fee})</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <Label className="text-[9px] font-black uppercase text-slate-400">Select Internship Program</Label>
                          <select
                            value={selectedTrainingId}
                            onChange={e => {
                              setSelectedTrainingId(e.target.value);
                              const selected = internshipsList.find(i => i.id === e.target.value);
                              if (selected) setEnrolledCourse(selected.title || "");
                            }}
                            className="w-full h-9 rounded-lg bg-slate-950 border border-slate-800 font-bold text-[11px] px-2 text-slate-200 outline-none"
                          >
                            <option value="">-- Choose Internship --</option>
                            {internshipsList.map(i => (
                              <option key={i.id} value={i.id}>{i.title}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase text-slate-400">Final Sale Amount (INR)</Label>
                        <Input 
                          type="number"
                          value={saleAmount}
                          onChange={e => setSaleAmount(e.target.value)}
                          placeholder="e.g. 999"
                          className="h-9 rounded-lg bg-slate-950 border-slate-800 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-400">Call Remarks / Log Notes</Label>
                  <Textarea 
                    value={remark} 
                    onChange={e => setRemark(e.target.value)}
                    placeholder="Enter details of conversation..."
                    rows={3}
                    className="rounded-xl bg-slate-950 border-slate-800 text-xs text-white resize-none"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 h-9 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveStudentNote}
                  disabled={savingNote}
                  className="px-6 h-9 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-lg flex items-center gap-1.5"
                >
                  {savingNote ? <Activity className="animate-spin size-3" /> : <Save size={12} />}
                  Save Changes
                </Button>
              </div>

            </div>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
