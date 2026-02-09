import { docsGroups, docsLinks } from "@/app/docs";

export const dynamic = "force-static";

export function GET() {
  const sections = docsGroups
    .map((group) => {
      const links = docsLinks
        .filter((link) => link.group === group)
        .map((link) => `- [${link.label}](https://xmatter.org${link.href}.md)`)
        .join("\n");
      return `## ${group}\n\n${links}`;
    })
    .join("\n\n");

  const content = `# Xmatter

> Structured metadata registry for smart contracts — the "frontpage" of blockchain addresses. The npm registry for assets on-chain.

Every blockchain application eventually needs to display human-readable metadata for addresses: a name, an icon, a symbol, or some other information. Today this information is scattered across token lists, GitHub repos, and proprietary databases with no standard way to look it up.

Xmatter is a structured metadata registry that gives every smart contract address a canonical "frontpage". Each entry is a README.md file with YAML frontmatter, stored in a flat filesystem organized by Xmatter Path (a URL-safe CAIP-10 identifier).

The registry is designed for efficient reads. A prefix-indexed existence check lets clients short-circuit before fetching, so most lookups for non-existent addresses never hit the server. The JavaScript client and Next.js components handle this automatically.

${sections}
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
