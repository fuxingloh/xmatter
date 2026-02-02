import { publicFetch } from "@/app/public";
import gray, { GrayMatterFile } from "gray-matter";
import removeMd from "remove-markdown";

export async function GET(_: Request, context: RouteContext<"/eip155/[chainId]/[address]/frontmatter.json">) {
  const { chainId, address } = await context.params;

  const readme = await publicFetch(`/eip155/${chainId}/${address}/README.md`);
  if (!readme.ok) {
    return new Response(null, { status: readme.status });
  }

  const { data, content } = gray(await readme.text());
  const description = getDescription(data, content);
  const frontmatter = { ...data, description };
  return Response.json(frontmatter, {
    headers: {
      "Cache-Control": "public, max-age=86400",
    },
  });
}

export function getDescription(data: GrayMatterFile<string>["data"], content?: string) {
  if (typeof data.description === "string" && data.description.length > 0) {
    return data.description;
  }
  if (!content) return undefined;
  const stripped = removeMd(content).trim();
  return stripped.length > 200 ? stripped.slice(0, 200) + "…" : stripped;
}
