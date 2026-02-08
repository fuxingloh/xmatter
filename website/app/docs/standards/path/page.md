# Xmatter Path (Resource URI)

Xmatter Path is a resource identifier (URI) standard used within Xmatter
to determine the canonical identifier for a Xmatter entry.
It follows the [CAIP-10](https://standards.chainagnostic.org) standard modified to be url-safe to be used in URLs.

For example, the Wrapped Ether (WETH) will be `eip155/1/0xc02a...6cc2` without checksum.
While an asset can implement multiple standards,
the canonical identifier is the same and the "frontpage" of the asset is the same.

For namespaces that support multiple standards that many conflict with each other,
we use the CAIP-19 (url-safe) standard to determine the canonical identifier.

```
CAIP-10: eip155/1/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2
CAIP-19: tip474/728126428/trc10/1000001
```

## Supported Namespaces

| Runtime | Namespace | URI                          |
| ------- | --------- | ---------------------------- |
| EVM     | eip155    | `eip155/chain/resource`      |
| SVM     | solana    | `solana/chain/resource`      |
| TVM     | tip474    | `tip474/chain/type/resource` |

## Filesystem Structure

```
xmatter/
├─ eip155/
│  ├─ 1/
│  │  ├─ 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/
│  │  │  ├─ README.md
│  │  │  ├─ icon.svg
│  │  │  ├─ icon.png
│  │  │  └─ icon.jpg
│  │  └─ 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984/
│  │     ├─ README.md
│  │     └─ icon.png
│  ├─ 56/
│  └─ 11155111/
├─ solana
│  └─ 5eykt4usfv8p8njdtrepy1vzqkqzkvdp/
```
