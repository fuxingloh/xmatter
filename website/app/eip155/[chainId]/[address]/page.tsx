import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Markdown from "react-markdown";
import gray from "gray-matter";

import { publicFetch } from "@/app/public";
import { CopyButton } from "./CopyButton";

const chains: Record<string, string> = {
  "1": "Ethereum",
  "10": "Optimism",
  "56": "BNB Chain",
  "137": "Polygon",
  "8453": "Base",
  "42161": "Arbitrum",
  "43114": "Avalanche",
  "42220": "Celo",
  "1313161554": "Aurora",
  "11155111": "Sepolia",
};

export async function generateStaticParams() {
  return [
    {
      chainId: "1",
      address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    },
  ];
}

export async function generateMetadata(props: PageProps<"/eip155/[chainId]/[address]">): Promise<Metadata> {
  const { chainId, address } = await props.params;
  const readme = await publicFetch(`/eip155/${chainId}/${address}/README.md`);
  const { data } = gray(await readme.text());

  return {
    title: data.name,
    description: data.symbol ? `${data.name} (${data.symbol})` : data.name,
  };
}

export default async function Page(props: PageProps<"/eip155/[chainId]/[address]">) {
  const { chainId, address } = await props.params;
  const readme = await publicFetch(`/eip155/${chainId}/${address}/README.md`);
  const { content, data } = gray(await readme.text());

  const chainName = chains[chainId] ?? `Chain ${chainId}`;

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8">
      <div className="flex flex-col gap-8">
        {/* Hero Section */}
        <div className="flex items-start gap-5">
          {data.icon && (
            <div
              className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl"
              style={{ backgroundColor: data.color ? `${data.color}20` : undefined }}
            >
              <Image
                src={`/eip155/${chainId}/${address}/${data.icon}`}
                alt={`${data.name} icon`}
                width={80}
                height={80}
                className="size-16 object-contain"
              />
            </div>
          )}
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-2xl font-bold">{data.name}</h1>
            {data.symbol && <div className="text-mono-600 text-lg">{data.symbol}</div>}
            <div className="text-mono-500 text-sm">{chainName}</div>
          </div>
        </div>

        {/* Address */}
        <div className="flex flex-col gap-2">
          <div className="text-mono-500 text-xs font-medium tracking-wide uppercase">Contract Address</div>
          <div className="bg-mono-100 flex items-center gap-2 rounded-lg px-4 py-3">
            <code className="text-mono-700 min-w-0 flex-1 truncate font-mono text-sm">{address}</code>
            <CopyButton text={address} />
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {data.decimals !== undefined && (
            <div className="bg-mono-100 flex flex-col gap-1 rounded-lg px-4 py-3">
              <div className="text-mono-500 text-xs font-medium tracking-wide uppercase">Decimals</div>
              <div className="font-medium">{data.decimals}</div>
            </div>
          )}
          {data.standards && data.standards.length > 0 && (
            <div className="bg-mono-100 flex flex-col gap-1 rounded-lg px-4 py-3">
              <div className="text-mono-500 text-xs font-medium tracking-wide uppercase">Standard</div>
              <div className="font-medium uppercase">{data.standards.join(", ")}</div>
            </div>
          )}
          {data.tags && data.tags.length > 0 && (
            <div className="bg-mono-100 flex flex-col gap-1 rounded-lg px-4 py-3">
              <div className="text-mono-500 text-xs font-medium tracking-wide uppercase">Tags</div>
              <div className="font-medium">{data.tags.join(", ")}</div>
            </div>
          )}
        </div>

        {/* Description */}
        {content.trim() && (
          <div className="flex flex-col gap-2">
            <div className="text-mono-500 text-xs font-medium tracking-wide uppercase">About</div>
            <div className="prose prose-sm text-mono-800 max-w-none">
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}

        {/* Links */}
        {data.links && data.links.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="text-mono-500 text-xs font-medium tracking-wide uppercase">Links</div>
            <div className="flex flex-wrap gap-2">
              {data.links.map((link: { name: string; url: string }) => (
                <Link
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-mono-100 hover:bg-mono-200 rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Provenance */}
        {data.provenance && (
          <div className="border-mono-200 border-t pt-6">
            <div className="text-mono-500 text-xs">
              Data sourced from{" "}
              <Link href={data.provenance} target="_blank" rel="noopener noreferrer" className="underline">
                {new URL(data.provenance).hostname}
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
