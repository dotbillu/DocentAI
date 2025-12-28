"use client";

import React, { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Mail, Send, Lock, CheckCircle2, AlertCircle, X, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button"; // Check your button path
import Link from "next/link";

export default function HelpPage() {
  const { data: session, status } = useSession();
  
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sendingState, setSendingState] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSendingState("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to send");
      }

      setSendingState("success");
      setSubject("");
      setMessage("");
      
      // Reset success message after 4 seconds
      setTimeout(() => setSendingState("idle"), 4000);

    } catch (error) {
      console.error("Submission failed:", error);
      setSendingState("error");
    }
  };

  // 1. Loading View
  if (status === "loading") {
    return (
      <div className="flex-1 bg-titanium-950 flex items-center justify-center text-titanium-400">
        <Loader2 className="animate-spin mr-2" /> Loading...
      </div>
    );
  }

  // 2. Unauthenticated View (Lock Screen)
  if (status === "unauthenticated") {
    return (
      <div className="flex-1 bg-titanium-950 relative z-10 h-full flex items-center justify-center p-6">
        <div className="bg-titanium-900 border border-titanium-800 p-8 rounded-2xl max-w-md text-center space-y-6 shadow-2xl relative overflow-hidden">
           {/* Background Glow */}
           <div className="absolute inset-0 bg-blue-500/10 blur-[80px] -z-10"></div>
           
           <div className="w-16 h-16 bg-titanium-800 rounded-full flex items-center justify-center mx-auto">
              <Lock size={32} className="text-blue-400" />
           </div>
           
           <h1 className="text-2xl font-bold text-white">Authentication Required</h1>
           <p className="text-titanium-400">
             Please sign in to access Enterprise Support and submit priority tickets.
           </p>
           
           <Button onClick={() => signIn("google")} className="w-full py-3 text-base">
             Sign In with Google
           </Button>
        </div>
      </div>
    );
  }

  // 3. Authenticated View (Contact Form)
  return (
    <div className="flex-1 overflow-y-auto bg-titanium-950 w-full relative z-10 h-full flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-titanium-900 border border-titanium-800 rounded-xl shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-titanium-800/50 px-6 py-4 flex items-center justify-between border-b border-titanium-800">
           <div className="flex items-center gap-3">
             <Mail size={20} className="text-titanium-400" />
             <h1 className="text-white font-semibold">Enterprise Support</h1>
           </div>
           <Link href="/" className="text-titanium-400 hover:text-white transition-colors">
             <X size={20} />
           </Link>
        </div>

        {/* Form Content */}
        <div className="p-6 relative">
           
           {/* Loading Overlay */}
           {sendingState === "loading" && (
             <div className="absolute inset-0 bg-titanium-950/80 z-20 flex items-center justify-center rounded-b-xl backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                   <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                   <span className="text-blue-400 text-sm font-medium">Sending via Resend...</span>
                </div>
             </div>
           )}

           {/* Success Alert */}
           {sendingState === "success" && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3 text-emerald-400 animate-in slide-in-from-top-2">
                 <CheckCircle2 size={20} />
                 <div>
                    <p className="font-semibold">Ticket Sent!</p>
                    <p className="text-sm opacity-90">We have received your message and will reply shortly.</p>
                 </div>
              </div>
           )}
           
           {/* Error Alert */}
           {sendingState === "error" && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 animate-in slide-in-from-top-2">
                 <AlertCircle size={20} />
                 <span>Failed to send. Please try again.</span>
              </div>
           )}

           <form onSubmit={handleSubmit} className="space-y-4">
              {/* FROM */}
              <div className="flex items-center border-b border-titanium-800 pb-2">
                <span className="text-titanium-500 w-16 shrink-0">From</span>
                <span className="text-titanium-100 font-mono text-sm">{session?.user?.email}</span>
              </div>

              {/* SUBJECT */}
              <div className="flex items-center border-b border-titanium-800 pt-2">
                <input 
                  type="text" 
                  placeholder="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-white placeholder:text-titanium-600 py-2 transition-colors focus:placeholder:text-titanium-400 font-medium"
                  required
                />
              </div>

              {/* MESSAGE */}
              <div className="pt-2">
                 <textarea 
                    placeholder="Describe your issue or feature request..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full h-64 bg-transparent border-none outline-none text-titanium-100 placeholder:text-titanium-600 resize-none custom-scrollbar focus:placeholder:text-titanium-400 leading-relaxed"
                    required
                 />
              </div>

              {/* FOOTER */}
              <div className="flex items-center justify-between pt-4 border-t border-titanium-800">
                 <span className="text-xs text-titanium-600">Powered by DocentAI</span>
                 <Button 
                   type="submit" 
                   disabled={sendingState === "loading" || !subject || !message}
                   className="px-6"
                 >
                    Send Ticket <Send size={16} className="ml-2" />
                 </Button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
}