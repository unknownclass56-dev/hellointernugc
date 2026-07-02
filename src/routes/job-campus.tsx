import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PageShell } from "@/components/PageShell";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Briefcase, ArrowRight, Loader2, MapPin, DollarSign, Calendar } from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

export const Route = createFileRoute("/job-campus")({
  component: JobCampusPage,
});

function JobCampusPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      const { data } = await supabase
        .from("job_campus_postings")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setJobs(data);
      setLoading(false);
    }
    fetchJobs();
  }, []);

  return (
    <PageShell>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0a192f] to-[#112240] pt-24 pb-32 text-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container relative z-10 px-4">
          <h1 className="text-4xl md:text-6xl font-display font-black text-white mb-6 uppercase tracking-tight">
            TechLaunchpad <span className="text-gold">Job Campus</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            Exclusive opportunities. Connect with top-tier companies and kickstart your professional career today.
          </p>
        </div>
      </section>

      {/* Jobs Listing */}
      <section className="py-20 bg-slate-50 min-h-[50vh]">
        <div className="container px-4 max-w-6xl mx-auto">
          <div className="mb-12 flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-display font-black text-navy-deep flex items-center gap-3">
              <Briefcase className="text-gold size-8" />
              Latest Opportunities
            </h2>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-widest bg-white px-4 py-2 rounded-full shadow-sm">
              {jobs.length} Jobs Available
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin size-12 text-gold" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
              <Briefcase className="size-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-400">No jobs posted yet.</h3>
              <p className="text-slate-500 mt-2">Check back later for new opportunities!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300 border border-slate-100 flex flex-col group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-navy/5 text-navy px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                      {job.job_id}
                    </div>
                    <div className="bg-green-50 text-green-600 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                      <DollarSign size={12} /> {job.salary}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-black text-navy-deep mb-3 line-clamp-2">
                    {job.title}
                  </h3>
                  
                  <div className="text-sm text-slate-500 mb-6 flex-grow">
                    <MarkdownRenderer content={job.description} />
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      <Calendar size={14} /> {new Date(job.created_at).toLocaleDateString()}
                    </div>
                    <Button className="bg-gold text-navy-deep hover:bg-gold/90 hover:scale-105 transition-all font-bold text-xs uppercase rounded-xl h-9 px-4">
                      Apply Now <ArrowRight size={14} className="ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
