# Next.js Integration

The `xmatter` package provides React components for rendering Xmatter icons in Next.js applications.
There are two variants: a server component and a client component with different tradeoffs.

```bash
npm add xmatter
```

## RemotePattern

Both server and client components use `next/image` under the hood.
Configure `remotePatterns` in your `next.config.ts` to allow image optimization from `xmatter.org`.

```ts
import { RemotePattern } from "xmatter/next";

const nextConfig = {
  images: {
    remotePatterns: [RemotePattern],
  },
};
```

## Server Component

`xmatter/next/server` provides an async server component that uses [`XmatterClient`](/docs/javascript) to check
existence before rendering. If the address doesn't exist, it renders the fallback without making an icon request.

```tsx
import { XmatterClient } from "xmatter/client";
import { XmatterIcon } from "xmatter/next/server";

const xmatter = new XmatterClient("eip155");

export default async function Page() {
  const frontmatter = await xmatter.getFrontmatter("1", "0xc02...");
  if (!frontmatter) return notFound();

  return (
    <XmatterIcon
      client={xmatter}
      chainId="1"
      address="0xc02..."
      width={64}
      height={64}
      alt={`${frontmatter.name} Icon`}
      fallback={<div className="size-16 rounded-full bg-gray-300" />}
    />
  );
}
```

| Prop       | Type            | Description                                             |
| ---------- | --------------- | ------------------------------------------------------- |
| `client`   | `XmatterClient` | An instance of `XmatterClient`                          |
| `chainId`  | `string`        | Chain ID (e.g. `"1"`)                                   |
| `address`  | `string`        | Contract address                                        |
| `fallback` | `ReactNode`     | Rendered when the icon doesn't exist                    |
| `...props` | `ImageProps`    | Passed to `next/image` (`width`, `height`, `alt`, etc.) |

The server component calls `client.getIconUrl()` which checks the [prefix index](/docs/api#indextxt)
before constructing the URL. This means missing addresses are caught without making an icon request.

## Client Component

`xmatter/next/client` provides a client component that renders icons directly by constructing the URL.
It does not check existence first.

```tsx
"use client";
import { XmatterIcon } from "xmatter/next/client";

export function TokenIcon() {
  return (
    <XmatterIcon
      namespace="eip155"
      chainId="1"
      address="0xc02..."
      width={64}
      height={64}
      alt="WETH Icon"
      fallback={<div className="size-16 rounded-full bg-gray-300" />}
    />
  );
}
```

| Prop        | Type         | Description                                             |
| ----------- | ------------ | ------------------------------------------------------- |
| `namespace` | `string`     | Blockchain namespace (e.g. `"eip155"`)                  |
| `chainId`   | `string`     | Chain ID (e.g. `"1"`)                                   |
| `address`   | `string`     | Contract address                                        |
| `fallback`  | `ReactNode`  | Rendered when the image fails to load                   |
| `baseUrl`   | `string`     | Base URL (default: `"https://xmatter.org"`)             |
| `...props`  | `ImageProps` | Passed to `next/image` (`width`, `height`, `alt`, etc.) |

> Using `xmatter/next/client`, icons are loaded directly without checking existence first.
> Missing addresses will result in 404 requests to `xmatter.org` and count against the [rate limit](/docs/rate-limits).
> Use the server component if you can, as it checks existence via the prefix index and avoids unnecessary 404 requests.

## Server vs Client

|                   | Server (`xmatter/next/server`)             | Client (`xmatter/next/client`)    |
| ----------------- | ------------------------------------------ | --------------------------------- |
| Rendering         | Async server component                     | Client component                  |
| Existence check   | Yes, via `XmatterClient` prefix index      | No                                |
| Missing addresses | Renders fallback without icon request      | Makes icon request, gets 404      |
| Rate limit impact | Minimal (index files are small and cached) | Higher (404s count against limit) |
| Use when          | You have server rendering available        | You need client-side rendering    |
