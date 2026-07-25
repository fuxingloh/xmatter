#!/usr/bin/env bun
/**
 * Generate static HTML files from documentation for Pagefind indexing
 */
import { join } from "node:path";
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import matter from "gray-matter";
import strip from "remove-markdown";

const APP_DIR = join(process.cwd(), "app");
const DOCS_DIR = join(APP_DIR, "docs");
const OUT_DIR = join(process.cwd(), ".next/search-html");

interface DocPage {
  path: string;
  url: string;
  title: string;
  content: string;
  group: string;
}

async function findMarkdownFiles(dir: string, baseDir: string = dir): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules") {
      files.push(...(await findMarkdownFiles(fullPath, baseDir)));
    } else if (entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))) {
      files.push(fullPath);
    }
  }

  return files;
}

function getUrlFromPath(filePath: string, baseDir: string): string {
  const rel = filePath.replace(baseDir, "").replace(/\\/g, "/");
  const cleaned = rel
    .replace(/\/page\.(md|mdx)$/, "")
    .replace(/\.(md|mdx)$/, "")
    .replace(/\/index$/, "");
  return cleaned || "/docs";
}

async function extractContent(filePath: string): Promise<{ title: string; content: string }> {
  const raw = await readFile(filePath, "utf-8");
  const { data, content } = matter(raw);

  // Remove MDX/JSX components and get plain text
  const plainText = strip(content);

  const title = data.title || "Documentation";

  return { title, content: plainText };
}

async function generateHTMLFile(doc: DocPage): Promise<void> {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${doc.title}</title>
</head>
<body>
  <article data-pagefind-body>
    <h1>${doc.title}</h1>
    <div data-pagefind-meta="group">${doc.group}</div>
    <div data-pagefind-meta="url">${doc.url}</div>
    <div>${doc.content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
  </article>
</body>
</html>`;

  // Create output path
  const outPath = join(OUT_DIR, doc.url, "index.html");
  const outDir = join(OUT_DIR, doc.url);

  if (!existsSync(outDir)) {
    await mkdir(outDir, { recursive: true });
  }

  await writeFile(outPath, html, "utf-8");
}

async function main() {
  console.log("Generating search HTML files...");

  // Create output directory
  if (!existsSync(OUT_DIR)) {
    await mkdir(OUT_DIR, { recursive: true });
  }

  // Find all markdown files
  const markdownFiles = await findMarkdownFiles(DOCS_DIR);
  console.log(`Found ${markdownFiles.length} markdown files`);

  const docs: DocPage[] = [];

  for (const filePath of markdownFiles) {
    const url = getUrlFromPath(filePath, APP_DIR);
    const { title, content } = await extractContent(filePath);

    // Determine group from URL
    let group = "Documentation";
    if (url.includes("/standards/")) group = "Standards";
    else if (
      url.includes("/api") ||
      url.includes("/javascript") ||
      url.includes("/nextjs") ||
      url.includes("/rate-limits")
    ) {
      group = "Developers";
    }

    docs.push({
      path: filePath,
      url,
      title,
      content,
      group,
    });
  }

  // Generate HTML files
  for (const doc of docs) {
    await generateHTMLFile(doc);
    console.log(`Generated: ${doc.url}`);
  }

  console.log(`\nGenerated ${docs.length} HTML files in ${OUT_DIR}`);
  console.log("Ready for Pagefind indexing!");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
