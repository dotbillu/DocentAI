"use client";

import React, { useState, useRef, useEffect } from "react";
import Hero from "../components/dashboard/Hero";
import PromptBar from "../components/dashboard/PromptBar";
import Horizon from "../components/dashboard/Horizon";
import DecentAIBanner from "../components/dashboard/DecentAIBanner";
import Sidebar from "../components/dashboard/Sidebar";
import BigFooter from "../components/layout/BigFooter"; // Ensure this is imported
import { Sparkles, User, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import clsx from "clsx";

// Types
type Message = { role: "user" | "ai"; content: string };
type ChatSession = { id: string; title: string; date: string; messages: Message[] };
type UploadedFile = { name: string; type: string };

export default function Home() {
  // --- STATE ---
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  // --- ACTIONS ---
  const handleNewChat = () => {
    setActiveChatId(null);
    setCurrentMessages([]);
  };

  const handleSelectChat = (id: string) => {
    const chat = chatHistory.find(c => c.id === id);
    if (chat) {
      setActiveChatId(chat.id);
      setCurrentMessages(chat.messages);
    }
  };

  const handleUploadSuccess = (file: { name: string, type: string }) => {
    setUploadedFiles(prev => [...prev, file]);
  };

  const handleSendMessage = (text: string) => {
    const newUserMsg: Message = { role: "user", content: text };
    
    // Optimistic Update
    const updatedMessages = [...currentMessages, newUserMsg];
    setCurrentMessages(updatedMessages);
    setIsLoading(true);

    if (!activeChatId) {
      const newId = Date.now().toString();
      const newTitle = text.length > 30 ? text.substring(0, 30) + "..." : text;
      
      const newSession: ChatSession = {
        id: newId,
        title: newTitle,
        date: new Date().toISOString(),
        messages: updatedMessages
      };
      
      setActiveChatId(newId);
      setChatHistory(prev => [newSession, ...prev]);
    } else {
      setChatHistory(prev => prev.map(chat => 
        chat.id === activeChatId ? { ...chat, messages: updatedMessages } : chat
      ));
    }

    // Simulate AI
    setTimeout(() => {
      const aiMsg: Message = { 
        role: "ai", 
        content: "I've analyzed your request. Here is the insight you asked for..." 
      };
      
      const finalMessages = [...updatedMessages, aiMsg];
      setCurrentMessages(finalMessages);
      setIsLoading(false);

      setChatHistory(prev => prev.map(chat => 
        chat.id === (activeChatId || prev[0].id) ? { ...chat, messages: finalMessages } : chat
      ));
    }, 1500);
  };

  // CHECK: Are we on Landing Page?
  const isLandingPage = currentMessages.length === 0;

  return (
    <div className="relative min-h-screen flex font-sans bg-titanium-950 overflow-hidden">
      
      {/* 1. LEFT SIDEBAR */}
      <aside 
        className={clsx(
          "h-screen sticky top-0 pt-16 z-20 border-r border-titanium-800/50 bg-titanium-950/30 backdrop-blur-sm transition-all duration-300 shrink-0",
          isSidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full opacity-0 overflow-hidden"
        )}
      >
        <Sidebar 
          history={chatHistory} 
          files={uploadedFiles}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          activeChatId={activeChatId || ""}
        />
      </aside>

      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute top-20 left-4 z-30 p-2 text-titanium-400 hover:text-white transition-colors"
      >
        {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
      </button>

      {/* 2. MAIN CONTENT */}
      <div className={clsx(
        "flex-1 flex flex-col h-screen relative z-10 w-full transition-all duration-500",
        isLandingPage ? "overflow-y-auto" : "overflow-hidden" // Lock scroll when chatting
      )}>
        
        {/* --- SCENARIO A: LANDING PAGE --- */}
        {isLandingPage && (
          <div className="flex flex-col min-h-full pt-20">
             
             {/* Center Content */}
             <div className="flex-1 flex flex-col items-center justify-center px-4 animate-in fade-in zoom-in duration-500 pb-20">
                <DecentAIBanner />
                <Hero />
                <div className="w-full max-w-3xl mt-8">
                  <PromptBar 
                    onSendMessage={handleSendMessage} 
                    onUploadSuccess={handleUploadSuccess}
                    isLoading={isLoading}
                    isChatMode={false} 
                  />
                </div>
                <Horizon />
             </div>

             {/* Footer Content (Only visible HERE) */}
             {/* This will DISAPPEAR when isLandingPage becomes false */}
             <BigFooter />
          </div>
        )}

        {/* --- SCENARIO B: CHAT MODE --- */}
        {!isLandingPage && (
          <>
            {/* Scrollable Chat History */}
            <div className="flex-1 overflow-y-auto p-4 md:p-0 space-y-8 pb-40 custom-scrollbar">
              <div className="max-w-3xl mx-auto w-full pt-10">
                {currentMessages.map((msg, i) => (
                  <div key={i} className={clsx("flex gap-4 mb-6 animate-in fade-in slide-in-from-bottom-2", msg.role === "ai" ? "justify-start" : "justify-end")}>
                     {msg.role === "ai" && <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 mt-1"><Sparkles size={16} className="text-white" /></div>}
                     <div className={clsx("max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap", msg.role === "user" ? "bg-titanium-800 text-white" : "text-titanium-100")}>
                       {msg.content}
                     </div>
                     {msg.role === "user" && <div className="w-8 h-8 rounded-full bg-titanium-700 flex items-center justify-center shrink-0 mt-1"><User size={16} className="text-titanium-400" /></div>}
                  </div>
                ))}
                {isLoading && (
                   <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 animate-pulse"><Sparkles size={16} className="text-white" /></div>
                      <div className="flex items-center gap-1 h-8 px-4 text-titanium-400 italic text-sm">Thinking...</div>
                   </div>
                )}
                <div ref={bottomRef} />
              </div>
            </div>

            {/* Fixed Bottom Input */}
            <div className="absolute bottom-0 w-full px-4 pb-6 pt-4 bg-linear-to-t from-titanium-950 via-titanium-950 to-transparent z-20">
               <div className="max-w-3xl mx-auto">
                 <PromptBar 
                   onSendMessage={handleSendMessage} 
                   onUploadSuccess={handleUploadSuccess} 
                   isLoading={isLoading} 
                   isChatMode={true} 
                 />
                 <div className="text-center mt-3">
                   <p className="text-[10px] text-titanium-500">Decent AI can make mistakes.</p>
                 </div>
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}