import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Briefcase, FileCheck, GraduationCap, TrendingUp, Download, Video, Calendar, ClipboardList, Wallet, User, School, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/dashboard/student/")({
  component: StudentDashboard,
});

function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigate({ to: "/dashboard/student/trainings", replace: true });
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user]);

  async function fetchProfile() {
    const { data } = await supabase.from("profiles").select("*").eq("id", user?.id).maybeSingle();
    if (data) setProfile(data);
    setLoading(false);
  }

  const name = profile?.full_name || String(user?.user_metadata?.full_name || "Student");
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-gold font-bold">Student Dashboard</div>
          <h1 className="font-display text-3xl font-bold text-navy-deep">Welcome, {name} 👋</h1>
          <p className="text-muted-foreground">Everything you need to manage your internship journey.</p>
        </div>
        <Button asChild variant="outline" className="border-navy/20 text-navy h-11 px-6 rounded-xl font-bold">
          <Link to="/dashboard/student/profile">View Profile</Link>
        </Button>
      </div>

      {/* 11-COLUMN STAGED & PROFILE DETAILS SUMMARY CARD */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
        <div className="bg-navy p-4 flex items-center justify-between">
          <h3 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
            <GraduationCap className="text-gold size-5" /> Academic & Identity Profile
          </h3>
          <span className="text-[9px] font-black text-gold bg-gold/10 border border-gold/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Official Data</span>
        </div>
        <div className="p-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 bg-slate-50/50">
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Father's Name</div>
            <div className="text-xs font-bold text-navy-deep uppercase">{profile?.parent_name || profile?.father_name || "—"}</div>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Gender</div>
            <div className="text-xs font-bold text-navy-deep uppercase">{profile?.gender || "—"}</div>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Mobile No</div>
            <div className="text-xs font-bold text-navy-deep font-mono">{profile?.contact_number || "—"}</div>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Roll Number</div>
            <div className="text-xs font-bold text-gold font-mono">{profile?.university_roll_number || "—"}</div>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm col-span-1 sm:col-span-2">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">University</div>
            <div className="text-xs font-bold text-slate-800 uppercase">{profile?.university_name || "—"}</div>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm col-span-1 sm:col-span-2">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">College</div>
            <div className="text-xs font-bold text-slate-800 uppercase">{profile?.college_name || "—"}</div>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Branch / Department</div>
            <div className="text-xs font-bold text-navy-deep uppercase">{profile?.department || "—"}</div>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Degree</div>
            <div className="text-xs font-bold text-navy-deep uppercase">{profile?.degree || "—"}</div>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Semester</div>
            <div className="text-xs font-bold text-navy-deep uppercase">{profile?.semester || "—"}</div>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Academic Session</div>
            <div className="text-xs font-bold text-navy-deep uppercase">{profile?.academic_session || "—"}</div>
          </div>
        </div>
      </div>

      {/* PREMIUM OFFER LETTER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-deep via-navy to-[#0a192f] p-8 shadow-2xl border border-gold/20 flex flex-col md:flex-row items-center justify-between gap-6 group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none">
          <FileCheck size={160} className="text-gold rotate-12" />
        </div>
        <div className="absolute -left-10 -bottom-10 size-40 bg-gold/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-[10px] font-black uppercase tracking-widest mb-2">
            <span className="relative flex size-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span><span className="relative inline-flex rounded-full size-2 bg-gold"></span></span>
            Action Required
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Your Official Offer Letter</h2>
          <p className="text-white/70 text-sm max-w-xl font-medium leading-relaxed">
            Your digitally verified internship offer letter from TechLaunchpad and BSDM is generated and ready for download. Keep this document secure for your academic records.
          </p>
        </div>
        
        <div className="relative z-10 shrink-0 w-full md:w-auto">
          <Button asChild className="w-full md:w-auto bg-gold hover:bg-gold/90 text-navy-deep h-14 px-8 rounded-2xl font-black uppercase text-xs tracking-widest shadow-[0_0_40px_-10px_rgba(212,175,55,0.5)] transition-all hover:scale-105 hover:shadow-[0_0_60px_-15px_rgba(212,175,55,0.7)] group/btn">
            <Link to="/dashboard/student/offer-letter" className="flex items-center justify-center gap-3">
              <Download size={18} className="group-hover/btn:-translate-y-1 transition-transform duration-300" />
              Download / Print Offer
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Briefcase, label: "Active Internship", value: profile?.program || "None", color: "bg-navy shadow-navy/20" },
          { icon: Calendar, label: "Attendance", value: "0%", color: "bg-navy shadow-navy/20" },
          { icon: Video, label: "Lectures", value: "0", color: "bg-navy shadow-navy/20" },
          { icon: ClipboardList, label: "Assignments", value: "0", color: "bg-navy shadow-navy/20" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-gold/30">
            <div className={`grid size-11 place-items-center rounded-xl ${s.color} text-ivory shadow-lg`}><s.icon className="size-5" /></div>
            <div><div className="font-display text-2xl font-bold text-navy-deep">{s.value}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-navy-deep flex items-center gap-2"><Briefcase className="size-5" /> Latest Announcements</h2>
            <div className="mt-8 text-center text-muted-foreground italic py-10 border-t border-dashed border-border mt-4">
              No new announcements from the administration.
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link to="/dashboard/student/lectures" className="group rounded-2xl border border-border bg-card p-6 shadow-sm hover:border-navy/30 transition-all hover:shadow-md">
              <Video className="size-8 text-navy/40 group-hover:text-navy transition-colors mb-4" />
              <h3 className="font-display font-bold text-navy-deep">Online Lectures</h3>
              <p className="text-xs text-muted-foreground mt-1">Watch live and recorded training sessions.</p>
            </Link>
            <Link to="/dashboard/student/assignments" className="group rounded-2xl border border-border bg-card p-6 shadow-sm hover:border-navy/30 transition-all hover:shadow-md">
              <ClipboardList className="size-8 text-navy/40 group-hover:text-navy transition-colors mb-4" />
              <h3 className="font-display font-bold text-navy-deep">Assignments</h3>
              <p className="text-xs text-muted-foreground mt-1">Submit your projects and view grades.</p>
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between min-h-[260px]">
            <h2 className="font-display text-lg font-bold text-navy-deep flex items-center gap-2"><GraduationCap className="size-5" /> Certifications</h2>
            <div className="text-center py-4 flex-1 flex flex-col justify-center items-center">
              <div className="mx-auto size-12 rounded-full bg-gold/10 grid place-items-center mb-3">
                <GraduationCap className="size-6 text-gold" />
              </div>
              <p className="text-xs font-bold text-navy-deep">Completion Certificate</p>
              <p className="text-[10px] text-muted-foreground mt-1">Verifiable BSDM & TechLaunchpad Credential</p>
            </div>
            <Button asChild className="w-full bg-gold hover:bg-gold/90 text-navy-deep font-black text-xs uppercase tracking-widest h-10 rounded-xl">
              <Link to="/dashboard/student/certificate">View & Print Certificate</Link>
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-navy-deep flex items-center gap-2"><Wallet className="size-5" /> Quick Links</h2>
            <div className="mt-4 space-y-2">
              <Button asChild variant="ghost" className="w-full justify-start text-sm hover:bg-gold/10 hover:text-navy"><Link to="/dashboard/student/attendance">View Attendance</Link></Button>
              <Button asChild variant="ghost" className="w-full justify-start text-sm hover:bg-gold/10 hover:text-navy"><Link to="/dashboard/student/payments">Payment History</Link></Button>
              <Button asChild variant="ghost" className="w-full justify-start text-sm hover:bg-gold/10 hover:text-navy"><Link to="/dashboard/student/profile">Update Profile</Link></Button>
              <Button asChild variant="ghost" className="w-full justify-start text-sm hover:bg-gold/10 hover:text-navy group">
                <Link to="/dashboard/student/offer-letter" className="flex items-center gap-2">
                  <FileCheck size={16} className="text-gold group-hover:scale-110 transition-transform" />
                  Official Offer Letter
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-start text-sm hover:bg-gold/10 hover:text-navy group">
                <Link to="/dashboard/student/certificate" className="flex items-center gap-2">
                  <GraduationCap size={16} className="text-gold group-hover:scale-110 transition-transform" />
                  Internship Certificate
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
