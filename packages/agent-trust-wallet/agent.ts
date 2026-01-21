import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { XmatterFile } from "xmatter/schema";
import { FileSystemAgent, hasFile, copyImage } from "@workspace/agent-base/fs";

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

export class TrustWalletAssets extends FileSystemAgent<Info> {
  async readEntry(sourcePath: string): Promise<Info | undefined> {
    return JSON.parse(
      await readFile(join(sourcePath, "info.json"), {
        encoding: "utf-8",
      }),
    ) as Info;
  }

  async write(uri: string, data: Info, source: string, target: string, file: XmatterFile): Promise<void> {
    await copyImage(join(source, "logo.png"), join(target, "icon.png"));

    await super.write(uri, data, source, target, file);
  }

  toReadmeFile(uri: string, data: Info): XmatterFile {
    const links: XmatterFile["data"]["links"] = [];
    if (data.website) links.push({ name: "website", url: data.website });

    if (data.links) {
      for (const link of data.links) {
        if (link.name === "website" || link.name === "explorer") continue;
        if (!link.url?.startsWith("https://")) continue;
        if (!link.name) continue;
        if (link.name === "twitter") {
          link.name = "x";
        }

        links.push(link);
      }
    }

    const standards = getStandards(data.type);

    return {
      data: {
        name: data.name,
        provenance: "https://github.com/trustwallet/assets",
        standards: standards,
        symbol: data.symbol,
        decimals: data.decimals,
        links: links,
      },
      content: hasDescription(data) ? data.description : "",
    };
  }
}

function hasDescription(info: Info): boolean {
  if (!info.description) return false;
  return info.description.replaceAll(/[-—_.]/g, "").trim() !== "";
}

function getStandards(type: string): string[] {
  switch (type) {
    case "ERC20":
    case "POLYGON":
    case "AVALANCHE":
    case "BEP20":
    case "ARBITRUM":
    case "OPTIMISM":
    case "AURORA":
    case "CELO":
    case "BASE":
      return ["erc20"];
    case "TRC10":
      return ["trc10"];
    case "TRC20":
      return ["trc20"];
    case "SPL":
      return ["spl-token"];
    default:
      return [];
  }
}

const agent = new TrustWalletAssets();

await agent.walk(".repo/blockchains/ethereum/assets", {
  filter: (data) => data.type === "ERC20",
  toUri: (data) => `eip155/1/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/polygon/assets", {
  filter: (data) => data.type === "POLYGON",
  toUri: (data) => `eip155/137/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/avalanchec/assets", {
  filter: (data) => data.type === "AVALANCHE",
  toUri: (data) => `eip155/43114/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/smartchain/assets", {
  filter: (data) => data.type === "BEP20",
  toUri: (data) => `eip155/56/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/arbitrum/assets", {
  filter: (data) => data.type === "ARBITRUM",
  toUri: (data) => `eip155/42161/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/optimism/assets", {
  filter: (data) => data.type === "OPTIMISM",
  toUri: (data) => `eip155/10/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/aurora/assets", {
  filter: (data) => data.type === "AURORA",
  toUri: (data) => `eip155/1313161554/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/celo/assets", {
  filter: (data) => data.type === "CELO",
  toUri: (data) => `eip155/42220/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/base/assets", {
  filter: (data) => data.type === "BASE",
  toUri: (data) => `eip155/8453/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/tron/assets", {
  filter: (data) => data.type === "TRC10",
  toUri: (data) => `tip474/728126428/trc10/${data.id}`,
});

await agent.walk(".repo/blockchains/tron/assets", {
  filter: (data) => data.type === "TRC20",
  toUri: (data) => `tip474/728126428/trc20/${data.id}`,
});

await agent.walk(".repo/blockchains/solana/assets", {
  filter: (data) => data.type === "SPL",
  toUri: (data) => `solana/5eykt4usfv8p8njdtrepy1vzqkqzkvdp/${data.id}`,
});
