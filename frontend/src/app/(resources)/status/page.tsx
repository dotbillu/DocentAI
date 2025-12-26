"use client";

import React from "react";
import { CheckCircle, Clock, GitCommit, Server } from "lucide-react";
import clsx from "clsx";

// --- Mock Data: Realistic Launch History ---
const SYSTEM_STATUS = [
  { name: "API Gateway", status: "operational" },
  { name: "Vector Database", status: "operational" },
  { name: "Web Crawler", status: "operational" },
  { name: "Auth Services", status: "operational" },
];

const PATCH_NOTES = [
  {
    version: "v1.0.0",
    date: "December 26, 2025",
    title: "The Official Launch",
    type: "Major Release",
    desc: "After weeks of beta testing, Docent AI is now live. We have introduced a completely new Personalization Engine, strict TypeScript enforcement, and the new Documentation Library.",
    changes: [
      "New Feature: 'Personalization' tab to control AI verbosity.",
      "New Feature: 'Library' (formerly Gallery) with curated dev docs.",
      "Fix: Resolved 'Unexpected token' parsing error in SRS docs.",
      "Security: Implemented Google OAuth 2.0 and IndexDB local storage."
    ]
  },
  {
    version: "v0.9.2",
    date: "December 20, 2025",
    title: "RAG Engine Optimization",
    type: "Performance",
    desc: "We optimized the crawler to handle large documentation pages (like Next.js docs) 40% faster.",
    changes: [
      "Performance: Crawler now skips image assets to speed up text extraction.",
      "Fix: Navbar dropdown menu z-index issues.",
      "UI: Updated to 'Titanium' dark theme color palette."
    ]
  },
  {
    version: "v0.8.0",
    date: "December 10, 2025",
    title: "File Upload Beta",
    type: "Feature",
    desc: "Initial support for uploading local PDF and DOCX files to chat with your own documents.",
    changes: [
      "Feature: Drag-and-drop file upload zone.",
      "UI: Added 'Thinking...' animation states."
    ]
  }
];

export default function StatusPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-titanium-950 w-full relative z-10 h-full">
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-20 font-sans text-titanium-100">
        
        {/* 1. SYSTEM HEALTH BANNER */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
             <h1 className="text-4xl font-bold text-white tracking-tight">System Status</h1>
             <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                All Systems Operational
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SYSTEM_STATUS.map((sys) => (
              <div key={sys.name} className="bg-titanium-900 border border-titanium-800 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Server size={16} className="text-titanium-400" />
                   <span className="text-sm font-medium text-white">{sys.name}</span>
                </div>
                <CheckCircle size={16} className="text-emerald-500" />
              </div>
            ))}
          </div>
        </div>

        {/* 2. PATCH NOTES TIMELINE */}
        <div className="space-y-8">
           <h2 className="text-2xl font-bold text-white border-b border-titanium-800 pb-4">
             Changelog & Updates
           </h2>

           <div className="relative border-l border-titanium-800 ml-3 space-y-12">
              {PATCH_NOTES.map((patch, i) => (
                <div key={patch.version} className="pl-8 relative group">
                  
                  {/* Timeline Dot */}
                  <div className={clsx(
                    "absolute -left-1.25 top-0 w-2.5 h-2.5 rounded-full border-2 transition-colors",
                    i === 0 ? "bg-blue-500 border-blue-900" : "bg-titanium-700 border-titanium-900"
                  )} />

                  {/* Header Info */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3">
                     <span className={clsx(
                       "text-lg font-bold font-mono px-2 py-0.5 rounded-md self-start",
                       i === 0 ? "bg-blue-500/10 text-blue-400" : "bg-titanium-800 text-titanium-400"
                     )}>
                       {patch.version}
                     </span>
                     <span className="text-sm text-titanium-500 flex items-center gap-1">
                        <Clock size={12} /> {patch.date}
                     </span>
                     <span className="text-xs font-medium uppercase tracking-wider text-titanium-500 border border-titanium-800 px-2 py-0.5 rounded-full self-start">
                        {patch.type}
                     </span>
                  </div>

                  {/* Main Card */}
                  <div className="bg-titanium-900/50 border border-titanium-800 rounded-2xl p-6 hover:border-titanium-700 transition-colors">
                     <h3 className="text-xl font-bold text-white mb-2">{patch.title}</h3>
                     <p className="text-titanium-400 leading-relaxed mb-6">
                       {patch.desc}
                     </p>

                     {/* Bullet Points */}
                     <ul className="space-y-3">
                       {patch.changes.map((change, idx) => (
                         <li key={idx} className="flex items-start gap-3 text-sm text-titanium-300">
                            <GitCommit size={16} className="text-titanium-600 shrink-0 mt-0.5" />
                            <span>
                              {change.split(":")[0]}: 
                              <span className="text-titanium-500 ml-1">{change.split(":")[1]}</span>
                            </span>
                         </li>
                       ))}
                     </ul>
                  </div>

                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}