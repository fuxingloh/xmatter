import type { Metadata } from "next";
import Image from "next/image";
import Markdown from "react-markdown";
import { publicFetch } from "@/app/public";
import gray from "gray-matter";

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
    title: data.title,
  };
}

export default async function Page(props: PageProps<"/eip155/[chainId]/[address]">) {
  const { chainId, address } = await props.params;
  const readme = await publicFetch(`/eip155/${chainId}/${address}/README.md`);
  const { content, data } = gray(await readme.text());

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
