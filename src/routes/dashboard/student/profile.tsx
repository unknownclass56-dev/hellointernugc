import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { 
  User, Mail, Phone, BookOpen, GraduationCap, MapPin, Save, Loader2, 
  Fingerprint, School, Calendar, Briefcase, Globe, Github, Linkedin, 
  FileText, ShieldCheck, CheckCircle2, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/dashboard/student/profile")({
  component: StudentProfile,
});

function StudentProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [internships, setInternships] = useState<any[]>([]);

  // Academic Data States
  const [unis, setUnis] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  const [selectedUni, setSelectedUni] = useState("");
  const [selectedCol, setSelectedCol] = useState("");

  useEffect(() => {
    if (user?.id) {
      fetchStaticData();
      fetchProfile();
    }
  }, [user]);

  async function fetchStaticData() {
    const { data: u } = await supabase.from("universities").select("*").order("name");
    setUnis(u || []);
    const { data: i } = await supabase.from("internships").select("*").order("title");
    setInternships(i || []);
  }

  async function fetchProfile() {
    setLoading(true);
    const { data, error } = await supabase
      .from("internship_students")
      .select("*")
      .eq("id", user?.id)
      .maybeSingle();
    
    if (error) {
      toast.error("Database error: " + error.message);
    } else if (data) {
      setProfile(data);
      // Try to find matching university and college IDs based on names
      if (data.university_name) {
        const { data: uMatch } = await supabase.from("universities").select("id").eq("name", data.university_name).maybeSingle();
        if (uMatch) {
          setSelectedUni(uMatch.id);
          const { data: cols } = await supabase.from("colleges").select("*").eq("university_id", uMatch.id).order("name");
          setColleges(cols || []);
          
          if (data.college_name) {
            const { data: cMatch } = await supabase.from("colleges").select("id").eq("name", data.college_name).eq("university_id", uMatch.id).maybeSingle();
            if (cMatch) {
              setSelectedCol(cMatch.id);
              const { data: struct } = await supabase.from("academic_structures").select("*").eq("college_id", cMatch.id);
              setStructures(struct || []);
            }
          }
        }
      }
    } else if (user) {
      const newProfile = {
        id: user.id,
        full_name: user.user_metadata?.full_name || "New Student",
        email: user.email,
        created_at: new Date().toISOString()
      };
      // Insert into base profiles table first, ignoring conflict
      await supabase.from("profiles").insert([{
        id: user.id,
        full_name: newProfile.full_name,
        email: newProfile.email,
        role: "student",
        created_at: newProfile.created_at
      }]);
      // Insert into internship_students table
      const { data: created } = await supabase.from("internship_students").insert([newProfile]).select().single();
      if (created) setProfile(created);
    }
    setLoading(false);
  }

  async function handleUniChange(uniId: string) {
    setSelectedUni(uniId);
    setSelectedCol("");
    setColleges([]);
    setStructures([]);
    const { data } = await supabase.from("colleges").select("*").eq("university_id", uniId).order("name");
    setColleges(data || []);
  }

  async function handleColChange(colId: string) {
    setSelectedCol(colId);
    setStructures([]);
    const { data } = await supabase.from("academic_structures").select("*").eq("college_id", colId);
    setStructures(data || []);
  }

  async function onUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd);
    
    setSaving(true);
    
    // Sanitize data: Convert empty strings to null to avoid DB errors (like date validation)
    const sanitizedData: any = {};
    Object.keys(data).forEach(key => {
      sanitizedData[key] = data[key] === "" ? null : data[key];
    });

    const { error } = await supabase
      .from("profiles")
      .update({
        ...sanitizedData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user?.id);
    
    setSaving(false);
    if (error) {
      toast.error("Error updating profile: " + error.message);
    } else {
      toast.success("Profile updated successfully!");
      fetchProfile();
    }
  }

  if (loading) return (
    <div className="flex h-96 flex-col items-center justify-center gap-4">
      <Loader2 className="size-12 animate-spin text-navy" />
      <p className="font-black text-xs uppercase tracking-widest text-navy/40">Syncing Profile Data...</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Bar */}
      <div className="bg-navy rounded-2xl p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10"><Fingerprint size={120} /></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-gold font-black text-[10px] uppercase tracking-[0.3em] mb-2">
            <ShieldCheck size={14} /> Official Identity Record
          </div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tighter leading-none">
            {profile?.full_name || "Student Profile"}
          </h1>
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-2">
            Roll No: <span className="text-gold">{profile?.university_roll_number || "N/A"}</span>
          </p>
        </div>
      </div>

      <form onSubmit={onUpdate} className="grid lg:grid-cols-1 gap-8">
        
        {/* 01 — Personal Identity */}
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden border-navy/5">
          <div className="bg-navy p-4 flex items-center justify-between">
            <h2 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
              <span className="text-gold">01</span> Personal Identity
            </h2>
            <User className="text-white/20 size-5" />
          </div>
          <div className="p-8 grid gap-6 md:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-navy/40">Full Name</Label>
              <Input name="full_name" defaultValue={profile?.full_name} required className="h-11 rounded-xl border-2 focus:border-navy transition-all font-bold" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-navy/40">Father's Name</Label>
              <Input name="parent_name" defaultValue={profile?.parent_name || profile?.father_name} className="h-11 rounded-xl border-2 focus:border-navy transition-all font-bold" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-navy/40">Gender</Label>
              <select name="gender" defaultValue={profile?.gender || "Male"} className="w-full h-11 rounded-xl border-2 px-3 font-bold bg-white focus:border-navy outline-none">
                <option value="Male">MALE</option>
                <option value="Female">FEMALE</option>
                <option value="Other">OTHER</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-navy/40">Date of Birth</Label>
              <Input name="dob" type="date" defaultValue={profile?.dob} className="h-11 rounded-xl border-2 focus:border-navy transition-all font-bold" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-navy/40">Category</Label>
              <select name="category" defaultValue={profile?.category || "General"} className="w-full h-11 rounded-xl border-2 px-3 font-bold bg-white focus:border-navy outline-none">
                <option value="General">GENERAL</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>
            </div>
          </div>
        </div>

        {/* 02 — Academic Details (SELECT VERSION) */}
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden border-navy/5">
          <div className="bg-navy p-4 flex items-center justify-between">
            <h2 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
              <span className="text-gold">02</span> Academic Credentials
            </h2>
            <GraduationCap className="text-white/20 size-5" />
          </div>
          <div className="p-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-navy/40">University <span className="text-red-500">*</span></Label>
              <Input name="university_name" defaultValue={profile?.university_name} required className="h-11 rounded-xl border-2 focus:border-navy transition-all font-bold" />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-navy/40">College <span className="text-red-500">*</span></Label>
              <Input name="college_name" defaultValue={profile?.college_name} required className="h-11 rounded-xl border-2 focus:border-navy transition-all font-bold" />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-navy/40">University Roll Number</Label>
              <Input name="university_roll_number" defaultValue={profile?.university_roll_number} required className="h-11 rounded-xl border-2 focus:border-navy transition-all font-mono font-bold bg-secondary/10" />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-navy/40">Branch / Department <span className="text-red-500">*</span></Label>
              <Input name="department" defaultValue={profile?.department} required className="h-11 rounded-xl border-2 focus:border-navy transition-all font-bold" />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-navy/40">Degree <span className="text-red-500">*</span></Label>
              <Input name="degree" defaultValue={profile?.degree} required className="h-11 rounded-xl border-2 focus:border-navy transition-all font-bold" />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-navy/40">Academic Session</Label>
              <Input name="academic_session" defaultValue={profile?.academic_session || profile?.session} placeholder="e.g. 2021-25" className="h-11 rounded-xl border-2 focus:border-navy transition-all font-bold" />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-navy/40">Current Semester</Label>
              <Input name="semester" defaultValue={profile?.semester || profile?.class_semester} placeholder="e.g. 4th" required className="h-11 rounded-xl border-2 focus:border-navy transition-all font-bold" />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-navy/40 text-navy">Internship Domain</Label>
              <select name="program" defaultValue={profile?.program} className="w-full h-11 rounded-xl border-2 border-navy/20 px-3 font-bold bg-navy/5 focus:border-navy outline-none">
                <option value="">-- UNSELECTED --</option>
                {internships.map(i => <option key={i.id} value={i.title}>{i.title}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* 03 — Contact & Professional */}
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden border-navy/5">
          <div className="bg-navy p-4 flex items-center justify-between">
            <h2 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
              <span className="text-gold">03</span> Contact & Professional
            </h2>
            <Mail className="text-white/20 size-5" />
          </div>
          <div className="p-8 grid gap-6 md:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-navy/40">Email Address (Primary)</Label>
              <Input defaultValue={profile?.email} disabled className="h-11 rounded-xl border-2 bg-secondary/20 font-bold" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-navy/40">Mobile Number</Label>
              <Input name="contact_number" defaultValue={profile?.contact_number} required className="h-11 rounded-xl border-2 focus:border-navy transition-all font-bold" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-navy/40">Alternative Mobile</Label>
              <Input name="alt_contact_number" defaultValue={profile?.alt_contact_number} className="h-11 rounded-xl border-2 focus:border-navy transition-all font-bold" />
            </div>
            <div className="space-y-1 md:col-span-3">
              <Label className="text-[10px] font-black uppercase text-navy/40">Professional Skills (Comma separated)</Label>
              <textarea name="skills" defaultValue={profile?.skills} placeholder="e.g. React, Python, Data Analysis" className="w-full h-20 rounded-xl border-2 p-3 text-xs font-bold outline-none focus:border-navy transition-all" />
            </div>
          </div>
        </div>

        {/* 04 — Permanent Address */}
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden border-navy/5">
          <div className="bg-navy p-4 flex items-center justify-between">
            <h2 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
              <span className="text-gold">04</span> Location & Address
            </h2>
            <MapPin className="text-white/20 size-5" />
          </div>
          <div className="p-8 grid gap-6 md:grid-cols-4">
            <div className="space-y-1 md:col-span-2">
              <Label className="text-[10px] font-black uppercase text-navy/40">Permanent Address</Label>
              <Input name="address" defaultValue={profile?.address} className="h-11 rounded-xl border-2 focus:border-navy transition-all font-bold" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-navy/40">State</Label>
              <Input name="state" defaultValue={profile?.state} className="h-11 rounded-xl border-2 focus:border-navy transition-all font-bold" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-navy/40">City</Label>
              <Input name="city" defaultValue={profile?.city} className="h-11 rounded-xl border-2 focus:border-navy transition-all font-bold" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-navy/40">PIN Code</Label>
              <Input name="pin_code" defaultValue={profile?.pin_code} className="h-11 rounded-xl border-2 focus:border-navy transition-all font-bold" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 sticky bottom-6 z-20">
          <Button type="submit" disabled={saving} className="bg-navy text-ivory hover:bg-navy-deep px-12 h-14 rounded-2xl font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">
            {saving ? (
              <><Loader2 className="mr-3 size-5 animate-spin" /> Committing Changes...</>
            ) : (
              <><Save className="mr-3 size-5" /> Synchronize Profile Data</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
