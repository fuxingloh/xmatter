import { publicFetch } from "@/app/public";
import gray from "gray-matter";

export async function GET(_: Request, context: RouteContext<"/eip155/[chainId]/[address]/frontmatter.json">) {
  const { chainId, address } = await context.params;

  const readme = await publicFetch(`/eip155/${chainId}/${address}/README.md`);
  const { data } = gray(await readme.text());
  return Response.json(data, {
    headers: {
      "Cache-Control": "public, max-age=604800, immutable",
    },
  });
}
