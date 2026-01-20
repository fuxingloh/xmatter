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

const FILES = ["icon.svg", "icon.png", "icon.jpg"];

export async function GET(_: Request, context: RouteContext<"/eip155/[chainId]/[address]/icon.webp">) {
  const { chainId, address } = await context.params;

  for (const filename of FILES) {
    try {
      const image = await publicFetch(`/eip155/${chainId}/${address}/${filename}`);
      if (!image.ok) continue;

      const imageBuffer = await image.arrayBuffer();
      const webpBuffer = await sharp(imageBuffer).resize({ width: 256, height: 256 }).webp({ quality: 100 }).toBuffer();

      return new Response(new Uint8Array(webpBuffer), {
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch (error) {}
  }

  return new Response("Icon not found", { status: 404 });
}
