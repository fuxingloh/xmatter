import config from "@workspace/contented-config";

/**
 * CAIP2: solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp
 * Solana CAIP2 contains uppercase letters, which are not allowed in npm package names.
 * Hence, the package name is @crypto-frontmatter/solana-5eykt4usfv8p8njdtrepy1vzqkqzkvdp.
 */
export default config("solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp", [
  {
    namespace: "slip44",
  },
  {
    namespace: "token",
  },
]);
