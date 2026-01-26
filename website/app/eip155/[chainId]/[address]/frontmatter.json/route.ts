import { publicFetch } from "@/app/public";
import gray from "gray-matter";
import removeMarkdown from "remove-markdown";

export async function GET(_: Request, context: RouteContext<"/eip155/[chainId]/[address]/frontmatter.json">) {
  const { chainId, address } = await context.params;

  const readme = await publicFetch(`/eip155/${chainId}/${address}/README.md`);
  const { data, content } = gray(await readme.text());
  const stripped = removeMarkdown(content).trim();
  const description = stripped.length > 200 ? stripped.slice(0, 200) + "…" : stripped;
  return Response.json(
    { ...data, description },
    {
      headers: {
        "Cache-Control": "public, max-age=604800",
      },
    },
  );
}
