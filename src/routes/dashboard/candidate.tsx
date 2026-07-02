import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, User, BookOpen, AlertCircle } from "lucide-react";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [profileRes, enrollmentsRes, vacanciesRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("job_campus_enrollments").select("*, job_campus_postings(*)").eq("candidate_id", user.id),
      supabase.from("job_campus_postings").select("*").order("created_at", { ascending: false })
    ]);

    if (profileRes.data) setProfile(profileRes.data);
    if (enrollmentsRes.data) setEnrollments(enrollmentsRes.data);
    if (vacanciesRes.data) setVacancies(vacanciesRes.data);

    setLoading(false);
  };

  if (loading) {
    return <div className="p-8 text-center text-navy-light">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-navy-deep">Candidate Dashboard</h1>
      </div>

      {tab === "overview" && (
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applied Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrollments.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Vacancies</CardTitle>
              <AlertCircle className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vacancies.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "profile" && (
        <Card>
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
          <h2 className="text-xl font-bold text-navy-deep flex items-center gap-2"><Briefcase className="text-gold"/> Job Vacancies</h2>
          {vacancies.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Vacancies</AlertTitle>
              <AlertDescription>There are currently no job vacancies available.</AlertDescription>
            </Alert>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {vacancies.map(job => (
                <Card key={job.id} className="hover:border-gold/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <CardDescription>Job ID: {job.job_id}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 text-sm max-h-[300px] overflow-y-auto">
                      <MarkdownRenderer content={job.description} />
                    </div>
                    <div className="flex justify-between text-sm mb-4">
                      <span className="font-medium text-green-600">{job.salary}</span>
                      <span className="text-gray-500">Fee: ₹{job.training_fee}</span>
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
          <h2 className="text-xl font-bold text-navy-deep flex items-center gap-2"><BookOpen className="text-gold"/> My Enrolled Trainings</h2>
          {enrollments.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Enrollments</AlertTitle>
              <AlertDescription>You have not enrolled in any job training yet.</AlertDescription>
            </Alert>
          ) : (
             <div className="grid md:grid-cols-2 gap-4">
               {enrollments.map(enc => (
                 <Card key={enc.id}>
                   <CardHeader>
                     <CardTitle className="text-lg">{enc.job_campus_postings?.title}</CardTitle>
                     <CardDescription>Status: <span className="uppercase font-bold text-navy-light">{enc.status}</span></CardDescription>
                   </CardHeader>
                   <CardContent>
                      <p className="text-sm text-gray-600 mb-2">{enc.job_campus_postings?.description}</p>
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
