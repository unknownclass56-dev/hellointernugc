import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ClipboardList, Clock, Upload, CheckCircle2, Eye, ExternalLink, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/student/assignments")({
  component: StudentAssignments,
});

function StudentAssignments() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFilteredAssignments();
  }, []);

  async function fetchFilteredAssignments() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Get student's program
    const { data: profile } = await supabase.from("profiles").select("program").eq("id", user.id).single();
    const studentProgram = profile?.program || "";

    // 2. Fetch assignments and filter
    const { data: allAssignments } = await supabase.from("assignments").select("*").order("created_at", { ascending: false });
    
    if (allAssignments) {
      const filtered = allAssignments.filter(a => 
        a.domain === "Global" || 
        !a.domain || 
        a.domain === studentProgram
      );
      setAssignments(filtered);
    }
  }

  const launchSecureAssignment = (id: string) => {
    const url = `/dashboard/student/secure-assignment/${id}`;
    const windowFeatures = "toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=" + window.screen.width + ",height=" + window.screen.height;
    window.open(url, "SecureAssignment", windowFeatures);
  };

  return (
    <div className="space-y-8 pb-20">
      <div>
        <div className="flex items-center gap-2 text-[10px] font-black text-gold uppercase tracking-[0.3em] mb-1">
           <Lock size={12} /> Secure Academic Hub
        </div>
        <h1 className="font-display text-4xl font-black text-navy-deep uppercase tracking-tighter">Academic Assignments</h1>
        <p className="text-muted-foreground font-bold text-sm">Access your secure online tasks and submit your work for evaluation.</p>
      </div>

      <div className="grid gap-6">
        {assignments.length === 0 ? (
          <div className="rounded-[2rem] border-2 border-dashed border-navy/10 bg-white p-20 text-center text-muted-foreground shadow-sm">
            <ClipboardList className="mx-auto size-16 text-navy/10 mb-6" />
            <h3 className="text-lg font-black text-navy uppercase tracking-widest opacity-40">No active assignments</h3>
            <p className="text-xs font-bold mt-2 uppercase tracking-tight">Check back later for new tasks from your administrator.</p>
          </div>
        ) : assignments.map((a) => {
          const isOverdue = a.due_date && new Date(a.due_date) < new Date();
          return (
            <div key={a.id} className="group relative flex flex-wrap items-center justify-between gap-6 rounded-[2rem] border-2 border-navy/5 bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:border-gold/30">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Lock size={60}/></div>
              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-2">
                   <span className="px-3 py-1 bg-navy/5 text-navy text-[8px] font-black uppercase tracking-widest rounded-full border">Verified Task</span>
                   {isOverdue && <span className="px-3 py-1 bg-red-50 text-red-600 text-[8px] font-black uppercase tracking-widest rounded-full border border-red-100">Overdue</span>}
                </div>
                <h3 className="font-display text-2xl font-black text-navy-deep uppercase tracking-tight leading-tight">{a.title}</h3>
                <p className="text-sm text-muted-foreground font-medium max-w-xl line-clamp-2">{a.description}</p>
                <div className="flex items-center gap-4 pt-2">
                   <div className={`flex items-center gap-2 text-[10px] font-black uppercase ${isOverdue ? 'text-red-500' : 'text-gold'}`}>
                     <Clock className="size-3" /> Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'No deadline'}
                   </div>
                   <div className="size-1 rounded-full bg-navy/10"></div>
                   <div className="text-[10px] font-black uppercase text-navy/40">Mode: Secure Window</div>
                </div>
              </div>
              <div className="flex gap-3 relative z-10 w-full sm:w-auto">
                <Button 
                   onClick={() => launchSecureAssignment(a.id)}
                   className="flex-1 sm:flex-initial bg-navy text-white hover:bg-navy-deep px-8 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
                >
                  <ExternalLink size={14} /> LAUNCH ASSIGNMENT
                </Button>
                <Button variant="outline" className="flex-1 sm:flex-initial border-2 border-navy/10 text-navy font-black text-[10px] uppercase tracking-widest h-12 px-8 rounded-xl hover:bg-navy/5">
                  <Upload size={14} className="mr-2" /> SUBMIT WORK
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
