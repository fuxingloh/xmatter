import type { Metadata } from "next";
import Markdown from "react-markdown";

import { getDescription } from "@/app/eip155/[chainId]/[address]/frontmatter.json/route";
import { getXmatterFile } from "@/app/public";
import { IconsTab } from "@/app/eip155/[chainId]/[address]/IconsTab";

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
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">{data.name}</h1>
          {sentence && <p className="line-clamp-1">{sentence}</p>}
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <h4></h4>
          </div>

          <div>
            <h4 className="text-mono-500 mb-2 text-sm">LINKS</h4>
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
