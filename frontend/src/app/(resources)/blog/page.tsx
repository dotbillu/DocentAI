"use client";

import React from "react";
import { PenTool } from "lucide-react";

export default function BlogPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-titanium-950 w-full relative z-10 h-full flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md px-6">
        <div className="w-20 h-20 bg-titanium-900 rounded-2xl flex items-center justify-center mx-auto border border-titanium-800 rotate-12">
          <PenTool size={32} className="text-titanium-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-white">Writers at Work</h1>
        <p className="text-titanium-400 leading-relaxed">
          There are currently no blog posts. Our engineering team is heads-down shipping features. 
          Technical deep-dives and release notes will appear here soon.
        </p>
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-titanium-900 border border-titanium-800 text-xs text-titanium-500">
          Status: Drafting content...
        </div>
      </div>
    </div>
  );
}