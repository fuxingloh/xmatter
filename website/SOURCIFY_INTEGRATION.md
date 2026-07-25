# Sourcify Integration

This document explains the Sourcify integration in the Xmatter website.

## Overview

The website now displays verified smart contract source code from [Sourcify.dev](https://sourcify.dev) on EVM address pages (e.g., `/eip155/1/0xc02...`). When available, the source code appears as the last section on the page.

## Implementation

The integration is implemented in `website/app/eip155/[chainId]/[address]/SourceCode.tsx` as a Server Component that:

1. Fetches verified contract data from Sourcify's public API: `https://sourcify.dev/server/files/{chainId}/{address}`
2. Filters to display only Solidity source files (`.sol` files)
3. Syntax highlights the code using Shiki (same highlighter used for code examples)
4. Renders nothing (`null`) if the contract is not verified on Sourcify

## Features

- **Automatic detection**: The component automatically checks if a contract is verified
- **Graceful degradation**: If not verified or if the API is unavailable, nothing is displayed
- **Caching**: Results are cached for 24 hours using Next.js's `revalidate` option
- **Syntax highlighting**: Uses Shiki with GitHub light/dark themes matching the site's theme
- **Multiple files**: Displays all Solidity source files for multi-file contracts

## Testing

### Local Development

In local development, you may not be able to reach Sourcify's API due to network restrictions. The component will gracefully return `null` and display nothing.

### Production

To test in production or staging:

1. Visit a verified contract page, for example:
   - WETH on Ethereum: `/eip155/1/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2`
   - USDC on Ethereum: `/eip155/1/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48`
   - USDT on Ethereum: `/eip155/1/0xdac17f958d2ee523a2206206994597c13d831ec7`

2. Scroll to the bottom of the page to see the "SOURCE CODE" section

3. Verify:
   - The section title says "SOURCE CODE"
   - There's a link to the contract on sourcify.dev
   - Source files are displayed with syntax highlighting
   - The code is readable and properly formatted

### Manual API Testing

You can manually test the Sourcify API:

```bash
# Check if WETH is verified
curl "https://sourcify.dev/server/files/1/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"

# Expected response: JSON with files array containing .sol files
```

## Known Limitations

- Only displays contracts verified on Sourcify (not all contracts are verified)
- Only displays Solidity source files (`.sol` extension)
- Requires external network access to Sourcify's API
- Very large contracts may take longer to render

## Future Enhancements

Potential improvements for future iterations:

1. Add collapsible file tree for multi-file contracts
2. Add line numbers to source code
3. Add copy button for individual files
4. Display compiler version and optimization settings
5. Show verification status/match type (full match vs partial match)
6. Add ability to search within source code
