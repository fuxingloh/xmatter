import { mkdir, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import { XmatterFile, XmatterSchema } from "xmatter/schema";
import { FileSystemAgent, hasFile } from "@workspace/agent-base/fs";

interface Token {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
}

interface TokenList {
  name: string;
  tokens: Token[];
}

export class ArbitrumTokenList extends FileSystemAgent<Token> {
  async readEntry(): Promise<Token | undefined> {
    return undefined;
  }

  toReadmeFile(_uri: string, token: Token): XmatterFile {
    return {
      data: {
        name: token.name,
        provenance: "https://github.com/OffchainLabs/arbitrum-token-lists",
        standards: ["erc20"],
        symbol: token.symbol,
        decimals: token.decimals,
        icons: [],
      },
      content: "",
    };
  }
}

const agent = new ArbitrumTokenList();
const assetsDir = ".repo/src/Assets";

// Scan for token list JSON files in the Assets directory
for (const filename of await readdir(assetsDir)) {
  if (!filename.endsWith("_token_list.json")) continue;

  const filePath = join(assetsDir, filename);
  console.log(`Processing ${filename}...`);

  const raw = await readFile(filePath, { encoding: "utf-8" });
  const tokenList = JSON.parse(raw) as TokenList;

  if (!tokenList.tokens || !Array.isArray(tokenList.tokens)) {
    console.warn(`Skipping ${filename}: no tokens array found`);
    continue;
  }

  for (const token of tokenList.tokens) {
    if (!token.address || !token.chainId) continue;

    const uri = `eip155/${token.chainId}/${token.address.toLowerCase()}`;
    const targetPath = join("../../xmatter", uri);

    const file = agent.toReadmeFile(uri, token);
    const parsed = XmatterSchema.safeParse(file);
    if (!parsed.success) {
      console.error(`Invalid README for ${uri}, ${parsed.error}`);
      continue;
    }

    if (await hasFile(join(targetPath, "LOCK"))) continue;

    await mkdir(targetPath, { recursive: true });
    await agent.write(uri, token, "", targetPath, parsed.data);
    console.log(`Wrote ${uri} (${token.name})`);
  }
}
