import { createFileRoute } from "@tanstack/react-router";
import { Play, FileVideo, Calendar, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/student/lectures")({
  component: StudentLectures,
});

function StudentLectures() {
  const [lectures, setLectures] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("lectures").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setLectures(data || []));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy-deep">Online Lectures</h1>
        <p className="text-muted-foreground">Access your training sessions and recorded webinars.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {lectures.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
            <FileVideo className="mx-auto size-12 opacity-20 mb-4" />
            No lectures available at the moment.
          </div>
        ) : lectures.map((l) => (
          <div key={l.id} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-md">
            <div className="relative aspect-video bg-navy-deep/10 flex items-center justify-center">
              <Play className="size-10 text-navy/40 group-hover:scale-110 transition-transform" />
              <div className="absolute top-3 right-3 rounded-md bg-navy/80 px-2 py-1 text-[10px] font-bold text-white uppercase">Live Recording</div>
            </div>
            <div className="p-5">
              <h3 className="font-display font-bold text-navy-deep group-hover:text-navy transition-colors">{l.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{l.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Calendar className="size-3" /> {new Date(l.created_at).toLocaleDateString()}
                </div>
                <Button size="sm" variant="outline" className="h-8 text-xs font-bold" onClick={() => window.open(l.link, '_blank')}>
                  WATCH NOW <ExternalLink className="ml-1 size-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
