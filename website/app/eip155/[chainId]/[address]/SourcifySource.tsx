// @ts-expect-error -- moduleResolution:node can't resolve package exports
import { createHighlighter } from "shiki/bundle/web";
import { SourcifySourceClient, type SourcifyFile } from "./SourcifySourceClient";
import Link from "next/link";

interface SourcifyCompilation {
  sources: Record<string, { id: number; content: string }>;
  language: string;
  compilerVersion: string;
  name: string;
  fullyQualifiedName: string;
}

interface SourcifyResponse {
  match: string;
  compilation: SourcifyCompilation;
}

async function fetchSourcify(chainId: string, address: string): Promise<SourcifyResponse | null> {
  try {
    const res = await fetch(`https://sourcify.dev/server/v2/contract/${chainId}/${address}?fields=compilation`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function SourcifySource(props: { chainId: string; address: string }) {
  const data = await fetchSourcify(props.chainId, props.address);
  if (!data?.compilation?.sources) return null;

  const sources = data.compilation.sources;
  const entries = Object.entries(sources).sort((a, b) => a[1].id - b[1].id);
  if (entries.length === 0) return null;

  const lang = data.compilation.language?.toLowerCase() === "vyper" ? "python" : "solidity";

  const highlighter = await createHighlighter({
    themes: ["github-light", "github-dark"],
    langs: [lang],
  });

  const files: SourcifyFile[] = entries.map(([path, source]) => ({
    path,
    html: highlighter.codeToHtml(source.content, {
      lang,
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
    }),
  }));

  highlighter.dispose();

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-mono-500 text-sm">VERIFIED SOURCE CODE</h4>
        <Link
          href={`https://sourcify.dev/#/lookup/${props.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-mono-500 hover:text-mono-700 text-xs transition-colors hover:underline"
        >
          sourcify.dev
        </Link>
      </div>
      <SourcifySourceClient
        files={files}
        language={data.compilation.language}
        compilerVersion={data.compilation.compilerVersion}
        contractName={data.compilation.name}
        match={data.match}
      />
    </div>
  );
}
