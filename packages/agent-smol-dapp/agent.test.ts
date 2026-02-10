import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { SmolDappAgent } from "./agent";

const testDir = join(tmpdir(), "xmatter-agent-smol-dapp-test");

async function createTestDir(): Promise<string> {
  const dir = join(testDir, Math.random().toString(36).substring(7));
  await mkdir(dir, { recursive: true });
  return dir;
}

describe("SmolDappAgent", () => {
  let dir: string;
  let agent: SmolDappAgent;

  beforeEach(async () => {
    dir = await createTestDir();
    agent = new SmolDappAgent();
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  describe("rate limit handling", () => {
    it("should detect 429 status code errors", () => {
      const error429Status = { status: 429 };
      const error429Response = { response: { status: 429 } };
      const error429StatusCode = { statusCode: 429 };

      // Access private method for testing
      const isRateLimitError = (agent as any).isRateLimitError.bind(agent);

      expect(isRateLimitError(error429Status)).toBe(true);
      expect(isRateLimitError(error429Response)).toBe(true);
      expect(isRateLimitError(error429StatusCode)).toBe(true);
    });

    it("should detect rate limit error messages", () => {
      const errorWithMessage = { message: "Rate limit exceeded" };
      const errorWithTooManyRequests = { message: "Too many requests" };
      const error429InMessage = new Error("HTTP 429 error occurred");

      const isRateLimitError = (agent as any).isRateLimitError.bind(agent);

      expect(isRateLimitError(errorWithMessage)).toBe(true);
      expect(isRateLimitError(errorWithTooManyRequests)).toBe(true);
      expect(isRateLimitError(error429InMessage)).toBe(true);
    });

    it("should not detect non-rate-limit errors", () => {
      const normalError = new Error("Network error");
      const error500 = { status: 500 };
      const error404 = { statusCode: 404 };

      const isRateLimitError = (agent as any).isRateLimitError.bind(agent);

      expect(isRateLimitError(normalError)).toBe(false);
      expect(isRateLimitError(error500)).toBe(false);
      expect(isRateLimitError(error404)).toBe(false);
    });

    it("should handle cooldown and retry on 429 error", async () => {
      const sourcePath = join(dir, "0x1234567890123456789012345678901234567890");
      await mkdir(sourcePath, { recursive: true });

      // Create logo files
      await writeFile(join(sourcePath, "logo.svg"), "<svg></svg>");

      // Mock the client
      let callCount = 0;
      const mockClient = {
        readContract: mock(async () => {
          callCount++;
          if (callCount === 1 || callCount === 2) {
            // First and second calls (name and symbol) throw 429
            const error = new Error("Rate limit exceeded");
            (error as any).status = 429;
            throw error;
          }
          // After cooldown, return successful responses
          if (callCount === 3) return "Test Token"; // name on retry
          if (callCount === 4) return "TEST"; // symbol on retry
        }),
      };

      agent.setChain(1, mockClient);

      // Mock the cooldown to be very short for testing
      const originalCooldownDuration = (agent as any).cooldownDuration;
      (agent as any).cooldownDuration = 100; // 100ms for testing

      const startTime = Date.now();
      const result = await agent.readEntry(sourcePath);
      const elapsed = Date.now() - startTime;

      // Restore original cooldown duration
      (agent as any).cooldownDuration = originalCooldownDuration;

      // Should have retried after cooldown
      expect(result).toBeDefined();
      expect(result?.name).toBe("Test Token");
      expect(result?.symbol).toBe("TEST");
      expect((agent as any).cooldownCount).toBe(1);
      // Should have waited at least the cooldown duration
      expect(elapsed).toBeGreaterThanOrEqual(100);
    }, 10000); // 10 second timeout

    it("should exit after max cooldowns exceeded", async () => {
      const sourcePath = join(dir, "0x1234567890123456789012345678901234567890");
      await mkdir(sourcePath, { recursive: true });
      await writeFile(join(sourcePath, "logo.svg"), "<svg></svg>");

      // Mock the client to always return 429
      const mockClient = {
        readContract: mock(async () => {
          const error = new Error("Rate limit exceeded");
          (error as any).status = 429;
          throw error;
        }),
      };

      agent.setChain(1, mockClient);

      // Mock process.exit to prevent actual exit
      const originalExit = process.exit;
      let exitCalled = false;
      let exitCode: number | undefined;
      process.exit = mock((code?: number) => {
        exitCalled = true;
        exitCode = code;
        throw new Error("Process exit called"); // Throw to stop execution
      }) as any;

      // Mock the cooldown to be very short for testing
      (agent as any).cooldownDuration = 10; // 10ms for testing
      (agent as any).maxCooldowns = 3; // Reduce max for faster testing

      try {
        await agent.readEntry(sourcePath);
      } catch (error: any) {
        // Expected to throw when process.exit is called
        expect(error.message).toBe("Process exit called");
      }

      // Restore process.exit
      process.exit = originalExit;

      expect(exitCalled).toBe(true);
      expect(exitCode).toBe(1);
      expect((agent as any).cooldownCount).toBe(4); // Should exceed max (3) and try 4th
    }, 30000); // 30 second timeout
  });

  describe("readEntry", () => {
    it("should skip addresses without logos", async () => {
      const sourcePath = join(dir, "0x1234567890123456789012345678901234567890");
      await mkdir(sourcePath, { recursive: true });

      const result = await agent.readEntry(sourcePath);

      expect(result).toBeUndefined();
    });

    it("should skip invalid addresses", async () => {
      const invalidPath = join(dir, "invalid-address");
      await mkdir(invalidPath, { recursive: true });

      const result = await agent.readEntry(invalidPath);

      expect(result).toBeUndefined();
    });

    it("should skip the zero address", async () => {
      const zeroAddress = join(dir, "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
      await mkdir(zeroAddress, { recursive: true });
      await writeFile(join(zeroAddress, "logo.svg"), "<svg></svg>");

      const result = await agent.readEntry(zeroAddress);

      expect(result).toBeUndefined();
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
