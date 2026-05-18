import { createFileRoute } from "@tanstack/react-router";
import { Receipt, Download, CreditCard, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/student/payments")({
  component: StudentPayments,
});

function StudentPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      supabase.from("payments").select("*").eq("student_id", user.id).order("created_at", { ascending: false })
        .then(({ data }) => setPayments(data || []));
    }
  }, [user]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy-deep">Payment Slips</h1>
        <p className="text-muted-foreground">Download your fees receipts and payment confirmations.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-navy/10 bg-navy/5 p-8 flex flex-col items-center text-center">
          <div className="grid size-16 place-items-center rounded-full bg-navy text-ivory mb-4 shadow-lg">
            <CreditCard className="size-8" />
          </div>
          <h2 className="font-display text-xl font-bold text-navy-deep">Make a Payment</h2>
          <p className="mt-2 text-sm text-muted-foreground mb-6">Found an internship with a processing fee? Pay securely here.</p>
          <Button className="w-full bg-navy text-ivory hover:bg-navy-deep">PROCEED TO PAYMENT</Button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-navy-deep mb-4">Transaction History</h2>
          <div className="space-y-4">
            {payments.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground italic text-sm border-t border-border mt-2">
                No payment records found.
              </div>
            ) : payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between border-t border-border pt-4 first:border-0 first:pt-0">
                <div>
                  <div className="font-bold text-navy-deep flex items-center gap-2">
                    ₹{p.amount} <CheckCircle2 className="size-3 text-green-500" />
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase">{new Date(p.created_at).toLocaleDateString()}</div>
                </div>
                <Button size="sm" variant="ghost" className="text-navy hover:bg-navy/5" onClick={() => p.slip_url && window.open(p.slip_url, '_blank')}>
                  <Download className="size-4 mr-2" /> SLIP
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
