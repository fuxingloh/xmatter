import { mkdir, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import { XmatterFile, XmatterSchema } from "xmatter/schema";
import { FileSystemAgent, hasFile } from "@workspace/agent-base/fs";

interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals?: number;
  chainId: number;
  logoURI?: string;
  coingeckoId?: string | null;
  listedIn?: string[];
}

const SKIP_FILES = new Set(["solana.json"]);

function shouldSkipFile(filename: string): boolean {
  if (SKIP_FILES.has(filename)) return true;

  // Skip numeric-only filenames (e.g., 101.json, 102.json)
  const nameWithoutExt = filename.replace(/\.json$/, "");
  if (/^\d+$/.test(nameWithoutExt)) return true;

  return false;
}

export class ViaProtocolTokenList extends FileSystemAgent<Token> {
  async readEntry(_sourcePath: string): Promise<Token | undefined> {
    // Not used — tokens are read directly from JSON arrays
    return undefined;
  }

  toReadmeFile(_uri: string, token: Token): XmatterFile {
    return {
      data: {
        name: token.name,
        provenance: "https://github.com/viaprotocol/tokenlists",
        standards: ["erc20"],
        symbol: token.symbol,
        ...(token.decimals !== undefined && { decimals: Number(token.decimals) }),
        icons: [],
      },
      content: "",
    };
  }
}

const agent = new ViaProtocolTokenList();
const tokenlistsDir = ".repo/tokenlists";

const files = await readdir(tokenlistsDir);

for (const filename of files) {
  if (!filename.endsWith(".json")) continue;
  if (shouldSkipFile(filename)) continue;

  const filePath = join(tokenlistsDir, filename);
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
