"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  ArrowUp,
  Square,
  Link as LinkIcon,
  FileText,
  X,
  File,
  Paperclip,
} from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

interface PromptBarProps {
  onSendMessage?: (message: string, file?: File | null) => void;
  onLinkModeToggle?: (isActive: boolean) => void;
  isLoading?: boolean;
  isChatMode?: boolean;
  crawlDepth?: number;
  setCrawlDepth?: any;
}

export default function PromptBar({
  onSendMessage,
  onLinkModeToggle,
  isLoading,
  isChatMode,
  crawlDepth,
  setCrawlDepth,
}: PromptBarProps) {
  const [input, setInput] = useState("");
  const [isLinkMode, setIsLinkMode] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const MIN_HEIGHT = 24;
  const [textareaHeight, setTextareaHeight] = useState(MIN_HEIGHT);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key.length === 1) {
        textareaRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowPlusMenu(false);
      }
      if (
        textareaRef.current &&
        !textareaRef.current.contains(event.target as Node) &&
        !menuRef.current?.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    if (urlRegex.test(val) && !isLinkMode) {
      setIsLinkMode(true);
      if (onLinkModeToggle) onLinkModeToggle(true);
    } else if (!urlRegex.test(val) && isLinkMode && !val.trim()) {
      setIsLinkMode(false);
      if (onLinkModeToggle) onLinkModeToggle(false);
    }

    e.target.style.height = "auto";
    
    let newHeight = e.target.scrollHeight;
    
    if (val === "") {
        newHeight = MIN_HEIGHT;
    }

    setTextareaHeight(Math.min(newHeight, 150));
  };

  const handleSubmit = () => {
    if ((!input.trim() && !attachedFile) || isLoading) return;
    if (onSendMessage) {
      onSendMessage(input, attachedFile);
      setInput("");
      setAttachedFile(null);
      if (isLinkMode) toggleLinkMode(false);
      
      setTextareaHeight(MIN_HEIGHT);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
      setShowPlusMenu(false);
    }
  };

  const removeFile = () => {
    setAttachedFile(null);
    if (docInputRef.current) docInputRef.current.value = "";
  };

  const containerSpring = {
    type: "spring" as const,
    stiffness: 350,
    damping: 25,
    mass: 1,
  };

  const itemsSpring = {
    type: "spring" as const,
    damping: 10,
    mass: 0.75,
    stiffness: 100,
  };

  const showSendButton = input.trim().length > 0 || attachedFile !== null || isLoading;

  return (
    <motion.div
      layout
      initial={false}
      animate={{
        maxWidth: isChatMode ? "720px" : "460px",
      }}
      transition={containerSpring}
      className="w-full mx-auto relative z-40"
    >
      <input
        type="file"
        ref={docInputRef}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileSelect}
      />

      <div className="relative group">
        <div
          className={clsx(
            "absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-[32px] blur opacity-0 transition duration-500",
            isFocused ? "opacity-100" : "group-hover:opacity-50"
          )}
        ></div>

        <motion.div
          layout
          transition={{
            type: "spring",
            damping: 10,
            mass: 0.75,
            stiffness: 100,
          }}
          className={clsx(
            "relative flex flex-col bg-titanium-900/90 rounded-[26px] shadow-2xl backdrop-blur-sm overflow-visible"
          )}
        >
          <AnimatePresence>
            {attachedFile && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: 5 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: 5 }}
                transition={itemsSpring}
                className="px-3 pt-2 overflow-hidden"
              >
                <div className="inline-flex items-center gap-2 bg-titanium-800/50 border border-titanium-700 rounded-xl px-3 py-1.5 pr-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                    <File size={14} className="text-blue-400" />
                  </div>
                  <div className="flex flex-col max-w-[150px]">
                    <span className="text-[11px] text-titanium-100 truncate font-medium">
                      {attachedFile.name}
                    </span>
                  </div>
                  <button
                    onClick={removeFile}
                    className="p-0.5 hover:bg-titanium-700 rounded-full transition-colors text-titanium-400 hover:text-white ml-2"
                  >
                    <X size={12} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end p-2 gap-2">
            <div className="relative shrink-0 pb-0.5 pl-0.5" ref={menuRef}>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowPlusMenu(!showPlusMenu)}
                className="p-2 cursor-pointer rounded-full text-titanium-400 hover:text-white hover:bg-titanium-800 transition-colors"
              >
                <Paperclip size={18} />
              </motion.button>

              <AnimatePresence>
                {showPlusMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.8, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: -8, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: 15, scale: 0.8, filter: "blur(4px)" }}
                    transition={itemsSpring}
                    className="absolute bottom-full left-0 w-44 mb-1 bg-[#171719] rounded-2xl shadow-xl border border-titanium-900 overflow-hidden flex flex-col p-1.5 z-50 origin-bottom-left"
                  >
                    <button
                      onClick={() => {
                        docInputRef.current?.click();
                        setShowPlusMenu(false);
                      }}
                      className="cursor-pointer flex items-center gap-3 text-sm text-titanium-200 hover:bg-titanium-700/80 rounded-xl transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-titanium-100 shrink-0">
                        <FileText size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs mb-0.5">Upload Doc</span>
                        <span className="text-[9px] text-titanium-500">PDF, DOCX, TXT</span>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1 flex flex-col min-w-0 py-1.5">
              <AnimatePresence>
                {isLinkMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={itemsSpring}
                    className="flex items-center gap-2 mb-1 overflow-hidden"
                  >
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-300 text-[10px] font-medium tracking-wide">
                      <LinkIcon size={10} />
                      <span>Reading Link</span>
                      <button
                        onClick={() => toggleLinkMode(false)}
                        className="ml-1 hover:text-white"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.textarea
                ref={textareaRef}
                value={input}
                rows={1}
                onFocus={() => setIsFocused(true)}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={isLinkMode ? "Paste URL..." : "Ask Docent..."}
                animate={{ height: textareaHeight }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 18,
                  mass: 0.8
                }}
                className="w-full bg-transparent text-titanium-100 placeholder-titanium-500 resize-none outline-none text-[15px] leading-6 font-sans scrollbar-hide px-1 py-0"
              />
            </div>

            <div className="flex items-end pb-0.5 pr-0.5 min-w-9 min-h-9">
              <AnimatePresence>
                {showSendButton && (
                    <motion.button
                        layout
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={itemsSpring}
                        onClick={handleSubmit}
                        disabled={!input.trim() && !attachedFile && !isLoading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.9 }}
                        className={clsx(
                        "h-9 w-9 flex items-center justify-center rounded-full transition-colors duration-200",
                        "bg-titanium-800 text-white shadow-lg shadow-blue-900/20"
                        )}
                    >
                        {isLoading ? (
                        <Square size={14} className="fill-current animate-pulse" />
                        ) : (
                        <ArrowUp size={18} strokeWidth={2} />
                        )}
                    </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
