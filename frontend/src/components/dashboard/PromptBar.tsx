"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation"; // <--- Added for navigation
import { Paperclip, ArrowRight, Lightbulb } from "lucide-react";
import clsx from "clsx";
import { FileNode } from "./FileTree"; 

interface PromptBarProps {
  onUploadSuccess?: (file: FileNode) => void;
}

export default function PromptBar({ onUploadSuccess }: PromptBarProps) {
  const router = useRouter(); // <--- Initialize Router
  const [input, setInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 1. File Upload Logic ---
  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          if (onUploadSuccess) {
            onUploadSuccess({
              name: data.file.name,
              type: "file",
            });
          }
        } else {
          alert("❌ Upload failed");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("❌ Error uploading file");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  // --- 2. Build / Navigation Logic ---
  const handleBuild = () => {
    if (!input.trim()) return; // Don't go if empty
    
    // Navigate to workspace with the prompt as a query parameter
    router.push(`/workspace?prompt=${encodeURIComponent(input)}`);
  };

  // Allow pressing "Enter" to submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleBuild();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto relative z-10">
      <div className="relative group">
        {/* Glow Effect behind the input */}
        <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
        
        {/* Main Input Container */}
        <div className="relative flex flex-col bg-titanium-900 border border-titanium-700 rounded-2xl p-4 shadow-2xl">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Let's build..."
            className="w-full bg-transparent text-titanium-100 placeholder-titanium-700 resize-none outline-none text-lg h-12 font-sans"
          />

          <div className="flex items-center justify-between mt-4">
            {/* Left: Upload Button (+ Button) */}
            <div className="flex items-center gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange} 
              />
              <button 
                onClick={handleFileClick}
                disabled={isUploading}
                className={clsx(
                  "p-2 rounded-full transition-colors border border-transparent",
                  isUploading 
                    ? "bg-titanium-800 text-blue-400 cursor-wait" 
                    : "hover:bg-titanium-800 text-titanium-400 hover:text-white hover:border-titanium-700"
                )}
                title="Upload file"
              >
                {isUploading ? (
                   <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                   <Paperclip size={20} />
                )}
              </button>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-titanium-400 hover:text-titanium-100 text-sm font-medium transition-colors">
                <Lightbulb size={16} />
                Plan
              </button>
              
              <button 
                onClick={handleBuild} // <--- Navigation triggered here
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)]"
              >
                Build now <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}