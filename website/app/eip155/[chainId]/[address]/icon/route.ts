import sharp from "sharp";
import { publicFetch } from "@/app/public";

export async function generateStaticParams() {
  return [
    {
      chainId: "1",
      address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    },
  ];
}

const FILES: [string, string][] = [
  ["icon.svg", "image/svg+xml"],
  ["icon.png", "image/png"],
  ["icon.jpg", "image/jpeg"],
  ["icon.webp", "image/webp"],
];

export async function GET(_: Request, context: RouteContext<"/eip155/[chainId]/[address]/icon.webp">) {
  const { chainId, address } = await context.params;

  for (const [filename, contentType] of FILES) {
    const image = await publicFetch(`/eip155/${chainId}/${address}/${filename}`);
    if (!image.ok) continue;

    const buffer = await image.arrayBuffer();

    if (buffer.byteLength < 25_000) {
      return new Response(buffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    const webp = await sharp(buffer).resize(256, 256).webp({ quality: 90 }).toBuffer();
    return new Response(new Uint8Array(webp), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  return new Response(null, { status: 404, headers: { "Cache-Control": "public, max-age=86400" } });
}
