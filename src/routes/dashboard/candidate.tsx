import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, User, BookOpen, AlertCircle, Video, Play, ExternalLink, Calendar } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

export const Route = createFileRoute("/dashboard/candidate")({
  component: CandidateDashboard,
});

function CandidateDashboard() {
  const search = useSearch({ from: "/dashboard/candidate" }) as any;
  const tab = search.tab || "overview";
  const [profile, setProfile] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const profileRes = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (profileRes.data) setProfile(profileRes.data);

    const enrollmentsRes = await supabase.from("job_campus_enrollments").select("*, job_campus_postings(*)").eq("candidate_id", user.id);
    
    if (enrollmentsRes.data) {
      setEnrollments(enrollmentsRes.data);
      
      const postingIds = enrollmentsRes.data.map(e => e.posting_id);
      
      if (postingIds.length > 0) {
        const [tRes, vRes] = await Promise.all([
          supabase.from("job_campus_candidate_trainings").select("*").overlaps("target_postings", postingIds).order("created_at", { ascending: false }),
          supabase.from("job_campus_candidate_vacancies").select("*").overlaps("target_postings", postingIds).order("created_at", { ascending: false })
        ]);
        
        if (tRes.data) setTrainings(tRes.data);
        if (vRes.data) setVacancies(vRes.data);
      }
    }

    setLoading(false);
  };

  if (loading) {
    return <div className="p-8 text-center text-navy-light">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-navy-deep">Candidate Dashboard</h1>
      </div>

      {tab === "overview" && (
        <div className="space-y-8">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-navy shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Enrolled Programs</CardTitle>
                <Briefcase className="h-4 w-4 text-gold" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{enrollments.length}</div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-gold shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Targeted Vacancies</CardTitle>
                <AlertCircle className="h-4 w-4 text-gold" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vacancies.length}</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assigned Trainings</CardTitle>
                <BookOpen className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{trainings.length}</div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-xl font-bold text-navy-deep mb-4 flex items-center gap-2">
              <Briefcase className="text-gold" /> My Enrolled Programs
            </h2>
            {enrollments.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Enrollments</AlertTitle>
                <AlertDescription>You have not been enrolled in any Job Campus programs yet.</AlertDescription>
              </Alert>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments.map((enc) => (
                  <Card key={enc.id} className="shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-navy">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg leading-tight text-navy">
                        {enc.job_campus_postings?.title || "Unknown Program"}
                      </CardTitle>
                      {enc.job_campus_postings?.company && (
                        <CardDescription className="text-sm text-gray-500 font-medium">
                          {enc.job_campus_postings.company}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Status</span>
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                          enc.status === "enrolled" ? "bg-green-100 text-green-700" :
                          enc.status === "completed" ? "bg-blue-100 text-blue-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {enc.status || "Pending"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-gray-500">Enrolled On</span>
                        <span className="font-medium">
                          {new Date(enc.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "profile" && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="text-gold"/> Profile Details</CardTitle>
            <CardDescription>Your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{profile?.full_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{profile?.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{profile?.phone || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "vacancies" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-navy-deep flex items-center gap-2"><Briefcase className="text-gold"/> Exclusive Job Vacancies</h2>
          <p className="text-sm text-gray-500">These job opportunities are tailored specifically for the programs you are enrolled in.</p>
          
          {vacancies.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Vacancies Yet</AlertTitle>
              <AlertDescription>There are currently no job vacancies matching your enrolled programs.</AlertDescription>
            </Alert>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {vacancies.map(job => (
                <Card key={job.id} className="hover:border-gold transition-all duration-300 shadow-sm hover:shadow-md flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-xl text-navy">{job.job_title}</CardTitle>
                    <div className="flex gap-4 text-sm text-gray-600 font-medium pt-2">
                      <span className="bg-green-50 text-green-700 px-2 py-1 rounded">{job.salary || "Not Specified"}</span>
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">{job.experience || "Not Specified"}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col">
                    <div className="mb-4 text-sm text-gray-600 line-clamp-4">
                       {job.description}
                    </div>
                    
                    {(job.posting_date || job.end_date) && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
                        <Calendar className="size-3" />
                        {job.posting_date ? new Date(job.posting_date).toLocaleDateString() : "N/A"} - {job.end_date ? new Date(job.end_date).toLocaleDateString() : "N/A"}
                      </div>
                    )}

                    <div className="mt-auto">
                      <Button asChild className="w-full bg-gold hover:bg-gold-light text-navy-deep font-bold">
                        <a href={job.apply_link} target="_blank" rel="noreferrer">
                          Apply Now <ExternalLink className="size-4 ml-2" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "training" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-navy-deep flex items-center gap-2"><BookOpen className="text-gold"/> My Assigned Trainings</h2>
          <p className="text-sm text-gray-500">Access exclusive training material assigned to your enrolled programs.</p>

          {trainings.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Trainings Assigned</AlertTitle>
              <AlertDescription>You currently do not have any training modules assigned to you.</AlertDescription>
            </Alert>
          ) : (
             <div className="grid md:grid-cols-2 gap-6">
               {trainings.map(t => (
                 <Card key={t.id} className="shadow-sm hover:shadow-md transition-all border-t-4 border-t-navy">
                   <CardHeader className="pb-3">
                     <div className="flex justify-between items-start">
                        <CardTitle className="text-lg pr-4">{t.title}</CardTitle>
                        {t.training_type === 'youtube' && <Play className="size-5 text-red-500 flex-shrink-0" />}
                        {t.training_type === 'meet' && <Video className="size-5 text-green-500 flex-shrink-0" />}
                     </div>
                     <CardDescription className="capitalize font-bold text-navy/70">
                        {t.mode} • {t.training_type}
                     </CardDescription>
                   </CardHeader>
                   <CardContent>
                      {t.link ? (
                        <Button asChild variant="outline" className="w-full mt-2 border-navy text-navy hover:bg-navy hover:text-white">
                          <a href={t.link} target="_blank" rel="noreferrer">
                             {t.training_type === 'youtube' ? 'Watch Session' : t.training_type === 'meet' ? 'Join Meeting' : 'Open Link'}
                          </a>
                        </Button>
                      ) : (
                        <Button disabled variant="outline" className="w-full mt-2">No Link Provided</Button>
                      )}
                   </CardContent>
                 </Card>
               ))}
             </div>
          )}
        </div>
      )}

    </div>
  );
}
