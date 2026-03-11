"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownBody({ source }: { source: string }) {
  return (
    <div className="max-w-3xl text-[1.125rem] leading-[1.85] text-black/85 space-y-6">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl md:text-4xl font-normal tracking-tight mb-6">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl md:text-2xl font-medium tracking-tight mt-10 mb-4">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg md:text-xl font-semibold tracking-tight mt-8 mb-3">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="mb-6">{children}</p>,
          em: ({ children }) => <em className="italic">{children}</em>,
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 space-y-2">{children}</ul>
          ),
          li: ({ children }) => <li>{children}</li>,
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}

