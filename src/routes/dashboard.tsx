import { createFileRoute, Outlet, Link, useNavigate, useLocation, type AnyRouter } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

type NavLink = {
  to: string;
  icon: LucideIcon;
  label: string;
  search?: Record<string, string>;
};
import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  ChevronLeft, 
  Settings, 
  Mail, 
  ListChecks,
  GraduationCap,
  School,
  Scan,
  BookOpen,
  CreditCard,
  User,
  Video,
  FileCheck,
  ClipboardList,
  TrendingUp,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import logo from "@/assets/techlaunchpad-logo.png";

import { LogoLoader } from "@/components/LogoLoader";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, [location.pathname]);

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (location.pathname !== "/login") navigate({ to: "/login" });
        return;
      }
      
      // Fetch role first - use maybeSingle to avoid errors if profile is missing
      const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      
      if (error) {
         console.error("Profile fetch error:", error);
      }

      let userRole = user.user_metadata?.role || profile?.role || "student";
      
      let isTrainingStudent = false;
      let isInternshipStudent = false;
      let isCandidate = false;

      // Only perform student checks if the user is not an admin or sales representative
      if (userRole !== "admin" && userRole !== "sales") {
        isTrainingStudent = userRole === "training";
        if (!isTrainingStudent) {
          // Fallback: Check if they have an active training enrollment
          const { data: hasEnrollment } = await supabase
            .from("training_enrollments")
            .select("id")
            .eq("student_id", user.id)
            .maybeSingle();
          if (hasEnrollment) {
            isTrainingStudent = true;
          } else {
            // Check training leads table
            const { data: hasLead } = await supabase
              .from("training_leads")
              .select("id")
              .eq("student_id", user.id)
              .eq("status", "claimed")
              .maybeSingle();
            if (hasLead) {
              isTrainingStudent = true;
            }
          }
        }

        // Determine if they are an internship student strictly by table existence
        const { data: isMatch } = await supabase
          .from("internship_students")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();
        if (isMatch) {
          isInternshipStudent = true;
        }
        
        // Determine if they are a job campus candidate
        const { data: isCandidateMatch } = await supabase
          .from("job_campus_enrollments")
          .select("id")
          .eq("candidate_id", user.id)
          .maybeSingle();
        if (isCandidateMatch) {
          isCandidate = true;
        }
      }

      // Strictly map role in UI
      if (userRole === "admin") {
        // Keep role as admin
      } else if (userRole === "sales") {
        // Keep role as sales
      } else if (isCandidate) {
        userRole = "candidate";
      } else if (isTrainingStudent) {
        userRole = "training";
      } else if (isInternshipStudent) {
        userRole = "student";
      }

      setRole(userRole);

      // Handle root /dashboard redirect
      if (location.pathname === "/dashboard" || location.pathname === "/dashboard/") {
        if (userRole === "admin") {
          navigate({ to: "/dashboard/admin" } as any);
        } else if (userRole === "sales") {
          navigate({ to: "/dashboard/sales" } as any);
        } else if (userRole === "candidate") {
          navigate({ to: "/dashboard/candidate" } as any);
        } else if (isTrainingStudent) {
          navigate({ to: "/dashboard/training", search: { tab: "learning" } } as any);
        } else {
          navigate({ to: "/dashboard/student" });
        }
        return;
      }

      // Biometric Guard: Only for internship students (who are under /dashboard/student path)
      if (location.pathname.startsWith("/dashboard/student") && userRole === "student" && profile?.face_registered === false && location.pathname !== "/dashboard/student/face-register") {
        navigate({ to: "/dashboard/student/face-register" });
      }
    } catch (err) {
      console.error("Auth guard error:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0a192f]">
        <LogoLoader size="lg" />
      </div>
    );
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  const adminLinks: NavLink[] = [
    { to: "/dashboard/admin", icon: LayoutDashboard, label: "Overview" },
    { to: "/dashboard/admin", search: { view: 'students' }, icon: GraduationCap, label: "Active Students" },
    { to: "/dashboard/admin", search: { view: 'pre-reg' }, icon: ListChecks, label: "Pre-Registration" },
    { to: "/dashboard/admin", search: { view: 'institutes' }, icon: School, label: "Academic Network" },
    { to: "/dashboard/admin", search: { view: 'internships' }, icon: Briefcase, label: "Internships" },
    { to: "/dashboard/admin", search: { view: 'attendance' }, icon: ListChecks, label: "Attendance Control" },
    { to: "/dashboard/admin", search: { view: 'assignments' }, icon: BookOpen, label: "Assignment Hub" },
    { to: "/dashboard/admin", search: { view: 'jobs' }, icon: Briefcase, label: "Job Campus" },
    { to: "/dashboard/admin", search: { view: 'transactions' }, icon: CreditCard, label: "Transactions" },
    { to: "/dashboard/admin", search: { view: 'leads' }, icon: Users, label: "Student Leads" },
    { to: "/dashboard/admin", search: { view: 'lectures' }, icon: Video, label: "Online Lectures" },
    { to: "/dashboard/admin", search: { view: 'trainings' }, icon: BookOpen, label: "Trainings" },
    { to: "/dashboard/admin", search: { view: 'sales' }, icon: TrendingUp, label: "Sales Team" },
    { to: "/dashboard/admin", search: { view: 'referrals' }, icon: Users, label: "Referrals" },
    { to: "/dashboard/admin", search: { view: 'marketing' }, icon: Mail, label: "Marketing Mailer" },
    { to: "/dashboard/admin", search: { view: 'profile' }, icon: User, label: "My Profile" },
    { to: "/dashboard/certificates", icon: ShieldCheck, label: "Certificates" },
    { to: "/dashboard/inbox", icon: Mail, label: "Inbox" },
  ];

  const internshipLinks: NavLink[] = [
    { to: "/dashboard/student", icon: LayoutDashboard, label: "Overview" },
    { to: "/dashboard/student/offer-letter", icon: FileCheck, label: "My Offer Letter" },
    { to: "/dashboard/student/lectures", icon: Video, label: "Online Lectures" },
    { to: "/dashboard/student/assignments", icon: ClipboardList, label: "Assignments" },
    { to: "/dashboard/student/payments", icon: CreditCard, label: "Payments" },
    { to: "/dashboard/student/certificate", icon: GraduationCap, label: "My Certificate" },
    { to: "/dashboard/student/profile", icon: User, label: "My Profile" },
  ];

  const trainingLinks: NavLink[] = [
    { to: "/dashboard/training", search: { tab: "learning" }, icon: BookOpen, label: "My Trainings" },
    { to: "/dashboard/training", search: { tab: "profile" }, icon: User, label: "My Profile" },
    { to: "/dashboard/training", search: { tab: "assignments" }, icon: ClipboardList, label: "Assignments" },
    { to: "/dashboard/training", search: { tab: "certificate" }, icon: ShieldCheck, label: "Certificate" },
    { to: "/dashboard/training", search: { tab: "payments" }, icon: CreditCard, label: "Payments" },
  ];

  const salesLinks: NavLink[] = [
    { to: "/dashboard/sales", search: { tab: "overview" }, icon: TrendingUp, label: "Sales Dashboard" },
    { to: "/dashboard/sales", search: { tab: "leads" }, icon: Users, label: "My Students" },
  ];

  const candidateLinks: NavLink[] = [
    { to: "/dashboard/candidate", icon: LayoutDashboard, label: "Overview" },
    { to: "/dashboard/candidate", search: { tab: "profile" } as any, icon: User, label: "My Profile" },
    { to: "/dashboard/candidate", search: { tab: "vacancies" } as any, icon: Briefcase, label: "Job Vacancies" },
    { to: "/dashboard/candidate", search: { tab: "training" } as any, icon: BookOpen, label: "My Training" },
  ];

  const referralLinks: NavLink[] = [
    { to: "/dashboard/referral", icon: LayoutDashboard, label: "Overview" },
    { to: "/dashboard/referral", search: { tab: "add_student" }, icon: Plus, label: "Add Student" },
    { to: "/dashboard/referral", search: { tab: "students" }, icon: Users, label: "My Students" },
  ];

  const links = role === "admin" 
    ? adminLinks 
    : role === "sales"
      ? salesLinks
      : role === "referral"
        ? referralLinks
        : role === "candidate"
          ? candidateLinks
          : role === "training" 
            ? trainingLinks 
            : internshipLinks;

  return (
    <div className="flex h-screen bg-[#f8f9fa] print:bg-white print:h-auto print:block">
      {/* Sidebar */}
      <aside 
        className={`${
          isCollapsed ? "w-20" : "w-64"
        } bg-[#0a192f] text-white transition-all duration-300 flex flex-col shadow-2xl relative z-50 print:hidden`}
      >
        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-10 bg-gold text-navy-deep rounded-full p-1 shadow-lg border-2 border-white hover:scale-110 transition-all"
        >
          {isCollapsed ? <Menu size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo Section */}
        <div className={`p-6 flex items-center gap-3 border-b border-white/10 ${isCollapsed ? "justify-center" : ""}`}>
          <img src={logo} alt="Logo" className="size-10 rounded-full bg-white p-1" />
          {!isCollapsed && (
            <div>
              <div className="font-display font-bold text-sm tracking-widest text-white uppercase">TechLaunchpad</div>
              <div className="text-[10px] text-gold font-bold uppercase">{role} Portal</div>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {links.map((link) => {
            const searchParams = location.search as any;
            const isActive = location.pathname === link.to && (
              !link.search || 
              searchParams?.view === (link.search as any)?.view ||
              searchParams?.tab === (link.search as any)?.tab
            );
            return (
              <Link
                key={link.label}
                to={link.to}
                search={link.search as any}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${
                  isActive
                    ? "bg-gold text-navy-deep font-bold shadow-lg" 
                    : "hover:bg-white/10 text-white/70 hover:text-white"
                }`}
              >
                <link.icon className={`size-5 transition-transform group-hover:scale-110 ${isCollapsed ? "mx-auto" : ""}`} />
                {!isCollapsed && <span className="text-sm">{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Sign Out */}
        <div className="p-4 border-t border-white/10">
          <Button 
            variant="ghost" 
            onClick={handleSignOut}
            className={`w-full flex items-center gap-3 hover:bg-red-500/10 hover:text-red-400 text-white/70 ${isCollapsed ? "justify-center" : "justify-start"}`}
          >
            <LogOut size={18} />
            {!isCollapsed && <span>Sign out</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative print:p-0 print:overflow-visible print:bg-white print:block">
         <Outlet />
      </main>
    </div>
  );
}
