import type { Metadata } from "next";
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

  // <div className="mb-6 h-12 w-12">
  //   <Image
  //     src={`/_crypto-frontmatter/${image.path}`}
  //     alt={`${frontmatter.fields.symbol} Logo`}
  //     width={image.size.width}
  //     height={image.size.height}
  //   />
  // </div>

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>

      <MDXRemote source={content} />
    </div>
  );
}
