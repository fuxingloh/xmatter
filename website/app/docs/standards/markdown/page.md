# README.md

Popularized by GitHub,
a `README.md` file is a text file containing useful information about a project.
Xmatter follows the same convention, each `address` must have a `README.md` file with frontmatter.

## Frontmatter

You can import the `Frontmatter` type to get the shape of the frontmatter.

```ts
import type { Frontmatter } from "xmatter/schema";
```

```ts
interface Frontmatter {
  name: string;
  provenance: string;
  standards: string[];
  description?: string;
  symbol?: string;
  decimals?: number;
  tags?: string[];
  links?: { name: string; url: string }[];
  icons: string[]; // auto generated (not required)
  color?: string; // auto generated (not required)
}
```

## Example (WETH)

### Where it lives

```txt
xmatter/   (root)
└─ eip155/ (namespace)
   └─ 1/   (chainId)
      └─ 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/
         ├─ README.md
         └─ icon.png
```

### README.md with frontmatter

```md
---
symbol: WETH
decimals: 18
links:
  - name: website
    url: "https://weth.io/"
name: WETH
provenance: "https://github.com/ethereum-optimism/ethereum-optimism.github.io"
standards:
  - erc20
---

WETH (Wrapped Ether) is Ethereum's native ETH locked in a smart contract and issued
as an ERC-20 token 1:1, so you can use ETH in DeFi protocols, DEXs, and NFT
marketplaces that only support ERC-20 tokens while its price stays pegged to ETH.
```
