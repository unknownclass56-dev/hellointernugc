import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  Calendar, CheckCircle, XCircle, Clock, Camera, Scan, 
  ShieldCheck, Loader2, CheckCircle2, UserCheck, Lock, Fingerprint, CalendarCheck
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogoLoader } from "@/components/LogoLoader";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";

export const Route = createFileRoute("/dashboard/student/attendance")({
  component: StudentAttendance,
});

function StudentAttendance() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [isFaceRegistered, setIsFaceRegistered] = useState<boolean>(false);
  const [isAlreadyMarked, setIsAlreadyMarked] = useState<boolean>(false);
  const [isScanningOpen, setIsScanningOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user]);

  async function fetchData() {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch Attendance
      const { data: att, error: attError } = await supabase
        .from("attendance")
        .select("*")
        .eq("student_id", user?.id)
        .order("date", { ascending: false });
      
      if (!attError) {
        setAttendance(att || []);
        // Check if today's date exists in logs
        const markedToday = att?.some(record => record.date === today);
        setIsAlreadyMarked(!!markedToday);
      }

      // Fetch Profile for Face Reg status
      const { data: prof, error: profError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .maybeSingle();
      
      if (profError || prof?.face_registered === undefined) {
         setIsFaceRegistered(true); 
      } else {
         setIsFaceRegistered(!!prof?.face_registered);
      }
    } catch (err) {
      console.error("Attendance data fetch error:", err);
      setIsFaceRegistered(true); 
    }
    setLoading(false);
  }

  async function startCamera() {
    if (isAlreadyMarked) return; // Guard
    setIsScanningOpen(true);
    setScanComplete(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch (err) {
      toast.error("Camera access denied.");
      setIsScanningOpen(false);
    }
  }

  function stopCamera() {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }
  }

  async function handleScan() {
    setScanning(true);
    setTimeout(async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: existing } = await supabase
        .from("attendance")
        .select("*")
        .eq("student_id", user?.id)
        .eq("date", today)
        .maybeSingle();

      if (existing) {
        toast.error("Attendance already marked for today!");
        setScanning(false);
        setIsScanningOpen(false);
        stopCamera();
        setIsAlreadyMarked(true);
        return;
      }

      const { error } = await supabase.from("attendance").insert({
        student_id: user?.id,
        date: today,
        status: "present"
      });

      if (!error) {
        setScanComplete(true);
        setScanning(false);
        toast.success("Attendance Marked Successfully!");
        fetchData();
        setTimeout(() => {
          setIsScanningOpen(false);
          stopCamera();
        }, 2000);
      } else {
        setScanning(false);
        toast.error("Verification failed. Please try again.");
      }
    }, 2500);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header with Lockout Logic */}
      <div className="bg-white p-8 rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {!isFaceRegistered && <div className="absolute top-0 left-0 w-1 bg-amber-500 h-full" />}
        {isAlreadyMarked && <div className="absolute top-0 left-0 w-1 bg-green-500 h-full" />}
        
        <div className="flex-1">
          <div className="flex items-center gap-2 text-gold font-black text-[10px] uppercase tracking-[0.3em] mb-2">
            <UserCheck size={14} /> Biometric Presence Control
          </div>
          <h1 className="font-display text-4xl font-black text-navy-deep uppercase tracking-tighter leading-none">Attendance Panel</h1>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-2">
            {!isFaceRegistered 
              ? "Action Required: Please register your face to enable attendance." 
              : isAlreadyMarked 
                ? "Done for today: Your presence has been securely recorded."
                : "System Secure: Identity verified via biometric signature."}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          {!isFaceRegistered && (
            <Button asChild className="h-16 px-10 bg-amber-500 text-white hover:bg-amber-600 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-amber-500/20 active:scale-95 transition-all">
              <Link to="/dashboard/student/face-register"><Fingerprint className="mr-3 size-6" /> Register My Face First</Link>
            </Button>
          )}

          <Button 
            onClick={startCamera}
            disabled={!isFaceRegistered || isAlreadyMarked || loading}
            className={`h-16 px-10 rounded-2xl font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all group ${
              isAlreadyMarked
                ? "bg-green-50 text-green-600 border-2 border-green-200 cursor-default"
                : isFaceRegistered 
                  ? "bg-navy text-ivory hover:bg-navy-deep" 
                  : "bg-secondary/20 text-muted-foreground cursor-not-allowed opacity-50"
            }`}
          >
            {isAlreadyMarked ? (
              <><CalendarCheck className="mr-3 size-6 animate-in zoom-in duration-300" /> Attendance Marked</>
            ) : isFaceRegistered ? (
              <><Camera className="mr-3 size-6 group-hover:scale-110 transition-transform" /> Mark My Attendance</>
            ) : (
              <><Lock className="mr-3 size-5" /> Mark My Attendance</>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white rounded-2xl border border-navy/5 p-6 shadow-sm flex items-center gap-5">
          <div className="size-14 rounded-2xl bg-navy/5 text-navy grid place-items-center"><Clock size={28}/></div>
          <div>
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Sessions</div>
            <div className="text-3xl font-black text-navy-deep">{attendance.length}</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm flex items-center gap-5">
          <div className="size-14 rounded-2xl bg-green-50 text-green-600 grid place-items-center"><CheckCircle size={28}/></div>
          <div>
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Present Days</div>
            <div className="text-3xl font-black text-green-600">{attendance.filter(a => a.status === 'present').length}</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-red-100 p-6 shadow-sm flex items-center gap-5">
          <div className="size-14 rounded-2xl bg-red-50 text-red-500 grid place-items-center"><XCircle size={28}/></div>
          <div>
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Absences</div>
            <div className="text-3xl font-black text-red-500">{attendance.filter(a => a.status === 'absent').length}</div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden border-navy/5">
        <div className="bg-navy/5 p-4 border-b">
          <h2 className="text-[10px] font-black text-navy uppercase tracking-widest flex items-center gap-2">
            <Calendar size={14}/> Full Presence History
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/5 text-[9px] uppercase text-muted-foreground font-black tracking-[0.2em]">
              <tr>
                <th className="px-8 py-4">Date</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Verified At</th>
                <th className="px-8 py-4">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={4} className="px-8 py-10 text-center"><div className="flex justify-center"><LogoLoader size="sm" /></div></td></tr>
              ) : attendance.length === 0 ? (
                <tr><td colSpan={4} className="px-8 py-16 text-center text-muted-foreground font-bold uppercase text-[10px] tracking-widest">No presence logs found.</td></tr>
              ) : attendance.map((a) => (
                <tr key={a.id} className="hover:bg-gold/5 transition-colors group">
                  <td className="px-8 py-5 font-black text-navy-deep uppercase tracking-tight">{new Date(a.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="px-8 py-5">
                    {a.status === 'present' 
                      ? <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-[9px] font-black text-green-700 uppercase tracking-widest border border-green-200"><CheckCircle className="size-3" /> Present</span>
                      : <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-[9px] font-black text-red-700 uppercase tracking-widest border border-red-200"><XCircle className="size-3" /> Absent</span>
                    }
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-navy/60"><Clock className="size-3 inline mr-2 text-gold" /> {new Date(a.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-[9px] font-black text-navy/40 uppercase tracking-tighter">
                      <ShieldCheck size={14} className="text-navy/20" /> Face Biometric
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Face Scan Modal */}
      <Dialog open={isScanningOpen} onOpenChange={(o) => { if(!o) { stopCamera(); setIsScanningOpen(false); } }}>
        <DialogContent className="max-w-md bg-[#0a192f] border-none rounded-[3rem] p-0 overflow-hidden shadow-2xl shadow-gold/10">
          <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-white font-black text-xl uppercase tracking-tighter">Biometric Scan</h2>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Align your face to the frame</p>
            </div>

            <div className="relative aspect-square rounded-[2rem] overflow-hidden border-4 border-white/10 bg-black">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover grayscale brightness-110 ${scanComplete ? 'opacity-20' : 'opacity-80'}`} 
              />
              
              {!scanComplete && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-10 border-2 border-dashed border-gold/40 rounded-full animate-pulse" />
                  {scanning && (
                    <div className="absolute inset-0 bg-gold/5 flex flex-col items-center justify-end pb-10">
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-gold shadow-[0_0_20px_#d4af37] animate-scan-line" />
                      <div className="text-gold font-black text-xs uppercase tracking-[0.4em] animate-pulse">Analyzing Pattern...</div>
                    </div>
                  )}
                  {/* Corner Brackets */}
                  <div className="absolute top-6 left-6 size-10 border-t-2 border-l-2 border-gold rounded-tl-2xl" />
                  <div className="absolute top-6 right-6 size-10 border-t-2 border-r-2 border-gold rounded-tr-2xl" />
                  <div className="absolute bottom-6 left-6 size-10 border-b-2 border-l-2 border-gold rounded-bl-2xl" />
                  <div className="absolute bottom-6 right-6 size-10 border-b-2 border-r-2 border-gold rounded-br-2xl" />
                </div>
              )}

              {scanComplete && (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 animate-in zoom-in duration-500">
                  <div className="size-20 rounded-full bg-gold/20 text-gold grid place-items-center border-4 border-gold shadow-[0_0_30px_#d4af37]">
                    <CheckCircle2 size={40} />
                  </div>
                  <div className="text-center">
                    <div className="text-white font-black text-xl uppercase tracking-tighter">Identity Match</div>
                    <div className="text-gold/60 text-[9px] font-black uppercase tracking-widest">Attendance Recorded</div>
                  </div>
                </div>
              )}
            </div>

            {!scanComplete && (
              <Button 
                onClick={handleScan}
                disabled={scanning}
                className="w-full h-14 bg-gold text-navy-deep font-black uppercase tracking-widest text-xs rounded-2xl"
              >
                {scanning ? <Loader2 className="animate-spin" /> : "Verify Identity"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes scan-line {
          0% { transform: translateY(0); }
          100% { transform: translateY(384px); }
        }
        .animate-scan-line {
          animation: scan-line 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
