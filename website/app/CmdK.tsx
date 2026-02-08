"use client";

import { docsGroups, docsLinks } from "@/app/docs/links";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { FileText, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode, useCallback, useEffect, useState } from "react";

export function CmdKMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
        e.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const onSelect = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  return (
    <Command.Dialog open={open} onOpenChange={setOpen} label="Search documentation" className="fixed inset-0 z-50">
      <DialogTitle className="sr-only">Search documentation</DialogTitle>
      <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <div className="bg-mono-50 border-mono-200 fixed top-[20%] left-1/2 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-xl border shadow-2xl">
        <div className="border-mono-200 flex items-center gap-2 border-b px-3">
          <Search className="text-mono-400 size-4 shrink-0" />
          <Command.Input
            placeholder="Search documentation..."
            className="text-mono-950 placeholder:text-mono-400 w-full bg-transparent py-3 text-[15px] outline-none"
          />
          <kbd className="bg-mono-100 text-mono-500 rounded px-1.5 py-0.5 text-xs">Esc</kbd>
        </div>
        <Command.List className="max-h-72 overflow-y-auto p-2">
          <Command.Empty className="text-mono-500 py-6 text-center text-sm">No results found.</Command.Empty>
          <CmdKDocs onSelect={onSelect} />
        </Command.List>
      </div>
    </Command.Dialog>
  );
}

function CmdKDocs({ onSelect }: { onSelect: (href: string) => void }) {
  return docsGroups.map((group) => (
    <Command.Group key={group} heading={group}>
      {docsLinks
        .filter((d) => d.group === group)
        .map((doc) => (
          <Command.Item
            key={doc.href}
            value={`${doc.label} ${doc.group} ${doc.keywords?.join(" ") ?? ""}`}
            onSelect={() => onSelect(doc.href)}
            className="text-mono-700 data-[selected=true]:bg-mono-200/50 data-[selected=true]:text-mono-950 flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm"
          >
            <FileText className="size-4 shrink-0" />
            {doc.label}
          </Command.Item>
        ))}
    </Command.Group>
  ));
}

export function CmdKTrigger(props: { children: ReactNode; className: string }) {
  return (
    <button
      type="button"
      onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
      className={props.className}
    >
      {props.children}
    </button>
  );
}
