import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import { XmatterFile, XmatterSchema } from "xmatter/schema";
import { FileSystemAgent, hasFile } from "@workspace/agent-base/fs";

interface Token {
  name: string;
  symbol: string;
  address: string;
  chainId: number;
  decimals: number;
  logoURI?: string;
}

interface TokenList {
  name: string;
  tokens: Token[];
}

const TOKEN_LIST_FILES = [
  "pancakeswap-default.json",
  "pancakeswap-extended.json",
  "pancakeswap-eth-default.json",
  "pancakeswap-arbitrum-default.json",
  "pancakeswap-base-default.json",
  "pancakeswap-zksync-default.json",
  "pancakeswap-polygon-zkevm-default.json",
  "pancakeswap-linea-default.json",
  "pancakeswap-opbnb-default.json",
  "pancakeswap-scroll-default.json",
];

export class PancakeSwapTokenList extends FileSystemAgent<Token> {
  async readEntry(): Promise<Token | undefined> {
    return undefined;
  }

  toReadmeFile(_uri: string, token: Token): XmatterFile {
    return {
      data: {
        name: token.name,
        provenance: "https://github.com/pancakeswap/token-list",
        standards: ["erc20"],
        symbol: token.symbol,
        decimals: token.decimals,
        icons: [],
      },
      content: "",
    };
  }
}

const agent = new PancakeSwapTokenList();

for (const filename of TOKEN_LIST_FILES) {
  const filePath = join(".repo/lists", filename);

  if (!(await hasFile(filePath))) {
    console.warn(`Skipping ${filename}: file not found`);
    continue;
  }

  const raw = await readFile(filePath, { encoding: "utf-8" });
  const tokenList: TokenList = JSON.parse(raw);

  console.log(`Processing ${filename} (${tokenList.tokens.length} tokens)...`);

  for (const token of tokenList.tokens) {
    const uri = `eip155/${token.chainId}/${token.address.toLowerCase()}`;
    const targetPath = join("../../xmatter", uri);

    const file = agent.toReadmeFile(uri, token);
    const parsed = XmatterSchema.safeParse(file);
    if (!parsed.success) {
      console.error(`Invalid README for ${uri}, ${parsed.error}`);
      continue;
    }

    if (await hasFile(join(targetPath, "LOCK"))) {
      continue;
    }

    await mkdir(targetPath, { recursive: true });
    await agent.write(uri, token, "", targetPath, parsed.data);
  }
}
