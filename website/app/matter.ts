import { join } from "node:path";
import { readdir, readFile, access } from "node:fs/promises";
import gray from "gray-matter";

const BASE = "../xmatter";

export type Matter = Pick<ReturnType<typeof gray>, "data" | "content">;

export async function getMatter(namespace: string, chainId: string, address: string): Promise<Matter> {
  const path = join(BASE, namespace, chainId, address, "README.md");
  const readme = await readFile(path, { encoding: "utf-8" });
  return gray(readme);
}

export type Entry = { chainId: string; address: string };

export async function walk(namespace: string, filename: string = "README.md"): Promise<Entry[]> {
  const path = join(BASE, namespace);
  const entries: Entry[] = [];

  for (const reference of await readdir(path, { withFileTypes: true })) {
    if (!reference.isDirectory()) continue;

    for (const address of await readdir(join(path, reference.name), { withFileTypes: true })) {
      if (!address.isDirectory()) continue;

      const filePath = join(path, reference.name, address.name, filename);
      try {
        await access(filePath);
        entries.push({
          chainId: reference.name,
          address: address.name,
        });
      } catch {
        // File doesn't exist, skip
      }
    }
  }

  return entries;
}
