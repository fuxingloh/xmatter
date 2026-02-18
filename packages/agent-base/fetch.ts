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

  private recordFailure(url: string, increment = 1): void {
    this.state[url] = (this.state[url] ?? 0) + increment;
    writeFileSync(STATE_PATH, JSON.stringify(this.state, null, 2));
  }

  async copyIcon(url: string, targetDir: string): Promise<boolean> {
    if (this.shouldSkip(url)) return false;

    let response: Response;
    try {
      response = await fetch(url);
    } catch {
      this.recordFailure(url);
      return false;
    }
    if (!response.ok) {
      this.recordFailure(url);
      return false;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > 1024 * 1024) {
      this.recordFailure(url, 10); // Penalize more for large files
      return false;
    }

    let format: string;
    try {
      const metadata = await sharp(buffer).metadata();
      format = metadata.format ?? "";
    } catch {
      this.recordFailure(url);
      return false;
    }

    if (NATIVE_FORMATS.has(format)) {
      const to = join(targetDir, `icon.${format}`);
      if (await hasFile(to)) return true;
      await writeFile(to, buffer);
      return true;
    }

    const to = join(targetDir, "icon.webp");
    if (await hasFile(to)) return true;
    await writeFile(to, await sharp(buffer).webp().toBuffer());
    return true;
  }
}
