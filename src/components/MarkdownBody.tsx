"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import type { Root } from "mdast";
import { SoundCloudEmbed } from "./SoundCloudEmbed";

// Convierte directivas como `::soundcloud{url="..."}` en nodos HTML personalizados
// que luego react-markdown pasará a nuestro componente.
const remarkCustomDirectives: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, (node) => {
      if (
        node.type === "containerDirective" ||
        node.type === "leafDirective" ||
        node.type === "textDirective"
      ) {
        const directive = node as unknown as {
          name: string;
          attributes?: Record<string, string>;
          data?: Record<string, unknown>;
        };

        if (directive.name === "soundcloud") {
          const url = directive.attributes?.url;
          if (!url) return;
          directive.data = directive.data ?? {};
          (directive.data as Record<string, unknown>).hName = "soundcloud-embed";
          (directive.data as Record<string, unknown>).hProperties = { url };
        }
      }
    });
  };
};

interface SoundCloudEmbedElementProps {
  url?: string;
}

const components: Components = {
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
  // tag personalizado emitido por nuestro plugin remark
  "soundcloud-embed": ({ url }: SoundCloudEmbedElementProps) =>
    url ? <SoundCloudEmbed url={url} /> : null,
} as Components;

export function MarkdownBody({ source }: { source: string }) {
  return (
    <div className="max-w-3xl text-[1.125rem] leading-[1.85] text-black/85 space-y-6">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkDirective, remarkCustomDirectives]}
        components={components}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
