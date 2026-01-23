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
- **`website/`** - Next.js 16 website (BUSL-1.1 licensed), uses `../xmatter` as public directory via symlink

## Commands

```bash
pnpm install          # Install dependencies
pnpm build            # Build all packages (turbo)
pnpm test             # Run all tests (turbo)
pnpm lint             # Lint and fix (turbo)
pnpm format           # Format with prettier

# Run a single package's tests
turbo run test --filter=xmatter
turbo run test --filter=@workspace/agent-base

# Run agents to ingest data (from their package directories)
cd packages/agent-ethereum-optimism && pnpm agent
cd packages/agent-trust-wallet && pnpm agent

# Website development
cd website && pnpm dev
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

## Technical Stack

- Node 24, pnpm 10.28.0
- TypeScript 5.9, Vitest for testing
- Turborepo for monorepo orchestration
- Website: Next.js 16, React 19, Tailwind CSS 4
