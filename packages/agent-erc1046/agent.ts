import { readFileSync, writeFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

import { createPublicClient, http } from "viem";
import * as viemChains from "viem/chains";
import { XmatterFile, XmatterSchema } from "xmatter/schema";
import { FileSystemAgent, hasFile } from "@workspace/agent-base/fs";
import { FetchWithIgnore } from "@workspace/agent-base/fetch";

// ERC-1046 extends ERC-20 with a tokenURI() function returning a URI with JSON token metadata.
// https://eips.ethereum.org/EIPS/eip-1046
const erc1046Abi = [
  { type: "function", name: "tokenURI", inputs: [], outputs: [{ type: "string" }], stateMutability: "view" },
  { type: "function", name: "name", inputs: [], outputs: [{ type: "string" }], stateMutability: "view" },
  { type: "function", name: "symbol", inputs: [], outputs: [{ type: "string" }], stateMutability: "view" },
  { type: "function", name: "decimals", inputs: [], outputs: [{ type: "uint8" }], stateMutability: "view" },
] as const;

const SOURCIFY_API = "https://sourcify.dev/server";
const PAGE_SIZE = 200;

// Chains to index — major EVM chains well-covered by Sourcify
const CHAINS: { chainId: number; name: string }[] = [
  { chainId: 1, name: "Ethereum" },
  { chainId: 10, name: "Optimism" },
  { chainId: 56, name: "BSC" },
  { chainId: 100, name: "Gnosis" },
  { chainId: 137, name: "Polygon" },
  { chainId: 8453, name: "Base" },
  { chainId: 42161, name: "Arbitrum One" },
  { chainId: 43114, name: "Avalanche" },
];

// ERC-1046 token metadata JSON schema (https://eips.ethereum.org/EIPS/eip-1046).
// Field values may arrive as strings even when typed as numbers.
interface Erc1046Metadata {
  name?: string;
  symbol?: string;
  decimals?: number | string;
  description?: string;
  image?: string;
  external_url?: string;
  // Some implementations nest token-specific fields under "properties"
  properties?: {
    name?: string;
    symbol?: string;
    decimals?: number | string;
    description?: string;
    image?: string;
  };
}

// Normalised, flat representation used inside the agent
interface ContractEntry {
  address: string;
  chainId: number;
  name: string;
  symbol?: string;
  decimals?: number;
  description?: string;
  imageUrl?: string;
  websiteUrl?: string;
}

// State file: tracks the next page to fetch per chain so we can resume where we left off.
// Acts as a JSON timeseries cursor — updated after each successfully processed batch.
interface AgentState {
  chains: Record<string, number>; // chainId (string) -> next page to process
}

const STATE_PATH = join(process.cwd(), ".state.json");

function loadState(): AgentState {
  try {
    return JSON.parse(readFileSync(STATE_PATH, "utf-8")) as AgentState;
  } catch {
    return { chains: {} };
  }
}

function saveState(state: AgentState): void {
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

// --- Sourcify helpers ---

// Fetch one page of full-match verified contract addresses for a chain.
async function fetchContractPage(chainId: number, page: number): Promise<{ addresses: string[]; hasNext: boolean }> {
  const url = `${SOURCIFY_API}/contracts/full_match/${chainId}?page=${page}&limit=${PAGE_SIZE}&order=asc`;
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) {
    throw new Error(`Sourcify list error ${response.status} for chain ${chainId} page ${page}`);
  }
  const data = (await response.json()) as {
    results: string[];
    pagination?: { currentPage: number; resultsPerPage: number; hasNextPage?: boolean; totalResults?: number };
  };

  const addresses = Array.isArray(data.results) ? data.results : [];
  // Use explicit hasNextPage flag when available; fall back to checking if we got a full page.
  const hasNext = data.pagination?.hasNextPage ?? addresses.length === PAGE_SIZE;
  return { addresses, hasNext };
}

// Fetch the Solidity compiler metadata for a contract from Sourcify and return its ABI.
async function fetchContractAbi(chainId: number, address: string): Promise<unknown[] | undefined> {
  const url = `${SOURCIFY_API}/files/any/${chainId}/${address}`;
  let response: Response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  } catch {
    return undefined;
  }
  if (!response.ok) return undefined;

  const data = (await response.json()) as { files?: { name: string; content: string }[] };
  const files = Array.isArray(data.files) ? data.files : [];

  // The Solidity compiler metadata.json contains the ABI under output.abi
  const metaFile = files.find((f) => f.name === "metadata.json" || f.name.endsWith("/metadata.json"));
  if (!metaFile) return undefined;

  try {
    const meta = JSON.parse(metaFile.content) as { output?: { abi?: unknown[] } };
    return meta.output?.abi ?? undefined;
  } catch {
    return undefined;
  }
}

// Returns true when the ABI contains a zero-input tokenURI() function returning string (ERC-1046).
function abiHasTokenUri(abi: unknown[]): boolean {
  return abi.some(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      (item as Record<string, unknown>)["type"] === "function" &&
      (item as Record<string, unknown>)["name"] === "tokenURI" &&
      Array.isArray((item as Record<string, unknown>)["inputs"]) &&
      ((item as Record<string, unknown>)["inputs"] as unknown[]).length === 0,
  );
}

// --- viem helpers ---

const ALL_VIEM_CHAINS = Object.values(viemChains).filter(
  (c) => typeof c === "object" && c !== null && "id" in c && typeof (c as { id: unknown }).id === "number",
);

function findViemChain(chainId: number) {
  return ALL_VIEM_CHAINS.find((c) => (c as { id: number }).id === chainId);
}

function makeClient(chainId: number) {
  const chain = findViemChain(chainId);
  if (!chain) throw new Error(`No viem chain definition for chainId ${chainId}`);
  return createPublicClient({ chain: chain as Parameters<typeof createPublicClient>[0]["chain"], transport: http() });
}

async function callTokenUri(client: ReturnType<typeof makeClient>, address: string): Promise<string | undefined> {
  try {
    const uri = await client.readContract({
      address: address as `0x${string}`,
      abi: erc1046Abi,
      functionName: "tokenURI",
    });
    return typeof uri === "string" && uri.length > 0 ? uri : undefined;
  } catch {
    return undefined;
  }
}

async function callOnChainFields(
  client: ReturnType<typeof makeClient>,
  address: string,
): Promise<{ name?: string; symbol?: string; decimals?: number }> {
  const [nameResult, symbolResult, decimalsResult] = await Promise.allSettled([
    client.readContract({ address: address as `0x${string}`, abi: erc1046Abi, functionName: "name" }),
    client.readContract({ address: address as `0x${string}`, abi: erc1046Abi, functionName: "symbol" }),
    client.readContract({ address: address as `0x${string}`, abi: erc1046Abi, functionName: "decimals" }),
  ]);
  return {
    name: nameResult.status === "fulfilled" && typeof nameResult.value === "string" ? nameResult.value : undefined,
    symbol:
      symbolResult.status === "fulfilled" && typeof symbolResult.value === "string" ? symbolResult.value : undefined,
    decimals:
      decimalsResult.status === "fulfilled" && typeof decimalsResult.value === "number"
        ? decimalsResult.value
        : undefined,
  };
}

// --- ERC-1046 metadata helpers ---

// Normalise decimals — some payloads emit them as strings.
function normaliseDecimals(value: number | string | undefined): number | undefined {
  if (value === undefined || value === null) return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 && n <= 256 ? Math.floor(n) : undefined;
}

// Flatten ERC-1046 metadata: prefer top-level fields, fall back to nested properties.
function flattenMetadata(raw: Erc1046Metadata): Omit<ContractEntry, "address" | "chainId"> & { name?: string } {
  const p = raw.properties ?? {};
  return {
    name: (raw.name ?? p.name)?.trim() || undefined,
    symbol: (raw.symbol ?? p.symbol)?.trim() || undefined,
    decimals: normaliseDecimals(raw.decimals ?? p.decimals),
    description: (raw.description ?? p.description)?.trim() || undefined,
    imageUrl: (raw.image ?? p.image)?.startsWith("https://") ? (raw.image ?? p.image) : undefined,
    websiteUrl: raw.external_url?.startsWith("http") ? raw.external_url : undefined,
  };
}

async function fetchErc1046Metadata(tokenUri: string): Promise<Erc1046Metadata | undefined> {
  // Only follow HTTP/HTTPS URIs; data: and ipfs: require separate handling
  if (!tokenUri.startsWith("http://") && !tokenUri.startsWith("https://")) return undefined;
  let response: Response;
  try {
    response = await fetch(tokenUri, { signal: AbortSignal.timeout(15_000) });
  } catch {
    return undefined;
  }
  if (!response.ok) return undefined;
  try {
    return (await response.json()) as Erc1046Metadata;
  } catch {
    return undefined;
  }
}

// --- Agent class ---

class Erc1046Agent extends FileSystemAgent<ContractEntry> {
  async readEntry(_source: string): Promise<ContractEntry | undefined> {
    // Not used — entries are built from Sourcify API + on-chain calls, not local files
    return undefined;
  }

  toReadmeFile(_uri: string, entry: ContractEntry): XmatterFile {
    const links: XmatterFile["data"]["links"] = [];
    if (entry.websiteUrl) {
      links.push({ name: "website", url: entry.websiteUrl });
    }

    return {
      data: {
        name: entry.name,
        provenance: `https://sourcify.dev/#lookup/${entry.chainId}/${entry.address}`,
        standards: ["erc20", "erc1046"],
        ...(entry.symbol ? { symbol: entry.symbol } : {}),
        ...(entry.decimals !== undefined ? { decimals: entry.decimals } : {}),
        ...(links.length > 0 ? { links } : {}),
        icons: [],
      },
      content: entry.description ?? "",
    };
  }

  async processChain(chainId: number, chainName: string, state: AgentState, fetcher: FetchWithIgnore): Promise<void> {
    const chainKey = String(chainId);
    let page = state.chains[chainKey] ?? 0;

    let client: ReturnType<typeof makeClient>;
    try {
      client = makeClient(chainId);
    } catch (err) {
      console.warn(`Skipping chain ${chainName} (${chainId}): ${err}`);
      return;
    }

    console.log(`Chain ${chainName} (${chainId}): starting from page ${page}`);

    for (;;) {
      let pageResult: { addresses: string[]; hasNext: boolean };
      try {
        pageResult = await fetchContractPage(chainId, page);
      } catch (err) {
        console.error(`  Failed to fetch page ${page}: ${err}`);
        break;
      }

      const { addresses, hasNext } = pageResult;
      if (addresses.length === 0) break;

      console.log(`  Page ${page}: ${addresses.length} contracts`);

      for (const address of addresses) {
        const lowerAddress = address.toLowerCase();
        const uri = `eip155/${chainId}/${lowerAddress}`;
        const targetPath = join("../../xmatter", uri);

        if (await hasFile(join(targetPath, "LOCK"))) continue;

        // Check Sourcify ABI for tokenURI() — identifies ERC-1046 candidates
        const abi = await fetchContractAbi(chainId, address);
        if (!abi || !abiHasTokenUri(abi)) continue;

        // Call tokenURI() on-chain to get the metadata URI
        const tokenUri = await callTokenUri(client, address);
        if (!tokenUri) continue;

        // Fetch and parse the ERC-1046 JSON metadata from the URI
        const rawMeta = await fetchErc1046Metadata(tokenUri);
        if (!rawMeta) continue;

        const flat = flattenMetadata(rawMeta);

        // Fall back to on-chain ERC-20 fields for any missing metadata values
        if (!flat.name || !flat.symbol || flat.decimals === undefined) {
          const onChain = await callOnChainFields(client, address);
          if (!flat.name) flat.name = onChain.name?.trim() || undefined;
          if (!flat.symbol) flat.symbol = onChain.symbol?.trim() || undefined;
          if (flat.decimals === undefined) flat.decimals = onChain.decimals;
        }

        if (!flat.name) continue;

        const entry: ContractEntry = { address: lowerAddress, chainId, ...flat, name: flat.name };
        const file = this.toReadmeFile(uri, entry);
        const parsed = XmatterSchema.safeParse(file);
        if (!parsed.success) {
          console.warn(`  Invalid schema for ${uri}: ${parsed.error}`);
          continue;
        }

        await mkdir(targetPath, { recursive: true });

        if (entry.imageUrl?.startsWith("https://")) {
          await fetcher.copyIcon(entry.imageUrl, targetPath);
        }

        await this.write(uri, entry, "", targetPath, parsed.data);
        console.log(`  Created: ${uri} (${entry.name})`);
      }

      // Advance the cursor so the next run starts from the following page
      state.chains[chainKey] = page + 1;
      saveState(state);

      if (!hasNext) break;
      page++;
    }

    console.log(`Chain ${chainName} (${chainId}): done`);
  }
}

const agent = new Erc1046Agent();
const fetcher = new FetchWithIgnore();
const state = loadState();

for (const { chainId, name } of CHAINS) {
  try {
    await agent.processChain(chainId, name, state, fetcher);
  } catch (err) {
    console.error(`Chain ${name} (${chainId}) failed:`, err instanceof Error ? err.message : err);
  }
}
