import { readdir } from "node:fs/promises";
import { basename, join } from "node:path";

import { createPublicClient, fallback, http } from "viem";
import * as viemChains from "viem/chains";
import { XmatterFile } from "xmatter/schema";
import { FileSystemAgent, copyImage, hasFile } from "@workspace/agent-base/fs";

const tokenAbi = [
  { type: "function", name: "name", inputs: [], outputs: [{ type: "string" }], stateMutability: "view" },
  { type: "function", name: "symbol", inputs: [], outputs: [{ type: "string" }], stateMutability: "view" },
] as const;

const SKIP_CHAINS = new Set([
  1151111081099710, // Solana (not EVM)
]);

const EXTRA_RPCS: Record<number, string[]> = {
  1: ["https://eth.llamarpc.com"],
  10: ["https://optimism.llamarpc.com"],
  56: ["https://binance.llamarpc.com"],
  137: ["https://polygon.llamarpc.com"],
  250: ["https://fantom.llamarpc.com"],
  8453: ["https://base.llamarpc.com"],
  42161: ["https://arbitrum.llamarpc.com"],
  43114: ["https://avalanche.llamarpc.com"],
};

const ALL_VIEM_CHAINS = Object.values(viemChains).filter(
  (c) => typeof c === "object" && c !== null && "id" in c && typeof (c as any).id === "number",
);

function findChain(chainId: number) {
  return ALL_VIEM_CHAINS.find((c) => (c as any).id === chainId);
}

function createTransport(chainId: number) {
  const extraRpcs = EXTRA_RPCS[chainId] ?? [];
  if (extraRpcs.length > 0) {
    return fallback([http(), ...extraRpcs.map((url) => http(url))]);
  }
  return http();
}

interface TokenEntry {
  address: string;
  name: string;
  symbol?: string;
  decimals?: number;
  hasLogoSvg: boolean;
  hasLogoPng: boolean;
  readmeExists: boolean;
}

export class SmolDappAgent extends FileSystemAgent<TokenEntry> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private client!: any;
  private chainId!: number;

  setChain(chainId: number, client: any): void {
    this.chainId = chainId;
    this.client = client;
  }

  async readEntry(sourcePath: string): Promise<TokenEntry | undefined> {
    const address = basename(sourcePath);
    if (!address.startsWith("0x") || address.length !== 42) return undefined;

    const hasLogoSvg = await hasFile(join(sourcePath, "logo.svg"));
    const hasLogoPng = await hasFile(join(sourcePath, "logo-128.png"));

    if (!hasLogoSvg && !hasLogoPng) return undefined;

    const targetPath = join("../../xmatter", `eip155/${this.chainId}/${address.toLowerCase()}`);
    const readmeExists = await hasFile(join(targetPath, "README.md"));

    if (readmeExists) {
      return {
        address,
        name: address,
        hasLogoSvg,
        hasLogoPng,
        readmeExists: true,
      };
    }

    try {
      const [name, symbol] = await Promise.all([
        this.client
          .readContract({
            address: address as `0x${string}`,
            abi: tokenAbi,
            functionName: "name",
          })
          .catch(() => undefined),
        this.client
          .readContract({
            address: address as `0x${string}`,
            abi: tokenAbi,
            functionName: "symbol",
          })
          .catch(() => undefined),
      ]);

      const tokenName = name || symbol;
      if (!tokenName) {
        console.warn(`Skipping ${address}: could not resolve name or symbol`);
        return undefined;
      }

      return {
        address,
        name: tokenName,
        symbol: symbol ?? undefined,
        hasLogoSvg,
        hasLogoPng,
        readmeExists: false,
      };
    } catch {
      console.warn(`Skipping ${address}: RPC call failed`);
      return undefined;
    }
  }

  toReadmeFile(uri: string, entry: TokenEntry): XmatterFile {
    return {
      data: {
        name: entry.name,
        provenance: "https://github.com/SmolDapp/tokenAssets",
        standards: [],
        symbol: entry.symbol,
        icons: [],
      },
      content: "",
    };
  }

  async write(uri: string, data: TokenEntry, source: string, target: string, file: XmatterFile): Promise<void> {
    if (data.hasLogoSvg) {
      await copyImage(join(source, "logo.svg"), join(target, "icon.svg"));
    }
    if (data.hasLogoPng) {
      await copyImage(join(source, "logo-128.png"), join(target, "icon.png"));
    }
    if (!data.readmeExists) {
      await super.write(uri, data, source, target, file);
    }
  }
}

const agent = new SmolDappAgent();

for (const chainIdStr of await readdir(".repo/tokens")) {
  if (chainIdStr.startsWith("_")) continue;
  if (chainIdStr.endsWith(".json")) continue;

  const chainId = parseInt(chainIdStr, 10);
  if (isNaN(chainId)) continue;
  if (SKIP_CHAINS.has(chainId)) continue;

  const chain = findChain(chainId);
  if (!chain) {
    console.warn(`No viem chain definition for chainId ${chainId}, skipping`);
    continue;
  }

  console.log(`Processing chain ${chain.name} (${chainId})...`);

  const client = createPublicClient({
    chain,
    transport: createTransport(chainId),
    batch: {
      multicall: true,
    },
  });

  agent.setChain(chainId, client);

  await agent.walk(join(".repo/tokens", chainIdStr), {
    filter: () => true,
    toUri: (data) => `eip155/${chainId}/${data.address.toLowerCase()}`,
  });
}
