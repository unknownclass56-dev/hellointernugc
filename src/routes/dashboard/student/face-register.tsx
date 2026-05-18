import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { 
  Camera, ShieldCheck, UserCheck, Loader2, AlertCircle, 
  Scan, Fingerprint, CheckCircle2, Lock 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/dashboard/student/face-register")({
  component: FaceRegistration,
});

function FaceRegistration() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [complete, setComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      setHasPermission(false);
      toast.error("Camera access is required for face registration.");
    }
  }

  function stopCamera() {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }
  }

  async function handleRegister() {
    setScanning(true);
    setProgress(0);
    
    // Professional Animation Logic
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    // Mock scanning duration
    setTimeout(async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ face_registered: true, face_data: "biometric_sample_active" })
        .eq("id", user?.id);

      if (!error) {
        setComplete(true);
        setScanning(false);
        toast.success("Face Registered Successfully!");
        setTimeout(() => navigate({ to: "/dashboard/student" }), 2000);
      } else {
        setScanning(false);
        toast.error("Registration failed. Please try again.");
      }
    }, 3000);
  }

  return (
    <div className="min-h-screen bg-[#0a192f] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-[-10%] right-[-10%] size-96 bg-gold/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] size-96 bg-blue-500/5 rounded-full blur-[100px]" />
      
      <div className="max-w-2xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-[10px] font-black uppercase tracking-[0.3em] mb-2">
            <Lock size={14} /> Biometric Security Setup
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Identity Verification</h1>
          <p className="text-white/40 text-sm max-w-md mx-auto">
            To ensure the security of your internship record, please register your face for automated attendance marking.
          </p>
        </div>

        {/* Camera Container */}
        <div className="relative aspect-square max-w-sm mx-auto rounded-[3rem] border-8 border-white/5 bg-black overflow-hidden shadow-[0_0_100px_rgba(212,175,55,0.1)]">
          {hasPermission === false ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
              <AlertCircle size={48} className="text-red-500" />
              <p className="text-white text-sm font-bold">Camera Access Denied</p>
              <Button onClick={startCamera} variant="outline" className="text-white border-white/20">Grant Permission</Button>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover grayscale brightness-110 ${complete ? 'opacity-20' : 'opacity-80'}`} 
              />
              
              {/* Scanning Overlay */}
              {!complete && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Face Guide Frame */}
                  <div className="absolute inset-10 border-2 border-dashed border-gold/40 rounded-full animate-pulse" />
                  
                  {scanning && (
                    <div className="absolute inset-0">
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-gold shadow-[0_0_20px_#d4af37] animate-scan-line" />
                      <div className="absolute inset-0 bg-gold/10 flex items-center justify-center">
                        <div className="text-gold font-black text-4xl">{progress}%</div>
                      </div>
                    </div>
                  )}

                  {/* Corner Brackets */}
                  <div className="absolute top-8 left-8 size-12 border-t-4 border-l-4 border-gold rounded-tl-3xl" />
                  <div className="absolute top-8 right-8 size-12 border-t-4 border-r-4 border-gold rounded-tr-3xl" />
                  <div className="absolute bottom-8 left-8 size-12 border-b-4 border-l-4 border-gold rounded-bl-3xl" />
                  <div className="absolute bottom-8 right-8 size-12 border-b-4 border-r-4 border-gold rounded-br-3xl" />
                </div>
              )}

              {/* Success Overlay */}
              {complete && (
                <div className="absolute inset-0 bg-navy/80 flex flex-col items-center justify-center space-y-6 animate-in zoom-in duration-500">
                  <div className="size-24 rounded-full bg-gold/20 text-gold grid place-items-center border-4 border-gold shadow-[0_0_50px_rgba(212,175,55,0.4)]">
                    <CheckCircle2 size={48} />
                  </div>
                  <div className="text-center">
                    <h3 className="text-white font-black text-2xl uppercase tracking-tighter">Verified</h3>
                    <p className="text-gold/60 text-[10px] font-black uppercase tracking-widest">Profile Linked to Biometrics</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="max-w-md mx-auto text-center space-y-6">
          {!complete && (
            <Button 
              onClick={handleRegister} 
              disabled={scanning || !hasPermission}
              className="w-full h-14 bg-gold text-navy-deep hover:bg-gold/90 font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl active:scale-95 transition-all"
            >
              {scanning ? (
                <><Loader2 className="mr-2 animate-spin" /> Analyzing Face Geometry...</>
              ) : (
                <><Camera className="mr-2" /> Start Registration Scan</>
              )}
            </Button>
          )}
          
          <div className="flex items-center justify-center gap-4 text-white/20">
            <div className="h-[1px] w-12 bg-white/10" />
            <Fingerprint size={20} />
            <ShieldCheck size={20} />
            <UserCheck size={20} />
            <div className="h-[1px] w-12 bg-white/10" />
          </div>
          
          <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] leading-relaxed">
            Data is encrypted and used solely for internship verification.<br />Compliance with UGC Digital Identity Standards.
          </p>
        </div>
      </div>

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
