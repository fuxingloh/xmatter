import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

export interface FrontmatterLink {
  name: string;
  url: string;
}

export interface FrontmatterImage {
  type: string;
  mime: string;
  size: {
    width: number;
    height: number;
  };
  path: string;
}

export interface FrontmatterIndex {
  path: string;
  fileId: string;
  modifiedDate: number;
  type: string;
  fields: {
    caip2: string;
    namespace: string;
    symbol: string;
    decimals: number;
    title?: string;
    description?: string;
    tags?: string[];
    links?: FrontmatterLink[];
    images: FrontmatterImage[];
  };
}

export interface FrontmatterContent extends FrontmatterIndex {
  html: string;
}

export interface FrontmatterNamespace {
  package: string;
  caip2: string;
  dir: string;
  namespace: string;
}

/**
 * Decode CAIP-19 3 parts:
 * - CAIP-2
 * - Namespace
 * - Reference
 *
 * @return {[string, string, string]}
 */
export function decodeCaip19(caip19: string): string[] {
  const [caip2, asset] = caip19.split("/");
  const [namespace, reference] = asset.split(":");
  return [caip2, namespace, reference];
}

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function hasFile(filepath: string): Promise<boolean> {
  return stat(filepath).then(
    () => true,
    () => false,
  );
}

/**
 * Convert CAIP-19 into fileId deterministically.
 * If Namespace is ERC20, the address field will be converted to lowercase.
 */
export function getFileId(caip19: string): string {
  const [caip2, namespace, reference] = decodeCaip19(caip19);

  if (namespace === "erc20" && reference) {
    return sha256(`${caip2}/${namespace}:${reference.toLowerCase()}`);
  }
  return sha256(caip19);
}

/**
 * Get the index path for a given CAIP-2 and Namespace
 */
export function getIndexPath(caip2: string, namespace: string): string {
  return `index.${sha256(`${caip2}/${namespace}`)}.json`;
}

export function getNodeModulesPath(caip2: string, namespace: string, file: string) {
  const [caip2Type, caip2Reference] = caip2.split(":");
  const packageName = `${caip2Type}-${caip2Reference}`.toLowerCase();
  return join("node_modules", "@crypto-frontmatter", packageName, `_${namespace}`, file);
}

export async function getInstalledNamespaces(): Promise<FrontmatterNamespace[]> {
  const scopePath = join("node_modules", "@crypto-frontmatter");
  const namespaces: FrontmatterNamespace[] = [];

  for (const dir of await readdir(scopePath)) {
    const indexJsonPath = join(scopePath, dir, "index.json");
    if (!(await hasFile(indexJsonPath))) {
      continue;
    }
    const indexJson = JSON.parse(
      await readFile(indexJsonPath, {
        encoding: "utf-8",
      }),
    ) as {
      package: string;
      caip2: string;
      namespaces: { dir: string; namespace: string }[];
    };
    namespaces.push(
      ...indexJson.namespaces.map(({ dir, namespace }) => {
        return {
          package: indexJson.package,
          caip2: indexJson.caip2,
          dir,
          namespace,
        };
      }),
    );
  }
  return namespaces;
}

/**
 * Get the collection FrontmatterIndex with CAIP-2 and Asset TYPE
 * Using readFile (node_modules/@crypto-frontmatter/{caip2}/_{namespace}/index.json)
 *
 * @param caip2 {string}
 * @param namespace {string}
 * @return {FrontmatterIndex[]}
 */
export async function getIndex(caip2: string, namespace: string): Promise<FrontmatterIndex[] | undefined> {
  const path = getNodeModulesPath(caip2, namespace, "index.json");
  try {
    const contents = await readFile(path, {
      encoding: "utf-8",
    });
    return JSON.parse(contents);
  } catch (err: any) {
    // If file not found, return undefined
    if (err.code === "ENOENT") {
      return undefined;
    }

    throw err;
  }
}

/**
 * Get FrontmatterContent using CAIP-19, returns undefined if not found
 * This includes the HTML content of the Frontmatter.
 * Using readFile (node_modules/@crypto-frontmatter/{caip2}/_{namespace}/{fileId}.json)
 *
 * @param caip19 {string}
 * @see FrontmatterContent.html
 * @return {FrontmatterContent | undefined}
 */
export async function getFrontmatter(caip19: string): Promise<FrontmatterContent | undefined> {
  const fileId = getFileId(caip19);
  const [caip2, namespace] = decodeCaip19(caip19);

  const path = getNodeModulesPath(caip2, namespace, `${fileId}.json`);
  if (!(await hasFile(path))) {
    return undefined;
  }
  const contents = await readFile(path, {
    encoding: "utf-8",
  });
  return JSON.parse(contents);
}
