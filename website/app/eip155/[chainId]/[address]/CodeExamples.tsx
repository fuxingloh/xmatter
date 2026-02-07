// @ts-expect-error -- moduleResolution:node can't resolve package exports
import { createHighlighter } from "shiki/bundle/web";
import { CodeExamplesClient, type CodeBlock } from "./CodeExamplesClient";

function getExamples(chainId: string, address: string, name: string) {
  return {
    "next/server": [
      {
        filename: `app/eip155/${chainId}/${address}/page.tsx`,
        code: [
          `import { notFound } from "next/navigation";`,
          `import { XmatterClient } from "xmatter/client";`,
          `import { XmatterIcon } from "xmatter/next/server";`,
          ``,
          `const xmatter = new XmatterClient("eip155");`,
          ``,
          `export default async function Page() {`,
          `  const address = "${address}";`,
          `  const frontmatter = await xmatter.getFrontmatter("${chainId}", address);`,
          `  if (!frontmatter) return notFound();`,
          ``,
          `  return (`,
          `    <div>`,
          `      <XmatterIcon`,
          `        client={xmatter}`,
          `        chainId="${chainId}"`,
          `        address="${address}"`,
          `        width={64}`,
          `        height={64}`,
          `        alt={\`\${frontmatter.name} Icon\`}`,
          `        fallback={<div className="size-[64px] rounded-full bg-[#aaa]" />}`,
          `      />`,
          `      <h1>{frontmatter.name}</h1>`,
          `      <p>{frontmatter.symbol}: {frontmatter.decimals} decimals</p>`,
          `    </div>`,
          `  );`,
          `}`,
        ].join("\n"),
      },
      {
        filename: "next.config.ts",
        code: [
          `import { RemotePattern } from "xmatter/next";`,
          ``,
          `const nextConfig = {`,
          `  images: {`,
          `    remotePatterns: [RemotePattern],`,
          `  },`,
          `};`,
        ].join("\n"),
      },
    ],
    "next/client": [
      {
        filename: "components/Example.tsx",
        code: [
          `"use client";`,
          `import { XmatterIcon } from "xmatter/next/client";`,
          ``,
          `// Using xmatter/next/client icons are loaded directly without checking existence first.`,
          `// Missing addresses will result in 404 requests to xmatter.org and thus rate limiting.`,
          `// Use xmatter/next/server if you can as it is cached and avoids unnecessary 404 requests.`,
          ``,
          `export function TokenIcon() {`,
          `  return (`,
          `    <XmatterIcon`,
          `      namespace="eip155"`,
          `      chainId="${chainId}"`,
          `      address="${address}"`,
          `      width={64}`,
          `      height={64}`,
          `      alt="${name} Icon"`,
          `      fallback={<div className="size-[64px] rounded-full bg-[#aaa]" />}`,
          `    />`,
          `  );`,
          `}`,
        ].join("\n"),
      },
      {
        filename: "next.config.ts",
        code: [
          `import { RemotePattern } from "xmatter/next";`,
          ``,
          `const nextConfig = {`,
          `  images: {`,
          `    remotePatterns: [RemotePattern],`,
          `  },`,
          `  // Optionally rewrite to proxy xmatter.org requests from the client`,
          `  // e.g. /eip155/{chainId}/{address}/icon -> https://xmatter.org/eip155/{chainId}/{address}/icon`,
          `  async rewrites() {`,
          `    return [`,
          `      {`,
          `        source: "/eip155/:chainId/:address/:path*",`,
          `        destination: "https://xmatter.org/eip155/:chainId/:address/:path*",`,
          `      },`,
          `    ];`,
          `  },`,
          `};`,
        ].join("\n"),
      },
    ],
  };
}

type HighlightedExamples = Record<string, CodeBlock[]>;

export default async function CodeExamples(props: { chainId: string; address: string; name: string }) {
  const examples = getExamples(props.chainId, props.address, props.name);

  const highlighter = await createHighlighter({
    themes: ["github-light", "github-dark"],
    langs: ["tsx"],
  });

  const highlighted: HighlightedExamples = {};
  for (const [key, blocks] of Object.entries(examples)) {
    highlighted[key] = blocks.map((block) => ({
      filename: block.filename,
      html: highlighter.codeToHtml(block.code, {
        lang: "tsx",
        themes: {
          light: "github-light",
          dark: "github-dark",
        },
        defaultColor: false,
      }),
    }));
  }

  highlighter.dispose();

  return <CodeExamplesClient examples={Object.keys(examples)} highlighted={highlighted} />;
}
