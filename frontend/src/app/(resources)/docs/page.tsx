"use client";

import React from "react";
import { Book } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-titanium-950 w-full relative z-10 h-full">
      <div className="max-w-4xl mx-auto px-8 pt-24 pb-20 font-sans text-titanium-100">
        
        {/* Document Header */}
        <div className="mb-12 border-b border-titanium-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4">
             <Book size={14} />
             <span>DocentAI v1.0</span>
           </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
            Documentation
          </h1>
          <p className="text-titanium-400 text-lg">
            Project: Docent AI — Intelligent Documentation Assistant
          </p>
        </div>

        {/* SRS Content */}
        <div className="space-y-16">

          {/* 1. INTRODUCTION */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white border-l-4 border-blue-500 pl-4">1. Introduction</h2>
            
            <div className="space-y-6 pl-5">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">1.1 Purpose</h3>
                <p className="text-titanium-400 leading-relaxed">
                  The purpose of this document is to define the requirements for <strong>Docent AI</strong>, a Retrieval-Augmented Generation (RAG) system. It details the functional and non-functional requirements intended for developers, stakeholders, and quality assurance teams.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">1.2 Scope</h3>
                <p className="text-titanium-400 leading-relaxed">
                  Docent AI is a web-based application that allows users to query live technical documentation and uploaded files using natural language. The system leverages web crawling, vector embeddings, and Large Language Models (LLMs) to provide context-aware technical answers.
                </p>
              </div>
            </div>
          </section>

          {/* 2. OVERALL DESCRIPTION */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white border-l-4 border-purple-500 pl-4">2. Overall Description</h2>
            
            <div className="space-y-6 pl-5">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">2.1 Product Perspective</h3>
                <p className="text-titanium-400 leading-relaxed mb-3">
                  Docent AI operates as a modular system consisting of:
                </p>
                <ul className="list-disc list-inside text-titanium-400 space-y-1 ml-4">
                  <li><strong>Frontend Interface:</strong> Next.js 15 application with a responsive &quot;Titanium&quot; UI.</li>
                  <li><strong>RAG Backend:</strong> Python FastAPI server handling web scraping and embeddings.</li>
                  <li><strong>Inference Engine:</strong> Integration with Google Gemini 1.5 Flash.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">2.2 User Characteristics</h3>
                <p className="text-titanium-400 leading-relaxed">
                  <strong>Primary Users:</strong> Software Engineers and Students. <br/>
                  <strong>Technical Proficiency:</strong> High. Users are expected to understand technical terminology and code syntax.
                </p>
              </div>
            </div>
          </section>

          {/* 3. SYSTEM FEATURES */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white border-l-4 border-emerald-500 pl-4">3. System Features</h2>
            
            <div className="space-y-6 pl-5">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">3.1 &quot;Link Mode&quot; Querying</h3>
                <p className="text-titanium-400 leading-relaxed mb-2">
                  The system shall verify if a user input contains a URL. If detected, it must crawl the target documentation, extract text content, and use it as context for the LLM response.
                </p>
                
                {/* FIX: Used &rarr; HTML entity instead of -> to fix JSX parsing error */}
                <div className="bg-titanium-900 p-4 rounded-xl border border-titanium-800 text-sm font-mono text-titanium-400">
                  Input: User pastes a URL.<br/>
                  Process: Backend scrapes text &rarr; Chunks &rarr; Context Window.<br/>
                  Output: AI answers based strictly on scraped content.
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">3.2 Personalization Engine</h3>
                <p className="text-titanium-400 leading-relaxed">
                  The system shall allow users to configure &quot;Strict Mode&quot; (enforcing TypeScript types in code outputs) and &quot;Verbosity&quot; levels. These settings must persist across sessions via local storage.
                </p>
              </div>
            </div>
          </section>

          {/* 4. EXTERNAL INTERFACES */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white border-l-4 border-orange-500 pl-4">4. External Interface Requirements</h2>
            
            <div className="space-y-6 pl-5">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">4.1 Software Interfaces</h3>
                <ul className="list-disc list-inside text-titanium-400 space-y-1 ml-4">
                   <li><strong>Authentication:</strong> OAuth 2.0 via Google (NextAuth.js).</li>
                   <li><strong>Database:</strong> IndexedDB for client-side chat history storage.</li>
                   <li><strong>LLM Provider:</strong> Google Generative AI API (Gemini).</li>
                </ul>
              </div>
            </div>
          </section>

           {/* 5. NON-FUNCTIONAL */}
           <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white border-l-4 border-red-500 pl-4">5. Non-functional Requirements</h2>
            
            <div className="space-y-6 pl-5">
              <ul className="list-disc list-inside text-titanium-400 space-y-2 ml-4">
                 <li><strong>Performance:</strong> The crawler must parse and sanitize a standard documentation page in under 2 seconds.</li>
                 <li><strong>Security:</strong> User API tokens and chat history must never be transmitted to third-party analytics services.</li>
                 <li><strong>Reliability:</strong> The system must handle 404 errors or unreadable PDFs gracefully with user-friendly error messages.</li>
              </ul>
            </div>
          </section>

        </div>
        
        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-titanium-800 text-center text-sm text-titanium-500">
          Last Updated: December 2025 | Approved by Engineering Lead
        </div>
      </div>
    </div>
  );
}