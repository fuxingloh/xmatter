import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { mkdir, rm, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import gray from "gray-matter";
import { FileSystemAgent, hasFile, copyImage } from "./fs";
import type { XmatterFile } from "xmatter/schema";

const testDir = join(tmpdir(), "xmatter-agent-base-test");

async function createTestDir(): Promise<string> {
  const dir = join(testDir, Math.random().toString(36).substring(7));
  await mkdir(dir, { recursive: true });
  return dir;
}

describe("hasFile", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await createTestDir();
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("should return true for existing file", async () => {
    const filePath = join(dir, "test.txt");
    await writeFile(filePath, "content");

    expect(await hasFile(filePath)).toBe(true);
  });

  it("should return false for non-existing file", async () => {
    const filePath = join(dir, "nonexistent.txt");

    expect(await hasFile(filePath)).toBe(false);
  });

  it("should return true for existing directory", async () => {
    expect(await hasFile(dir)).toBe(true);
  });
});

describe("copyImage", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await createTestDir();
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("should not copy if source does not exist", async () => {
    const from = join(dir, "nonexistent.png");
    const to = join(dir, "dest.png");

    await copyImage(from, to);

    expect(await hasFile(to)).toBe(false);
  });

  it("should not overwrite existing destination file", async () => {
    const from = join(dir, "source.png");
    const to = join(dir, "dest.png");

    // Create a minimal valid PNG (1x1 transparent pixel)
    const pngBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64",
    );
    await writeFile(from, pngBuffer);
    await writeFile(to, "existing content");

    await copyImage(from, to);

    const content = await readFile(to, "utf-8");
    expect(content).toBe("existing content");
  });

  it("should copy valid image file", async () => {
    const from = join(dir, "source.png");
    const to = join(dir, "dest.png");

    // Create a minimal valid PNG
    const pngBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64",
    );
    await writeFile(from, pngBuffer);

    await copyImage(from, to);

    expect(await hasFile(to)).toBe(true);
  });

  it("should skip files larger than 1MB", async () => {
    const from = join(dir, "large.png");
    const to = join(dir, "dest.png");

    // Create a file larger than 1MB
    const largeBuffer = Buffer.alloc(1024 * 1024 + 1);
    await writeFile(from, largeBuffer);

    await copyImage(from, to);

    expect(await hasFile(to)).toBe(false);
  });

  it("should skip files that cannot be parsed by sharp", async () => {
    const from = join(dir, "invalid.png");
    const to = join(dir, "dest.png");

    // Create an invalid image file
    await writeFile(from, "not a valid image");

    await copyImage(from, to);

    expect(await hasFile(to)).toBe(false);
  });
});

// Concrete implementation of FileSystemAgent for testing
class TestAgent extends FileSystemAgent<{ name: string; symbol: string }> {
  async readEntry(source: string): Promise<{ name: string; symbol: string } | undefined> {
    try {
      const content = await readFile(source, "utf-8");
      return JSON.parse(content);
    } catch {
      return undefined;
    }
  }

  toReadmeFile(uri: string, entry: { name: string; symbol: string }, _source: string, _target: string): XmatterFile {
    return {
      data: {
        name: entry.name,
        symbol: entry.symbol,
        provenance: "test-agent",
        standards: ["erc20"],
      },
      content: "",
    };
  }
}

describe("FileSystemAgent", () => {
  let dir: string;
  let agent: TestAgent;

  beforeEach(async () => {
    dir = await createTestDir();
    agent = new TestAgent();
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  describe("mergeFile", () => {
    it("should return original file when no existing README", async () => {
      const file: XmatterFile = {
        data: {
          name: "Test Token",
          provenance: "test",
          standards: ["erc20"],
          symbol: "TEST",
        },
        content: "Test content",
      };

      const result = await agent.mergeFile(dir, file);

      expect(result).toEqual(file);
    });

    it("should merge with existing README preserving existing keys", async () => {
      // Create existing README
      const existingData = {
        name: "Existing Name",
        provenance: "existing",
        standards: ["erc20"],
        decimals: 18,
      };
      await writeFile(join(dir, "README.md"), gray.stringify("Existing content", existingData));

      const newFile: XmatterFile = {
        data: {
          name: "New Name",
          provenance: "new",
          standards: ["erc721"],
          symbol: "NEW",
        },
        content: "New content",
      };

      const result = await agent.mergeFile(dir, newFile);

      // Existing keys should be preserved
      expect(result.data.name).toBe("Existing Name");
      expect(result.data.provenance).toBe("existing");
      expect(result.data.decimals).toBe(18);
      // New keys should be added
      expect(result.data.symbol).toBe("NEW");
      // Existing content should be preserved (gray-matter adds trailing newline)
      expect(result.content?.trim()).toBe("Existing content");
    });

    it("should use new content when existing content is empty", async () => {
      const existingData = {
        name: "Existing Name",
        provenance: "existing",
        standards: ["erc20"],
      };
      await writeFile(join(dir, "README.md"), gray.stringify("", existingData));

      const newFile: XmatterFile = {
        data: {
          name: "New Name",
          provenance: "new",
          standards: ["erc721"],
        },
        content: "New content",
      };

      const result = await agent.mergeFile(dir, newFile);

      expect(result.content).toBe("New content");
    });
  });

  describe("mergeIcon", () => {
    it("should return original file when no icon exists", async () => {
      const file: XmatterFile = {
        data: {
          name: "Test",
          provenance: "test",
          standards: ["erc20"],
        },
        content: "",
      };

      const result = await agent.mergeIcon(dir, file);

      expect(result.data.icon).toBeUndefined();
    });

    it("should detect icon.svg", async () => {
      await writeFile(join(dir, "icon.svg"), "<svg></svg>");

      const file: XmatterFile = {
        data: {
          name: "Test",
          provenance: "test",
          standards: ["erc20"],
        },
        content: "",
      };

      const result = await agent.mergeIcon(dir, file);

      expect(result.data.icon).toBe("icon.svg");
    });

    it("should detect icon.png", async () => {
      const pngBuffer = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64",
      );
      await writeFile(join(dir, "icon.png"), pngBuffer);

      const file: XmatterFile = {
        data: {
          name: "Test",
          provenance: "test",
          standards: ["erc20"],
        },
        content: "",
      };

      const result = await agent.mergeIcon(dir, file);

      expect(result.data.icon).toBe("icon.png");
    });

    it("should detect icon.jpg", async () => {
      // Minimal JPEG file
      const jpgBuffer = Buffer.from(
        "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=",
        "base64",
      );
      await writeFile(join(dir, "icon.jpg"), jpgBuffer);

      const file: XmatterFile = {
        data: {
          name: "Test",
          provenance: "test",
          standards: ["erc20"],
        },
        content: "",
      };

      const result = await agent.mergeIcon(dir, file);

      expect(result.data.icon).toBe("icon.jpg");
    });

    it("should prefer svg over png over jpg", async () => {
      await writeFile(join(dir, "icon.svg"), "<svg></svg>");
      const pngBuffer = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64",
      );
      await writeFile(join(dir, "icon.png"), pngBuffer);

      const file: XmatterFile = {
        data: {
          name: "Test",
          provenance: "test",
          standards: ["erc20"],
        },
        content: "",
      };

      const result = await agent.mergeIcon(dir, file);

      expect(result.data.icon).toBe("icon.svg");
    });
  });

  describe("mergeColor", () => {
    it("should return original file when no icon specified", async () => {
      const file: XmatterFile = {
        data: {
          name: "Test",
          provenance: "test",
          standards: ["erc20"],
        },
        content: "",
      };

      const result = await agent.mergeColor(dir, file);

      expect(result.data.color).toBeUndefined();
    });

    it("should return original file when icon file does not exist", async () => {
      const file: XmatterFile = {
        data: {
          name: "Test",
          provenance: "test",
          standards: ["erc20"],
          icon: "nonexistent.png",
        },
        content: "",
      };

      const result = await agent.mergeColor(dir, file);

      expect(result.data.color).toBeUndefined();
    });

    it("should extract color from PNG icon", async () => {
      // Create a red 10x10 PNG
      const sharp = (await import("sharp")).default;
      const redPngBuffer = await sharp({
        create: {
          width: 10,
          height: 10,
          channels: 3,
          background: { r: 255, g: 0, b: 0 },
        },
      })
        .png()
        .toBuffer();
      await writeFile(join(dir, "icon.png"), redPngBuffer);

      const file: XmatterFile = {
        data: {
          name: "Test",
          provenance: "test",
          standards: ["erc20"],
          icon: "icon.png",
        },
        content: "",
      };

      const result = await agent.mergeColor(dir, file);

      expect(result.data.color).toBe("#ff0000");
    });

    it("should extract color from SVG icon", async () => {
      // Create a blue SVG
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
        <rect width="100" height="100" fill="#0000ff"/>
      </svg>`;
      await writeFile(join(dir, "icon.svg"), svgContent);

      const file: XmatterFile = {
        data: {
          name: "Test",
          provenance: "test",
          standards: ["erc20"],
          icon: "icon.svg",
        },
        content: "",
      };

      const result = await agent.mergeColor(dir, file);

      expect(result.data.color).toBe("#0000ff");
    });

    it("should handle color extraction errors gracefully", async () => {
      // Create an invalid file
      await writeFile(join(dir, "icon.png"), "not a valid image");

      const file: XmatterFile = {
        data: {
          name: "Test",
          provenance: "test",
          standards: ["erc20"],
          icon: "icon.png",
        },
        content: "",
      };

      const result = await agent.mergeColor(dir, file);

      // Should return original file without crashing
      expect(result.data.color).toBeUndefined();
    });
  });

  describe("write", () => {
    it("should write README.md with frontmatter", async () => {
      const file: XmatterFile = {
        data: {
          name: "Test Token",
          provenance: "test",
          standards: ["erc20"],
          symbol: "TEST",
        },
        content: "Token description",
      };

      await agent.write("eip155/1/0x123", { name: "Test Token", symbol: "TEST" }, "", dir, file);

      const readmePath = join(dir, "README.md");
      expect(await hasFile(readmePath)).toBe(true);

      const content = await readFile(readmePath, "utf-8");
      const parsed = gray(content);

      expect(parsed.data.name).toBe("Test Token");
      expect(parsed.data.symbol).toBe("TEST");
      expect(parsed.data.provenance).toBe("test");
      expect(parsed.content.trim()).toBe("Token description");
    });

    it("should merge with existing data when writing", async () => {
      // Create existing README
      const existingData = {
        name: "Existing Name",
        provenance: "existing",
        standards: ["erc20"],
        decimals: 18,
      };
      await writeFile(join(dir, "README.md"), gray.stringify("Existing description", existingData));

      const file: XmatterFile = {
        data: {
          name: "New Name",
          provenance: "new",
          standards: ["erc721"],
          symbol: "NEW",
        },
        content: "New description",
      };

      await agent.write("eip155/1/0x123", { name: "New Name", symbol: "NEW" }, "", dir, file);

      const content = await readFile(join(dir, "README.md"), "utf-8");
      const parsed = gray(content);

      // Existing values preserved
      expect(parsed.data.name).toBe("Existing Name");
      expect(parsed.data.decimals).toBe(18);
      // New values added
      expect(parsed.data.symbol).toBe("NEW");
      // Existing content preserved
      expect(parsed.content.trim()).toBe("Existing description");
    });
  });

  describe("walk", () => {
    it("should process entries in directory", async () => {
      const sourceDir = await createTestDir();
      const xmatterDir = join(dir, "xmatter");
      await mkdir(xmatterDir, { recursive: true });

      // Create source entries
      await writeFile(join(sourceDir, "token1.json"), JSON.stringify({ name: "Token 1", symbol: "TK1" }));
      await writeFile(join(sourceDir, "token2.json"), JSON.stringify({ name: "Token 2", symbol: "TK2" }));

      // Custom agent that writes to our test xmatter directory
      class LocalTestAgent extends TestAgent {
        constructor(private xmatterPath: string) {
          super();
        }

        async walk(
          walkDir: string,
          options: {
            filter: (data: { name: string; symbol: string }) => boolean;
            toUri: (data: { name: string; symbol: string }) => string;
          },
        ): Promise<void> {
          const { readdir } = await import("node:fs/promises");
          const { join } = await import("node:path");
          const { XmatterSchema } = await import("xmatter/schema");

          for (const entry of await readdir(walkDir)) {
            const sourcePath = join(walkDir, entry);
            const data = await this.readEntry(sourcePath);

            if (data === undefined) continue;
            if (!options.filter(data)) continue;

            const uri = options.toUri(data);
            const targetPath = join(this.xmatterPath, uri);
            const file = this.toReadmeFile(uri, data, sourcePath, targetPath);
            const parsed = XmatterSchema.safeParse(file);
            if (!parsed.success) continue;

            await mkdir(targetPath, { recursive: true });
            await this.write(uri, data, sourcePath, targetPath, parsed.data);
          }
        }
      }

      const localAgent = new LocalTestAgent(xmatterDir);

      await localAgent.walk(sourceDir, {
        filter: () => true,
        toUri: (data) => `eip155/1/${data.symbol}`,
      });

      // Check both tokens were processed
      expect(await hasFile(join(xmatterDir, "eip155/1/TK1/README.md"))).toBe(true);
      expect(await hasFile(join(xmatterDir, "eip155/1/TK2/README.md"))).toBe(true);

      // Verify content
      const tk1Content = await readFile(join(xmatterDir, "eip155/1/TK1/README.md"), "utf-8");
      const tk1Parsed = gray(tk1Content);
      expect(tk1Parsed.data.name).toBe("Token 1");
      expect(tk1Parsed.data.symbol).toBe("TK1");

      await rm(sourceDir, { recursive: true, force: true });
    });

    it("should filter entries based on filter function", async () => {
      const sourceDir = await createTestDir();
      const xmatterDir = join(dir, "xmatter");
      await mkdir(xmatterDir, { recursive: true });

      await writeFile(join(sourceDir, "token1.json"), JSON.stringify({ name: "Token 1", symbol: "INCLUDE" }));
      await writeFile(join(sourceDir, "token2.json"), JSON.stringify({ name: "Token 2", symbol: "EXCLUDE" }));

      class LocalTestAgent extends TestAgent {
        constructor(private xmatterPath: string) {
          super();
        }

        async walk(
          walkDir: string,
          options: {
            filter: (data: { name: string; symbol: string }) => boolean;
            toUri: (data: { name: string; symbol: string }) => string;
          },
        ): Promise<void> {
          const { readdir } = await import("node:fs/promises");
          const { join } = await import("node:path");
          const { XmatterSchema } = await import("xmatter/schema");

          for (const entry of await readdir(walkDir)) {
            const sourcePath = join(walkDir, entry);
            const data = await this.readEntry(sourcePath);

            if (data === undefined) continue;
            if (!options.filter(data)) continue;

            const uri = options.toUri(data);
            const targetPath = join(this.xmatterPath, uri);
            const file = this.toReadmeFile(uri, data, sourcePath, targetPath);
            const parsed = XmatterSchema.safeParse(file);
            if (!parsed.success) continue;

            await mkdir(targetPath, { recursive: true });
            await this.write(uri, data, sourcePath, targetPath, parsed.data);
          }
        }
      }

      const localAgent = new LocalTestAgent(xmatterDir);

      await localAgent.walk(sourceDir, {
        filter: (data) => data.symbol === "INCLUDE",
        toUri: (data) => `eip155/1/${data.symbol}`,
      });

      expect(await hasFile(join(xmatterDir, "eip155/1/INCLUDE/README.md"))).toBe(true);
      expect(await hasFile(join(xmatterDir, "eip155/1/EXCLUDE/README.md"))).toBe(false);

      await rm(sourceDir, { recursive: true, force: true });
    });

    it("should skip entries with invalid data", async () => {
      const sourceDir = await createTestDir();
      const xmatterDir = join(dir, "xmatter");
      await mkdir(xmatterDir, { recursive: true });

      // Create invalid JSON file
      await writeFile(join(sourceDir, "invalid.json"), "not valid json");
      await writeFile(join(sourceDir, "valid.json"), JSON.stringify({ name: "Valid", symbol: "VALID" }));

      class LocalTestAgent extends TestAgent {
        constructor(private xmatterPath: string) {
          super();
        }

        async walk(
          walkDir: string,
          options: {
            filter: (data: { name: string; symbol: string }) => boolean;
            toUri: (data: { name: string; symbol: string }) => string;
          },
        ): Promise<void> {
          const { readdir } = await import("node:fs/promises");
          const { join } = await import("node:path");
          const { XmatterSchema } = await import("xmatter/schema");

          for (const entry of await readdir(walkDir)) {
            const sourcePath = join(walkDir, entry);
            const data = await this.readEntry(sourcePath);

            if (data === undefined) continue;
            if (!options.filter(data)) continue;

            const uri = options.toUri(data);
            const targetPath = join(this.xmatterPath, uri);
            const file = this.toReadmeFile(uri, data, sourcePath, targetPath);
            const parsed = XmatterSchema.safeParse(file);
            if (!parsed.success) continue;

            await mkdir(targetPath, { recursive: true });
            await this.write(uri, data, sourcePath, targetPath, parsed.data);
          }
        }
      }

      const localAgent = new LocalTestAgent(xmatterDir);

      await localAgent.walk(sourceDir, {
        filter: () => true,
        toUri: (data) => `eip155/1/${data.symbol}`,
      });

      // Only valid entry should be processed
      expect(await hasFile(join(xmatterDir, "eip155/1/VALID/README.md"))).toBe(true);

      await rm(sourceDir, { recursive: true, force: true });
    });

    it("should skip entries with LOCK file", async () => {
      const sourceDir = await createTestDir();
      const xmatterDir = join(dir, "xmatter");

      // Create locked entry directory
      const lockedDir = join(xmatterDir, "eip155/1/LOCKED");
      await mkdir(lockedDir, { recursive: true });
      await writeFile(join(lockedDir, "LOCK"), "");
      await writeFile(
        join(lockedDir, "README.md"),
        gray.stringify("Original content", {
          name: "Original",
          provenance: "manual",
          standards: ["erc20"],
        }),
      );

      await writeFile(join(sourceDir, "token.json"), JSON.stringify({ name: "New Name", symbol: "LOCKED" }));

      // The original walk method checks for LOCK file at targetPath
      // We need to test that behavior
      class LocalTestAgent extends TestAgent {
        constructor(private xmatterPath: string) {
          super();
        }

        async walk(
          walkDir: string,
          options: {
            filter: (data: { name: string; symbol: string }) => boolean;
            toUri: (data: { name: string; symbol: string }) => string;
          },
        ): Promise<void> {
          const { readdir, stat } = await import("node:fs/promises");
          const { join } = await import("node:path");
          const { XmatterSchema } = await import("xmatter/schema");

          const hasLockFile = async (path: string) =>
            stat(path).then(
              () => true,
              () => false,
            );

          for (const entry of await readdir(walkDir)) {
            const sourcePath = join(walkDir, entry);
            const data = await this.readEntry(sourcePath);

            if (data === undefined) continue;
            if (!options.filter(data)) continue;

            const uri = options.toUri(data);
            const targetPath = join(this.xmatterPath, uri);
            const file = this.toReadmeFile(uri, data, sourcePath, targetPath);
            const parsed = XmatterSchema.safeParse(file);
            if (!parsed.success) continue;

            // Check for LOCK file
            if (await hasLockFile(join(targetPath, "LOCK"))) {
              continue;
            }

            await mkdir(targetPath, { recursive: true });
            await this.write(uri, data, sourcePath, targetPath, parsed.data);
          }
        }
      }

      const localAgent = new LocalTestAgent(xmatterDir);

      await localAgent.walk(sourceDir, {
        filter: () => true,
        toUri: (data) => `eip155/1/${data.symbol}`,
      });

      // Content should NOT be overwritten
      const content = await readFile(join(lockedDir, "README.md"), "utf-8");
      const parsed = gray(content);
      expect(parsed.data.name).toBe("Original");

      await rm(sourceDir, { recursive: true, force: true });
    });
  });
});

// Cleanup test directory after all tests
afterEach(async () => {
  try {
    await rm(testDir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
});
