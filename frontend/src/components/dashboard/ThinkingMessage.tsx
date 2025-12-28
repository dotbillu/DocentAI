import React, { useState, useEffect, useRef } from "react";
import { Sparkles, ChevronDown, ChevronRight, AlertCircle, CheckCircle2 } from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

interface ThinkingMessageProps {
  status: string;
  logs: string[];
}

export default function ThinkingMessage({ status, logs }: ThinkingMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isExpanded]);

  return (
    <div className="flex gap-4 mb-8 animate-in fade-in slide-in-from-bottom-2 w-full max-w-3xl">
      <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/20 animate-pulse">
        <Sparkles size={16} className="text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="rounded-xl overflow-hidden border border-titanium-800 bg-titanium-900/40">
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-titanium-800/50 transition-colors group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <span className={clsx(
                "text-sm font-medium truncate transition-colors",
                isExpanded ? "text-blue-400" : "text-titanium-300 group-hover:text-titanium-100"
              )}>
                {status || "Thinking..."}
              </span>
            </div>
            
            <div className="text-titanium-500 group-hover:text-titanium-300 transition-colors">
              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </div>
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-titanium-800/50 bg-black/20"
              >
                <div className="p-4 font-mono text-xs space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar">
                  {logs.length === 0 && (
                    <span className="text-titanium-600 italic">Initializing process...</span>
                  )}
                  
                  {logs.map((log, idx) => {
                    // Logic to color-code logs based on content
                    const isError = log.includes("ERROR") || log.includes("404") || log.includes("failed");
                    const isSuccess = log.includes("Reading") || log.includes("Crawling");
                    
                    return (
                      <div key={idx} className="flex gap-3">
                        <span className="shrink-0 pt-0.5">
                            {isError ? (
                                <AlertCircle size={12} className="text-orange-500" />
                            ) : isSuccess ? (
                                <CheckCircle2 size={12} className="text-green-500/50" />
                            ) : (
                                <span className="text-titanium-700 select-none">$</span>
                            )}
                        </span>
                        
                        <span className={clsx(
                            "break-all",
                            isError ? "text-orange-400/80" : "text-titanium-400"
                        )}>
                          {/* Clean up the log message for display */}
                          {log.replace(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} - /, "")}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={logsEndRef} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
