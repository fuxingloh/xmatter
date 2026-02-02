import { headers } from "next/headers";
import { XmatterFile } from "xmatter/schema";
import gray from "gray-matter";
import { getDescription } from "@/app/eip155/[chainId]/[address]/frontmatter.json/route";

export async function publicFetch(path: string): Promise<Response> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host");

  return fetch(`${proto}://${host}${path}`, {
    headers: {
      PUBLIC_FETCH_BYPASS: process.env.PUBLIC_FETCH_BYPASS!,
    },
    next: { revalidate: false },
  });
}

export async function getXmatterFile(path: string): Promise<XmatterFile> {
  const readme = await publicFetch(path);
  if (!readme.ok) throw new Error(`Failed to fetch ${path}`);

  const { data, content } = gray(await readme.text());
  if (!data.description) {
    data.description = getDescription(data, content);
  }
  return { data, content } as XmatterFile;
}
