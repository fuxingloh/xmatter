import type { Metadata } from "next";
import Markdown from "react-markdown";

import { getDescription } from "@/app/eip155/[chainId]/[address]/frontmatter.json/route";
import { getXmatterFile } from "@/app/public";
import { IconsTab } from "@/app/eip155/[chainId]/[address]/IconsTab";
import { FrontmatterLink } from "@/app/eip155/[chainId]/[address]/FrontmatterLink";
import { IdentifierSelect } from "@/app/eip155/[chainId]/[address]/IdentifierSelect";
import Link from "next/link";
import CodeExamples from "@/app/eip155/[chainId]/[address]/CodeExamples";

export async function generateStaticParams() {
  return [
    {
      chainId: "1",
      address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    },
  ];
}

const chains: Record<string, string> = {
  "1": "Ethereum",
  "10": "Optimism",
  "56": "Binance Smart Chain",
  "137": "Polygon",
  "8453": "Base",
  "42161": "Arbitrum One",
  "42220": "Celo",
  "43114": "Avalanche C-Chain",
  "11155111": "Ethereum Sepolia",
  "1313161554": "Aurora",
};

export async function generateMetadata(props: PageProps<"/eip155/[chainId]/[address]">): Promise<Metadata> {
  const { chainId, address } = await props.params;
  const { data, content } = await getXmatterFile(`/eip155/${chainId}/${address}/README.md`);
  const description = getDescription(data, content);

  return {
    title: data.name,
    description: description,
    icons:
      data.icons.length > 0
        ? {
            icon: `/eip155/${chainId}/${address}/icon`,
          }
        : {},
  };
}

export default async function Page(props: PageProps<"/eip155/[chainId]/[address]">) {
  const { chainId, address } = await props.params;
  const { data, content } = await getXmatterFile(`/eip155/${chainId}/${address}/README.md`);
  const sentence = getFirstSentence(data.description);

  return (
    <div className="grid gap-12 pb-48 lg:grid-cols-10">
      <main className="min-w-0 lg:col-span-7">
        <div className="mb-4">
          <h1 className="mb-1 text-2xl font-semibold">{data.name}</h1>
          {sentence && <p className="line-clamp-1">{sentence}</p>}

          <div className="mt-15 flex flex-wrap items-center gap-x-6 gap-y-1">
            {data.links?.map((link) => (
              <FrontmatterLink key={link.url} link={link} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-12">
          <div className="border-mono-200/75 flex flex-wrap items-center gap-x-12 gap-y-6 border-y py-6">
            {chains[chainId] && (
              <div>
                <h4 className="text-mono-500 text-sm">CHAIN</h4>
                <p className="">{chains[chainId]}</p>
              </div>
            )}
            <div>
              <h4 className="text-mono-500 text-sm">CHAIN ID</h4>
              <p className="">eip155:{chainId}</p>
            </div>
            <div>
              <h4 className="text-mono-500 text-sm">ICON COLOR</h4>
              <div className="flex items-center gap-1.5">
                <p className="uppercase">{data.color}</p>
                <div className="size-4 rounded-xs" style={{ backgroundColor: data.color }}></div>
              </div>
            </div>
            {data.symbol && (
              <div>
                <h4 className="text-mono-500 text-sm">SYMBOL</h4>
                <p className="uppercase">{data.symbol}</p>
              </div>
            )}
            {data.decimals && (
              <div>
                <h4 className="text-mono-500 text-sm">DECIMALS</h4>
                <p className="">{data.decimals}</p>
              </div>
            )}
          </div>

          <IconsTab chainId={chainId} address={address} icons={data.icons} />
          <IdentifierSelect chainId={chainId} address={address} />

          <div>
            <h4 className="text-mono-500 mb-2 text-sm">README</h4>
            <Markdown>{content}</Markdown>
          </div>

          <div className="border-mono-200 border-t pt-8">
            <CodeExamples chainId={chainId} address={address} name={data.name} />
          </div>
        </div>
      </main>

      <aside className="border-mono-200 flex flex-col gap-8 max-lg:border-t max-lg:pt-12 lg:col-span-3">
        <div>
          <h4 className="text-mono-500 mb-2 text-sm">PROVENANCE</h4>
          <Provenance provenance={data.provenance} />
        </div>

        {data.tags && (
          <div>
            <h4 className="text-mono-500 mb-2 text-sm">TAGS</h4>
            <ul className="flex items-center gap-2">
              {data.tags.map((tag) => (
                <li
                  className="bg-mono-200/50 text-mono-800 rounded-sm px-2 py-1 text-sm font-medium uppercase"
                  key={tag}
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.standards && (
          <div>
            <h4 className="text-mono-500 mb-2 text-sm">STANDARDS</h4>
            <ul className="flex items-center gap-2">
              {data.standards.map((standard) => (
                <li
                  className="bg-mono-200/50 text-mono-800 rounded-sm px-2 py-1 text-sm font-medium uppercase"
                  key={standard}
                >
                  {standard}
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}

function getFirstSentence(description?: string): string | undefined {
  if (!description) return;

  const match = description.match(/^.*?[.!?](?:\s|$)/);
  if (match) {
    return match[0].trim();
  }

  return description;
}

function Provenance(props: { provenance: string }) {
  if (props.provenance.startsWith("http")) {
    const link = new URL(props.provenance);
    return (
      <Link href={link.href} className="hover:underline" target="_blank" rel="noopener noreferrer">
        {link.host + (link.pathname === "/" ? "" : link.pathname)}
      </Link>
    );
  }
  return <p>{props.provenance}</p>;
}
