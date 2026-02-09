import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { docsLinks } from "@/app/docs";

const APP_DIR = join(process.cwd(), "app");

async function resolvePageFile(href: string): Promise<string> {
  const dir = join(APP_DIR, href);
  for (const ext of ["md", "mdx"]) {
    const filePath = join(dir, `page.${ext}`);
    try {
      await access(filePath);
      return filePath;
    } catch {}
  }
  throw new Error(`No page.md or page.mdx found for ${href}`);
}

function stripFrontmatterAndImports(content: string): string {
  let result = content;

  // Strip YAML frontmatter
  if (result.startsWith("---")) {
    const end = result.indexOf("---", 3);
    if (end !== -1) {
      result = result.slice(end + 3).trimStart();
    }
  }

  // Strip MDX import lines
  result = result
    .split("\n")
    .filter((line) => !line.startsWith("import "))
    .join("\n");

  // Strip JSX component tags like <EmailReveal />
  result = result.replace(/<\w+\s*\/>/g, "");

  return result.trim();
}

export const dynamic = "force-static";

export async function GET() {
  const header =
    "# Xmatter \u2014 Full Documentation\n\n" +
    '> Structured metadata registry for smart contracts \u2014 the "frontpage" of blockchain addresses.';

  const sections: string[] = [header];

  for (const doc of docsLinks) {
    const filePath = await resolvePageFile(doc.href);
    const raw = await readFile(filePath, "utf-8");
    const cleaned = stripFrontmatterAndImports(raw);
    sections.push(cleaned);
  }

  const content = sections.join("\n\n---\n\n") + "\n";

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
