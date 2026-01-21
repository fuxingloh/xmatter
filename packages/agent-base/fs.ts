import { copyFile, mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import gray from "gray-matter";
import { XmatterSchema, XmatterFile } from "xmatter/schema";
import ColorThief from "colorthief";

type Path = string;

const colorThief = new ColorThief();

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
      const parsed = XmatterSchema.safeParse(file);
      if (!parsed.success) {
        console.error(`Invalid README for ${targetPath}, ${parsed.error}`);
        continue;
      }

      await this.write(uri, data, sourcePath, targetPath, parsed.data);
    }
  }

  abstract readEntry(source: Path): Promise<Entry | undefined>;

  abstract toReadmeFile(uri: string, entry: Entry, source: Path, target: Path): XmatterFile;

  async write(uri: string, entry: Entry, source: Path, target: Path, file: XmatterFile): Promise<void> {
    await mkdir(target, { recursive: true });
    file = await this.mergeFile(target, file);
    file = await this.mergeIcon(target, file);
    file = await this.mergeColor(target, file);
    await writeFile(join(target, "README.md"), gray.stringify(file.content ?? "", file.data));
  }

  async mergeFile(target: string, file: XmatterFile): Promise<XmatterFile> {
    const readmePath = join(target, "README.md");

    if (!(await hasFile(readmePath))) {
      return file;
    }

    const existing = gray.read(readmePath);
    const data = existing.data as XmatterFile["data"];

    for (const key in file.data) {
      if (!(key in data)) {
        data[key] = file.data[key];
      }
    }

    return {
      data: data,
      content: existing.content.trim() ? existing.content : file.content,
    };
  }

  async mergeIcon(target: string, file: XmatterFile): Promise<XmatterFile> {
    for (const icon of ["icon.svg", "icon.png", "icon.jpg"]) {
      const iconPath = join(target, icon);
      if (await hasFile(iconPath)) {
        return { ...file, data: { ...file.data, icon: icon } };
      }
    }

    return file;
  }

  async mergeColor(target: string, file: XmatterFile): Promise<XmatterFile> {
    if (!file.data.icon) {
      return file;
    }

    const iconPath = join(target, file.data.icon);
    if (!(await hasFile(iconPath))) {
      return file;
    }

    try {
      const primaryColor = await new Promise<[number, number, number]>((resolve, reject) => {
        colorThief.getColorFromUrl(iconPath, (color) => {
          if (color) resolve(color);
          else reject(new Error("Color extraction failed"));
        });
      });
      const hexColor = `#${primaryColor.map((c: number) => c.toString(16).padStart(2, "0")).join("")}`;

      return {
        ...file,
        data: {
          ...file.data,
          color: hexColor,
        },
      };
    } catch (error) {
      console.error(`Failed to extract color from ${iconPath}:`, error);
      return file;
    }
  }
}

export async function copyIf(from: string, to: string): Promise<void> {
  if (await hasFile(from)) {
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
