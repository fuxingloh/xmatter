export default function GettingStartedPage() {
  return (
    <>
      <h1>Getting Started</h1>

      <p>This guide will help you get started with Xmatter.</p>

      <h2>Installation</h2>

      <p>Install Xmatter using your preferred package manager:</p>

      <pre>
        <code>npm install xmatter</code>
      </pre>

      <pre>
        <code>bun add xmatter</code>
      </pre>

      <h2>Usage</h2>

      <p>Xmatter uses a URL-safe CAIP-10 standard to identify assets across blockchains.</p>

      <h3>Example: Wrapped Ether (WETH)</h3>

      <pre>
        <code>{`import { readMetadata } from 'xmatter';

// Read metadata for WETH on Ethereum mainnet
const metadata = await readMetadata('eip155/1/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2');

console.log(metadata.name); // "Wrapped Ether"
console.log(metadata.symbol); // "WETH"`}</code>
      </pre>

      <h2>URI Format</h2>

      <p>Xmatter uses different URI formats for different blockchain runtimes:</p>

      <table>
        <thead>
          <tr>
            <th>Runtime</th>
            <th>Namespace</th>
            <th>URI Format</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>EVM</td>
            <td>eip155</td>
            <td>
              <code>eip155/chain/resource</code>
            </td>
          </tr>
          <tr>
            <td>SVM</td>
            <td>solana</td>
            <td>
              <code>solana/chain/resource</code>
            </td>
          </tr>
          <tr>
            <td>TVM</td>
            <td>tip474</td>
            <td>
              <code>tip474/chain/type/resource</code>
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Next Steps</h2>

      <ul>
        <li>Learn about URI Standards</li>
        <li>Explore the API Reference</li>
        <li>See Examples</li>
      </ul>
    </>
  );
}
