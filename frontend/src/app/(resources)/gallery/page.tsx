"use client";

import React, { useState } from "react";
import { ExternalLink, BookOpen, Star, Library, Copy, MessageSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

//DOC_SITEs {{{
const DOC_SITES = [
  {
    title: "Next.js Documentation",
    desc: "The React Framework for the Web. Master App Router and Server Actions.",
    url: "https://nextjs.org/docs",
    color: "from-black to-zinc-900",
    likes: 842,
    tag: "Framework"
  },
  {
    title: "Tailwind CSS",
    desc: "Rapidly build modern websites without ever leaving your HTML.",
    url: "https://tailwindcss.com/docs",
    color: "from-cyan-900/40 to-blue-900/40",
    likes: 620,
    tag: "Styling"
  },
  {
    title: "Rust Language",
    desc: "A language empowering everyone to build reliable and efficient software.",
    url: "https://doc.rust-lang.org/book/",
    color: "from-orange-900/40 to-red-900/40",
    likes: 515,
    tag: "Systems"
  },
  {
    title: "Python 3.12",
    desc: "The official documentation for the Python programming language.",
    url: "https://docs.python.org/3/",
    color: "from-yellow-900/20 to-blue-900/20",
    likes: 930,
    tag: "Backend"
  },
  {
    title: "Docker Docs",
    desc: "Develop, ship, and run applications anywhere with containerization.",
    url: "https://docs.docker.com/",
    color: "from-blue-900/40 to-sky-900/40",
    likes: 410,
    tag: "DevOps"
  },
  {
    title: "React.js",
    desc: "The library for web and native user interfaces. Learn hooks and components.",
    url: "https://react.dev/",
    color: "from-blue-900/20 to-cyan-900/20",
    likes: 780,
    tag: "Frontend"
  }
];

//}}}
export default function GalleryPage() {
  const router = useRouter();
  const [selectedDoc, setSelectedDoc] = useState<typeof DOC_SITES[0] | null>(null);

  const handleCardClick = (site: typeof DOC_SITES[0]) => {
    navigator.clipboard.writeText(site.url);
    setSelectedDoc(site);
  };

  const handleConfirmChat = () => {
    if (!selectedDoc) return;
    const prompt = `Hello! Please analyze the ${selectedDoc.title} documentation at ${selectedDoc.url} and give me a comprehensive introduction.`;
    router.push(`/?autoUrl=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-titanium-950 w-full relative z-10 h-full">
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 font-sans">
        {/* Header */}
        <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-titanium-900 border border-titanium-800 text-titanium-400 text-xs font-medium mb-4">
             <Library size={14} />
             <span>Reference Library</span>
           </div>
           <h1 className="text-4xl font-bold text-white mb-4">Documentation Library</h1>
           <p className="text-titanium-400 max-w-2xl">
             Curated high-quality documentation sources optimized for reading with Docent AI. 
             Click to copy the link and instantly start a chat session.
           </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
           {DOC_SITES.map((site, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               onClick={() => handleCardClick(site)}
               className="group relative bg-titanium-900 border border-titanium-800 rounded-2xl overflow-hidden hover:border-titanium-600 transition-all duration-300 shadow-xl cursor-pointer hover:-translate-y-1"
             >
               {/* Card Gradient Header */}
               <div className={`h-32 w-full bg-linear-to-br ${site.color} relative p-4 flex flex-col justify-between`}>
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-1 bg-black/30 backdrop-blur-md rounded-md text-[10px] text-white font-medium border border-white/10 uppercase tracking-wider">
                      {site.tag}
                    </span>
                    <div className="flex items-center gap-1 bg-black/30 backdrop-blur-md px-2 py-1 rounded-full text-xs text-white">
                        <Star size={12} className="fill-white" /> {site.likes}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <BookOpen size={20} className="text-white" />
                  </div>
               </div>

               {/* Card Content */}
               <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {site.title}
                  </h3>
                  <p className="text-sm text-titanium-400 leading-relaxed mb-6 h-10 line-clamp-2">
                    {site.desc}
                  </p>

                  {/* Changed from <a> to <button> for visual feedback */}
                  <button 
                    className="w-full flex items-center justify-center gap-2 bg-titanium-950 hover:bg-white hover:text-black border border-titanium-700 text-white py-2.5 rounded-xl text-sm font-medium transition-all group-active:scale-[0.98]"
                  >
                    Select Source <ExternalLink size={14} />
                  </button>
               </div>
             </motion.div>
           ))}
        </div>

      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {selectedDoc && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-titanium-900 border border-titanium-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
            >
               <button 
                 onClick={(e) => { e.stopPropagation(); setSelectedDoc(null); }} 
                 className="absolute top-4 right-4 text-titanium-500 hover:text-white transition-colors"
               >
                 <X size={20} />
               </button>

               <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 mb-2 border border-blue-500/20">
                     <Copy size={32} />
                  </div>
                  
                  <h2 className="text-xl font-bold text-white">Link Copied!</h2>
                  <p className="text-titanium-400 text-sm">
                    I have copied <span className="text-white font-mono bg-titanium-800 px-1.5 py-0.5 rounded text-xs">{selectedDoc.url}</span> to your clipboard.
                    <br/>
                    Would you like to open this directly in the chat?
                  </p>

                  <div className="flex gap-3 w-full mt-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedDoc(null); }}
                      className="flex-1 py-3 rounded-xl bg-titanium-950 border border-titanium-800 text-titanium-400 hover:bg-titanium-800 hover:text-white transition-colors font-medium"
                    >
                      No, thanks
                    </button>
                    <button 
                      onClick={handleConfirmChat}
                      className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                    >
                      <MessageSquare size={18} /> Start Chat
                    </button>
                  </div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
