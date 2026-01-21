import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { XmatterFile } from "xmatter/schema";
import { FileSystemAgent, hasFile, copyIf } from "@workspace/agent-base/fs";

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
    if (!(await hasFile(join(target, "README.md")))) {
      await super.write(uri, data, source, target, file);
    }

    if (!(await hasFile(join(target, "icon.png")))) {
      await copyIf(join(source, "logo.png"), join(target, "icon.png"));
    }

    if (!(await hasFile(join(target, "icon.svg")))) {
      await copyIf(join(source, "logo.svg"), join(target, "icon.svg"));
    }
  }

  toReadmeFile(uri: string, data: TokenData): XmatterFile {
    const links: XmatterFile["data"]["links"] = [];
    if (data.website) links.push({ name: "website", url: data.website });
    if (data.twitter) {
      links.push({ name: "x", url: `https://x.com/${data.twitter.replace("@", "")}` });
    }

    const file = {
      data: {
        name: data.name,
        provenance: "https://github.com/ethereum-optimism/ethereum-optimism.github.io",
        standards: ["erc20"],
        symbol: data.symbol,
        decimals: data.decimals,
        links: links,
      },
      content: data.description,
    };

    if (uri.startsWith("eip155/1/") && data.tokens.ethereum.overrides) {
      file.data.name = data.tokens.ethereum.overrides?.name ?? data.name;
      file.data.symbol = data.tokens.ethereum.overrides?.symbol ?? data.symbol;
      file.data.decimals = data.tokens.ethereum.overrides?.decimals ?? data.decimals;
    } else if (uri.startsWith("eip155/10/") && data.tokens.optimism.overrides) {
      file.data.name = data.tokens.optimism.overrides?.name ?? data.name;
      file.data.symbol = data.tokens.optimism.overrides?.symbol ?? data.symbol;
      file.data.decimals = data.tokens.optimism.overrides?.decimals ?? data.decimals;
    } else if (uri.startsWith("eip155/8453/") && data.tokens.base.overrides) {
      file.data.name = data.tokens.base.overrides?.name ?? data.name;
      file.data.symbol = data.tokens.base.overrides?.symbol ?? data.symbol;
      file.data.decimals = data.tokens.base.overrides?.decimals ?? data.decimals;
    }

    return file;
  }
}

const agent = new EthereumOptimism();

await agent.walk(".repo/data", {
  filter: (data) => !!data.tokens.ethereum,
  toUri: (data) => `eip155/1/${data.tokens.ethereum.address.toLowerCase()}`,
});

await agent.walk(".repo/data", {
  filter: (data) => !!data.tokens.optimism,
  toUri: (data) => `eip155/10/${data.tokens.optimism.address.toLowerCase()}`,
});

await agent.walk(".repo/data", {
  filter: (data) => !!data.tokens.base,
  toUri: (data) => `eip155/8453/${data.tokens.base.address.toLowerCase()}`,
});

await agent.walk(".repo/data", {
  filter: (data) => !!data.tokens.sepolia,
  toUri: (data) => `eip155/11155111/${data.tokens.sepolia.address.toLowerCase()}`,
});
