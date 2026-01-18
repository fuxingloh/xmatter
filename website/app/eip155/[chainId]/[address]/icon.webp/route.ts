import sharp from "sharp";
import { join } from "path";
import { readFile } from "node:fs/promises";
import { walk } from "@/app/matter";

export async function generateStaticParams() {
  return await walk("eip155");
}

const FILES = ["icon.svg", "icon.png", "icon.jpg", "icon.jpeg", "icon.webp"];

export async function GET(_: Request, context: RouteContext<"/eip155/[chainId]/[address]/icon.webp">) {
  const { chainId, address } = await context.params;
  const baseDir = join("../xmatter/eip155", chainId, address);

  for (const filename of FILES) {
    try {
      const filePath = join(baseDir, filename);
      const buffer = await readFile(filePath);

      const webpBuffer = await sharp(buffer).resize({ width: 512, height: 512 }).webp({ quality: 100 }).toBuffer();

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
