"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Disc } from "lucide-react"; 
import clsx from "clsx";

// FIXED IMPORTS (Relative Paths)
import { RESOURCES_MENU } from "../../lib/constants";
import Button from "../ui/Button";
import { LinkedInIcon, XIcon } from "../ui/SocialIcons";

export default function Navbar() {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="fixed top-0 w-full z-50 border-b border-titanium-800/50 bg-titanium-950/80 backdrop-blur-md">
      <div className="w-full px-6 h-16 flex items-center justify-between font-sans relative">
        
        {/* 1. LEFT: Logo */}
        <div className="flex items-center z-20">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-white">
            Decent<span className="text-titanium-400"> AI</span>
          </Link>
        </div>

        {/* 2. CENTER: Navigation */}
        <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-6 text-sm font-medium text-titanium-400">
          <Link 
            href="/community" 
            className={clsx("transition-colors", isActive("/community") ? "text-white" : "hover:text-titanium-100")}
          >
            Community
          </Link>
          
          <Link 
            href="/enterprise" 
            className={clsx("transition-colors", isActive("/enterprise") ? "text-white" : "hover:text-titanium-100")}
          >
            Enterprise
          </Link>
          
          {/* Resources Dropdown */}
          <div 
            className="relative h-16 flex items-center"
            onMouseEnter={() => setHoveredTab("resources")}
            onMouseLeave={() => setHoveredTab(null)}
          >
            <button 
              className={clsx(
                "flex items-center gap-1 transition-colors outline-none",
                hoveredTab === "resources" ? "text-titanium-100" : "hover:text-titanium-100"
              )}
            >
              Resources <ChevronDown size={14} className={clsx("transition-transform duration-200", hoveredTab === "resources" && "rotate-180")} />
            </button>

            <AnimatePresence>
              {hoveredTab === "resources" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 w-[600px] p-6 bg-titanium-900 border border-titanium-700 rounded-xl shadow-2xl grid grid-cols-2 gap-8 z-50"
                >
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-titanium-400 uppercase tracking-wider mb-3">Resources</h4>
                    {RESOURCES_MENU.resources.map((item) => (
                      <Link key={item.title} href={item.href} className="flex items-center gap-3 group p-2 rounded-lg hover:bg-titanium-800 transition-colors">
                        <item.icon size={18} className="text-titanium-400 group-hover:text-titanium-100" />
                        <span className="text-titanium-100 group-hover:text-white transition-colors text-sm font-medium">{item.title}</span>
                      </Link>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-titanium-400 uppercase tracking-wider mb-3">Community</h4>
                    {RESOURCES_MENU.community.map((item) => (
                      <Link key={item.title} href={item.href} className="flex items-center gap-3 group p-2 rounded-lg hover:bg-titanium-800 transition-colors">
                        <item.icon size={18} className="text-titanium-400 group-hover:text-titanium-100" />
                        <span className="text-titanium-100 group-hover:text-white transition-colors text-sm font-medium">{item.title}</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link href="/careers" className="hover:text-titanium-100 transition-colors">Careers</Link>
          <Link href="/pricing" className="hover:text-titanium-100 transition-colors">Pricing</Link>
        </nav>

        {/* 3. RIGHT: Actions */}
        <div className="flex items-center gap-4 z-20">
          <div className="hidden lg:flex items-center gap-3 text-titanium-400 pr-4 border-r border-titanium-800">
            <Link href="#" className="hover:text-white transition-colors"><Disc size={18} /></Link>
            <Link href="#" className="hover:text-white transition-colors"><LinkedInIcon size={18} /></Link>
            <Link href="#" className="hover:text-white transition-colors"><XIcon size={16} /></Link>
          </div>
          
          <Link href="/login" className="text-sm font-medium text-titanium-100 hover:text-white transition-colors">
            Sign In
          </Link>
          
          <Button size="sm" className="shadow-lg shadow-blue-500/20">
            Get started
          </Button>
        </div>

      </div>
    </header>
  );
}