import { LRUCache } from "lru-cache";
import type { Frontmatter } from "./schema.js";

export type { Frontmatter };

export type Eip155Address = `0x${string}`;

export class Eip155Client {
  private readonly baseUrl: URL;
  private readonly cache: LRUCache<string, string[]>;

  constructor(baseUrl: string | URL = "https://xmatter.org", cacheSize: number = 512) {
    this.baseUrl = new URL(baseUrl);
    this.cache = new LRUCache({ max: cacheSize });
  }

  private getUrl(path: string): URL {
    return new URL(path, this.baseUrl);
  }

  /**
   * List addresses or sub-prefixes under an EIP-155 chain by prefix.
   * Returns full addresses if <=256 matches, otherwise returns next-byte prefixes.
   */
  async getIndex(chainId: string, prefix: string): Promise<string[]> {
    const key = `${chainId}/${prefix.toLowerCase()}`;
    const cached = this.cache.get(key);
    if (cached !== undefined) return cached;

    const res = await fetch(this.getUrl(`/eip155/${chainId}/${prefix}/index.txt`));
    if (!res.ok) {
      throw new XmatterError(res.status, await res.text());
    }
    const text = await res.text();
    const entries = text === "" ? [] : text.split("\n");
    this.cache.set(key, entries);
    return entries;
  }

  /**
   * Check if an address exists by walking the index prefix tree.
   * Returns true if the address is found in the index, false otherwise.
   */
  async has(chainId: string, address: Eip155Address): Promise<boolean> {
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
   * Get frontmatter metadata for a specific address.
   * Uses the index to check existence first, avoiding unnecessary requests.
   */
  async getFrontmatter(chainId: string, address: Eip155Address): Promise<Frontmatter | undefined> {
    if (!(await this.has(chainId, address))) return undefined;

    const res = await fetch(this.getUrl(`/eip155/${chainId}/${address}/frontmatter.json`));
    if (res.status === 404) return undefined;
    if (!res.ok) {
      throw new XmatterError(res.status, await res.text());
    }
    return res.json();
  }

  /**
   * Get the icon URL for a specific address.
   * Uses the index to check existence first, returning undefined for missing addresses.
   */
  async getIconUrl(chainId: string, address: Eip155Address): Promise<URL | undefined> {
    if (!(await this.has(chainId, address))) return undefined;
    return this.getUrl(`/eip155/${chainId}/${address}/icon`);
  }

  /**
   * Get the icon WebP URL for a specific address.
   * Uses the index to check existence first, returning undefined for missing addresses.
   */
  async getIconWebpUrl(chainId: string, address: Eip155Address): Promise<URL | undefined> {
    if (!(await this.has(chainId, address))) return undefined;
    return this.getUrl(`/eip155/${chainId}/${address}/icon.webp`);
  }
}

export class XmatterError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
