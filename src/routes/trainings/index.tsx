import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Calendar, Clock, Monitor, MapPin, Users, ArrowRight, Search, Loader2, BookOpen, Award } from "lucide-react";

export const Route = createFileRoute("/trainings/")({
  component: TrainingsPage,
});

function TrainingsPage() {
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchTrainings();
  }, []);

  async function fetchTrainings() {
    setLoading(true);
    const { data } = await supabase
      .from("trainings")
      .select("*")
      .order("created_at", { ascending: false });
    setTrainings(data || []);
    setLoading(false);
  }

  const filtered = trainings.filter((t) => {
    const matchSearch = t.name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || t.type === filter;
    return matchSearch && matchFilter;
  });

  const formatDate = (d: string) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "TBA";

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <SiteHeader />

      {/* Hero Banner */}
      <div className="relative bg-[#0a192f] overflow-hidden py-20 px-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-20 w-72 h-72 bg-[#fbbf24] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        </div>
        <div className="relative container mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
            <Award className="size-4 text-[#fbbf24]" />
            <span className="text-white/80 text-xs font-bold tracking-widest uppercase">MSME Approved · Industry Certified</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
            Professional <span className="text-[#fbbf24]">Trainings</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto mb-8 font-medium">
            Accelerate your career with our industry-leading training programs. Online & Offline modes available.
          </p>
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search trainings..."
                className="w-full h-12 pl-11 pr-4 rounded-2xl border-2 border-white/10 bg-white/10 text-white placeholder:text-white/40 font-bold text-sm outline-none focus:border-[#fbbf24] transition-colors"
              />
            </div>
            <div className="flex gap-2">
              {["all", "online", "offline"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`h-12 px-5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                    filter === f
                      ? "bg-[#fbbf24] text-[#0a192f] shadow-lg"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Training Cards */}
      <div className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin size-10 text-[#0a192f]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="size-16 mx-auto text-slate-200 mb-4" />
            <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">No trainings found</h3>
            <p className="text-slate-400 text-sm mt-2">Check back soon for new training programs.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((training) => (
              <TrainingCard key={training.id} training={training} formatDate={formatDate} />
            ))}
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}

function TrainingCard({ training, formatDate }: { training: any; formatDate: (d: string) => string }) {
  const isOnline = training.type === "online";
  const hasEnded = training.end_date && new Date(training.end_date) < new Date();

  return (
    <div className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#fbbf24]/30 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-[#0a192f] to-slate-800 overflow-hidden">
        {training.thumbnail_url ? (
          <img
            src={training.thumbnail_url}
            alt={training.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="size-16 text-white/10" />
          </div>
        )}
        {/* Badge */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span
            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
              isOnline
                ? "bg-blue-500/90 text-white border-blue-400"
                : "bg-amber-500/90 text-white border-amber-400"
            }`}
          >
            {isOnline ? <Monitor className="inline size-2.5 mr-1" /> : <MapPin className="inline size-2.5 mr-1" />}
            {training.type}
          </span>
          {training.duration_days && (
            <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-[#fbbf24]/90 text-[#0a192f] border border-[#fbbf24]">
              {training.duration_days} Days
            </span>
          )}
        </div>
        {hasEnded && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-black uppercase tracking-widest text-sm px-4 py-2 border border-white/30 rounded-xl">
              Completed
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-black text-[#0a192f] uppercase tracking-tight leading-tight mb-3 group-hover:text-[#1e40af] transition-colors">
          {training.name}
        </h3>

        <div className="space-y-2 mb-5 flex-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Calendar className="size-3.5 text-[#fbbf24]" />
            <span>Start: {formatDate(training.start_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Clock className="size-3.5 text-[#fbbf24]" />
            <span>End: {formatDate(training.end_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Users className="size-3.5 text-[#fbbf24]" />
            <span>Certification on Completion</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            to="/trainings/$id"
            params={{ id: training.id }}
            className="flex-1 flex items-center justify-center gap-2 h-11 bg-[#0a192f] hover:bg-[#1e40af] text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-xl group/btn"
          >
            View Details
            <ArrowRight className="size-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
          {!hasEnded && (
            <a
              href={`/trainings/${training.id}/register`}
              className="h-11 px-5 flex items-center justify-center bg-[#fbbf24] hover:bg-amber-400 text-[#0a192f] rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg"
            >
              Enroll
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
