"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import FileTree, { FileNode } from "../../components/dashboard/FileTree";
import PreviewWindow from "../../components/dashboard/PreviewWindow";
import { Terminal, Play, Save, X, Loader2, PanelLeftClose, PanelLeftOpen, Eye, Code } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

// --- MOCK DATA ---
const MOCK_FILES: FileNode[] = [
  { 
    name: "src", 
    type: "folder", 
    children: [
      { 
        name: "page.tsx", 
        type: "file",
        content: `export default function Home() {\n  return (\n    <div className="p-10">\n      <h1 className="text-4xl">Hello World</h1>\n      <p>Welcome to your new app.</p>\n    </div>\n  );\n}` 
      },
      { 
        name: "layout.tsx", 
        type: "file",
        content: `export default function RootLayout({ children }) {\n  return <body>{children}</body>;\n}`
      },
      {
        name: "globals.css",
        type: "file",
        content: `@tailwind base;\n@tailwind components;\n@tailwind utilities;`
      }
    ] 
  },
  { 
    name: "package.json", 
    type: "file",
    content: `{\n  "name": "my-app",\n  "version": "0.1.0"\n}`
  }
];

export default function Workspace() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") || "Start a new project...";
  
  // --- STATE ---
  const [activeFile, setActiveFile] = useState<FileNode | null>(MOCK_FILES[0].children![0]); 
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code"); // <--- NEW: Tab State
  
  const [isTyping, setIsTyping] = useState(true);
  const [streamedText, setStreamedText] = useState("");
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);

  // --- RESIZING STATE ---
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [chatWidth, setChatWidth] = useState(400);
  const [isDragging, setIsDragging] = useState<"sidebar" | "chat" | null>(null);

  const sidebarWidthRef = useRef(sidebarWidth);
  const chatWidthRef = useRef(chatWidth);

  const fullResponse = "I've initialized the project structure for you. I set up Next.js with Tailwind CSS as requested. You can see the file structure on the left. Ready to build!";

  // --- EFFECT: Typing Animation ---
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setStreamedText((prev) => prev + fullResponse.charAt(index));
      index++;
      if (index === fullResponse.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 30); 
    return () => clearInterval(interval);
  }, []);

  // --- EFFECT: Handle Global Resizing ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      if (isDragging === "sidebar") {
        const newWidth = Math.max(150, Math.min(e.clientX, 400));
        setSidebarWidth(newWidth);
        sidebarWidthRef.current = newWidth;
      } else if (isDragging === "chat") {
        const newWidth = Math.max(250, Math.min(e.clientX - sidebarWidthRef.current, 800));
        setChatWidth(newWidth);
        chatWidthRef.current = newWidth;
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
      document.body.style.cursor = "default";
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const startResizing = (type: "sidebar" | "chat") => {
    setIsDragging(type);
    document.body.style.cursor = "col-resize";
  };

  return (
    <div className="flex h-screen bg-titanium-950 text-titanium-100 overflow-hidden font-sans select-none">
      
      {/* 1. LEFT: File Explorer (Resizable) */}
      <div 
        className="border-r border-titanium-800 bg-titanium-900/30 flex flex-col shrink-0 relative"
        style={{ width: sidebarWidth }}
      >
         <div className="p-4 border-b border-titanium-800 flex items-center justify-between h-14">
            <span className="font-semibold text-xs uppercase tracking-wider text-titanium-400">Explorer</span>
            <Link href="/" className="text-titanium-400 hover:text-white transition-colors"><X size={16} /></Link>
         </div>
         <div className="flex-1 overflow-y-auto pt-2 px-2">
            <FileTree 
              files={MOCK_FILES} 
              onFileSelect={(file) => {
                setActiveFile(file);
                setActiveTab("code"); // Switch back to code when file is clicked
              }} 
            />
         </div>

         {/* SIDEBAR RESIZE HANDLE */}
         <div 
            onMouseDown={() => startResizing("sidebar")}
            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500/50 transition-colors z-20 group flex items-center justify-center"
         >
            <div className="w-px h-8 bg-titanium-600 group-hover:bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
         </div>
      </div>

      {/* 2. MIDDLE: AI Chat (Resizable + Collapsible) */}
      <div 
        className={clsx(
          "flex flex-col border-r border-titanium-800 bg-titanium-950/50 backdrop-blur-sm transition-all duration-300 ease-in-out relative shrink-0",
          isChatCollapsed ? "w-0 opacity-0 overflow-hidden border-r-0" : "opacity-100"
        )}
        style={{ width: isChatCollapsed ? 0 : chatWidth }}
      >
        <div className="h-14 border-b border-titanium-800 flex items-center px-4 justify-between bg-titanium-900/20 shrink-0">
          <span className="text-xs font-mono text-titanium-400">AI Assistant</span>
          <button onClick={() => setIsChatCollapsed(true)} className="text-titanium-400 hover:text-white transition-colors" title="Collapse Chat">
            <PanelLeftClose size={16} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto min-w-[300px]">
           <div className="p-4 space-y-6">
              <div className="flex flex-col gap-2 items-end">
                <div className="bg-titanium-800 text-white p-3 rounded-2xl rounded-tr-sm max-w-[90%] text-sm shadow-lg">
                  {initialPrompt}
                </div>
              </div>
              <div className="flex flex-col gap-2 items-start">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-[10px] font-bold">AI</div>
                  <span className="text-[10px] text-titanium-500">Bolt v2</span>
                </div>
                <div className="bg-transparent border border-titanium-800/50 text-titanium-100 p-4 rounded-2xl rounded-tl-sm max-w-[95%] text-sm shadow-sm leading-relaxed">
                  <p>{streamedText}{isTyping && <span className="animate-pulse">|</span>}</p>
                </div>
              </div>
           </div>
        </div>

        <div className="p-4 border-t border-titanium-800 bg-titanium-900/20 shrink-0 min-w-[300px]">
           <div className="relative">
             <input type="text" placeholder="Reply..." className="w-full bg-titanium-900/50 border border-titanium-700 rounded-lg pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors" />
             <button className="absolute right-2 top-2 p-1.5 bg-blue-600/10 text-blue-400 rounded"><Loader2 size={14} className={clsx(isTyping && "animate-spin")} /></button>
           </div>
        </div>

        {!isChatCollapsed && (
          <div 
             onMouseDown={() => startResizing("chat")}
             className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500/50 transition-colors z-20 group flex items-center justify-center"
          >
             <div className="w-px h-8 bg-titanium-600 group-hover:bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>

      {/* 3. RIGHT: Code Editor & Preview (Flex Grow) */}
      <div className="flex-1 flex flex-col bg-[#1e1e1e] relative min-w-0">
         
         {/* Show Chat Button */}
         {isChatCollapsed && (
           <div className="absolute left-4 top-16 z-20">
             <button 
               onClick={() => setIsChatCollapsed(false)}
               className="bg-titanium-800 hover:bg-titanium-700 text-titanium-100 p-2 rounded-full shadow-xl border border-titanium-600 transition-all flex items-center gap-2 pr-4 text-xs font-medium"
             >
               <PanelLeftOpen size={16} />
               <span>Show Chat</span>
             </button>
           </div>
         )}

         {/* Header / Tabs */}
         <div className="h-14 bg-titanium-950 flex items-center px-0 gap-1 border-b border-titanium-800 overflow-x-auto shrink-0">
            {/* FILE TAB (Visible only in Code Mode) */}
            {activeTab === "code" && activeFile && (
              <div className="h-full px-4 border-r border-titanium-800 bg-[#1e1e1e] text-blue-400 text-xs font-medium border-t-2 border-t-blue-500 flex items-center gap-2 min-w-[120px]">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                {activeFile.name}
                <X size={12} className="ml-auto text-titanium-500 hover:text-white cursor-pointer" />
              </div>
            )}

            {/* PREVIEW TAB INDICATOR */}
            {activeTab === "preview" && (
               <div className="h-full px-4 border-r border-titanium-800 bg-white text-black text-xs font-medium border-t-2 border-t-green-500 flex items-center gap-2 min-w-[120px]">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Live Preview
                <X 
                  size={12} 
                  className="ml-auto text-gray-400 hover:text-black cursor-pointer" 
                  onClick={() => setActiveTab("code")}
                />
              </div>
            )}

            {/* Right Controls */}
            <div className="ml-auto flex items-center gap-2 pr-4">
               {/* TOGGLE SWITCH */}
               <div className="flex bg-titanium-900 rounded-lg p-1 mr-4 border border-titanium-800">
                  <button 
                    onClick={() => setActiveTab("code")}
                    className={clsx(
                      "px-3 py-1 rounded text-xs font-medium transition-all flex items-center gap-2",
                      activeTab === "code" ? "bg-titanium-800 text-white shadow" : "text-titanium-500 hover:text-titanium-300"
                    )}
                  >
                    <Code size={14} /> Code
                  </button>
                  <button 
                    onClick={() => setActiveTab("preview")}
                    className={clsx(
                      "px-3 py-1 rounded text-xs font-medium transition-all flex items-center gap-2",
                      activeTab === "preview" ? "bg-titanium-800 text-green-400 shadow" : "text-titanium-500 hover:text-titanium-300"
                    )}
                  >
                    <Eye size={14} /> Preview
                  </button>
               </div>

               <button 
                 className="text-titanium-400 hover:text-green-400 transition-colors" 
                 title="Run Preview"
                 onClick={() => setActiveTab("preview")} 
               >
                 <Play size={14} />
               </button>
               <button className="text-titanium-400 hover:text-blue-400 transition-colors" title="Save"><Save size={14} /></button>
            </div>
         </div>

         {/* Content Area */}
         <div className="flex-1 relative group overflow-hidden">
            {activeTab === "code" ? (
              <>
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-titanium-950/30 text-right pr-3 pt-6 text-titanium-600 font-mono text-xs select-none border-r border-titanium-800/20">
                  {Array.from({length: 40}).map((_, i) => <div key={i}>{i+1}</div>)}
                </div>
                <textarea
                  value={activeFile?.content || "// Select a file to view content"}
                  readOnly
                  className="w-full h-full bg-transparent p-6 pl-16 font-mono text-sm leading-6 text-gray-300 resize-none outline-none selection:bg-blue-500/30"
                  spellCheck={false}
                />
              </>
            ) : (
              <PreviewWindow />
            )}
         </div>
      </div>

    </div>
  );
}