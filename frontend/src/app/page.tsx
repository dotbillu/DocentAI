"use client";

import React, { useState } from "react";
import Hero from "../components/dashboard/Hero";
import PromptBar from "../components/dashboard/PromptBar";
import Horizon from "../components/dashboard/Horizon";
import FileTree, { FileNode } from "../components/dashboard/FileTree";
import DecentAIBanner from "../components/dashboard/DecentAIBanner"; // <--- The new banner
import { Code2, Terminal, Cpu, Globe, ShoppingBag } from "lucide-react";

// MOCK DATA for the sidebar so it isn't empty on load
const MOCK_FILES: FileNode[] = [
  { 
    name: "src", 
    type: "folder", 
    children: [
      { name: "app.tsx", type: "file" },
      { name: "utils.ts", type: "file" }
    ] 
  },
  { name: "package.json", type: "file" }
];

export default function Home() {
  // 1. Manage File State
  const [files, setFiles] = useState<FileNode[]>(MOCK_FILES);

  // 2. Handler to add new files (passed to PromptBar)
  const handleUploadSuccess = (newFile: FileNode) => {
    setFiles((prev) => [...prev, newFile]);
  };

  return (
    <div className="relative min-h-screen flex overflow-hidden font-sans">
      
      {/* LEFT SIDEBAR: File Tree Visualizer */}
      {/* Hidden on mobile, fixed width on desktop */}
      <aside className="hidden md:block h-screen sticky top-0 pt-20 z-20 border-r border-titanium-800/50 bg-titanium-950/30 backdrop-blur-sm w-64">
        <FileTree files={files} />
      </aside>

      {/* RIGHT CONTENT: Main Dashboard */}
      <div className="flex-1 flex flex-col items-center pt-28 px-4 relative z-10 w-full max-w-5xl mx-auto">
        
        {/* 1. The "Introducing" Banner */}
        <DecentAIBanner />
        
        {/* 2. The Big Hero Text */}
        <Hero />

        {/* 3. The Interactive Input Bar */}
        <PromptBar onUploadSuccess={handleUploadSuccess} />

        {/* 4. Footer Logos (Trusted By) */}
        <div className="mt-16 md:mt-24 flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <p className="text-[10px] md:text-xs font-mono text-titanium-400 uppercase tracking-[0.2em]">
            The #1 professional vibe coding tool trusted by
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 text-titanium-400/40 hover:text-titanium-400 transition-colors duration-500 cursor-default">
             <div className="flex items-center gap-2 font-semibold"><Code2 size={20} /> Accenture</div>
             <div className="flex items-center gap-2 font-semibold"><Terminal size={20} /> Google</div>
             <div className="flex items-center gap-2 font-semibold"><Cpu size={20} /> Intel</div>
             <div className="flex items-center gap-2 font-semibold"><Globe size={20} /> Meta</div>
             <div className="flex items-center gap-2 font-semibold"><ShoppingBag size={20} /> Shopify</div>
          </div>
        </div>

        {/* 5. Background Glow Effect */}
        <Horizon />
      </div>
    </div>
  );
}