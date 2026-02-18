import { mkdir, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import { XmatterFile, XmatterSchema } from "xmatter/schema";
import { FileSystemAgent, hasFile } from "@workspace/agent-base/fs";
import { FetchWithIgnore } from "@workspace/agent-base/fetch";

interface TokenList {
  name: string;
  tokens: Token[];
}

interface Token {
  address: string;
  chainId: number;
  decimals: number;
  name: string;
  symbol: string;
  logoURI?: string;
}

// Skip aggregate/non-chain-specific token lists
const SKIP_FILES = new Set([
  "all.tokenlist.json",
  "farms.tokenlist.json",
  "top.tokenlist.json",
  "unverified.tokenlist.json",
  "test.tokenlist.json",
]);

export class ElkFinanceTokenList extends FileSystemAgent<Token> {
  async readEntry(): Promise<Token | undefined> {
    return undefined;
  }

  toReadmeFile(_uri: string, token: Token): XmatterFile {
    return {
      data: {
        name: token.name,
        provenance: "https://github.com/elkfinance/tokens",
        standards: ["erc20"],
        symbol: token.symbol,
        ...(token.decimals !== undefined && { decimals: Number(token.decimals) }),
        icons: [],
      },
      content: "",
    };
  }

  async write(uri: string, token: Token, source: string, target: string, file: XmatterFile): Promise<void> {
    if (token.logoURI) {
      await fetcher.copyIcon(token.logoURI, target);
    }
    await super.write(uri, token, source, target, file);
  }
}

const fetcher = new FetchWithIgnore();
const agent = new ElkFinanceTokenList();

const tokenlistDir = ".repo";
const files = await readdir(tokenlistDir);

for (const filename of files) {
  if (!filename.endsWith(".tokenlist.json")) continue;
  if (SKIP_FILES.has(filename)) continue;

  const filePath = join(tokenlistDir, filename);
  console.log(`Processing ${filename}...`);

  let tokenList: TokenList;
  try {
    tokenList = JSON.parse(await readFile(filePath, { encoding: "utf-8" })) as TokenList;
  } catch (error) {
    console.error(`Failed to parse ${filename}:`, error);
    continue;
  }

  if (!Array.isArray(tokenList.tokens)) {
    console.warn(`Skipping ${filename}: no tokens array`);
    continue;
  }

  for (const token of tokenList.tokens) {
    if (!token.address || !token.name || !token.chainId) continue;

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
    await agent.write(uri, token, filePath, targetPath, parsed.data);
  }
}
