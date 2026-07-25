import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const ContentSecurityPolicy = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' blob:;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    worker-src 'self' blob:;
    connect-src 'self';
    object-src 'none';
    frame-ancestors 'none';
    upgrade-insecure-requests;
`;

const nextConfig: NextConfig = {
  transpilePackages: ["shiki"],
  poweredByHeader: false,
  // TODO(@fuxingloh): https://github.com/vercel/next.js/issues/76612
  cacheComponents: false,
  pageExtensions: ["md", "mdx", "ts", "tsx"],
  outputFileTracingExcludes: {
    "/*": ["../xmatter/**/*", "./public/**/*"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: ContentSecurityPolicy.replace(/\n/g, ""),
          },
          {
            key: "Referrer-Policy",
            value: "no-referrer",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: ["remark-gfm"],
    rehypePlugins: [
      "rehype-slug",
      [
        "@shikijs/rehype",
        {
          themes: {
            light: "github-light",
            dark: "github-dark",
          },
          defaultColor: false,
        },
      ],
    ],
  },
});

export default withMDX(nextConfig);
