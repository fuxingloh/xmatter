import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { XmatterFile } from "xmatter/schema";
import { FileSystemAgent, copyImage } from "@workspace/agent-base/fs";

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
        icons: [],
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
    case "FANTOM":
    case "ETC20":
    case "MANTLE":
    case "SONIC":
    case "BLAST":
    case "MONAD":
    case "TT20":
    case "HRC20":
    case "MERLIN":
    case "SCROLL":
    case "METER":
    case "KRC20":
    case "XDAI":
    case "ZKSYNC":
    case "PLASMA":
    case "LINEA":
    case "TRC21":
    case "MEGAETH":
    case "BOUNCEBIT":
    case "ZKEVM":
    case "GO20":
    case "WAN20":
    case "ZKLINK":
    case "MOONBEAM":
    case "OPBNB":
    case "KIP20":
    case "RONIN":
    case "KAIA":
    case "POA20":
    case "CONFLUX":
    case "KAVAEVM":
    case "MANTA":
    case "MOONRIVER":
    case "ACALAEVM":
    case "CRC20":
    case "ZETACHAIN":
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

await agent.walk(".repo/blockchains/fantom/assets", {
  filter: (data) => data.type === "FANTOM",
  toUri: (data) => `eip155/250/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/classic/assets", {
  filter: (data) => data.type === "ETC20",
  toUri: (data) => `eip155/61/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/mantle/assets", {
  filter: (data) => data.type === "MANTLE",
  toUri: (data) => `eip155/5000/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/sonic/assets", {
  filter: (data) => data.type === "SONIC",
  toUri: (data) => `eip155/146/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/blast/assets", {
  filter: (data) => data.type === "BLAST",
  toUri: (data) => `eip155/81457/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/monad/assets", {
  filter: (data) => data.type === "MONAD",
  toUri: (data) => `eip155/143/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/thundertoken/assets", {
  filter: (data) => data.type === "TT20",
  toUri: (data) => `eip155/108/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/heco/assets", {
  filter: (data) => data.type === "HRC20",
  toUri: (data) => `eip155/128/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/merlin/assets", {
  filter: (data) => data.type === "MERLIN",
  toUri: (data) => `eip155/4200/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/scroll/assets", {
  filter: (data) => data.type === "SCROLL",
  toUri: (data) => `eip155/534352/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/meter/assets", {
  filter: (data) => data.type === "METER",
  toUri: (data) => `eip155/82/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/kcc/assets", {
  filter: (data) => data.type === "KRC20",
  toUri: (data) => `eip155/321/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/xdai/assets", {
  filter: (data) => data.type === "XDAI",
  toUri: (data) => `eip155/100/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/zksync/assets", {
  filter: (data) => data.type === "ZKSYNC",
  toUri: (data) => `eip155/324/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/plasma/assets", {
  filter: (data) => data.type === "PLASMA",
  toUri: (data) => `eip155/9745/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/linea/assets", {
  filter: (data) => data.type === "LINEA",
  toUri: (data) => `eip155/59144/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/tomochain/assets", {
  filter: (data) => data.type === "TRC21",
  toUri: (data) => `eip155/88/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/megaeth/assets", {
  filter: (data) => data.type === "MEGAETH",
  toUri: (data) => `eip155/4326/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/bouncebit/assets", {
  filter: (data) => data.type === "BOUNCEBIT",
  toUri: (data) => `eip155/6001/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/polygonzkevm/assets", {
  filter: (data) => data.type === "ZKEVM",
  toUri: (data) => `eip155/1101/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/gochain/assets", {
  filter: (data) => data.type === "GO20",
  toUri: (data) => `eip155/60/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/wanchain/assets", {
  filter: (data) => data.type === "WAN20",
  toUri: (data) => `eip155/888/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/zklink/assets", {
  filter: (data) => data.type === "ZKLINK",
  toUri: (data) => `eip155/810180/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/moonbeam/assets", {
  filter: (data) => data.type === "MOONBEAM",
  toUri: (data) => `eip155/1284/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/opbnb/assets", {
  filter: (data) => data.type === "OPBNB",
  toUri: (data) => `eip155/204/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/okc/assets", {
  filter: (data) => data.type === "KIP20",
  toUri: (data) => `eip155/66/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/ronin/assets", {
  filter: (data) => data.type === "RONIN",
  toUri: (data) => `eip155/2020/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/klaytn/assets", {
  filter: (data) => data.type === "KAIA",
  toUri: (data) => `eip155/8217/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/poa/assets", {
  filter: (data) => data.type === "POA20",
  toUri: (data) => `eip155/99/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/cfxevm/assets", {
  filter: (data) => data.type === "CONFLUX",
  toUri: (data) => `eip155/1030/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/kavaevm/assets", {
  filter: (data) => data.type === "KAVAEVM",
  toUri: (data) => `eip155/2222/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/manta/assets", {
  filter: (data) => data.type === "MANTA",
  toUri: (data) => `eip155/169/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/moonriver/assets", {
  filter: (data) => data.type === "MOONRIVER",
  toUri: (data) => `eip155/1285/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/acalaevm/assets", {
  filter: (data) => data.type === "ACALAEVM",
  toUri: (data) => `eip155/787/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/cronos/assets", {
  filter: (data) => data.type === "CRC20",
  toUri: (data) => `eip155/25/${data.id.toLowerCase()}`,
});

await agent.walk(".repo/blockchains/zetachain/assets", {
  filter: (data) => data.type === "ZETACHAIN",
  toUri: (data) => `eip155/7000/${data.id.toLowerCase()}`,
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
