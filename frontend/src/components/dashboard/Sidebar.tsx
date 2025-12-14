import React from "react";
import { MessageSquarePlus, FileText, Clock, File } from "lucide-react";
import clsx from "clsx";

type ChatSession = {
  id: string;
  title: string; // First prompt
  date: string;
};

type UploadedFile = {
  name: string;
  type: string;
};

interface SidebarProps {
  history: ChatSession[];
  files: UploadedFile[];
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  activeChatId?: string;
}

export default function Sidebar({ history, files, onNewChat, onSelectChat, activeChatId }: SidebarProps) {
  return (
    <div className="h-full flex flex-col p-3 gap-6">
      
      {/* 1. NEW CHAT BUTTON */}
      <button 
        onClick={onNewChat}
        className="flex items-center gap-3 px-3 py-2.5 bg-titanium-800/50 hover:bg-titanium-800 text-white rounded-lg transition-colors border border-titanium-700/50 group"
      >
        <MessageSquarePlus size={18} className="text-blue-400 group-hover:text-blue-300" />
        <span className="text-sm font-medium">New Chat</span>
      </button>

      {/* 2. CHAT HISTORY SECTION */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-1 pr-1 custom-scrollbar">
        <div className="text-xs font-semibold text-titanium-500 uppercase tracking-wider mb-2 px-2">Recent</div>
        {history.length === 0 ? (
           <div className="px-2 text-sm text-titanium-600 italic">No history yet</div>
        ) : (
          history.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={clsx(
                "w-full text-left truncate px-2 py-2 rounded-md text-sm transition-colors flex items-center gap-2",
                activeChatId === chat.id 
                  ? "bg-titanium-800 text-white" 
                  : "text-titanium-400 hover:bg-titanium-800/50 hover:text-titanium-200"
              )}
            >
              <span className="min-w-1 h-1 rounded-full bg-titanium-600" /> 
              {chat.title}
            </button>
          ))
        )}
      </div>

      {/* 3. UPLOADED FILES SECTION ("My Works") */}
      <div className="shrink-0 border-t border-titanium-800 pt-4 pb-2">
        <div className="text-xs font-semibold text-titanium-500 uppercase tracking-wider mb-2 px-2">My Works</div>
        <div className="space-y-1 max-h-37.5 overflow-y-auto custom-scrollbar">
          {files.length === 0 ? (
             <div className="px-2 text-sm text-titanium-600 italic">No files uploaded</div>
          ) : (
            files.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 px-2 py-1.5 text-sm text-titanium-300 hover:text-white cursor-pointer hover:bg-titanium-800/30 rounded">
                 <FileText size={14} className="text-blue-400" />
                 <span className="truncate">{file.name}</span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}