import React, { useEffect, useRef } from "react";
import { Loader2, FileText, CheckCircle2 } from "lucide-react";
import clsx from "clsx";

interface TrainingStatusProps {
  isOpen: boolean;
  logs: string[];
  currentUrl: string;
}

export default function TrainingStatus({ isOpen, logs, currentUrl }: TrainingStatusProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-4 right-4 z-40 w-80 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="bg-titanium-900/90 border border-titanium-700 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-titanium-800 bg-titanium-950/50">
          <div className="relative">
             <div className="absolute inset-0 bg-blue-500 blur-sm opacity-50 animate-pulse"></div>
             <Loader2 size={16} className="text-blue-400 animate-spin relative z-10" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Training in Progress
            </h3>
            <p className="text-[10px] text-titanium-400 truncate max-w-[200px]">
              {currentUrl}
            </p>
          </div>
        </div>

        {/* Logs Area */}
        <div 
          ref={scrollRef}
          className="h-48 overflow-y-auto p-3 space-y-2 font-mono text-[10px] custom-scrollbar bg-black/20"
        >
          {logs.length === 0 && (
            <span className="text-titanium-500 italic">Initializing crawler...</span>
          )}
          
          {logs.map((log, i) => {
            const isSuccess = log.includes("Reading");
            return (
              <div key={i} className="flex gap-2 items-start animate-in fade-in slide-in-from-left-2">
                {isSuccess ? (
                  <FileText size={10} className="mt-0.5 text-titanium-500 shrink-0" />
                ) : (
                  <span className="w-2.5" />
                )}
                <span className={clsx(
                  "break-all leading-tight",
                  isSuccess ? "text-titanium-300" : "text-titanium-500"
                )}>
                  {log}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer Status */}
        <div className="px-3 py-2 bg-titanium-950/30 border-t border-titanium-800 text-[10px] text-titanium-500 flex justify-between">
          <span>{logs.length} pages processed</span>
          <span className="animate-pulse text-blue-400">Active</span>
        </div>
      </div>
    </div>
  );
}
