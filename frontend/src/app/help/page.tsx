"use client";

import React, { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Mail, Send, Lock, CheckCircle2, AlertCircle, X } from "lucide-react";
import Button from "../../components/ui/Button"; 
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

      if (!res.ok) throw new Error("Failed to send");

      setSendingState("success");
      setSubject("");
      setMessage("");
      
      setTimeout(() => setSendingState("idle"), 3000);

    } catch (error) {
      // FIX: Log the error so the variable is "used"
      console.error("Submission failed:", error); 
      setSendingState("error");
    }
  };

  // 1. LOADING STATE
  if (status === "loading") {
    return <div className="flex-1 bg-titanium-950 flex items-center justify-center text-titanium-400">Loading...</div>;
  }

  // 2. UNAUTHENTICATED STATE
  if (status === "unauthenticated") {
    return (
      <div className="flex-1 bg-titanium-950 relative z-10 h-full flex items-center justify-center p-6">
        <div className="bg-titanium-900 border border-titanium-800 p-8 rounded-2xl max-w-md text-center space-y-6 shadow-2xl relative overflow-hidden">
           <div className="absolute inset-0 bg-blue-500/10 blur-[80px] -z-10"></div>
           
           <div className="w-16 h-16 bg-titanium-800 rounded-full flex items-center justify-center mx-auto">
              <Lock size={32} className="text-blue-400" />
           </div>
           <h1 className="text-2xl font-bold text-white">Authentication Required</h1>
           <p className="text-titanium-400">
             To access Enterprise Support and submit priority tickets, you must be signed in with a verified account.
           </p>
           <Button onClick={() => signIn("google")} className="w-full py-3 text-base">
             Sign In to Continue
           </Button>
        </div>
      </div>
    );
  }

  // 3. AUTHENTICATED STATE
  return (
    <div className="flex-1 overflow-y-auto bg-titanium-950 w-full relative z-10 h-full flex items-center justify-center p-6">
      
      <div className="w-full max-w-2xl bg-titanium-900 border border-titanium-800 rounded-xl shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-titanium-800/50 px-6 py-4 flex items-center justify-between border-b border-titanium-800">
           <div className="flex items-center gap-3">
             <Mail size={20} className="text-titanium-400" />
             <h1 className="text-white font-semibold">New Message: Enterprise Support</h1>
           </div>
           {/* Close button links back to dashboard/home */}
           <Link href="/" className="text-titanium-400 hover:text-white transition-colors">
             <X size={20} />
           </Link>
        </div>

        {/* Form Body */}
        <div className="p-6 relative">
           
           {/* Loading Overlay */}
           {sendingState === "loading" && (
             <div className="absolute inset-0 bg-titanium-950/80 z-20 flex items-center justify-center rounded-b-xl">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
             </div>
           )}

           {/* Success/Error Messages */}
           {sendingState === "success" && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3 text-emerald-400">
                 <CheckCircle2 size={20} />
                 <span>Message sent successfully.</span>
              </div>
           )}
           {sendingState === "error" && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
                 <AlertCircle size={20} />
                 <span>Failed to send message. Please try again later.</span>
              </div>
           )}

           <form onSubmit={handleSubmit} className="space-y-4">
              {/* To Field */}
              <div className="flex items-center border-b border-titanium-800 pb-2">
                <span className="text-titanium-500 w-20 shrink-0">To</span>
                <span className="text-titanium-300 bg-titanium-800 px-3 py-1 rounded-full text-sm">
                  Docent AI Support Team
                </span>
              </div>
              
              {/* From Field */}
              <div className="flex items-center border-b border-titanium-800 pb-2">
                <span className="text-titanium-500 w-20 shrink-0">From</span>
                <span className="text-titanium-100">{session?.user?.email}</span>
              </div>

              {/* Subject Input */}
              <div className="flex items-center border-b border-titanium-800 pt-2">
                <input 
                  type="text" 
                  placeholder="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-white placeholder:text-titanium-500 py-2"
                  required
                />
              </div>

              {/* Message Body */}
              <div className="pt-2">
                 <textarea 
                    placeholder="Describe your issue or request..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full h-64 bg-transparent border-none outline-none text-titanium-100 placeholder:text-titanium-500 resize-none custom-scrollbar"
                    required
                 />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-titanium-800">
                 <div className="text-xs text-titanium-500">
                   Standard response time: &#60; 24 hours.
                 </div>
                 <Button 
                   type="submit" 
                   disabled={sendingState === "loading" || !subject.trim() || !message.trim()}
                   className="px-8 flex items-center gap-2"
                 >
                    Send <Send size={16} />
                 </Button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
}