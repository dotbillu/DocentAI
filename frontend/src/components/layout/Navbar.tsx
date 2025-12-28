"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  Menu, 
  LogOut, 
  User, 
  Settings, 
  Sparkles
} from "lucide-react";
import clsx from "clsx";
import { useAtom } from "jotai";
import { useSession, signOut } from "next-auth/react";

import { sidebarOpenAtom } from "../../atom";
import { RESOURCES_MENU } from "../../lib/constants"; 
import Button from "../ui/Button"; 

export default function Navbar() {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useAtom(sidebarOpenAtom);
  
  const { data: session, status } = useSession();
  const profileRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 border-b border-titanium-800 bg-linear-to-r from-titanium-950/80 via-black/80 to-titanium-950/80 backdrop-blur-md">
      <div className="w-full px-4 h-16 flex items-center justify-between font-sans relative">
        
        {/* 1. LEFT: Menu Toggle + Logo */}
        <div className="flex items-center gap-4 z-20">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-titanium-400 cursor-pointer rounded-lg transition-colors hover:text-white"
          >
            <Menu size={24} />
          </button>

          <Link href="/" className="text-2xl font-bold tracking-tighter text-white">
            Docent<span className="text-titanium-400"> AI</span>
          </Link>
        </div>

        {/* 2. CENTER: Navigation */}
        <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-6 text-sm font-medium text-titanium-400">
          <Link 
            href="/community" 
            prefetch={true} // Optimization: Preload page on hover
            className={clsx("transition-colors", isActive("/community") ? "text-white" : "hover:text-titanium-100")}
          >
            Community
          </Link>
          
          <Link 
            href="/help" 
            prefetch={true} // Optimization: Preload page on hover
            className={clsx("transition-colors", isActive("/help") ? "text-white" : "hover:text-titanium-100")}
          >
            Help
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
                  className="absolute top-full left-1/2 -translate-x-1/2 w-60 p-2 bg-titanium-950/95 border border-titanium-800 rounded-xl shadow-2xl z-50 backdrop-blur-xl flex flex-col"
                >
                  {/* Single Column Content */}
                  <div className="space-y-1">
                    {RESOURCES_MENU.resources.map((item) => (
                      <Link 
                        key={item.title} 
                        href={item.href} 
                        prefetch={true} // Optimization
                        className="flex items-center gap-3 group p-2 rounded-lg hover:bg-titanium-800/50 transition-colors"
                      >
                        <div className="p-1.5 rounded-md bg-titanium-800 group-hover:bg-blue-500/20 text-titanium-400 group-hover:text-blue-400 transition-colors">
                             <item.icon size={16} />
                        </div>
                        <span className="text-titanium-100 group-hover:text-white transition-colors text-sm font-medium">{item.title}</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link href="/careers" prefetch={true} className="hover:text-titanium-100 transition-colors">Careers</Link>
        </nav>

        {/* 3. RIGHT: Actions & Authentication */}
        <div className="flex items-center gap-4 z-20">
          
          {status === "loading" ? (
             <div className="w-8 h-8 bg-titanium-800 rounded-full animate-pulse" />
          ) : session ? (
             <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center justify-center rounded-full ring-2 ring-transparent hover:ring-titanium-700 transition-all focus:outline-none"
                >
                  {session.user?.image ? (
                    <Image src={session.user.image} alt="User" width={32} height={32} className="rounded-full bg-titanium-800" />
                  ) : (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                      {session.user?.name?.[0] || <User size={16} />}
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-3 w-64 bg-titanium-900 border border-titanium-800 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col"
                    >
                      <div className="p-4 border-b border-titanium-800">
                         <div className="flex items-center gap-3">
                            {session.user?.image ? (
                              <Image 
                                src={session.user.image} 
                                alt="User" 
                                width={36} 
                                height={36} 
                                className="rounded-full" 
                              />
                            ) : (
                              <div className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                {session.user?.name?.[0] || "U"}
                              </div>
                            )}
                            <div className="flex flex-col overflow-hidden">
                              <span className="text-sm font-semibold text-white truncate">{session.user?.name}</span>
                              <span className="text-xs text-titanium-400 truncate">{session.user?.email}</span>
                            </div>
                         </div>
                      </div>

                      <div className="p-2 space-y-0.5">
                        
                        <Link 
                          href="/personalization" 
                          prefetch={true}
                          onClick={() => setIsProfileOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-titanium-100 hover:bg-titanium-800 rounded-lg transition-colors group"
                        >
                           <Sparkles size={16} className="text-titanium-400 group-hover:text-white" />
                           <span>Personalization</span>
                        </Link>

                        <Link 
                          href="/settings"
                          prefetch={true}
                          onClick={() => setIsProfileOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-titanium-100 hover:bg-titanium-800 rounded-lg transition-colors group"
                        >
                           <Settings size={16} className="text-titanium-400 group-hover:text-white" />
                           <span>Settings</span>
                        </Link>
                      </div>

                      <div className="h-px bg-titanium-800 mx-2" />

                      <div className="p-2 space-y-0.5">
                        <button 
                          onClick={() => signOut()}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-titanium-100 hover:bg-titanium-800 rounded-lg transition-colors group"
                        >
                           <LogOut size={16} className="text-titanium-400 group-hover:text-white" />
                           <span>Log out</span>
                        </button>
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          ) : (
             <Link href="/login" prefetch={true}>
                <Button size="sm" className="shadow-lg shadow-blue-500/20">
                  Sign In
                </Button>
             </Link>
          )}

        </div>

      </div>
    </header>
  );
}