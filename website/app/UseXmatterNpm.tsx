// @ts-expect-error -- moduleResolution:node can't resolve package exports
import { createHighlighter } from "shiki/bundle/web";

const codeBlocks = [
  {
    filename: "terminal",
    lang: "shellscript" as const,
    code: `npm add xmatter`,
  },
  {
    filename: "app/[chainId]/[address]/page.tsx",
    lang: "tsx" as const,
    code: [
      `import { XmatterClient } from "xmatter/client";`,
      `import { XmatterIcon } from "xmatter/next/server";`,
      ``,
      `const xmatter = new XmatterClient("eip155");`,
      ``,
      `export default async function Page(props) {`,
      `  const { chainId, address } = await props.params;`,
      `  const frontmatter = await xmatter.getFrontmatter(chainId, address);`,
      ``,
      `  return (`,
      `    <div>`,
      `      <XmatterIcon`,
      `        client={xmatter} chainId={chainId} address={address}`,
      `        width={64} height={64} alt={\`\${frontmatter.name} Icon\`}`,
      `      />`,
      `      <h1>{frontmatter.name}</h1>`,
      `    </div>`,
      `  );`,
      `}`,
    ].join("\n"),
  },
  {
    filename: "next.config.ts",
    lang: "tsx" as const,
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
];

export default async function UseXmatterNpm() {
  const highlighter = await createHighlighter({
    themes: ["github-light", "github-dark"],
    langs: ["tsx", "shellscript"],
  });

  const highlighted = codeBlocks.map((block) => ({
    filename: block.filename,
    html: highlighter.codeToHtml(block.code, {
      lang: block.lang,
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      defaultColor: false,
    }),
  }));

  highlighter.dispose();

  return (
    <div>
      <div className="flex flex-col gap-3">
        {highlighted.map((block) => (
          <div key={block.filename} className="border-mono-200 overflow-hidden rounded-lg border">
            <div className="border-mono-200 bg-mono-100/75 flex items-center border-b px-3.5 py-2.5">
              <span className="text-mono-500 font-mono text-xs">{block.filename}</span>
            </div>
            <div
              className="[&_pre]:bg-mono-50 overflow-x-auto text-xs [&_pre]:overflow-x-auto [&_pre]:px-3.5 [&_pre]:py-3"
              dangerouslySetInnerHTML={{ __html: block.html }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
