import {
  MarkdownPipeline,
  rehypeExternalLinks,
  rehypeStringify,
  remarkFrontmatter,
  remarkFrontmatterCollect,
  remarkFrontmatterResolve,
  remarkFrontmatterValidate,
  remarkGfm,
  remarkParse,
  remarkRehype,
} from "@contentedjs/contented-pipeline-md";
import { join } from "node:path";
import { copyFile } from "node:fs/promises";
import { imageSize } from "image-size";
import { mkdirSync, existsSync, createReadStream } from "node:fs";
import { createHash } from "node:crypto";
import { promisify } from "node:util";
import { pipeline } from "node:stream";
import { readFileSync, writeFileSync } from "fs";

/**
 * To reduce complexity,
 * we only enable a subset of plugins for frontmatter to keep the authoring experience simple.
 */
const MDProcessor = MarkdownPipeline.withProcessor((processor) => {
  processor
    .use(remarkGfm)
    .use(remarkFrontmatter)
    .use(remarkParse)
    .use(remarkFrontmatterCollect)
    .use(remarkFrontmatterResolve)
    .use(remarkFrontmatterValidate)
    .use(remarkRehype)
    .use(rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] })
    .use(rehypeStringify);
});

function sha256(data) {
  return createHash("sha256").update(data).digest("hex");
}

async function generateContentHash(filePath) {
  const hash = createHash("sha256");
  await promisify(pipeline)(createReadStream(filePath), hash);
  return hash.digest("hex");
}

/**
 * @param fileId {string}
 * @param namespace {string}
 * @param filePath {string}
 * @return {Promise<[{mime: string, path: string}]>}
 */
async function computeImageField(fileId, namespace, filePath) {
  const reference = filePath.replace(/\/README\.md$/, "");

  async function computeAs({ type, from, ext, mime }) {
    const pngLogoPath = join("frontmatter", namespace, reference, from);
    if (existsSync(pngLogoPath) === false) {
      return [];
    }

    const size = imageSize(pngLogoPath);
    const imagePath = (await generateContentHash(pngLogoPath)) + ext;
    await copyFile(pngLogoPath, join(`_${namespace}`, imagePath));

    return [
      {
        type: type,
        mime: mime,
        size: {
          width: size.width,
          height: size.height,
        },
        path: imagePath,
      },
    ];
  }

  return [
    ...(await computeAs({
      type: "icon",
      from: "icon.png",
      ext: ".png",
      mime: "image/png",
    })),
    ...(await computeAs({
      type: "icon",
      from: "icon.svg",
      ext: ".svg",
      mime: "image/svg+xml",
    })),
  ];
}

function computeFileId(caip19) {
  const [caip2, asset] = caip19.split("/");
  const [namespace, reference] = asset.split(":");

  if (namespace === "erc20" && reference) {
    return sha256(`${caip2}/${namespace}:${reference.toLowerCase()}`);
  }

  return sha256(caip19);
}

/**
 * @param caip2 {string}
 * @param pipelines {{namespace: string}[]}
 * @return {import('@contentedjs/contented').ContentedConfig}
 */
export default function config(caip2, pipelines) {
  const packageJson = JSON.parse(readFileSync("package.json", "utf-8"));

  writeFileSync(
    "index.json",
    JSON.stringify({
      package: packageJson.name,
      caip2: caip2,
      namespaces: pipelines.map(({ namespace }) => {
        return {
          dir: `_${namespace}`,
          namespace: namespace,
        };
      }),
    }),
  );

  return {
    processor: {
      rootDir: "frontmatter",
      outDir: "./",
      pipelines: pipelines.map(({ namespace }) => {
        mkdirSync(`_${namespace}`, { recursive: true });

        return {
          type: `_${namespace}`,
          dir: namespace,
          pattern: "**/README.md",
          processor: MDProcessor,
          fields: {
            caip2: {
              type: "string",
              resolve: () => {
                return caip2;
              },
            },
            namespace: {
              type: "string",
              resolve: () => {
                return namespace;
              },
            },
            symbol: {
              type: "string",
              required: true,
            },
            decimals: {
              type: "number",
              required: true,
            },
            tags: {
              type: "string[]",
              required: false,
            },
            links: {
              type: "object",
              required: false,
            },
            /**
             * Populated by computeImageField
             */
            images: {
              type: "object",
              required: false,
            },
          },
          transform: async (fileContent, filePath) => {
            const reference = filePath.replace(/\/README\.md$/, "");
            const caip19 = `${caip2}/${namespace}:${reference}`;
            const fileId = computeFileId(caip19);

            // Only return essential fields to reduce the size of the JSON file.
            return {
              path: caip19,
              fileId: fileId,
              modifiedDate: fileContent.modifiedDate,
              type: fileContent.type,
              fields: {
                ...fileContent.fields,
                images: await computeImageField(fileId, namespace, filePath),
              },
              html: fileContent.html,
            };
          },
        };
      }),
    },
  };
}
