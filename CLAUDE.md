# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Xmatter is a structured metadata registry for smart contracts - the "frontpage" of blockchain addresses. It uses a URL-safe CAIP-10 standard for canonical identifiers across multiple blockchain namespaces (EVM/eip155, Solana/solana, TVM/tip474).

## Repository Structure

- **`xmatter/`** - Static metadata files organized by namespace (eip155, solana, tip474), containing README.md files with YAML frontmatter and optional icons
- **`packages/xmatter`** - Core library with Zod schema definitions for metadata validation
- **`packages/agent-base`** - Base class (`FileSystemAgent`) for building data ingestion agents
- **`packages/agent-ethereum-optimism`** - Agent that ingests from ethereum-optimism/ethereum-optimism.github.io
- **`packages/agent-trust-wallet`** - Agent that ingests from trustwallet/assets
- **`website/`** - Next.js 16 website (BUSL-1.1 licensed), metadata viewer + docs site
  - `app/` - Next.js App Router pages and layouts
  - `app/docs/` - Documentation pages written in `.md` and `.mdx`
  - `app/eip155/[chainId]/[address]/` - Dynamic metadata pages with API routes
  - `components/` - Shared UI components (`ActiveLink`, `cx`, icons)
  - `public/` - Symlink to `../xmatter` (metadata files served as static assets)

## Commands

```bash
bun install           # Install dependencies
bun run build         # Build all packages (turbo)
bun run test          # Run all tests (turbo)
bun run lint          # Lint and fix (turbo)
bun run format        # Format with prettier

# Run a single package's tests
bunx turbo run test --filter=xmatter
bunx turbo run test --filter=@workspace/agent-base

# Run agents to ingest data (from their package directories)
cd packages/agent-ethereum-optimism && bun run agent
cd packages/agent-trust-wallet && bun run agent

# Website development
cd website && bun run dev
```

## Architecture

### Data Ingestion Flow

Agents extend `FileSystemAgent<Entry>` from `@workspace/agent-base/fs`:

1. `readEntry(path)` - Parse source data (JSON files from external repos)
2. `toReadmeFile(uri, entry)` - Transform to Xmatter schema format
3. `write()` - Merge with existing data, copy icons, extract primary colors, write README.md

Entries are written to `xmatter/{namespace}/{chainId}/{address}/README.md` as YAML frontmatter + markdown content. A `LOCK` file in a directory prevents agent overwrites.

### Schema (packages/xmatter/schema.ts)

The `FrontmatterSchema` defines:

- `name`, `provenance`, `standards[]` (required)
- `symbol`, `decimals`, `icon`, `color`, `links[]`, `tags[]` (optional)

### URI Format

- EVM: `eip155/{chainId}/{address}` (e.g., `eip155/1/0xc02...`)
- Solana: `solana/{genesisHash}/{address}`
- TVM: `tip474/{chainId}/{type}/{address}` (e.g., `tip474/728126428/trc20/...`)

### Website (website/)

**Routing & Pages:**

- Uses Next.js 16 App Router with file-based routing
- Documentation pages are plain `.md` or `.mdx` files (e.g., `app/docs/api/page.md`)
- Dynamic metadata pages at `app/eip155/[chainId]/[address]/` with SSG via `generateStaticParams()`
- API route handlers serve icon files, frontmatter JSON, and plain text at sub-paths (e.g., `icon/route.ts`, `frontmatter.json/route.ts`)

**Data Fetching:**

- `app/public.ts` provides `getXmatterFile(path)` — fetches from the public directory via internal URL, parses YAML frontmatter with `gray-matter`, returns `{ data, content }`
- Icons are processed with `sharp` for format conversion and optimization (WebP, resizing)
- Cache headers: `max-age=86400` (24 hours) on API routes

**Styling:**

- Tailwind CSS 4 with `@tailwindcss/postcss` (PostCSS plugin, configured in `postcss.config.mjs`)
- Custom monochromatic theme using CSS `light-dark()` function in `app/layout.css` (`--color-mono-50` through `--color-mono-950`)
- `@tailwindcss/typography` plugin for prose/markdown styling
- `cx()` utility in `components/cx.ts` combines `clsx` + `tailwind-merge`

**Key Libraries:**

- `@base-ui/react` — headless UI primitives (Select component)
- `lucide-react` — icons
- `next-themes` — light/dark/system theme switching
- `@shikijs/rehype` — syntax highlighting in markdown (github-light/dark themes)
- `remark-gfm`, `rehype-slug` — markdown enhancements
- `react-markdown` — renders markdown content in dynamic pages

**Component Patterns:**

- Server components by default; client components marked with `'use client'` only when needed (theme toggle, copy button, interactive selectors)
- Page-specific client components live alongside their page (e.g., `app/eip155/[chainId]/[address]/CopyButton.tsx`)
- Shared components in `components/` directory
- MDX components configured in `mdx-components.tsx` at website root

**Security:**

- Strict CSP, HSTS, X-Frame-Options: DENY, nosniff headers configured in `next.config.ts`
- Metadata base URL: `https://xmatter.org`

## Important: Documentation as Source of Truth

The `website/app/docs/` directory contains the project's own documentation (API reference, standards, etc.). When making changes to APIs, schemas, or behavior, always check if the relevant docs in `website/app/docs/` need updating too. Keep code and docs in sync.

## Technical Stack

- Bun
- TypeScript 5.9
- Turborepo for monorepo orchestration
- Website: Next.js 16, React 19, Tailwind CSS 4
