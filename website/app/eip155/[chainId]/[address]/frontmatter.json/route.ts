import { publicFetch } from "@/app/public";
import type { Frontmatter } from "xmatter/schema";
import gray, { GrayMatterFile } from "gray-matter";
import removeMd from "remove-markdown";

export async function GET(_: Request, context: RouteContext<"/eip155/[chainId]/[address]/frontmatter.json">) {
  const { chainId, address } = await context.params;

  const readme = await publicFetch(`/eip155/${chainId}/${address}/README.md`);
  if (!readme.ok) {
    return new Response(null, { status: readme.status });
  }

  return Response.json(toFrontmatterJson(await readme.text()), {
    headers: {
      "Cache-Control": "public, max-age=86400",
    },
  });
}

function toFrontmatterJson(readme: string): Frontmatter {
  const { data, content } = gray(readme);
  if (!data.description) {
    data.description = getDescription(data, content);
  }
  return data as unknown as Frontmatter;
}

export function getDescription(data: GrayMatterFile<string>["data"], content?: string) {
  if (typeof data.description === "string" && data.description.length > 0) {
    return data.description;
  }
  if (!content) return undefined;
  const stripped = removeMd(content)
    .split("\n")
    .map((line) => line.trim())
    .join(" ");

  return stripped.length > 200 ? stripped.slice(0, 200) + "…" : stripped;
}
