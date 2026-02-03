import type { Metadata } from "next";
import Markdown from "react-markdown";

import { getDescription } from "@/app/eip155/[chainId]/[address]/frontmatter.json/route";
import { getXmatterFile } from "@/app/public";
import { IconsTab } from "@/app/eip155/[chainId]/[address]/IconsTab";
import { FrontmatterLink } from "@/app/eip155/[chainId]/[address]/FrontmatterLink";

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
};

export async function generateMetadata(props: PageProps<"/eip155/[chainId]/[address]">): Promise<Metadata> {
  const { chainId, address } = await props.params;
  const { data, content } = await getXmatterFile(`/eip155/${chainId}/${address}/README.md`);
  const description = getDescription(data, content);

  return {
    title: data.name,
    description: description,
  };
}

export default async function Page(props: PageProps<"/eip155/[chainId]/[address]">) {
  const { chainId, address } = await props.params;
  const { data, content } = await getXmatterFile(`/eip155/${chainId}/${address}/README.md`);
  const sentence = getFirstSentence(data.description);

  return (
    <div className="grid grid-cols-10 gap-10">
      <main className="col-span-7">
        <div className="mb-4">
          <h1 className="mb-1 text-2xl font-semibold">{data.name}</h1>
          {sentence && <p className="line-clamp-1">{sentence}</p>}

          <div className="mt-12 flex items-center gap-4">
            {data.links?.map((link) => (
              <FrontmatterLink key={link.url} link={link} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="border-mono-200/75 flex flex-wrap items-center gap-12 border-y py-7">
            {chains[chainId] && (
              <div>
                <h4 className="text-mono-500 text-sm">CHAIN</h4>
                <p className="">{chains[chainId]}</p>
              </div>
            )}
            <div>
              <h4 className="text-mono-500 text-sm">CHAINID (EIP155)</h4>
              <p className="uppercase">{chainId}</p>
            </div>
            <div>
              <h4 className="text-mono-500 text-sm">COLOR</h4>
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

          <div>
            <h4 className="text-mono-500 mb-2 text-sm">IDENTIFIER</h4>
            <div>
              CAIP10: <span className="font-mono">{`eip155:${chainId}/${address}`}</span>
              CAIP19, Xmatter Path
            </div>
          </div>

          <IconsTab chainId={chainId} address={address} icons={data.icons} />

          <div>
            <h4 className="text-mono-500 mb-2 text-sm">README</h4>
            <Markdown>{content}</Markdown>
          </div>

          <div>
            <div className="mb-2 flex">
              <h4 className="text-mono-950 bg-mono-100 rounded-sm px-1.5 py-1.5 font-mono text-sm select-all">
                <span className="select-none">`</span>
                <span>npm install xmatter</span>
                <span className="select-none">`</span>
              </h4>
            </div>
          </div>
        </div>
      </main>

      <aside className="col-span-3 flex flex-col gap-5">
        <div>
          <h4 className="text-mono-500 mb-2 text-sm">PROVENANCE</h4>
          <p>{data.provenance}</p>
        </div>

        <div>
          <h4 className="text-mono-500 mb-2 text-sm">TAGS</h4>
        </div>

        <div>
          <h4 className="text-mono-500 mb-2 text-sm">STANDARDS</h4>
          <ul className="flex items-center gap-2">
            {data.standards.map((standard) => (
              <li className="bg-mono-100 rounded-sm px-2 py-0.75 text-sm uppercase" key={standard}>
                {standard}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}

function getFirstSentence(description?: string): string | undefined {
  if (!description) return;

  const match = description.match(/^.*?[.!?](?:\s|$)/);
  if (match && match[0].trim().length >= 40) {
    return match[0].trim();
  }
}
