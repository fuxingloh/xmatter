"use client";

import { docsGroups, docsLinks } from "@/app/docs/links";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Command, useCommandState } from "cmdk";
import { FileText, Hexagon, Monitor, Moon, Search, Sun } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";

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
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Search"
      className="fixed inset-0 z-50"
      shouldFilter={false}
    >
      <DialogTitle className="sr-only">Search</DialogTitle>
      <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <div className="bg-mono-50 border-mono-200 fixed top-[20%] left-1/2 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-xl border shadow-2xl">
        <div className="border-mono-200 flex items-center gap-2 border-b px-3">
          <Search className="text-mono-400 size-4 shrink-0" />
          <Command.Input
            placeholder="Search docs or address (0x...)"
            className="text-mono-950 placeholder:text-mono-400 w-full bg-transparent py-3 text-[15px] outline-none"
          />
          <kbd className="bg-mono-100 text-mono-500 rounded px-1.5 py-0.5 text-xs">Esc</kbd>
        </div>
        <Command.List className="max-h-80 overflow-y-auto p-2">
          <CmdKResources onSelect={onSelect} />
          <CmdKDocs onSelect={onSelect} />
          <CmdKTheme onClose={() => setOpen(false)} />
          <Command.Empty className="text-mono-500 py-6 text-center text-sm">No results found.</Command.Empty>
        </Command.List>
      </div>
    </Command.Dialog>
  );
}

const ITEM_CLASS =
  "text-mono-700 data-[selected=true]:bg-mono-200/50 data-[selected=true]:text-mono-950 flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm";

interface ParsedQuery {
  chainId: string;
  prefix: string;
  implicit: boolean;
}

function parseResourceQuery(raw: string): ParsedQuery | undefined {
  const q = raw.trim();
  if (!q) return undefined;

  // eip155:1:0x... (CAIP-10)
  const caip = q.match(/^eip155:(\d+):(0x[0-9a-fA-F]*)$/i);
  if (caip) return { chainId: caip[1], prefix: caip[2].toLowerCase(), implicit: false };

  // eip155/1/0x... or /eip155/1/0x...
  const path = q.match(/^\/?eip155\/(\d+)\/(0x[0-9a-fA-F]*)$/i);
  if (path) return { chainId: path[1], prefix: path[2].toLowerCase(), implicit: false };

  // /1/0x... (shorthand, default namespace eip155)
  const short = q.match(/^\/(\d+)\/(0x[0-9a-fA-F]*)$/i);
  if (short) return { chainId: short[1], prefix: short[2].toLowerCase(), implicit: false };

  // 0x... (just address, default to eip155:1)
  const addr = q.match(/^(0x[0-9a-fA-F]{2,})$/i);
  if (addr) return { chainId: "1", prefix: addr[1].toLowerCase(), implicit: true };

  return undefined;
}

interface ResourceResult {
  address: string;
  chainId: string;
  name?: string;
  symbol?: string;
}

function ResourceIcon({ chainId, address }: { chainId: string; address: string }) {
  const [error, setError] = useState(false);

  if (error) return <Hexagon className="size-4 shrink-0" />;

  return (
    <Image
      src={`/eip155/${chainId}/${address}/icon`}
      alt=""
      width={20}
      height={20}
      className="size-5 shrink-0 rounded-full"
      unoptimized
      onError={() => setError(true)}
    />
  );
}

function useDebouncedPrefix(prefix: string | undefined, delay: number) {
  const [debounced, setDebounced] = useState(prefix);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(prefix), delay);
    return () => clearTimeout(handler);
  }, [prefix, delay]);

  return debounced;
}

function useResourceSearch(chainId: string | undefined, prefix: string | undefined) {
  const [state, setState] = useState<{ results: ResourceResult[]; loading: boolean }>({
    results: [],
    loading: false,
  });
  const valid = !!chainId && !!prefix && prefix.length >= 4;
  const reqId = useRef(0);

  useEffect(() => {
    if (!valid) return;

    const id = ++reqId.current;
    const controller = new AbortController();

    const resolve = (results: ResourceResult[]) => {
      if (reqId.current === id) setState({ results, loading: false });
    };
    const reject = () => {
      if (reqId.current === id) setState({ results: [], loading: false });
    };

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState((prev) => ({ ...prev, loading: true }));

    // Full address (42 chars) — skip index.txt, go directly to frontmatter
    if (prefix!.length === 42) {
      fetch(`/eip155/${chainId}/${prefix}/frontmatter.json`, { signal: controller.signal })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            resolve([{ address: prefix!, chainId: chainId!, name: data.name, symbol: data.symbol }]);
          } else {
            resolve([]);
          }
        })
        .catch(reject);

      return () => controller.abort();
    }

    // Prefix search via index.txt — just show addresses, no enrichment
    fetch(`/eip155/${chainId}/${prefix}/index.txt`, { signal: controller.signal })
      .then((res) => (res.ok ? res.text() : ""))
      .then((text) => {
        const lines = text
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
          .slice(0, 20);

        resolve(lines.map((addr) => ({ address: addr, chainId: chainId! })));
      })
      .catch(reject);

    return () => controller.abort();
  }, [valid, chainId, prefix]);

  if (!valid) return { results: [], loading: false };
  return state;
}

function CmdKResources({ onSelect }: { onSelect: (href: string) => void }) {
  const search = useCommandState((state) => state.search);
  const parsed = parseResourceQuery(search);
  const debouncedPrefix = useDebouncedPrefix(parsed?.prefix, 250);
  const { results, loading } = useResourceSearch(parsed?.chainId, debouncedPrefix);

  if (!parsed) return null;

  const heading = parsed.implicit ? `eip155:${parsed.chainId} (default)` : `eip155:${parsed.chainId}`;
  const waiting = parsed.prefix !== debouncedPrefix;
  const showLoading = (loading || waiting) && results.length === 0;
  const showEmpty = !loading && !waiting && results.length === 0 && (debouncedPrefix?.length ?? 0) >= 4;

  return (
    <Command.Group heading={heading}>
      {showLoading && <div className="text-mono-500 py-4 text-center text-sm">Searching...</div>}
      {showEmpty && <div className="text-mono-500 py-4 text-center text-sm">No addresses found</div>}
      {results.map((r) => {
        const isFullAddress = r.address.length === 42;
        const href = `/eip155/${r.chainId}/${r.address}`;

        return (
          <Command.Item key={r.address} value={r.address} onSelect={() => onSelect(href)} className={ITEM_CLASS}>
            {isFullAddress ? (
              <ResourceIcon chainId={r.chainId} address={r.address} />
            ) : (
              <Hexagon className="size-4 shrink-0" />
            )}
            <span className="flex min-w-0 flex-1 items-center gap-2">
              {isFullAddress && r.name ? (
                <>
                  <span className="truncate font-medium">{r.name}</span>
                  {r.symbol && <span className="text-mono-500 text-xs">{r.symbol}</span>}
                  <span className="text-mono-400 ml-auto shrink-0 font-mono text-xs">
                    {r.address.slice(0, 6)}...{r.address.slice(-4)}
                  </span>
                </>
              ) : (
                <span className="font-mono text-xs">{r.address}</span>
              )}
            </span>
          </Command.Item>
        );
      })}
    </Command.Group>
  );
}

function CmdKDocs({ onSelect }: { onSelect: (href: string) => void }) {
  const search = useCommandState((state) => state.search);
  const parsed = parseResourceQuery(search);

  // Hide docs when actively searching for a resource
  if (parsed && parsed.prefix.length >= 4) return null;

  const filtered = search
    ? docsLinks.filter((d) => {
        const haystack = `${d.label} ${d.group} ${d.keywords?.join(" ") ?? ""}`.toLowerCase();
        return search
          .toLowerCase()
          .split(/\s+/)
          .every((term) => haystack.includes(term));
      })
    : docsLinks;

  if (filtered.length === 0) return null;

  return docsGroups.map((group) => {
    const items = filtered.filter((d) => d.group === group);
    if (items.length === 0) return null;

    return (
      <Command.Group key={group} heading={group}>
        {items.map((doc) => (
          <Command.Item key={doc.href} value={doc.href} onSelect={() => onSelect(doc.href)} className={ITEM_CLASS}>
            <FileText className="size-4 shrink-0" />
            {doc.label}
          </Command.Item>
        ))}
      </Command.Group>
    );
  });
}

function CmdKTheme({ onClose }: { onClose: () => void }) {
  const { setTheme } = useTheme();
  const search = useCommandState((state) => state.search);
  const parsed = parseResourceQuery(search);

  // Hide theme when actively searching for a resource
  if (parsed && parsed.prefix.length >= 4) return null;

  const themes = [
    { value: "system", label: "System Theme", icon: Monitor, keywords: "system preference auto os" },
    { value: "light", label: "Light Theme", icon: Sun, keywords: "light bright day" },
    { value: "dark", label: "Dark Theme", icon: Moon, keywords: "dark night dim" },
  ];

  const filtered = search
    ? themes.filter((t) => {
        const haystack = `${t.label} ${t.keywords}`.toLowerCase();
        return search
          .toLowerCase()
          .split(/\s+/)
          .every((term) => haystack.includes(term));
      })
    : themes;

  if (filtered.length === 0) return null;

  return (
    <Command.Group heading="Theme">
      {filtered.map((item) => (
        <Command.Item
          key={item.value}
          value={item.value}
          onSelect={() => {
            setTheme(item.value);
            onClose();
          }}
          className={ITEM_CLASS}
        >
          <item.icon className="size-4 shrink-0" />
          {item.label}
        </Command.Item>
      ))}
    </Command.Group>
  );
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
