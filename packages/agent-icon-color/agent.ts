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
const NAMESPACES: { namespace: string; types: string[] }[] = [
  { namespace: "eip155", types: [] },
  { namespace: "solana", types: [] },
  { namespace: "tip474", types: ["trc10", "trc20"] },
];

for (const { namespace, types } of NAMESPACES) {
  const namespacePath = join(XMATTER_DIR, namespace);
  const chains = await readdir(namespacePath, { withFileTypes: true }).catch(() => []);

  for (const chain of chains) {
    if (!chain.isDirectory()) continue;
    const chainPath = join(namespacePath, chain.name);

    if (types.length > 0) {
      for (const type of types) {
        await agent.walk(join(chainPath, type), {
          filter: () => true,
          toUri: (e) => `${namespace}/${chain.name}/${type}/${e.address}`,
        });
      }
    } else {
      await agent.walk(chainPath, {
        filter: () => true,
        toUri: (e) => `${namespace}/${chain.name}/${e.address}`,
      });
    }
  }
}
