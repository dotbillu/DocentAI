import React from "react";
import Link from "next/link";
import { FOOTER_LINKS } from "../../lib/constants"; // Assuming you have this from previous steps
import { Github, Linkedin, Disc, X } from "lucide-react"; 

export default function BigFooter() {
  return (
    <div className="w-full border-t border-titanium-800 bg-titanium-950/50 backdrop-blur-sm py-16 px-6 mt-20">
      <div className="max-w-350 mx-auto">
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="text-2xl font-bold tracking-tighter text-white">
              Decent<span className="text-titanium-400"> AI</span>
            </div>
            <p className="text-titanium-400 text-sm leading-relaxed max-w-xs">
              The professional vibe coding tool for building production-ready apps with AI.
            </p>
            <div className="flex gap-4 text-titanium-400">
              <Link href="#" className="hover:text-white transition-colors"><X size={20} /></Link>
              <Link href="#" className="hover:text-white transition-colors"><Github size={20} /></Link>
              <Link href="#" className="hover:text-white transition-colors"><Linkedin size={20} /></Link>
              <Link href="#" className="hover:text-white transition-colors"><Disc size={20} /></Link>
            </div>
          </div>

          {/* Links Columns */}
          {FOOTER_LINKS.map((column) => (
            <div key={column.title} className="space-y-4">
              <h4 className="text-sm font-semibold text-white tracking-wide">{column.title}</h4>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-sm text-titanium-400 hover:text-blue-400 transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-titanium-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-titanium-500">
          <p>© {new Date().getFullYear()} Decent AI. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-titanium-300">Privacy</Link>
            <Link href="#" className="hover:text-titanium-300">Terms</Link>
            <Link href="#" className="hover:text-titanium-300">Cookies</Link>
          </div>
        </div>

      </div>
    </div>
  );
}