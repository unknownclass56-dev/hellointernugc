import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import {
  BookOpen, Calendar, Clock, Play, CheckCircle2, Award, Loader2,
  User, Mail, Phone, MapPin, GraduationCap, Building2, FileText,
  Edit3, Save, X, Lock, ChevronDown, ChevronUp, Upload,
  LayoutDashboard, BookMarked, ShieldCheck, ClipboardList, ArrowRight,
  Star, Badge, Layers, Bell
} from "lucide-react";

export const Route = createFileRoute("/dashboard/student/trainings")({
  component: TrainingStudentDashboard,
});

function TrainingStudentDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"learning" | "profile" | "certificate" | "assignments">("learning");
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTraining, setExpandedTraining] = useState<string | null>(null);
  const [lectures, setLectures] = useState<Record<string, any[]>>({});

  // Profile edit state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Assignment upload state
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [assignTitle, setAssignTitle] = useState("");
  const [assignDesc, setAssignDesc] = useState("");
  const [assignFile, setAssignFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.id) fetchAll();
  }, [user?.id]);

  async function fetchAll() {
    setLoading(true);
    const [enrRes, profRes, asnRes] = await Promise.all([
      supabase.from("training_enrollments").select("*, trainings(*)").eq("student_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle(),
      supabase.from("training_assignments").select("*, trainings(name)").eq("student_id", user!.id).order("created_at", { ascending: false }),
    ]);
    setEnrollments(enrRes.data || []);
    setProfile(profRes.data);
    setEditForm(profRes.data || {});
    setAssignments(asnRes.data || []);
    setLoading(false);
  }

  async function fetchLectures(trainingId: string) {
    if (lectures[trainingId]) return;
    const { data } = await supabase.from("training_lectures").select("*").eq("training_id", trainingId).order("created_at");
    setLectures(prev => ({ ...prev, [trainingId]: data || [] }));
  }

  function toggleExpand(tid: string) {
    if (expandedTraining === tid) { setExpandedTraining(null); }
    else { setExpandedTraining(tid); fetchLectures(tid); }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg("");
    const { error } = await supabase.from("profiles").update({
      full_name: editForm.full_name,
      contact_number: editForm.contact_number,
      state: editForm.state,
      university_name: editForm.university_name,
      college_name: editForm.college_name,
      university_roll_number: editForm.university_roll_number,
      department: editForm.department,
    }).eq("id", user!.id);
    if (error) { setProfileMsg("Error: " + error.message); }
    else {
      setProfile({ ...profile, ...editForm });
      setEditing(false);
      setProfileMsg("Profile updated successfully!");
    }
    setSavingProfile(false);
    setTimeout(() => setProfileMsg(""), 3000);
  }

  async function submitAssignment(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadingFor || !assignTitle) return;
    // Prevent duplicate submissions for the same training
    const dupCheck = await supabase.from('training_assignments')
      .select('id')
      .eq('student_id', user!.id)
      .eq('training_id', uploadingFor)
      .maybeSingle();
    if (dupCheck.data) {
      setProfileMsg('You have already submitted an assignment for this training.');
      setSubmitting(false);
      return;
    }
    setSubmitting(true);
    let fileUrl = "";
    if (assignFile) {
      const ext = assignFile.name.split('.').pop();
      const path = `training-assignments/${user!.id}/${Date.now()}.${ext}`;
      const { data: upData } = await supabase.storage.from('assignments').upload(path, assignFile);
      if (upData) {
        const { data: urlData } = supabase.storage.from('assignments').getPublicUrl(path);
        fileUrl = urlData.publicUrl;
      }
    }
    await supabase.from('training_assignments').insert([
      {
        student_id: user!.id,
        training_id: uploadingFor,
        title: assignTitle,
        description: assignDesc,
        file_url: fileUrl,
        status: 'submitted',
        created_at: new Date().toISOString(),
      },
    ]);
    setUploadingFor(null); setAssignTitle(''); setAssignDesc(''); setAssignFile(null);
    setSubmitting(false);
    fetchAll();
  }

  function getYouTubeId(url: string) {
    const match = url?.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    return match && match[2].length === 11 ? match[2] : null;
  }

  const fmt = (d: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "TBA";

  const INDIAN_STATES = [
    "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
    "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
    "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
    "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
    "Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Chandigarh","Puducherry"
  ];

  const navItems = [
    { key: "learning", label: "My Learning", icon: BookMarked },
    { key: "certificate", label: "Certificate", icon: ShieldCheck },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin size-10 text-[#0a192f]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0a192f] via-[#1e3a5f] to-[#1e40af] px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-black text-[#fbbf24] uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <BookOpen className="size-3" /> Training Portal
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
              Welcome, {profile?.full_name?.split(" ")[0] || "Student"}!
            </h1>
            <p className="text-white/50 text-xs font-medium mt-0.5">
              {enrollments.length} Training{enrollments.length !== 1 ? "s" : ""} Enrolled
            </p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white/10 rounded-2xl px-5 py-3 text-center">
              <div className="text-2xl font-black text-[#fbbf24]">{enrollments.length}</div>
              <div className="text-[9px] text-white/60 font-black uppercase tracking-widest">Enrolled</div>
            </div>
            <div className="bg-white/10 rounded-2xl px-5 py-3 text-center">
              <div className="text-2xl font-black text-green-400">{enrollments.filter(e => e.status === "completed").length}</div>
              <div className="text-[9px] text-white/60 font-black uppercase tracking-widest">Completed</div>
            </div>
            <div className="bg-white/10 rounded-2xl px-5 py-3 text-center">
              <div className="text-2xl font-black text-white">{assignments.length}</div>
              <div className="text-[9px] text-white/60 font-black uppercase tracking-widest">Assignments</div>
            </div>
          </div>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 flex gap-1 overflow-x-auto">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key as any)}
              className={`flex items-center gap-2 px-5 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 whitespace-nowrap transition-all ${
                tab === key
                  ? "border-[#0a192f] text-[#0a192f]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon className="size-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* ======= LEARNING TAB ======= */}
        {tab === "learning" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-[#0a192f] uppercase tracking-tight">My Training Programs</h2>
              <Link to="/trainings" className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#0a192f] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#1e40af] transition-all">
                Browse More <ArrowRight className="size-3" />
              </Link>
            </div>

            {enrollments.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-200 py-20 text-center">
                <BookOpen className="size-14 mx-auto text-slate-200 mb-4" />
                <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest mb-2">No Trainings Yet</h3>
                <p className="text-slate-400 text-sm mb-6">Enroll in a training program to start learning.</p>
                <Link to="/trainings" className="inline-flex items-center gap-2 h-10 px-6 bg-[#0a192f] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#1e40af] transition-all">
                  Browse Trainings
                </Link>
              </div>
            ) : (
              enrollments.map(enr => {
                const t = enr.trainings;
                const isCompleted = enr.status === "completed";
                const isExpanded = expandedTraining === t?.id;
                const trainingLectures = lectures[t?.id] || [];
                return (
                  <div key={enr.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* Card Header */}
                    <div
                      className="flex items-center gap-5 p-5 cursor-pointer hover:bg-slate-50/70 transition-colors"
                      onClick={() => t?.id && toggleExpand(t.id)}
                    >
                      <div className="w-24 aspect-video rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                        {t?.thumbnail_url
                          ? <img src={t.thumbnail_url} alt={t.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><BookOpen className="size-7 text-slate-300" /></div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-2 mb-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${t?.type === "online" ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"}`}>{t?.type}</span>
                          {t?.duration_days && <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-slate-100 text-slate-600">{t.duration_days} Days</span>}
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${isCompleted ? "bg-green-100 text-green-700" : "bg-blue-50 text-blue-600"}`}>
                            {isCompleted ? "✓ Completed" : "● Enrolled"}
                          </span>
                        </div>
                        <h3 className="font-black text-[#0a192f] uppercase tracking-tight text-sm">{t?.name}</h3>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1">
                          <Calendar className="size-3" /> {fmt(t?.start_date)} – {fmt(t?.end_date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={e => { e.stopPropagation(); setUploadingFor(t.id); setTab("assignments"); }}
                          className="h-8 px-3 flex items-center gap-1.5 bg-slate-100 text-[#0a192f] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                        >
                          <Upload className="size-3" /> Submit
                        </button>
                        {isCompleted && (
                          <button
                            onClick={e => { e.stopPropagation(); setTab("certificate"); }}
                            className="h-8 px-3 flex items-center gap-1.5 bg-[#fbbf24] text-[#0a192f] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all"
                          >
                            <Award className="size-3" /> Certificate
                          </button>
                        )}
                        <div className="size-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                          {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Sessions */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 p-5 space-y-3 bg-slate-50/50">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Sessions ({trainingLectures.length})</h4>
                        {trainingLectures.length === 0 ? (
                          <div className="text-center py-10 text-slate-400">
                            <Clock className="size-8 mx-auto mb-2 text-slate-200" />
                            <p className="text-xs font-bold">No sessions yet. Check back soon.</p>
                          </div>
                        ) : (
                          trainingLectures.map((lec, idx) => {
                            const ytId = getYouTubeId(lec.link || "");
                            const done = lec.start_time && new Date(lec.start_time) < new Date();
                            return (
                              <div key={lec.id} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-start gap-4">
                                <div className="w-24 aspect-video rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                                  {ytId
                                    ? <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt={lec.title} className="w-full h-full object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center bg-[#0a192f]/5"><span className="text-lg font-black text-slate-300">#{idx + 1}</span></div>
                                  }
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
                                  {lec.link && done ? (
                                    <a href={lec.link} target="_blank" rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 h-8 px-3 bg-[#0a192f] text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-[#1e40af] transition-all">
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

        {/* ======= PROFILE TAB ======= */}
        {tab === "profile" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-[#0a192f] to-[#1e40af] p-8 flex items-center gap-5">
                <div className="size-20 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center flex-shrink-0">
                  <User className="size-10 text-white/70" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">{profile?.full_name || "Your Name"}</h2>
                  <p className="text-white/50 text-xs font-medium mt-0.5">{profile?.email}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-[#fbbf24] text-[#0a192f]">Training Student</span>
                    {profile?.department && <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-white/10 text-white">{profile.department}</span>}
                  </div>
                </div>
                <div className="ml-auto">
                  {!editing ? (
                    <button onClick={() => setEditing(true)}
                      className="flex items-center gap-1.5 h-9 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                      <Edit3 className="size-3.5" /> Edit
                    </button>
                  ) : (
                    <button onClick={() => setEditing(false)}
                      className="flex items-center gap-1.5 h-9 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                      <X className="size-3.5" /> Cancel
                    </button>
                  )}
                </div>
              </div>

              {profileMsg && (
                <div className={`px-6 py-3 text-xs font-bold ${profileMsg.includes("Error") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
                  {profileMsg}
                </div>
              )}

              <form onSubmit={saveProfile} className="p-8 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1"><User className="size-3" /> Full Name</label>
                    {editing
                      ? <input value={editForm.full_name || ""} onChange={e => setEditForm((f: any) => ({ ...f, full_name: e.target.value }))} className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 font-bold text-sm outline-none focus:border-[#0a192f] transition-colors" />
                      : <div className="h-11 px-4 rounded-xl bg-slate-50 border-2 border-slate-100 flex items-center text-sm font-bold text-[#0a192f]">{profile?.full_name || "—"}</div>
                    }
                  </div>

                  {/* Email (read-only) */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1"><Mail className="size-3" /> Email</label>
                    <div className="h-11 px-4 rounded-xl bg-slate-50 border-2 border-slate-100 flex items-center text-sm font-bold text-slate-400">{profile?.email || "—"}</div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1"><Phone className="size-3" /> Phone</label>
                    {editing
                      ? <input value={editForm.contact_number || ""} onChange={e => setEditForm((f: any) => ({ ...f, contact_number: e.target.value }))} className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 font-bold text-sm outline-none focus:border-[#0a192f] transition-colors" />
                      : <div className="h-11 px-4 rounded-xl bg-slate-50 border-2 border-slate-100 flex items-center text-sm font-bold text-[#0a192f]">{profile?.contact_number || "—"}</div>
                    }
                  </div>

                  {/* State */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1"><MapPin className="size-3" /> State</label>
                    {editing
                      ? <select value={editForm.state || ""} onChange={e => setEditForm((f: any) => ({ ...f, state: e.target.value }))} className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 font-bold text-sm outline-none focus:border-[#0a192f] transition-colors">
                          <option value="">Select State</option>
                          {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      : <div className="h-11 px-4 rounded-xl bg-slate-50 border-2 border-slate-100 flex items-center text-sm font-bold text-[#0a192f]">{profile?.state || "—"}</div>
                    }
                  </div>

                  {/* University */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1"><GraduationCap className="size-3" /> University</label>
                    {editing
                      ? <input value={editForm.university_name || ""} onChange={e => setEditForm((f: any) => ({ ...f, university_name: e.target.value }))} className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 font-bold text-sm outline-none focus:border-[#0a192f] transition-colors" />
                      : <div className="h-11 px-4 rounded-xl bg-slate-50 border-2 border-slate-100 flex items-center text-sm font-bold text-[#0a192f]">{profile?.university_name || "—"}</div>
                    }
                  </div>

                  {/* College */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1"><Building2 className="size-3" /> College</label>
                    {editing
                      ? <input value={editForm.college_name || ""} onChange={e => setEditForm((f: any) => ({ ...f, college_name: e.target.value }))} className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 font-bold text-sm outline-none focus:border-[#0a192f] transition-colors" />
                      : <div className="h-11 px-4 rounded-xl bg-slate-50 border-2 border-slate-100 flex items-center text-sm font-bold text-[#0a192f]">{profile?.college_name || "—"}</div>
                    }
                  </div>

                  {/* Roll Number */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1"><FileText className="size-3" /> Roll Number</label>
                    {editing
                      ? <input value={editForm.university_roll_number || ""} onChange={e => setEditForm((f: any) => ({ ...f, university_roll_number: e.target.value }))} className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 font-bold text-sm outline-none focus:border-[#0a192f] transition-colors" />
                      : <div className="h-11 px-4 rounded-xl bg-slate-50 border-2 border-slate-100 flex items-center text-sm font-bold text-[#0a192f]">{profile?.university_roll_number || "—"}</div>
                    }
                  </div>

                  {/* Subject / Branch */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1"><BookOpen className="size-3" /> Subject / Branch</label>
                    {editing
                      ? <input value={editForm.department || ""} onChange={e => setEditForm((f: any) => ({ ...f, department: e.target.value }))} className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 font-bold text-sm outline-none focus:border-[#0a192f] transition-colors" />
                      : <div className="h-11 px-4 rounded-xl bg-slate-50 border-2 border-slate-100 flex items-center text-sm font-bold text-[#0a192f]">{profile?.department || "—"}</div>
                    }
                  </div>
                </div>

                {editing && (
                  <div className="flex justify-end pt-2">
                    <button type="submit" disabled={savingProfile}
                      className="flex items-center gap-2 h-11 px-8 bg-[#0a192f] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#1e40af] transition-all shadow-lg disabled:opacity-60">
                      {savingProfile ? <Loader2 className="animate-spin size-4" /> : <Save className="size-4" />}
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* ======= CERTIFICATE TAB ======= */}
        {tab === "certificate" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-lg font-black text-[#0a192f] uppercase tracking-tight">My Certificates</h2>
            {enrollments.filter(e => e.status === "completed").length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-200 py-20 text-center">
                <ShieldCheck className="size-14 mx-auto text-slate-200 mb-4" />
                <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest mb-2">No Certificates Yet</h3>
                <p className="text-slate-400 text-sm">Complete a training program to earn your certificate.</p>
              </div>
            ) : (
              enrollments.filter(e => e.status === "completed").map(enr => (
                <div key={enr.id} className="bg-gradient-to-br from-[#0a192f] to-[#1e40af] rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)", backgroundSize: "20px 20px" }} />
                  <div className="relative">
                    <ShieldCheck className="size-14 mx-auto text-[#fbbf24] mb-4" />
                    <div className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Certificate of Completion</div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight mb-1">{enr.trainings?.name}</h3>
                    <p className="text-white/60 text-xs font-bold mb-2">Awarded to <span className="text-white">{profile?.full_name}</span></p>
                    <p className="text-[#fbbf24] text-xs font-bold mb-6">{fmt(enr.updated_at || enr.created_at)}</p>
                    <Link to="/dashboard/student/certificate"
                      className="inline-flex items-center gap-2 h-11 px-8 bg-[#fbbf24] text-[#0a192f] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-all shadow-lg">
                      <Award className="size-4" /> Download Certificate
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}
