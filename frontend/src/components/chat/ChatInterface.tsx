"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import PromptBar from "@/components/dashboard/PromptBar";
import ThinkingMessage from "@/components/dashboard/ThinkingMessage";
import MarkdownRenderer from "@/components/dashboard/MarkdownRenderer";
import { Sparkles, Globe, Copy, Check } from "lucide-react";
import clsx from "clsx";
import { useAtom } from "jotai";
import { chatHistoryAtom, crawlDepthAtom, isLinkModeAtom, aiSettingsAtom } from "@/atom";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";

// --- CONFIGURATION ---
// This automatically uses the Real URL on Vercel, or Localhost on your computer.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// --- TYPES ---
type Message = {
  role: "user" | "ai";
  content: string;
  sources?: string[];
};

interface DBMessage {
  role: "user" | "ai";
  content: string;
  sources?: string[];
  id?: string;
  createdAt?: Date;
}

export default function ChatInterface() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useAtom(chatHistoryAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [crawlDepth, setCrawlDepth] = useAtom(crawlDepthAtom);
  const [, setIsLinkMode] = useAtom(isLinkModeAtom);
  const [settings] = useAtom(aiSettingsAtom); 
  
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);
  const [currentStatus, setCurrentStatus] = useState("Thinking...");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const hasAutoStarted = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- HELPER: Smooth Scroll ---
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // --- EFFECT: SESSION RESTORE (Refresh Persistence) ---
  useEffect(() => {
    const autoUrl = searchParams.get("autoUrl");
    if (autoUrl) return; // If auto-starting, ignore session restore

    // Restore chat ID from this tab's session
    const savedSessionId = sessionStorage.getItem("docent_active_chat_id");
    
    if (savedSessionId) {
      loadChat(savedSessionId);
    } else {
      // Start fresh if no session found
      setCurrentChatId(null);
      setCurrentMessages([]);
    }
  }, []);

  // --- EFFECT: Handle Auto URL (Deep Links) ---
  useEffect(() => {
    const autoUrl = searchParams.get("autoUrl");
    if (autoUrl && !hasAutoStarted.current && !isLoading) {
      hasAutoStarted.current = true;
      sessionStorage.removeItem("docent_active_chat_id"); // Start fresh
      setCurrentMessages([]); 
      router.replace("/"); 
      handleUserMessage(autoUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router]);

  // --- EFFECT: Auto-Scroll on Updates ---
  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, isLoading, trainingLogs]);


  // --- LOGIC ---
  const loadChat = async (id: string) => {
    sessionStorage.setItem("docent_active_chat_id", id);
    setIsLoading(true);
    setCurrentChatId(id);
    const msgs = await db.getMessages(id);
    const formatted: Message[] = msgs.map((m: DBMessage) => ({
      role: m.role,
      content: m.content,
      sources: m.sources,
    }));
    setCurrentMessages(formatted);
    setIsLoading(false);
  };

  const handleNewChat = () => {
    sessionStorage.removeItem("docent_active_chat_id");
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
      setTrainingLogs((prev) => [...prev, `Reading: ${url}${path}`].slice(-5));
      setCurrentStatus(`Reading ${path}...`);
      i++;
    }, 400);
  };

  const uploadFile = async (file: File): Promise<string> => {
    setCurrentStatus("Analyzing document...");
    setTrainingLogs((prev) => [...prev, `Uploading: ${file.name}`]);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("File upload failed");
      const data = await response.json();

      if (data.extracted_text) {
        setTrainingLogs((prev) => [...prev, `Success: Extracted ${data.extracted_text.length} chars`]);
        return data.extracted_text;
      } else {
        setTrainingLogs((prev) => [...prev, `Warning: No text found in file`]);
        return "";
      }
    } catch (e) {
      setTrainingLogs((prev) => [...prev, `Error uploading file`]);
      console.error(e);
      return "";
    }
  };

  const handleUserMessage = async (text: string, file?: File | null) => {
    const displayContent = file ? `${text}\n\n[Attached File: ${file.name}]` : text;
    const newUserMsg: Message = { role: "user", content: displayContent };
    
    const updatedMessages = [...currentMessages, newUserMsg];
    setCurrentMessages(updatedMessages);

    if (currentChatId) {
      await db.addMessage(currentChatId, newUserMsg);
    }

    performChat(text, updatedMessages, file);
  };

  const performChat = async (text: string, history: Message[], file?: File | null) => {
    setIsLoading(true);
    setTrainingLogs([]);
    setCurrentStatus("Thinking...");

    const urlMatch = text.match(/(https?:\/\/[^\s]+)/);
    let simulationInterval: NodeJS.Timeout | null = null;
    let extractedContext = "";

    let systemDirective = "";
    if (settings.verbosity === "concise") systemDirective += "You are in CONCISE mode. Give code immediately. No conversational filler. ";
    else if (settings.verbosity === "detailed") systemDirective += "You are in DETAILED mode. Explain concepts thoroughly with examples. ";
    if (settings.strictMode) systemDirective += "CRITICAL: ALL CODE MUST BE STRICTLY TYPED TYPESCRIPT. NO 'ANY' TYPES ALLOWED. ";

    try {
      if (file) {
        extractedContext = await uploadFile(file);
        if (!extractedContext.trim()) {
          const warningMsg: Message = { role: "ai", content: "I processed the file, but I couldn't find any readable text." };
          setCurrentMessages((prev) => [...prev, warningMsg]);
          setIsLoading(false);
          return;
        }
      }

      if (urlMatch) {
        simulationInterval = startSimulation(urlMatch[0]);
      }

      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `[SYSTEM_INSTRUCTION: ${systemDirective}] User Query: ${text}`,
          history,
          file_context: extractedContext,
        }),
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
        sessionStorage.setItem("docent_active_chat_id", activeId);
      }

      await db.addMessage(activeId, aiMsg);
      setCurrentMessages((prev) => [...prev, aiMsg]);

    } catch (error) {
      console.error(error);
      setCurrentMessages((prev) => [...prev, { role: "ai", content: "Error connecting to server or processing request." }]);
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

  // --- RENDER ---
  return (
    <div className="fixed inset-0 flex w-full bg-transparent text-zinc-100 overflow-hidden font-sans pt-16">
      <Sidebar
        onNewChat={handleNewChat}
        onSelectChat={loadChat}
        currentChatId={currentChatId}
      />

      <main className="flex-1 flex flex-col relative min-w-0 bg-transparent">
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto custom-scrollbar p-0 scroll-smooth"
        >
          <AnimatePresence mode="wait">
            {currentMessages.length === 0 ? (
              <motion.div 
                key="welcome"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                className="h-full flex flex-col items-center justify-center gap-6"
              >
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-xs font-medium text-zinc-400 mb-4 backdrop-blur-sm">
                    <Sparkles size={12} className="text-blue-400" />
                    <span>Docent AI</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                    What will you <span className="text-blue-500">build</span> today?
                  </h1>
                </div>
              </motion.div>
            ) : (
              <div className="w-full max-w-3xl mx-auto px-4 md:px-6 pt-6 space-y-8 pb-4">
                {currentMessages.map((msg, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={clsx("flex flex-col gap-2", msg.role === "ai" ? "items-start" : "items-end")}
                  >
                    <div className={clsx("flex flex-col min-w-0", msg.role === "user" ? "items-end max-w-[85%]" : "items-start w-full")}>
                      <div className={clsx(
                          "rounded-lg text-[16px] leading-relaxed relative group/msg",
                          msg.role === "user" ? "bg-[#0F1014] shadow shadow-zinc-800 text-white px-5 py-3 rounded-4xl" : "bg-transparent text-zinc-100 pl-0 pt-0 w-full"
                        )}>
                        {msg.role === "ai" ? <MarkdownRenderer content={msg.content} /> : <div className="whitespace-pre-wrap">{msg.content}</div>}
                      </div>

                      {msg.role === "ai" && (
                        <div className="flex items-center justify-between w-full mt-2 pl-1 pr-2">
                          <div className="flex flex-wrap gap-2">
                            {msg.sources && msg.sources.length > 0 && msg.sources.map((src, idx) => (
                                <a key={idx} href={src} target="_blank" className="flex items-center gap-1 text-[10px] bg-zinc-800/50 border border-zinc-700/50 px-2 py-1 rounded-md text-zinc-400 hover:text-blue-400 transition-colors">
                                  <Globe size={10} />
                                  <span className="truncate max-w-37.5">{src.startsWith("http") ? src.replace("https://", "").split("/")[0] : src}</span>
                                </a>
                              ))}
                          </div>

                          <button onClick={() => handleCopyMessage(msg.content, i)} className="flex items-center cursor-pointer gap-1.5 text-[11px] text-zinc-500 hover:text-white transition-colors" title="Copy response">
                            {copiedIndex === i ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="max-w-3xl w-full"
                  >
                    <ThinkingMessage status={currentStatus} logs={trainingLogs} />
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="shrink-0 w-full bg-linear-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent p-4 pb-6 pt-10">
          <div className="w-full max-w-3xl mx-auto">
            <PromptBar
              onSendMessage={handleUserMessage}
              onLinkModeToggle={setIsLinkMode}
              isLoading={isLoading}
              isChatMode={true}
              crawlDepth={crawlDepth}
              setCrawlDepth={setCrawlDepth}
            />
            <p className="text-center text-[10px] text-zinc-600 mt-3">Docent AI can make mistakes. Check sources.</p>
          </div>
        </div>
      </main>
    </div>
  );
}