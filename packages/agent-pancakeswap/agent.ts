import { mkdir, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import { XmatterFile, XmatterSchema } from "xmatter/schema";
import { FileSystemAgent, hasFile } from "@workspace/agent-base/fs";
import { FetchWithIgnore } from "@workspace/agent-base/fetch";

interface Token {
  address: string;
  chainId: number;
  decimals: number;
  name: string;
  symbol: string;
  logoURI?: string;
}

function shouldProcessFile(filename: string): boolean {
  if (!filename.startsWith("pancakeswap-")) return false;
  if (!filename.endsWith(".json")) return false;

  // Only process -default.json and -extended.json files
  if (filename.endsWith("-default.json") || filename.endsWith("-extended.json")) return true;

  return false;
}

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
const agent = new PancakeSwapTokenList();

const tokensDir = ".repo/src/tokens";
const files = await readdir(tokensDir);

for (const filename of files) {
  if (!shouldProcessFile(filename)) continue;

  const filePath = join(tokensDir, filename);
  console.log(`Processing ${filename}...`);

  let tokens: Token[];
  try {
    tokens = JSON.parse(await readFile(filePath, { encoding: "utf-8" })) as Token[];
  } catch (error) {
    console.error(`Failed to parse ${filename}:`, error);
    continue;
  }

  if (!Array.isArray(tokens)) {
    console.warn(`Skipping ${filename}: not an array`);
    continue;
  }

  for (const token of tokens) {
    if (!token.address || !token.address.startsWith("0x") || !token.name || !token.chainId) continue;

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
