import { createFileRoute } from "@tanstack/react-router";
import { Play, FileVideo, Calendar, ExternalLink, FileText, Link2, Youtube, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/student/lectures")({
  component: StudentLectures,
});

function StudentLectures() {
  const [lectures, setLectures] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLectures();
  }, []);

  async function fetchLectures() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prof } = await supabase
        .from("profiles")
        .select("program")
        .eq("id", user.id)
        .maybeSingle();
      
      setProfile(prof);

      const { data: lecturesData } = await supabase
        .from("lectures")
        .select("*")
        .order("created_at", { ascending: false });

      const studentProgram = (prof?.program || "").trim().toLowerCase();

      const filtered = (lecturesData || []).filter(l => {
        try {
          const parsed = JSON.parse(l.description);
          const lectureDomain = (parsed.domain || "").trim().toLowerCase();
          return lectureDomain === studentProgram || lectureDomain === "general" || lectureDomain === "" || lectureDomain === "all";
        } catch (e) {
          // If not JSON format, show by default to everyone
          return true;
        }
      });

      setLectures(filtered);
    } catch (error) {
      console.error("Error loading student lectures:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy-deep">Online Lectures</h1>
        {profile?.program && (
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[10px] font-black bg-gold/10 border border-gold/20 text-gold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Enrolled: {profile.program}
            </span>
          </div>
        )}
        <p className="text-muted-foreground mt-2">Access your training sessions and recorded webinars.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto mb-2"></div>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Loading Lectures...</p>
          </div>
        ) : lectures.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
            <FileVideo className="mx-auto size-12 opacity-20 mb-4" />
            No lectures available for your domain ({profile?.program || "None"}) at the moment.
          </div>
        ) : lectures.map((l) => {
          let parsedDesc = l.description;
          let domainName = "";
          let modeName = "";
          let pdfUrl = "";
          let materialLink = "";
          
          try {
            const parsed = JSON.parse(l.description);
            parsedDesc = parsed.description || "";
            domainName = parsed.domain || "";
            modeName = parsed.mode || "";
            pdfUrl = parsed.material_pdf || "";
            materialLink = parsed.material_link || "";
          } catch (e) {
            // Fallback for older non-JSON entries
          }

          return (
            <div key={l.id} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-md flex flex-col h-full justify-between">
              <div>
                <div className="relative aspect-video bg-navy-deep/10 flex items-center justify-center">
                  {modeName === "YouTube" ? (
                    <Youtube className="size-12 text-red-500 group-hover:scale-110 transition-transform" />
                  ) : modeName === "Google Meet" ? (
                    <Video className="size-12 text-blue-500 group-hover:scale-110 transition-transform" />
                  ) : (
                    <Play className="size-10 text-navy/40 group-hover:scale-110 transition-transform" />
                  )}
                  
                  {modeName && (
                    <div className="absolute top-3 right-3 rounded-md bg-navy/80 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                      {modeName}
                    </div>
                  )}

                  {domainName && (
                    <div className="absolute bottom-3 left-3 rounded-md bg-gold px-2 py-0.5 text-[9px] font-black text-navy-deep uppercase tracking-wider">
                      {domainName}
                    </div>
                  )}
                </div>
                
                <div className="p-5 space-y-2">
                  <h3 className="font-display font-bold text-navy-deep group-hover:text-navy transition-colors">{l.title}</h3>
                  {parsedDesc && <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{parsedDesc}</p>}
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-50 mt-4 space-y-4">
                {/* Materials Row */}
                {(pdfUrl || materialLink) && (
                  <div className="flex flex-wrap gap-2 pt-3">
                    {pdfUrl && (
                      <Button size="sm" variant="outline" className="h-7 text-[10px] font-black bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border-emerald-200/60 px-2.5 rounded-lg flex items-center gap-1.5" onClick={() => window.open(pdfUrl, '_blank')}>
                        <FileText className="size-3" /> PDF MATERIAL
                      </Button>
                    )}
                    {materialLink && (
                      <Button size="sm" variant="outline" className="h-7 text-[10px] font-black bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 border-indigo-200/60 px-2.5 rounded-lg flex items-center gap-1.5" onClick={() => window.open(materialLink, '_blank')}>
                        <Link2 className="size-3" /> RESOURCES
                      </Button>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
                    <Calendar className="size-3" /> {new Date(l.created_at).toLocaleDateString()}
                  </div>
                  <Button size="sm" className="bg-navy text-white hover:bg-navy-deep h-8 text-xs font-bold px-4 rounded-xl flex items-center gap-1.5" onClick={() => window.open(l.link, '_blank')}>
                    WATCH NOW <ExternalLink className="size-3" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
