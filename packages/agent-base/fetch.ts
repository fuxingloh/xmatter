import { readFileSync, writeFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { hasFile } from "./fs";

const STATE_PATH = join(process.cwd(), ".fetch-ignore.json");
const NATIVE_FORMATS = new Set(["svg", "png", "jpeg", "jpg", "webp"]);

export class FetchWithIgnore {
  state: Record<string, number> = {};

  constructor() {
    try {
      this.state = JSON.parse(readFileSync(STATE_PATH, "utf-8"));
    } catch {
      this.state = {};
    }
  }

  shouldSkip(url: string): boolean {
    return (this.state[url] ?? 0) >= 3;
  }

  private recordAttempt(url: string): void {
    this.state[url] = (this.state[url] ?? 0) + 1;
    writeFileSync(STATE_PATH, JSON.stringify(this.state, null, 2));
  }

  async copyIcon(url: string, targetDir: string, timeout = 10_000): Promise<boolean> {
    if (this.shouldSkip(url)) return false;
    this.recordAttempt(url);

    let response: Response;
    try {
      response = await fetch(url, { signal: AbortSignal.timeout(timeout) });
    } catch (error) {
      if (error.name === "TimeoutError") {
        console.warn(`Fetch failed for ${url}: Timeout`);
      } else {
        console.warn(`Fetch failed for ${url}: `, error);
      }
      return false;
    }
    if (!response.ok) {
      console.warn(`Fetch failed for ${url}: HTTP ${response.status}`);
      return false;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > 1024 * 1024) {
      console.warn(`Skipping ${url}: file size ${buffer.length} exceeds 1MB`);
      return false;
    }

    let format: string;
    try {
      const metadata = await sharp(buffer).metadata();
      format = metadata.format ?? "";
    } catch (error) {
      console.warn(`Skipping ${url}: sharp cannot parse image`, error);
      return false;
    }

    if (NATIVE_FORMATS.has(format)) {
      const to = join(targetDir, `icon.${format}`);
      if (await hasFile(to)) return true;
      await writeFile(to, buffer);
      console.log(`Copied icon ${url} -> ${to}`);
      return true;
    }

    const to = join(targetDir, "icon.webp");
    if (await hasFile(to)) return true;
    await writeFile(to, await sharp(buffer).webp().toBuffer());
    console.log(`Converted icon ${url} (${format}) -> ${to}`);
    return true;
  }
}
