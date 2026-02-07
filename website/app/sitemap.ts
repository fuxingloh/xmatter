import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";

import type { MetadataRoute } from "next";

const BASE_URL = "https://xmatter.org";
const APP_DIR = join(process.cwd(), "app");
const PUBLIC_DIR = join(process.cwd(), "public");

async function getDocRoutes(): Promise<string[]> {
  const routes: string[] = [];

  async function scan(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name.startsWith("[")) continue;
        await scan(fullPath);
      } else if (entry.name === "page.md" || entry.name === "page.mdx") {
        const rel = relative(APP_DIR, dir);
        routes.push(rel === "" ? "/" : `/${rel}`);
      }
    }
  }

  await scan(APP_DIR);
  return routes;
}

async function getEip155Routes(): Promise<string[]> {
  const routes: string[] = [];
  const eip155Dir = join(PUBLIC_DIR, "eip155");
  const chainIds = await readdir(eip155Dir, { withFileTypes: true });

  for (const chain of chainIds) {
    if (!chain.isDirectory()) continue;
    const addresses = await readdir(join(eip155Dir, chain.name), { withFileTypes: true });
    for (const addr of addresses) {
      if (!addr.isDirectory()) continue;
      routes.push(`/eip155/${chain.name}/${addr.name}`);
    }
  }

  return routes;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [docRoutes, eip155Routes] = await Promise.all([getDocRoutes(), getEip155Routes()]);

  return [
    { url: `${BASE_URL}/` },
    ...docRoutes.map((route) => ({ url: `${BASE_URL}${route}` })),
    ...eip155Routes.map((route) => ({ url: `${BASE_URL}${route}` })),
  ];
}
