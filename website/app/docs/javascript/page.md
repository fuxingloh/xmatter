# Xmatter Client (JavaScript)

The `xmatter` package provides `XmatterClient`, a lightweight client for querying Xmatter metadata.
It uses the [prefix index](/docs/api#indextxt) to check existence before fetching resources,
avoiding unnecessary 404 requests and reducing [rate limit](/docs/rate-limits) consumption.

```bash
npm add xmatter
```

## XmatterClient

```ts
import { XmatterClient } from "xmatter/client";

const xmatter = new XmatterClient("eip155");
```

### Constructor

```ts
new XmatterClient(namespace: string, baseUrl?: string | URL, cacheSize?: number)
```

| Parameter   | Default                 | Description                            |
| ----------- | ----------------------- | -------------------------------------- |
| `namespace` | _(required)_            | Blockchain namespace (e.g. `"eip155"`) |
| `baseUrl`   | `"https://xmatter.org"` | Base URL of the Xmatter API            |
| `cacheSize` | `4096`                  | Maximum entries in the LRU index cache |

### has(chainId, address)

Check if an address exists by walking the prefix index tree in 2-byte steps.
This avoids fetching the actual resource and short-circuits early when the address is not found.

```ts
const exists = await xmatter.has("1", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
```

### getFrontmatter(chainId, address)

Fetch the frontmatter metadata for an address. Returns `undefined` if the address does not exist.
Checks existence via `has()` first to avoid 404 requests.

```ts
const frontmatter = await xmatter.getFrontmatter("1", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");

if (frontmatter) {
  console.log(frontmatter.name); // "WETH"
  console.log(frontmatter.symbol); // "WETH"
  console.log(frontmatter.decimals); // 18
}
```

### getIconUrl(chainId, address)

Build the URL for the address's icon endpoint. Returns `undefined` if the address does not exist.
The icon endpoint returns a 256x256 WebP image.

```ts
const url = await xmatter.getIconUrl("1", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
// URL { "https://xmatter.org/eip155/1/0xc02.../icon" }
```

### getIconWebpUrl(chainId, address)

Same as `getIconUrl` but uses the `icon.webp` endpoint,
which preserves the original format for small icons (< 25KB) and converts larger ones to 256x256 WebP.

```ts
const url = await xmatter.getIconWebpUrl("1", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
// URL { "https://xmatter.org/eip155/1/0xc02.../icon.webp" }
```

### getIndex(chainId, prefix)

Low-level method to fetch the prefix index directly.
Results are cached in the LRU cache with TTL from the response `Cache-Control` header.

```ts
const entries = await xmatter.getIndex("1", "0xc0");
// ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0xc00e94cb662c3520282e6f5717214004a7f26888"]
```

## Frontmatter Type

```ts
import type { Frontmatter } from "xmatter/client";
```

| Field         | Type                              | Required |
| ------------- | --------------------------------- | -------- |
| `name`        | `string`                          | Yes      |
| `provenance`  | `string`                          | Yes      |
| `standards`   | `string[]`                        | Yes      |
| `icons`       | `string[]`                        | Yes      |
| `description` | `string`                          | No       |
| `symbol`      | `string`                          | No       |
| `decimals`    | `number`                          | No       |
| `color`       | `string` (hex, e.g. `#ec4899`)    | No       |
| `tags`        | `string[]`                        | No       |
| `links`       | `{ name: string, url: string }[]` | No       |

## XmatterError

All failed HTTP requests throw an `XmatterError` with the status code and response body.

```ts
import { XmatterError } from "xmatter/client";

try {
  await xmatter.getIndex("1", "0xzz");
} catch (error) {
  if (error instanceof XmatterError) {
    console.log(error.status); // 400
    console.log(error.message);
  }
}
```
