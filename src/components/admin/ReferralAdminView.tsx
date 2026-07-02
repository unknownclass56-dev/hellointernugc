import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export function ReferralAdminView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-black text-navy-deep uppercase tracking-tight flex items-center gap-2">
            <Users className="size-5 text-gold" /> Referral Administration
          </h2>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
            Manage referral agents and tracked students.
          </p>
        </div>
      </div>

      <Card className="rounded-2xl shadow-sm border-dashed">
        <CardHeader>
          <CardTitle className="text-center text-slate-400">Under Construction</CardTitle>
        </CardHeader>
        <CardContent className="text-center pb-8">
          <p className="text-sm text-slate-500">The referral administration view is currently being built.</p>
        </CardContent>
      </Card>
    </div>
  );
}
