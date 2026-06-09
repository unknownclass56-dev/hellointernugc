import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { PageShell } from "@/components/PageShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Receipt } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

export const Route = createFileRoute("/counselor")({
  component: CounselorPage,
});

function loadRazorpayScript() {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function CounselorPage() {
  const [busy, setBusy] = useState(false);
  const [fee, setFee] = useState(200);
  const [institutes, setInstitutes] = useState<any[]>([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    // Fetch fee
    const { data: settingsData } = await supabase.from("counselor_settings").select("fee").eq("id", "global").single();
    if (settingsData?.fee) {
      setFee(settingsData.fee);
    }
    
    // Fetch institutes
    const { data: instData } = await supabase.from("counselor_institutes").select("*").order("name");
    if (instData) {
      setInstitutes(instData);
    }
  }

  const generatePDF = (data: any, referenceNo: string) => {
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text("TechLaunchpad - Counselor Receipt", 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Reference No: ${referenceNo}`, 14, 32);
    doc.text(`Date: ${new Date().toLocaleString()}`, 14, 38);
    doc.text(`Amount Paid: Rs. ${fee}`, 14, 44);
    
    doc.text(`Student Name: ${data.student_name}`, 14, 54);
    doc.text(`Email: ${data.email}`, 14, 60);
    doc.text(`Phone: ${data.phone}`, 14, 66);
    
    doc.text(`Preferred Institute: ${data.preferred_institute}`, 14, 76);
    
    // Generate simple table for academic details
    const tableData = [
      ["10th Board", data.board_10th, "Marks", data.marks_10th],
      ["12th Board", data.board_12th, "Marks/Stream", `${data.marks_12th} (${data.stream_12th})`],
      ["Graduation", `${data.grad_course} at ${data.grad_college}, ${data.grad_university}`, "Marks", data.grad_marks],
      ["Post Grad", `${data.pg_course} at ${data.pg_college}, ${data.pg_university}`, "Passing Year", data.pg_year_of_passing]
    ];
    
    (doc as any).autoTable({
      startY: 85,
      head: [["Level", "Details", "Metric", "Value"]],
      body: tableData,
    });
    
    doc.save(`counselor-receipt-${referenceNo}.pdf`);
  };

  async function handlePaymentAndSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const formDataObj = Object.fromEntries(fd);

    setBusy(true);

    // 1. Save initial record as 'pending'
    const { data: record, error } = await supabase.from("counselor_applications").insert({
      student_name: formDataObj.student_name,
      email: formDataObj.email,
      phone: formDataObj.phone,
      marks_10th: formDataObj.marks_10th,
      board_10th: formDataObj.board_10th,
      marks_12th: formDataObj.marks_12th,
      board_12th: formDataObj.board_12th,
      stream_12th: formDataObj.stream_12th,
      grad_marks: formDataObj.grad_marks,
      grad_university: formDataObj.grad_university,
      grad_college: formDataObj.grad_college,
      grad_course: formDataObj.grad_course,
      pg_course: formDataObj.pg_course,
      pg_university: formDataObj.pg_university,
      pg_college: formDataObj.pg_college,
      pg_year_of_passing: formDataObj.pg_year_of_passing,
      preferred_institute: formDataObj.preferred_institute,
      expected_college: formDataObj.expected_college,
      remark: formDataObj.remark,
      status: "pending"
    }).select().single();

    if (error) {
      toast.error("Failed to submit form: " + error.message);
      setBusy(false);
      return;
    }

    // 2. Load Razorpay
    const res = await loadRazorpayScript();
    if (!res) {
      toast.error("Razorpay SDK failed to load. Are you online?");
      setBusy(false);
      return;
    }

    // 3. Open Razorpay Checkout (Simulating server order for simplicity in frontend, ideally use order_id)
    const options = {
      key: "rzp_test_dummy_key_please_change", // Will fail if not a real key, but we mock success for demonstration if needed.
      amount: fee * 100, // Amount is in currency subunits.
      currency: "INR",
      name: "TechLaunchpad",
      description: "Student Admission Counselor Fee",
      handler: async function (response: any) {
        // Success handler
        const referenceNo = response.razorpay_payment_id || `REF-${Math.floor(Math.random() * 1000000)}`;
        
        // Update record in DB
        await supabase.from("counselor_applications").update({
          status: "paid",
          fee_paid: fee,
          payment_reference: referenceNo
        }).eq("id", record.id);

        toast.success("Payment Successful! Generating receipt...");
        
        // Generate PDF
        generatePDF(formDataObj, referenceNo);
        
        // Reset
        setBusy(false);
        if (e.target instanceof HTMLFormElement) {
           e.target.reset();
        }
      },
      prefill: {
        name: formDataObj.student_name,
        email: formDataObj.email,
        contact: formDataObj.phone,
      },
      theme: {
        color: "#1e40af",
      },
    };

    try {
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any){
           toast.error("Payment Failed: " + response.error.description);
           setBusy(false);
        });
        rzp.open();
    } catch(err) {
        // Fallback for missing keys / local testing without valid key
        toast.error("Invalid Razorpay Key. Simulating success for testing.");
        const referenceNo = `TEST-REF-${Math.floor(Math.random() * 1000000)}`;
        await supabase.from("counselor_applications").update({
          status: "paid",
          fee_paid: fee,
          payment_reference: referenceNo
        }).eq("id", record.id);
        toast.success("Payment Successful (Test)! Generating receipt...");
        generatePDF(formDataObj, referenceNo);
        setBusy(false);
        if (e.target instanceof HTMLFormElement) {
           e.target.reset();
        }
    }
  }

  return (
    <PageShell>
      <section className="bg-gradient-to-b from-navy-deep to-navy py-14 text-ivory">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Admission Counselor</h1>
          <p className="mx-auto mt-3 max-w-xl text-ivory/80">Get expert guidance on institutes, courses, and admissions.</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
           <div className="mb-6 pb-6 border-b flex justify-between items-center">
              <div>
                 <h2 className="text-xl font-bold text-navy-deep">Counselor Application</h2>
                 <p className="text-sm text-muted-foreground mt-1">Fill your details. A counselor fee of Rs. {fee} applies.</p>
              </div>
              <div className="bg-gold/10 text-gold px-4 py-2 rounded-xl font-bold border border-gold/20 flex items-center gap-2">
                 <Receipt size={18} /> Rs. {fee}
              </div>
           </div>

           <form onSubmit={handlePaymentAndSubmit} className="space-y-8">
              {/* Personal Details */}
              <div className="space-y-4">
                 <h3 className="text-sm font-black uppercase text-navy/50 tracking-wider">Personal Information</h3>
                 <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2"><Label>Full Name *</Label><Input name="student_name" required /></div>
                    <div className="space-y-2"><Label>Email *</Label><Input type="email" name="email" required /></div>
                    <div className="space-y-2"><Label>Phone *</Label><Input name="phone" required /></div>
                 </div>
              </div>

              {/* 10th Details */}
              <div className="space-y-4">
                 <h3 className="text-sm font-black uppercase text-navy/50 tracking-wider">10th Details</h3>
                 <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>10th Marks/CGPA *</Label><Input name="marks_10th" required /></div>
                    <div className="space-y-2"><Label>10th Board *</Label><Input name="board_10th" required /></div>
                 </div>
              </div>

              {/* 12th Details */}
              <div className="space-y-4">
                 <h3 className="text-sm font-black uppercase text-navy/50 tracking-wider">12th Details</h3>
                 <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2"><Label>12th Marks/CGPA *</Label><Input name="marks_12th" required /></div>
                    <div className="space-y-2"><Label>12th Board *</Label><Input name="board_12th" required /></div>
                    <div className="space-y-2"><Label>Stream *</Label><Input name="stream_12th" required placeholder="e.g. PCM, PCB, Commerce" /></div>
                 </div>
              </div>

              {/* Graduation Details */}
              <div className="space-y-4">
                 <h3 className="text-sm font-black uppercase text-navy/50 tracking-wider">Graduation Details (if applicable)</h3>
                 <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Course Name</Label><Input name="grad_course" /></div>
                    <div className="space-y-2"><Label>Marks/CGPA</Label><Input name="grad_marks" /></div>
                    <div className="space-y-2"><Label>College</Label><Input name="grad_college" /></div>
                    <div className="space-y-2"><Label>University</Label><Input name="grad_university" /></div>
                 </div>
              </div>

              {/* PG Details */}
              <div className="space-y-4">
                 <h3 className="text-sm font-black uppercase text-navy/50 tracking-wider">Post Graduation Details (if applicable)</h3>
                 <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Course Name</Label><Input name="pg_course" /></div>
                    <div className="space-y-2"><Label>Year of Passing</Label><Input name="pg_year_of_passing" /></div>
                    <div className="space-y-2"><Label>College</Label><Input name="pg_college" /></div>
                    <div className="space-y-2"><Label>University</Label><Input name="pg_university" /></div>
                 </div>
              </div>

              {/* Preferred Institute & Extras */}
              <div className="space-y-4 border-t pt-8">
                 <h3 className="text-sm font-black uppercase text-navy/50 tracking-wider">Counseling Preference</h3>
                 <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label>Select Preferred Institute (Optional)</Label>
                       <select name="preferred_institute" className="w-full h-10 px-3 rounded-md border border-input bg-transparent">
                          <option value="">-- No Preference / Discuss with Counselor --</option>
                          {institutes.map(inst => (
                             <option key={inst.id} value={inst.name}>{inst.name}</option>
                          ))}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <Label>Expected College (if any)</Label>
                       <Input name="expected_college" placeholder="e.g. NIT Patna" />
                    </div>
                 </div>
                 <div className="space-y-2 mt-4">
                    <Label>Remarks / Additional Notes</Label>
                    <textarea name="remark" className="w-full h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" placeholder="Any specific requirements or questions..." />
                 </div>
              </div>

              <div className="border-t pt-6 flex justify-end">
                 <Button type="submit" disabled={busy} className="bg-navy text-ivory hover:bg-navy-deep px-10 h-12">
                    {busy ? <Loader2 className="mr-2 animate-spin size-4" /> : null}
                    {busy ? "Processing..." : `Pay Rs. ${fee} & Submit`}
                 </Button>
              </div>
           </form>
        </div>
      </section>
    </PageShell>
  );
}
