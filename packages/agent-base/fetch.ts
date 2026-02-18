import { readFileSync, writeFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { hasFile } from "./fs";

const STATE_PATH = "../../.fetch-state.json";

const SUPPORTED_FORMATS: Record<string, string> = {
  svg: "icon.svg",
  png: "icon.png",
  jpeg: "icon.jpg",
  jpg: "icon.jpg",
  webp: "icon.webp",
  gif: "icon.gif",
};

export class FetchWithIgnore {
  private state: Record<string, number> = {};

  constructor() {
    try {
      this.state = JSON.parse(readFileSync(STATE_PATH, "utf-8"));
    } catch {
      this.state = {};
    }
  }

  private save(): void {
    writeFileSync(STATE_PATH, JSON.stringify(this.state, null, 2));
  }

  shouldSkip(url: string): boolean {
    return (this.state[url] ?? 0) >= 3;
  }

  private recordFailure(url: string): void {
    this.state[url] = (this.state[url] ?? 0) + 1;
    this.save();
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
      this.recordFailure(url);
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

    const filename = SUPPORTED_FORMATS[format];
    if (!filename) {
      this.recordFailure(url);
      return false;
    }

    const to = join(targetDir, filename);
    if (await hasFile(to)) return true;

    await writeFile(to, buffer);
    return true;
  }
}
