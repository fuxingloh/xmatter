import { readFile } from "fs/promises";
import { join } from "path";
import { docsLinks } from "@/app/docs";

export function generateStaticParams() {
  return docsLinks
    .filter((link) => link.href !== "/docs")
    .map((link) => {
      const parts = link.href.replace("/docs/", "").split("/");
      parts[parts.length - 1] += ".md";
      return { slug: parts };
    });
}

export async function GET(_: Request, context: RouteContext<"/docs/[...slug]">) {
  const { slug } = await context.params;
  const last = slug[slug.length - 1];

  if (!last.endsWith(".md")) {
    return new Response(null, { status: 404 });
  }

  // /docs/api.md → docs/api/page.md
  // /docs/standards/path.md → docs/standards/path/page.md
  const dir = last.slice(0, -3);
  const parts = [...slug.slice(0, -1), dir];
  const pagePath = join("docs", ...parts, "page.md");

  let content: string;
  try {
    content = await readFile(join(process.cwd(), "app", pagePath), "utf-8");
  } catch {
    try {
      content = await readFile(join(process.cwd(), "app", pagePath + "x"), "utf-8");
    } catch {
      return new Response(null, { status: 404 });
    }
  }

  // Strip MDX imports and JSX components for plain text consumption
  content = content.replace(/^import\s+.*;\s*\n/gm, "");
  content = content.replace(/<EmailReveal\s*\/>/g, "xmatter.org");

  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
