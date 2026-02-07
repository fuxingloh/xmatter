// @ts-expect-error -- moduleResolution:node can't resolve package exports
import { createHighlighter } from "shiki/bundle/web";
import { CodeExamplesClient } from "./CodeExamplesClient";

const examples = {
  "next/server": [
    `import { XmatterClient } from "xmatter/client";`,
    `import { XmatterIcon } from "xmatter/next/server";`,
    ``,
    `const xmatter = new XmatterClient("eip155");`,
    ``,
    `const frontmatter = await xmatter.getFrontmatter("1", "0xc02...");`,
    ``,
    `<XmatterIcon`,
    `  client={xmatter}`,
    `  chainId="1"`,
    `  address="0xc02..."`,
    `  width={64}`,
    `  height={64}`,
    `  alt="WETH"`,
    `  fallback={<span>?</span>}`,
    `/>`,
  ],
  "next/client": [
    `import { XmatterIcon, RemotePattern } from "xmatter/next/client";`,
    ``,
    `<XmatterIcon`,
    `  namespace="eip155"`,
    `  chainId="1"`,
    `  address="0xc02..."`,
    `  width={64}`,
    `  height={64}`,
    `  alt="WETH"`,
    `  fallback={<span>?</span>}`,
    `/>`,
    ``,
    `// next.config.ts`,
    `// images: { remotePatterns: [RemotePattern] }`,
  ],
} as const;

type ExampleKey = keyof typeof examples;

export default async function CodeExamples() {
  const highlighter = await createHighlighter({
    themes: ["github-light", "github-dark"],
    langs: ["tsx"],
  });

  const highlighted: Record<ExampleKey, string> = {} as Record<ExampleKey, string>;
  for (const [key, lines] of Object.entries(examples)) {
    highlighted[key as ExampleKey] = highlighter.codeToHtml(lines.join("\n"), {
      lang: "tsx",
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      defaultColor: false,
    });
  }

  highlighter.dispose();

  return <CodeExamplesClient examples={Object.keys(examples)} highlighted={highlighted} />;
}
