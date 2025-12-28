"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ExternalLink,
  Star,
  Library,
  Copy,
  MessageSquare,
  X,
  Search,
  Database,
  Server,
  Code2,
  Cloud,
  Brain,
  Terminal,
  Layout,
  Box,
  Smartphone,
  Globe,
  Shield,
  Activity,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

// --- 1. THE "REAL" HIGH QUALITY DATA (Top 30) ---
const REAL_DOCS = [
  {
    title: "Next.js 14",
    desc: "The React Framework for the Web. App Router & Server Actions.",
    url: "https://nextjs.org/docs",
    color: "from-black to-zinc-900",
    likes: 1242,
    tag: "Framework",
  },
  {
    title: "React",
    desc: "The library for web and native user interfaces.",
    url: "https://react.dev/",
    color: "from-blue-900/40 to-cyan-900/40",
    likes: 1150,
    tag: "Frontend",
  },
  {
    title: "Tailwind CSS",
    desc: "Rapidly build modern websites without leaving HTML.",
    url: "https://tailwindcss.com/docs",
    color: "from-cyan-900/40 to-blue-900/40",
    likes: 990,
    tag: "Styling",
  },
  {
    title: "Rust",
    desc: "A language empowering everyone to build reliable software.",
    url: "https://doc.rust-lang.org/book/",
    color: "from-orange-900/40 to-red-900/40",
    likes: 915,
    tag: "System",
  },
  {
    title: "Python 3.12",
    desc: "The official documentation for the Python language.",
    url: "https://docs.python.org/3/",
    color: "from-yellow-900/20 to-blue-900/20",
    likes: 930,
    tag: "Language",
  },
  {
    title: "Docker",
    desc: "Develop, ship, and run applications anywhere.",
    url: "https://docs.docker.com/",
    color: "from-blue-900/40 to-sky-900/40",
    likes: 880,
    tag: "DevOps",
  },
  {
    title: "Kubernetes",
    desc: "Production-Grade Container Orchestration.",
    url: "https://kubernetes.io/docs/home/",
    color: "from-blue-800/40 to-indigo-900/40",
    likes: 850,
    tag: "DevOps",
  },
  {
    title: "OpenAI API",
    desc: "Documentation for GPT-4, Embeddings, and DALL-E.",
    url: "https://platform.openai.com/docs/",
    color: "from-teal-900/30 to-emerald-900/30",
    likes: 1500,
    tag: "AI",
  },
  {
    title: "PostgreSQL",
    desc: "The World's Most Advanced Open Source Relational Database.",
    url: "https://www.postgresql.org/docs/",
    color: "from-blue-900/40 to-slate-900/40",
    likes: 870,
    tag: "Database",
  },
  {
    title: "AWS Docs",
    desc: "Comprehensive documentation for Amazon Web Services.",
    url: "https://docs.aws.amazon.com/",
    color: "from-orange-900/30 to-yellow-900/30",
    likes: 810,
    tag: "Cloud",
  },
  {
    title: "Stripe API",
    desc: "Financial infrastructure for the internet.",
    url: "https://stripe.com/docs/api",
    color: "from-indigo-900/40 to-purple-900/40",
    likes: 760,
    tag: "API",
  },
  {
    title: "Redis",
    desc: "The open source, in-memory data store.",
    url: "https://redis.io/docs/",
    color: "from-red-900/40 to-red-950",
    likes: 680,
    tag: "Database",
  },
  {
    title: "TensorFlow",
    desc: "An end-to-end open source machine learning platform.",
    url: "https://www.tensorflow.org/",
    color: "from-orange-700/30 to-yellow-700/30",
    likes: 640,
    tag: "AI",
  },
  {
    title: "Linux Kernel",
    desc: "The Linux Kernel documentation.",
    url: "https://www.kernel.org/doc/html/latest/",
    color: "from-yellow-900/10 to-stone-900",
    likes: 950,
    tag: "System",
  },
  {
    title: "GraphQL",
    desc: "A query language for your API.",
    url: "https://graphql.org/learn/",
    color: "from-pink-900/30 to-rose-900/30",
    likes: 720,
    tag: "API",
  },
  {
    title: "Prisma",
    desc: "Next-generation Node.js and TypeScript ORM.",
    url: "https://www.prisma.io/docs",
    color: "from-slate-900 to-indigo-950",
    likes: 790,
    tag: "Database",
  },
  {
    title: "Supabase",
    desc: "The Open Source Firebase Alternative.",
    url: "https://supabase.com/docs",
    color: "from-emerald-900/40 to-teal-900/40",
    likes: 840,
    tag: "Database",
  },
  {
    title: "Vercel",
    desc: "Develop. Preview. Ship. The frontend cloud.",
    url: "https://vercel.com/docs",
    color: "from-black to-zinc-900",
    likes: 760,
    tag: "Cloud",
  },
  {
    title: "Android Dev",
    desc: "Modern tools and resources to build apps for Android.",
    url: "https://developer.android.com/",
    color: "from-green-900/40 to-emerald-900/40",
    likes: 690,
    tag: "Mobile",
  },
  {
    title: "Apple Developer",
    desc: "Documentation for building on iOS, iPadOS, and macOS.",
    url: "https://developer.apple.com/documentation/",
    color: "from-blue-900/20 to-gray-900/20",
    likes: 710,
    tag: "Mobile",
  },
];

// --- 2. GENERATOR FOR THE REMAINING 1000+ ITEMS ---
// This runs once on mount to create a massive dataset without bloating the file size.
const generateMegaDataset = () => {
  const categories = [
    "Frontend",
    "Backend",
    "AI",
    "Cloud",
    "DevOps",
    "Security",
    "Mobile",
    "Data",
    "System",
    "API",
  ];
  const prefixes = [
    "Turbo",
    "Hyper",
    "Open",
    "Deep",
    "Meta",
    "Giga",
    "Micro",
    "Rapid",
    "Flow",
    "Net",
    "Py",
    "Go",
    "Re",
    "Next",
    "Iron",
    "Cyber",
  ];
  const roots = [
    "Stack",
    "Graph",
    "Hub",
    "Lab",
    "UI",
    "DB",
    "Mesh",
    "Grid",
    "Core",
    "Base",
    "Scale",
    "Sync",
    "Stream",
    "Sphere",
    "Vault",
    "Link",
  ];
  const suffixes = [
    "JS",
    "Native",
    "Ops",
    "Flow",
    "Query",
    "Script",
    "Learn",
    "Kit",
    "SDK",
    "Engine",
  ];

  const gradients = [
    "from-blue-900/20 to-cyan-900/20",
    "from-purple-900/20 to-pink-900/20",
    "from-orange-900/20 to-red-900/20",
    "from-green-900/20 to-emerald-900/20",
    "from-zinc-900 to-stone-900",
    "from-indigo-900/20 to-violet-900/20",
  ];

  const generated = [];

  // Generate 1200 items
  for (let i = 0; i < 1200; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const color = gradients[Math.floor(Math.random() * gradients.length)];
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const r = roots[Math.floor(Math.random() * roots.length)];
    const s =
      Math.random() > 0.5
        ? suffixes[Math.floor(Math.random() * suffixes.length)]
        : "";
    const version = (Math.random() * 10).toFixed(1);

    const title = `${p}${r}${s ? " " + s : ""} v${version}`;
    const likes = Math.floor(Math.random() * 800) + 50;

    generated.push({
      title,
      desc: `High-performance ${category.toLowerCase()} library for scalable applications. Includes comprehensive guides for v${version}.`,
      url: `https://example.com/docs/${title.toLowerCase().replace(/\s/g, "-")}`,
      color,
      likes,
      likes,
      tag: category,
      id: `gen-${i}`,
    });
  }

  return [...REAL_DOCS, ...generated];
};

// --- HELPER COMPONENTS ---

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
    case "Mobile":
      return <Smartphone size={20} className="text-white" />;
    case "API":
      return <Globe size={20} className="text-white" />;
    case "Security":
      return <Shield size={20} className="text-white" />;
    default:
      return <Box size={20} className="text-white" />;
  }
};

export default function MegaGalleryPage() {
  const router = useRouter();
  const [allDocs, setAllDocs] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // PAGINATION STATE (To handle 1000 items smoothly)
  const [visibleCount, setVisibleCount] = useState(48);

  // Initialize data on client only
  useEffect(() => {
    setAllDocs(generateMegaDataset());
  }, []);

  // UPDATED: Logic to ensure "All" is always first
  const categories = useMemo(() => {
    // Get unique tags
    const tags = Array.from(new Set(allDocs.map((site) => site.tag)));
    // Sort them alphabetically
    tags.sort();
    // Prepend "All"
    return ["All", ...tags];
  }, [allDocs]);

  // Efficient Filtering
  const filteredDocs = useMemo(() => {
    return allDocs.filter((site) => {
      const matchesSearch =
        site.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === "All" || site.tag === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [allDocs, searchQuery, activeFilter]);

  // Handle Load More
  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 48, filteredDocs.length));
  };

  const handleCardClick = (site: any) => {
    navigator.clipboard.writeText(site.url);
    setSelectedDoc(site);
  };

  const handleConfirmChat = () => {
    if (!selectedDoc) return;
    const prompt = `Hello! Please analyze the ${selectedDoc.title} documentation at ${selectedDoc.url} and give me a comprehensive introduction.`;
    router.push(`/?autoUrl=${encodeURIComponent(prompt)}`);
  };

  // Reset pagination when search/filter changes
  useEffect(() => {
    setVisibleCount(48);
  }, [searchQuery, activeFilter]);

  return (
    <div className="flex-1 overflow-y-auto   bg-titanium-950 w-full relative z-10 h-full">
      <div className="max-w-[1600px] mx-auto px-6 py-12 font-sans min-h-screen flex flex-col">
        {/* Sticky Header Section */}
        <div className="sticky top-0 z-30 bg-titanium-950/95 backdrop-blur-xl pb-6 pt-4 -mx-6 px-6 border-b border-white/5 mb-8 shadow-2xl">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-titanium-900 border border-titanium-800 text-titanium-400 text-xs font-medium mb-3">
                <Library size={14} />
                <span>Reference Library</span>
              </div>
              <h1 className="text-3xl font-bold text-white">
                Documentation Hub
                <span className="text-titanium-600 ml-3 text-lg font-normal">
                  {allDocs.length > 0
                    ? `${filteredDocs.length.toLocaleString()} Sources`
                    : "Loading..."}
                </span>
              </h1>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full xl:w-96">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-titanium-500"
                size={18}
              />
              <input
                type="text"
                placeholder="Search 1,200+ docs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-titanium-900 border border-titanium-800 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-titanium-600"
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
            <div className="w-full xl:w-auto overflow-x-auto no-scrollbar flex gap-2 pb-1 mask-linear-fade">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  // UPDATED: Added cursor-pointer to the class list
                  className={`cursor-pointer px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all border ${
                    activeFilter === cat
                      ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
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
        {allDocs.length === 0 ? (
          <div className="h-96 flex items-center justify-center text-titanium-500 animate-pulse">
            Loading Library...
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="flex cursor-pointer flex-col items-center justify-center py-20 text-titanium-500">
            <Search size={48} className="mb-4 opacity-20" />
            <p>No documentation found for "{searchQuery}"</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("All");
              }}
              className="mt-4 text-blue-400 cursor-pointer hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid cursor-pointer grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {filteredDocs.slice(0, visibleCount).map((site, i) => (
                <motion.div
                  key={site.id || site.title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => handleCardClick(site)}
                  className="group relative bg-titanium-900 border border-titanium-800 rounded-xl overflow-hidden hover:border-titanium-600 transition-all duration-200 shadow-sm cursor-pointer hover:shadow-xl hover:-translate-y-0.5"
                >
                  {/* Compact Header */}
                  <div
                    className={`h-20 w-full bg-gradient-to-br ${site.color} relative p-3 flex justify-between items-start opacity-80 group-hover:opacity-100 transition-opacity`}
                  >
                    <span className="px-1.5 py-0.5 bg-black/40 backdrop-blur-md rounded text-[10px] text-white font-medium border border-white/10 tracking-wide">
                      {site.tag}
                    </span>
                    <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded-full text-[10px] text-white">
                      <Star size={8} className="fill-white" /> {site.likes}
                    </div>
                  </div>

                  {/* Icon Overlap - Slightly smaller for density */}
                  <div className="absolute top-14 left-3 w-10 h-10 rounded-lg bg-titanium-800 border-2 border-titanium-900 flex items-center justify-center shadow-lg z-10">
                    {getIcon(site.tag)}
                  </div>

                  {/* Content */}
                  <div className="pt-6 pb-3 px-3">
                    <h3 className="text-base font-bold text-white mb-1 group-hover:text-blue-400 transition-colors truncate pr-2">
                      {site.title}
                    </h3>
                    <p className="text-[11px] text-titanium-400 leading-relaxed mb-3 h-8 line-clamp-2">
                      {site.desc}
                    </p>

                    <div className="flex items-center gap-1 text-[10px] font-medium text-titanium-600 group-hover:text-titanium-300 transition-colors border-t border-titanium-800 pt-2">
                      <span className="flex-1 truncate uppercase tracking-wider">
                        docs/{site.tag.toLowerCase()}
                      </span>
                      <ExternalLink size={10} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Load More Trigger */}
            {visibleCount < filteredDocs.length && (
              <div className="flex justify-center mt-12 mb-8">
                <button
                  onClick={handleLoadMore}
                  className="group cursor-pointer flex items-center gap-2 px-8 py-3 bg-titanium-900 border border-titanium-800 hover:bg-titanium-800 text-white rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg"
                >
                  <span>
                    Load More ({filteredDocs.length - visibleCount} remaining)
                  </span>
                  <ChevronDown
                    size={16}
                    className="group-hover:translate-y-1 transition-transform"
                  />
                </button>
              </div>
            )}

            <div className="text-center text-titanium-600 text-xs mt-4 mb-12">
              Showing {Math.min(visibleCount, filteredDocs.length)} of{" "}
              {filteredDocs.length} resources
            </div>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {selectedDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 "
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
                    {selectedDoc.tag} Documentation
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
