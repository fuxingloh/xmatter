import { readFile } from "fs/promises";
import { join } from "path";

export const dynamic = "force-static";

export async function GET() {
  const content = await readFile(join(process.cwd(), "app", "docs", "page.mdx"), "utf-8");

  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
