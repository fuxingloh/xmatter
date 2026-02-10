import { mkdir, readdir } from "node:fs/promises";
import { basename, join } from "node:path";

import { createPublicClient, fallback, http } from "viem";
import * as viemChains from "viem/chains";
import { XmatterFile, XmatterSchema } from "xmatter/schema";
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
  const options = { timeout: 10_000, retryCount: 0 } as const;
  const extraRpcs = EXTRA_RPCS[chainId] ?? [];
  if (extraRpcs.length > 0) {
    return fallback([http(undefined, options), ...extraRpcs.map((url) => http(url, options))], options);
  }
  return http(undefined, options);
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
  private cooldownCount = 0;
  private readonly maxCooldowns = 10;
  private readonly cooldownDuration = 90_000; // 90 seconds in milliseconds

  setChain(chainId: number, client: any): void {
    this.chainId = chainId;
    this.client = client;
  }

  private async handleRateLimitError(): Promise<void> {
    this.cooldownCount++;

    if (this.cooldownCount > this.maxCooldowns) {
      console.error(`Rate limit cooldown exceeded maximum (${this.maxCooldowns}). Exiting.`);
      process.exit(1);
    }

    console.warn(
      `Rate limit detected (429). Cooldown ${this.cooldownCount}/${this.maxCooldowns}. Waiting ${this.cooldownDuration / 1000} seconds...`,
    );

    await new Promise((resolve) => setTimeout(resolve, this.cooldownDuration));

    console.log(`Cooldown complete. Resuming operations.`);
  }

  private isRateLimitError(error: any): boolean {
    // Check for 429 status code in various error formats
    if (error?.status === 429) return true;
    if (error?.response?.status === 429) return true;
    if (error?.statusCode === 429) return true;

    // Check error message for rate limit indicators
    const errorMessage = error?.message || error?.toString() || "";
    const rateLimitPatterns = [/429/, /rate limit/i, /too many requests/i];

    return rateLimitPatterns.some((pattern) => pattern.test(errorMessage));
  }

  async readEntry(sourcePath: string): Promise<TokenEntry | undefined> {
    const address = basename(sourcePath);
    if (!address.startsWith("0x") || address.length !== 42) return undefined;
    if (address.toLowerCase() === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") return undefined;

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
          .catch((error: any) => {
            if (this.isRateLimitError(error)) {
              throw error; // Re-throw to be caught by outer catch
            }
            return undefined;
          }),
        this.client
          .readContract({
            address: address as `0x${string}`,
            abi: tokenAbi,
            functionName: "symbol",
          })
          .catch((error: any) => {
            if (this.isRateLimitError(error)) {
              throw error; // Re-throw to be caught by outer catch
            }
            return undefined;
          }),
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
    } catch (error) {
      if (this.isRateLimitError(error)) {
        await this.handleRateLimitError();
        // Retry the same entry after cooldown
        return this.readEntry(sourcePath);
      }
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

  override async walk(
    dir: string,
    options: { filter: (data: TokenEntry) => boolean; toUri: (data: TokenEntry) => string },
  ): Promise<void> {
    const entries = await readdir(dir);
    // Shuffle so partial failures on re-runs cover different addresses over time
    for (let i = entries.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [entries[i], entries[j]] = [entries[j], entries[i]];
    }

    for (const entry of entries) {
      const sourcePath = join(dir, entry);
      const data = await this.readEntry(sourcePath);
      if (data === undefined) continue;
      if (!options.filter(data)) continue;

      const uri = options.toUri(data);
      const targetPath = join("../../xmatter", uri);
      const file = this.toReadmeFile(uri, data);
      const parsed = XmatterSchema.safeParse(file);
      if (!parsed.success) {
        console.error(`Invalid README for ${targetPath}, ${parsed.error}`);
        continue;
      }

      if (await hasFile(join(targetPath, "LOCK"))) continue;

      await mkdir(targetPath, { recursive: true });
      await this.write(uri, data, sourcePath, targetPath, parsed.data);
    }
  }

  async write(uri: string, data: TokenEntry, source: string, target: string, file: XmatterFile): Promise<void> {
    if (data.hasLogoSvg) {
      await copyImage(join(source, "logo.svg"), join(target, "icon.svg"));
    }
    if (data.hasLogoPng) {
      await copyImage(join(source, "logo-128.png"), join(target, "icon.png"));
    }
    await super.write(uri, data, source, target, file);
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

  try {
    await agent.walk(join(".repo/tokens", chainIdStr), {
      filter: () => true,
      toUri: (data) => `eip155/${chainId}/${data.address.toLowerCase()}`,
    });
  } catch (error) {
    console.error(`Chain ${chainId} (${chain.name}) failed:`, error instanceof Error ? error.message : error);
  }
}
