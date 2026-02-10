import fs from "node:fs";
import path from "node:path";

import gray from "gray-matter";
import Link from "next/link";

import type { Metadata } from "next";
import { XmatterFile } from "xmatter/schema";
import { readFileSync } from "fs";
import Image from "next/image";
import { getDescription } from "@/app/eip155/[chainId]/[address]/frontmatter.json/route";
import { CSSProperties } from "react";
import { RollingText } from "@/app/RollingText";
import UseXmatterNpm from "@/app/UseXmatterNpm";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Page() {
  const uris = readFileSync(path.join(process.cwd(), "app", "page-featured.txt"), "utf-8").split("\n");

  return (
    <main className="mx-auto w-full max-w-7xl px-5 pt-8 pb-48">
      <div className="grid grid-cols-1 gap-y-12 py-6 lg:grid-cols-2 lg:gap-x-12 lg:gap-y-0">
        <div>
          <h1 className="text-3xl font-semibold">Xmatter</h1>
          <p className="text-mono-700 mt-2 text-lg">
            Structured metadata for address and smart contracts.
            <br />
            The <RollingText /> registry for assets on-chain.
          </p>

          <ProjectStats />
        </div>
        <div>
          <UseXmatterNpm />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-xl font-semibold">Popular examples</h2>
        <div className="border-mono-200 bg-mono-200 grid grid-cols-1 gap-px overflow-hidden rounded-md border md:grid-cols-2 lg:grid-cols-3">
          {uris.map((uri) => (
            <EntryCard key={uri} uri={uri} />
          ))}
        </div>
      </div>
    </main>
  );
}

function getXmatterFile(uri: string) {
  const filePath = path.join(process.cwd(), "public", uri, "README.md");
  const raw = fs.readFileSync(filePath, "utf-8");
  const { content, data } = gray(raw);
  if (!data.description) {
    data.description = getDescription(data, content);
  }
  return { content, data } as XmatterFile;
}

function EntryCard({ uri }: { uri: string }) {
  const { data } = getXmatterFile(uri);

  return (
    <Link
      href={uri}
      className="bg-mono-50 group p-5 transition-colors hover:bg-(--card-color)/5"
      style={{ "--card-color": data.color } as CSSProperties}
    >
      <div className="flex gap-4">
        <Image src={`${uri}/${data.icons[0]}`} alt={`${data.name} Icon`} width={48} height={48} className="size-12" />
        <div className="grow">
          <h6 className="line-clamp-1 text-base leading-none font-medium">{data.name}</h6>
          <p className="text-mono-600 mt-1.25 line-clamp-2 text-[13px] leading-tight">{data.description}</p>
        </div>
      </div>
      <div className="text-mono-800 mt-5.25 flex flex-wrap items-center gap-2.75 text-[13px] font-medium">
        <div className="bg-mono-200/25 group-hover:bg-mono-50 rounded-sm px-1.5 py-0.5 uppercase">
          {data.symbol} ({data.decimals})
        </div>
        <div className="bg-mono-200/25 group-hover:bg-mono-50 flex items-center gap-1 rounded-sm px-1.5 py-0.5">
          <p className="uppercase">{data.color}</p>
          <div className="size-4 rounded-xs" style={{ backgroundColor: data.color }}></div>
        </div>
        <div className="bg-mono-200/25 group-hover:bg-mono-50 rounded-sm px-1.5 py-0.5 uppercase">
          {data.links?.length ?? 0} links
        </div>
      </div>
    </Link>
  );
}

function ProjectStats() {
  const xmatterDir = path.join(process.cwd(), "public");
  const namespaces = ["eip155", "solana", "tip474"];

  let readmeCount = 0;
  let iconCount = 0;
  let totalBytes = 0;
  const networks = new Set<string>();

  for (const ns of namespaces) {
    const nsDir = path.join(xmatterDir, ns);
    if (!fs.existsSync(nsDir)) continue;

    for (const chain of fs.readdirSync(nsDir)) {
      const chainDir = path.join(nsDir, chain);
      if (!fs.statSync(chainDir).isDirectory()) continue;
      networks.add(`${ns}/${chain}`);

      for (const address of fs.readdirSync(chainDir)) {
        const addrDir = path.join(chainDir, address);
        if (!fs.statSync(addrDir).isDirectory()) continue;

        for (const file of fs.readdirSync(addrDir)) {
          const filePath = path.join(addrDir, file);
          const stat = fs.statSync(filePath);
          totalBytes += stat.size;

          if (file === "README.md") readmeCount++;
          if (file.startsWith("icon.")) iconCount++;
        }
      }
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
    if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(0)} MB`;
    if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(0)} KB`;
    return `${bytes} B`;
  };

  const stats = [
    { label: "Addresses", value: readmeCount.toLocaleString() },
    { label: "Icons", value: iconCount.toLocaleString() },
    { label: "Networks", value: networks.size.toLocaleString() },
    { label: "Total Size", value: formatSize(totalBytes) },
  ];

  return (
    <div className="border-mono-200 bg-mono-200 mt-10 grid grid-cols-4 gap-px overflow-hidden rounded-md border">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-mono-50 px-4 py-3">
          <p className="text-lg font-semibold tabular-nums">{stat.value}</p>
          <p className="text-mono-500 text-xs">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
