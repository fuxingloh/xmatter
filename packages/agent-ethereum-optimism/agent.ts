import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { XmatterFile } from "xmatter/schema";
import { FileSystemAgent, copyImage } from "@workspace/agent-base/fs";

const CHAINS: { chain: string; chainId: number }[] = [
  { chain: "ethereum", chainId: 1 },
  { chain: "optimism", chainId: 10 },
  { chain: "base", chainId: 8453 },
  { chain: "unichain", chainId: 130 },
  { chain: "optimism-sepolia", chainId: 11155420 },
  { chain: "base-sepolia", chainId: 84532 },
  { chain: "unichain-sepolia", chainId: 1301 },
  { chain: "sepolia", chainId: 11155111 },
  { chain: "mode", chainId: 34443 },
  { chain: "lisk", chainId: 1135 },
  { chain: "lisk-sepolia", chainId: 4202 },
  { chain: "redstone", chainId: 690 },
  { chain: "metall2", chainId: 1750 },
  { chain: "metall2-sepolia", chainId: 1740 },
  { chain: "soneium", chainId: 1868 },
  { chain: "soneium-minato", chainId: 1946 },
  { chain: "celo", chainId: 42220 },
  { chain: "celo-sepolia", chainId: 44787 },
  { chain: "swellchain", chainId: 1923 },
  { chain: "ink", chainId: 57073 },
  { chain: "ink-sepolia", chainId: 763373 },
  { chain: "worldchain", chainId: 480 },
  { chain: "worldchain-sepolia", chainId: 4801 },
];

interface Token {
  address: string;
  overrides?: {
    bridge?: string | Partial<Record<string, string>>;
    name?: string;
    symbol?: string;
    decimals?: number;
  };
}

interface TokenData {
  nonstandard?: boolean;
  nobridge?: boolean;
  twitter?: string;
  name: string;
  symbol: string;
  decimals: number;
  description: string;
  website: string;
  tokens: Partial<Record<string, Token>>;
}

export class EthereumOptimism extends FileSystemAgent<TokenData> {
  async readEntry(sourcePath: string): Promise<TokenData | undefined> {
    return JSON.parse(
      await readFile(join(sourcePath, "data.json"), {
        encoding: "utf-8",
      }),
    ) as TokenData;
  }

  async write(uri: string, data: TokenData, source: string, target: string, file: XmatterFile): Promise<void> {
    await copyImage(join(source, "logo.png"), join(target, "icon.png"));
    await copyImage(join(source, "logo.svg"), join(target, "icon.svg"));

    await super.write(uri, data, source, target, file);
  }

  override toReadmeFile(uri: string, data: TokenData): XmatterFile {
    const links: XmatterFile["data"]["links"] = [];
    if (data.website) links.push({ name: "website", url: data.website });
    if (data.twitter) {
      links.push({ name: "x", url: `https://x.com/${data.twitter.replace("@", "")}` });
    }

    const file: XmatterFile = {
      data: {
        name: data.name,
        provenance: "https://github.com/ethereum-optimism/ethereum-optimism.github.io",
        standards: ["erc20"],
        symbol: data.symbol,
        decimals: data.decimals,
        links: links,
        icons: [],
      },
      content: data.description,
    };

    for (const { chain, chainId } of CHAINS) {
      if (uri.startsWith(`eip155/${chainId}/`)) {
        const overrides = data.tokens[chain]?.overrides;
        if (overrides) {
          file.data.name = overrides.name ?? data.name;
          file.data.symbol = overrides.symbol ?? data.symbol;
          file.data.decimals = overrides.decimals ?? data.decimals;
        }
        break;
      }
    }

    return file;
  }
}

const agent = new EthereumOptimism();

for (const { chain, chainId } of CHAINS) {
  await agent.walk(".repo/data", {
    filter: (data) => !!data.tokens[chain],
    toUri: (data) => `eip155/${chainId}/${data.tokens[chain]!.address.toLowerCase()}`,
  });
}
