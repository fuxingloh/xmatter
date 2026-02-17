# <a href="https://xmatter.org"><img src="website/app/icon.svg" alt="xmatter logo" width="26"></a> Xmatter

Structured metadata for addresses and smart contracts — the frontpage for every on-chain address.
The npm registry for assets on-chain.

Every blockchain application eventually needs to display human-readable metadata for addresses:
a name, an icon, a symbol, or some other piece of information.
Today this data is scattered across token lists, GitHub repos, and proprietary databases
with no standard way to look it up.

Xmatter is a structured metadata registry that gives every smart contract address a canonical "frontpage".
Each entry is a `README.md` file with YAML frontmatter, stored in a flat filesystem
organized by [Xmatter Path](https://xmatter.org/docs/standards/path) (a URL-safe CAIP-10 identifier).
Xmatter is committed to:

- **Open-source** — the registry data and all released packages are MIT-licensed
- **Open participation** — anyone can add or update metadata by opening a pull request
- **Open standards** — identifiers follow [CAIP-10](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-10.md) across EVM, Solana, and TVM chains

instead of siloed, proprietary metadata services. We want every blockchain application to have access to the same high-quality metadata without vendor lock-in.

## Project Structure

Xmatter mainly consists of:

- [`xmatter/`](/xmatter) — the registry itself: static metadata files organized by namespace (`eip155`, `solana`, `tip474`), each containing a `README.md` with YAML frontmatter and an optional icon
- [`xmatter` npm package](/packages/xmatter) — core library with Zod schema definitions, a JavaScript client with prefix-index existence checks, and Next.js components
- [`website/`](/website) — the [xmatter.org](https://xmatter.org) website: metadata viewer, docs, and API (Next.js, BUSL-1.1 licensed)

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
      <XmatterIcon client={xmatter} chainId={chainId} address={address} />
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

## Documentation

For full API reference, schema details, and integration guides, see [xmatter.org/docs](https://xmatter.org/docs).

## Contributing

Xmatter is an open registry — anyone can add metadata for a smart contract address by opening a [pull request](https://github.com/fuxingloh/xmatter/pulls). See the [contributing guide](https://xmatter.org/docs/contributing) for step-by-step instructions.

## License

The [`/xmatter`](/xmatter) directory and all released packages are licensed under MIT (as per provenance),
a fully permissive open-source license.

The [`/website`](/website) is licensed under the [Business Source License 1.1](https://spdx.org/licenses/BUSL-1.1.html) (BUSL-1.1),
with an automatic conversion to the GNU GPL after the stipulated change date.
This help funds ongoing development and maintenance of the open-source registry.
