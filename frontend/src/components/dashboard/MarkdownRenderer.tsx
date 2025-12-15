import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";

SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("js", javascript);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("python", python);

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const CodeBlock = ({
    inline,
    className,
    children,
    ...props
  }: {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
    [key: string]: any;
  }) => {
    const [isCopied, setIsCopied] = useState(false);
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "text";
    const codeString = String(children).replace(/\n$/, "");

    const handleCopy = () => {
      navigator.clipboard.writeText(codeString);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    };

    if (!inline && match) {
      return (
        <div className="rounded-xl overflow-hidden my-6 border border-white/10 bg-[#09090b] shadow-2xl w-full group">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#18181b] border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-400 font-bold uppercase tracking-wider">
                {language}
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              {isCopied ? (
                <Check size={14} className="text-green-400" />
              ) : (
                <Copy size={14} />
              )}
              <span>{isCopied ? "Copied" : "Copy code"}</span>
            </button>
          </div>
          
          {/* Code Area - Force Full Width */}
          <div className="relative w-full overflow-x-auto">
            <SyntaxHighlighter
              style={oneDark}
              language={language}
              PreTag="div"
              customStyle={{
                margin: 0,
                padding: "1.5rem",
                backgroundColor: "#09090b", // Hardcoded pitch black
                fontSize: "0.875rem",
                lineHeight: "1.7",
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              }}
              codeTagProps={{
                 style: { fontFamily: 'inherit' }
              }}
              {...props}
            >
              {codeString}
            </SyntaxHighlighter>
          </div>
        </div>
      );
    }

    return (
      <code
        className="bg-white/10 text-blue-200 px-1.5 py-0.5 rounded text-sm font-mono"
        {...props}
      >
        {children}
      </code>
    );
  };

  return (
    <div className="w-full text-[15px] leading-8 text-zinc-100 font-normal">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock,
          ul: ({ children }) => (
            <ul className="list-disc pl-6 my-4 space-y-2 text-zinc-300">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 my-4 space-y-2 text-zinc-300">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="pl-1">{children}</li>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 hover:underline decoration-blue-400/30 underline-offset-4 transition-all"
            >
              {children}
            </a>
          ),
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold text-white mt-10 mb-6 tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4 tracking-tight border-b border-white/10 pb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold text-white mt-6 mb-3">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-4 last:mb-0">{children}</p>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
