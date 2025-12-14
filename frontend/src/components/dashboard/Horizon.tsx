import React from "react";

export default function Horizon() {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-[40vh] pointer-events-none z-0 flex justify-center overflow-hidden">
      {/* The Glow Curve */}
      <div className="w-[150%] h-full bg-blue-600/10 blur-[100px] rounded-[100%] translate-y-1/2"></div>
      
      {/* The Sharp Line */}
      <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
    </div>
  );
}