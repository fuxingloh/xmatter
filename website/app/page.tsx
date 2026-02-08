import fs from "node:fs";
import path from "node:path";

import gray from "gray-matter";
import Link from "next/link";

import { XmatterFile } from "xmatter/schema";
import { readFileSync } from "fs";
import Image from "next/image";

export default function Page() {
  const uris = readFileSync(path.join(process.cwd(), "app", "page-featured.txt"), "utf-8").split("\n");

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8">
      <div className="divide-mono-200 grid grid-cols-2 divide-x divide-y rounded-md sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {uris.map((uri) => (
          <EntryCard key={uri} uri={uri} />
        ))}
      </div>
    </main>
  );
}

function getXmatterFile(uri: string) {
  const filePath = path.join(process.cwd(), "public", uri, "README.md");
  const raw = fs.readFileSync(filePath, "utf-8");
  const { content, data } = gray(raw);
  return { content, data } as XmatterFile;
}

function EntryCard({ uri }: { uri: string }) {
  const { data, content } = getXmatterFile(uri);

  return (
    <Link href={uri} className="hover:bg-mono-100/50 group flex flex-col items-center gap-3 p-4">
      <Image src={`${uri}/${data.icons[0]}`} alt={`${data.name} Icon`} width={40} height={40} className="size-10" />
      <div className="flex flex-col items-center gap-0.5 text-center">
        <h6 className="line-clamp-1 text-sm leading-tight font-medium">{data.name}</h6>
        {data.symbol && <span className="text-mono-500 text-xs uppercase">{data.symbol}</span>}
      </div>
    </Link>
  );
}
