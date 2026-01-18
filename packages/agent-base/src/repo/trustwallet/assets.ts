import { copyFile, readFile } from "node:fs/promises";
import { join } from "node:path";

import { README } from "../../README";
import { hasFile, SyncCommand } from "../../SyncCommand";

interface Info {
  name: string;
  website: string;
  description: string;
  explorer: string;
  type: string;
  symbol: string;
  decimals: number;
  status: string;
  id: string;
  tags: string[];
  links: {
    name: string;
    url: string;
  }[];
}

export class TrustWalletAssets extends SyncCommand<Info> {
  static override paths = [[`trustwallet/assets`]];

  async execute(): Promise<void> {
    await this.walkDir("repo/blockchains/ethereum/assets", {
      toPath: (data) => `../../packages/eip155-1/frontmatter/erc20/${data.id}`,
      filter: (data) => data.type === "ERC20",
    });

    await this.walkDir("repo/blockchains/polygon/assets", {
      toPath: (data) => `../../packages/eip155-137/frontmatter/erc20/${data.id}`,
      filter: (data) => data.type === "POLYGON",
    });

    await this.walkDir("repo/blockchains/avalanchec/assets", {
      toPath: (data) => `../../packages/eip155-43114/frontmatter/erc20/${data.id}`,
      filter: (data) => data.type === "AVALANCHE",
    });

    await this.walkDir("repo/blockchains/smartchain/assets", {
      toPath: (data) => `../../packages/eip155-56/frontmatter/erc20/${data.id}`,
      filter: (data) => data.type === "BEP20",
    });

    await this.walkDir("repo/blockchains/arbitrum/assets", {
      toPath: (data) => `../../packages/eip155-42161/frontmatter/erc20/${data.id}`,
      filter: (data) => data.type === "ARBITRUM",
    });

    await this.walkDir("repo/blockchains/optimism/assets", {
      toPath: (data) => `../../packages/eip155-10/frontmatter/erc20/${data.id}`,
      filter: (data) => data.type === "OPTIMISM",
    });

    await this.walkDir("repo/blockchains/aurora/assets", {
      toPath: (data) => `../../packages/eip155-1313161554/frontmatter/erc20/${data.id}`,
      filter: (data) => data.type === "AURORA",
    });

    await this.walkDir("repo/blockchains/celo/assets", {
      toPath: (data) => `../../packages/eip155-42220/frontmatter/erc20/${data.id}`,
      filter: (data) => data.type === "CELO",
    });

    await this.walkDir("repo/blockchains/base/assets", {
      toPath: (data) => `../../packages/eip155-8453/frontmatter/erc20/${data.id}`,
      filter: (data) => data.type === "BASE",
    });

    await this.walkDir("repo/blockchains/tron/assets", {
      toPath: (data) => `../../packages/tip474-728126428/frontmatter/trc10/${data.id}`,
      filter: (data) => data.type === "TRC10",
    });

    await this.walkDir("repo/blockchains/tron/assets", {
      toPath: (data) => `../../packages/tip474-728126428/frontmatter/trc20/${data.id}`,
      filter: (data) => data.type === "TRC20",
    });

    await this.walkDir("repo/blockchains/solana/assets", {
      toPath: (data) => `../../packages/solana-5eykt4usfv8p8njdtrepy1vzqkqzkvdp/frontmatter/token/${data.id}`,
      filter: (data) => data.type === "SPL",
    });
  }

  async readData(path: string): Promise<Info | undefined> {
    return JSON.parse(
      await readFile(join(path, "info.json"), {
        encoding: "utf-8",
      }),
    ) as Info;
  }

  async write(data: Info, fromPath: string, toPath: string, readme: README): Promise<void> {
    await super.write(data, fromPath, toPath, readme);

    const logoPath = join(fromPath, "logo.png");
    if (await hasFile(logoPath)) {
      await copyFile(logoPath, join(toPath, "icon.png"));
    }
  }

  toREADME(data: Info): README {
    return {
      frontmatter: {
        symbol: data.symbol,
        decimals: data.decimals,
        tags: data.tags,
        links: createLinks(data),
      },
      title: data.name,
      body: hasDescription(data) ? data.description : "",
    };
  }
}

function hasDescription(info: Info): boolean {
  if (!info.description) return false;
  return info.description.replaceAll(/[-—_.]/g, "").trim() !== "";
}

function createLinks(info: Partial<Info>): README["frontmatter"]["links"] {
  const links: Info["links"] = [];
  if (info.website) links.push({ name: "website", url: info.website });
  if (info.explorer) links.push({ name: "explorer", url: info.explorer });

  if (info.links) {
    for (const link of info.links) {
      if (link.name === "website" || link.name === "explorer") continue;
      if (!link.url?.startsWith("https://")) continue;
      if (!link.name) continue;
      links.push(link);
    }
  }
  return links;
}
