"use client";

import React, { useState, useMemo } from "react";
import {
  ExternalLink,
  BookOpen,
  Star,
  Library,
  Copy,
  MessageSquare,
  X,
  Search,
  Database,
  Server,
  Code2,
  Cpu,
  Cloud,
  Brain,
  Terminal,
  Layout,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

// --- EXPANDED DATASET (Sample of 50+ items to demonstrate scale) ---
// In a real app, move this to a separate data.ts or JSON file.
const DOC_SITES = [
  // FRONTEND & FRAMEWORKS
  {
    title: "Next.js",
    desc: "The React Framework for the Web. App Router & Server Actions.",
    url: "https://nextjs.org/docs",
    color: "from-black to-zinc-900",
    likes: 982,
    tag: "Framework",
  },
  {
    title: "React",
    desc: "The library for web and native user interfaces.",
    url: "https://react.dev/",
    color: "from-blue-900/40 to-cyan-900/40",
    likes: 950,
    tag: "Frontend",
  },
  {
    title: "Vue.js",
    desc: "The Progressive JavaScript Framework.",
    url: "https://vuejs.org/guide/introduction.html",
    color: "from-emerald-900/40 to-green-900/40",
    likes: 720,
    tag: "Frontend",
  },
  {
    title: "Svelte",
    desc: "Cybernetically enhanced web apps.",
    url: "https://svelte.dev/docs",
    color: "from-orange-900/40 to-red-900/40",
    likes: 640,
    tag: "Frontend",
  },
  {
    title: "Tailwind CSS",
    desc: "Rapidly build modern websites without leaving HTML.",
    url: "https://tailwindcss.com/docs",
    color: "from-cyan-900/40 to-blue-900/40",
    likes: 890,
    tag: "Styling",
  },
  {
    title: "Framer Motion",
    desc: "Production-ready motion library for React.",
    url: "https://www.framer.com/motion/",
    color: "from-purple-900/40 to-pink-900/40",
    likes: 550,
    tag: "Animation",
  },
  {
    title: "Astro",
    desc: "The web framework for content-driven websites.",
    url: "https://docs.astro.build/",
    color: "from-orange-600/20 to-purple-900/40",
    likes: 430,
    tag: "Framework",
  },
  {
    title: "Remix",
    desc: "Full stack web framework with web standards.",
    url: "https://remix.run/docs",
    color: "from-blue-800/30 to-indigo-900/40",
    likes: 310,
    tag: "Framework",
  },
  {
    title: "Shadcn UI",
    desc: "Beautifully designed components built with Radix UI.",
    url: "https://ui.shadcn.com/docs",
    color: "from-zinc-900 to-black",
    likes: 880,
    tag: "UI Lib",
  },

  // BACKEND & LANGUAGES
  {
    title: "Node.js",
    desc: "JavaScript runtime built on Chrome's V8 engine.",
    url: "https://nodejs.org/en/docs/",
    color: "from-green-900/40 to-emerald-900/40",
    likes: 820,
    tag: "Backend",
  },
  {
    title: "Python 3.12",
    desc: "The official Python programming language docs.",
    url: "https://docs.python.org/3/",
    color: "from-yellow-900/20 to-blue-900/20",
    likes: 930,
    tag: "Language",
  },
  {
    title: "Rust",
    desc: "A language for reliable and efficient software.",
    url: "https://doc.rust-lang.org/book/",
    color: "from-orange-900/40 to-red-900/40",
    likes: 715,
    tag: "System",
  },
  {
    title: "Go (Golang)",
    desc: "Build simple, reliable, and efficient software.",
    url: "https://go.dev/doc/",
    color: "from-cyan-900/40 to-sky-900/40",
    likes: 600,
    tag: "System",
  },
  {
    title: "Django",
    desc: "The web framework for perfectionists with deadlines.",
    url: "https://docs.djangoproject.com/",
    color: "from-green-950 to-emerald-900/40",
    likes: 450,
    tag: "Backend",
  },
  {
    title: "FastAPI",
    desc: "High performance, easy to learn, fast to code.",
    url: "https://fastapi.tiangolo.com/",
    color: "from-teal-900/40 to-green-900/40",
    likes: 580,
    tag: "Backend",
  },
  {
    title: "NestJS",
    desc: "A progressive Node.js framework for efficient server-side apps.",
    url: "https://docs.nestjs.com/",
    color: "from-red-900/40 to-rose-900/40",
    likes: 410,
    tag: "Backend",
  },

  // DATABASES
  {
    title: "PostgreSQL",
    desc: "The World's Most Advanced Open Source Relational Database.",
    url: "https://www.postgresql.org/docs/",
    color: "from-blue-900/40 to-slate-900/40",
    likes: 670,
    tag: "Database",
  },
  {
    title: "MongoDB",
    desc: "The application data platform (NoSQL).",
    url: "https://www.mongodb.com/docs/",
    color: "from-green-900/30 to-lime-900/30",
    likes: 520,
    tag: "Database",
  },
  {
    title: "Prisma",
    desc: "Next-generation Node.js and TypeScript ORM.",
    url: "https://www.prisma.io/docs",
    color: "from-slate-900 to-indigo-950",
    likes: 690,
    tag: "Database",
  },
  {
    title: "Supabase",
    desc: "The Open Source Firebase Alternative.",
    url: "https://supabase.com/docs",
    color: "from-emerald-900/40 to-teal-900/40",
    likes: 740,
    tag: "Database",
  },
  {
    title: "Redis",
    desc: "The open source, in-memory data store.",
    url: "https://redis.io/docs/",
    color: "from-red-900/40 to-red-950",
    likes: 480,
    tag: "Database",
  },

  // AI & ML
  {
    title: "OpenAI API",
    desc: "Documentation for GPT-4, Embeddings, and DALL-E.",
    url: "https://platform.openai.com/docs/introduction",
    color: "from-teal-900/30 to-emerald-900/30",
    likes: 910,
    tag: "AI",
  },
  {
    title: "LangChain",
    desc: "Building applications with LLMs through composability.",
    url: "https://js.langchain.com/docs/",
    color: "from-yellow-900/20 to-orange-900/20",
    likes: 650,
    tag: "AI",
  },
  {
    title: "Hugging Face",
    desc: "The platform where the machine learning community collaborates.",
    url: "https://huggingface.co/docs",
    color: "from-yellow-600/20 to-yellow-900/40",
    likes: 620,
    tag: "AI",
  },
  {
    title: "PyTorch",
    desc: "An open source machine learning framework.",
    url: "https://pytorch.org/docs/stable/index.html",
    color: "from-orange-900/40 to-red-900/40",
    likes: 580,
    tag: "AI",
  },
  {
    title: "TensorFlow",
    desc: "An end-to-end open source machine learning platform.",
    url: "https://www.tensorflow.org/learn",
    color: "from-orange-700/30 to-yellow-700/30",
    likes: 540,
    tag: "AI",
  },

  // DEVOPS & INFRA
  {
    title: "Docker",
    desc: "Develop, ship, and run applications anywhere.",
    url: "https://docs.docker.com/",
    color: "from-blue-900/40 to-sky-900/40",
    likes: 780,
    tag: "DevOps",
  },
  {
    title: "Kubernetes",
    desc: "Production-Grade Container Orchestration.",
    url: "https://kubernetes.io/docs/home/",
    color: "from-blue-800/40 to-indigo-900/40",
    likes: 690,
    tag: "DevOps",
  },
  {
    title: "AWS Docs",
    desc: "Comprehensive documentation for Amazon Web Services.",
    url: "https://docs.aws.amazon.com/",
    color: "from-orange-900/30 to-yellow-900/30",
    likes: 710,
    tag: "Cloud",
  },
  {
    title: "Vercel",
    desc: "Develop. Preview. Ship. The frontend cloud.",
    url: "https://vercel.com/docs",
    color: "from-black to-zinc-900",
    likes: 660,
    tag: "Cloud",
  },
  {
    title: "Terraform",
    desc: "Automate infrastructure on any cloud.",
    url: "https://developer.hashicorp.com/terraform/docs",
    color: "from-purple-900/40 to-indigo-900/40",
    likes: 420,
    tag: "DevOps",
  },
  {
    title: "Linux (Arch)",
    desc: "Arch Linux documentation and wiki.",
    url: "https://wiki.archlinux.org/",
    color: "from-blue-900/20 to-cyan-900/20",
    likes: 850,
    tag: "System",
  },
];

// Helper to determine icon based on tag
const getIcon = (tag: string) => {
  switch (tag) {
    case "AI":
      return <Brain size={20} className="text-white" />;
    case "Database":
      return <Database size={20} className="text-white" />;
    case "DevOps":
      return <Server size={20} className="text-white" />;
    case "Cloud":
      return <Cloud size={20} className="text-white" />;
    case "System":
      return <Terminal size={20} className="text-white" />;
    case "Language":
      return <Code2 size={20} className="text-white" />;
    case "Styling":
      return <Layout size={20} className="text-white" />;
    default:
      return <BookOpen size={20} className="text-white" />;
  }
};

export default function GalleryPage() {
  const router = useRouter();
  const [selectedDoc, setSelectedDoc] = useState<(typeof DOC_SITES)[0] | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const categories = [
    "All",
    ...Array.from(new Set(DOC_SITES.map((site) => site.tag))),
  ];

  // Efficient Filtering
  const filteredDocs = useMemo(() => {
    return DOC_SITES.filter((site) => {
      const matchesSearch =
        site.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === "All" || site.tag === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, activeFilter]);

  const handleCardClick = (site: (typeof DOC_SITES)[0]) => {
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
      <div className="max-w-7xl mx-auto px-6 py-12 font-sans min-h-screen flex flex-col">
        {/* Sticky Header Section */}
        <div className="sticky top-0 z-30 bg-titanium-950/80 backdrop-blur-xl pb-6 pt-4 -mx-6 px-6 border-b border-white/5 mb-8">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-titanium-900 border border-titanium-800 text-titanium-400 text-xs font-medium mb-3">
              <Library size={14} />
              <span>Reference Library ({DOC_SITES.length} Sources)</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Documentation Hub</h1>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full md:w-96">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-titanium-500"
                size={18}
              />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-titanium-900 border border-titanium-800 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-titanium-600"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-titanium-500 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Categories Scrollable Row */}
            <div className="w-full md:w-auto overflow-x-auto no-scrollbar flex gap-2 pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border ${
                    activeFilter === cat
                      ? "bg-white text-black border-white"
                      : "bg-titanium-900 text-titanium-400 border-titanium-800 hover:border-titanium-600 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid Content */}
        {filteredDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-titanium-500">
            <Search size={48} className="mb-4 opacity-20" />
            <p>No documentation found for "{searchQuery}"</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("All");
              }}
              className="mt-4 text-blue-400 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredDocs.map((site, i) => (
              <motion.div
                key={site.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.5) }} // Cap delay for large lists
                onClick={() => handleCardClick(site)}
                className="group relative bg-titanium-900 border border-titanium-800 rounded-2xl overflow-hidden hover:border-titanium-600 transition-all duration-300 shadow-lg cursor-pointer hover:-translate-y-1"
              >
                {/* Compact Header for Denser Grid */}
                <div
                  className={`h-24 w-full bg-gradient-to-br ${site.color} relative p-4 flex flex-col justify-between`}
                >
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 bg-black/30 backdrop-blur-md rounded-md text-[10px] text-white font-medium border border-white/10 tracking-wider">
                      {site.tag}
                    </span>
                    <div className="flex items-center gap-1 bg-black/30 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-white">
                      <Star size={10} className="fill-white" /> {site.likes}
                    </div>
                  </div>
                </div>

                {/* Icon Overlap */}
                <div className="absolute top-16 left-4 w-12 h-12 rounded-xl bg-titanium-800 border-4 border-titanium-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  {getIcon(site.tag)}
                </div>

                {/* Content */}
                <div className="pt-8 pb-4 px-4">
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors truncate">
                    {site.title}
                  </h3>
                  <p className="text-xs text-titanium-400 leading-relaxed mb-4 h-8 line-clamp-2">
                    {site.desc}
                  </p>

                  <div className="flex items-center gap-2 text-xs font-medium text-titanium-500 group-hover:text-white transition-colors border-t border-titanium-800 pt-3">
                    <span className="flex-1">View Docs</span>{" "}
                    <ExternalLink size={12} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal (Same as before but cleaner) */}
      <AnimatePresence>
        {selectedDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedDoc(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-titanium-900 border border-titanium-700 rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedDoc(null)}
                className="absolute top-4 right-4 text-titanium-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center gap-4">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedDoc.color} flex items-center justify-center shadow-inner`}
                >
                  {getIcon(selectedDoc.tag)}
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white">
                    {selectedDoc.title}
                  </h2>
                  <p className="text-titanium-400 text-sm mt-1">
                    Ready to analyze documentation
                  </p>
                </div>

                <div className="bg-black/40 rounded-lg p-3 w-full border border-white/5 flex items-center justify-between gap-3">
                  <code className="text-xs text-blue-400 truncate flex-1 text-left font-mono">
                    {selectedDoc.url}
                  </code>
                  <div className="flex items-center gap-1 text-[10px] text-green-500 uppercase font-bold tracking-wider">
                    <Copy size={10} /> Copied
                  </div>
                </div>

                <div className="flex gap-3 w-full mt-2">
                  <button
                    onClick={() => setSelectedDoc(null)}
                    className="flex-1 py-2.5 rounded-xl bg-titanium-950 border border-titanium-800 text-titanium-400 hover:bg-titanium-800 hover:text-white transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmChat}
                    className="flex-1 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black transition-colors text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={16} /> Start Chat
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
