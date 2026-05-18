import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, MessageSquare, Send, Bell, Clock, User, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/inbox")({
  component: UnifiedInbox,
});

function UnifiedInbox() {
  const [messages, setMessages] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;
    
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", authUser.id).single();
    setUser(profile);

    // Fetch messages where recipient is current user OR it's a broadcast
    const { data } = await supabase
      .from("inbox")
      .select("*, sender:profiles!inbox_sender_id_fkey(full_name, role)")
      .or(`recipient_id.eq.${authUser.id},is_broadcast.eq.true`)
      .order("created_at", { ascending: false });

    setMessages(data || []);
    setLoading(false);
  }

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = fd.get("title") as string;
    const message = fd.get("message") as string;
    const type = fd.get("type") as string;

    setBusy(true);
    const { error } = await supabase.from("inbox").insert({
      sender_id: user.id,
      title,
      message,
      is_broadcast: type === "broadcast",
      recipient_id: type === "broadcast" ? null : null // For now we only support broadcast or self
    });

    setBusy(false);
    if (!error) {
      toast.success("Message sent successfully!");
      setIsComposeOpen(false);
      fetchData();
    } else {
      toast.error("Error: " + error.message);
    }
  };

  if (loading) return <div className="h-screen grid place-items-center bg-white font-black text-xs uppercase tracking-widest text-navy animate-pulse">Synchronizing Communications...</div>;

  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
           <div className="flex items-center gap-2 text-[10px] font-black text-gold uppercase tracking-[0.3em] mb-1">
              <Bell size={12} /> Communication Center
           </div>
           <h1 className="font-display text-4xl font-black text-navy-deep uppercase tracking-tighter">Portal Inbox</h1>
           <p className="text-muted-foreground font-bold text-sm">Stay updated with official announcements and internship updates.</p>
        </div>
        {isAdmin && (
           <Button onClick={() => setIsComposeOpen(!isComposeOpen)} className="bg-navy text-white px-8 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2">
              <Send size={16} /> {isComposeOpen ? "Close Composer" : "New Broadcast"}
           </Button>
        )}
      </div>

      {isComposeOpen && isAdmin && (
         <div className="bg-white p-8 rounded-[2rem] border-2 border-gold shadow-2xl animate-in slide-in-from-top-4 duration-300">
            <h2 className="text-xl font-black text-navy-deep uppercase tracking-tight mb-6 flex items-center gap-2">
               <MessageSquare className="text-gold" /> Compose Official Broadcast
            </h2>
            <form onSubmit={handleSendMessage} className="space-y-4">
               <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-navy/40 ml-2">Message Subject</label>
                     <Input name="title" placeholder="e.g. Important Update regarding Internship" required className="h-12 rounded-xl font-bold text-navy border-2 focus:border-gold" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-navy/40 ml-2">Broadcast Type</label>
                     <select name="type" className="w-full h-12 rounded-xl font-bold text-navy border-2 focus:border-gold bg-white px-4 outline-none">
                        <option value="broadcast">Global Broadcast (All Students)</option>
                     </select>
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-navy/40 ml-2">Detailed Content</label>
                  <textarea name="message" required placeholder="Type your official announcement here..." className="w-full h-32 bg-navy/5 border-2 rounded-2xl p-4 text-sm font-bold text-navy outline-none focus:border-gold transition-all" />
               </div>
               <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={busy} className="bg-navy text-white px-12 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest">
                     {busy ? "Sending..." : "Deploy Announcement"}
                  </Button>
               </div>
            </form>
         </div>
      )}

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="rounded-[2.5rem] border-2 border-dashed border-navy/10 bg-white p-24 text-center">
            <Mail className="mx-auto size-20 text-navy/10 mb-6" />
            <h3 className="text-xl font-black text-navy uppercase tracking-widest opacity-40">Your Inbox is Empty</h3>
            <p className="text-xs font-bold mt-2 uppercase tracking-tight text-muted-foreground">You have no official messages or announcements at this time.</p>
          </div>
        ) : messages.map((msg) => (
          <div key={msg.id} className="group relative bg-white rounded-[2rem] border-2 border-navy/5 p-8 shadow-sm transition-all hover:shadow-xl hover:border-gold/30">
            <div className="flex items-start justify-between gap-6">
               <div className="flex gap-6">
                  <div className="size-14 rounded-2xl bg-navy/5 grid place-items-center flex-shrink-0 group-hover:bg-navy/10 transition-colors">
                     <Mail className="text-navy/40 group-hover:text-gold transition-colors" size={24} />
                  </div>
                  <div className="space-y-2">
                     <div className="flex items-center gap-3">
                        {msg.is_broadcast ? (
                           <span className="px-3 py-1 bg-gold text-navy-deep text-[8px] font-black uppercase tracking-widest rounded-full">OFFICIAL BROADCAST</span>
                        ) : (
                           <span className="px-3 py-1 bg-navy text-white text-[8px] font-black uppercase tracking-widest rounded-full">DIRECT MESSAGE</span>
                        )}
                        <span className="text-[10px] font-black uppercase text-navy/40 flex items-center gap-1">
                           <Clock size={12} /> {new Date(msg.created_at).toLocaleDateString()}
                        </span>
                     </div>
                     <h3 className="text-2xl font-black text-navy-deep uppercase tracking-tighter leading-none">{msg.title}</h3>
                     <p className="text-sm font-medium text-muted-foreground max-w-3xl leading-relaxed">
                        {msg.message}
                     </p>
                     <div className="flex items-center gap-2 pt-2 text-[10px] font-black uppercase text-navy/40">
                        <User size={12} /> Sent by: <span className="text-navy">{msg.sender?.full_name || "Administration"}</span>
                     </div>
                  </div>
               </div>
               {isAdmin && (
                  <Button variant="ghost" size="icon" className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={async () => {
                     if(confirm("Delete message?")) {
                        await supabase.from("inbox").delete().eq("id", msg.id);
                        fetchData();
                     }
                  }}>
                     <Trash2 size={18} />
                  </Button>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
