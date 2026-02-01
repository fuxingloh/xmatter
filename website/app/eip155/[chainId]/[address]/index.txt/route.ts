import { readdir } from "node:fs/promises";
import { join } from "node:path";

const PUBLIC = join(process.cwd(), "public");

async function listAddresses(chainId: string): Promise<string[]> {
  const dir = join(PUBLIC, "eip155", chainId);
  try {
    return await readdir(dir);
  } catch {
    return [];
  }
}

function collectParams(
  chainId: string,
  entries: string[],
  prefix: string,
  result: {
    chainId: string;
    address: string;
  }[],
) {
  const matched = entries.filter((e) => e.toLowerCase().startsWith(prefix));
  if (matched.length === 0) return;

  result.push({ chainId, address: prefix });

  if (matched.length > 256) {
    const groups = new Set<string>();
    for (const e of matched) {
      groups.add(e.slice(0, prefix.length + 2).toLowerCase());
    }
    for (const g of Array.from(groups)) {
      collectParams(chainId, matched, g, result);
    }
  }
}

export async function generateStaticParams() {
  const chains = await readdir(join(PUBLIC, "eip155"));
  const result: { chainId: string; address: string }[] = [];

  for (const chainId of chains) {
    const entries = await listAddresses(chainId);
    collectParams(chainId, entries, "0x", result);
  }

  return result;
}

export async function GET(_req: Request, route: RouteContext<"/eip155/[chainId]/[address]/index">) {
  const { chainId, address } = await route.params;
  const prefix = address.toLowerCase();

  if (!prefix.startsWith("0x") || prefix.length === 42 || !/^0x[0-9a-f]*$/.test(prefix)) {
    return new Response(null, { status: 400 });
  }

  const entries = await listAddresses(chainId);
  const matched = entries.filter((e) => e.toLowerCase().startsWith(prefix)).sort();

  if (matched.length <= 256) {
    return asTextResponse(matched);
  }

  const prefixes = new Set<string>();
  for (const entry of matched) {
    prefixes.add(entry.slice(0, prefix.length + 2).toLowerCase());
  }

  return asTextResponse(Array.from(prefixes).sort());
}

function asTextResponse(list: string[]): Response {
  return new Response(list.sort().join("\n"), {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
