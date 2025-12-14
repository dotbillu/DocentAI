"use client";

import React, { useRef, useState } from "react";
import { Paperclip, ArrowUp, Square } from "lucide-react";
import clsx from "clsx";
import { FileNode } from "./FileTree";

interface PromptBarProps {
  onUploadSuccess?: (file: FileNode) => void;
  onSendMessage?: (message: string) => void;
  isLoading?: boolean;
  isChatMode?: boolean; // <--- NEW PROP to adjust styles if needed
}

export default function PromptBar({ onUploadSuccess, onSendMessage, isLoading, isChatMode }: PromptBarProps) {
  const [input, setInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea logic
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Reset height to auto to shrink if needed, then set to scrollHeight
    e.target.style.height = 'auto'; 
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    
    if (onSendMessage) {
      onSendMessage(input);
      setInput("");
      // Reset height after sending
      if (textareaRef.current) textareaRef.current.style.height = 'auto'; 
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileClick = () => fileInputRef.current?.click();
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      setTimeout(() => {
         if (onUploadSuccess) onUploadSuccess({ name: e.target.files![0].name, type: "file" });
         setIsUploading(false);
      }, 1000);
    }
  };

  return (
    <div className={clsx("w-full mx-auto relative z-10", isChatMode ? "max-w-4xl" : "max-w-3xl")}>
      <div className="relative group">
        
        {/* THE GLOW EFFECT (Kept exactly as requested) */}
        <div className={clsx(
          "absolute -inset-0.5 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-75 transition duration-1000",
          "group-hover:opacity-100"
        )}></div>
        
        {/* MAIN CONTAINER */}
        <div className="relative flex flex-col bg-titanium-900/90 border border-titanium-700 rounded-2xl shadow-2xl backdrop-blur-sm overflow-hidden transition-all duration-300">
          
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={isChatMode ? "Reply to Decent AI..." : "What do you want to learn today?"}
            className="w-full bg-transparent text-titanium-100 placeholder-titanium-500 resize-none outline-none text-base p-4 min-h-13 max-h-50 font-sans scrollbar-hide"
            rows={1}
          />

          <div className="flex items-center justify-between px-2 pb-2">
            {/* Upload Button */}
            <div className="flex items-center gap-2">
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
              <button 
                onClick={handleFileClick}
                className="p-2 rounded-lg text-titanium-400 hover:text-white hover:bg-titanium-800 transition-colors"
                title="Attach file"
              >
                {isUploading ? <div className="w-5 h-5 border-2 border-titanium-400 border-t-transparent rounded-full animate-spin" /> : <Paperclip size={20} />}
              </button>
            </div>

            {/* Send Button */}
            <button 
              onClick={handleSubmit}
              disabled={!input.trim() && !isLoading}
              className={clsx(
                "p-2 rounded-lg transition-all duration-200",
                input.trim() || isLoading 
                  ? "bg-blue-600 text-white shadow-lg hover:bg-blue-500" 
                  : "bg-titanium-800 text-titanium-500 cursor-not-allowed"
              )}
            >
              {isLoading ? <Square size={18} className="fill-current animate-pulse" /> : <ArrowUp size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}