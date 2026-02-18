import { mkdir, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import { XmatterFile, XmatterSchema } from "xmatter/schema";
import { FileSystemAgent, hasFile } from "@workspace/agent-base/fs";

interface Token {
  name: string;
  address: string;
  symbol: string;
  decimals: number;
  chainId: number;
  logoURI?: string;
  extensions?: {
    bridgeInfo?: Record<string, { tokenAddress: string }>;
  };
}

class UniswapTokenList extends FileSystemAgent<Token> {
  async readEntry(sourcePath: string): Promise<Token | undefined> {
    return undefined;
  }

  toReadmeFile(uri: string, data: Token): XmatterFile {
    return {
      data: {
        name: data.name,
        provenance: "https://github.com/Uniswap/default-token-list",
        standards: ["erc20"],
        symbol: data.symbol,
        decimals: data.decimals,
        icons: [],
      },
      content: "",
    };
  }

  async ingest(sourceDir: string): Promise<void> {
    const files = await readdir(sourceDir);

    for (const file of files) {
      if (!file.endsWith(".json")) continue;

      const filePath = join(sourceDir, file);
      const content = await readFile(filePath, { encoding: "utf-8" });
      const tokens: Token[] = JSON.parse(content);

      for (const token of tokens) {
        const uri = `eip155/${token.chainId}/${token.address.toLowerCase()}`;
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
}

const agent = new UniswapTokenList();
await agent.ingest(".repo/src/tokens");
