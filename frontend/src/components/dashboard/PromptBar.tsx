"use client";

import React, { useRef, useState, useEffect } from "react";
import { Paperclip, ArrowUp, Square, Plus, Link as LinkIcon, FileText, X, ChevronDown } from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { FileNode } from "./FileTree";

interface PromptBarProps {
  onSendMessage?: (message: string) => void;
  onLinkModeToggle?: (isActive: boolean) => void;
  isLoading?: boolean;
  isChatMode?: boolean; 
  crawlDepth: number;
  setCrawlDepth: (depth: number) => void;
}

export default function PromptBar({ 
  onSendMessage, 
  onLinkModeToggle,
  isLoading, 
  isChatMode,
  crawlDepth,
  setCrawlDepth
}: PromptBarProps) {
  const [input, setInput] = useState("");
  const [isLinkMode, setIsLinkMode] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showDepthMenu, setShowDepthMenu] = useState(false);
   
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowPlusMenu(false);
        setShowDepthMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto'; 
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    
    if (onSendMessage) {
      onSendMessage(input);
      setInput("");
      if (isLinkMode) {
        toggleLinkMode(false);
      }
      if (textareaRef.current) textareaRef.current.style.height = 'auto'; 
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleLinkMode = (active: boolean) => {
    setIsLinkMode(active);
    setShowPlusMenu(false);
    if (onLinkModeToggle) onLinkModeToggle(active);
  };

  const depthOptions = [
    { level: 1, time: "10s - 1 min" },
    { level: 2, time: "30s - 3 min" },
    { level: 3, time: "2 - 5 min" },
  ];

  return (
    <div className={clsx("w-full mx-auto relative z-40 transition-all duration-300", isChatMode ? "max-w-4xl" : "max-w-3xl")}>
      <div className="relative group">
        
        {/* Glow Effect */}
        <div className={clsx(
          "absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-75 transition duration-1000",
          "group-hover:opacity-100"
        )}></div>
        
        <div className="relative flex flex-col bg-titanium-900/90 border border-titanium-700 rounded-2xl shadow-2xl backdrop-blur-sm overflow-visible transition-all duration-300">
          
          <div className="flex items-end p-3 gap-2">
            
            {/* PLUS BUTTON & MENU */}
            <div className="relative shrink-0 pb-1" ref={menuRef}>
               <button
                 onClick={() => setShowPlusMenu(!showPlusMenu)}
                 className="p-2 rounded-full bg-titanium-800 text-titanium-400 hover:text-white hover:bg-titanium-700 transition-all active:scale-95"
               >
                 <Plus size={20} className={clsx("transition-transform duration-200", showPlusMenu && "rotate-45")} />
               </button>

               <AnimatePresence>
                 {showPlusMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: -8, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      // REMOVED border border-titanium-700
                      className="absolute bottom-full left-0 mb-2 w-48 bg-titanium-800 rounded-xl shadow-xl overflow-hidden flex flex-col p-1 z-50"
                    >
                      <button 
                         onClick={() => toggleLinkMode(true)}
                         className="flex items-center gap-3 px-3 py-2.5 text-sm text-titanium-200 hover:bg-titanium-700 rounded-lg transition-colors text-left"
                      >
                         <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                             <LinkIcon size={16} />
                         </div>
                         <div className="flex flex-col">
                             <span className="font-medium">Add Link</span>
                             <span className="text-[10px] text-titanium-500">Train on website</span>
                         </div>
                      </button>
                      
                      <button 
                         onClick={() => { setShowPlusMenu(false); alert("PDF support coming soon!"); }}
                         className="flex items-center gap-3 px-3 py-2.5 text-sm text-titanium-200 hover:bg-titanium-700 rounded-lg transition-colors text-left"
                      >
                         <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                             <FileText size={16} />
                         </div>
                         <div className="flex flex-col">
                             <span className="font-medium">Add PDF</span>
                             <span className="text-[10px] text-titanium-500">Train on document</span>
                         </div>
                      </button>
                    </motion.div>
                 )}
               </AnimatePresence>
            </div>

            {/* INPUT AREA */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* LINK MODE PILL */}
                {isLinkMode && (
                    <div className="flex items-center gap-2 mb-1 animate-in fade-in slide-in-from-left-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-medium">
                           <LinkIcon size={12} />
                           <span>Link Mode</span>
                           <button onClick={() => toggleLinkMode(false)} className="ml-1 hover:text-white">
                               <X size={12} />
                           </button>
                        </span>
                    </div>
                )}
                
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder={isLinkMode ? "Enter the doc link here..." : "What do you want to build?"}
                    className="w-full bg-transparent text-titanium-100 placeholder-titanium-500 resize-none outline-none text-base py-2 min-h-[44px] max-h-40 font-sans scrollbar-hide"
                    rows={1}
                />
            </div>

            {/* RIGHT SIDE ACTIONS */}
            <div className="flex items-end gap-2 pb-1">
                {/* DEPTH SELECTOR (Only in Link Mode) */}
                {isLinkMode && (
                    <div className="relative">
                        <button
                          onClick={() => setShowDepthMenu(!showDepthMenu)}
                          // REMOVED border border-titanium-700/50
                          className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-titanium-800/50 text-titanium-400 hover:text-blue-300 hover:bg-titanium-800 text-xs font-medium transition-all"
                        >
                           <span>Lvl {crawlDepth}</span>
                           <ChevronDown size={14} className={clsx("transition-transform", showDepthMenu && "rotate-180")} />
                        </button>

                        <AnimatePresence>
                            {showDepthMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: -8, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    // REMOVED border property
                                    className="absolute bottom-full right-0 mb-2 w-48 bg-titanium-800 rounded-xl shadow-xl overflow-hidden z-50 py-1"
                                >
                                    <div className="px-3 py-2 text-[10px] uppercase font-bold text-titanium-500 tracking-wider">
                                        Crawl Depth
                                    </div>
                                    {depthOptions.map((opt) => (
                                        <button
                                            key={opt.level}
                                            onClick={() => { setCrawlDepth(opt.level); setShowDepthMenu(false); }}
                                            className="w-full text-left px-4 py-2 hover:bg-titanium-700 flex justify-between items-center group"
                                        >
                                            <span className={clsx("text-sm", crawlDepth === opt.level ? "text-blue-400 font-bold" : "text-titanium-200")}>
                                                Level {opt.level}
                                            </span>
                                            {/* Removed group-hover:text-titanium-400 to keep the color low */}
                                            <span className="text-[10px] text-titanium-500">
                                                ~{opt.time}
                                            </span>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* SEND BUTTON */}
                <button 
                  onClick={handleSubmit}
                  disabled={!input.trim() && !isLoading}
                  className={clsx(
                    "h-9 w-9 flex items-center justify-center rounded-lg transition-all duration-200",
                    input.trim() || isLoading 
                      ? "bg-blue-600 text-white shadow-lg hover:bg-blue-500" 
                      : "bg-titanium-800 text-titanium-500 cursor-not-allowed"
                  )}
                >
                  {isLoading ? <Square size={16} className="fill-current animate-pulse" /> : <ArrowUp size={20} />}
                </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
