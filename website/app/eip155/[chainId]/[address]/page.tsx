import type { Metadata } from "next";
import Image from "next/image";
import { readdir, readFile } from "node:fs/promises";
import gray from "gray-matter";
import { MDXRemote } from "next-mdx-remote-client/rsc";

export const dynamicParams = false;

export async function generateStaticParams() {
  const chainIds = await readdir("../xmatter/eip155", { withFileTypes: true });
  return chainIds
    .filter((file) => file.isDirectory())
    .flatMap(async (chain) => {
      const addresses = await readdir(`../xmatter/eip155/${chain.name}`, { withFileTypes: true });
      return addresses
        .filter((file) => file.isDirectory())
        .map((address) => ({
          chainId: chain.name,
          address: address.name,
        }));
    });
}

export async function generateMetadata(props: PageProps<"/eip155/[chainId]/[address]">): Promise<Metadata> {
  const { chainId, address } = await props.params;
  const { data } = await getFile(chainId, address);

  return {
    title: data.title,
  };
}

async function getFile(chainId: string, address: string) {
  const markdown = await readFile(`../xmatter/eip155/${chainId}/${address}/README.md`, {
    encoding: "utf-8",
  });
  return gray(markdown);
}

export default async function Page(props: PageProps<"/eip155/[chainId]/[address]">) {
  const { chainId, address } = await props.params;
  const { content, data } = await getFile(chainId, address);

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>

      <div>
        <Image src={`/eip155/${chainId}/${address}/icon.webp`} alt={`${data.name} Logo`} width={100} height={100} />
      </div>

      <MDXRemote source={content} />
    </div>
  );
}
