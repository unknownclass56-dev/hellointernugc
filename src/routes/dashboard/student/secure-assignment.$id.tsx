import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ShieldAlert, Lock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/student/secure-assignment/$id")({
  component: SecureAssignmentView,
});

function SecureAssignmentView() {
  const { id } = Route.useParams();
  const [assignment, setAssignment] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetails();
    
    // Disable Copy/Paste
    const preventAction = (e: any) => e.preventDefault();
    document.addEventListener("copy", preventAction);
    document.addEventListener("paste", preventAction);
    document.addEventListener("contextmenu", preventAction);
    
    return () => {
      document.removeEventListener("copy", preventAction);
      document.removeEventListener("paste", preventAction);
      document.removeEventListener("contextmenu", preventAction);
    };
  }, [id]);

  async function fetchDetails() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setStudent(prof);
    }
    
    const { data: ass } = await supabase.from("assignments").select("*").eq("id", id).single();
    setAssignment(ass);
    setLoading(false);
  }

  if (loading) return <div className="h-screen grid place-items-center bg-white font-black uppercase text-xs tracking-widest text-navy animate-pulse">Initializing Secure Environment...</div>;

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col select-none">
      
      {/* SECURITY WATERMARK OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden opacity-[0.03] select-none rotate-[-25deg] scale-125 flex flex-wrap gap-20 p-20 justify-center content-center">
        {Array.from({ length: 100 }).map((_, i) => (
          <div key={i} className="text-6xl font-black whitespace-nowrap uppercase tracking-tighter">
            {student?.university_roll_number || "SECURE_SESSION"}
          </div>
        ))}
      </div>

      {/* SECURE HEADER */}
      <header className="bg-navy text-white px-8 py-4 flex items-center justify-between relative z-20 border-b-4 border-gold shadow-xl">
        <div className="flex items-center gap-4">
           <div className="size-10 rounded-xl bg-gold text-navy-deep grid place-items-center shadow-lg"><Lock size={20}/></div>
           <div>
              <h1 className="text-xl font-black uppercase tracking-tighter leading-none">{assignment?.title}</h1>
              <p className="text-[9px] font-bold text-gold uppercase tracking-[0.2em] mt-1">SECURE TESTING ENVIRONMENT — ROLL: {student?.university_roll_number}</p>
           </div>
        </div>
        <div className="flex items-center gap-6">
           <div className="hidden md:flex flex-col items-end">
              <div className="text-[8px] font-black uppercase opacity-40">Security Status</div>
              <div className="text-[10px] font-black text-green-400 uppercase tracking-widest flex items-center gap-1">
                 <div className="size-1.5 rounded-full bg-green-400 animate-pulse"></div> ENCRYPTED & LOCKED
              </div>
           </div>
           <Button variant="ghost" className="text-white/40 hover:text-white hover:bg-white/10" onClick={() => window.close()}>
              <XCircle size={20} />
           </Button>
        </div>
      </header>

      {/* CONTENT AREA */}
      <main className="flex-1 p-12 relative z-10 max-w-5xl mx-auto w-full">
         <div className="space-y-12">
            <div className="bg-navy/5 p-8 rounded-3xl border-2 border-dashed border-navy/20 relative">
               <ShieldAlert className="absolute -top-4 -right-4 text-gold size-12 drop-shadow-lg" />
               <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-navy/40 mb-4">Official Instructions</h2>
               <div className="prose prose-navy max-w-none text-navy-deep font-bold leading-relaxed whitespace-pre-wrap">
                  {assignment?.description}
               </div>
            </div>

            <div className="space-y-6">
               <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-navy/40 border-b-2 pb-2">Assignment Content</h2>
               <div className="bg-white p-10 rounded-3xl shadow-2xl border-2 border-navy/5 min-h-[400px] text-lg font-medium leading-relaxed">
                  {/* Here goes the actual task content if provided, otherwise a placeholder */}
                  {assignment?.content || "Please follow the instructions provided in the box above. You are required to submit your response via the main dashboard before the deadline."}
               </div>
            </div>
         </div>
      </main>

      {/* FOOTER BANNER */}
      <footer className="bg-navy p-3 text-center text-white relative z-20">
         <p className="text-[9px] font-black uppercase tracking-[0.5em] opacity-40">WARNING: Screen Recording or External Capture is strictly prohibited. Session ID: {id.slice(0,8)}</p>
      </footer>

      {/* CSS For disabling interaction and selection */}
      <style>{`
        body { 
          background: #ffffff !important; 
          overflow-x: hidden;
        }
        ::selection { background: transparent; }
        ::-moz-selection { background: transparent; }
      `}</style>
    </div>
  );
}
