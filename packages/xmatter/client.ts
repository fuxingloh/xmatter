import type { Frontmatter } from "./schema.js";

export type { Frontmatter };

export type Eip155Address = `0x${string}`;

export class Eip155Client {
  private readonly baseUrl: URL;

  constructor(baseUrl: string | URL = "https://xmatter.org") {
    this.baseUrl = new URL(baseUrl);
  }

  private getUrl(path: string): URL {
    return new URL(path, this.baseUrl);
  }

  /**
   * List addresses or sub-prefixes under an EIP-155 chain by prefix.
   * Returns full addresses if <=256 matches, otherwise returns next-byte prefixes.
   */
  async getIndex(chainId: string, prefix: string): Promise<string[]> {
    const res = await fetch(this.getUrl(`/eip155/${chainId}/${prefix}/index.txt`));
    if (!res.ok) {
      throw new XmatterError(res.status, await res.text());
    }
    const text = await res.text();
    if (text === "") return [];
    return text.split("\n");
  }

  /**
   * Get frontmatter metadata for a specific address.
   */
  async getFrontmatter(chainId: string, address: Eip155Address): Promise<Frontmatter | undefined> {
    const res = await fetch(this.getUrl(`/eip155/${chainId}/${address}/frontmatter.json`));
    if (res.status === 404) return undefined;
    if (!res.ok) {
      throw new XmatterError(res.status, await res.text());
    }
    return res.json();
  }

  async getIcon(chainId: string, address: Eip155Address): Promise<ArrayBuffer | undefined> {
    const res = await fetch(this.getUrl(`/eip155/${chainId}/${address}/icon`));
    if (res.status === 404) return undefined;
    if (!res.ok) {
      throw new XmatterError(res.status, await res.text());
    }
    return res.arrayBuffer();
  }

  /**
   * Get the icon for a specific address as a WebP ArrayBuffer.
   */
  async getIconWebp(chainId: string, address: Eip155Address): Promise<ArrayBuffer | undefined> {
    const res = await fetch(this.getUrl(`/eip155/${chainId}/${address}/icon.webp`));
    if (res.status === 404) return undefined;
    if (!res.ok) {
      throw new XmatterError(res.status, await res.text());
    }
    return res.arrayBuffer();
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
