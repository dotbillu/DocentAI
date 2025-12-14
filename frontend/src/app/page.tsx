"use client";

import React, { useState, useRef, useEffect } from "react";
import Hero from "../components/dashboard/Hero";
import PromptBar from "../components/dashboard/PromptBar";
import DecentAIBanner from "../components/dashboard/DocentAIBanner";
import BigFooter from "../components/layout/BigFooter";
import ThinkingMessage from "../components/dashboard/ThinkingMessage";
import { Sparkles, Globe } from "lucide-react";
import clsx from "clsx";
import MarkdownRenderer from "../components/dashboard/MarkdownRenderer";
import Horizon from "../components/dashboard/Horizon";
import { useAtom } from "jotai";
import { chatHistoryAtom, crawlDepthAtom, isLinkModeAtom } from "../atom";

type Message = {
  role: "user" | "ai";
  content: string;
  sources?: string[];
};

interface TrainResponse {
  new_pages: number;
}

interface ChatResponse {
  answer: string;
  sources: string[];
}

export default function Home() {
  const [currentMessages, setCurrentMessages] = useAtom(chatHistoryAtom);
  const [crawlDepth, setCrawlDepth] = useAtom(crawlDepthAtom);
  const [isLinkMode, setIsLinkMode] = useAtom(isLinkModeAtom);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
    
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);
  const [currentStatus, setCurrentStatus] = useState("Thinking...");

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, trainingLogs, isLoading]);

  // Logic to prevent Hero flash when chat history loads from storage
  useEffect(() => {
    if (currentMessages.length > 0) {
      setIsInitialLoad(false);
    } else {
        const timer = setTimeout(() => {
            setIsInitialLoad(false);
        }, 100); 

        return () => clearTimeout(timer);
    }
  }, [currentMessages.length]);

  const simulateTrainingLogs = (url: string) => {
    setTrainingLogs([]);
    setCurrentStatus(`Initializing crawl for ${url}...`);
    
    const mockPaths = [
      "/intro", "/getting-started", "/installation", "/configuration", 
      "/components/core", "/api-reference", "/hooks/use-auth", 
      "/utils/helpers", "/styles/theme", "/deployment/docker",
      "/troubleshooting", "/changelog", "/community/forum"
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i >= mockPaths.length) i = 0;
      const path = mockPaths[i];
      const newLog = `Reading: ${url}${path}`;
      setTrainingLogs(prev => [...prev, newLog]);
      setCurrentStatus(`Reading ${path}...`); 
      i++;
    }, 600);
    
    return interval;
  };

  const performTraining = async (url: string): Promise<boolean> => {
    setIsTraining(true);
    const logInterval = simulateTrainingLogs(url);
    
    try {
      let cleanUrl = url;
      if (!cleanUrl.startsWith("http")) cleanUrl = "https://" + cleanUrl;

      const res = await fetch(
        `http://127.0.0.1:8000/crawl?url=${encodeURIComponent(cleanUrl)}&max_depth=${crawlDepth}`
      );
      
      clearInterval(logInterval);
      
      if (!res.ok) throw new Error("Training failed");

      const data = (await res.json()) as TrainResponse;
      
      setTrainingLogs(prev => [...prev, `successfully learned ${data.new_pages} pages.`]);
      return true; 
    } catch (error) {
      clearInterval(logInterval);
      const errorMsg: Message = {
        role: "ai",
        // Shortened error message and removed emoji
        content: "Error: URL access failed. Training aborted.",
      };
      setCurrentMessages((prev) => [...prev, errorMsg]);
      setIsTraining(false);
      return false;
    } finally {
      setIsTraining(false);
    }
  };

  const performChat = async (text: string, history: Message[]) => {
    setIsLoading(true);
    setCurrentStatus("Analyzing your request...");
    setTrainingLogs([]);

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: text,
          history: history,
        }),
      });

      if (!response.ok) throw new Error("Backend offline");

      const data = (await response.json()) as ChatResponse;

      const aiMsg: Message = {
        role: "ai",
        content: data.answer || "I couldn't find an answer.",
        sources: data.sources || [],
      };

      setCurrentMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: Message = {
        role: "ai",
        content: "Error: Could not connect to the backend.",
      };
      setCurrentMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserMessage = async (text: string) => {
    const newUserMsg: Message = { role: "user", content: text };
    const updatedMessages = [...currentMessages, newUserMsg];
    setCurrentMessages(updatedMessages);

    const urlMatch = text.match(/(https?:\/\/[^\s]+)/);
    const hasUrl = !!urlMatch;
    
    if (isLinkMode || hasUrl) {
      const url = urlMatch ? urlMatch[0] : text;
      
      const effectiveUrl = hasUrl ? url : (text.includes(".") ? text : null);

      if (effectiveUrl) {
        const trainingSuccess = await performTraining(effectiveUrl);
        if (trainingSuccess) {
           setTimeout(() => {
             performChat(text, updatedMessages);
           }, 500);
        }
      } else {
          performChat(text, updatedMessages);
      }
    } else {
      performChat(text, updatedMessages);
    }
  };

  const showLanding = currentMessages.length === 0 && !isTraining && !isLoading && !isInitialLoad;

  if (isInitialLoad && currentMessages.length > 0) {
    return <div className="flex-1 w-full h-full bg-transparent" />;
  }

  return (
    <div className="flex flex-col h-full relative">
      
      <div className="flex-1 overflow-y-auto custom-scrollbar relative flex flex-col p-4">
        {showLanding ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-500">
            <div className="w-full max-w-3xl flex flex-col items-center gap-8 mb-20">
              <DecentAIBanner />
              <Hero />

              <div className="w-full max-w-xl relative z-20">
                <div className="bg-titanium-900/80 border border-titanium-800 rounded-2xl shadow-2xl backdrop-blur-xl p-1">
                  <PromptBar
                    onSendMessage={handleUserMessage}
                    onLinkModeToggle={setIsLinkMode}
                    isLoading={isLoading || isTraining}
                    isChatMode={false}
                    crawlDepth={crawlDepth}
                    setCrawlDepth={setCrawlDepth}
                  />
                </div>
              </div>

              <div className="mt-8">
                <Horizon />
              </div>
            </div>
            <BigFooter />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto w-full min-h-0 pt-20 pb-40">
            {currentMessages.map((msg, i) => (
              <div
                key={i}
                className={clsx(
                  "flex gap-4 mb-8 animate-in fade-in slide-in-from-bottom-2",
                  msg.role === "ai" ? "justify-start" : "justify-end",
                )}
              >
                {msg.role === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-blue-900/20">
                    <Sparkles size={16} className="text-white" />
                  </div>
                )}

                <div className={clsx("max-w-[85%] space-y-2")}>
                  <div
                    className={clsx(
                      "p-4 rounded-2xl text-sm leading-7 shadow-md",
                      msg.role === "user"
                        ? "bg-titanium-800 text-white"
                        : "text-titanium-100 bg-titanium-900/50 border border-titanium-800",
                    )}
                  >
                    {msg.role === "ai" ? (
                      <MarkdownRenderer content={msg.content} />
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}
                  </div>

                  {msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1 pl-1">
                      {msg.sources.map((src, idx) => (
                        <a
                          key={idx}
                          href={src}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] bg-titanium-900 border border-titanium-800 px-2 py-1 rounded-md text-titanium-400 hover:text-blue-400 hover:border-blue-900 transition-all"
                        >
                          <Globe size={10} />
                          <span className="truncate max-w-[150px]">
                            {src.replace("https://", "").split("/")[0]}...
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {(isLoading || isTraining) && (
              <ThinkingMessage 
                status={currentStatus}
                logs={trainingLogs}
              />
            )}
            
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="shrink-0 w-full bg-titanium-950/80 backdrop-blur-md border-t border-titanium-900 p-4 z-30 fixed bottom-0 left-0 right-0">
        {!showLanding && (
          <div className="max-w-3xl mx-auto">
             <PromptBar
               onSendMessage={handleUserMessage}
               onLinkModeToggle={setIsLinkMode}
               isLoading={isLoading || isTraining}
               isChatMode={true}
               crawlDepth={crawlDepth}
               setCrawlDepth={setCrawlDepth}
             />
          </div>
        )}
        <div className="text-center mt-2">
          <p className="text-[10px] text-titanium-600">
            Decent AI can make mistakes. Check sources.
          </p>
        </div>
      </div>
    </div>
  );
}
