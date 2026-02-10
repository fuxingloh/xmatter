# Xmatter

Structured metadata for address and smart contracts; building the frontpage for an address.
The npm registry for assets on-chain.

## Motivation

Every blockchain application eventually needs to display human-readable metadata for addresses:
a name, an icon, a symbol, or some other information.
Today this information is scattered across token lists, GitHub repos, and proprietary databases
with no standard way to look it up.

Xmatter is a structured metadata registry that gives every smart contract address a canonical "frontpage".
Each entry is a `README.md` file with YAML frontmatter, stored in a flat filesystem
organized by [Xmatter Path](/docs/standards/path) (a URL-safe CAIP-10 identifier).

The registry is designed for efficient reads.
A [prefix-indexed existence check](/docs/api#indextxt) lets clients short-circuit before fetching,
so most lookups for non-existent addresses never hit the server.
The [JavaScript client](/docs/javascript) and [Next.js components](/docs/nextjs) handle this automatically.


## Integrating with your project

```shell
npm install xmatter
```

```tsx
// pages/address/[chainId]/[address].tsx
import { XmatterClient } from "xmatter/client";
import { XmatterIcon } from "xmatter/next/server";

const xmatter = new XmatterClient("eip155");

export default async function Page(props) {
  const { chainId, address } = await props.params;
  const frontmatter = await xmatter.getFrontmatter(chainId, address);

  return (
    <div>
      <XmatterIcon
        client={xmatter} 
        chainId={chainId} 
        address={address}
        width={64} 
        height={64} 
        alt={`${frontmatter.name} Icon`}
      />
      <h1>{frontmatter.name}</h1>
    </div>
  );
}
```

```ts
// next.config.ts
import { RemotePattern } from "xmatter/next";

const nextConfig = {
  images: {
    remotePatterns: [RemotePattern],
  },
};
```

## License

The `/xmatter` directory and all released packages are licensed under MIT (as per provenance),
a fully permissive open-source license.

The `/website` is licensed under the Business Source License 1.1 (BUSL-1.1),
with an automatic conversion to the GNU GPL after the stipulated change date.
