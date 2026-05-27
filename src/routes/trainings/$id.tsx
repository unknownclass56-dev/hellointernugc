import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Calendar, Clock, Monitor, MapPin, ArrowRight, Loader2, BookOpen, Play, ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/trainings/$id")({
  component: TrainingDetailPage,
});

function TrainingDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [training, setTraining] = useState<any>(null);
  const [lectures, setLectures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTraining();
  }, [id]);

  async function fetchTraining() {
    setLoading(true);
    const { data: t } = await supabase.from("trainings").select("*").eq("id", id).maybeSingle();
    const { data: l } = await supabase.from("training_lectures").select("*").eq("training_id", id).order("created_at");
    setTraining(t);
    setLectures(l || []);
    setLoading(false);
  }

  const formatDate = (d: string) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "TBA";

  function getYouTubeId(url: string): string | null {
    if (!url) return null;
    const match = url.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    return match && match[2].length === 11 ? match[2] : null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin size-10 text-[#0a192f]" />
      </div>
    );
  }

  if (!training) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <BookOpen className="size-16 text-slate-200" />
        <h2 className="text-xl font-black text-slate-400">Training not found</h2>
        <Link to="/trainings" className="text-blue-600 font-bold">Back to Trainings</Link>
      </div>
    );
  }

  const hasEnded = training.end_date && new Date(training.end_date) < new Date();

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <SiteHeader />

      {/* Hero */}
      <div className="bg-[#0a192f] py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#fbbf24] rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto relative">
          <Link to="/trainings" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-xs font-bold uppercase tracking-widest mb-6 transition-colors">
            <ChevronLeft className="size-4" /> Back to Trainings
          </Link>
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Thumbnail */}
            <div className="w-full lg:w-96 aspect-video rounded-2xl overflow-hidden bg-slate-800 flex-shrink-0">
              {training.thumbnail_url ? (
                <img src={training.thumbnail_url} alt={training.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="size-16 text-white/10" />
                </div>
              )}
            </div>
            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${training.type === "online" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"}`}>
                  {training.type === "online" ? <Monitor className="inline size-3 mr-1" /> : <MapPin className="inline size-3 mr-1" />}
                  {training.type}
                </span>
                {training.duration_days && (
                  <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-[#fbbf24]/20 text-[#fbbf24] border border-[#fbbf24]/30">
                    {training.duration_days} Days Program
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-tight mb-4">
                {training.name}
              </h1>
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center gap-2 text-white/60 text-sm font-bold">
                  <Calendar className="size-4 text-[#fbbf24]" />
                  <span>Starts: {formatDate(training.start_date)}</span>
                </div>
                <div className="flex items-center gap-2 text-white/60 text-sm font-bold">
                  <Clock className="size-4 text-[#fbbf24]" />
                  <span>Ends: {formatDate(training.end_date)}</span>
                </div>
              </div>
              {!hasEnded ? (
              <a
                href={`/trainings/${training.id}/register`}
                className="inline-flex items-center gap-2 h-14 px-8 bg-[#fbbf24] hover:bg-amber-400 text-[#0a192f] rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl hover:shadow-2xl group"
              >
                Enroll Now
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </a>
              ) : (
                <div className="inline-flex items-center gap-2 h-12 px-6 bg-white/10 text-white/50 rounded-2xl text-sm font-black uppercase tracking-widest border border-white/10">
                  Registration Closed
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lectures */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-black text-[#0a192f] uppercase tracking-tight mb-8 flex items-center gap-3">
          <BookOpen className="size-6 text-[#fbbf24]" />
          Training Sessions ({lectures.length})
        </h2>

        {lectures.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 py-16 text-center">
            <BookOpen className="size-10 mx-auto text-slate-200 mb-3" />
            <p className="text-slate-400 font-bold">Session schedule will be announced soon.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {lectures.map((lec, idx) => {
              const ytId = getYouTubeId(lec.link || "");
              return (
                <div key={lec.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-5 hover:shadow-md transition-all group">
                  <div className="w-32 aspect-video rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                    {ytId ? (
                      <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt={lec.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="size-6 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-black text-[#fbbf24] uppercase tracking-widest">Session {idx + 1}</span>
                    </div>
                    <h3 className="font-black text-[#0a192f] uppercase tracking-tight text-sm mb-1">{lec.title}</h3>
                    {lec.description && <p className="text-xs text-slate-500 font-medium line-clamp-2">{lec.description}</p>}
                    {lec.start_time && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mt-2">
                        <Calendar className="size-3" />
                        {new Date(lec.start_time).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        {!hasEnded && (
          <div className="mt-12 bg-gradient-to-r from-[#0a192f] to-[#1e40af] rounded-3xl p-10 text-center">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-3">Ready to Join?</h2>
            <p className="text-white/60 text-sm mb-6">Enroll now and get your MSME Approved certificate on completion.</p>
            <a
              href={`/trainings/${training.id}/register`}
              className="inline-flex items-center gap-2 h-12 px-8 bg-[#fbbf24] text-[#0a192f] rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-amber-400 transition-all shadow-xl group"
            >
              Register Now <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
