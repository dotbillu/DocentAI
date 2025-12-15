"use client";

import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import PromptBar from "../components/dashboard/PromptBar";
import ThinkingMessage from "../components/dashboard/ThinkingMessage";
import MarkdownRenderer from "../components/dashboard/MarkdownRenderer";
import { Sparkles, Globe, Copy, Check, User } from "lucide-react";
import clsx from "clsx";
import { useAtom } from "jotai";
import { chatHistoryAtom, crawlDepthAtom, isLinkModeAtom } from "../atom";
import { db } from "../lib/db";
import { v4 as uuidv4 } from 'uuid';

type Message = {
  role: "user" | "ai";
  content: string;
  sources?: string[];
};

export default function Home() {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useAtom(chatHistoryAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [crawlDepth, setCrawlDepth] = useAtom(crawlDepthAtom);
  const [isLinkMode, setIsLinkMode] = useAtom(isLinkModeAtom);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);
  const [currentStatus, setCurrentStatus] = useState("Thinking...");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, trainingLogs, isLoading]);

  const loadChat = async (id: string) => {
    setIsLoading(true);
    setCurrentChatId(id);
    const msgs = await db.getMessages(id);
    const formatted: Message[] = msgs.map((m: any) => ({
      role: m.role,
      content: m.content,
      sources: m.sources
    }));
    setCurrentMessages(formatted);
    setIsLoading(false);
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setCurrentMessages([]);
  };

  const startSimulation = (url: string) => {
    setTrainingLogs([]);
    setCurrentStatus(`Accessing ${url}...`);
    const mockPaths = ["/intro", "/getting-started", "/installation", "/configuration"];
    let i = 0;
    return setInterval(() => {
      if (i >= mockPaths.length) i = 0;
      const path = mockPaths[i];
      setTrainingLogs(prev => [...prev, `Reading: ${url}${path}`].slice(-5));
      setCurrentStatus(`Reading ${path}...`); 
      i++;
    }, 400);
  };

  const handleUserMessage = async (text: string) => {
    const newUserMsg: Message = { role: "user", content: text };
    const updatedMessages = [...currentMessages, newUserMsg];
    setCurrentMessages(updatedMessages);

    if (currentChatId) {
      await db.addMessage(currentChatId, newUserMsg);
    }
    performChat(text, updatedMessages);
  };

  const performChat = async (text: string, history: Message[]) => {
    setIsLoading(true);
    setTrainingLogs([]);
    setCurrentStatus("Thinking...");
    
    const urlMatch = text.match(/(https?:\/\/[^\s]+)/);
    let simulationInterval: NodeJS.Timeout | null = null;
    if (urlMatch) {
       simulationInterval = startSimulation(urlMatch[0]);
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text, history }),
      });

      if (!response.ok) throw new Error("Backend offline");
      const data = await response.json();

      const aiMsg: Message = {
        role: "ai",
        content: data.answer || "I couldn't find an answer.",
        sources: data.sources || [],
      };

      let activeId = currentChatId;
      if (!activeId) {
        activeId = uuidv4();
        const title = text.slice(0, 30) + (text.length > 30 ? "..." : "");
        await db.createChat(activeId, title);
        setCurrentChatId(activeId);
        await db.addMessage(activeId, { role: "user", content: text });
      }

      await db.addMessage(activeId, aiMsg);
      setCurrentMessages((prev) => [...prev, aiMsg]);

    } catch (error) {
      setCurrentMessages((prev) => [...prev, { role: "ai", content: "Error connecting to server." }]);
    } finally {
      if (simulationInterval) clearInterval(simulationInterval);
      setIsLoading(false);
      setTrainingLogs([]); 
    }
  };

  const handleCopyMessage = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex h-screen w-full bg-[#050505] text-zinc-100 overflow-hidden font-sans pt-16">
      
      <Sidebar 
        onNewChat={handleNewChat}
        onSelectChat={loadChat}
        currentChatId={currentChatId}
      />

      <main className="flex-1 flex flex-col relative min-w-0 bg-[#09090b]"> 
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 scroll-smooth">
          {currentMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-6 animate-in fade-in zoom-in duration-500">
               <div className="text-center space-y-4">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-xs font-medium text-zinc-400 mb-4 backdrop-blur-sm">
                   <Sparkles size={12} className="text-blue-400"/>
                   <span>Introducing Docent AI</span>
                 </div>
                 <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
                   Master any <span className="text-blue-500">documentation</span> instantly.
                 </h1>
               </div>
            </div>
          ) : (
            // Expanded to 95% Width for Code readability
            <div className="w-full max-w-[95%] mx-auto space-y-8 pb-4">
              {currentMessages.map((msg, i) => (
                <div key={i} className={clsx("flex gap-4 md:gap-6", msg.role === "ai" ? "justify-start" : "justify-end")}>
                  
                  {msg.role === "ai" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-blue-900/20">
                      <Sparkles size={16} className="text-white" />
                    </div>
                  )}

                  <div className={clsx("flex flex-col min-w-0", msg.role === "user" ? "items-end max-w-[85%]" : "items-start w-full")}>
                    <div className={clsx(
                      "rounded-2xl text-[16px] leading-relaxed relative group/msg w-full",
                      msg.role === "user" 
                        ? "bg-zinc-800/80 text-white px-5 py-3 rounded-tr-sm backdrop-blur-sm" 
                        : "bg-transparent text-zinc-100 pl-0 pt-0" 
                    )}>
                      {msg.role === "ai" ? (
                        <MarkdownRenderer content={msg.content} />
                      ) : (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-2 px-1">
                       {msg.sources && msg.sources.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {msg.sources.map((src, idx) => (
                              <a key={idx} href={src} target="_blank" className="flex items-center gap-1 text-[10px] bg-zinc-800/50 border border-zinc-700/50 px-2 py-1 rounded-md text-zinc-400 hover:text-blue-400 transition-colors">
                                <Globe size={10} />
                                <span className="truncate max-w-[150px]">{src.replace("https://", "").split("/")[0]}</span>
                              </a>
                            ))}
                          </div>
                       )}

                       <button 
                         onClick={() => handleCopyMessage(msg.content, i)}
                         className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-white transition-colors opacity-0 group-hover/msg:opacity-100"
                         title="Copy text"
                       >
                         {copiedIndex === i ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                         <span>{copiedIndex === i ? "Copied" : "Copy"}</span>
                       </button>
                    </div>
                  </div>

                  {msg.role === "user" && (
                     <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 mt-1">
                        <User size={16} className="text-zinc-400" />
                     </div>
                  )}

                </div>
              ))}
              
              {(isLoading) && <ThinkingMessage status={currentStatus} logs={trainingLogs} />}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="shrink-0 w-full bg-gradient-to-t from-[#09090b] to-transparent p-4 pb-6 pt-10">
          <div className="w-full max-w-[95%] mx-auto">
             <PromptBar
               onSendMessage={handleUserMessage}
               onLinkModeToggle={setIsLinkMode}
               isLoading={isLoading}
               isChatMode={true}
               crawlDepth={crawlDepth}
               setCrawlDepth={setCrawlDepth}
             />
             <p className="text-center text-[10px] text-zinc-600 mt-3">
               Docent AI can make mistakes. Check sources.
             </p>
          </div>
        </div>

      </main>
    </div>
  );
}
