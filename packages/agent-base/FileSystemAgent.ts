import { copyFile, mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import gray from "gray-matter";
import { ReadmeFile, ReadmeFileSchema } from "./ReadmeFile";

type Path = string;

export abstract class FileSystemAgent<Entry> {
  async walk(
    dir: string,
    options: {
      filter: (data: Entry) => boolean;
      toUri: (data: Entry) => string;
    },
  ): Promise<void> {
    for (const entry of await readdir(dir)) {
      const sourcePath = join(dir, entry);
      const data = await this.readEntry(sourcePath);

      if (data === undefined) continue;
      if (!options.filter(data)) continue;

      const uri = options.toUri(data);
      const targetPath = join("../../xmatter", uri);
      const file = this.toReadmeFile(uri, data, sourcePath, targetPath);
      const parsed = ReadmeFileSchema.safeParse(file);
      if (!parsed.success) {
        console.error(`Invalid README for ${targetPath}, ${parsed.error}`);
        continue;
      }

      await this.write(uri, data, sourcePath, targetPath, parsed.data);
    }
  }

  abstract readEntry(source: Path): Promise<Entry | undefined>;

  abstract toReadmeFile(uri: string, entry: Entry, source: Path, target: Path): ReadmeFile;

  async write(uri: string, entry: Entry, source: Path, target: Path, readme: ReadmeFile): Promise<void> {
    await mkdir(target, { recursive: true });
    await writeFile(join(target, "README.md"), gray.stringify(readme.content, readme.data));
  }
}

export async function copyIfExists(from: string, to: string): Promise<void> {
  if (await this.hasFile(from)) {
    await copyFile(from, to);
  }
}

// Simple utility to check a filepath exist.
export async function hasFile(path: string): Promise<boolean> {
  return stat(path).then(
    () => true,
    () => false,
  );
}
