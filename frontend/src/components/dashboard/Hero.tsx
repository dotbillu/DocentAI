import React from "react";

export default function Hero() {
  return (
    <div className="flex flex-col items-center text-center mt-24 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 className="font-rasa text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
        Master any <span className="text-blue-400">documentation</span> instantly.
      </h1>
      <p className="text-titanium-400 text-lg md:text-xl font-sans max-w-2xl">
        Turn complex docs into intelligent conversations. Just drop a link and start asking.
      </p>
    </div>
  );
}
