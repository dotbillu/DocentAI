"use client";

import React from "react";
import { Sparkles, Zap, Code2, PaintBucket, Check } from "lucide-react";
import clsx from "clsx";
import { useAtom } from "jotai";
import { aiSettingsAtom, AISettings } from "../../atom";

export default function PersonalizationPage() {
  const [settings, setSettings] = useAtom(aiSettingsAtom);

  const verbosityOptions = [
    { id: "concise", label: "Concise", desc: "Straight to the code. Minimal explanation." },
    { id: "balanced", label: "Balanced", desc: "Standard explanation with context." },
    { id: "detailed", label: "Detailed", desc: "Deep dive into concepts and edge cases." },
  ];

  const colors = [
    { id: "blue", hex: "bg-blue-500" },
    { id: "purple", hex: "bg-purple-500" },
    { id: "emerald", hex: "bg-emerald-500" },
    { id: "orange", hex: "bg-orange-500" },
  ];

  const updateSetting = (key: keyof AISettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    // FIX: Added 'flex-1 overflow-y-auto' and used bg-titanium-950
    <div className="flex-1 overflow-y-auto bg-titanium-950 w-full relative z-10 h-full">
      <div className="pt-24 pb-20 font-sans px-6 max-w-3xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="space-y-4">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-titanium-800 border border-titanium-700 text-titanium-400 text-xs font-medium">
             <Sparkles size={14} />
             <span>Customize Experience</span>
           </div>
           <h1 className="text-4xl font-bold text-white tracking-tight">Personalization</h1>
           <p className="text-titanium-400">Tailor how Docent AI writes, looks, and behaves.</p>
        </div>

        {/* 1. AI BEHAVIOR SECTION */}
        <div className="p-8 rounded-2xl bg-titanium-900 border border-titanium-800 space-y-8">
           <div className="flex items-center gap-3 border-b border-titanium-800 pb-6">
              <div className="p-2 bg-titanium-800 rounded-lg"><Zap size={20} className="text-white"/></div>
              <div>
                <h2 className="text-lg font-semibold text-white">AI Personality</h2>
                <p className="text-sm text-titanium-400">Control the output style of the model.</p>
              </div>
           </div>

           <div className="grid gap-4">
              <label className="text-sm font-medium text-titanium-100">Response Verbosity</label>
              <div className="grid md:grid-cols-3 gap-4">
                 {verbosityOptions.map((opt) => (
                   <button
                     key={opt.id}
                     onClick={() => updateSetting("verbosity", opt.id)}
                     className={clsx(
                       "p-4 rounded-xl border text-left transition-all",
                       settings.verbosity === opt.id 
                         // Active State: Uses dynamic accent color via hardcoded classes for now or specific theme logic
                         ? "bg-(--accent-color)/10 border-(--accent-color)/50 ring-1 ring-(--accent-color)/50" 
                         // Inactive State: Titanium Colors
                         : "bg-titanium-950 border-titanium-800 hover:border-titanium-700"
                     )}
                   >
                      <div className={clsx("font-medium mb-1", settings.verbosity === opt.id ? "text-(--accent-color)" : "text-white")}>
                        {opt.label}
                      </div>
                      <div className="text-xs text-titanium-400 leading-relaxed">{opt.desc}</div>
                   </button>
                 ))}
              </div>
           </div>
           
           <div className="flex items-center justify-between pt-2">
              <div className="space-y-1">
                 <div className="text-sm font-medium text-white flex items-center gap-2">
                    <Code2 size={16} className="text-titanium-400"/>
                    Always include TypeScript types
                 </div>
                 <p className="text-xs text-titanium-400">Force the AI to add strict typing to all code snippets.</p>
              </div>
              
              <button 
                  onClick={() => updateSetting("strictMode", !settings.strictMode)}
                  className={clsx(
                    "h-6 w-11 rounded-full relative transition-colors",
                    settings.strictMode ? "bg-(--accent-color)" : "bg-titanium-800"
                  )}
              >
                  <div className={clsx(
                      "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all",
                      settings.strictMode ? "right-1" : "left-1"
                  )} />
              </button>
           </div>
        </div>

        {/* 2. THEME SECTION */}
        <div className="p-8 rounded-2xl bg-titanium-900 border border-titanium-800 space-y-8">
           <div className="flex items-center gap-3 border-b border-titanium-800 pb-6">
              <div className="p-2 bg-titanium-800 rounded-lg"><PaintBucket size={20} className="text-white"/></div>
              <div>
                <h2 className="text-lg font-semibold text-white">Interface Theme</h2>
                <p className="text-sm text-titanium-400">Choose your accent color.</p>
              </div>
           </div>

           <div className="flex gap-4">
              {colors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateSetting("theme", c.id)}
                  className={clsx(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all ring-2 ring-offset-2 ring-offset-titanium-900",
                    c.hex,
                    settings.theme === c.id ? "ring-white" : "ring-transparent hover:scale-110"
                  )}
                >
                  {settings.theme === c.id && <Check size={20} className="text-white" />}
                </button>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}