import fs from "node:fs";
import path from "node:path";

import gray from "gray-matter";
import Link from "next/link";

import { XmatterFile } from "xmatter/schema";
import { readFileSync } from "fs";
import Image from "next/image";
import { getDescription } from "@/app/eip155/[chainId]/[address]/frontmatter.json/route";
import { CSSProperties } from "react";

export default function Page() {
  const uris = readFileSync(path.join(process.cwd(), "app", "page-featured.txt"), "utf-8").split("\n");

  return (
    <main className="mx-auto w-full max-w-7xl px-5 pt-8 pb-48">
      <div>
        <h2 className="mb-3 text-xl font-semibold">Popular examples</h2>
        <div className="border-mono-200 bg-mono-200 grid grid-cols-2 gap-px overflow-hidden rounded-md border sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
      className="bg-mono-50 group p-4.5 transition-colors hover:bg-(--card-color)/5"
      style={{ "--card-color": data.color } as CSSProperties}
    >
      <div className="flex gap-3.5">
        <Image src={`${uri}/${data.icons[0]}`} alt={`${data.name} Icon`} width={48} height={48} className="size-12" />
        <div className="grow">
          <h6 className="line-clamp-1 text-base leading-none font-medium">{data.name}</h6>
          <p className="text-mono-600 mt-1.25 line-clamp-2 text-[13px] leading-tight">{data.description}</p>
        </div>
      </div>
      <div className="text-mono-800 mt-3.5 flex flex-wrap items-center gap-2 text-[13px] font-medium">
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
