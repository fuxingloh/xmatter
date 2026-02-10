import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import gray from "gray-matter";
import { getColor } from "colorthief";
import sharp from "sharp";
import { hasFile } from "@workspace/agent-base/fs";

const XMATTER_DIR = "../../xmatter";
const NAMESPACES = ["eip155", "solana", "tip474"];
const ICON_EXTENSIONS = ["icon.svg", "icon.png", "icon.jpg", "icon.jpeg"];
const ICON_RESIZE_DIMENSION = 128;

async function processDirectory(dirPath: string): Promise<void> {
  const readmePath = join(dirPath, "README.md");

  if (!(await hasFile(readmePath))) {
    return;
  }

  // Check for LOCK file - skip if present
  if (await hasFile(join(dirPath, "LOCK"))) {
    console.log(`Skipping ${dirPath} (LOCK file present)`);
    return;
  }

  try {
    // Read and parse existing README.md
    const existing = gray.read(readmePath);
    const data = existing.data;

    // Track if we made any changes
    let changed = false;

    // Detect icons in the directory
    const icons: string[] = [];
    for (const icon of ICON_EXTENSIONS) {
      const iconPath = join(dirPath, icon);
      if (await hasFile(iconPath)) {
        icons.push(icon);
      }
    }

    // Update icons array if different
    // Note: Order matters - icons are listed in priority order (svg, png, jpg, jpeg)
    const existingIcons = data.icons || [];
    const iconsChanged = icons.length !== existingIcons.length || icons.some((icon, i) => icon !== existingIcons[i]);

    if (iconsChanged) {
      data.icons = icons;
      changed = true;
    }

    // Extract primary color from first icon if available and not already set
    if (icons.length > 0 && !data.color) {
      const firstIcon = icons[0];
      const iconPath = join(dirPath, firstIcon);

      try {
        let buffer: Buffer = await readFile(iconPath);

        // Convert SVG to PNG using sharp before color extraction
        if (firstIcon.endsWith(".svg")) {
          buffer = Buffer.from(
            await sharp(buffer).png().resize(ICON_RESIZE_DIMENSION, ICON_RESIZE_DIMENSION).toBuffer(),
          );
        }

        const primaryColor = await getColor(buffer);

        if (primaryColor) {
          const hexColor = `#${primaryColor.map((c: number) => c.toString(16).padStart(2, "0")).join("")}`;
          data.color = hexColor;
          changed = true;
        }
      } catch (error) {
        console.error(`Failed to extract color from ${iconPath}:`, error);
      }
    }

    // Only write if we made changes
    if (changed) {
      await writeFile(readmePath, gray.stringify(existing.content ?? "", data));
      console.log(`Updated ${dirPath}`);
    }
  } catch (error) {
    console.error(`Error processing ${dirPath}:`, error);
  }
}

async function walkDirectory(dirPath: string): Promise<void> {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Check if this directory has a README.md
        if (await hasFile(join(fullPath, "README.md"))) {
          await processDirectory(fullPath);
        }

        // Recursively walk subdirectories
        await walkDirectory(fullPath);
      }
    }
  } catch (error) {
    // Directory might not exist or be inaccessible, continue
    console.error(`Error walking ${dirPath}:`, error);
  }
}

async function main(): Promise<void> {
  console.log("Starting icon and color processing agent...");

  for (const namespace of NAMESPACES) {
    const namespacePath = join(XMATTER_DIR, namespace);
    console.log(`\nProcessing namespace: ${namespace}`);
    await walkDirectory(namespacePath);
  }

  console.log("\nProcessing complete!");
}

main().catch(console.error);
