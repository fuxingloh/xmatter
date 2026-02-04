export default function DocsPage() {
  return (
    <>
      <h1>Documentation</h1>

      <p>
        Welcome to the Xmatter documentation. Xmatter is a structured metadata registry for smart contracts - the
        &quot;frontpage&quot; of blockchain addresses.
      </p>

      <h2>What is Xmatter?</h2>

      <p>
        Xmatter provides a standardized way to store and access metadata for smart contracts across different blockchain
        namespaces including:
      </p>

      <ul>
        <li>
          <strong>EVM (eip155)</strong>: Ethereum and EVM-compatible chains
        </li>
        <li>
          <strong>SVM (solana)</strong>: Solana blockchain
        </li>
        <li>
          <strong>TVM (tip474)</strong>: Tron Virtual Machine
        </li>
      </ul>

      <h2>Features</h2>

      <ul>
        <li>URL-safe CAIP-10 standard for canonical identifiers</li>
        <li>Static metadata files with YAML frontmatter</li>
        <li>Support for multiple blockchain namespaces</li>
        <li>Extensible data ingestion via agents</li>
        <li>MIT licensed core packages</li>
      </ul>

      <h2>Getting Started</h2>

      <p>
        Check out the <a href="/docs/getting-started">Getting Started</a> guide to begin using Xmatter in your project.
      </p>
    </>
  );
}
