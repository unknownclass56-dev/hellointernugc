import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import {
  BookOpen, Calendar, Clock, Play, CheckCircle2, Award, Loader2,
  Search, Monitor, MapPin, Lock, ArrowRight, ChevronDown, ChevronUp
} from "lucide-react";

export const Route = createFileRoute("/dashboard/student/trainings")({
  component: StudentTrainingsPage,
});

function StudentTrainingsPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [allTrainings, setAllTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedTraining, setExpandedTraining] = useState<string | null>(null);
  const [lectures, setLectures] = useState<Record<string, any[]>>({});
  const [tab, setTab] = useState<"enrolled" | "browse">("enrolled");

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  async function fetchData() {
    setLoading(true);
    const { data: enr } = await supabase
      .from("training_enrollments")
      .select("*, trainings(*)")
      .eq("student_id", user!.id)
      .order("created_at", { ascending: false });
    const { data: all } = await supabase
      .from("trainings")
      .select("*")
      .order("created_at", { ascending: false });
    setEnrollments(enr || []);
    setAllTrainings(all || []);
    setLoading(false);
  }

  async function fetchLectures(trainingId: string) {
    if (lectures[trainingId]) return;
    const { data } = await supabase
      .from("training_lectures")
      .select("*")
      .eq("training_id", trainingId)
      .order("created_at");
    setLectures(prev => ({ ...prev, [trainingId]: data || [] }));
  }

  function toggleExpand(trainingId: string) {
    if (expandedTraining === trainingId) {
      setExpandedTraining(null);
    } else {
      setExpandedTraining(trainingId);
      fetchLectures(trainingId);
    }
  }

  function getYouTubeId(url: string) {
    const match = url?.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    return match && match[2].length === 11 ? match[2] : null;
  }

  const formatDate = (d: string) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "TBA";

  const enrolledIds = new Set(enrollments.map(e => e.training_id));

  const filteredEnrollments = enrollments.filter(e =>
    e.trainings?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const browsable = allTrainings.filter(t =>
    !enrolledIds.has(t.id) &&
    t.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin size-10 text-[#0a192f]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-black text-[#fbbf24] uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <BookOpen className="size-3" /> Training Center
          </div>
          <h1 className="text-3xl font-black text-[#0a192f] uppercase tracking-tighter">My Trainings</h1>
        </div>
        <Link
          to="/trainings"
          className="inline-flex items-center gap-2 h-10 px-5 bg-[#0a192f] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#1e40af] transition-all shadow-lg"
        >
          Browse More <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search trainings..."
          className="w-full h-11 pl-11 pr-4 rounded-2xl border-2 border-slate-200 bg-white font-bold text-sm outline-none focus:border-[#0a192f] transition-colors"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
        {(["enrolled", "browse"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`h-9 px-5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              tab === t ? "bg-white text-[#0a192f] shadow-sm" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {t === "enrolled" ? `My Trainings (${enrollments.length})` : `Browse (${allTrainings.length})`}
          </button>
        ))}
      </div>

      {/* Enrolled Trainings */}
      {tab === "enrolled" && (
        <div className="space-y-4">
          {filteredEnrollments.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 py-16 text-center">
              <BookOpen className="size-12 mx-auto text-slate-200 mb-3" />
              <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest mb-2">No Trainings Yet</h3>
              <p className="text-slate-400 text-sm mb-5">Browse and enroll in training programs to get started.</p>
              <button
                onClick={() => setTab("browse")}
                className="inline-flex items-center gap-2 h-10 px-6 bg-[#0a192f] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#1e40af] transition-all"
              >
                Browse Trainings
              </button>
            </div>
          ) : (
            filteredEnrollments.map(enrollment => {
              const t = enrollment.trainings;
              const isCompleted = enrollment.status === "completed";
              const isExpanded = expandedTraining === t?.id;
              const trainingLectures = lectures[t?.id] || [];
              const hasEnded = t?.end_date && new Date(t.end_date) < new Date();

              return (
                <div key={enrollment.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  {/* Card Header */}
                  <div
                    className="flex items-center gap-5 p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => t?.id && toggleExpand(t.id)}
                  >
                    {/* Thumbnail */}
                    <div className="w-20 aspect-video rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                      {t?.thumbnail_url ? (
                        <img src={t.thumbnail_url} alt={t.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="size-6 text-slate-300" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          t?.type === "online" ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"
                        }`}>
                          {t?.type}
                        </span>
                        {t?.duration_days && (
                          <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-slate-100 text-slate-600">
                            {t.duration_days} Days
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          isCompleted ? "bg-green-100 text-green-700" : "bg-blue-50 text-blue-600"
                        }`}>
                          {isCompleted ? "✓ Completed" : "Enrolled"}
                        </span>
                      </div>
                      <h3 className="font-black text-[#0a192f] uppercase tracking-tight text-sm truncate">{t?.name}</h3>
                      <div className="flex flex-wrap gap-4 mt-1">
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Calendar className="size-3" /> {formatDate(t?.start_date)} – {formatDate(t?.end_date)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isCompleted && (
                        <Link
                          to="/dashboard/student/certificate"
                          className="h-8 px-4 flex items-center gap-1.5 bg-[#fbbf24] text-[#0a192f] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all"
                          onClick={e => e.stopPropagation()}
                        >
                          <Award className="size-3" /> Certificate
                        </Link>
                      )}
                      <div className="size-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                        {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Lectures */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 p-5 space-y-3 bg-slate-50/50">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
                        Sessions ({trainingLectures.length})
                      </h4>
                      {trainingLectures.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                          <Clock className="size-8 mx-auto mb-2 text-slate-200" />
                          <p className="text-xs font-bold">No sessions added yet. Check back soon.</p>
                        </div>
                      ) : (
                        trainingLectures.map((lec, idx) => {
                          const ytId = getYouTubeId(lec.link || "");
                          const sessionEnded = lec.start_time && new Date(lec.start_time) < new Date();
                          return (
                            <div key={lec.id} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-start gap-4">
                              {/* Thumbnail/Index */}
                              <div className="w-24 aspect-video rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 relative">
                                {ytId ? (
                                  <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt={lec.title} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-[#0a192f]/5">
                                    <span className="text-lg font-black text-slate-300">#{idx + 1}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-black text-[#fbbf24] uppercase tracking-widest mb-0.5">Session {idx + 1}</p>
                                <h5 className="font-black text-[#0a192f] text-sm uppercase tracking-tight leading-tight">{lec.title}</h5>
                                {lec.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{lec.description}</p>}
                                {lec.start_time && (
                                  <p className="text-[9px] font-bold text-slate-400 mt-1.5 flex items-center gap-1">
                                    <Calendar className="size-3" />
                                    {new Date(lec.start_time).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                                  </p>
                                )}
                              </div>
                              <div className="flex-shrink-0">
                                {lec.link && sessionEnded ? (
                                  <a
                                    href={lec.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 h-8 px-3 bg-[#0a192f] text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-[#1e40af] transition-all"
                                  >
                                    <Play className="size-3" /> Watch
                                  </a>
                                ) : (
                                  <div className="inline-flex items-center gap-1.5 h-8 px-3 bg-slate-100 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                    <Lock className="size-3" /> Upcoming
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Browse Tab */}
      {tab === "browse" && (
        <div className="grid gap-5 md:grid-cols-2">
          {browsable.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl border border-dashed border-slate-200 py-16 text-center">
              <CheckCircle2 className="size-10 mx-auto text-green-300 mb-3" />
              <p className="font-black text-slate-400 uppercase tracking-widest text-sm">You are enrolled in all available trainings!</p>
            </div>
          ) : (
            browsable.map(t => (
              <div key={t.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all p-5 flex gap-4">
                <div className="w-20 aspect-video rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                  {t.thumbnail_url ? (
                    <img src={t.thumbnail_url} alt={t.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="size-5 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex gap-1.5 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${t.type === "online" ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"}`}>
                      {t.type}
                    </span>
                    {t.duration_days && (
                      <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-slate-100 text-slate-600">{t.duration_days}d</span>
                    )}
                  </div>
                  <h3 className="font-black text-[#0a192f] uppercase tracking-tight text-sm leading-tight truncate">{t.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">{formatDate(t.start_date)}</p>
                  <Link
                    to="/trainings/$id/register"
                    params={{ id: t.id }}
                    className="inline-flex items-center gap-1.5 h-8 px-3 mt-2 bg-[#0a192f] text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-[#1e40af] transition-all"
                  >
                    Enroll Now
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
