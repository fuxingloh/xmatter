import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { Command } from "clipanion";
import { stringify } from "yaml";

import { getValidateErrors, README, validate } from "./README";

/* eslint-disable @typescript-eslint/no-unused-vars */

export abstract class SyncCommand<Data> extends Command {
  async walkDir(
    dir: string,
    options: {
      toPath: (data: Data) => string;
      filter: (data: Data) => boolean;
      toREADME?: (data: Data) => README;
    },
  ): Promise<void> {
    for (const entry of await readdir(dir)) {
      const fromPath = join(dir, entry);
      const data = await this.readData(fromPath);

      if (data === undefined) continue;
      if (!options.filter(data)) continue;

      const toPath = options.toPath(data);
      const readme = (options.toREADME ?? this.toREADME)(data);
      if (!validate(readme)) {
        this.context.stdout.write(`Invalid README for ${toPath}, ${getValidateErrors()}\n`);
        continue;
      }

      if (!(await this.shouldWrite(data, fromPath, toPath, readme))) continue;
      await this.write(data, fromPath, toPath, readme);
    }
  }

  abstract readData(fromPath: string): Promise<Data | undefined>;

  abstract toREADME(data: Data): README;

  async shouldWrite(data: Data, fromPath: string, toPath: string, readme: README): Promise<boolean> {
    return !(await hasFile(join(toPath, "LOCK")));
  }

  async write(data: Data, fromPath: string, toPath: string, readme: README): Promise<void> {
    await mkdir(toPath, { recursive: true });
    await writeFile(
      join(toPath, "README.md"),
      [`---`, stringify(readme.frontmatter), `---`, "", `# ${readme.title}`, "", readme.body ?? ""].join("\n"),
    );
  }
}

export function hasFile(filepath: string): Promise<boolean> {
  return stat(filepath).then(
    () => true,
    () => false,
  );
}
