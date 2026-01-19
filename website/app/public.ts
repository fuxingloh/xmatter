import { headers } from "next/headers";

export async function publicFetch(path: string): Promise<Response> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host");

  return fetch(`${proto}://${host}${path}`, {
    next: { revalidate: false },
  });
}
