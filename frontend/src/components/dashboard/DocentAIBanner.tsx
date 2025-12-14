import { Sparkles } from "lucide-react";

export default function DecentAIBanner() {
  return (
    <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-titanium-800/40 border border-titanium-700/50 shadow-lg backdrop-blur-md hover:bg-titanium-800/60 transition-colors cursor-pointer group">
        <span className="text-titanium-100 group-hover:text-white transition-colors">
           <Sparkles size={14} className="fill-titanium-100/20" /> 
        </span>
        <span className="text-xs font-medium text-titanium-300">
          Introducing <span className="text-white font-semibold ml-1">Decent AI</span>
        </span>
      </div>
    </div>
  );
}
