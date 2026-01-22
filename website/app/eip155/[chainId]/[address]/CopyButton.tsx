"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-mono-500 hover:text-mono-700 shrink-0 cursor-pointer text-sm transition-colors"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
