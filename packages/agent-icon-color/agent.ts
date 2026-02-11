import { readdir, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import gray from "gray-matter";
import { XmatterFile } from "xmatter/schema";
import { FileSystemAgent, hasFile } from "@workspace/agent-base/fs";

interface Entry {
  address: string;
  file: XmatterFile;
}

class IconColorAgent extends FileSystemAgent<Entry> {
  async readEntry(source: string): Promise<Entry | undefined> {
    const readmePath = join(source, "README.md");
    if (!(await hasFile(readmePath))) {
      return undefined;
    }

    try {
      const existing = gray.read(readmePath);
      return {
        address: basename(source),
        file: {
          data: existing.data as XmatterFile["data"],
          content: existing.content,
        },
      };
    } catch {
      return undefined;
    }
  }

  toReadmeFile(_uri: string, entry: Entry): XmatterFile {
    return entry.file;
  }

  override async write(_uri: string, _entry: Entry, _source: string, target: string, file: XmatterFile): Promise<void> {
    const iconsBefore = file.data.icons;
    file = await this.mergeIcons(target, file);

    const iconsChanged =
      iconsBefore.length !== file.data.icons.length || iconsBefore.some((icon, i) => icon !== file.data.icons[i]);
    if (iconsChanged || !file.data.color) {
      file = await this.mergeColor(target, file);
    }

    await writeFile(join(target, "README.md"), gray.stringify(file.content ?? "", file.data));
  }
}

const agent = new IconColorAgent();

const XMATTER_DIR = "../../xmatter";
const NAMESPACES: { namespace: string; depth: number }[] = [
  { namespace: "eip155", depth: 1 },
  { namespace: "solana", depth: 1 },
  { namespace: "tip474", depth: 2 },
];

for (const { namespace, depth } of NAMESPACES) {
  const namespacePath = join(XMATTER_DIR, namespace);
  await walkDepth(namespacePath, namespace, [], depth);
}

async function walkDepth(dir: string, namespace: string, parts: string[], remaining: number): Promise<void> {
  const entries = await readdir(dir).catch(() => [] as string[]);
  for (const entry of entries) {
    const entryPath = join(dir, entry);
    if (remaining > 1) {
      await walkDepth(entryPath, namespace, [...parts, entry], remaining - 1);
    } else {
      const prefix = [namespace, ...parts, entry].join("/");
      await agent.walk(entryPath, {
        filter: () => true,
        toUri: (e) => `${prefix}/${e.address}`,
      });
    }
  }
}
