"use client";

import React, { useEffect, useState } from "react";
import { ChevronRight, Plus, Settings } from "lucide-react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { db } from "../../lib/db";
import { useAtom } from "jotai";
import { sidebarOpenAtom } from "../../atom";

interface SidebarProps {
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  currentChatId: string | null;
}

export default function Sidebar({
  onNewChat,
  onSelectChat,
  currentChatId,
}: SidebarProps) {
  const [isOpen] = useAtom(sidebarOpenAtom);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const loadChats = async () => {
      const chats = await db.getChats();
      setHistory(
        chats.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
      );
    };
    loadChats();
  }, [isOpen, currentChatId]);

  return (
    <motion.div
      initial={{ width: 260 }}
      animate={{ width: isOpen ? 260 : 72 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-full bg-titanium-950 border-r border-t border-titanium-800/50 flex flex-col shrink-0 relative z-40 overflow-hidden"
    >
      {/* 1. TOP: New Chat Button */}
      <div className="p-2 flex flex-col gap-2">
        <button
          onClick={onNewChat}
          className={clsx(
            "h-10 flex items-center rounded-lg transition-all duration-300 w-full overflow-hidden",
            "hover:bg-titanium-800 hover:text-titanium-200 text-titanium-400",
            // Padding Logic:
            // Closed (72px width): (72 - 20 icon) / 2 = 26px to center
            // Open: pl-4 (16px) for better spacing
            isOpen ? "pl-4" : "pl-3",
          )}
          title="New Chat"
        >
          <Plus size={24} className="shrink-0" />

          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{
              opacity: isOpen ? 1 : 0,
              width: isOpen ? "auto" : 0,
              marginLeft: isOpen ? 12 : 0, // Animating gap (12px = gap-3) prevents jumpiness
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="whitespace-nowrap font-medium text-24"
          >
            New Chat
          </motion.span>
        </button>
      </div>

      {/* 2. MIDDLE: History List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-1">
        {isOpen && (
          <div className="animate-in fade-in duration-300">
            <div className="text-24 font-bold text-titanium-400 uppercase pl-5 mb-2 mt-2 whitespace-nowrap">
              Recent
            </div>
            {history.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={clsx(
                  "w-full flex items-center pl-5 pr-2 h-9 rounded-lg text-24 transition-colors text-left",
                  currentChatId === chat.id
                    ? "text-titanium-200 bg-titanium-900" 
                    : "text-titanium-400 hover:bg-titanium-900 hover:text-titanium-200",
                )}
                title={chat.title}
              >
                <span className="flex-1 truncate whitespace-nowrap mr-2">
                  {chat.title}
                </span>

                {currentChatId === chat.id && (
                  <ChevronRight
                    size={14}
                    className="shrink-0 text-titanium-500"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. BOTTOM: Settings */}
      <div className="p-2 border-t border-titanium-800/50 mt-auto flex flex-col">
        <button
          className={clsx(
            "h-10 flex items-center rounded-lg transition-all duration-300 w-full overflow-hidden",
            "hover:bg-titanium-900 hover:text-titanium-200 text-titanium-400",
            // Matching Padding Logic
            isOpen ? "pl-4" : "pl-4",
          )}
        >
          <Settings size={24} className="shrink-0" />
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{
              opacity: isOpen ? 1 : 0,
              width: isOpen ? "auto" : 0,
              marginLeft: isOpen ? 12 : 0,
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="text-24 whitespace-nowrap"
          >
            Settings
          </motion.span>
        </button>
      </div>
    </motion.div>
  );
}
