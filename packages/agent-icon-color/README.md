# Agent Icon Color

Standalone agent that walks the xmatter/ directory and processes icons and colors for all entries.

## Purpose

This agent addresses the issue where icons are copied to xmatter directories but the README.md frontmatter never gets updated with the icon filenames or extracted colors. It processes all existing entries and:

- Detects icon files (icon.svg, icon.png, icon.jpg, icon.jpeg)
- Updates the `icons` array in README.md frontmatter
- Extracts primary color from the first icon using sharp + colorthief
- Updates the `color` field in README.md frontmatter (only if not already set)

## Usage

```bash
cd packages/agent-icon-color
bun run agent
```

## How it works

The agent:

1. Walks all namespace directories: `xmatter/eip155/**`, `xmatter/solana/**`, `xmatter/tip474/**`
2. For each directory containing a README.md:
   - Skips if a LOCK file is present
   - Parses frontmatter with gray-matter
   - Scans for icon files
   - Updates icons array if it differs from existing
   - Extracts primary color if not already set
   - Writes back README.md only if changes were made

## Dependencies

- `@workspace/agent-base` - For the hasFile utility
- `xmatter` - For schema validation (transitive)
- `gray-matter` - YAML frontmatter parsing
- `sharp` - Image processing (SVG to PNG conversion)
- `colorthief` - Primary color extraction
