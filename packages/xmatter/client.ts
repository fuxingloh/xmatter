import { LRUCache } from "lru-cache";
import type { Frontmatter } from "./schema.js";

export type { Frontmatter };

export class XmatterClient {
  private readonly namespace: string;
  private readonly baseUrl: URL;
  private readonly cache: LRUCache<string, string[]>;

  constructor(namespace: string, baseUrl: string | URL = "https://xmatter.org", cacheSize: number = 4096) {
    this.namespace = namespace;
    this.baseUrl = new URL(baseUrl);
    this.cache = new LRUCache({ max: cacheSize });
  }

  /**
   * Fetch `/{namespace}/{chainId}/{prefix}/index.txt` and return the entries.
   * Returns full addresses if <=256 matches, otherwise returns next-byte sub-prefixes.
   * Results are cached with TTL from the response Cache-Control header.
   */
  async getIndex(chainId: string, prefix: string): Promise<string[]> {
    const key = `${chainId}/${prefix.toLowerCase()}`;
    const cached = this.cache.get(key);
    if (cached !== undefined) return cached;

    const res = await fetch(new URL(`/${this.namespace}/${chainId}/${prefix}/index.txt`, this.baseUrl));
    if (!res.ok) {
      throw new XmatterError(res.status, await res.text());
    }
    const text = await res.text();
    const entries = text === "" ? [] : text.split("\n");
    const ttl = parseMaxAge(res.headers.get("cache-control"));
    this.cache.set(key, entries, { ttl });
    return entries;
  }

  /**
   * Check if an address exists by walking the index prefix tree in 2-byte steps.
   * Fetches progressively longer prefixes until entries resolve to full addresses,
   * then checks for an exact match.
   */
  async has(chainId: string, address: string): Promise<boolean> {
    const lower = address.toLowerCase();

    for (let len = 2; len < lower.length; len += 2) {
      const prefix = lower.slice(0, len);
      const entries = await this.getIndex(chainId, prefix);
      if (entries.length === 0) return false;

      const first = entries[0]!.toLowerCase();
      if (first.length === 42) {
        return entries.some((e) => e.toLowerCase() === lower);
      }
    }

    return false;
  }

  /**
   * Fetch `/{namespace}/{chainId}/{address}/frontmatter.json` which returns
   * parsed YAML frontmatter from the address's README.md.
   * Checks existence via the index first to avoid unnecessary requests.
   */
  async getFrontmatter(chainId: string, address: string): Promise<Frontmatter | undefined> {
    if (!(await this.has(chainId, address))) return undefined;

    const res = await fetch(new URL(`/${this.namespace}/${chainId}/${address}/frontmatter.json`, this.baseUrl));
    if (res.status === 404) return undefined;
    if (!res.ok) {
      throw new XmatterError(res.status, await res.text());
    }
    return res.json();
  }

  /**
   * Build the URL for `/{namespace}/{chainId}/{address}/icon` which serves
   * the original image (svg/png/jpg) if <25KB, otherwise converts to 256x256 WebP.
   * Checks existence via the index first, returning undefined for missing addresses.
   */
  async getIconUrl(chainId: string, address: string): Promise<URL | undefined> {
    if (!(await this.has(chainId, address))) return undefined;
    return new URL(`/${this.namespace}/${chainId}/${address}/icon`, this.baseUrl);
  }

  /**
   * Build the URL for `/{namespace}/{chainId}/{address}/icon.webp` which always
   * converts the original icon (svg/png/jpg) to 256x256 WebP.
   * Checks existence via the index first, returning undefined for missing addresses.
   */
  async getIconWebpUrl(chainId: string, address: string): Promise<URL | undefined> {
    if (!(await this.has(chainId, address))) return undefined;
    return new URL(`/${this.namespace}/${chainId}/${address}/icon.webp`, this.baseUrl);
  }
}

function parseMaxAge(header: string | null): number {
  const match = header?.match(/max-age=(\d+)/);
  return match ? parseInt(match[1]!, 10) * 1000 : 30 * 60 * 1000;
}

export class XmatterError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
