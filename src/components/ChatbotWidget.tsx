import { useState } from "react";
import { Bot, X, Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SUGGESTIONS = [
  "How do I apply for an internship?",
  "Are certificates verifiable?",
  "Which programs are AICTE approved?",
  "How can my company list internships?",
];

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "bot" | "user"; text: string }[]>([
    { role: "bot", text: "Namaste 🙏 I'm TechLaunchpad's assistant. Ask me anything about internships, certificates, or our programs." },
  ]);
  const [input, setInput] = useState("");

  function send(text: string) {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { role: "bot", text: "Thanks for your question! Our team will route this to the right resource. For instant help, please email support@techlaunchpad.in or browse our FAQ." },
      ]);
    }, 600);
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open chat assistant"
        className="fixed bottom-6 right-6 z-50 grid size-14 place-items-center rounded-full bg-gradient-to-br from-gold to-gold-soft text-navy-deep shadow-[var(--shadow-gold)] hover:scale-105 transition-transform"
      >
        {open ? <X className="size-6" /> : <Bot className="size-6" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 flex h-[460px] w-[min(92vw,360px)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-border bg-navy-deep px-4 py-3 text-ivory">
              <Sparkles className="size-4 text-gold" />
              <div className="flex-1">
                <div className="text-sm font-semibold">TechLaunchpad Assistant</div>
                <div className="text-[11px] text-ivory/60">Typically replies in seconds</div>
              </div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-3">
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : "flex"}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.role === "user" ? "bg-navy text-ivory rounded-br-sm" : "bg-secondary rounded-bl-sm"}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:border-gold hover:text-navy-deep">
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="flex items-center gap-2 border-t border-border p-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 rounded-md bg-secondary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <button type="submit" className="grid size-9 place-items-center rounded-md bg-navy text-ivory hover:bg-navy-deep">
                <Send className="size-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
