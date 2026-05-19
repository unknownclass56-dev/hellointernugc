import { createFileRoute } from "@tanstack/react-router";
import { Receipt, Download, CreditCard, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/dashboard/student/payments")({
  component: StudentPayments,
});

function StudentPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentReason, setPaymentReason] = useState("Verification & Certification Fee");
  const [paymentAmount, setPaymentAmount] = useState("150");
  const [customAmount, setCustomAmount] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchPayments();
      fetchProfile();
    }
  }, [user]);

  async function fetchPayments() {
    const { data } = await supabase
      .from("payments")
      .select("*")
      .eq("student_id", user?.id)
      .order("created_at", { ascending: false });
    setPayments(data || []);
  }

  async function fetchProfile() {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user?.id)
      .maybeSingle();
    setProfile(data);
  }

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayNow = async () => {
    const finalAmountStr = paymentReason === "Other" ? customAmount : paymentAmount;
    const finalAmount = parseFloat(finalAmountStr);
    if (isNaN(finalAmount) || finalAmount <= 0) {
      return toast.error("Please enter a valid payment amount.");
    }

    setProcessing(true);
    const loaded = await loadRazorpay();
    if (!loaded) {
      setProcessing(false);
      return toast.error("Failed to load Razorpay payment gateway. Please check your internet connection.");
    }

    const options = {
      key: "rzp_live_SrD6N9ylebiBCT",
      amount: Math.round(finalAmount * 100), // in paise
      currency: "INR",
      name: "TechLaunchpad",
      description: paymentReason === "Other" ? "Custom Training Fee" : paymentReason,
      handler: async function (response: any) {
        try {
          const newPayment = {
            student_id: user?.id,
            amount: finalAmount,
            status: "Paid",
            slip_url: `https://dashboard.razorpay.com/app/payments/${response.razorpay_payment_id}`,
            created_at: new Date().toISOString()
          };
          const { error } = await supabase.from("payments").insert([newPayment]);
          if (error) throw error;

          toast.success("Payment completed successfully! Transaction ID: " + response.razorpay_payment_id);
          setIsModalOpen(false);
          fetchPayments();
        } catch (err: any) {
          toast.error("Failed to save transaction record: " + err.message);
        } finally {
          setProcessing(false);
        }
      },
      prefill: {
        name: profile?.full_name || "",
        email: user?.email || "",
        contact: profile?.contact_number || ""
      },
      theme: {
        color: "#0f172a" // Deep Navy color theme
      },
      modal: {
        ondismiss: function () {
          setProcessing(false);
        }
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  const activeAmount = paymentReason === "Other" ? customAmount : paymentAmount;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="font-display text-4xl font-black text-navy-deep uppercase tracking-tighter">Payments Hub</h1>
        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">Manage processing fees, training subscriptions, and digital receipts.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        
        {/* PAYMENT PORTAL BOX */}
        <div className="rounded-3xl border border-navy/5 bg-white p-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5"><CreditCard size={150} className="text-navy" /></div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-2 text-gold font-black text-[9px] uppercase tracking-widest">
              <Sparkles size={12} /> Secure Razorpay Gateway
            </div>
            <div>
              <h2 className="font-display text-2xl font-black text-navy-deep uppercase tracking-tight">Make a Payment</h2>
              <p className="mt-1.5 text-xs font-medium text-slate-500 leading-relaxed">
                Found an internship track with processing or admission credentials fees? Process it securely via Razorpay instantly.
              </p>
            </div>
          </div>
          
          <div className="mt-10">
            <Dialog open={isModalOpen} onOpenChange={(open) => {
              if (!processing) setIsModalOpen(open);
            }}>
              <DialogTrigger asChild>
                <Button className="w-full bg-navy text-ivory hover:bg-navy-deep h-14 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-[0.98] transition-all">
                  PROCEED TO PAYMENT GATEWAY
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-white rounded-3xl p-6 border-none shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl font-black uppercase tracking-tight text-navy-deep">Razorpay Checkout</DialogTitle>
                  <DialogDescription className="text-xs font-medium text-slate-400 uppercase tracking-wider">Configure your transaction purpose & billing amount.</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-navy/60 tracking-wider">Payment Purpose / Track <span className="text-red-500">*</span></Label>
                    <select 
                      value={paymentReason} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setPaymentReason(val);
                        if (val === "Verification & Certification Fee") setPaymentAmount("150");
                        else if (val === "Premium Placement Training Fee") setPaymentAmount("2500");
                        else if (val === "Internship Admission Processing Fee") setPaymentAmount("999");
                        else setPaymentAmount("0");
                      }} 
                      className="w-full h-11 border rounded-xl px-3 font-bold text-xs bg-white outline-none focus:border-navy"
                    >
                      <option value="Verification & Certification Fee">Verification & Certification Fee (₹1,500)</option>
                      <option value="Premium Placement Training Fee">Premium Placement Training Fee (₹2,500)</option>
                      <option value="Internship Admission Processing Fee">Internship Admission Processing Fee (₹999)</option>
                      <option value="Other">Other Custom Payment Track</option>
                    </select>
                  </div>

                  {paymentReason === "Other" && (
                    <div className="space-y-2 animate-in fade-in duration-300">
                      <Label className="text-[10px] font-black uppercase text-navy/60 tracking-wider">Enter Custom Amount (INR) <span className="text-red-500">*</span></Label>
                      <Input 
                        type="number" 
                        placeholder="e.g. 500" 
                        value={customAmount} 
                        onChange={(e) => setCustomAmount(e.target.value)} 
                        className="h-11 rounded-xl font-bold"
                      />
                    </div>
                  )}

                  {/* SUMMARY BOX */}
                  <div className="bg-slate-50 p-5 rounded-2xl border space-y-3">
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>Subtotal:</span>
                      <span>₹{activeAmount || "0"}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>Gateway Taxes & Processing:</span>
                      <span className="text-green-600 uppercase text-[9px] font-black">Waived (₹0)</span>
                    </div>
                    <div className="h-px bg-slate-200"></div>
                    <div className="flex justify-between text-sm font-black text-navy-deep">
                      <span>Total Amount Payable:</span>
                      <span className="text-gold">₹{activeAmount || "0"}</span>
                    </div>
                  </div>
                </div>

                <DialogFooter className="flex gap-2">
                  <Button 
                    onClick={handlePayNow} 
                    disabled={processing || !activeAmount || parseFloat(activeAmount) <= 0} 
                    className="flex-1 bg-navy text-ivory hover:bg-navy-deep h-12 rounded-xl font-black text-xs uppercase tracking-widest"
                  >
                    {processing ? <Loader2 className="animate-spin mr-2" /> : <CreditCard size={14} className="mr-2" />}
                    PAY ₹{activeAmount || "0"} NOW
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsModalOpen(false)} 
                    disabled={processing}
                    className="h-12 font-black text-[10px] uppercase text-slate-400 tracking-wider"
                  >
                    Cancel
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* TRANSACTION HISTORY BOX */}
        <div className="rounded-3xl border border-navy/5 bg-white p-8 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <Receipt className="text-navy size-6" />
            <h2 className="font-display text-xl font-black text-navy-deep uppercase tracking-tight">Transaction History</h2>
          </div>
          <div className="space-y-4">
            {payments.length === 0 ? (
              <div className="py-12 text-center text-slate-400 italic text-xs border-2 border-dashed rounded-2xl">
                No verified payment transactions found.
              </div>
            ) : (
              <div className="divide-y max-h-[380px] overflow-y-auto pr-2 space-y-3 divide-slate-100">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between pt-3 first:pt-0">
                    <div>
                      <div className="font-black text-navy-deep flex items-center gap-2 text-sm">
                        ₹{p.amount} <CheckCircle2 className="size-4 text-green-500" />
                      </div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        {new Date(p.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    {p.slip_url ? (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-navy hover:bg-navy/5 font-black text-[10px] uppercase tracking-wider rounded-lg h-9" 
                        onClick={() => window.open(p.slip_url, '_blank')}
                      >
                        <Download className="size-3.5 mr-2" /> Receipt
                      </Button>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold uppercase italic">No receipt</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
