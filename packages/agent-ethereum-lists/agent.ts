import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { XmatterFile } from "xmatter/schema";
import { FileSystemAgent, hasFile } from "@workspace/agent-base/fs";
import { FetchWithIgnore } from "@workspace/agent-base/fetch";

interface TokenInfo {
  symbol: string;
  address: string;
  decimals?: number;
  name: string;
  ens_address: string;
  website: string;
  logo: {
    src: string;
    width: string;
    height: string;
    ipfs_hash: string;
  };
  support: {
    email: string;
    url: string;
  };
  social: {
    blog: string;
    chat: string;
    facebook: string;
    forum: string;
    github: string;
    gitter: string;
    instagram: string;
    linkedin: string;
    reddit: string;
    slack: string;
    telegram: string;
    twitter: string;
    youtube: string;
  };
}

const CHAINS: Record<string, number> = {
  eth: 1,
  arb: 42161,
  avax: 43114,
  bsc: 56,
  etc: 61,
  gor: 5,
  kov: 42,
  rin: 4,
  rop: 3,
  rsk: 30,
  sonic: 146,
  zks: 324,
  plume: 98866,
  ella: 64,
  esn: 31102,
  ubq: 8,
};

export class EthereumListsTokens extends FileSystemAgent<TokenInfo> {
  async readEntry(sourcePath: string): Promise<TokenInfo | undefined> {
    if (!sourcePath.endsWith(".json")) return undefined;

    try {
      return JSON.parse(
        await readFile(sourcePath, {
          encoding: "utf-8",
        }),
      ) as TokenInfo;
    } catch {
      return undefined;
    }
  }

  toReadmeFile(uri: string, data: TokenInfo): XmatterFile {
    const links: XmatterFile["data"]["links"] = [];

    if (data.website?.startsWith("https://")) {
      links.push({ name: "website", url: data.website });
    }

    if (data.social) {
      if (data.social.twitter?.startsWith("https://")) {
        links.push({ name: "x", url: data.social.twitter });
      }
      if (data.social.telegram?.startsWith("https://")) {
        links.push({ name: "telegram", url: data.social.telegram });
      }
      if (data.social.github?.startsWith("https://")) {
        links.push({ name: "github", url: data.social.github });
      }
      if (data.social.reddit?.startsWith("https://")) {
        links.push({ name: "reddit", url: data.social.reddit });
      }
      if (data.social.blog?.startsWith("https://")) {
        links.push({ name: "blog", url: data.social.blog });
      }
    }

    return {
      data: {
        name: data.name,
        provenance: "https://github.com/ethereum-lists/tokens",
        standards: ["erc20"],
        symbol: data.symbol,
        ...(data.decimals !== undefined && { decimals: Number(data.decimals) }),
        links: links,
        icons: [],
      },
      content: "",
    };
  }

  async write(uri: string, data: TokenInfo, source: string, target: string, file: XmatterFile): Promise<void> {
    if (data.logo?.src) {
      await fetcher.copyIcon(data.logo.src, target);
    }
    await super.write(uri, data, source, target, file);
  }
}

const fetcher = new FetchWithIgnore();
const agent = new EthereumListsTokens();

for (const [chain, chainId] of Object.entries(CHAINS)) {
  const dir = `.repo/tokens/${chain}`;
  if (!(await hasFile(dir))) {
    console.warn(`Skipping ${dir}: directory not found`);
    continue;
  }

  await agent.walk(dir, {
    filter: () => true,
    toUri: (data) => `eip155/${chainId}/${data.address.toLowerCase()}`,
  });
}
