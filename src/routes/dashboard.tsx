import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
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
  Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import logo from "@/assets/techlaunchpad-logo.png";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [role, setRole] = useState<string | null>(null);

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

      const userRole = profile?.role || "student";
      setRole(userRole);

      // Biometric Guard: Check if the column exists in the returned data
      // If the column is missing from DB, face_registered will be undefined
      if (userRole === "student" && profile?.face_registered === false && location.pathname !== "/dashboard/student/face-register") {
        navigate({ to: "/dashboard/student/face-register" });
      }
    } catch (err) {
      console.error("Auth guard error:", err);
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  const adminLinks = [
    { to: "/dashboard/admin", icon: LayoutDashboard, label: "Overview" },
    { to: "/dashboard/admin", search: { view: 'students' }, icon: GraduationCap, label: "Active Students" },
    { to: "/dashboard/admin", search: { view: 'pre-reg' }, icon: ListChecks, label: "Pre-Registration" },
    { to: "/dashboard/admin", search: { view: 'institutes' }, icon: School, label: "Academic Network" },
    { to: "/dashboard/admin", search: { view: 'internships' }, icon: Briefcase, label: "Internships" },
    { to: "/dashboard/admin", search: { view: 'attendance' }, icon: ListChecks, label: "Attendance Control" },
    { to: "/dashboard/admin", search: { view: 'assignments' }, icon: BookOpen, label: "Assignment Hub" },
    { to: "/dashboard/admin", search: { view: 'transactions' }, icon: CreditCard, label: "Transactions" },
    { to: "/dashboard/admin", search: { view: 'leads' }, icon: Users, label: "Student Leads" },
    { to: "/dashboard/admin", search: { view: 'lectures' }, icon: Video, label: "Online Lectures" },
    { to: "/dashboard/admin", search: { view: 'marketing' }, icon: Mail, label: "Marketing Mailer" },
    { to: "/dashboard/admin", search: { view: 'profile' }, icon: User, label: "My Profile" },
    { to: "/dashboard/certificates", icon: ShieldCheck, label: "Certificates" },
    { to: "/dashboard/inbox", icon: Mail, label: "Inbox" },
  ];

  const studentLinks = [
    { to: "/dashboard/student", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/dashboard/student/profile", icon: Users, label: "My Profile" },
    { to: "/dashboard/student/attendance", icon: ListChecks, label: "Attendance" },
    { to: "/dashboard/student/lectures", icon: Mail, label: "Online Lectures" },
    { to: "/dashboard/student/assignments", icon: Briefcase, label: "Assignments" },
    { to: "/dashboard/student/certificate", icon: GraduationCap, label: "My Certificate" },
    { to: "/dashboard/student/payments", icon: ShieldCheck, label: "Payments" },
  ];

  const links = role === "admin" ? adminLinks : studentLinks;

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
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              search={link.search}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${
                location.pathname === link.to && (!link.search || (location.search as any).view === link.search.view)
                  ? "bg-gold text-navy-deep font-bold shadow-lg" 
                  : "hover:bg-white/10 text-white/70 hover:text-white"
              }`}
            >
              <link.icon className={`size-5 transition-transform group-hover:scale-110 ${isCollapsed ? "mx-auto" : ""}`} />
              {!isCollapsed && <span className="text-sm">{link.label}</span>}
            </Link>
          ))}
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
