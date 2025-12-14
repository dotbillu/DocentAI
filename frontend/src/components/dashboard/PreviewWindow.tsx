import React from "react";
import { RotateCcw, ChevronLeft, ChevronRight, Lock } from "lucide-react";

export default function PreviewWindow() {
  return (
    <div className="flex flex-col h-full bg-white text-black">
      {/* Browser Address Bar */}
      <div className="h-10 bg-gray-100 border-b border-gray-200 flex items-center px-2 gap-2">
        <div className="flex gap-1 text-gray-400">
          <ChevronLeft size={16} />
          <ChevronRight size={16} />
          <RotateCcw size={14} className="hover:text-black cursor-pointer" />
        </div>
        
        {/* URL Input */}
        <div className="flex-1 bg-white border border-gray-300 rounded-md h-7 flex items-center px-3 text-xs text-gray-600 gap-2">
           <Lock size={10} className="text-green-600" />
           <span>localhost:3000</span>
        </div>
      </div>

      {/* Content Area (Iframe Placeholder) */}
      <div className="flex-1 bg-white relative overflow-hidden">
        {/* We use a simple div here, but in a real app this would be an iframe */}
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-10 animate-in fade-in zoom-in duration-500">
           <h1 className="text-4xl font-bold text-gray-900 mb-4">Hello World</h1>
           <p className="text-gray-500 max-w-md">
             This is a live preview of your generated application. The code you see in the editor is being rendered here.
           </p>
           <button className="mt-8 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors">
             Click Me
           </button>
        </div>
      </div>
    </div>
  );
}