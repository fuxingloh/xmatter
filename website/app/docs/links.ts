export const docsLinks = [
  {
    href: "/docs",
    label: "Xmatter",
    group: "Documentation",
    keywords: ["overview", "introduction", "getting started"],
  },
  {
    href: "/docs/standards/path",
    label: "Resource URI",
    group: "Standards",
    keywords: ["uri", "caip-10", "identifier", "address", "caip-19"],
  },
  {
    href: "/docs/standards/markdown",
    label: "README.md",
    group: "Standards",
    keywords: ["frontmatter", "yaml", "metadata", "schema"],
  },
  { href: "/docs/api", label: "API Reference", group: "Developers", keywords: ["rest", "endpoint", "http", "fetch"] },
  {
    href: "/docs/javascript",
    label: "JavaScript Client",
    group: "Developers",
    keywords: ["sdk", "npm", "typescript", "library"],
  },
  {
    href: "/docs/nextjs",
    label: "Next.js Integration",
    group: "Developers",
    keywords: ["react", "ssr", "framework", "vercel"],
  },
  {
    href: "/docs/rate-limits",
    label: "Rate Limits",
    group: "Developers",
    keywords: ["throttle", "quota", "limit", "usage"],
  },
];

export const docsGroups = Array.from(new Set(docsLinks.map((d) => d.group)));
