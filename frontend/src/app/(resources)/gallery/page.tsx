"use client";

import React from "react";
import { ExternalLink, BookOpen, Star, Library } from "lucide-react";
import { motion } from "framer-motion";

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

export default function GalleryPage() {
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
             Click to open and paste the URL into the chat to start learning.
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
               className="group relative bg-titanium-900 border border-titanium-800 rounded-2xl overflow-hidden hover:border-titanium-600 transition-all duration-300 shadow-xl"
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

                   <a 
                     href={site.url} 
                     target="_blank" 
                     className="w-full flex items-center justify-center gap-2 bg-titanium-950 hover:bg-white hover:text-black border border-titanium-700 text-white py-2.5 rounded-xl text-sm font-medium transition-all group-active:scale-[0.98]"
                   >
                     View Documentation <ExternalLink size={14} />
                   </a>
                </div>
             </motion.div>
           ))}
        </div>

      </div>
    </div>
  );
}