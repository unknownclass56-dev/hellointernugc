import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { 
  Users, Building2, Briefcase, ShieldCheck, Download, Search, Plus, Edit, Trash2, 
  Key, Filter, Eye, EyeOff, GraduationCap, CreditCard, Award, FileUp, ListChecks, 
  LayoutDashboard, School, BookOpen, Calendar, Clock, ClipboardList, Building, 
  Phone, User, Heart, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, Zap,
  TrendingUp, Activity, Globe, MoreHorizontal, ChevronRight, FileText, Printer,
  Loader2, MoreVertical, XCircle, Scan, Linkedin, Mail, Percent, UserPlus, Settings,
  Lock, Video, Upload, Target, DollarSign, PhoneCall
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@/hooks/use-auth";
import { LogoLoader } from "@/components/LogoLoader";
import { JobCampusAdminView } from "@/components/admin/JobCampusAdminView";
import { ReferralAdminView } from "@/components/admin/ReferralAdminView";

export const Route = createFileRoute("/dashboard/admin")({
  component: AdminDashboard,
  validateSearch: (search: Record<string, unknown>) => {
    return { view: (search.view as string) || "overview" };
  },
});

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra & Nagar Haveli",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

function AdminDashboard() {
  const { view } = (Route as any).useSearch();
  const { user } = useAuth();
  
  // Sales management states
  const [salesUsers, setSalesUsers] = useState<any[]>([]);
  const [selectedSalesRep, setSelectedSalesRep] = useState<any>(null);
  const [salesRepHistory, setSalesRepHistory] = useState<any[]>([]);
  const [salesHistoryStart, setSalesHistoryStart] = useState("");
  const [salesHistoryEnd, setSalesHistoryEnd] = useState("");
  const [loadingSalesUsers, setLoadingSalesUsers] = useState(false);
  const [loadingSalesHistory, setLoadingSalesHistory] = useState(false);
  const [salesStudents, setSalesStudents] = useState<any[]>([]);
  const [assignStudentId, setAssignStudentId] = useState("");
  const [assignSalesRepId, setAssignSalesRepId] = useState("");
  const [assigningStudent, setAssigningStudent] = useState(false);
  const [showCreateSalesUser, setShowCreateSalesUser] = useState(false);
  const [newSalesName, setNewSalesName] = useState("");
  const [newSalesEmail, setNewSalesEmail] = useState("");
  const [newSalesPassword, setNewSalesPassword] = useState("");
  const [creatingSalesUser, setCreatingSalesUser] = useState(false);
  const [salesAssignments, setSalesAssignments] = useState<any[]>([]);

  // Sales CSV distribution states
  const [bulkSalesCSVFile, setBulkSalesCSVFile] = useState<File | null>(null);
  const [parsedCSVStudentsCount, setParsedCSVStudentsCount] = useState<number>(0);
  const [parsedCSVStudents, setParsedCSVStudents] = useState<any[]>([]);
  const [selectedRepsForCSV, setSelectedRepsForCSV] = useState<string[]>([]);
  const [importingCSV, setImportingCSV] = useState(false);
  const [importCSVProgress, setImportCSVProgress] = useState("");

  // Admin Profile States
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [adminName, setAdminName] = useState("");
  const [adminContact, setAdminContact] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Admin Lectures States
  const [lecturesList, setLecturesList] = useState<any[]>([]);
  const [loadingLectures, setLoadingLectures] = useState(false);
  const [savingLecture, setSavingLecture] = useState(false);
  
  // Form States for New Lecture
  const [newLectureTitle, setNewLectureTitle] = useState("");
  const [newLectureDomain, setNewLectureDomain] = useState("");
  const [newLectureMode, setNewLectureMode] = useState("Google Meet");
  const [newLectureModeCustom, setNewLectureModeCustom] = useState("");
  const [newLectureLink, setNewLectureLink] = useState("");
  const [newLectureDesc, setNewLectureDesc] = useState("");
  const [newLectureMaterialPdf, setNewLectureMaterialPdf] = useState<File | null>(null);
  const [newLectureMaterialLink, setNewLectureMaterialLink] = useState("");

  // Edit Lecture States
  const [isAddLectureOpen, setIsAddLectureOpen] = useState(false);
  const [isEditLectureOpen, setIsEditLectureOpen] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<any | null>(null);
  const [editLectureTitle, setEditLectureTitle] = useState("");
  const [editLectureDomain, setEditLectureDomain] = useState("");
  const [editLectureMode, setEditLectureMode] = useState("Google Meet");
  const [editLectureModeCustom, setEditLectureModeCustom] = useState("");
  const [editLectureLink, setEditLectureLink] = useState("");
  const [editLectureDesc, setEditLectureDesc] = useState("");
  const [editLectureMaterialPdf, setEditLectureMaterialPdf] = useState<File | null>(null);
  const [editLectureMaterialLink, setEditLectureMaterialLink] = useState("");
  const [editLectureExistingPdfUrl, setEditLectureExistingPdfUrl] = useState("");

  // YouTube ID helper
  function getYouTubeId(url: string): string | null {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  // Marketing Mail States & Helpers
  const [mailSubject, setMailSubject] = useState("");
  const [mailTemplate, setMailTemplate] = useState("");
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [queueStatus, setQueueStatus] = useState<"idle" | "sending" | "paused" | "completed">("idle");
  const [queueResults, setQueueResults] = useState<any[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);

  // ---- TRAINING MANAGEMENT STATES ----
  const [trainings, setTrainings] = useState<any[]>([]);
  const [trainingLeads, setTrainingLeads] = useState<any[]>([]);
  const [trainingEnrollments, setTrainingEnrollments] = useState<any[]>([]);
  const [trainingTransactions, setTrainingTransactions] = useState<any[]>([]);
  const [loadingTrainings, setLoadingTrainings] = useState(false);
  const [trainingTab, setTrainingTab] = useState<"list" | "leads" | "enrolled" | "transactions">("list");
  const [selectedTraining, setSelectedTraining] = useState<any>(null);
  const [trainingLecturesMap, setTrainingLecturesMap] = useState<Record<string, any[]>>({});
  const [viewingTraining, setViewingTraining] = useState<any>(null);
  const [isAddTrainingOpen, setIsAddTrainingOpen] = useState(false);
  const [isEditTrainingOpen, setIsEditTrainingOpen] = useState(false);
  const [isAddTrainingLectureOpen, setIsAddTrainingLectureOpen] = useState(false);
  const [isEditTrainingLectureOpen, setIsEditTrainingLectureOpen] = useState(false);
  const [selectedTrainingLecture, setSelectedTrainingLecture] = useState<any>(null);
  const [savingTraining, setSavingTraining] = useState(false);
  const [trainingSearch, setTrainingSearch] = useState("");
  const [capturing, setCapturing] = useState(false);

  // Training form states
  const [tName, setTName] = useState("");
  const [tType, setTType] = useState("online");
  const [tDuration, setTDuration] = useState(5);
  const [tStartDate, setTStartDate] = useState("");
  const [tEndDate, setTEndDate] = useState("");
  const [tThumbnail, setTThumbnail] = useState("");
  const [tThumbnailFile, setTThumbnailFile] = useState<File | null>(null);
  const [tThumbnailUploading, setTThumbnailUploading] = useState(false);
  const tThumbnailRef = useRef<HTMLInputElement>(null);
  const [tFee, setTFee] = useState(999);

  // Training lecture form
  const [tlTitle, setTlTitle] = useState("");
  const [tlDesc, setTlDesc] = useState("");
  const [tlStartTime, setTlStartTime] = useState("");
  const [tlLink, setTlLink] = useState("");

  function parseMarketingCSV(text: string) {
    const lines = text.split(/\r?\n/);
    if (lines.length === 0) return { headers: [], data: [] };
    
    const parseLine = (line: string) => {
      const result = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const rawHeaders = parseLine(lines[0]);
    const headers = rawHeaders.map(h => h.replace(/^["']|["']$/g, "").trim()).filter(Boolean);
    
    const data: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = parseLine(line);
      const rowObject: any = {};
      headers.forEach((header, index) => {
        const val = (values[index] || "").replace(/^["']|["']$/g, "").trim();
        rowObject[header] = val;
      });
      if (Object.keys(rowObject).length > 0) {
        data.push(rowObject);
      }
    }
    
    return { headers, data };
  }

  function compileTemplate(template: string, data: any) {
    let compiled = template;
    Object.keys(data).forEach(key => {
      const value = data[key] || "";
      const regex = new RegExp(`\\{\\s*${key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*\\}`, 'gi');
      compiled = compiled.replace(regex, value);
    });
    return compiled;
  }

  useEffect(() => {
    if (queueStatus !== "sending") return;
    if (queueIndex >= csvData.length) {
      setQueueStatus("completed");
      toast.success("Mailing campaign completed successfully!");
      return;
    }

    let active = true;
    const sendNextEmail = async () => {
      const recipient = csvData[queueIndex];
      const emailKey = Object.keys(recipient).find(k => k.toLowerCase() === "email");
      const toEmail = emailKey ? recipient[emailKey] : null;

      if (!toEmail) {
        if (active) {
          setQueueResults(prev => [
            ...prev,
            { to: "Unknown", status: "failed", error: "Missing email column in CSV row", info: recipient }
          ]);
          setQueueIndex(prev => prev + 1);
        }
        return;
      }

      const subject = compileTemplate(mailSubject, recipient);
      const plainBody = compileTemplate(mailTemplate, recipient);
      const htmlBody = plainBody.replace(/\n/g, "<br/>");
      const html = `
        <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; padding: 40px 20px; color: #1f2937;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;">
            <div style="background-color: #0a192f; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase;">TechLaunchpad</h1>
              <p style="color: #fbbf24; margin: 5px 0 0 0; font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">Official Communication</p>
            </div>
            <div style="padding: 40px 30px; line-height: 1.6; font-size: 15px;">
              ${htmlBody}
            </div>
            <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6;">
              <p style="margin: 0 0 5px 0;">This email was sent by TechLaunchpad Admin Portal.</p>
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} TechLaunchpad. All rights reserved.</p>
            </div>
          </div>
        </div>
      `;

      try {
        const res = await fetch("/api/send-email", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ to: toEmail, subject, html })
        });
        
        const data = await res.json();
        
        if (active) {
          if (res.ok && data.success) {
            setQueueResults(prev => [
              ...prev,
              { to: toEmail, status: "success", info: recipient }
            ]);
          } else {
            setQueueResults(prev => [
              ...prev,
              { to: toEmail, status: "failed", error: data.error || "Failed to send email", info: recipient }
            ]);
          }
          setTimeout(() => {
            if (active) setQueueIndex(prev => prev + 1);
          }, 500);
        }
      } catch (err: any) {
        if (active) {
          setQueueResults(prev => [
            ...prev,
            { to: toEmail, status: "failed", error: err.message || "Network connection error", info: recipient }
          ]);
          setTimeout(() => {
            if (active) setQueueIndex(prev => prev + 1);
          }, 500);
        }
      }
    };

    sendNextEmail();

    return () => {
      active = false;
    };
  }, [queueStatus, queueIndex, csvData, mailSubject, mailTemplate]);

  const [students, setStudents] = useState<any[]>([]);
  const [preRegList, setPreRegList] = useState<any[]>([]);
  const [internships, setInternships] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [allAttendance, setAllAttendance] = useState<any[]>([]);
  const [allAssignments, setAllAssignments] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [leads, setLeads] = useState<any[]>([]);
  const [leadsSearch, setLeadsSearch] = useState("");
  const [leadsStatusFilter, setLeadsStatusFilter] = useState("all");
  const [internshipSearch, setInternshipSearch] = useState("");
  const [assignmentSearch, setAssignmentSearch] = useState("");
  const [minAttendancePercent, setMinAttendancePercent] = useState(75);
  
  // Dialog States
  const [isAddPreRegOpen, setIsAddPreRegOpen] = useState(false);
  const [isAddUniOpen, setIsAddUniOpen] = useState(false);
  const [isAddCollegeOpen, setIsAddCollegeOpen] = useState(false);
  // Bulk operation states
  const [isBulkUniOpen, setIsBulkUniOpen] = useState(false);
  const [isBulkCollegeOpen, setIsBulkCollegeOpen] = useState(false);
  const [bulkCSV, setBulkCSV] = useState('');
  const [bulkParseErrors, setBulkParseErrors] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [selectedUniForCollege, setSelectedUniForCollege] = useState<any>(null);
  const [selectedColForStructure, setSelectedColForStructure] = useState<any>(null);
  const [viewingStudent, setViewingStudent] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedInternship, setSelectedInternship] = useState<any>(null);
  const [selectedPreReg, setSelectedPreReg] = useState<any>(null);
  const [viewingPreReg, setViewingPreReg] = useState<any>(null);
  const [viewingAttendance, setViewingAttendance] = useState<any>(null);
  const [isEditPreRegOpen, setIsEditPreRegOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isInternshipDialogOpen, setIsInternshipDialogOpen] = useState(false);
  const [isBulkAttendanceOpen, setIsBulkAttendanceOpen] = useState(false);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  
  // HIERARCHICAL EXPLORER STATE
  const [explorerUni, setExplorerUni] = useState<any>(null);
  const [explorerCol, setExplorerCol] = useState<any>(null);
  const [uniSearch, setUniSearch] = useState("");
  const [colSearch, setColSearch] = useState("");
  const [isEditUniOpen, setIsEditUniOpen] = useState(false);
  const [isEditColOpen, setIsEditColOpen] = useState(false);

  // State-wise University Filter
  const [selectedStateFilter, setSelectedStateFilter] = useState("");
  const [uniStateForDialog, setUniStateForDialog] = useState("");
  const [studentStateFilter, setStudentStateFilter] = useState("");

  // Helper to parse CSV
  const parseCSV = (text: string, expectedCols: number): { rows: string[][]; errors: string[] } => {
    const rows: string[][] = [];
    const errors: string[] = [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    lines.forEach((line, idx) => {
      const cols = line.split(',').map(c => c.trim());
      if (cols.length !== expectedCols) {
        errors.push(`Expected ${expectedCols} columns but got ${cols.length}`);
      } else {
        rows.push(cols);
      }
    });
    return { rows, errors };
  };

  const handleBulkUniversitySubmit = async () => {
    setBulkLoading(true);
    // Expect at least name and state; city is optional
    const { rows, errors } = parseCSV(bulkCSV, 2);
    if (errors.length) {
      setBulkParseErrors(errors);
      setBulkLoading(false);
      return;
    }
    // rows may have only 2 columns; ensure city is set to empty string if missing
    const inserts = rows.map(r => ({
      name: r[0],
      state: r[1],
      city: r[2] ?? ''
    }));
    const { error } = await supabase.from('universities').insert(inserts);
    if (error) {
      toast.error('Bulk insert failed: ' + error.message);
    } else {
      fetchData();
      setIsBulkUniOpen(false);
      setBulkCSV('');
    }
    setBulkLoading(false);
  };
  const handleBulkCollegeSubmit = async () => {
    if (!selectedUniForCollege) {
      toast.error('Select a university before bulk adding colleges');
      return;
    }
    setBulkLoading(true);
    const { rows, errors } = parseCSV(bulkCSV, 2);
    if (errors.length) {
      setBulkParseErrors(errors);
      setBulkLoading(false);
      return;
    }
    const inserts = rows.map(r => ({ name: r[0], address: r[1], university_id: selectedUniForCollege.id }));
    const { error } = await supabase.from('colleges').insert(inserts);
    if (error) {
      toast.error('Bulk insert failed: ' + error.message);
    } else {
      fetchData();
      setIsBulkCollegeOpen(false);
      setBulkCSV('');
    }
    setBulkLoading(false);
  };
  // Cascading Selection State for Forms
  const [activeUni, setActiveUni] = useState("");
  const [activeCol, setActiveCol] = useState("");
  const [activeStructures, setActiveStructures] = useState<any[]>([]);
  const [filteredColleges, setFilteredColleges] = useState<any[]>([]);
  const activeUniData = explorerUni ? universities.find(u => u.id === explorerUni.id) : null;
  async function syncNewCollegesStructures(uniId: string) {
    const { data: cols } = await supabase.from("colleges").select("id").eq("university_id", uniId);
    if (!cols || cols.length === 0) return;
    const { data: structs } = await supabase.from("academic_structures").select("*").in("college_id", cols.map(c => c.id));
    const degrees = Array.from(new Set(structs?.map(s => s.degree))).filter(Boolean);
    const departments = Array.from(new Set(structs?.map(s => s.department))).filter(Boolean);
    const sessions = Array.from(new Set(structs?.map(s => s.session))).filter(Boolean);
    const allInserts: any[] = [];
    for (const col of cols) {
      const colStructs = structs?.filter(s => s.college_id === col.id) || [];
      const colDegrees = new Set(colStructs.map(s => s.degree));
      const colDepts = new Set(colStructs.map(s => s.department));
      const colSessions = new Set(colStructs.map(s => s.session));
      for (const deg of degrees) {
        if (!colDegrees.has(deg)) {
          allInserts.push({ college_id: col.id, degree: deg, department: "General", session: "2024-28" });
        }
      }
      for (const dept of departments) {
        if (!colDepts.has(dept)) {
          allInserts.push({ college_id: col.id, department: dept, degree: "General", session: "2024-28" });
        }
      }
      for (const ses of sessions) {
        if (!colSessions.has(ses)) {
          allInserts.push({ college_id: col.id, session: ses, degree: "General", department: "General" });
        }
      }
    }
    if (allInserts.length > 0) {
      await supabase.from("academic_structures").insert(allInserts);
    }
  }
  async function addUniversityDepartment(deptName: string) {
    if (!deptName) return;
    const collegesList = activeUniData?.colleges || [];
    if (collegesList.length === 0) {
      toast.error("Please add at least one college to this university first!");
      return;
    }
    setBusy(true);
    const inserts = collegesList.map((col: any) => ({
      college_id: col.id,
      department: deptName,
      degree: "General",
      session: "2024-28"
    }));
    const { error } = await supabase.from("academic_structures").insert(inserts);
    setBusy(false);
    if (!error) {
      toast.success(`Department "&quot;${deptName}&quot;" added successfully!`);
      fetchData();
    } else {
      toast.error("Failed to add department: " + error.message);
    }
  }
  async function addUniversityCourse(courseName: string) {
    if (!courseName) return;
    const collegesList = activeUniData?.colleges || [];
    if (collegesList.length === 0) {
      toast.error("Please add at least one college to this university first!");
      return;
    }
    setBusy(true);
    const inserts = collegesList.map((col: any) => ({
      college_id: col.id,
      degree: courseName,
      department: "General",
      session: "2024-28"
    }));
    const { error } = await supabase.from("academic_structures").insert(inserts);
    setBusy(false);
    if (!error) {
      toast.success(`Course "&quot;${courseName}&quot;" added successfully!`);
      fetchData();
    } else {
      toast.error("Failed to add course: " + error.message);
    }
  }
  async function addUniversitySession(sessionName: string) {
    if (!sessionName) return;
    const collegesList = activeUniData?.colleges || [];
    if (collegesList.length === 0) {
      toast.error("Please add at least one college to this university first!");
      return;
    }
    setBusy(true);
    const inserts = collegesList.map((col: any) => ({
      college_id: col.id,
      session: sessionName,
      degree: "General",
      department: "General"
    }));
    const { error } = await supabase.from("academic_structures").insert(inserts);
    setBusy(false);
    if (!error) {
      toast.success(`Session "&quot;${sessionName}&quot;" added successfully!`);
      fetchData();
    } else {
      toast.error("Failed to add session: " + error.message);
    }
  }
  async function deleteUniversityDepartment(deptName: string) {
    if (!confirm(`Are you sure you want to delete department "${deptName}" from all colleges?`)) return;
    const colIds = (activeUniData?.colleges || []).map((c: any) => c.id);
    if (colIds.length === 0) return;
    setBusy(true);
    const { error } = await supabase.from("academic_structures").delete().in("college_id", colIds).eq("department", deptName);
    setBusy(false);
    if (!error) {
      toast.success("Department deleted.");
      fetchData();
    } else {
      toast.error("Error deleting department: " + error.message);
    }
  }
  async function deleteUniversityCourse(courseName: string) {
    if (!confirm(`Are you sure you want to delete course "${courseName}" from all colleges?`)) return;
    const colIds = (activeUniData?.colleges || []).map((c: any) => c.id);
    if (colIds.length === 0) return;
    setBusy(true);
    const { error } = await supabase.from("academic_structures").delete().in("college_id", colIds).eq("degree", courseName);
    setBusy(false);
    if (!error) {
      toast.success("Course deleted.");
      fetchData();
    } else {
      toast.error("Error deleting course: " + error.message);
    }
  }
  async function deleteUniversitySession(sessionName: string) {
    if (!confirm(`Are you sure you want to delete session "${sessionName}" from all colleges?`)) return;
    const colIds = (activeUniData?.colleges || []).map((c: any) => c.id);
    if (colIds.length === 0) return;
    setBusy(true);
    const { error } = await supabase.from("academic_structures").delete().in("college_id", colIds).eq("session", sessionName);
    setBusy(false);
    if (!error) {
      toast.success("Session deleted.");
      fetchData();
    } else {
      toast.error("Error deleting session: " + error.message);
    }
  }
  useEffect(() => { 
    if (selectedStudent) {
      const uni = universities.find(u => u.name === selectedStudent.university_name);
      if (uni) {
        setActiveUni(uni.id);
        const col = uni.colleges?.find((c: any) => c.name === selectedStudent.college_name);
        if (col) {
          setActiveCol(col.id);
          setFilteredColleges(uni.colleges || []);
          setActiveStructures(col.academic_structures || []);
        }
      }
    } else {
      setActiveUni("");
      setActiveCol("");
      setFilteredColleges([]);
      setActiveStructures([]);
    }
  }, [selectedStudent, universities]);
  async function fetchAdminProfile() {
    if (!user?.id) return;
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (error) {
        toast.error("Failed to load admin profile: " + error.message);
      } else if (data) {
        setAdminProfile(data);
        setAdminName(data.full_name || "");
        setAdminContact(data.contact_number || "");
        setAdminEmail(user?.email || data.email || "");
      } else {
        // Create default profile for admin if not exists
        const newProfile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || "Admin User",
          email: user.email,
          role: "admin",
          created_at: new Date().toISOString()
        };
        const { data: created, error: createError } = await supabase
          .from("profiles")
          .insert([newProfile])
          .select()
          .single();
        if (!createError && created) {
          setAdminProfile(created);
          setAdminName(created.full_name || "");
          setAdminContact(created.contact_number || "");
          setAdminEmail(user?.email || created.email || "");
        }
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  }
  useEffect(() => {
    if (user?.id) {
      fetchAdminProfile();
    }
  }, [user]);
  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) return;
    setUpdatingProfile(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: adminName,
        contact_number: adminContact,
        updated_at: new Date().toISOString()
      })
      .eq("id", user.id);
    setUpdatingProfile(false);
    if (error) {
      toast.error("Error updating profile details: " + error.message);
    } else {
      toast.success("Profile details updated successfully!");
      fetchAdminProfile();
    }
  }
  async function handleUpdateEmail(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail) {
      toast.error("Please enter a new email address.");
      return;
    }
    // Email regex validation to check for a valid domain structure
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      toast.error("Please enter a valid email address (e.g., user@example.com).");
      return;
    }
    if (user?.email && cleanEmail === user.email.trim().toLowerCase()) {
      toast.error("New email must be different from your current email.");
      return;
    }
    setUpdatingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: cleanEmail });
    setUpdatingEmail(false);
    if (error) {
      toast.error("Error updating email: " + error.message);
    } else {
      toast.success("Verification emails sent! Please check both your old and new email addresses to confirm the change.");
      setNewEmail("");
    }
  }
  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!newPassword) {
      toast.error("Please enter a new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    setUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setUpdatingPassword(false);
    if (error) {
      toast.error("Error updating password: " + error.message);
    } else {
      toast.success("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  async function fetchLectures() {
    setLoadingLectures(true);
    try {
      const { data, error } = await supabase
        .from("lectures")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        toast.error("Error fetching lectures: " + error.message);
      } else {
        setLecturesList(data || []);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingLectures(false);
    }
  }

  async function handleCreateLecture(e: React.FormEvent) {
    e.preventDefault();
    if (!newLectureTitle.trim()) {
      toast.error("Please enter a lecture title.");
      return;
    }
    if (!newLectureDomain) {
      toast.error("Please select a domain.");
      return;
    }
    if (!newLectureLink.trim()) {
      toast.error("Please enter a lecture link.");
      return;
    }

    if (newLectureMaterialPdf && newLectureMaterialPdf.size > 80 * 1024 * 1024) {
      toast.error("PDF file size must not exceed 80MB.");
      return;
    }

    setSavingLecture(true);
    try {
      let pdfUrl = "";
      if (newLectureMaterialPdf) {
        const path = `materials/${Date.now()}-${newLectureMaterialPdf.name}`;
        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(path, newLectureMaterialPdf);
        
        if (uploadError) {
          if (uploadError.message === "Bucket not found") {
            throw new Error("Failed to upload material PDF: The storage bucket 'resumes' does not exist in your Supabase project. Please log in to your Supabase Dashboard, navigate to Storage, create a public bucket named 'resumes', and configure policies to allow public uploads and access.");
          }
          throw new Error("Failed to upload material PDF: " + uploadError.message);
        }
        const { data: { publicUrl } } = supabase.storage
          .from("resumes")
          .getPublicUrl(path);
        pdfUrl = publicUrl;
      }

      const finalMode = newLectureMode === "Other" ? newLectureModeCustom.trim() : newLectureMode;

      const descPayload = {
        description: newLectureDesc,
        domain: newLectureDomain,
        mode: finalMode,
        material_pdf: pdfUrl,
        material_link: newLectureMaterialLink
      };

      const { error } = await supabase
        .from("lectures")
        .insert([{
          title: newLectureTitle.trim(),
          link: newLectureLink.trim(),
          description: JSON.stringify(descPayload),
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      toast.success("Lecture added successfully!");
      setNewLectureTitle("");
      setNewLectureDomain("");
      setNewLectureMode("Google Meet");
      setNewLectureModeCustom("");
      setNewLectureLink("");
      setNewLectureDesc("");
      setNewLectureMaterialPdf(null);
      setNewLectureMaterialLink("");
      setIsAddLectureOpen(false);
      
      const fileInput = document.getElementById("material_pdf_input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      fetchLectures();
    } catch (err: any) {
      toast.error(err.message || "Failed to add lecture.");
    } finally {
      setSavingLecture(false);
    }
  }

  async function handleUpdateLecture(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLecture) return;
    if (!editLectureTitle.trim()) {
      toast.error("Please enter a lecture title.");
      return;
    }
    if (!editLectureDomain) {
      toast.error("Please select a domain.");
      return;
    }
    if (!editLectureLink.trim()) {
      toast.error("Please enter a lecture link.");
      return;
    }

    if (editLectureMaterialPdf && editLectureMaterialPdf.size > 80 * 1024 * 1024) {
      toast.error("PDF file size must not exceed 80MB.");
      return;
    }

    setSavingLecture(true);
    try {
      let pdfUrl = editLectureExistingPdfUrl;
      if (editLectureMaterialPdf) {
        const path = `materials/${Date.now()}-${editLectureMaterialPdf.name}`;
        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(path, editLectureMaterialPdf);
        
        if (uploadError) {
          throw new Error("Failed to upload material PDF: " + uploadError.message);
        }
        const { data: { publicUrl } } = supabase.storage
          .from("resumes")
          .getPublicUrl(path);
        pdfUrl = publicUrl;
      }

      const finalMode = editLectureMode === "Other" ? editLectureModeCustom.trim() : editLectureMode;

      const descPayload = {
        description: editLectureDesc,
        domain: editLectureDomain,
        mode: finalMode,
        material_pdf: pdfUrl,
        material_link: editLectureMaterialLink
      };

      const { error } = await supabase
        .from("lectures")
        .update({
          title: editLectureTitle.trim(),
          link: editLectureLink.trim(),
          description: JSON.stringify(descPayload)
        })
        .eq("id", selectedLecture.id);

      if (error) throw error;

      toast.success("Lecture updated successfully!");
      setIsEditLectureOpen(false);
      setSelectedLecture(null);
      
      const fileInput = document.getElementById("edit_material_pdf_input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      fetchLectures();
    } catch (err: any) {
      toast.error(err.message || "Failed to update lecture.");
    } finally {
      setSavingLecture(false);
    }
  }

  async function handleDeleteLecture(id: string) {
    if (!confirm("Are you sure you want to delete this lecture?")) return;
    try {
      const { error } = await supabase
        .from("lectures")
        .delete()
        .eq("id", id);
      if (error) {
        toast.error("Error deleting lecture: " + error.message);
      } else {
        toast.success("Lecture deleted successfully!");
        fetchLectures();
      }
    } catch (err: any) {
      console.error(err);
    }
  }

  async function handleCaptureAllAuthorized() {
    if (!confirm("Are you sure you want to capture all authorized Razorpay payments? This will search for and capture up to the latest 100 payments.")) return;
    setCapturing(true);
    try {
      const res = await fetch("/api/capture-all-authorized", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Success! Captured: ${data.captured}, Failed: ${data.failed}. Total authorized found: ${data.totalFound}`);
        fetchData();
      } else {
        toast.error("Failed to capture: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setCapturing(false);
    }
  }

  useEffect(() => { fetchData(); }, [view]);

  async function fetchData() {
    setLoading(true);
    const { data: s } = await supabase.from("profiles").select("*").eq("role", "student").order("created_at", { ascending: false });
    setStudents(s || []);
    const { data: p } = await supabase.from("pre_registrations").select("*").order("created_at", { ascending: false });
    const { data: l } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    
    const combined = [
      ...(p || []).map(x => ({ ...x, _source: 'pre_reg' })),
      ...(l || []).map(x => ({ ...x, _source: 'lead' }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    setPreRegList(combined);
    setLeads(l || []);
    const { data: u } = await supabase.from("universities").select("*, colleges(*, academic_structures(*))").order("name");
    setUniversities(u || []);
    const { data: i } = await supabase.from("internships").select("*").order("created_at", { ascending: false });
    setInternships(i || []);
    const { data: att } = await supabase.from("attendance").select("*");
    setAllAttendance(att || []);
    const { data: ass } = await supabase.from("assignments").select("*").order("created_at", { ascending: false });
    setAllAssignments(ass || []);
    const { data: pay } = await supabase.from("payments").select("*, profiles(full_name, email, university_roll_number)").order("created_at", { ascending: false });
    setPayments(pay || []);
    const { data: sett } = await supabase.from("portal_settings").select("*").eq("id", "global").maybeSingle();
    setSettings(sett || { id: 'global', coordinator_name: 'Coordinator Name', company_name: 'TechLaunchpad' });
    
    if (view === "lectures") {
      fetchLectures();
    }
    if (view === "trainings") {
      fetchTrainingsData();
    }
    if (view === "sales") {
      fetchSalesData();
    }
    
    setLoading(false);
  }

  async function fetchSalesData() {
    setLoadingSalesUsers(true);
    // Load all sales users (profiles with role 'sales')
    const { data: su } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "sales")
      .order("created_at", { ascending: false });
    setSalesUsers(su || []);

    // Load all unassigned students (profiles with role 'student') for the assign dropdown
    const { data: allStudents } = await supabase
      .from("profiles")
      .select("id, full_name, email, contact_number")
      .eq("role", "student")
      .order("full_name");
    setSalesStudents(allStudents || []);

    // Load existing assignments
    const { data: assignments } = await supabase
      .from("sales_notes")
      .select("*, profile:profile_id(id, full_name, email, contact_number), rep:sales_rep_id(full_name)")
      .order("created_at", { ascending: false });
    setSalesAssignments(assignments || []);
    setLoadingSalesUsers(false);
  }

  async function fetchSalesRepHistory(repId: string) {
    if (!repId) return;
    setLoadingSalesHistory(true);
    let query = supabase
      .from("training_transactions")
      .select("*, training_enrollments(*, profiles(full_name), trainings(name))")
      .eq("sales_rep_id", repId)
      .order("created_at", { ascending: false });
    if (salesHistoryStart) query = query.gte("created_at", salesHistoryStart);
    if (salesHistoryEnd) query = query.lte("created_at", salesHistoryEnd + "T23:59:59");
    const { data, error } = await query;
    if (error) toast.error("Error loading history: " + error.message);
    setSalesRepHistory(data || []);
    setLoadingSalesHistory(false);
  }

  async function handleCreateSalesUser(e: React.FormEvent) {
    e.preventDefault();
    if (!newSalesEmail || !newSalesPassword || !newSalesName) {
      toast.error("Please fill all fields");
      return;
    }
    setCreatingSalesUser(true);
    try {
      // Create auth user via Supabase signUp with sales role in metadata
      const tempClient = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        { auth: { persistSession: false } }
      );
      const { data: authData, error: authError } = await tempClient.auth.signUp({
        email: newSalesEmail,
        password: newSalesPassword,
        options: {
          data: { role: "sales", full_name: newSalesName }
        }
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("User creation failed");

      // Create profile entry
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: authData.user.id,
        full_name: newSalesName,
        email: newSalesEmail,
        role: "sales",
        raw_password: newSalesPassword,
      });
      if (profileError) throw profileError;

      setNewSalesName(""); setNewSalesEmail(""); setNewSalesPassword("");
      setShowCreateSalesUser(false);
      fetchSalesData();
    } catch (err: any) {
      toast.error("Failed: " + err.message);
    } finally {
      setCreatingSalesUser(false);
    }
  }
  async function handleAssignStudent() {
    if (!assignStudentId || !assignSalesRepId) {
      toast.error("Please select both a student and a sales rep");
      return;
    }
    setAssigningStudent(true);
    const { error } = await supabase.from("sales_notes").upsert({
      profile_id: assignStudentId,
      sales_rep_id: assignSalesRepId,
      status: "assigned",
      remark: "",
    });
    setAssigningStudent(false);
    if (error) {
      toast.error("Assignment failed: " + error.message);
    } else {
      toast.success("Student assigned successfully!");
      setAssignStudentId("");
      setAssignSalesRepId("");
      fetchSalesData();
    }
  }
  const handleSalesCSVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkSalesCSVFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length <= 1) {
        toast.error("CSV file is empty or only contains headers");
        return;
      }
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      const students: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const cols: string[] = [];
        let current = "";
        let inQuotes = false;
        for (let charIdx = 0; charIdx < line.length; charIdx++) {
          const char = line[charIdx];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            cols.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }
        cols.push(current.trim());
        if (cols.length === 0 || !cols[0]) continue;
        const row: any = {};
        headers.forEach((h, idx) => {
          row[h] = (cols[idx] || "").replace(/^["']|["']$/g, "").trim();
        });
        // Normalize fields
        const full_name = row.full_name || row.name || "";
        const email = row.email || "";
        const contact_number = row.contact_number || row.phone || row.contact || "";
        const university_name = row.university_name || row.university || "";
        const college_name = row.college_name || row.college || "";
        const university_roll_number = row.university_roll_number || row.roll_number || row.roll || "";
        const department = row.department || row.branch || "";
        const semester = row.semester || row.sem || "";
        if (!email || !full_name) continue;
        students.push({
          full_name,
          email,
          contact_number,
          university_name,
          college_name,
          university_roll_number,
          department,
          semester
        });
      }
      setParsedCSVStudents(students);
      setParsedCSVStudentsCount(students.length);
      toast.success(`Parsed ${students.length} students from CSV.`);
    };
    reader.readAsText(file);
  };
  async function handleDistributeAndAssignCSV() {
    if (parsedCSVStudents.length === 0) {
      toast.error("Please upload and parse a valid CSV first");
      return;
    }
    if (selectedRepsForCSV.length === 0) {
      toast.error("Please select at least one sales representative to assign to");
      return;
    }
    setImportingCSV(true);
    setImportCSVProgress("Starting assignment...");
    let successCount = 0;
    let failCount = 0;
    const tempClient = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
      { auth: { persistSession: false } }
    );
    for (let i = 0; i < parsedCSVStudents.length; i++) {
      const student = parsedCSVStudents[i];
      const repId = selectedRepsForCSV[i % selectedRepsForCSV.length];
      setImportCSVProgress(`Processing student ${i + 1} of ${parsedCSVStudents.length}: ${student.full_name}`);
      try {
        let studentId = "";
        // 1. Check if student profile already exists in DB
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", student.email)
          .maybeSingle();
        if (existingProfile) {
          studentId = existingProfile.id;
        } else {
          // 2. Create the auth user account
          const { data: authData, error: authError } = await tempClient.auth.signUp({
            email: student.email,
            password: "123456",
            options: {
              data: {
                role: "student",
                full_name: student.full_name,
                contact_number: student.contact_number,
                university_name: student.university_name,
                college_name: student.college_name,
                university_roll_number: student.university_roll_number,
                department: student.department,
                semester: student.semester,
                raw_password: "123456"
              }
            }
          });
          if (authError) {
            console.error("Auth signUp error for " + student.email, authError);
            failCount++;
            continue;
          }
          if (authData?.user) {
            studentId = authData.user.id;
            // Upsert the profile entry to guarantee it has 'student' role
            await supabase.from("profiles").upsert({
              id: studentId,
              full_name: student.full_name,
              email: student.email,
              contact_number: student.contact_number,
              university_name: student.university_name,
              college_name: student.college_name,
              university_roll_number: student.university_roll_number,
              department: student.department,
              semester: student.semester,
              role: "student",
              raw_password: "123456"
            });
          }
        }
        if (studentId) {
          // 3. Assign the student to the sales rep in sales_notes
          const { error: assignError } = await supabase
            .from("sales_notes")
            .upsert({
              profile_id: studentId,
              sales_rep_id: repId,
              status: "assigned",
              remark: "Imported via bulk CSV assignment"
            });
          if (assignError) {
            console.error("Assign error", assignError);
            failCount++;
          } else {
            successCount++;
          }
        } else {
          failCount++;
        }
      } catch (err) {
        console.error("Unexpected error for student " + student.email, err);
        failCount++;
      }
    }
    setImportingCSV(false);
    setImportCSVProgress("");
    toast.success(`Import and distribution complete! Successful: ${successCount}, Failed: ${failCount}`);
    // Clear state & refresh
    setParsedCSVStudents([]);
    setParsedCSVStudentsCount(0);
    setBulkSalesCSVFile(null);
    setSelectedRepsForCSV([]);
    // Reset file input in DOM
    const fileInput = document.getElementById("bulk_sales_csv_input") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
    fetchSalesData();
  }
  // --- TRAINING CRUD HANDLERS ---
  async function fetchTrainingsData() {
    setLoadingTrainings(true);
    const { data: tList } = await supabase.from("trainings").select("*").order("created_at", { ascending: false });
    const { data: lList } = await supabase.from("training_leads").select("*").order("created_at", { ascending: false });
    const { data: eList } = await supabase.from("training_enrollments").select("*, profiles(*), trainings(name)").order("created_at", { ascending: false });
    const { data: trxList } = await supabase.from("training_transactions").select("*, training_enrollments(*, profiles(*), trainings(name)), sales_rep:sales_rep_id(full_name)").order("created_at", { ascending: false });
    setTrainings(tList || []);
    setTrainingLeads(lList || []);
    setTrainingEnrollments(eList || []);
    setTrainingTransactions(trxList || []);
    setLoadingTrainings(false);
  }
  async function fetchTrainingLecturesForAdmin(trainingId: string) {
    const { data } = await supabase.from("training_lectures").select("*").eq("training_id", trainingId).order("created_at", { ascending: true });
    setTrainingLecturesMap(prev => ({ ...prev, [trainingId]: data || [] }));
  }
  async function onSaveTraining(e: React.FormEvent) {
    e.preventDefault();
    setSavingTraining(true);
    try {
      // Upload thumbnail image if a new file was selected
      let finalThumbnailUrl = tThumbnail;
      if (tThumbnailFile) {
        setTThumbnailUploading(true);
        const ext = tThumbnailFile.name.split('.').pop();
        const filePath = `training-thumbnails/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { data: upData, error: upErr } = await supabase.storage
          .from('training-assets')
          .upload(filePath, tThumbnailFile, { upsert: true, contentType: tThumbnailFile.type });
        if (upErr) throw new Error('Image upload failed: ' + upErr.message);
        const { data: urlData } = supabase.storage.from('training-assets').getPublicUrl(filePath);
        finalThumbnailUrl = urlData.publicUrl;
        setTThumbnailUploading(false);
      }
      const payload = {
        name: tName,
        type: tType,
        duration_days: tDuration,
        start_date: tStartDate || null,
        end_date: tEndDate || null,
        thumbnail_url: finalThumbnailUrl,
        fee: tFee
      };
      let error;
      if (selectedTraining) {
        const res = await supabase.from("trainings").update(payload).eq("id", selectedTraining.id);
        error = res.error;
      } else {
        const res = await supabase.from("trainings").insert([payload]);
        error = res.error;
      }
      if (error) throw error;
      toast.success(selectedTraining ? "Training Updated" : "Training Created");
      setIsAddTrainingOpen(false);
      setIsEditTrainingOpen(false);
      setSelectedTraining(null);
      setTThumbnailFile(null);
      fetchTrainingsData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save training");
      setTThumbnailUploading(false);
    } finally {
      setSavingTraining(false);
    }
  }
  async function onDeleteTraining(id: string) {
    if (!confirm("Are you sure you want to delete this training? This will delete all lectures and enrollments associated with it.")) return;
    const { error } = await supabase.from("trainings").delete().eq("id", id);
    if (error) toast.error("Error deleting training: " + error.message);
    else { toast.success("Training deleted"); fetchTrainingsData(); }
  }
  async function onSaveTrainingLecture(e: React.FormEvent) {
    e.preventDefault();
    if (!viewingTraining) return;
    setSavingTraining(true);
    try {
      const payload = {
        training_id: viewingTraining.id,
        title: tlTitle,
        description: tlDesc,
        start_time: tlStartTime || null,
        link: tlLink
      };
      let error;
      if (selectedTrainingLecture) {
        const res = await supabase.from("training_lectures").update(payload).eq("id", selectedTrainingLecture.id);
        error = res.error;
      } else {
        const res = await supabase.from("training_lectures").insert([payload]);
        error = res.error;
      }
      if (error) throw error;
      toast.success(selectedTrainingLecture ? "Lecture Updated" : "Lecture Added");
      setIsAddTrainingLectureOpen(false);
      setIsEditTrainingLectureOpen(false);
      setSelectedTrainingLecture(null);
      fetchTrainingLecturesForAdmin(viewingTraining.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to save lecture");
    } finally {
      setSavingTraining(false);
    }
  }
  async function onDeleteTrainingLecture(id: string) {
    if (!confirm("Are you sure you want to delete this lecture?")) return;
    const { error } = await supabase.from("training_lectures").delete().eq("id", id);
    if (error) toast.error("Error deleting lecture: " + error.message);
    else { toast.success("Lecture deleted"); if (viewingTraining) fetchTrainingLecturesForAdmin(viewingTraining.id); }
  }
  // --- CSV Handlers ---
  const handlePreRegCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const rows = (ev.target?.result as string).split("\n").slice(1);
      const recs = rows.map(r => {
        const p = r.split(",").map(s => s.trim()); if (p.length < 11) return null;
        return { 
          full_name: p[0], 
          gender: p[1],
          parent_name: p[2],
          contact_number: p[3],
          email: p[4], 
          university_name: p[5], 
          college_name: p[6],
          department: p[7],
          degree: p[8],
          university_roll_number: p[9],
          semester: p[10]
        };
      }).filter(Boolean);
      const { error } = await supabase.from("pre_registrations").insert(recs);
      if (!error) { 
        toast.success("Bulk Sync Complete!"); 
        fetchData(); 
      } else {
        toast.error("Error: " + error.message);
      }
    };
    reader.readAsText(file);
  };
  const handleInstituteCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const rows = (ev.target?.result as string).split("\n").slice(1);
      for (const row of rows) {
        const [uN, cN, deg, dep, ses] = row.split(",").map(s => s.trim()); if (!uN || !cN) continue;
        const { data: u } = await supabase.from("universities").upsert({ name: uN }).select().single();
        if (u) {
          const { data: c } = await supabase.from("colleges").upsert({ university_id: u.id, name: cN }).select().single();
          if (c && deg && dep && ses) await supabase.from("academic_structures").insert({ college_id: c.id, degree: deg, department: dep, session: ses });
        }
      }
      toast.success("Network Updated!"); fetchData();
    };
    reader.readAsText(file);
  };
  async function onSaveStudent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget); 
    const { password, program, ...formData } = Object.fromEntries(fd);
    const uN = universities.find(u => u.id === activeUni)?.name;
    const cN = filteredColleges.find(c => c.id === activeCol)?.name;
    setBusy(true);
    let userId = selectedStudent?.id;
    if (!userId) {
      const tempClient = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        { auth: { persistSession: false } }
      );
      const { data: authData, error: authError } = await tempClient.auth.signUp({
        email: String(formData.email),
        password: String(password || "123456"),
        options: { 
          data: { 
            role: "student", 
            full_name: String(formData.full_name),
            ...formData,
            university_name: uN || selectedStudent?.university_name,
            college_name: cN || selectedStudent?.college_name,
            raw_password: String(password || "123456")
          }
        }
      });
      if (authError) {
        toast.error("Account Creation Failed: " + authError.message);
        setBusy(false);
        return;
      }
      userId = authData.user?.id;
    }
    const studentData: any = {
      id: userId,
      ...formData,
      university_name: uN || selectedStudent?.university_name,
      college_name: cN || selectedStudent?.college_name,
      role: "student",
      raw_password: String(password || selectedStudent?.raw_password || "123456")
    };
    const { error } = await supabase.from("profiles").upsert(studentData);
    setBusy(false);
    if (!error) { 
      toast.success(selectedStudent ? "Student Updated!" : "Student & Login Account Created!"); 
      setIsAddDialogOpen(false); 
      setIsEditDialogOpen(false); 
      fetchData(); 
    } else {
      toast.error("Profile Sync Error: " + error.message);
    }
  }
  async function onSaveInternship(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd);
    const internshipData: any = {
      title: data.title,
      duration: data.duration,
      description: data.description,
      company: data.company || "TechLaunchpad",
      category: data.category || "General",
    };
    if (selectedInternship?.id) {
      internshipData.id = selectedInternship.id;
    }
    const { error } = await supabase.from("internships").upsert(internshipData);
    if (!error) { 
      toast.success("Domain Saved!"); 
      setIsInternshipDialogOpen(false); 
      fetchData(); 
    } else {
      toast.error("Error: " + error.message);
    }
  }
  async function handleUniSelect(id: string) { setActiveUni(id); setActiveCol(""); const { data } = await supabase.from("colleges").select("*").eq("university_id", id); setFilteredColleges(data || []); }
  async function handleColSelect(id: string) { setActiveCol(id); const { data } = await supabase.from("academic_structures").select("*").eq("college_id", id); setActiveStructures(data || []); }
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-10">
      {/* COMPACT HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print border-b pb-4">
         <div>
            <div className="flex items-center gap-2 text-[10px] font-black text-gold uppercase tracking-widest mb-1">
               <Activity className="size-3" /> System Control
            </div>
            <h1 className="text-3xl font-display font-black text-navy-deep uppercase tracking-tighter">
               {view === "overview" && "Dashboard"}
               {view === "students" && "Students"}
               {view === "pre-reg" && "Staging"}
               {view === "institutes" && "Network"}
               {view === "internships" && "Internships"}
               {view === "attendance" && "Attendance Control"}
               {view === "assignments" && "Assignment Hub"}
               {view === "transactions" && "Financial Transactions"}
               {view === "settings" && "Portal Configuration"}
               {view === "profile" && "Admin Profile"}
               {view === "lectures" && "Lecture Control Hub"}
               {view === "leads" && "Student Leads"}
               {view === "marketing" && "Marketing Mailer"}
               {view === "trainings" && "Training Management"}
               {view === "sales" && "Sales Team Management"}
               {view === "referrals" && "Referral Program Management"}
            </h1>
         </div>
         <div className="flex gap-2">
            <Button 
               onClick={handleCaptureAllAuthorized} 
               disabled={capturing} 
               className="h-11 px-4 bg-navy hover:bg-navy/80 text-white rounded-xl font-bold uppercase text-[9px] tracking-widest shadow-sm flex items-center gap-2"
            >
               {capturing ? <Loader2 className="animate-spin size-4" /> : <ShieldCheck className="size-4 text-gold" />}
               {capturing ? "Capturing..." : "Capture All Authorized"}
            </Button>
            <div className="bg-white px-4 py-2 rounded-xl border shadow-sm flex items-center gap-3">
               <div className="size-8 rounded-lg bg-gold/10 text-gold grid place-items-center"><Zap size={16}/></div>
               <div><div className="text-[8px] font-black opacity-40 uppercase tracking-widest">Status</div><div className="text-[10px] font-black text-navy">ACTIVE</div></div>
            </div>
            <Button onClick={fetchData} variant="outline" className="size-11 rounded-xl border-2 hover:bg-gold/10 transition-all bg-white shadow-sm">
               <RefreshCw className={`size-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
         </div>
      </div>
      {/* COMPACT STATS */}
      {view === "overview" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
           {[
              { icon: Users, label: "Students", value: students.length, color: "bg-blue-600" },
              { icon: Briefcase, label: "Domains", value: internships.length, color: "bg-gold" },
              { icon: School, label: "Universities", value: universities.length, color: "bg-green-600" },
              { icon: ShieldCheck, label: "Certificates", value: "1.2K", color: "bg-navy" },
           ].map((card) => (
              <div key={card.label} className="bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                 <div className={`size-12 rounded-xl ${card.color} text-white grid place-items-center shadow-lg`}>
                    <card.icon size={24} />
                 </div>
                 <div>
                    <div className="text-xl font-black text-navy-deep leading-none mb-1">{card.value}</div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{card.label}</div>
                 </div>
              </div>
           ))}
        </div>
      )}
      {/* COMPACT REGISTRY (STUDENTS) */}
      {view === "students" && (
        <div className="space-y-4">
           <div className="bg-white p-5 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-lg font-black text-navy-deep uppercase tracking-tight">Active Student Registry</h2>
              <div className="flex gap-2">
                 <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input placeholder="Search Students..." className="w-full bg-secondary/10 pl-9 h-10 border rounded-xl outline-none text-xs font-bold" value={search} onChange={(e) => setSearch(e.target.value)} />
                 </div>
                 <Button className="h-10 px-6 bg-navy text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg" onClick={() => { setSelectedStudent(null); setIsAddDialogOpen(true); }}>
                    <Plus size={16} className="mr-1" /> New
                 </Button>
              </div>
           </div>
           <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <Table>
                 <TableHeader className="bg-secondary/5">
                    <TableRow>
                       <TableHead className="px-5 py-3 font-black uppercase text-[9px] tracking-widest">Student</TableHead>
                       <TableHead className="font-black uppercase text-[9px] tracking-widest">Roll Number</TableHead>
                       <TableHead className="font-black uppercase text-[9px] tracking-widest">Domain</TableHead>
                       <TableHead className="text-right px-5 font-black uppercase text-[9px] tracking-widest">Actions</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    {students.filter(s => (s.full_name||"").toLowerCase().includes(search.toLowerCase()) || (s.university_roll_number||"").toLowerCase().includes(search.toLowerCase())).map(s => (
                       <TableRow key={s.id} className="hover:bg-gold/5 transition-all group border-b last:border-0 h-14">
                          <TableCell className="px-5">
                             <div className="flex items-center gap-3">
                                <div className="size-8 rounded-lg bg-secondary/20 grid place-items-center font-black text-xs text-navy uppercase">{s.full_name?.charAt(0)}</div>
                                <div className="font-black text-navy-deep uppercase tracking-tight text-xs leading-none">{s.full_name}</div>
                             </div>
                          </TableCell>
                          <TableCell className="font-mono font-bold text-gold text-xs">{s.university_roll_number}</TableCell>
                          <TableCell>
                             <span className="bg-navy text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{s.program || "UNSELECTED"}</span>
                          </TableCell>
                          <TableCell className="text-right px-5">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                   <Button size="icon" variant="ghost" className="size-8 rounded-lg">
                                      <MoreVertical size={16} />
                                   </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 rounded-xl border-2 shadow-xl">
                                   <DropdownMenuLabel className="text-[9px] font-black uppercase opacity-40">Actions</DropdownMenuLabel>
                                   <DropdownMenuItem className="gap-2 font-bold text-xs cursor-pointer" onClick={() => setViewingStudent(s)}>
                                      <Eye size={14} className="text-navy" /> View Full Profile
                                   </DropdownMenuItem>
                                   <DropdownMenuItem className="gap-2 font-bold text-xs cursor-pointer" onClick={() => { setSelectedStudent(s); setIsEditDialogOpen(true); }}>
                                      <Edit size={14} className="text-navy" /> Edit Student
                                   </DropdownMenuItem>
                                   <DropdownMenuItem className="gap-2 font-bold text-xs cursor-pointer" onClick={async () => {
                                      const { data } = await supabase.from("attendance").select("*").eq("student_id", s.id).order("date", { ascending: false });
                                      setViewingAttendance({ student: s, records: data || [] });
                                   }}>
                                      <ListChecks size={14} className="text-navy" /> Attendance History
                                   </DropdownMenuItem>
                                   <DropdownMenuSeparator />
                                   <DropdownMenuItem className="gap-2 font-bold text-xs cursor-pointer text-destructive" onClick={async () => { if(confirm("DANGER: Delete student and their LOGIN permanently?")) { await supabase.rpc("delete_student_account", { student_uid: s.id }); fetchData(); } }}>
                                      <Trash2 size={14} /> Delete Permanently
                                   </DropdownMenuItem>
                                </DropdownMenuContent>
                             </DropdownMenu>
                          </TableCell>
                       </TableRow>
                    ))}
                 </TableBody>
              </Table>
           </div>
        </div>
      )}
      {/* COMPACT STAGING (PRE-REG) */}
      {view === "pre-reg" && (
        <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-4">
               <h2 className="text-lg font-black text-navy-deep uppercase tracking-tight">Student Leads & Staging</h2>
               <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => { const h = "full_name,gender,parent_name,contact_number,email,university_name,college_name,department,degree,university_roll_number,semester"; const b = new Blob([h], { type: "text/csv" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = "format.csv"; a.click(); }} className="h-9 px-4 rounded-xl border border-gold text-navy font-black uppercase text-[9px] tracking-widest hover:bg-gold hover:text-white transition-all">
                     <Download size={14} className="mr-1"/> Format
                  </Button>
                  <div className="relative">
                     <Button variant="outline" className="h-9 px-4 rounded-xl border border-dashed border-navy text-navy font-black uppercase text-[9px] tracking-widest">
                        <FileUp size={14} className="mr-1"/> Bulk Upload
                     </Button>
                     <input type="file" accept=".csv" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handlePreRegCSV} />
                  </div>
                  <Button className="h-9 px-5 bg-navy text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg" onClick={() => setIsAddPreRegOpen(true)}>
                     <Plus size={14} className="mr-1" /> Add Manual
                  </Button>
               </div>
            </div>
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden overflow-x-auto">
               <Table>
                  <TableHeader className="bg-secondary/10 h-10">
                     <TableRow>
                        <TableHead className="px-5 font-black uppercase text-[9px] tracking-widest">Name</TableHead>
                        <TableHead className="font-black uppercase text-[9px] tracking-widest">Roll Number</TableHead>
                        <TableHead className="font-black uppercase text-[9px] tracking-widest">Email</TableHead>
                        <TableHead className="font-black uppercase text-[9px] tracking-widest">Institution</TableHead>
                        <TableHead className="font-black uppercase text-[9px] tracking-widest">Course Structure</TableHead>
                        <TableHead className="font-black uppercase text-[9px] tracking-widest">Status</TableHead>
                        <TableHead className="text-right px-5 font-black uppercase text-[9px] tracking-widest">Actions</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {preRegList.map((p) => (
                        <TableRow key={p.id} className="hover:bg-secondary/5 h-12 text-xs group border-b last:border-0">
                           <TableCell className="px-5 font-black text-navy-deep uppercase">
                              <div className="flex items-center gap-2">
                                 {p.full_name}
                                 {p._source === 'lead' && <span className="bg-purple-100 text-purple-700 text-[8px] px-1.5 py-0.5 rounded-sm tracking-widest border border-purple-200">WEB LEAD</span>}
                              </div>
                           </TableCell>
                           <TableCell className="font-mono text-gold font-bold">{p.university_roll_number}</TableCell>
                           <TableCell className="font-bold text-slate-500">{p.email || "—"}</TableCell>
                           <TableCell className="font-medium text-slate-600 max-w-[200px] truncate">
                              <div>{p.college_name || "—"}</div>
                              <div className="text-[9px] text-slate-400 uppercase tracking-tight">{p.university_name}</div>
                           </TableCell>
                           <TableCell className="font-bold text-navy">
                              <div>{p.degree || "—"}</div>
                              <div className="text-[9px] text-gold uppercase tracking-tight">{p.department} (Sem: {p.semester || "—"})</div>
                           </TableCell>
                           <TableCell>
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${p.is_claimed ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                 {p.is_claimed ? "Claimed" : "Pending"}
                              </span>
                           </TableCell>
                           <TableCell className="text-right px-5">
                              <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100">
                                 <Button size="icon" variant="ghost" className="size-8 rounded-lg border" onClick={() => setViewingPreReg(p)}><Eye size={16}/></Button>
                                 <Button size="icon" variant="ghost" className="size-8 rounded-lg border" onClick={() => { setSelectedPreReg(p); setIsEditPreRegOpen(true); }}><Edit size={16}/></Button>
                                 <Button size="icon" variant="ghost" className="size-8 rounded-lg border text-red-500" onClick={async () => { if(confirm("Delete record?")) { await supabase.from(p._source === 'lead' ? 'leads' : 'pre_registrations').delete().eq("id", p.id); fetchData(); } }}><Trash2 size={16}/></Button>
                              </div>
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </div>
        </div>
      )}
      {/* HIERARCHICAL ACADEMIC NETWORK */}
      {view === "institutes" && (
         <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border shadow-sm flex items-center justify-between gap-4">
               <div className="flex items-center gap-2 overflow-hidden">
                  <Button variant="ghost" size="sm" className={`h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest ${!explorerUni ? 'text-[#1e40af] bg-blue-50' : 'text-slate-400'}`} onClick={() => { setExplorerUni(null); setExplorerCol(null); }}>Universities</Button>
                  {activeUniData && (
                     <>
                        <ChevronRight size={14} className="text-slate-300" />
                        <Button variant="ghost" size="sm" className={`h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest ${activeUniData && !explorerCol ? 'text-[#1e40af] bg-blue-50' : 'text-slate-400'} truncate max-w-[150px]`} onClick={() => setExplorerCol(null)}>{activeUniData.name}</Button>
                     </>
                  )}
                  {explorerCol && (
                     <>
                        <ChevronRight size={14} className="text-slate-300" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#1e40af] bg-blue-50 h-8 px-3 rounded-lg flex items-center truncate max-w-[150px]">{explorerCol.name}</span>
                     </>
                  )}
               </div>
               <div className="flex gap-2 items-center">
                  {!explorerUni && (
                    <select
                      value={selectedStateFilter}
                      onChange={(e) => setSelectedStateFilter(e.target.value)}
                      className="h-9 px-3 rounded-xl border-2 font-bold text-[10px] bg-white outline-none focus:border-[#1e40af] text-slate-600"
                    >
                      <option value="">All States</option>
                      {INDIAN_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                  )}
                  {!explorerUni && <Button className="h-9 px-5 bg-[#1e40af] text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg" onClick={() => { setUniStateForDialog(""); setIsAddUniOpen(true); }}>Add University</Button>}
                  {explorerUni && !explorerCol && <Button className="h-9 px-5 bg-[#1e40af] text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg" onClick={() => { setSelectedUniForCollege(explorerUni); setIsAddCollegeOpen(true); }}>Add College</Button>}
                  {!explorerUni && <Button variant="outline" className="h-9 px-5 rounded-xl text-[9px] font-black uppercase" onClick={() => setIsBulkUniOpen(true)}>Bulk Uni</Button>}
                  {explorerUni && !explorerCol && <Button variant="outline" className="h-9 px-5 rounded-xl text-[9px] font-black uppercase" onClick={() => setIsBulkCollegeOpen(true)}>Bulk Col</Button>}
               </div>
            </div>
            <div className="bg-white p-3 rounded-2xl border shadow-sm">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input placeholder={!explorerUni ? "Search Universities..." : "Search Colleges..."} className="w-full h-10 bg-slate-50 pl-10 pr-4 rounded-xl border-none font-bold text-xs" value={!explorerUni ? uniSearch : colSearch} onChange={(e) => !explorerUni ? setUniSearch(e.target.value) : setColSearch(e.target.value)} />
               </div>
            </div>
            {activeUniData && !explorerCol && (
               <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6 mb-6">
                  <div className="border-b pb-4 flex items-center justify-between">
                     <div>
                        <h3 className="text-sm font-black text-navy uppercase tracking-tight">University Academic Infrastructure</h3>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                           Configure departments, degrees/courses, and sessions shared across all affiliated colleges of {activeUniData.name}.
                        </p>
                     </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                     {/* Courses */}
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                           <span className="text-[10px] font-black text-navy uppercase tracking-wider flex items-center gap-1.5">
                              <BookOpen className="size-3 text-gold" /> Courses
                           </span>
                           <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 px-2 text-[9px] font-black uppercase text-[#1e40af] hover:bg-[#1e40af]/5"
                              onClick={() => {
                                 const course = prompt("Enter course/degree name (e.g. B.Tech, BCA):");
                                 if (course) addUniversityCourse(course);
                              }}
                           >
                              + Add Course
                           </Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                           {Array.from(new Set((activeUniData.colleges || []).flatMap((c: any) => c.academic_structures || []).map((s: any) => s.degree))).filter(d => d && d !== "General").map((degree: any) => (
                              <span key={degree} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border text-[9px] font-bold text-slate-600">
                                 {degree}
                              </span>
                           ))}
                           {Array.from(new Set((activeUniData.colleges || []).flatMap((c: any) => c.academic_structures || []).map((s: any) => s.degree))).filter(d => d && d !== "General").length === 0 && (
                              <span className="text-[9px] italic text-slate-400">No courses defined</span>
                           )}
                        </div>
                     </div>
                     {/* Departments */}
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                           <span className="text-[10px] font-black text-navy uppercase tracking-wider flex items-center gap-1.5">
                              <School className="size-3 text-gold" /> Departments
                           </span>
                           <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 px-2 text-[9px] font-black uppercase text-[#1e40af] hover:bg-[#1e40af]/5"
                              onClick={() => {
                                 const dept = prompt("Enter department/branch name (e.g. CSE, ECE):");
                                 if (dept) addUniversityDepartment(dept);
                              }}
                           >
                              + Add Dept
                           </Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                           {Array.from(new Set((activeUniData.colleges || []).flatMap((c: any) => c.academic_structures || []).map((s: any) => s.department))).filter(d => d && d !== "General").map((dept: any) => (
                              <span key={dept} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border text-[9px] font-bold text-slate-600">
                                 {dept}
                              </span>
                           ))}
                           {Array.from(new Set((activeUniData.colleges || []).flatMap((c: any) => c.academic_structures || []).map((s: any) => s.department))).filter(d => d && d !== "General").length === 0 && (
                              <span className="text-[9px] italic text-slate-400">No departments defined</span>
                           )}
                        </div>
                     </div>
                     {/* Sessions */}
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                           <span className="text-[10px] font-black text-navy uppercase tracking-wider flex items-center gap-1.5">
                              <Calendar className="size-3 text-gold" /> Sessions
                           </span>
                           <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 px-2 text-[9px] font-black uppercase text-[#1e40af] hover:bg-[#1e40af]/5"
                              onClick={() => {
                                 const ses = prompt("Enter session (e.g. 2024-28, 2023-27):");
                                 if (ses) addUniversitySession(ses);
                              }}
                           >
                              + Add Session
                           </Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                           {Array.from(new Set((activeUniData.colleges || []).flatMap((c: any) => c.academic_structures || []).map((s: any) => s.session))).filter(s => s && s !== "2024-28").map((session: any) => (
                              <span key={session} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border text-[9px] font-bold text-slate-600">
                                 {session}
                              </span>
                           ))}
                           {Array.from(new Set((activeUniData.colleges || []).flatMap((c: any) => c.academic_structures || []).map((s: any) => s.session))).filter(s => s && s !== "2024-28").length === 0 && (
                              <span className="text-[9px] italic text-slate-400">No sessions defined</span>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            )}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
               {!explorerUni ? (
                  <div className="divide-y">
                     {universities
                        .filter(u => u.name.toLowerCase().includes(uniSearch.toLowerCase()))
                        .filter(u => !selectedStateFilter || u.state === selectedStateFilter)
                        .map(uni => (
                            <div key={uni.id} className="group flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setExplorerUni(uni)}>
                              <div className="flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-blue-50 text-[#1e40af] grid place-items-center"><School size={20}/></div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <div className="text-sm font-black text-slate-800 uppercase tracking-tight">{uni.name}</div>
                                    {uni.state && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-blue-100 text-[#1e40af] border border-blue-200">
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{uni.colleges?.length || 0} Affiliated Colleges</div>
                                </div>
                              </div>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                                <Button size="icon" variant="ghost" className="size-8 rounded-lg border" onClick={() => { setSelectedUniForCollege(uni); setUniStateForDialog(uni.state || ""); setIsEditUniOpen(true); }}><Edit size={16}/></Button>
                                <Button size="icon" variant="ghost" className="size-8 rounded-lg border text-red-500" onClick={async () => { if(confirm("Delete University?")) { await supabase.from("universities").delete().eq("id", uni.id); fetchData(); } }}><Trash2 size={16}/></Button>
                                <ChevronRight size={18} className="text-slate-300 ml-2" />
                              </div>
                            </div>
                        ))}
                  </div>
               ) : !explorerCol ? (
                  <div className="divide-y">
                     {activeUniData?.colleges?.filter((c: any) => c.name.toLowerCase().includes(colSearch.toLowerCase())).map((col: any) => (
                        <div key={col.id} className="group flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                           <div className="flex items-center gap-4">
                              <div className="size-10 rounded-xl bg-amber-50 text-amber-600 grid place-items-center"><Building2 size={20}/></div>
                              <div>
                                 <div className="text-sm font-black text-slate-800 uppercase tracking-tight">{col.name}</div>
                                 <div className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">Affiliated Institute</div>
                              </div>
                           </div>
                           <div className="flex items-center gap-6" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-2">
                                 <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest">Fee (₹):</span>
                                 <input
                                    type="number"
                                    defaultValue={settings?.college_fees?.[col.id] || ""}
                                    placeholder={settings?.registration_fee || "150"}
                                    onChange={async (e) => {
                                       const val = e.target.value;
                                       const newFees = { ...(settings?.college_fees || {}) };
                                       if (val) {
                                          newFees[col.id] = Number(val);
                                       } else {
                                          delete newFees[col.id];
                                       }
                                       const { error } = await supabase
                                          .from("portal_settings")
                                          .upsert({ 
                                             id: 'global', 
                                             ...settings,
                                             college_fees: newFees 
                                          });
                                       if (!error) {
                                          setSettings({ ...(settings || {}), college_fees: newFees });
                                          toast.success("Fee updated!");
                                       } else {
                                          toast.error("Failed to update fee: " + error.message);
                                       }
                                    }}
                                    className="h-8 w-24 font-bold text-right text-xs rounded-lg border-2 px-2 focus:border-gold outline-none"
                                 />
                              </div>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                                 <Button size="icon" variant="ghost" className="size-8 rounded-lg border" onClick={() => { setSelectedColForStructure(col); setSelectedUniForCollege(activeUniData); setIsEditColOpen(true); }}><Edit size={16}/></Button>
                                 <Button size="icon" variant="ghost" className="size-8 rounded-lg border text-red-500" onClick={async () => { if(confirm("Delete College?")) { await supabase.from("colleges").delete().eq("id", col.id); fetchData(); } }}><Trash2 size={16}/></Button>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               ) : (
                  <div className="p-10 text-center"><Button onClick={() => setExplorerCol(null)}>Back to Colleges</Button></div>
               )}
            </div>
            {explorerUni && !explorerCol && (
               <div className="bg-white p-6 rounded-2xl border shadow-sm">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Bulk Add Colleges to {explorerUni.name}</h4>
                  <form onSubmit={async (e) => {
                     e.preventDefault();
                     const fd = new FormData(e.currentTarget);
                     const names = (fd.get("colleges") as string).split("\n").map(n => n.trim()).filter(Boolean);
                     if (!names.length) return;
                     await supabase.from("colleges").insert(names.map(name => ({ name, university_id: explorerUni.id })));
                     await syncNewCollegesStructures(explorerUni.id);
                     toast.success("Added!"); fetchData(); (e.target as any).reset();
                  }} className="flex flex-col md:flex-row gap-4">
                     <textarea name="colleges" placeholder="Enter College Names (One per line)..." className="flex-1 h-20 bg-slate-50 border rounded-xl p-3 text-xs font-bold outline-none" />
                     <Button type="submit" className="bg-[#1e40af] text-white px-8 h-20 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl">Bulk Save</Button>
                  </form>
               </div>
            )}
         </div>
      )}{/* Bulk University Dialog */}
       <Dialog open={isBulkUniOpen} onOpenChange={setIsBulkUniOpen}>
         <DialogContent className="max-w-lg bg-white rounded-3xl p-6 border-none shadow-2xl">
           <DialogHeader>
             <DialogTitle className="text-lg font-black text-[#1e40af] uppercase">Bulk Add Universities</DialogTitle>
            <DialogDescription className="text-sm font-medium text-gray-600">
            </DialogDescription>
             <DialogDescription className="text-sm font-medium text-gray-600">
             </DialogDescription>
           </DialogHeader>
           <Textarea
             placeholder="University Name, State, City"
             value={bulkCSV}
             onChange={e => setBulkCSV(e.target.value)}
             className="min-h-[150px] mt-4"
           />
           {bulkParseErrors.length > 0 && (
             <div className="mt-2 text-red-600 text-sm">
               <ul>
                 {bulkParseErrors.map((err, i) => (
                   <li key={i}>Row {i + 1}: {err}</li>
                 ))}
               </ul>
             </div>
           )}
           <DialogFooter className="flex justify-end gap-3 mt-4">
             <Button variant="ghost" onClick={() => setIsBulkUniOpen(false)} disabled={bulkLoading}>Cancel</Button>
             <Button onClick={handleBulkUniversitySubmit} disabled={bulkLoading} className="bg-[#1e40af] text-white">
               {bulkLoading ? <Loader2 className="animate-spin mr-2" /> : null} Submit
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
       {/* Bulk College Dialog */}
       <Dialog open={isBulkCollegeOpen} onOpenChange={setIsBulkCollegeOpen}>
  <DialogContent className="max-w-lg bg-white rounded-3xl p-6 border-none shadow-2xl">
    <DialogHeader>
      <DialogTitle className="text-lg font-black text-[#1e40af] uppercase">Bulk Add Colleges</DialogTitle>
      <DialogDescription className="text-sm font-medium text-gray-600">
      </DialogDescription>
    </DialogHeader>
    {/* University selector */}
    <div className="my-4">
      <Label htmlFor="bulk-college-university" className="text-sm font-medium">University</Label>
      <Select
        value={selectedUniForCollege?.id || ''}
        onValueChange={(id) => {
          const uni = universities.find((u) => u.id === id);
          setSelectedUniForCollege(uni || null);
        }}
      >
        <SelectTrigger id="bulk-college-university" className="w-full">
        </SelectTrigger>
        <SelectContent>
          {universities.map((u) => (
            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <Textarea
      placeholder="College Name, Address"
      value={bulkCSV}
      onChange={e => setBulkCSV(e.target.value)}
      className="min-h-[150px] mt-4"
    />
    {bulkParseErrors.length > 0 && (
      <div className="mt-2 text-red-600 text-sm">
        <ul>
          {bulkParseErrors.map((err, i) => (
            <li key={i}>Row {i + 1}: {err}</li>
          ))}
        </ul>
      </div>
    )}
    <DialogFooter className="flex justify-end gap-3 mt-4">
      <Button variant="ghost" onClick={() => setIsBulkCollegeOpen(false)} disabled={bulkLoading}>Cancel</Button>
      <Button onClick={handleBulkCollegeSubmit} disabled={bulkLoading} className="bg-[#1e40af] text-white">
        {bulkLoading ? <Loader2 className="animate-spin mr-2" /> : null} Submit
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
      {/* COMPACT PORTFOLIO (INTERNSHIPS) */}
      {view === "internships" && (
        <div className="space-y-6">
           <div className="bg-white p-5 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-lg font-black text-navy-deep uppercase tracking-tighter leading-tight">Internship Domains</h2>
              <div className="flex flex-wrap gap-2">
                 <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input placeholder="Filter..." className="w-full bg-[#f8f9fa] pl-10 h-10 border rounded-xl font-bold text-xs" value={internshipSearch} onChange={(e) => setInternshipSearch(e.target.value)} />
                 </div>
                 <Button className="h-10 px-6 bg-navy text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg" onClick={() => { setSelectedInternship(null); setIsInternshipDialogOpen(true); }}>
                    <Plus size={16} className="mr-1" /> Add Domain
                 </Button>
              </div>
           </div>
           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {internships.filter(i => i.title.toLowerCase().includes(internshipSearch.toLowerCase())).map(intern => (
                 <div key={intern.id} className="bg-white rounded-2xl border hover:border-gold/50 p-5 shadow-sm transition-all group relative">
                    <div className="flex items-center justify-between mb-4">
                       <div className="size-10 rounded-xl bg-gold/10 text-gold grid place-items-center"><Building size={20}/></div>
                       <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                          <Button size="icon" variant="ghost" className="size-8 rounded-lg" onClick={() => { setSelectedInternship(intern); setIsInternshipDialogOpen(true); }}><Edit size={14}/></Button>
                          <Button size="icon" variant="ghost" className="size-8 rounded-lg text-destructive" onClick={async () => { if(confirm("Delete?")) { await supabase.from("internships").delete().eq("id", intern.id); fetchData(); } }}><Trash2 size={14}/></Button>
                       </div>
                    </div>
                    <h3 className="text-lg font-black text-navy-deep uppercase mb-1 tracking-tight leading-tight">{intern.title}</h3>
                    <div className="text-[9px] font-black text-gold uppercase tracking-widest mb-4"><Clock size={14} className="inline mr-1"/> {intern.duration || "8 Weeks"} PROGRAM</div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-5">{intern.description}</p>
                 </div>
              ))}
           </div>
        </div>
      )}
      {/* COMPACT ATTENDANCE CONTROL */}
      {view === "attendance" && (
        <div className="space-y-4">
           <div className="bg-white p-5 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div>
                 <h2 className="text-lg font-black text-navy-deep uppercase tracking-tight">Global Attendance Registry</h2>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Management and bulk updates</p>
              </div>
              <div className="flex flex-wrap gap-3">
                 <div className="bg-navy/5 px-4 py-2 rounded-xl border flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-navy text-white grid place-items-center"><Percent size={16}/></div>
                    <div>
                       <div className="text-[8px] font-black opacity-40 uppercase tracking-widest">Min Requirement</div>
                       <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            value={minAttendancePercent} 
                            onChange={(e) => setMinAttendancePercent(Number(e.target.value))}
                            className="w-8 bg-transparent font-black text-navy text-xs outline-none"
                          />
                          <span className="text-[10px] font-black text-navy">%</span>
                       </div>
                    </div>
                 </div>
                 <Button className="h-10 px-6 bg-navy text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg" onClick={() => setIsBulkAttendanceOpen(true)}>
                    <UserPlus size={16} className="mr-2" /> Bulk Mark Presence
                 </Button>
              </div>
           </div>
           <div className="bg-white p-4 rounded-2xl border shadow-sm">
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                 <input 
                    placeholder="Search by name or roll number..." 
                    className="w-full h-10 bg-secondary/10 pl-10 pr-4 rounded-xl border-none font-bold text-xs" 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                 />
              </div>
           </div>
           <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <Table>
                 <TableHeader className="bg-secondary/5">
                    <TableRow>
                       <TableHead className="px-6 py-4 font-black uppercase text-[9px] tracking-widest text-navy/40">Student Detail</TableHead>
                       <TableHead className="font-black uppercase text-[9px] tracking-widest text-navy/40">University Roll</TableHead>
                       <TableHead className="font-black uppercase text-[9px] tracking-widest text-navy/40">Present Days</TableHead>
                       <TableHead className="font-black uppercase text-[9px] tracking-widest text-navy/40">Percentage</TableHead>
                       <TableHead className="text-right px-6 font-black uppercase text-[9px] tracking-widest text-navy/40">Actions</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    {students.filter(s => (s.full_name||"").toLowerCase().includes(search.toLowerCase()) || (s.university_roll_number||"").toLowerCase().includes(search.toLowerCase())).map(s => {
                       const count = allAttendance.filter(a => a.student_id === s.id && a.status === 'present').length;
                       // Total days from start of month or program (simulated as 30)
                       const totalPossible = 30; 
                       const percent = Math.round((count / totalPossible) * 100);
                       const isAtRisk = percent < minAttendancePercent;
                       return (
                          <TableRow key={s.id} className="hover:bg-gold/5 transition-all border-b last:border-0 h-16">
                             <TableCell className="px-6">
                                <div className="flex items-center gap-3">
                                   <div className="size-9 rounded-xl bg-navy/5 text-navy grid place-items-center font-black text-xs uppercase">{s.full_name?.charAt(0)}</div>
                                   <div>
                                      <div className="font-black text-navy-deep uppercase tracking-tight text-xs">{s.full_name}</div>
                                      <div className="text-[9px] font-bold text-muted-foreground uppercase">{s.college_name}</div>
                                   </div>
                                </div>
                             </TableCell>
                             <TableCell className="font-mono font-bold text-gold text-xs">{s.university_roll_number}</TableCell>
                             <TableCell>
                                <div className="flex items-center gap-2">
                                   <span className="text-sm font-black text-navy">{count}</span>
                                   <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Days</span>
                                </div>
                             </TableCell>
                             <TableCell>
                                <div className="flex items-center gap-3">
                                   <div className="w-16 h-1.5 bg-secondary/20 rounded-full overflow-hidden">
                                      <div 
                                         className={`h-full rounded-full ${isAtRisk ? 'bg-red-500' : 'bg-green-500'}`} 
                                         style={{ width: `${Math.min(percent, 100)}%` }} 
                                      />
                                   </div>
                                   <span className={`text-xs font-black ${isAtRisk ? 'text-red-600' : 'text-green-600'}`}>{percent}%</span>
                                </div>
                             </TableCell>
                             <TableCell className="text-right px-6">
                                <Button 
                                   size="sm" 
                                   variant="outline" 
                                   className="h-8 px-4 rounded-lg border-2 border-navy/10 text-[9px] font-black uppercase tracking-widest hover:bg-navy hover:text-white transition-all"
                                   onClick={async () => {
                                      const { data } = await supabase.from("attendance").select("*").eq("student_id", s.id).order("date", { ascending: false });
                                      setViewingAttendance({ student: s, records: data || [] });
                                   }}
                                >
                                   Adjust Record
                                </Button>
                             </TableCell>
                          </TableRow>
                       );
                    })}
                 </TableBody>
              </Table>
           </div>
        </div>
      )}
      {/* COMPACT ASSIGNMENT HUB */}
      {view === "assignments" && (
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div>
                 <h2 className="text-xl font-black text-navy-deep uppercase tracking-tighter leading-tight">Academic Assignments</h2>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Manage online tasks and secure testing</p>
              </div>
              <div className="flex flex-wrap gap-2">
                 <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input 
                       placeholder="Search assignments..." 
                       className="w-full bg-[#f8f9fa] pl-10 h-10 border rounded-xl font-bold text-xs" 
                       value={assignmentSearch} 
                       onChange={(e) => setAssignmentSearch(e.target.value)} 
                    />
                 </div>
                 <Button className="h-10 px-6 bg-navy text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg" onClick={() => { setSelectedAssignment(null); setIsAssignmentDialogOpen(true); }}>
                    <Plus size={16} className="mr-1" /> Create Assignment
                 </Button>
              </div>
           </div>
           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {allAssignments.filter(a => a.title.toLowerCase().includes(assignmentSearch.toLowerCase())).map(task => (
                 <div key={task.id} className="bg-white rounded-3xl border hover:border-gold/50 p-6 shadow-sm transition-all group relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><BookOpen size={80}/></div>
                    <div className="flex items-center justify-between mb-5 relative z-10">
                       <div className="px-3 py-1 bg-navy/5 text-navy text-[9px] font-black uppercase tracking-widest rounded-full border">ONLINE TASK</div>
                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <Button size="icon" variant="ghost" className="size-8 rounded-lg" onClick={() => { setSelectedAssignment(task); setIsAssignmentDialogOpen(true); }}><Edit size={14}/></Button>
                          <Button size="icon" variant="ghost" className="size-8 rounded-lg text-destructive" onClick={async () => { if(confirm("Delete assignment?")) { await supabase.from("assignments").delete().eq("id", task.id); fetchData(); } }}><Trash2 size={14}/></Button>
                       </div>
                    </div>
                    <h3 className="text-xl font-black text-navy-deep uppercase mb-2 tracking-tight leading-tight relative z-10">{task.title}</h3>
                    <div className="flex items-center gap-2 text-[9px] font-bold text-gold uppercase tracking-widest mb-4">
                       <Calendar size={12}/> Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No Deadline"}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-6 flex-1">{task.description}</p>
                    <div className="pt-4 border-t flex items-center justify-between">
                       <div className="flex items-center gap-2 text-[10px] font-black uppercase text-navy/40">
                          <Users size={14} /> {task.domain || "Global Task"}
                       </div>
                       <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${new Date(task.due_date) < new Date() ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                          {new Date(task.due_date) < new Date() ? "Expired" : "Active"}
                       </div>
                    </div>
                 </div>
              ))}
              {allAssignments.length === 0 && (
                 <div className="col-span-full py-20 bg-navy/5 rounded-3xl border border-dashed text-center">
                    <BookOpen size={48} className="mx-auto text-navy/20 mb-4" />
                    <h3 className="text-lg font-black text-navy-deep uppercase tracking-widest opacity-40">No assignments created yet</h3>
                    <Button variant="link" onClick={() => setIsAssignmentDialogOpen(true)} className="text-gold font-bold uppercase text-[10px] mt-2 tracking-widest">Click here to add your first task</Button>
                 </div>
              )}
           </div>
        </div>
      )}
      {/* COMPACT TRANSACTIONS */}
      {view === "transactions" && (
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div>
                 <h2 className="text-xl font-black text-navy-deep uppercase tracking-tighter leading-tight">Financial Transactions</h2>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Review student payments and fee processing</p>
              </div>
              <div className="flex flex-wrap gap-2">
                 <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input 
                       placeholder="Search by student name..." 
                       className="w-full bg-[#f8f9fa] pl-10 h-10 border rounded-xl font-bold text-xs outline-none" 
                       value={search} 
                       onChange={(e) => setSearch(e.target.value)} 
                    />
                 </div>
              </div>
           </div>
           <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <Table>
                 <TableHeader className="bg-secondary/5">
                    <TableRow>
                       <TableHead className="px-6 py-4 font-black uppercase text-[9px] tracking-widest text-navy/40">Date</TableHead>
                       <TableHead className="font-black uppercase text-[9px] tracking-widest text-navy/40">Student</TableHead>
                       <TableHead className="font-black uppercase text-[9px] tracking-widest text-navy/40">Roll Number</TableHead>
                       <TableHead className="font-black uppercase text-[9px] tracking-widest text-navy/40">Amount</TableHead>
                       <TableHead className="font-black uppercase text-[9px] tracking-widest text-navy/40">Status</TableHead>
                       <TableHead className="text-right px-6 font-black uppercase text-[9px] tracking-widest text-navy/40">Receipt</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    {payments.filter(p => (p.profiles?.full_name || "").toLowerCase().includes(search.toLowerCase())).map((p) => (
                       <TableRow key={p.id} className="hover:bg-gold/5 transition-all border-b last:border-0 h-16">
                          <TableCell className="px-6 font-bold text-xs text-muted-foreground">
                             {new Date(p.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-black text-navy-deep uppercase tracking-tight text-xs">
                             {p.profiles?.full_name || "Unknown"}
                             <div className="text-[9px] font-bold text-muted-foreground uppercase">{p.profiles?.email}</div>
                          </TableCell>
                          <TableCell className="font-mono font-bold text-gold text-xs">
                             {p.profiles?.university_roll_number || "—"}
                          </TableCell>
                          <TableCell className="font-black text-navy text-sm">
                             ₹{p.amount}
                          </TableCell>
                          <TableCell>
                             <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-green-50 text-green-600 flex items-center gap-1 w-max">
                                <CheckCircle2 className="size-3" /> Paid
                             </span>
                          </TableCell>
                          <TableCell className="text-right px-6">
                             {p.slip_url ? (
                                <Button size="sm" variant="ghost" className="text-navy hover:bg-navy/5" onClick={() => window.open(p.slip_url, '_blank')}>
                                   <Download className="size-4 mr-2" /> View
                                </Button>
                             ) : (
                                <span className="text-xs text-muted-foreground italic">No Slip</span>
                             )}
                          </TableCell>
                       </TableRow>
                    ))}
                    {payments.length === 0 && (
                       <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground italic text-sm">
                             No transactions found.
                          </TableCell>
                       </TableRow>
                    )}
                 </TableBody>
              </Table>
           </div>
        </div>
      )}
      {/* COMPACT PORTAL SETTINGS */}
      {view === "settings" && (
         <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
               <h2 className="text-xl font-black text-navy-deep uppercase tracking-tighter mb-4">Institutional Configuration</h2>
               <form onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const rawData = Object.fromEntries(fd);
                  // Construct college-wise fees object
                  const collegeFeesObj: Record<string, number> = {};
                  for (const key in rawData) {
                     if (key.startsWith('college_fee_')) {
                        const colId = key.substring('college_fee_'.length);
                        const val = rawData[key];
                        if (val) {
                           collegeFeesObj[colId] = Number(val);
                        }
                     }
                  }
                  const payload = {
                     id: 'global',
                     company_name: rawData.company_name,
                     company_address: rawData.company_address,
                     company_email: rawData.company_email,
                     company_phone: rawData.company_phone,
                     coordinator_name: rawData.coordinator_name,
                     coordinator_signature_url: rawData.coordinator_signature_url,
                     registration_fee: Number(rawData.registration_fee || 150),
                     college_fees: collegeFeesObj
                  };
                  setBusy(true);
                  const { error } = await supabase.from("portal_settings").upsert(payload);
                  setBusy(false);
                  if(!error) { toast.success("Settings Updated!"); fetchData(); }
               }} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                     {/* Company Details */}
                     <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase text-gold tracking-[0.2em] border-b pb-2">Corporate Identity</h3>
                        <div className="space-y-4">
                           <div className="space-y-2">
                              <Label className="text-[9px] font-black uppercase opacity-40">Company Name</Label>
                              <Input name="company_name" defaultValue={settings?.company_name} className="h-11 rounded-xl font-bold border-2" />
                           </div>
                           <div className="space-y-2">
                              <Label className="text-[9px] font-black uppercase opacity-40">Official Address</Label>
                              <textarea name="company_address" defaultValue={settings?.company_address} className="w-full h-24 bg-navy/5 border-2 rounded-xl p-3 text-xs font-bold outline-none focus:border-gold" />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                 <Label className="text-[9px] font-black uppercase opacity-40">Contact Email</Label>
                                 <Input name="company_email" defaultValue={settings?.company_email} className="h-11 rounded-xl font-bold border-2" />
                              </div>
                              <div className="space-y-2">
                                 <Label className="text-[9px] font-black uppercase opacity-40">Contact Phone</Label>
                                 <Input name="company_phone" defaultValue={settings?.company_phone} className="h-11 rounded-xl font-bold border-2" />
                              </div>
                           </div>
                        </div>
                     </div>
                     {/* Authentication Details */}
                     <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase text-gold tracking-[0.2em] border-b pb-2">Document Authentication</h3>
                        <div className="space-y-4">
                           <div className="space-y-2">
                              <Label className="text-[9px] font-black uppercase opacity-40">Internship Coordinator Name</Label>
                              <Input name="coordinator_name" defaultValue={settings?.coordinator_name} className="h-11 rounded-xl font-bold border-2" />
                           </div>
                           <div className="space-y-2">
                              <Label className="text-[9px] font-black uppercase opacity-40">Signature (Image URL or Base64)</Label>
                              <textarea name="coordinator_signature_url" defaultValue={settings?.coordinator_signature_url} placeholder="Paste image URL or Base64 data..." className="w-full h-24 bg-navy/5 border-2 rounded-xl p-3 text-[10px] font-mono outline-none focus:border-gold" />
                           </div>
                           {settings?.coordinator_signature_url && (
                              <div className="p-4 bg-navy/5 rounded-xl border border-dashed text-center">
                                 <div className="text-[8px] font-black uppercase opacity-40 mb-2">Signature Preview</div>
                                 <img src={settings.coordinator_signature_url} alt="Signature" className="h-16 mx-auto object-contain bg-white p-2 rounded-lg border shadow-sm" />
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
                  {/* Fee Configurations */}
                  <div className="space-y-4 border-t pt-6">
                     <h3 className="text-[10px] font-black uppercase text-gold tracking-[0.2em] border-b pb-2">Registration Fee Configurations</h3>
                     <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                           <Label className="text-[9px] font-black uppercase opacity-40">Default Registration Fee (₹)</Label>
                           <Input 
                              name="registration_fee" 
                              type="number" 
                              defaultValue={settings?.registration_fee || "150"} 
                              className="h-11 rounded-xl font-bold border-2" 
                              placeholder="150"
                           />
                           <p className="text-[9px] font-medium text-slate-400">Used as fallback if college-wise fee is not set.</p>
                        </div>
                     </div>
                     <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 mt-4">
                        <div>
                           <h4 className="text-xs font-black text-navy uppercase tracking-tight">College-wise Fee Customization</h4>
                           <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                              Set specific registration fees per institution. Leave empty to use the default fee.
                           </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2">
                           {universities.map(uni => (
                              <div key={uni.id} className="bg-white p-4 rounded-xl border space-y-3">
                                 <div className="text-[9px] font-black text-navy uppercase tracking-wider border-b pb-1.5 flex items-center gap-1.5">
                                    <School className="size-3 text-gold" /> {uni.name}
                                 </div>
                                 <div className="space-y-2">
                                    {(uni.colleges || []).map((col: any) => (
                                       <div key={col.id} className="flex items-center justify-between gap-3 text-xs">
                                          <span className="font-bold text-slate-600 truncate max-w-[180px]">{col.name}</span>
                                          <Input 
                                             name={`college_fee_${col.id}`} 
                                             type="number" 
                                             defaultValue={settings?.college_fees?.[col.id] || ""} 
                                             placeholder={settings?.registration_fee || "150"} 
                                             className="h-8 w-24 font-bold text-right text-xs rounded-lg border-2"
                                          />
                                       </div>
                                    ))}
                                    {(!uni.colleges || uni.colleges.length === 0) && (
                                       <span className="text-[9px] italic text-slate-400">No colleges registered</span>
                                    )}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
                  <div className="pt-6 border-t flex justify-end">
                     <Button type="submit" disabled={busy} className="bg-navy text-white px-12 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2">
                        {busy ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={18} /> Save Portal Configuration</>}
                     </Button>
                  </div>
               </form>
            </div>
         </div>
      )}
      {/* ONLINE LECTURES PANEL */}
      {/* ============ STUDENT LEADS VIEW ============ */}
      {view === "leads" && (() => {
        const filteredLeads = leads.filter(lead => {
          const q = leadsSearch.toLowerCase();
          const matchSearch = !q ||
            (lead.full_name||"").toLowerCase().includes(q) ||
            (lead.email||"").toLowerCase().includes(q) ||
            (lead.university_roll_number||"").toLowerCase().includes(q) ||
            (lead.college_name||"").toLowerCase().includes(q) ||
            (lead.program||"").toLowerCase().includes(q);
          let matchStatus = true;
          if (leadsStatusFilter === "paid") matchStatus = !!lead.is_claimed;
          else if (leadsStatusFilter === "pending") matchStatus = !lead.is_claimed;
          return matchSearch && matchStatus;
        });
        const totalLeads = leads.length;
        const paidLeads = leads.filter(l => l.is_claimed).length;
        const pendingLeads = leads.filter(l => !l.is_claimed).length;
        const paymentsForLeads = payments.filter(p => p.status === "Paid").length;
        return (
          <div className="space-y-5">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Leads", value: totalLeads, color: "bg-[#1e40af]", icon: Users },
                { label: "Paid & Registered", value: paidLeads, color: "bg-green-600", icon: CheckCircle2 },
                { label: "Pending Payment", value: pendingLeads, color: "bg-amber-500", icon: Clock },
                { label: "Total Payments", value: paymentsForLeads, color: "bg-navy", icon: CreditCard },
              ].map(card => (
                <div key={card.label} className="bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4">
                  <div className={`size-12 rounded-xl ${card.color} text-white grid place-items-center shadow-lg flex-shrink-0`}>
                    <card.icon size={22} />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-navy-deep leading-none">{card.value}</div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{card.label}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Toolbar */}
            <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-black text-navy-deep uppercase tracking-tight">All Registration Leads</h2>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    placeholder="Search by name, email, roll no..."
                    className="h-9 pl-9 pr-4 w-56 bg-slate-50 border rounded-xl text-xs font-bold outline-none focus:border-[#1e40af]"
                    value={leadsSearch}
                    onChange={e => setLeadsSearch(e.target.value)}
                  />
                </div>
                <select
                  value={leadsStatusFilter}
                  onChange={e => setLeadsStatusFilter(e.target.value)}
                  className="h-9 px-3 border-2 rounded-xl text-[10px] font-black bg-white outline-none focus:border-[#1e40af] text-slate-600"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid & Registered</option>
                  <option value="pending">Pending Payment</option>
                </select>
                <Button
                  variant="outline"
                  className="h-9 px-4 rounded-xl border text-[9px] font-black uppercase tracking-widest"
                  onClick={() => {
                    const headers = "Name,Email,Roll Number,College,University,Degree,Branch,Semester,Program,Status,Registered On";
                    const rows = filteredLeads.map(l =>
                      [
                        l.full_name||"",
                        l.email||"",
                        l.university_roll_number||"",
                        l.college_name||"",
                        l.university_name||"",
                        l.degree||"",
                        l.department||"",
                        l.semester||"",
                        l.program||"",
                        l.is_claimed ? "Paid & Registered" : "Pending Payment",
                        new Date(l.created_at).toLocaleDateString()
                      ].join(",")
                    ).join("\n");
                    const blob = new Blob([headers + "\n" + rows], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url; a.download = "leads_export.csv"; a.click();
                  }}
                >
                  <Download size={14} className="mr-1" /> Export CSV
                </Button>
              </div>
            </div>
            {/* Leads Table */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="px-5 font-black uppercase text-[9px] tracking-widest">#</TableHead>
                    <TableHead className="font-black uppercase text-[9px] tracking-widest">Student Name</TableHead>
                    <TableHead className="font-black uppercase text-[9px] tracking-widest">Contact Info</TableHead>
                    <TableHead className="font-black uppercase text-[9px] tracking-widest">Roll Number</TableHead>
                    <TableHead className="font-black uppercase text-[9px] tracking-widest">Institution</TableHead>
                    <TableHead className="font-black uppercase text-[9px] tracking-widest">Program</TableHead>
                    <TableHead className="font-black uppercase text-[9px] tracking-widest">Payment Status</TableHead>
                    <TableHead className="font-black uppercase text-[9px] tracking-widest">Registered On</TableHead>
                    <TableHead className="text-right px-5 font-black uppercase text-[9px] tracking-widest">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <Users size={36} className="opacity-30" />
                          <div className="text-xs font-bold uppercase tracking-widest">No leads found</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredLeads.map((lead, idx) => {
                    const isPaid = !!lead.is_claimed;
                    const studentPayment = payments.find(p =>
                      p.profiles?.email === lead.email ||
                      p.profiles?.university_roll_number === lead.university_roll_number
                    );
                    return (
                      <TableRow key={lead.id} className="hover:bg-slate-50/80 h-14 text-xs border-b last:border-0 group">
                        <TableCell className="px-5 font-mono text-slate-400 font-bold">{idx + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="size-8 rounded-lg bg-[#1e40af]/10 text-[#1e40af] grid place-items-center font-black text-xs uppercase flex-shrink-0">
                              {(lead.full_name||"").charAt(0)}
                            </div>
                            <div>
                              <div className="font-black text-navy-deep uppercase text-[10px]">{lead.full_name}</div>
                              <div className="text-[9px] text-slate-400 font-bold">{lead.gender || ""}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-[10px] font-bold text-slate-600">{lead.email || "—"}</div>
                          <div className="text-[9px] text-slate-400 font-mono">{lead.contact_number || ""}</div>
                        </TableCell>
                        <TableCell className="font-mono font-bold text-gold text-[10px]">{lead.university_roll_number || "—"}</TableCell>
                        <TableCell>
                          <div className="text-[10px] font-bold text-slate-700 max-w-[160px] truncate">{lead.college_name || "—"}</div>
                          <div className="text-[9px] text-slate-400 uppercase tracking-tight">{lead.university_name || ""}</div>
                        </TableCell>
                        <TableCell>
                          <span className="bg-navy/10 text-navy px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">
                            {lead.program || "Not Selected"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {isPaid ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-green-100 text-green-700 w-fit">
                                <CheckCircle2 size={10} /> Paid & Registered
                              </span>
                              {studentPayment && (
                                <span className="text-[8px] text-slate-400 font-bold pl-0.5">₹{studentPayment.amount}</span>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-amber-100 text-amber-700">
                              <Clock size={10} /> Pending Payment
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-[10px] font-bold text-slate-500">
                          {new Date(lead.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </TableCell>
                        <TableCell className="text-right px-5">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {studentPayment?.slip_url && (
                              <a
                                href={studentPayment.slip_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="View Payment Slip"
                              >
                                <Button size="icon" variant="ghost" className="size-8 rounded-lg border text-green-600">
                                  <CreditCard size={14} />
                                </Button>
                              </a>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-8 rounded-lg border text-red-500"
                              title="Delete Lead"
                              onClick={async () => {
                                if (confirm("Delete this lead record permanently?")) {
                                  await supabase.from("leads").delete().eq("id", lead.id);
                                  fetchData();
                                }
                              }}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {/* Footer Count */}
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
              Showing {filteredLeads.length} of {totalLeads} lead records
            </div>
          </div>
        );
      })()}
      {view === "marketing" && (
        <div className="space-y-6">
          {/* Main Layout Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* LEFT COLUMN: DRAFT TEMPLATE */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
              <div>
                <h2 className="text-lg font-black text-navy-deep uppercase tracking-tight flex items-center gap-2">
                  <Mail className="size-5 text-gold" /> Compose Template
                </h2>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                  Draft your email campaign with dynamic variable support
                </p>
              </div>
              <div className="space-y-1">
                <Label className="font-black text-[9px] uppercase tracking-widest">Email Subject *</Label>
                <Input
                  value={mailSubject}
                  onChange={(e) => setMailSubject(e.target.value)}
                  placeholder="e.g. Important Update for {Name}!"
                  className="h-10 rounded-xl font-bold bg-secondary/5 text-xs focus:ring-gold/30 focus:border-gold"
                  disabled={queueStatus === "sending"}
                />
              </div>
              <div className="space-y-1">
                <Label className="font-black text-[9px] uppercase tracking-widest">Message Body (Plain Text or HTML) *</Label>
                <Textarea
                  value={mailTemplate}
                  onChange={(e) => setMailTemplate(e.target.value)}
                  placeholder={`Hello {Name},\n\nWe are pleased to inform you that your university roll number {Roll Number} has been successfully registered for the {Program} internship domain.\n\nBest regards,\nTechLaunchpad Team`}
                  className="h-60 rounded-xl font-medium text-xs bg-secondary/5 focus:ring-gold/30 focus:border-gold p-3 resize-y"
                  disabled={queueStatus === "sending"}
                />
              </div>
              {/* Variable Placeholders Helper Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-dashed">
                <h3 className="text-[9.5px] font-black text-navy uppercase mb-2 flex items-center gap-1.5">
                  <Zap className="size-3 text-gold animate-pulse" /> Dynamic Placeholders
                </h3>
                {csvHeaders.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-500">
                      Click any variable below to insert it into your message:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {csvHeaders.map((header) => (
                        <button
                          key={header}
                          type="button"
                          onClick={() => {
                            if (queueStatus === "sending") return;
                            setMailTemplate(prev => prev + `{${header}}`);
                          }}
                          className="px-2 py-1 bg-white border border-slate-200 hover:border-gold text-[10px] font-mono font-bold text-navy-deep rounded-md transition-all active:scale-95 shadow-sm"
                        >
                          {`{${header}}`}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 italic">
                    Upload a CSV file in the right panel to automatically extract variable placeholders.
                  </p>
                )}
              </div>
            </div>
            {/* RIGHT COLUMN: RECIPIENTS & PREVIEW */}
            <div className="space-y-6">
              {/* CSV Upload Card */}
              <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
                <div>
                  <h2 className="text-lg font-black text-navy-deep uppercase tracking-tight flex items-center gap-2">
                    <FileUp className="size-5 text-gold" /> Upload Recipient List (CSV)
                  </h2>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                    Upload a CSV containing your subscribers' details
                  </p>
                </div>
                <div className="relative border-2 border-dashed border-slate-200 rounded-2xl hover:border-gold transition-all duration-300 group">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const text = ev.target?.result as string;
                        const { headers, data } = parseMarketingCSV(text);
                        if (headers.length === 0 || data.length === 0) {
                          toast.error("Invalid or empty CSV file!");
                          return;
                        }
                        const hasEmail = headers.some(h => h.toLowerCase() === "email");
                        if (!hasEmail) {
                          toast.warning("Warning: We couldn't find an 'Email' column in this CSV file. Please make sure one exists.");
                        }
                        setCsvHeaders(headers);
                        setCsvData(data);
                        setPreviewIndex(0);
                        setQueueIndex(0);
                        setQueueResults([]);
                        setQueueStatus("idle");
                        toast.success(`Successfully loaded ${data.length} recipients!`);
                      };
                      reader.readAsText(file);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={queueStatus === "sending"}
                  />
                  <div className="p-8 text-center space-y-2">
                    <FileUp className="size-10 text-slate-300 group-hover:text-gold mx-auto transition-colors duration-300" />
                    <div>
                      <p className="text-xs font-bold text-navy-deep uppercase">Click to browse or drag CSV file</p>
                      <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider">Supports any headers (Name, Roll, College, Email, etc.)</p>
                    </div>
                  </div>
                </div>
                {csvData.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-navy uppercase tracking-widest">
                        Parsed Recipients ({csvData.length})
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-[9px] font-black text-red-500 hover:bg-red-50 rounded-lg"
                        onClick={() => {
                          setCsvData([]);
                          setCsvHeaders([]);
                          setPreviewIndex(0);
                          setQueueIndex(0);
                          setQueueResults([]);
                          setQueueStatus("idle");
                        }}
                        disabled={queueStatus === "sending"}
                      >
                        Clear List
                      </Button>
                    </div>
                    <div className="border rounded-xl overflow-hidden max-h-32 overflow-y-auto">
                      <Table>
                        <TableHeader className="bg-slate-50 sticky top-0 z-20">
                          <TableRow>
                            {csvHeaders.slice(0, 4).map(h => (
                              <TableHead key={h} className="h-7 text-[8px] font-black uppercase text-navy-deep">
                                {h}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {csvData.slice(0, 10).map((row, idx) => (
                            <TableRow key={idx} className="h-7">
                              {csvHeaders.slice(0, 4).map(h => (
                                <TableCell key={h} className="p-1.5 px-3 text-[9.5px] font-medium text-slate-600 truncate max-w-[120px]">
                                  {row[h] || "—"}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {csvData.length > 10 && (
                      <p className="text-[9.5px] text-slate-400 italic text-right">
                        Showing first 10 of {csvData.length} recipients.
                      </p>
                    )}
                  </div>
                )}
              </div>
              {/* Template Live Preview Card */}
              {csvData.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-black text-navy-deep uppercase tracking-tight flex items-center gap-2">
                        <Eye className="size-5 text-gold" /> Live Preview
                      </h2>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        Preview personalized email compilation
                      </p>
                    </div>
                    {/* Navigation Controls */}
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-7 rounded-lg border-2"
                        onClick={() => setPreviewIndex(prev => Math.max(0, prev - 1))}
                        disabled={previewIndex === 0}
                      >
                      </Button>
                      <span className="text-[10px] font-black text-navy-deep font-mono px-2">
                        {previewIndex + 1} / {csvData.length}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-7 rounded-lg border-2"
                        onClick={() => setPreviewIndex(prev => Math.min(csvData.length - 1, prev + 1))}
                        disabled={previewIndex === csvData.length - 1}
                      >
                      </Button>
                    </div>
                  </div>
                  <div className="bg-slate-50 border rounded-2xl overflow-hidden shadow-inner">
                    {/* Simulated Header */}
                    <div className="bg-navy-deep p-4 text-white border-b border-slate-100 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="text-[9px] font-black text-gold uppercase tracking-[0.2em]">To Recipient</div>
                        <div className="text-[11px] font-mono truncate max-w-[200px] text-slate-200">
                          {(() => {
                            const recipient = csvData[previewIndex];
                            const emailKey = Object.keys(recipient).find(k => k.toLowerCase() === "email");
                            return emailKey ? recipient[emailKey] : "no-email-found";
                          })()}
                        </div>
                      </div>
                      <span className="bg-gold px-2 py-0.5 rounded text-[8px] font-black text-navy-deep uppercase tracking-widest">
                        Preview Mode
                      </span>
                    </div>
                    <div className="p-5 space-y-4">
                      {/* Subject Preview */}
                      <div className="space-y-0.5 border-b pb-3 border-slate-200/50">
                        <span className="text-[8px] font-black uppercase text-slate-400">Subject:</span>
                        <h4 className="text-xs font-black text-navy-deep">
                          {compileTemplate(mailSubject, csvData[previewIndex]) || "(Enter a subject)"}
                        </h4>
                      </div>
                      {/* Body Preview */}
                      <div className="space-y-1 min-h-[140px] text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                        {compileTemplate(mailTemplate, csvData[previewIndex]) || "(Enter a message template)"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* FULL-WIDTH BOTTOM CARD: CAMPAIGN LAUNCHPAD & REPORT */}
          {csvData.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
              {/* Campaign Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5 border-slate-100">
                <div className="space-y-1">
                  <h3 className="text-base font-black text-navy-deep uppercase tracking-tight flex items-center gap-2">
                    <Activity className="size-5 text-gold" /> Campaign Launchpad
                  </h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Coordinate bulk email distribution
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {queueStatus === "idle" && (
                    <Button
                      onClick={() => {
                        if (!mailSubject.trim() || !mailTemplate.trim()) {
                          toast.error("Subject and Template are required before launching campaign!");
                          return;
                        }
                        setQueueStatus("sending");
                        toast.info("Starting mailing campaign...");
                      }}
                      className="h-10 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg flex items-center gap-2"
                    >
                    </Button>
                  )}
                  {queueStatus === "sending" && (
                    <Button
                      onClick={() => {
                        setQueueStatus("paused");
                        toast.warning("Campaign paused.");
                      }}
                      className="h-10 px-8 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg flex items-center gap-2"
                    >
                    </Button>
                  )}
                  {queueStatus === "paused" && (
                    <Button
                      onClick={() => {
                        setQueueStatus("sending");
                        toast.info("Resuming campaign...");
                      }}
                      className="h-10 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg flex items-center gap-2"
                    >
                    </Button>
                  )}
                  {(queueStatus === "sending" || queueStatus === "paused" || queueStatus === "completed") && (
                    <Button
                      onClick={() => {
                        if (confirm("Reset sending queue? This will stop the current progress and clear the delivery logs.")) {
                          setQueueStatus("idle");
                          setQueueIndex(0);
                          setQueueResults([]);
                        }
                      }}
                      variant="outline"
                      className="h-10 px-6 border-2 rounded-xl text-navy hover:bg-gold/10 font-black uppercase text-[10px] tracking-widest"
                    >
                    </Button>
                  )}
                </div>
              </div>
              {/* Progress Panel */}
              <div className="grid md:grid-cols-4 gap-6">
                {/* Stats Counters */}
                <div className="md:col-span-1 grid grid-cols-3 gap-2">
                  <div className="bg-slate-50 border p-3 rounded-xl text-center">
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Pending</div>
                    <div className="text-lg font-black text-navy-deep mt-1 font-mono">
                      {Math.max(0, csvData.length - queueIndex)}
                    </div>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-center">
                    <div className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Sent</div>
                    <div className="text-lg font-black text-emerald-700 mt-1 font-mono">
                      {queueResults.filter(r => r.status === "success").length}
                    </div>
                  </div>
                  <div className="bg-red-50 border border-red-100 p-3 rounded-xl text-center">
                    <div className="text-[8px] font-black text-red-600 uppercase tracking-widest">Failed</div>
                    <div className="text-lg font-black text-red-700 mt-1 font-mono">
                      {queueResults.filter(r => r.status === "failed").length}
                    </div>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="md:col-span-3 space-y-2 flex flex-col justify-center">
                  <div className="flex justify-between items-center text-[10px] font-black text-navy-deep uppercase tracking-widest">
                    <span>Sending Progress</span>
                    <span className="font-mono">
                      {csvData.length > 0 ? Math.round((queueIndex / csvData.length) * 100) : 0}% ({queueIndex} / {csvData.length})
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden border shadow-inner">
                    <div
                      className="bg-gradient-to-r from-gold via-yellow-500 to-emerald-500 h-full transition-all duration-300 ease-out"
                      style={{ width: `${csvData.length > 0 ? (queueIndex / csvData.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
              {/* Delivery Logs */}
              {queueResults.length > 0 && (
                <div className="space-y-3 pt-3 border-t">
                  <h4 className="text-[10px] font-black text-navy uppercase tracking-widest">Delivery Reports</h4>
                  <div className="border rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                    <Table>
                      <TableHeader className="bg-slate-50 sticky top-0 z-20">
                        <TableRow>
                          <TableHead className="h-9 text-[8px] font-black uppercase text-navy-deep">#</TableHead>
                          <TableHead className="h-9 text-[8px] font-black uppercase text-navy-deep">Recipient Email</TableHead>
                          <TableHead className="h-9 text-[8px] font-black uppercase text-navy-deep">Status</TableHead>
                          <TableHead className="h-9 text-[8px] font-black uppercase text-navy-deep">Details / Errors</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {queueResults.map((result, idx) => (
                          <TableRow key={idx} className="h-9">
                            <TableCell className="py-2 text-[10px] font-black text-slate-400 font-mono">
                              {idx + 1}
                            </TableCell>
                            <TableCell className="py-2 text-[10.5px] font-bold text-navy-deep">
                              {result.to}
                            </TableCell>
                            <TableCell className="py-2">
                              {result.status === "success" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8.5px] font-black bg-emerald-50 text-emerald-700 uppercase tracking-widest border border-emerald-100">
                                  <CheckCircle2 className="size-3 text-emerald-600" /> SUCCESS
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8.5px] font-black bg-red-50 text-red-700 uppercase tracking-widest border border-red-100">
                                  <XCircle className="size-3 text-red-600" /> FAILED
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="py-2 text-[10px] font-medium text-slate-500">
                              {result.status === "success" ? (
                                <span className="text-slate-400 font-bold uppercase text-[9px]">Delivered successfully</span>
                              ) : (
                                <span className="text-red-500 font-bold">{result.error}</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {view === "trainings" && (
         <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-4">
               <div>
                  <h2 className="text-lg font-black text-navy-deep uppercase tracking-tight">Training Programs</h2>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Manage bootcamps, courses, and student enrollments</p>
               </div>
               <div className="flex gap-2">
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                     <button onClick={() => setTrainingTab("list")} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${trainingTab === "list" ? "bg-white text-navy shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>Programs</button>
                     <button onClick={() => setTrainingTab("leads")} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${trainingTab === "leads" ? "bg-white text-navy shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>Leads ({trainingLeads.length})</button>
                     <button onClick={() => setTrainingTab("enrolled")} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${trainingTab === "enrolled" ? "bg-white text-navy shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>Enrolled ({trainingEnrollments.length})</button>
                     <button onClick={() => setTrainingTab("transactions")} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${trainingTab === "transactions" ? "bg-white text-navy shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>Payments</button>
                  </div>
                  <Button className="h-10 px-6 bg-navy text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg flex items-center gap-1.5" onClick={() => {
                     setTName(""); setTType("online"); setTDuration(5); setTStartDate(""); setTEndDate(""); setTThumbnail(""); setTFee(999);
                     setIsAddTrainingOpen(true);
                  }}>
                     <Plus size={16} /> New Training
                  </Button>
               </div>
            </div>
            {loadingTrainings ? (
               <div className="text-center py-20 bg-white rounded-2xl border shadow-sm">
                  <Loader2 className="animate-spin size-8 text-gold mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Syncing training data...</p>
               </div>
            ) : trainingTab === "list" ? (
               <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {trainings.map(t => (
                     <div key={t.id} className="group overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                        <div className="relative aspect-video bg-navy/5 flex items-center justify-center overflow-hidden border-b">
                           {t.thumbnail_url ? (
                              <img src={t.thumbnail_url} alt={t.name} className="absolute inset-0 w-full h-full object-cover" />
                           ) : (
                              <BookOpen className="size-10 text-navy/20" />
                           )}
                           <div className="absolute top-3 right-3 rounded-md bg-navy/80 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                              {t.type} | {t.duration_days} Days
                           </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                           <h3 className="font-display font-black text-navy-deep text-sm uppercase tracking-tight mb-2">{t.name}</h3>
                           <div className="text-[10px] font-bold text-slate-400 mb-2 flex items-center gap-1"><Calendar className="size-3"/> {t.start_date ? new Date(t.start_date).toLocaleDateString() : 'TBA'} - {t.end_date ? new Date(t.end_date).toLocaleDateString() : 'TBA'}</div>
                           <div className="text-[11px] font-black text-green-600 mb-4">₹{(t.fee ?? 999).toLocaleString('en-IN')} <span className="text-slate-400 font-medium text-[9px]">/enrollment</span></div>
                           <div className="mt-auto pt-4 border-t flex items-center justify-between">
                              <Button size="sm" variant="outline" className="h-8 text-[9px] font-black uppercase tracking-widest" onClick={() => { setViewingTraining(t); fetchTrainingLecturesForAdmin(t.id); }}>
                                 Sessions
                              </Button>
                              <div className="flex gap-1">
                                 <Button size="icon" variant="ghost" className="size-8" onClick={() => {
                                    setSelectedTraining(t);
                                    setTName(t.name); setTType(t.type); setTDuration(t.duration_days); setTStartDate(t.start_date ? t.start_date.substring(0,16) : ""); setTEndDate(t.end_date ? t.end_date.substring(0,16) : ""); setTThumbnail(t.thumbnail_url || ""); setTFee(t.fee ?? 999);
                                    setIsEditTrainingOpen(true);
                                 }}><Edit size={14}/></Button>
                                 <Button size="icon" variant="ghost" className="size-8 text-red-500" onClick={() => onDeleteTraining(t.id)}><Trash2 size={14}/></Button>
                              </div>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            ) : trainingTab === "leads" ? (
               <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                  <Table>
                     <TableHeader className="bg-slate-50"><TableRow>
                        <TableHead className="font-black text-[9px] uppercase">Name</TableHead>
                        <TableHead className="font-black text-[9px] uppercase">Contact</TableHead>
                        <TableHead className="font-black text-[9px] uppercase">Institution</TableHead>
                        <TableHead className="font-black text-[9px] uppercase">Program Details</TableHead>
                        <TableHead className="font-black text-[9px] uppercase">Status</TableHead>
                     </TableRow></TableHeader>
                     <TableBody>
                        {trainingLeads.map(l => (
                           <TableRow key={l.id} className="text-xs font-bold">
                              <TableCell className="text-navy">{l.name}</TableCell>
                              <TableCell className="text-slate-500">{l.email}<br/><span className="text-[9px]">{l.phone}</span></TableCell>
                              <TableCell className="text-slate-500">{l.college}<br/><span className="text-[9px]">{l.university}</span></TableCell>
                              <TableCell className="text-slate-500">{l.subject || 'N/A'}<br/><span className="text-[9px]">{l.roll_number || 'N/A'}</span></TableCell>
                              <TableCell>
                                 <span className={`px-2 py-0.5 rounded-full text-[8px] uppercase tracking-widest ${l.status === 'claimed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{l.status.replace('_',' ')}</span>
                              </TableCell>
                           </TableRow>
                        ))}
                     </TableBody>
                  </Table>
               </div>
            ) : trainingTab === "enrolled" ? (
               <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                  <Table>
                     <TableHeader className="bg-slate-50"><TableRow>
                        <TableHead className="font-black text-[9px] uppercase">Student</TableHead>
                        <TableHead className="font-black text-[9px] uppercase">Program</TableHead>
                        <TableHead className="font-black text-[9px] uppercase">Status</TableHead>
                        <TableHead className="text-right font-black text-[9px] uppercase">Action</TableHead>
                     </TableRow></TableHeader>
                     <TableBody>
                        {trainingEnrollments.map(e => (
                           <TableRow key={e.id} className="text-xs font-bold">
                              <TableCell className="text-navy">{e.profiles?.full_name}<br/><span className="text-[9px] text-slate-400">{e.profiles?.email}</span></TableCell>
                              <TableCell className="text-slate-500">{e.trainings?.name}</TableCell>
                              <TableCell>
                                 <span className={`px-2 py-0.5 rounded-full text-[8px] uppercase tracking-widest ${e.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{e.status}</span>
                              </TableCell>
                              <TableCell className="text-right">
                                 <Button size="sm" variant="outline" className="h-7 text-[9px] uppercase" onClick={async () => {
                                    const newStat = e.status === 'completed' ? 'enrolled' : 'completed';
                                    await supabase.from("training_enrollments").update({ status: newStat }).eq("id", e.id);
                                    fetchTrainingsData();
                                 }}>Toggle Status</Button>
                              </TableCell>
                           </TableRow>
                        ))}
                     </TableBody>
                  </Table>
               </div>
            ) : (
                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                  <Table>
                     <TableHeader className="bg-slate-50"><TableRow>
                        <TableHead className="font-black text-[9px] uppercase">Txn ID</TableHead>
                        <TableHead className="font-black text-[9px] uppercase">Student</TableHead>
                        <TableHead className="font-black text-[9px] uppercase">Program</TableHead>
                        <TableHead className="font-black text-[9px] uppercase">Amount</TableHead>
                        <TableHead className="font-black text-[9px] uppercase">Sales Rep</TableHead>
                        <TableHead className="font-black text-[9px] uppercase">Status</TableHead>
                     </TableRow></TableHeader>
                     <TableBody>
                        {trainingTransactions.map(tx => (
                           <TableRow key={tx.id} className="text-xs font-bold">
                              <TableCell className="font-mono text-[10px] text-slate-500">{tx.transaction_id || 'Manual'}</TableCell>
                              <TableCell className="text-navy">{tx.training_enrollments?.profiles?.full_name}</TableCell>
                              <TableCell className="text-slate-500">{tx.training_enrollments?.trainings?.name}</TableCell>
                              <TableCell className="text-green-600">₹{tx.amount}</TableCell>
                              <TableCell className="text-slate-500">
                                 {tx.sales_rep?.full_name ? (
                                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[9px] border border-blue-100 font-black uppercase">
                                       {tx.sales_rep.full_name}
                                    </span>
                                 ) : (
                                    <span className="text-slate-400 italic font-normal">Direct / Organic</span>
                                 )}
                              </TableCell>
                              <TableCell>
                                 <span className="px-2 py-0.5 rounded-full text-[8px] uppercase tracking-widest bg-green-100 text-green-700">{tx.status}</span>
                              </TableCell>
                           </TableRow>
                        ))}
                     </TableBody>
                  </Table>
               </div>
            )}
         </div>
      )}
      {view === "lectures" && (
         <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-4">
               <div>
                  <h2 className="text-lg font-black text-navy-deep uppercase tracking-tight">Active Online Lectures</h2>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Manage virtual training classes, video recordings, and study sheets</p>
               </div>
               <Button className="h-10 px-6 bg-navy text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg flex items-center gap-1.5" onClick={() => {
                  setNewLectureTitle("");
                  setNewLectureDomain("");
                  setNewLectureMode("Google Meet");
                  setNewLectureModeCustom("");
                  setNewLectureLink("");
                  setNewLectureDesc("");
                  setNewLectureMaterialPdf(null);
                  setNewLectureMaterialLink("");
                  setIsAddLectureOpen(true);
               }}>
                  <Plus size={16} /> New Lecture
               </Button>
            </div>
            {loadingLectures ? (
               <div className="text-center py-20 bg-white rounded-2xl border shadow-sm">
                  <Loader2 className="animate-spin size-8 text-gold mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Syncing lectures with server...</p>
               </div>
            ) : lecturesList.length === 0 ? (
               <div className="bg-white rounded-2xl border border-dashed p-16 text-center text-muted-foreground shadow-sm">
                  <Video className="mx-auto size-12 opacity-20 mb-4" />
                  <p className="font-bold text-sm text-navy-deep uppercase mb-1">No online lectures scheduled</p>
                  <p className="text-xs">Use the button above to publish your first lecture recording or live link.</p>
               </div>
            ) : (
               <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {lecturesList.map((l) => {
                     let descText = l.description;
                     let domainName = "";
                     let modeName = "";
                     let pdfUrl = "";
                     let materialLink = "";
                     try {
                        const parsed = JSON.parse(l.description);
                        descText = parsed.description || "";
                        domainName = parsed.domain || "";
                        modeName = parsed.mode || "";
                        pdfUrl = parsed.material_pdf || "";
                        materialLink = parsed.material_link || "";
                     } catch (e) {
                        // Fallback for raw string description
                     }
                     const ytVideoId = getYouTubeId(l.link);
                     return (
                        <div key={l.id} className="group overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full">
                           <div>
                              <div className="relative aspect-video bg-navy-deep/10 flex items-center justify-center overflow-hidden border-b">
                                 {ytVideoId ? (
                                    <>
                                       <img src={`https://img.youtube.com/vi/${ytVideoId}/hqdefault.jpg`} alt={l.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                       <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/35 transition-all">
                                          <div className="size-11 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                                             <Video className="size-5" />
                                          </div>
                                       </div>
                                    </>
                                 ) : (
                                    <div className="text-center p-6 space-y-2">
                                       <Video className="size-10 text-navy-deep/40 mx-auto" />
                                       <span className="text-[10px] font-mono text-muted-foreground block truncate max-w-[200px]">{l.link}</span>
                                    </div>
                                 )}
                                 {modeName && (
                                    <div className="absolute top-3 right-3 rounded-md bg-navy/80 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
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
                                 <h3 className="font-display font-black text-navy-deep text-sm line-clamp-1 uppercase tracking-tight">{l.title}</h3>
                                 <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{descText || "No description provided."}</p>
                              </div>
                           </div>
                           <div className="p-5 pt-0 mt-2 space-y-4">
                              {(pdfUrl || materialLink) && (
                                 <div className="flex flex-wrap gap-2 border-t pt-3 border-slate-50">
                                    {pdfUrl && (
                                       <Button size="sm" variant="outline" className="h-7 text-[9px] font-black bg-emerald-55 bg-opacity-10 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border-emerald-200/50 px-2.5 rounded-lg flex items-center gap-1" onClick={() => window.open(pdfUrl, '_blank')}>
                                          PDF MATERIAL
                                       </Button>
                                    )}
                                    {materialLink && (
                                       <Button size="sm" variant="outline" className="h-7 text-[9px] font-black bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 border-indigo-200/50 px-2.5 rounded-lg flex items-center gap-1" onClick={() => window.open(materialLink, '_blank')}>
                                          RESOURCES
                                       </Button>
                                    )}
                                 </div>
                              )}
                              <div className="flex items-center justify-between border-t pt-3 border-slate-100">
                                 <div className="text-[9px] font-bold text-slate-400">
                                    {new Date(l.created_at).toLocaleDateString()}
                                 </div>
                                 <div className="flex gap-1.5">
                                    <Button size="sm" variant="outline" className="h-8 text-[10px] font-bold border-2 rounded-xl text-navy hover:bg-gold/10" onClick={() => {
                                       let descText = l.description;
                                       let domainName = "";
                                       let modeName = "Google Meet";
                                       let pdfUrl = "";
                                       let materialLink = "";
                                       try {
                                          const parsed = JSON.parse(l.description);
                                          descText = parsed.description || "";
                                          domainName = parsed.domain || "";
                                          modeName = parsed.mode || "Google Meet";
                                          pdfUrl = parsed.material_pdf || "";
                                          materialLink = parsed.material_link || "";
                                       } catch (e) {
                                          // fallback
                                       }
                                       setSelectedLecture(l);
                                       setEditLectureTitle(l.title || "");
                                       setEditLectureDomain(domainName);
                                       setEditLectureDesc(descText);
                                       setEditLectureLink(l.link || "");
                                       setEditLectureExistingPdfUrl(pdfUrl);
                                       setEditLectureMaterialLink(materialLink);
                                       setEditLectureMaterialPdf(null);
                                       const standardModes = ["Online", "YouTube", "Google Meet"];
                                       if (standardModes.includes(modeName)) {
                                          setEditLectureMode(modeName);
                                          setEditLectureModeCustom("");
                                       } else {
                                          setEditLectureMode("Other");
                                          setEditLectureModeCustom(modeName);
                                       }
                                       setIsEditLectureOpen(true);
                                    }}>
                                       Edit
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-8 text-[10px] font-bold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl" onClick={() => handleDeleteLecture(l.id)}>
                                       Delete
                                    </Button>
                                 </div>
                              </div>
                           </div>
                        </div>
                     );
                  })}
               </div>
            )}
         </div>
      )}
      {/* Student Form Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(o) => { if(!o) { setIsAddDialogOpen(false); setIsEditDialogOpen(false); setSelectedStudent(null); } }}>
         <DialogContent className="max-w-5xl rounded-3xl p-0 border-none shadow-2xl overflow-hidden bg-white">
            <div className="bg-navy p-8 text-white flex items-center justify-between relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10"><GraduationCap size={120} /></div>
               <div className="relative z-10">
                  <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-1">{selectedStudent ? "Update Record" : "Enrollment Control"}</h2>
                  <p className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] opacity-80">Manual Student Provisioning System</p>
               </div>
            </div>
            <form onSubmit={onSaveStudent} className="grid md:grid-cols-3 gap-6 p-10 max-h-[70vh] overflow-y-auto">
                <div className="space-y-1"><Label className="font-black text-[9px] uppercase">Name *</Label><Input name="full_name" defaultValue={selectedStudent?.full_name} required className="h-10 rounded-xl font-bold bg-secondary/5 text-xs" /></div>
                <div className="space-y-1"><Label className="font-black text-[9px] uppercase">Email *</Label><Input name="email" defaultValue={selectedStudent?.email} type="email" required className="h-10 rounded-xl font-bold bg-secondary/5 text-xs" /></div>
                <div className="space-y-1"><Label className="font-black text-[9px] uppercase">Contact *</Label><Input name="contact_number" defaultValue={selectedStudent?.contact_number} required className="h-10 rounded-xl font-bold bg-secondary/5 text-xs" /></div>
                <div className="space-y-1"><Label className="font-black text-[9px] uppercase">Gender</Label><select name="gender" defaultValue={selectedStudent?.gender} className="w-full h-10 border rounded-xl px-3 font-bold text-xs bg-secondary/5"><option value="Male">MALE</option><option value="Female">FEMALE</option></select></div>
                <div className="space-y-1"><Label className="font-black text-[9px] uppercase">Parent</Label><Input name="parent_name" defaultValue={selectedStudent?.parent_name} className="h-10 border rounded-xl font-bold bg-secondary/5 text-xs" /></div>
                <div className="space-y-1">
                   <select
                     className="w-full h-10 border rounded-xl px-3 font-black text-xs bg-secondary/5"
                     value={studentStateFilter}
                     onChange={(e) => { setStudentStateFilter(e.target.value); setActiveUni(""); setActiveCol(""); setFilteredColleges([]); setActiveStructures([]); }}
                     required
                   >
                     <option value="">SELECT STATE</option>
                     {INDIAN_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                   </select>
                 </div>
                <div className="space-y-1"><Label className="font-black text-[9px] uppercase text-gold">University *</Label><select className="w-full h-10 border border-gold/20 rounded-xl px-3 font-black text-xs bg-gold/5" value={activeUni} onChange={(e) => handleUniSelect(e.target.value)} required disabled={!studentStateFilter}><option value="">SELECT UNI</option>{universities.filter(u => !studentStateFilter || u.state === studentStateFilter).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
                <div className="space-y-1"><Label className="font-black text-[9px] uppercase text-gold">College *</Label><select className="w-full h-10 border border-gold/20 rounded-xl px-3 font-black text-xs bg-gold/5" value={activeCol} disabled={!activeUni} onChange={(e) => handleColSelect(e.target.value)} required><option value="">SELECT COLLEGE</option>{filteredColleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div className="space-y-1"><Label className="font-black text-[9px] uppercase">Branch</Label><select name="department" defaultValue={selectedStudent?.department} className="w-full h-10 border rounded-xl px-3 font-black text-xs" disabled={!activeCol} required><option value="">BRANCH</option>{Array.from(new Set(activeStructures.map(s => s.department))).map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                <div className="space-y-1"><Label className="font-black text-[9px] uppercase">Degree</Label><select name="degree" defaultValue={selectedStudent?.degree} className="w-full h-10 border rounded-xl px-3 font-black text-xs" disabled={!activeCol} required>{Array.from(new Set(activeStructures.map(s => s.degree))).map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                <div className="space-y-1"><Label className="font-black text-[9px] uppercase">Session</Label><select name="academic_session" defaultValue={selectedStudent?.academic_session} className="w-full h-10 border rounded-xl px-3 font-black text-xs" disabled={!activeCol} required>{Array.from(new Set(activeStructures.map(s => s.session))).map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                <div className="space-y-1"><Label className="font-black text-[9px] uppercase">Roll No *</Label><Input name="university_roll_number" defaultValue={selectedStudent?.university_roll_number} required className="h-10 rounded-xl font-mono text-xs" /></div>
                <div className="space-y-1"><Label className="font-black text-[9px] uppercase">Semester *</Label><Input name="semester" defaultValue={selectedStudent?.semester} required placeholder="e.g. 4th" className="h-10 rounded-xl text-xs" /></div>
                <div className="space-y-1"><Label className="font-black text-[9px] uppercase text-navy">Internship *</Label><select name="program" defaultValue={selectedStudent?.program} className="w-full h-10 border-2 border-navy/20 rounded-xl px-3 font-black text-xs bg-navy/5">{internships.map(i => <option key={i.id} value={i.title}>{i.title}</option>)}</select></div>
                <div className="pt-6 md:col-span-3 flex justify-end gap-3 border-t">
                  <Button type="button" variant="ghost" onClick={() => { setIsAddDialogOpen(false); setIsEditDialogOpen(false); }} className="px-6 text-[10px] uppercase font-black" disabled={busy}>Abort</Button>
                  <Button type="submit" disabled={busy} className="bg-navy text-white px-10 h-11 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl">
                    {busy ? <Loader2 className="animate-spin mr-2" /> : "SAVE DATA & CREATE ACCOUNT"}
                  </Button>
                </div>
             </form>
         </DialogContent>
      </Dialog>
      {/* Manual Modal (Staging) */}
      <Dialog open={isAddPreRegOpen || isEditPreRegOpen} onOpenChange={(o) => { if(!o) { setIsAddPreRegOpen(false); setIsEditPreRegOpen(false); setSelectedPreReg(null); } }}>
         <DialogContent className="max-w-4xl rounded-2xl p-6">
            <DialogHeader>
               <DialogTitle className="text-lg font-black text-navy uppercase border-b pb-2">Manual Entry (Staging Profile)</DialogTitle>
               <DialogDescription className="text-[10px] font-bold text-gold uppercase tracking-widest">Provide Academic & Identity Details</DialogDescription>
            </DialogHeader>
            <form onSubmit={async (e) => { 
               e.preventDefault(); 
               const fd = new FormData(e.currentTarget); 
               const data = Object.fromEntries(fd);
               await supabase.from(selectedPreReg?._source === 'lead' ? 'leads' : 'pre_registrations').upsert({ id: selectedPreReg?.id, ...data });
               toast.success("Done!"); setIsAddPreRegOpen(false); setIsEditPreRegOpen(false); fetchData(); 
            }} className="grid gap-4 py-4 md:grid-cols-3">
               <div className="space-y-1"><Label className="text-[9px] uppercase">Full Name *</Label><Input name="full_name" defaultValue={selectedPreReg?.full_name} required className="h-9 rounded-xl text-xs" /></div>
               <div className="space-y-1">
                  <Label className="text-[9px] uppercase">Gender *</Label>
                  <select name="gender" defaultValue={selectedPreReg?.gender || "Male"} required className="w-full h-9 border rounded-xl px-2 text-xs bg-white outline-none">
                     <option value="Male">Male</option>
                     <option value="Female">Female</option>
                  </select>
               </div>
               <div className="space-y-1"><Label className="text-[9px] uppercase">Father's Name *</Label><Input name="parent_name" defaultValue={selectedPreReg?.parent_name} required className="h-9 rounded-xl text-xs" /></div>
               <div className="space-y-1"><Label className="text-[9px] uppercase">Mobile No *</Label><Input name="contact_number" defaultValue={selectedPreReg?.contact_number} required className="h-9 rounded-xl text-xs" /></div>
               <div className="space-y-1"><Label className="text-[9px] uppercase">Email Address *</Label><Input name="email" defaultValue={selectedPreReg?.email} type="email" required className="h-9 rounded-xl text-xs" /></div>
               <div className="space-y-1"><Label className="text-[9px] uppercase">University Name *</Label><Input name="university_name" defaultValue={selectedPreReg?.university_name} required className="h-9 rounded-xl text-xs" /></div>
               <div className="space-y-1"><Label className="text-[9px] uppercase">College Name *</Label><Input name="college_name" defaultValue={selectedPreReg?.college_name} required className="h-9 rounded-xl text-xs" /></div>
               <div className="space-y-1"><Label className="text-[9px] uppercase">Branch *</Label><Input name="department" defaultValue={selectedPreReg?.department} required className="h-9 rounded-xl text-xs" /></div>
               <div className="space-y-1"><Label className="text-[9px] uppercase">Degree *</Label><Input name="degree" defaultValue={selectedPreReg?.degree} required className="h-9 rounded-xl text-xs" /></div>
               <div className="space-y-1"><Label className="text-[9px] uppercase">Roll Number *</Label><Input name="university_roll_number" defaultValue={selectedPreReg?.university_roll_number} required className="h-9 rounded-xl text-xs font-mono" /></div>
               <div className="space-y-1"><Label className="text-[9px] uppercase">Semester *</Label><Input name="semester" defaultValue={selectedPreReg?.semester} required className="h-9 rounded-xl text-xs" /></div>
               <div className="pt-6 md:col-span-3 flex justify-end gap-3 border-t">
                  <Button type="button" variant="ghost" onClick={() => { setIsAddPreRegOpen(false); setIsEditPreRegOpen(false); }} className="text-xs uppercase font-black">Cancel</Button>
                  <Button type="submit" className="bg-navy text-white px-8 h-10 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">COMMIT TO STAGING</Button>
               </div>
            </form>
         </DialogContent>
      </Dialog>
      <Dialog open={isAddUniOpen || isEditUniOpen} onOpenChange={(o) => { if(!o) { setIsAddUniOpen(false); setIsEditUniOpen(false); setSelectedUniForCollege(null); setUniStateForDialog(""); } }}>
         <DialogContent className="max-w-md rounded-2xl p-6">
            <DialogHeader><DialogTitle className="text-lg font-black text-[#1e40af] uppercase">{selectedUniForCollege ? "Edit University" : "Add University"}</DialogTitle></DialogHeader>
            <form onSubmit={async (e) => { 
               e.preventDefault(); 
               const fd = new FormData(e.currentTarget);
               const { error: uErr } = await supabase.from("universities").upsert({ 
                 id: selectedUniForCollege?.id, 
                 name: fd.get("name"),
                 state: uniStateForDialog || null
               });
               if (uErr) { toast.error("Error: " + uErr.message); return; }
               toast.success("University saved!"); setIsAddUniOpen(false); setIsEditUniOpen(false); setSelectedUniForCollege(null); setUniStateForDialog(""); fetchData(); 
            }} className="space-y-4 py-4">
               <div className="space-y-1">
                 <Label className="text-[9px] uppercase">University Name</Label>
                 <Input name="name" defaultValue={selectedUniForCollege?.name} required className="h-10 rounded-xl text-xs" />
               </div>
               <div className="space-y-1">
                 <select
                   value={uniStateForDialog}
                   onChange={(e) => setUniStateForDialog(e.target.value)}
                   required
                   className="w-full h-10 border-2 border-[#1e40af]/20 rounded-xl px-3 font-bold text-xs bg-blue-50/50 outline-none focus:border-[#1e40af]"
                 >
                   <option value="">-- SELECT STATE --</option>
                   {INDIAN_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                 </select>
               </div>
               <div className="flex justify-end gap-3 pt-4">
                 <Button type="button" variant="ghost" onClick={() => { setIsAddUniOpen(false); setIsEditUniOpen(false); setUniStateForDialog(""); }}>Cancel</Button>
                 <Button type="submit" className="bg-[#1e40af] text-white px-8 h-10 rounded-xl font-black text-[10px] uppercase tracking-widest">SAVE</Button>
               </div>
            </form>
         </DialogContent>
      </Dialog>
      <Dialog open={isAddCollegeOpen || isEditColOpen} onOpenChange={(o) => { if(!o) { setIsAddCollegeOpen(false); setIsEditColOpen(false); setSelectedColForStructure(null); } }}>
         <DialogContent className="max-w-md rounded-2xl p-6">
            <DialogHeader><DialogTitle className="text-lg font-black text-[#1e40af] uppercase">{selectedColForStructure ? "Edit College" : "Add College"}</DialogTitle></DialogHeader>
            <form onSubmit={async (e) => { 
               e.preventDefault(); 
               const fd = new FormData(e.currentTarget); 
               const uId = selectedUniForCollege?.id || explorerUni?.id;
               await supabase.from("colleges").upsert({ id: selectedColForStructure?.id, name: fd.get("name"), university_id: uId }); 
               if (uId) await syncNewCollegesStructures(uId);
               toast.success("Success!"); setIsAddCollegeOpen(false); setIsEditColOpen(false); fetchData(); 
            }} className="space-y-4 py-4">
               <div className="space-y-1"><Label className="text-[9px] uppercase">College Name</Label><Input name="name" defaultValue={selectedColForStructure?.name} required className="h-10 rounded-xl text-xs" /></div>
               <div className="flex justify-end gap-3 pt-4"><Button type="button" variant="ghost" onClick={() => { setIsAddCollegeOpen(false); setIsEditColOpen(false); }}>Cancel</Button><Button type="submit" className="bg-[#1e40af] text-white px-8 h-10 rounded-xl font-black text-[10px] uppercase tracking-widest">SAVE</Button></div>
            </form>
         </DialogContent>
      </Dialog>
      <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
         <DialogContent className="max-w-4xl rounded-3xl p-0 border-4 border-gold/5 shadow-2xl overflow-hidden bg-white">
            <div className="bg-navy p-6 text-white flex items-center justify-between">
               <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter">Academic Management</h2>
                  <p className="text-[10px] font-bold text-gold uppercase tracking-widest">{selectedColForStructure?.name}</p>
               </div>
            </div>
            <div className="p-8 grid md:grid-cols-3 gap-6">
                <div className="space-y-4 bg-secondary/5 p-5 rounded-2xl border">
                   <div className="flex items-center gap-2 text-navy font-black text-[10px] uppercase border-b pb-2"><BookOpen size={14} className="text-gold"/> Add Courses (Bulk)</div>
                   <form onSubmit={async (e) => { 
                      e.preventDefault(); 
                      const fd = new FormData(e.currentTarget); 
                      const degrees = (fd.get("degrees") as string).split("\n").map(d => d.trim()).filter(Boolean);
                      if (!degrees.length) return;
                      await supabase.from("academic_structures").insert(degrees.map(d => ({ college_id: selectedColForStructure.id, degree: d, department: "General", session: "2024-28" }))); 
                      toast.success("Added!"); fetchData(); (e.target as any).reset();
                   }} className="space-y-3">
                      <div className="space-y-1"><Label className="text-[8px] font-black uppercase opacity-40">Degrees</Label><textarea name="degrees" placeholder="B.Tech" required className="w-full h-20 border rounded-xl p-2 text-xs" /></div>
                      <Button type="submit" className="w-full bg-navy text-white h-9 rounded-xl font-black text-[9px] uppercase">Bulk Add</Button>
                   </form>
                </div>
                <div className="space-y-4 bg-secondary/5 p-5 rounded-2xl border">
                   <div className="flex items-center gap-2 text-navy font-black text-[10px] uppercase border-b pb-2"><School size={14} className="text-gold"/> Add Depts (Bulk)</div>
                   <form onSubmit={async (e) => { 
                      e.preventDefault(); 
                      const fd = new FormData(e.currentTarget); 
                      const depts = (fd.get("departments") as string).split("\n").map(d => d.trim()).filter(Boolean);
                      if (!depts.length) return;
                      await supabase.from("academic_structures").insert(depts.map(d => ({ college_id: selectedColForStructure.id, department: d, degree: "General", session: "2024-28" }))); 
                      toast.success("Added!"); fetchData(); (e.target as any).reset();
                   }} className="space-y-3">
                      <div className="space-y-1"><Label className="text-[8px] font-black uppercase opacity-40">Departments</Label><textarea name="departments" placeholder="CSE" required className="w-full h-20 border rounded-xl p-2 text-xs" /></div>
                      <Button type="submit" className="w-full bg-navy text-white h-9 rounded-xl font-black text-[9px] uppercase">Bulk Add</Button>
                   </form>
                </div>
                <div className="space-y-4 bg-secondary/5 p-5 rounded-2xl border">
                   <div className="flex items-center gap-2 text-navy font-black text-[10px] uppercase border-b pb-2"><Calendar size={14} className="text-gold"/> Add Sessions</div>
                   <form onSubmit={async (e) => { 
                      e.preventDefault(); 
                      const fd = new FormData(e.currentTarget); 
                      const sessions = (fd.get("sessions") as string).split("\n").map(s => s.trim()).filter(Boolean);
                      if (!sessions.length) return;
                      await supabase.from("academic_structures").insert(sessions.map(s => ({ college_id: selectedColForStructure.id, session: s, degree: "General", department: "General" })));
                      toast.success("Added!"); fetchData(); (e.target as any).reset();
                   }} className="space-y-3">
                      <div className="space-y-1"><Label className="text-[8px] font-black uppercase opacity-40">Sessions</Label><textarea name="sessions" placeholder="2021-25" required className="w-full h-20 border rounded-xl p-2 text-xs" /></div>
                      <Button type="submit" className="w-full bg-navy text-white h-9 rounded-xl font-black text-[9px] uppercase">Bulk Add</Button>
                   </form>
                </div>
            </div>
            <div className="p-8 pt-0">
               <div className="bg-navy/5 rounded-2xl border p-4">
                  <h3 className="text-[10px] font-black text-navy uppercase mb-3 flex items-center gap-2"><ListChecks size={14}/> Existing Infrastructure</h3>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                     {selectedColForStructure?.academic_structures?.map((s: any) => (
                        <div key={s.id} className="flex items-center justify-between bg-white p-2 px-4 rounded-xl border text-[10px] font-bold text-navy-deep group">
                           <div className="flex gap-4"><span>Deg: {s.degree}</span><span>Dept: {s.department}</span><span>Ses: {s.session}</span></div>
                           <Button size="icon" variant="ghost" className="size-6 opacity-0 group-hover:opacity-100 text-red-500" onClick={async () => { await supabase.from("academic_structures").delete().eq("id", s.id); fetchData(); }}><Trash2 size={12}/></Button>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
            <div className="p-6 bg-secondary/5 border-t flex justify-end"><Button onClick={() => setIsAddCourseOpen(false)} className="bg-navy text-white px-10 h-10 rounded-xl font-black text-[10px] uppercase tracking-widest">Close</Button></div>
         </DialogContent>
      </Dialog>
      <Dialog open={isInternshipDialogOpen} onOpenChange={setIsInternshipDialogOpen}>
         <DialogContent className="max-w-xl bg-white rounded-2xl p-6">
            <DialogHeader><DialogTitle className="text-xl font-black text-navy-deep border-b pb-2 uppercase tracking-tighter">{selectedInternship ? "Update Domain" : "New Domain"}</DialogTitle></DialogHeader>
            <form onSubmit={onSaveInternship} className="space-y-4 py-4">
               <div className="space-y-1"><Label className="text-[9px] uppercase">Title *</Label><Input name="title" defaultValue={selectedInternship?.title} required className="h-10 rounded-xl text-xs" /></div>
               <div className="space-y-1"><Label className="text-[9px] uppercase">Company *</Label><Input name="company" defaultValue={selectedInternship?.company || "TechLaunchpad"} required className="h-10 rounded-xl text-xs" /></div>
               <div className="space-y-1"><Label className="text-[9px] uppercase">Category *</Label><Input name="category" defaultValue={selectedInternship?.category || "General"} required className="h-10 rounded-xl text-xs" /></div>
               <div className="space-y-1"><Label className="text-[9px] uppercase">Duration</Label><Input name="duration" defaultValue={selectedInternship?.duration} className="h-10 rounded-xl text-xs" /></div>
               <div className="space-y-1"><Label className="text-[9px] uppercase">Overview</Label><textarea name="description" defaultValue={selectedInternship?.description} className="w-full h-24 border rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-gold/10"></textarea></div>
               <div className="flex justify-end gap-3 pt-4"><Button type="button" variant="ghost" onClick={() => setIsInternshipDialogOpen(false)}>Cancel</Button><Button type="submit" className="bg-navy text-white px-10 h-11 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl">PUBLISH</Button></div>
            </form>
         </DialogContent>
      </Dialog>
      <Dialog open={!!viewingPreReg} onOpenChange={(o) => !o && setViewingPreReg(null)}>
         <DialogContent className="max-w-3xl rounded-2xl p-0 overflow-hidden border-none shadow-2xl bg-white">
            <DialogHeader className="sr-only">
               <DialogTitle>Staging Record Details</DialogTitle>
               <DialogDescription>Full description of staged academic and identity details</DialogDescription>
            </DialogHeader>
            <div className="bg-navy p-6 text-white flex items-center justify-between">
               <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter">Staging Record Details</h2>
                  <p className="text-[9px] font-bold text-gold uppercase tracking-widest mt-1">Status: {viewingPreReg?.is_claimed ? "Claimed" : "Pending Registration"}</p>
               </div>
            </div>
            {viewingPreReg && (
               <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                     <div className="bg-secondary/5 p-3 rounded-xl border">
                        <div className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">Full Name</div>
                        <div className="text-xs font-bold text-navy-deep uppercase">{viewingPreReg.full_name}</div>
                     </div>
                     <div className="bg-secondary/5 p-3 rounded-xl border">
                        <div className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">Gender</div>
                        <div className="text-xs font-bold text-navy-deep uppercase">{viewingPreReg.gender || "—"}</div>
                     </div>
                     <div className="bg-secondary/5 p-3 rounded-xl border">
                        <div className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">Father's Name</div>
                        <div className="text-xs font-bold text-navy-deep uppercase">{viewingPreReg.parent_name || "—"}</div>
                     </div>
                     <div className="bg-secondary/5 p-3 rounded-xl border">
                        <div className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">Mobile No</div>
                        <div className="text-xs font-bold text-navy-deep font-mono">{viewingPreReg.contact_number || "—"}</div>
                     </div>
                     <div className="bg-secondary/5 p-3 rounded-xl border col-span-2">
                        <div className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">Email Address</div>
                        <div className="text-xs font-bold text-navy-deep">{viewingPreReg.email || "—"}</div>
                     </div>
                     <div className="bg-secondary/5 p-3 rounded-xl border col-span-2">
                        <div className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">University Name</div>
                        <div className="text-xs font-bold text-slate-600 uppercase">{viewingPreReg.university_name || "—"}</div>
                     </div>
                     <div className="bg-secondary/5 p-3 rounded-xl border">
                        <div className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">Degree</div>
                        <div className="text-xs font-bold text-navy-deep uppercase">{viewingPreReg.degree || "—"}</div>
                     </div>
                     <div className="bg-secondary/5 p-3 rounded-xl border col-span-2">
                        <div className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">College Name</div>
                        <div className="text-xs font-bold text-slate-600 uppercase">{viewingPreReg.college_name || "—"}</div>
                     </div>
                     <div className="bg-secondary/5 p-3 rounded-xl border">
                        <div className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">Branch</div>
                        <div className="text-xs font-bold text-navy-deep uppercase">{viewingPreReg.department || "—"}</div>
                     </div>
                     <div className="bg-secondary/5 p-3 rounded-xl border">
                        <div className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">Roll Number</div>
                        <div className="text-xs font-black text-gold font-mono">{viewingPreReg.university_roll_number}</div>
                     </div>
                     <div className="bg-secondary/5 p-3 rounded-xl border">
                        <div className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">Semester</div>
                        <div className="text-xs font-bold text-navy-deep uppercase">{viewingPreReg.semester || "—"}</div>
                     </div>
                     <div className="bg-secondary/5 p-3 rounded-xl border">
                        <div className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">Staged On</div>
                        <div className="text-xs font-bold text-navy-deep">{new Date(viewingPreReg.created_at).toLocaleDateString()}</div>
                     </div>
                  </div>
                  <div className="pt-4 flex justify-end border-t"><Button onClick={() => setViewingPreReg(null)} className="bg-navy text-white px-10 h-10 rounded-xl font-black text-[10px] uppercase tracking-widest">Close Details</Button></div>
               </div>
            )}
         </DialogContent>
      </Dialog>
      {/* View Student Full Profile Dialog */}
      <Dialog open={!!viewingStudent} onOpenChange={(o) => !o && setViewingStudent(null)}>
         <DialogContent className="max-w-4xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl bg-white max-h-[90vh] flex flex-col">
            <DialogHeader className="sr-only">
               <DialogTitle>Student Profile: {viewingStudent?.full_name}</DialogTitle>
               <DialogDescription>Full details of the selected student record.</DialogDescription>
            </DialogHeader>
            <div className="bg-[#0a192f] p-8 text-white relative overflow-hidden flex-shrink-0">
               <div className="absolute top-0 right-0 p-8 opacity-10"><Scan size={120} /></div>
               <div className="relative z-10">
                  <div className="flex items-center gap-2 text-gold font-black text-[10px] uppercase tracking-[0.3em] mb-2">
                     <ShieldCheck size={14} /> Official Student Record
                  </div>
                  <h1 className="font-display text-4xl font-black uppercase tracking-tighter leading-none">
                     {viewingStudent?.full_name}
                  </h1>
                  <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-2">
                     Roll No: <span className="text-gold">{viewingStudent?.university_roll_number || "N/A"}</span>
                  </p>
               </div>
            </div>
            <div className="p-8 overflow-y-auto flex-1 space-y-8">
               {/* 01 — Personal & Academic Overview */}
               <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <h3 className="text-[10px] font-black uppercase text-navy/40 border-b pb-1">Personal Identity</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <div className="text-[8px] font-black uppercase opacity-40 mb-0.5">Gender</div>
                           <div className="text-xs font-bold uppercase">{viewingStudent?.gender || "N/A"}</div>
                        </div>
                        <div>
                           <div className="text-[8px] font-black uppercase opacity-40 mb-0.5">Category</div>
                           <div className="text-xs font-bold uppercase">{viewingStudent?.category || "N/A"}</div>
                        </div>
                        <div className="col-span-2">
                           <div className="text-[8px] font-black uppercase opacity-40 mb-0.5">Parent's Name</div>
                           <div className="text-xs font-bold uppercase">{viewingStudent?.parent_name || viewingStudent?.father_name || "N/A"}</div>
                        </div>
                        <div>
                           <div className="text-[8px] font-black uppercase opacity-40 mb-0.5">Date of Birth</div>
                           <div className="text-xs font-bold">{viewingStudent?.dob || "N/A"}</div>
                        </div>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <h3 className="text-[10px] font-black uppercase text-navy/40 border-b pb-1">Academic Credentials</h3>
                     <div className="space-y-3">
                        <div>
                           <div className="text-[8px] font-black uppercase opacity-40 mb-0.5">University</div>
                           <div className="text-xs font-bold text-navy-deep uppercase">{viewingStudent?.university_name}</div>
                        </div>
                        <div>
                           <div className="text-[8px] font-black uppercase opacity-40 mb-0.5">College</div>
                           <div className="text-xs font-bold text-navy-deep uppercase">{viewingStudent?.college_name}</div>
                        </div>
                        <div className="flex gap-6">
                           <div>
                              <div className="text-[8px] font-black uppercase opacity-40 mb-0.5">Degree</div>
                              <div className="text-xs font-black text-gold uppercase">{viewingStudent?.degree}</div>
                           </div>
                           <div>
                              <div className="text-[8px] font-black uppercase opacity-40 mb-0.5">Branch</div>
                              <div className="text-xs font-black text-gold uppercase">{viewingStudent?.department}</div>
                           </div>
                           <div>
                              <div className="text-[8px] font-black uppercase opacity-40 mb-0.5">Semester</div>
                              <div className="text-xs font-black text-gold uppercase">{viewingStudent?.semester || viewingStudent?.class_semester}</div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
               {/* 02 — Professional & Location */}
               <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <h3 className="text-[10px] font-black uppercase text-navy/40 border-b pb-1">Professional Portfolio</h3>
                     <div className="space-y-3">
                        <div className="flex items-center gap-2">
                           <Mail size={12} className="text-navy/40" />
                           <span className="text-xs font-bold">{viewingStudent?.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <Phone size={12} className="text-navy/40" />
                           <span className="text-xs font-bold">{viewingStudent?.contact_number}</span>
                        </div>
                        {viewingStudent?.linkedin_url && (
                           <div className="flex items-center gap-2">
                              <Linkedin size={12} className="text-blue-600" />
                              <a href={viewingStudent.linkedin_url} target="_blank" className="text-xs font-bold text-blue-600 hover:underline">LinkedIn Profile</a>
                           </div>
                        )}
                        {viewingStudent?.resume_url && (
                           <div className="flex items-center gap-2">
                              <FileText size={12} className="text-red-500" />
                              <a href={viewingStudent.resume_url} target="_blank" className="text-xs font-bold text-red-500 hover:underline">View Resume</a>
                           </div>
                        )}
                        <div>
                           <div className="text-[8px] font-black uppercase opacity-40 mb-1">Skills</div>
                           <div className="flex flex-wrap gap-1">
                              {(viewingStudent?.skills || "").split(",").map((s: string) => s.trim()).filter(Boolean).map((skill: string) => (
                                 <span key={skill} className="px-2 py-0.5 bg-navy/5 rounded-md text-[9px] font-black uppercase text-navy/60 border">{skill}</span>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <h3 className="text-[10px] font-black uppercase text-navy/40 border-b pb-1">Address Details</h3>
                     <div className="space-y-3">
                        <div>
                           <div className="text-[8px] font-black uppercase opacity-40 mb-0.5">Permanent Address</div>
                           <div className="text-xs font-bold leading-relaxed">{viewingStudent?.address || "N/A"}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                           <div>
                              <div className="text-[8px] font-black uppercase opacity-40 mb-0.5">City</div>
                              <div className="text-xs font-bold uppercase">{viewingStudent?.city || "N/A"}</div>
                           </div>
                           <div>
                              <div className="text-[8px] font-black uppercase opacity-40 mb-0.5">State</div>
                              <div className="text-xs font-bold uppercase">{viewingStudent?.state || "N/A"}</div>
                           </div>
                           <div>
                              <div className="text-[8px] font-black uppercase opacity-40 mb-0.5">PIN</div>
                              <div className="text-xs font-bold">{viewingStudent?.pin_code || "N/A"}</div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            <div className="p-6 bg-secondary/5 border-t flex justify-between items-center flex-shrink-0">
               <div className="flex items-center gap-2 text-[10px] font-black uppercase text-navy/40">
                  <Clock size={14} /> Record created on {new Date(viewingStudent?.created_at).toLocaleDateString()}
               </div>
               <div className="flex gap-3">
                  <Button variant="outline" onClick={() => window.print()} className="rounded-xl font-black text-[10px] uppercase border-2 h-10 px-6"><Printer size={16} className="mr-2" /> Print</Button>
                  <Button onClick={() => setViewingStudent(null)} className="bg-navy text-white px-10 h-10 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">Close Profile</Button>
               </div>
            </div>
         </DialogContent>
      </Dialog>
      {/* Bulk Attendance Dialog */}
      <Dialog open={isBulkAttendanceOpen} onOpenChange={setIsBulkAttendanceOpen}>
         <DialogContent className="max-w-4xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl bg-white">
            <div className="bg-navy p-8 text-white flex items-center justify-between">
               <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter leading-none mb-1">Bulk Presence Control</h2>
                  <p className="text-[10px] font-bold text-gold uppercase tracking-widest opacity-80">Mark multiple students present for a specific date</p>
               </div>
            </div>
            <form onSubmit={async (e) => {
               e.preventDefault();
               const fd = new FormData(e.currentTarget);
               const date = fd.get("date") as string;
               const selectedIds = Array.from(fd.getAll("student_ids")).map(String);
               if(!date || selectedIds.length === 0) {
                  toast.error("Select date and at least one student!");
                  return;
               }
               setBusy(true);
               const records = selectedIds.map(id => ({
                  student_id: id,
                  date,
                  status: "present"
               }));
               const { error } = await supabase.from("attendance").upsert(records, { onConflict: 'student_id,date' });
               setBusy(false);
               if(!error) {
                  toast.success(`Success! Marked ${selectedIds.length} students present.`);
                  setIsBulkAttendanceOpen(false);
                  fetchData();
               } else {
                  toast.error("Error: " + error.message);
               }
            }} className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-6 bg-secondary/5 p-6 rounded-2xl border">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-navy/40">1. Select Target Date</Label>
                     <Input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="h-12 rounded-xl font-black text-navy border-2 focus:border-gold" />
                  </div>
                  <div className="flex items-end">
                     <div className="bg-gold/10 p-4 rounded-xl border border-gold/20 flex items-center gap-3 w-full">
                        <AlertCircle className="text-gold" size={20} />
                        <div className="text-[9px] font-bold text-navy-deep leading-tight uppercase">Bulk marks will bypass biometric checks and overwrite existing logs.</div>
                     </div>
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-navy/40">2. Select Students ({students.length})</Label>
                     <div className="flex gap-2">
                        <Button type="button" variant="ghost" size="sm" className="text-[8px] font-black uppercase tracking-widest" onClick={() => {
                           const checks = document.querySelectorAll('input[name="student_ids"]');
                           checks.forEach((c: any) => c.checked = true);
                        }}>Select All</Button>
                        <Button type="button" variant="ghost" size="sm" className="text-[8px] font-black uppercase tracking-widest" onClick={() => {
                           const checks = document.querySelectorAll('input[name="student_ids"]');
                           checks.forEach((c: any) => c.checked = false);
                        }}>Deselect All</Button>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[30vh] overflow-y-auto p-4 bg-navy/5 rounded-2xl border">
                     {students.map(s => (
                        <label key={s.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border hover:border-gold cursor-pointer transition-all group">
                           <input type="checkbox" name="student_ids" value={s.id} className="size-4 accent-navy rounded" />
                           <div className="overflow-hidden">
                              <div className="text-[10px] font-black text-navy-deep uppercase truncate">{s.full_name}</div>
                              <div className="text-[8px] font-bold text-muted-foreground uppercase truncate">{s.university_roll_number}</div>
                           </div>
                        </label>
                     ))}
                  </div>
               </div>
               <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button type="button" variant="ghost" onClick={() => setIsBulkAttendanceOpen(false)} className="px-10 h-12 rounded-xl font-black uppercase text-[10px]">Cancel</Button>
                  <Button type="submit" disabled={busy} className="bg-navy text-white px-12 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2">
                     {busy ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={18} /> Apply Bulk Presence</>}
                  </Button>
               </div>
            </form>
         </DialogContent>
      </Dialog>
      {/* Assignment Creator Dialog */}
      <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
         <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl bg-white">
            <div className="bg-navy p-8 text-white">
               <h2 className="text-2xl font-black uppercase tracking-tighter leading-none mb-1">
                  {selectedAssignment ? "Modify Assignment" : "New Academic Task"}
               </h2>
               <p className="text-[10px] font-bold text-gold uppercase tracking-widest opacity-80">
                  Define instructions and set deadlines for students
               </p>
            </div>
            <form onSubmit={async (e) => {
               e.preventDefault();
               const fd = new FormData(e.currentTarget);
               const data = Object.fromEntries(fd);
               setBusy(true);
               const payload: any = {
                  title: data.title,
                  description: data.description,
                  due_date: data.due_date,
                  domain: data.domain || "Global",
               };
               if (selectedAssignment) payload.id = selectedAssignment.id;
               const { error } = await supabase.from("assignments").upsert(payload);
               setBusy(false);
               if (!error) {
                  toast.success(selectedAssignment ? "Assignment Updated!" : "Task Deployed to Students!");
                  setIsAssignmentDialogOpen(false);
                  fetchData();
               } else {
                  toast.error("Error: " + error.message);
               }
            }} className="p-8 space-y-6">
               <div className="space-y-4">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-navy/40">Assignment Title</Label>
                     <Input name="title" defaultValue={selectedAssignment?.title} placeholder="e.g. Final Project Documentation" required className="h-12 rounded-xl font-bold text-navy border-2 focus:border-gold" />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-navy/40">Target Internship Domain</Label>
                     <Select name="domain" defaultValue={selectedAssignment?.domain || "Global"}>
                        <SelectTrigger className="h-12 rounded-xl font-bold border-2">
                           <SelectValue placeholder="Select Domain" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-2">
                           <SelectItem value="Global" className="font-bold">Global (All Students)</SelectItem>
                           {internships.map(i => (
                              <SelectItem key={i.id} value={i.title} className="font-bold">{i.title}</SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-navy/40">Due Date</Label>
                     <Input name="due_date" type="date" defaultValue={selectedAssignment?.due_date} required className="h-12 rounded-xl font-bold text-navy border-2 focus:border-gold" />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-navy/40">Detailed Instructions</Label>
                     <textarea 
                        name="description" 
                        defaultValue={selectedAssignment?.description}
                        placeholder="Explain the task requirements, format, and submission guidelines..." 
                        required 
                        className="w-full h-40 bg-navy/5 border-2 rounded-2xl p-4 text-sm font-bold text-navy outline-none focus:border-gold transition-all"
                     />
                  </div>
               </div>
               <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button type="button" variant="ghost" onClick={() => setIsAssignmentDialogOpen(false)} className="px-10 h-12 rounded-xl font-black uppercase text-[10px]">Cancel</Button>
                  <Button type="submit" disabled={busy} className="bg-navy text-white px-12 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2">
                     {busy ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={18} /> {selectedAssignment ? "Update Task" : "Deploy Task"}</>}
                  </Button>
               </div>
            </form>
         </DialogContent>
      </Dialog>
      {/* Add Lecture Dialog */}
      <Dialog open={isAddLectureOpen} onOpenChange={(o) => !o && setIsAddLectureOpen(false)}>
         <DialogContent className="max-w-xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl bg-white">
            <div className="bg-navy p-6 text-white">
               <h2 className="text-xl font-black uppercase tracking-tighter leading-none mb-1">Create Lecture</h2>
               <p className="text-[9px] font-bold text-gold uppercase tracking-widest opacity-80">Publish video classes and study materials to students</p>
            </div>
            <form onSubmit={handleCreateLecture} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
               <div className="space-y-1.5">
                  <Label className="font-black text-[9px] uppercase tracking-wider text-slate-500">1. Select Internship Domain *</Label>
                  <select
                     value={newLectureDomain}
                     onChange={(e) => setNewLectureDomain(e.target.value)}
                     className="w-full h-10 border-2 rounded-xl px-3 font-bold text-xs bg-slate-50 outline-none focus:border-gold"
                     required
                  >
                     <option value="">-- SELECT DOMAIN --</option>
                     <option value="General">General (All Students)</option>
                     {internships.map(i => (
                        <option key={i.id} value={i.title}>{i.title}</option>
                     ))}
                  </select>
               </div>
               <div className="space-y-1.5">
                  <Label className="font-black text-[9px] uppercase tracking-wider text-slate-500">2. Lecture Title *</Label>
                  <Input 
                     value={newLectureTitle}
                     onChange={(e) => setNewLectureTitle(e.target.value)}
                     placeholder="e.g. Introduction to Git & GitHub"
                     required 
                     className="h-10 rounded-xl font-bold text-xs border-2"
                  />
               </div>
               <div className="space-y-1.5">
                  <Label className="font-black text-[9px] uppercase tracking-wider text-slate-500">3. Description / Topic Outline</Label>
                  <textarea 
                     value={newLectureDesc}
                     onChange={(e) => setNewLectureDesc(e.target.value)}
                     placeholder="Outline the main keypoints covered in this lecture..." 
                     className="w-full h-24 border-2 rounded-xl p-3 text-xs font-bold outline-none focus:border-gold"
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <Label className="font-black text-[9px] uppercase tracking-wider text-slate-500">4. Lecture Type *</Label>
                     <select
                        value={newLectureMode}
                        onChange={(e) => setNewLectureMode(e.target.value)}
                        className="w-full h-10 border-2 rounded-xl px-3 font-bold text-xs bg-slate-50 outline-none focus:border-gold"
                        required
                     >
                        <option value="Google Meet">Google Meet</option>
                        <option value="YouTube">YouTube</option>
                        <option value="Online">Zoom/Online</option>
                        <option value="Other">Other (Custom)</option>
                     </select>
                  </div>
                  {newLectureMode === "Other" && (
                     <div className="space-y-1.5">
                        <Label className="font-black text-[9px] uppercase tracking-wider text-[#1e40af]">Custom Type Name *</Label>
                        <Input
                           value={newLectureModeCustom}
                           onChange={(e) => setNewLectureModeCustom(e.target.value)}
                           placeholder="e.g. Teams, Webinar"
                           required
                           className="h-10 rounded-xl font-bold text-xs border-2 border-[#1e40af]/30"
                        />
                     </div>
                  )}
               </div>
               <div className="space-y-1.5">
                  <Label className="font-black text-[9px] uppercase tracking-wider text-slate-500">5. Lecture / Stream Link *</Label>
                  <Input 
                     value={newLectureLink}
                     onChange={(e) => setNewLectureLink(e.target.value)}
                     placeholder="Paste YouTube, Google Meet, or Zoom URL..."
                     required 
                     className="h-10 rounded-xl font-bold text-xs border-2"
                  />
                  {/* YouTube Thumbnail Preview */}
                  {getYouTubeId(newLectureLink) && (
                     <div className="mt-2 p-2 bg-slate-100 rounded-xl border border-dashed text-center">
                        <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Instant YouTube Thumbnail Preview</div>
                        <img 
                           src={`https://img.youtube.com/vi/${getYouTubeId(newLectureLink)}/hqdefault.jpg`} 
                           alt="Thumbnail Preview" 
                           className="h-28 mx-auto object-cover rounded-lg border shadow-sm aspect-video" 
                        />
                     </div>
                  )}
               </div>
               <div className="space-y-1.5 border-t pt-3">
                  <Label className="font-black text-[9px] uppercase tracking-wider text-slate-500">6. Upload Study Material PDF (Max 80MB)</Label>
                  <input 
                     id="material_pdf_input" 
                     type="file" 
                     accept="application/pdf"
                     onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file && file.size > 80 * 1024 * 1024) {
                           toast.error("PDF size exceeds 80MB limit.");
                           e.target.value = "";
                           setNewLectureMaterialPdf(null);
                        } else {
                           setNewLectureMaterialPdf(file);
                        }
                     }}
                     className="w-full text-xs font-bold bg-slate-50 p-2 border-2 border-dashed rounded-xl cursor-pointer"
                  />
               </div>
               <div className="space-y-1.5">
                  <Label className="font-black text-[9px] uppercase tracking-wider text-slate-500">7. Additional Reference Link (Optional)</Label>
                  <Input 
                     value={newLectureMaterialLink}
                     onChange={(e) => setNewLectureMaterialLink(e.target.value)}
                     placeholder="e.g. GitHub Repository, Documentation Link"
                     className="h-10 rounded-xl font-bold text-xs border-2"
                  />
               </div>
               <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="ghost" onClick={() => setIsAddLectureOpen(false)} className="px-6 h-10 rounded-xl font-black text-[9px] uppercase">Cancel</Button>
                  <Button type="submit" disabled={savingLecture} className="bg-navy text-white px-10 h-10 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl">
                     {savingLecture ? <Loader2 className="animate-spin" /> : "PUBLISH LECTURE"}
                  </Button>
               </div>
            </form>
         </DialogContent>
      </Dialog>
      {/* Edit Lecture Dialog */}
      <Dialog open={isEditLectureOpen} onOpenChange={(o) => !o && setIsEditLectureOpen(false)}>
         <DialogContent className="max-w-xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl bg-white">
            <div className="bg-navy p-6 text-white">
               <h2 className="text-xl font-black uppercase tracking-tighter leading-none mb-1">Modify Lecture Details</h2>
               <p className="text-[9px] font-bold text-gold uppercase tracking-widest opacity-80">Edit the video stream details or replace attachments</p>
            </div>
            <form onSubmit={handleUpdateLecture} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
               <div className="space-y-1.5">
                  <Label className="font-black text-[9px] uppercase tracking-wider text-slate-500">1. Select Internship Domain *</Label>
                  <select
                     value={editLectureDomain}
                     onChange={(e) => setEditLectureDomain(e.target.value)}
                     className="w-full h-10 border-2 rounded-xl px-3 font-bold text-xs bg-slate-50 outline-none focus:border-gold"
                     required
                  >
                     <option value="">-- SELECT DOMAIN --</option>
                     <option value="General">General (All Students)</option>
                     {internships.map(i => (
                        <option key={i.id} value={i.title}>{i.title}</option>
                     ))}
                  </select>
               </div>
               <div className="space-y-1.5">
                  <Label className="font-black text-[9px] uppercase tracking-wider text-slate-500">2. Lecture Title *</Label>
                  <Input 
                     value={editLectureTitle}
                     onChange={(e) => setEditLectureTitle(e.target.value)}
                     placeholder="e.g. Introduction to Git & GitHub"
                     required 
                     className="h-10 rounded-xl font-bold text-xs border-2"
                  />
               </div>
               <div className="space-y-1.5">
                  <Label className="font-black text-[9px] uppercase tracking-wider text-slate-500">3. Description / Topic Outline</Label>
                  <textarea 
                     value={editLectureDesc}
                     onChange={(e) => setEditLectureDesc(e.target.value)}
                     placeholder="Outline the main keypoints covered in this lecture..." 
                     className="w-full h-24 border-2 rounded-xl p-3 text-xs font-bold outline-none focus:border-gold"
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <Label className="font-black text-[9px] uppercase tracking-wider text-slate-500">4. Lecture Type *</Label>
                     <select
                        value={editLectureMode}
                        onChange={(e) => setEditLectureMode(e.target.value)}
                        className="w-full h-10 border-2 rounded-xl px-3 font-bold text-xs bg-slate-50 outline-none focus:border-gold"
                        required
                     >
                        <option value="Google Meet">Google Meet</option>
                        <option value="YouTube">YouTube</option>
                        <option value="Online">Zoom/Online</option>
                        <option value="Other">Other (Custom)</option>
                     </select>
                  </div>
                  {editLectureMode === "Other" && (
                     <div className="space-y-1.5">
                        <Label className="font-black text-[9px] uppercase tracking-wider text-[#1e40af]">Custom Type Name *</Label>
                        <Input
                           value={editLectureModeCustom}
                           onChange={(e) => setEditLectureModeCustom(e.target.value)}
                           placeholder="e.g. Teams, Webinar"
                           required
                           className="h-10 rounded-xl font-bold text-xs border-2 border-[#1e40af]/30"
                        />
                     </div>
                  )}
               </div>
               <div className="space-y-1.5">
                  <Label className="font-black text-[9px] uppercase tracking-wider text-slate-500">5. Lecture / Stream Link *</Label>
                  <Input 
                     value={editLectureLink}
                     onChange={(e) => setEditLectureLink(e.target.value)}
                     placeholder="Paste YouTube, Google Meet, or Zoom URL..."
                     required 
                     className="h-10 rounded-xl font-bold text-xs border-2"
                  />
                  {/* YouTube Thumbnail Preview */}
                  {getYouTubeId(editLectureLink) && (
                     <div className="mt-2 p-2 bg-slate-100 rounded-xl border border-dashed text-center">
                        <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Instant YouTube Thumbnail Preview</div>
                        <img 
                           src={`https://img.youtube.com/vi/${getYouTubeId(editLectureLink)}/hqdefault.jpg`} 
                           alt="Thumbnail Preview" 
                           className="h-28 mx-auto object-cover rounded-lg border shadow-sm aspect-video" 
                        />
                     </div>
                  )}
               </div>
               <div className="space-y-1.5 border-t pt-3">
                  <Label className="font-black text-[9px] uppercase tracking-wider text-slate-500">6. Replace Study Material PDF (Max 80MB)</Label>
                  {editLectureExistingPdfUrl && (
                     <div className="text-[10px] text-emerald-700 bg-emerald-50 bg-opacity-10 border border-emerald-100 p-2 rounded-lg flex items-center justify-between mb-2">
                        <a href={editLectureExistingPdfUrl} target="_blank" className="font-black underline hover:text-emerald-800">VIEW PDF</a>
                     </div>
                  )}
                  <input 
                     id="edit_material_pdf_input" 
                     type="file" 
                     accept="application/pdf"
                     onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file && file.size > 80 * 1024 * 1024) {
                           toast.error("PDF size exceeds 80MB limit.");
                           e.target.value = "";
                           setEditLectureMaterialPdf(null);
                        } else {
                           setEditLectureMaterialPdf(file);
                        }
                     }}
                     className="w-full text-xs font-bold bg-slate-50 p-2 border-2 border-dashed rounded-xl cursor-pointer"
                  />
               </div>
               <div className="space-y-1.5">
                  <Label className="font-black text-[9px] uppercase tracking-wider text-slate-500">7. Additional Reference Link (Optional)</Label>
                  <Input 
                     value={editLectureMaterialLink}
                     onChange={(e) => setEditLectureMaterialLink(e.target.value)}
                     placeholder="e.g. GitHub Repository, Documentation Link"
                     className="h-10 rounded-xl font-bold text-xs border-2"
                  />
               </div>
               <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="ghost" onClick={() => setIsEditLectureOpen(false)} className="px-6 h-10 rounded-xl font-black text-[9px] uppercase">Cancel</Button>
                  <Button type="submit" disabled={savingLecture} className="bg-navy text-white px-10 h-10 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl">
                     {savingLecture ? <Loader2 className="animate-spin" /> : "SAVE CHANGES"}
                  </Button>
               </div>
            </form>
         </DialogContent>
      </Dialog>
      {/* --- TRAINING MANAGEMENT DIALOGS --- */}
      <Dialog open={isAddTrainingOpen || isEditTrainingOpen} onOpenChange={(o) => { if(!o) { setIsAddTrainingOpen(false); setIsEditTrainingOpen(false); setSelectedTraining(null); } }}>
         <DialogContent className="max-w-xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl bg-white">
            <DialogHeader className="bg-navy p-6 pb-8">
               <DialogTitle className="text-xl font-black text-white uppercase tracking-tighter">
                  {selectedTraining ? "Edit Training Program" : "New Training Program"}
               </DialogTitle>
               <DialogDescription className="text-gold font-bold text-xs uppercase tracking-widest">
                  Set program details, timeline, and cover image.
               </DialogDescription>
            </DialogHeader>
            <form onSubmit={onSaveTraining} className="p-6 -mt-4 bg-white rounded-t-3xl space-y-4">
               <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Program Name *</Label>
                  <Input required value={tName} onChange={e => setTName(e.target.value)} placeholder="e.g. Masterclass on AI" className="h-10 rounded-xl font-bold text-xs border-2"/>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <Label className="text-[10px] font-black uppercase text-slate-500">Type *</Label>
                     <select className="flex h-10 w-full items-center justify-between rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-xs font-bold ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-navy focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={tType} onChange={e => setTType(e.target.value)}>
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                        <option value="hybrid">Hybrid</option>
                     </select>
                  </div>
                  <div className="space-y-1">
                     <Label className="text-[10px] font-black uppercase text-slate-500">Duration (Days) *</Label>
                     <Input type="number" min="1" required value={tDuration} onChange={e => setTDuration(parseInt(e.target.value))} className="h-10 rounded-xl font-bold text-xs border-2"/>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <Label className="text-[10px] font-black uppercase text-slate-500">Start Date</Label>
                     <Input type="datetime-local" value={tStartDate} onChange={e => setTStartDate(e.target.value)} className="h-10 rounded-xl font-bold text-xs border-2"/>
                  </div>
                  <div className="space-y-1">
                     <Label className="text-[10px] font-black uppercase text-slate-500">End Date</Label>
                     <Input type="datetime-local" value={tEndDate} onChange={e => setTEndDate(e.target.value)} className="h-10 rounded-xl font-bold text-xs border-2"/>
                  </div>
               </div>
               <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Thumbnail Image</Label>
                  <div
                     onClick={() => tThumbnailRef.current?.click()}
                     className="relative w-full h-32 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-[#0a192f] hover:bg-slate-100 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 overflow-hidden group"
                  >
                     {tThumbnailFile ? (
                        <>
                           <img
                              src={URL.createObjectURL(tThumbnailFile)}
                              alt="Preview"
                              className="absolute inset-0 w-full h-full object-cover rounded-xl"
                           />
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                              <span className="text-white text-[9px] font-black uppercase tracking-widest">Click to Change</span>
                           </div>
                        </>
                     ) : tThumbnail ? (
                        <>
                           <img
                              src={tThumbnail}
                              alt="Current Thumbnail"
                              className="absolute inset-0 w-full h-full object-cover rounded-xl"
                           />
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                              <span className="text-white text-[9px] font-black uppercase tracking-widest">Click to Change</span>
                           </div>
                        </>
                     ) : (
                        <>
                           <div className="size-10 rounded-xl bg-slate-200 flex items-center justify-center">
                              <Upload className="size-5 text-slate-400" />
                           </div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Click to Upload Thumbnail</p>
                           <p className="text-[9px] text-slate-400">PNG, JPG, WEBP up to 5MB</p>
                        </>
                     )}
                     {tThumbnailUploading && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl">
                           <Loader2 className="animate-spin size-6 text-[#0a192f]" />
                        </div>
                     )}
                  </div>
                  <input
                     ref={tThumbnailRef}
                     type="file"
                     accept="image/png,image/jpeg,image/webp,image/gif"
                     className="hidden"
                     onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) setTThumbnailFile(file);
                     }}
                  />
                  {(tThumbnailFile || tThumbnail) && (
                     <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setTThumbnailFile(null); setTThumbnail(""); }}
                        className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline"
                     >
                        Remove Image
                     </button>
                  )}
               </div>
               <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Registration Fee (₹) *</Label>
                  <Input type="number" min="0" required value={tFee} onChange={e => setTFee(parseInt(e.target.value) || 0)} placeholder="e.g. 999" className="h-10 rounded-xl font-bold text-xs border-2"/>
                  <p className="text-[9px] text-slate-400 font-medium">This amount will be charged to students when they enroll via Razorpay.</p>
               </div>
               <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="ghost" onClick={() => {setIsAddTrainingOpen(false); setIsEditTrainingOpen(false);}} className="px-6 h-10 rounded-xl font-black text-[9px] uppercase">Cancel</Button>
                  <Button type="submit" disabled={savingTraining} className="bg-navy text-white px-10 h-10 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl">
                     {savingTraining ? <Loader2 className="animate-spin" /> : "SAVE PROGRAM"}
                  </Button>
               </div>
            </form>
         </DialogContent>
      </Dialog>
      <Dialog open={!!viewingTraining} onOpenChange={(o) => !o && setViewingTraining(null)}>
         <DialogContent className="max-w-4xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl bg-white">
            <DialogHeader className="bg-navy p-6 pb-8 flex flex-row items-center justify-between">
               <div>
                  <DialogTitle className="text-xl font-black text-white uppercase tracking-tighter">
                     {viewingTraining?.name} - Sessions
                  </DialogTitle>
                  <DialogDescription className="text-gold font-bold text-xs uppercase tracking-widest">
                     Manage video sessions and live classes
                  </DialogDescription>
               </div>
               <Button className="h-9 px-4 bg-white text-navy rounded-xl font-bold uppercase text-[9px] tracking-widest shadow-lg flex items-center gap-1.5" onClick={() => {
                  setTlTitle(""); setTlDesc(""); setTlStartTime(""); setTlLink("");
                  setIsAddTrainingLectureOpen(true);
               }}>
                  <Plus size={14} /> Add Session
               </Button>
            </DialogHeader>
            <div className="p-6 -mt-4 bg-slate-50 rounded-t-3xl min-h-[300px] max-h-[60vh] overflow-y-auto">
               <div className="grid gap-4">
                  {(trainingLecturesMap[viewingTraining?.id] || []).length === 0 ? (
                     <div className="text-center py-12 text-slate-400">
                        <Video className="mx-auto size-12 opacity-20 mb-2" />
                        <p className="font-bold text-sm uppercase">No Sessions Yet</p>
                     </div>
                  ) : (
                     (trainingLecturesMap[viewingTraining?.id] || []).map((lec: any, idx: number) => (
                        <div key={lec.id} className="bg-white p-4 rounded-2xl border shadow-sm flex items-center justify-between">
                           <div>
                              <p className="text-[10px] font-black text-gold uppercase tracking-widest mb-1">Session {idx + 1}</p>
                              <h4 className="font-black text-navy-deep text-sm uppercase">{lec.title}</h4>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-1">{lec.description}</p>
                              <div className="flex gap-4 mt-2">
                                 {lec.start_time && <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Calendar size={12}/> {new Date(lec.start_time).toLocaleString()}</span>}
                                 {lec.link && <a href={lec.link} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-500 hover:underline">Watch Link</a>}
                              </div>
                           </div>
                           <div className="flex gap-2">
                              <Button size="icon" variant="outline" className="size-8" onClick={() => {
                                 setSelectedTrainingLecture(lec);
                                 setTlTitle(lec.title); setTlDesc(lec.description || ""); setTlStartTime(lec.start_time ? lec.start_time.substring(0,16) : ""); setTlLink(lec.link || "");
                                 setIsEditTrainingLectureOpen(true);
                              }}><Edit size={14}/></Button>
                              <Button size="icon" variant="outline" className="size-8 text-red-500" onClick={() => onDeleteTrainingLecture(lec.id)}><Trash2 size={14}/></Button>
                           </div>
                        </div>
                     ))
                  )}
               </div>
            </div>
         </DialogContent>
      </Dialog>
      <Dialog open={isAddTrainingLectureOpen || isEditTrainingLectureOpen} onOpenChange={(o) => { if(!o) { setIsAddTrainingLectureOpen(false); setIsEditTrainingLectureOpen(false); setSelectedTrainingLecture(null); } }}>
         <DialogContent className="max-w-xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl bg-white">
            <DialogHeader className="bg-navy-deep p-6 pb-8">
               <DialogTitle className="text-xl font-black text-white uppercase tracking-tighter">
                  {selectedTrainingLecture ? "Edit Session" : "New Session"}
               </DialogTitle>
            </DialogHeader>
            <form onSubmit={onSaveTrainingLecture} className="p-6 -mt-4 bg-white rounded-t-3xl space-y-4">
               <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Session Title *</Label>
                  <Input required value={tlTitle} onChange={e => setTlTitle(e.target.value)} placeholder="e.g. Introduction to React" className="h-10 rounded-xl font-bold text-xs border-2"/>
               </div>
               <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Description</Label>
                  <Textarea value={tlDesc} onChange={e => setTlDesc(e.target.value)} rows={3} className="rounded-xl font-bold text-xs border-2 resize-none"/>
               </div>
               <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Start Time</Label>
                  <Input type="datetime-local" value={tlStartTime} onChange={e => setTlStartTime(e.target.value)} className="h-10 rounded-xl font-bold text-xs border-2"/>
               </div>
               <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Video / Meet Link</Label>
                  <Input value={tlLink} onChange={e => setTlLink(e.target.value)} placeholder="https://..." className="h-10 rounded-xl font-bold text-xs border-2"/>
               </div>
               <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="ghost" onClick={() => {setIsAddTrainingLectureOpen(false); setIsEditTrainingLectureOpen(false);}} className="px-6 h-10 rounded-xl font-black text-[9px] uppercase">Cancel</Button>
                  <Button type="submit" disabled={savingTraining} className="bg-navy text-white px-10 h-10 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl">
                     {savingTraining ? <Loader2 className="animate-spin" /> : "SAVE SESSION"}
                  </Button>
               </div>
            </form>
          </DialogContent>
       </Dialog>
      {/* ============ SALES TEAM MANAGEMENT ============ */}
      {view === "sales" && (
        <div className="space-y-6">
          {/* Top action bar with Team Stats */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-black text-navy-deep uppercase tracking-tight flex items-center gap-2">
                <TrendingUp className="size-5 text-gold animate-pulse" /> Sales Team Management
              </h2>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                Monitor performance, assign leads, and manage sales representatives
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              {/* General Team Stats */}
              <div className="flex gap-4 bg-slate-50 p-2 px-4 rounded-xl border border-slate-100">
                <div className="text-center pr-4 border-r border-slate-200">
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Reps</div>
                  <div className="text-base font-black text-navy">{salesUsers.length}</div>
                </div>
                <div className="text-center pr-4 border-r border-slate-200">
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Assignments</div>
                  <div className="text-base font-black text-navy">{salesAssignments.length}</div>
                </div>
                <div className="text-center">
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Enrolled Sales</div>
                  <div className="text-base font-black text-green-600">
                    {salesAssignments.filter(a => a.status === "enrolled").length}
                  </div>
                </div>
              </div>
              
              <Button
                className="h-10 px-6 bg-navy hover:bg-navy/90 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-md flex items-center gap-2 transition-all active:scale-95"
                onClick={() => setShowCreateSalesUser(!showCreateSalesUser)}
              >
                <UserPlus size={16} /> Create Sales User
              </Button>
            </div>
          </div>

          {/* Create Sales User Inline Form */}
          {showCreateSalesUser && (
            <div className="bg-white p-6 rounded-2xl border-2 border-gold/40 shadow-lg animate-in slide-in-from-top duration-300">
              <h3 className="text-sm font-black text-navy uppercase tracking-tight mb-4 flex items-center gap-2">
                <UserPlus className="size-4 text-gold" /> New Sales Team Member
              </h3>
              <form onSubmit={handleCreateSalesUser} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Full Name *</Label>
                  <Input required value={newSalesName} onChange={e => setNewSalesName(e.target.value)} placeholder="Raj Sharma" className="h-10 rounded-xl font-bold text-xs border-2" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Email *</Label>
                  <Input required type="email" value={newSalesEmail} onChange={e => setNewSalesEmail(e.target.value)} placeholder="sales@example.com" className="h-10 rounded-xl font-bold text-xs border-2" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Password *</Label>
                  <Input required type="password" value={newSalesPassword} onChange={e => setNewSalesPassword(e.target.value)} placeholder="Min 6 characters" className="h-10 rounded-xl font-bold text-xs border-2" />
                </div>
                <div className="md:col-span-3 flex gap-3">
                  <Button type="submit" disabled={creatingSalesUser} className="bg-gold hover:bg-gold/90 text-navy-deep px-8 h-10 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg transition-all active:scale-95">
                    {creatingSalesUser ? <Loader2 className="animate-spin size-4" /> : "Create Sales User"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowCreateSalesUser(false)} className="h-10 px-6 rounded-xl font-black text-[9px] uppercase">Cancel</Button>
                </div>
              </form>
            </div>
          )}

          {/* Main Dashboard Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Team Directory & Manual Assignment */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Sales Rep Directory */}
              <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-4">
                <h3 className="text-xs font-black text-navy uppercase tracking-tight flex items-center gap-2 border-b pb-2">
                  <Users className="size-4 text-gold" /> Sales Team Directory
                </h3>
                
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 animate-in fade-in duration-300">
                  {loadingSalesUsers ? (
                    <div className="flex justify-center py-8"><LogoLoader size="sm" /></div>
                  ) : salesUsers.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground font-bold text-xs">
                      No sales team members yet.
                    </p>
                  ) : salesUsers.map(rep => {
                    const repAssignments = salesAssignments.filter(a => a.sales_rep_id === rep.id);
                    const isSelected = selectedSalesRep?.id === rep.id;
                    return (
                      <div
                        key={rep.id}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${isSelected ? "border-gold bg-gold/5 shadow-sm ring-1 ring-gold/20" : "border-slate-100 hover:border-slate-350 bg-white"}`}
                        onClick={() => { setSelectedSalesRep(rep); setSalesRepHistory([]); fetchSalesRepHistory(rep.id); }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`size-9 rounded-lg grid place-items-center font-black text-sm text-white shadow-md ${isSelected ? "bg-gold text-navy-deep" : "bg-navy"}`}>
                            {rep.full_name?.charAt(0) || "S"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-black text-navy-deep uppercase tracking-tight text-xs truncate">{rep.full_name}</div>
                            <div className="text-[9px] text-muted-foreground font-bold truncate">{rep.email}</div>
                          </div>
                        </div>
                        <div className="flex gap-1.5 mt-3">
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${isSelected ? "bg-gold/20 text-amber-800 border-gold/30" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
                            {repAssignments.length} Leads
                          </span>
                          <span className="bg-slate-100 text-slate-600 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-slate-200">
                            Rep
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Assign Individual Student to Sales Rep */}
              <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-4">
                <h3 className="text-xs font-black text-navy uppercase tracking-tight flex items-center gap-2 border-b pb-2">
                  <UserPlus className="size-4 text-gold" /> Manual Lead Assignment
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-[9px] font-black uppercase text-slate-500">Select Student</Label>
                    <select
                      className="w-full h-10 rounded-xl border-2 font-bold text-xs px-3 bg-white focus:border-gold outline-none"
                      value={assignStudentId}
                      onChange={e => setAssignStudentId(e.target.value)}
                    >
                      <option value="">-- Choose a student --</option>
                      {salesStudents.map(s => (
                        <option key={s.id} value={s.id}>{s.full_name} ({s.email})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] font-black uppercase text-slate-500">Assign to Sales Rep</Label>
                    <select
                      className="w-full h-10 rounded-xl border-2 font-bold text-xs px-3 bg-white focus:border-gold outline-none"
                      value={assignSalesRepId}
                      onChange={e => setAssignSalesRepId(e.target.value)}
                    >
                      <option value="">-- Choose a sales rep --</option>
                      {salesUsers.map(u => (
                        <option key={u.id} value={u.id}>{u.full_name}</option>
                      ))}
                    </select>
                  </div>
                  <Button
                    onClick={handleAssignStudent}
                    disabled={assigningStudent}
                    className="w-full h-10 bg-navy hover:bg-navy/95 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md transition-all active:scale-95"
                  >
                    {assigningStudent ? <Loader2 className="animate-spin size-4 mx-auto" /> : "Assign Student"}
                  </Button>
                </div>
              </div>

            </div>

            {/* Right Column: Performance detail pane & Bulk distributor */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Sales Rep Performance Details Panel */}
              {selectedSalesRep ? (
                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-300">
                  <div className="bg-gradient-to-r from-navy to-blue-800 p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="size-11 rounded-xl bg-white/20 text-white grid place-items-center font-black text-lg">
                        {selectedSalesRep.full_name?.charAt(0)}
                      </div>
                      <div>
                        <div className="text-white font-black text-sm uppercase tracking-tight">{selectedSalesRep.full_name}</div>
                        <div className="text-white/60 text-[9px] font-bold">{selectedSalesRep.email}</div>
                      </div>
                    </div>
                    <span className="bg-gold px-2.5 py-0.5 rounded-full text-[8px] font-black text-navy-deep uppercase tracking-widest">
                      Active Rep Performance
                    </span>
                  </div>

                  {/* Date Filter for History */}
                  <div className="p-4 border-b bg-slate-50 flex flex-wrap gap-4 items-end">
                    <div className="space-y-1">
                      <Label className="text-[9px] font-black uppercase text-slate-500">From Date</Label>
                      <Input type="date" value={salesHistoryStart} onChange={e => { setSalesHistoryStart(e.target.value); fetchSalesRepHistory(selectedSalesRep.id); }} className="h-9 rounded-xl text-xs font-bold border-2 w-36" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] font-black uppercase text-slate-500">To Date</Label>
                      <Input type="date" value={salesHistoryEnd} onChange={e => { setSalesHistoryEnd(e.target.value); fetchSalesRepHistory(selectedSalesRep.id); }} className="h-9 rounded-xl text-xs font-bold border-2 w-36" />
                    </div>
                    <Button variant="outline" className="h-9 px-4 rounded-xl font-black text-[9px] uppercase border-2" onClick={() => { setSalesHistoryStart(""); setSalesHistoryEnd(""); fetchSalesRepHistory(selectedSalesRep.id); }}>
                      Clear
                    </Button>
                  </div>

                  {/* Rep KPIs */}
                  <div className="grid grid-cols-3 gap-0 divide-x border-b">
                    {[
                      { label: "Transactions", value: salesRepHistory.length, icon: TrendingUp },
                      { label: "Revenue Earned", value: `₹${salesRepHistory.reduce((s, t) => s + (Number(t.amount) || 0), 0).toLocaleString()}`, icon: DollarSign },
                      { label: "Courses Sold", value: Array.from(new Set(salesRepHistory.map((t: any) => t.training_enrollments?.trainings?.name).filter(Boolean))).length, icon: BookOpen },
                    ].map(kpi => (
                      <div key={kpi.label} className="p-4 flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-gold/10 text-gold grid place-items-center flex-shrink-0">
                          <kpi.icon size={16} />
                        </div>
                        <div>
                          <div className="text-base font-black text-navy-deep leading-none mb-1">{kpi.value}</div>
                          <div className="text-[8px] font-black uppercase text-muted-foreground tracking-wider">{kpi.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Transaction History Table */}
                  <div className="p-5">
                    <h4 className="text-[10px] font-black text-navy uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Activity className="size-3 text-gold" /> Sales Transaction Log
                    </h4>
                    
                    {loadingSalesHistory ? (
                      <div className="flex justify-center py-8"><LogoLoader size="sm" /></div>
                    ) : salesRepHistory.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground font-bold text-xs italic bg-slate-50 rounded-xl border border-dashed">
                        No transactions found for the selected period.
                      </p>
                    ) : (
                      <div className="border rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                        <Table>
                          <TableHeader className="bg-slate-50 sticky top-0 z-10">
                            <TableRow>
                              <TableHead className="h-8 font-black uppercase text-[8px] tracking-widest text-navy/40">Date</TableHead>
                              <TableHead className="h-8 font-black uppercase text-[8px] tracking-widest text-navy/40">Student</TableHead>
                              <TableHead className="h-8 font-black uppercase text-[8px] tracking-widest text-navy/40">Course</TableHead>
                              <TableHead className="h-8 font-black uppercase text-[8px] tracking-widest text-navy/40">Amount</TableHead>
                              <TableHead className="h-8 font-black uppercase text-[8px] tracking-widest text-navy/40">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {salesRepHistory.map((tx: any) => (
                              <TableRow key={tx.id} className="hover:bg-gold/5 transition-all border-b last:border-0 h-10">
                                <TableCell className="font-mono text-[9px] font-bold">
                                  {tx.created_at ? new Date(tx.created_at).toLocaleDateString("en-IN") : "-"}
                                </TableCell>
                                <TableCell className="font-bold text-[10px] uppercase truncate max-w-[100px]">
                                  {tx.training_enrollments?.profiles?.full_name || "-"}
                                </TableCell>
                                <TableCell className="truncate max-w-[120px]">
                                  <span className="bg-navy/10 text-navy px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                                    {tx.training_enrollments?.trainings?.name || "-"}
                                  </span>
                                </TableCell>
                                <TableCell className="font-black text-xs text-green-700">
                                  ₹{Number(tx.amount || 0).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                                    tx.status === "captured" ? "bg-green-100 text-green-700" :
                                    tx.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                    "bg-slate-100 text-slate-600"
                                  }`}>
                                    {tx.status || "unknown"}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border-2 border-dashed rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[220px]">
                  <Users className="size-10 text-slate-300 mb-2 animate-bounce" />
                  <h4 className="font-black text-xs text-navy-deep uppercase">No Sales Rep Selected</h4>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-xs leading-relaxed uppercase font-semibold">
                    Select a representative from the directory on the left to monitor transaction history and KPIs.
                  </p>
                </div>
              )}

              {/* Bulk CSV Import & Equal Distribution */}
              <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b pb-2">
                  <div className="size-8 rounded-xl bg-gold/10 text-gold grid place-items-center flex-shrink-0">
                    <Upload size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-navy uppercase tracking-tight">Bulk Lead Distributor</h3>
                    <p className="text-[8px] text-muted-foreground font-black uppercase tracking-wider">
                      Distribute uploaded student records equally among checked reps
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Label className="text-[9px] font-black uppercase text-slate-500">Upload CSV file</Label>
                      <Input
                        id="bulk_sales_csv_input"
                        type="file"
                        accept=".csv"
                        onChange={handleSalesCSVFileChange}
                        className="h-10 rounded-xl font-bold text-xs border-2 cursor-pointer bg-white"
                      />
                      <p className="text-[8px] text-slate-400 font-bold uppercase mt-1 leading-normal">
                        Required: full_name, email — Optional: contact_number, university_name, college_name, department
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-slate-500">Reps to Assign ({selectedRepsForCSV.length} selected)</Label>
                      {salesUsers.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">No sales reps found.</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 border rounded-xl p-2.5 max-h-32 overflow-y-auto bg-slate-50">
                          {salesUsers.map(rep => (
                            <label key={rep.id} className="flex items-center gap-2 text-[10px] font-bold text-slate-700 cursor-pointer hover:text-navy p-1 rounded hover:bg-white transition-colors">
                              <input
                                type="checkbox"
                                checked={selectedRepsForCSV.includes(rep.id)}
                                onChange={e => {
                                  if (e.target.checked) {
                                    setSelectedRepsForCSV(prev => [...prev, rep.id]);
                                  } else {
                                    setSelectedRepsForCSV(prev => prev.filter(id => id !== rep.id));
                                  }
                                }}
                                className="rounded text-gold focus:ring-gold"
                              />
                              <span className="truncate">{rep.full_name}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border flex flex-col justify-between">
                    <div className="space-y-3">
                      <h4 className="text-[9px] font-black text-navy uppercase tracking-wider border-b pb-1">Distribution Preview</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-2.5 rounded-lg border shadow-sm">
                          <div className="text-[8px] text-slate-400 font-black uppercase">CSV Records</div>
                          <div className="text-xl font-black text-navy-deep">{parsedCSVStudentsCount}</div>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border shadow-sm">
                          <div className="text-[8px] text-slate-400 font-black uppercase">Active Reps</div>
                          <div className="text-xl font-black text-navy-deep">{selectedRepsForCSV.length}</div>
                        </div>
                      </div>
                      
                      {parsedCSVStudentsCount > 0 && selectedRepsForCSV.length > 0 && (
                        <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-[9px] text-blue-700 font-bold uppercase tracking-wide">
                          Ratio: ≈ {Math.ceil(parsedCSVStudentsCount / selectedRepsForCSV.length)} per rep.
                        </div>
                      )}
                      
                      {importCSVProgress && (
                        <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-1.5 text-[9px] text-amber-700 font-bold uppercase">
                          <Loader2 className="animate-spin size-3 flex-shrink-0" />
                          <span className="truncate">{importCSVProgress}</span>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={handleDistributeAndAssignCSV}
                      disabled={importingCSV || parsedCSVStudentsCount === 0 || selectedRepsForCSV.length === 0}
                      className="w-full h-10 mt-4 bg-gold hover:bg-gold/90 text-navy-deep rounded-xl font-black text-[9px] uppercase tracking-widest shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      {importingCSV
                        ? <><Loader2 className="animate-spin size-4" /> Distributing...</>
                        : <><Upload size={14} /> Run Distribution</>
                      }
                    </Button>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Row: Active Student Assignments Grid */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-black text-navy-deep uppercase tracking-tight flex items-center gap-2">
                  <PhoneCall className="size-4 text-gold" /> Master Lead Assignments Register
                </h3>
                <p className="text-[8px] text-muted-foreground font-black uppercase tracking-wider mt-0.5">
                  Real-time status tracking of all assigned student leads
                </p>
              </div>
              <span className="text-[10px] font-black uppercase bg-gold/10 text-amber-700 px-3 py-1 rounded-full border border-amber-200 font-mono">
                {salesAssignments.length} total assignments
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-black uppercase text-[9px] tracking-widest text-navy/40">Student</TableHead>
                    <TableHead className="font-black uppercase text-[9px] tracking-widest text-navy/40">Contact Info</TableHead>
                    <TableHead className="font-black uppercase text-[9px] tracking-widest text-navy/40">Assigned Representative</TableHead>
                    <TableHead className="font-black uppercase text-[9px] tracking-widest text-navy/40">Call Status</TableHead>
                    <TableHead className="font-black uppercase text-[9px] tracking-widest text-navy/40">Log / Remarks</TableHead>
                    <TableHead className="font-black uppercase text-[9px] tracking-widest text-navy/40">Assigned On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesAssignments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-slate-400 italic text-xs font-bold">
                        No lead assignments recorded in the database.
                      </TableCell>
                    </TableRow>
                  ) : salesAssignments.map((a: any) => (
                    <TableRow key={a.id} className="hover:bg-gold/5 transition-all border-b last:border-0 h-14">
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="size-8 rounded-lg bg-navy/10 text-navy grid place-items-center font-black text-xs">
                            {a.profile?.full_name?.charAt(0) || "?"}
                          </div>
                          <div className="font-black text-xs text-navy-deep uppercase tracking-tight">{a.profile?.full_name || "-"}</div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="text-[10px] font-bold text-slate-600">{a.profile?.email || "-"}</div>
                        <div className="font-mono text-[9px] text-slate-400">{a.profile?.contact_number || "-"}</div>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="bg-blue-50 text-blue-700 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border border-blue-200">
                          {a.rep?.full_name || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          a.status === "enrolled" ? "bg-green-100 text-green-700 border border-green-200" :
                          a.status === "called" ? "bg-blue-100 text-blue-700 border border-blue-200" :
                          "bg-yellow-100 text-yellow-700 border border-yellow-200"
                        }`}>
                          {a.status || "assigned"}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 max-w-[200px] truncate py-3" title={a.remark}>
                        {a.remark || <span className="italic text-slate-400">—</span>}
                      </TableCell>
                      <TableCell className="font-mono text-[10px] text-slate-400 py-3">
                        {a.created_at ? new Date(a.created_at).toLocaleDateString("en-IN") : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

        </div>
      )}

      {/* ============ JOB CAMPUS MANAGEMENT ============ */}
      {view === "jobs" && <JobCampusAdminView />}

      {/* ============ REFERRAL MANAGEMENT ============ */}
      {view === "referrals" && <ReferralAdminView />}
    </div>
  );
}
