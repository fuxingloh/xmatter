import type { Metadata } from "next";
import Image from "next/image";
import { getMatter, walk } from "@/app/matter";
import Markdown from "react-markdown";

export const dynamicParams = false;

export async function generateStaticParams() {
  return await walk("eip155");
}

export async function generateMetadata(props: PageProps<"/eip155/[chainId]/[address]">): Promise<Metadata> {
  const { chainId, address } = await props.params;
  const { data } = await getMatter("eip155", chainId, address);

  return {
    title: data.title,
  };
}

export default async function Page(props: PageProps<"/eip155/[chainId]/[address]">) {
  const { chainId, address } = await props.params;
  const { content, data } = await getMatter("eip155", chainId, address);

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>

      <div>
        <Image src={`/eip155/${chainId}/${address}/icon.webp`} alt={`${data.name} Logo`} width={100} height={100} />
      </div>

      <Markdown>{content}</Markdown>
    </div>
  );
}
