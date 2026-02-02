import { headers } from "next/headers";
import { XmatterFile } from "xmatter/schema";
import gray from "gray-matter";

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

export async function publicFetchXmatterFile(path: string): Promise<XmatterFile> {
  const readme = await publicFetch(path);
  if (!readme.ok) throw new Error(`Failed to fetch ${path}`);

  const { data, content } = gray(await readme.text());
  return { data, content } as XmatterFile;
}
