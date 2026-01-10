import { copyFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

import { Command, Option, runExit } from "clipanion";

import { FrontmatterNamespace, getIndex, getIndexPath, getInstalledNamespaces, getNodeModulesPath } from "./index";

export class MirrorCommand extends Command {
  static override paths = [[`mirror`]];
  private target = Option.String();
  private include = Option.Array(`--include`, { required: false });

  private includes(type: string): boolean {
    return this.include?.includes(type) ?? true;
  }

  private async mirrorFile(namespace: FrontmatterNamespace, file: string, toPath: string = file): Promise<void> {
    const from = getNodeModulesPath(namespace.caip2, namespace.namespace, file);
    const to = join(this.target, toPath);
    await copyFile(from, to);
  }

  async execute(): Promise<number | void> {
    await mkdir(this.target, { recursive: true });

    for (const namespace of await getInstalledNamespaces()) {
      let count = 0;

      if (this.includes("index.json")) {
        const toPath = getIndexPath(namespace.caip2, namespace.namespace);
        await this.mirrorFile(namespace, "index.json", toPath);
        count++;
      }

      for (const frontmatter of (await getIndex(namespace.caip2, namespace.namespace))!) {
        if (this.includes("frontmatter.json")) {
          await this.mirrorFile(namespace, frontmatter.fileId + ".json");
          count++;
        }

        if (this.includes("images")) {
          for (const image of frontmatter.fields.images) {
            await this.mirrorFile(namespace, image.path);
            count++;
          }
        }
      }

      this.context.stdout.write(`Mirrored ${count} files for "${namespace.caip2}/${namespace.namespace}"\n`);
    }
  }
}

// noinspection JSIgnoredPromiseFromCall
void runExit([MirrorCommand]);
