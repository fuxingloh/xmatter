# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Xmatter is a structured metadata registry for smart contracts - the "frontpage" of blockchain addresses. It uses a URL-safe CAIP-10 standard for canonical identifiers across multiple blockchain namespaces (EVM/eip155, Solana/solana, TVM/tip474).

## Repository Structure

- **`xmatter/`** - Static metadata files organized by namespace, containing README.md files with YAML frontmatter and optional icons
- **`packages/xmatter`** - Core library: Zod schema definitions, HTTP client (`XmatterClient`), and Next.js components
- **`packages/agent-base`** - Base class (`FileSystemAgent`) for building data ingestion agents
- **`packages/agent-ethereum-optimism`** - Agent ingesting from ethereum-optimism/ethereum-optimism.github.io
- **`packages/agent-trust-wallet`** - Agent ingesting from trustwallet/assets
- **`packages/agent-smol-dapp`** - Agent ingesting from SmolDapp/tokenAssets (uses viem for on-chain RPC)
- **`packages/agent-icon-color`** - Agent that re-processes existing entries to refresh icon detection and color extraction
- **`website/`** - Next.js 16 website (BUSL-1.1 licensed), metadata viewer + docs site

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

# Run agents (from their package directories)
cd packages/agent-ethereum-optimism && bun run agent
cd packages/agent-trust-wallet && bun run agent
cd packages/agent-smol-dapp && bun run agent
cd packages/agent-icon-color && bun run agent

# Website development
cd website && bun run dev
```

## Testing

Tests use **bun:test** (Bun's native test runner), not vitest:

```typescript
import { describe, it, expect } from "bun:test";
```

## Conventions

- **Commit messages**: Conventional commits — `feat(scope):`, `fix(scope):`, `chore(scope):`, `refactor(scope):`, `docs(scope):`
- **PR titles**: Must be semantic (enforced by "Semantic Pull Request" check)
- **Formatting**: Prettier with `printWidth: 120`, enforced via husky + lint-staged pre-commit hook. **Never run `bun run format` manually** — the git commit hook handles formatting automatically.
- **ESLint**: Only in the website (`eslint-config-next/core-web-vitals`)
- **Modules**: All packages use ESM (`"type": "module"`)

## Architecture

### Data Ingestion Flow

Agents extend `FileSystemAgent<Entry>` from `@workspace/agent-base/fs`:

1. `readEntry(path)` - Parse source data (JSON files from external repos cloned to `.repo/`)
2. `toReadmeFile(uri, entry)` - Transform to Xmatter schema format
3. `write()` - Merge with existing data, copy icons, extract primary colors, write README.md

Key behaviors:

- **Merge strategy**: Existing keys are never overwritten — only new keys are added
- **LOCK file**: A `LOCK` file in a metadata directory prevents agent overwrites
- Entries are written to `xmatter/{namespace}/{chainId}/{address}/README.md` as YAML frontmatter + markdown
- **CI**: When adding a new agent, always register it in `.github/workflows/agent.yml` under the matrix
- **Chain IDs**: Always verify chain IDs against [chainlist.org](https://chainlist.org). Never guess chain IDs.
- **Testnets**: Never skip testnet chains — include them in agents

### Schema (packages/xmatter/schema.ts)

The `FrontmatterSchema` defines:

- `name`, `provenance`, `standards[]`, `icons[]` (required)
- `description`, `symbol`, `decimals`, `color`, `links[]`, `tags[]` (optional)

### xmatter Package Entry Points

- `xmatter/schema` - `FrontmatterSchema`, `XmatterSchema`, `Frontmatter`, `XmatterFile` types
- `xmatter/client` - `XmatterClient` class (LRU-cached HTTP client for xmatter.org API)
- `xmatter/next` - `RemotePattern` for next.config.ts, `XmatterIcon` components

### URI Format

- EVM: `eip155/{chainId}/{address}` (e.g., `eip155/1/0xc02...`)
- Solana: `solana/{genesisHash}/{address}`
- TVM: `tip474/{chainId}/{type}/{address}` (e.g., `tip474/728126428/trc20/...`)

### Website (website/)

- Next.js 16 App Router; `website/public` is a **symlink** to `../xmatter`
- Docs pages are plain `.md`/`.mdx` files in `app/docs/`
- Dynamic metadata pages at `app/eip155/[chainId]/[address]/` with SSG via `generateStaticParams()`
- API routes serve icons, frontmatter JSON, and plain text at sub-paths
- `app/public.ts` provides `getXmatterFile(path)` — fetches from public directory, parses YAML frontmatter
- Tailwind CSS 4 with custom monochromatic theme using `light-dark()` in `app/layout.css`
- Server components by default; client components marked with `'use client'` only when needed
- `cx()` utility in `components/cx.ts` combines `clsx` + `tailwind-merge`

## Important: Documentation as Source of Truth

The `website/app/docs/` directory contains the project's own documentation (API reference, standards, etc.). When making changes to APIs, schemas, or behavior, always check if the relevant docs need updating too.

## Technical Stack

- Bun (1.3.9)
- TypeScript 5.9
- Turborepo for monorepo orchestration
- Website: Next.js 16, React 19, Tailwind CSS 4
