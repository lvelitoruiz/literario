"use client";

import { useState } from "react";

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-[10px] hover:line-through uppercase tracking-widest cursor-pointer"
    >
      {copied ? "Copiado" : "Copiar Enlace"}
    </button>
  );
}

