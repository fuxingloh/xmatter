import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import { XmatterFile, XmatterSchema } from "xmatter/schema";
import { FileSystemAgent, hasFile } from "@workspace/agent-base/fs";

const NATIVE_ETH_SENTINEL = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

interface PolygonToken {
  chainId: number;
  name: string;
  symbol: string;
  decimals?: number;
  originTokenAddress: string;
  originNetworkId: number;
  tags?: string[];
  logoURI?: string;
  wrappedTokens?: unknown[];
}

export class PolygonTokenList extends FileSystemAgent<PolygonToken> {
  readEntry(): Promise<PolygonToken | undefined> {
    throw new Error("Not used — tokens are read from JSON arrays directly.");
  }

  toReadmeFile(_uri: string, token: PolygonToken): XmatterFile {
    const standards = token.tags?.includes("erc20") ? ["erc20"] : ["erc20"];

    return {
      data: {
        name: token.name,
        provenance: "https://github.com/maticnetwork/polygon-token-list",
        standards,
        symbol: token.symbol,
        ...(token.decimals !== undefined && { decimals: Number(token.decimals) }),
        icons: [],
      },
      content: "",
    };
  }

  async processFile(filePath: string): Promise<void> {
    const raw = await readFile(filePath, { encoding: "utf-8" });
    const tokens: PolygonToken[] = JSON.parse(raw);

    for (const token of tokens) {
      if (token.originTokenAddress.toLowerCase() === NATIVE_ETH_SENTINEL) {
        continue;
      }

      const uri = `eip155/${token.chainId}/${token.originTokenAddress.toLowerCase()}`;
      const targetPath = join("../../xmatter", uri);

      const file = this.toReadmeFile(uri, token);
      const parsed = XmatterSchema.safeParse(file);
      if (!parsed.success) {
        console.error(`Invalid README for ${targetPath}, ${parsed.error}`);
        continue;
      }

      if (await hasFile(join(targetPath, "LOCK"))) {
        continue;
      }

      await mkdir(targetPath, { recursive: true });
      await this.write(uri, token, filePath, targetPath, parsed.data);
    }
  }
}

const agent = new PolygonTokenList();

const files = [
  ".repo/src/tokens/defaultTokens.json",
  ".repo/src/tokens/mappedTokens.json",
  ".repo/src/tokens/defaultTokensTestnet.json",
  ".repo/src/tokens/mappedTokensTestnet.json",
];

for (const file of files) {
  console.log(`Processing ${file}...`);
  await agent.processFile(file);
}
