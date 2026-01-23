# [Xmatter](https://xmatter.org)

Structured metadata for smart contracts, the frontpage of an address.

> If you need a beautifully crafted crypto icon library for Tokens, Networks, and Wallets,
> you should look at [0xa3k5/web3icons](https://github.com/0xa3k5/web3icons).
> This library focuses on a separate problem space.

## Xmatter Standards

Xmatter follows a url-safe [CAIP-10](https://standards.chainagnostic.org) standard to determine
the canonical identifier for a "matter".
For example, Wrapped Ether (WETH) is `eip155/1/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2` without checksum.
While an asset can implement multiple standards,
the canonical identifier is the same and the "frontpage" of the asset is the same.

For namespaces that support multiple standards that many conflict with each other,
we use the CAIP-19 (url-safe) standard to determine the canonical identifier. Example: `tip474/728126428/trc10/1000001`

| Runtime | Namespace | URI                          |
| ------- | --------- | ---------------------------- |
| EVM     | eip155    | `eip155/chain/resource`      |
| SVM     | solana    | `solana/chain/resource`      |
| TVM     | tip474    | `tip474/chain/type/resource` |

## License

The `./xmatter` directory and all released packages are licensed under MIT, a fully permissive open-source license.
The `./website` is licensed under the Business Source License 1.1 (BUSL-1.1),
with an automatic conversion to the GNU GPL after the stipulated change date.
