import type { NextConfig } from "next";
import nextra from "nextra";

const ContentSecurityPolicy = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    object-src 'none';
    frame-ancestors 'none';
    upgrade-insecure-requests;
`;

const withNextra = nextra({
  defaultShowCopyCode: true,
  readingTime: true,
});

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // TODO(@fuxing): https://github.com/vercel/next.js/issues/76612
  cacheComponents: false,
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
  async rewrites() {
    return {
      beforeFiles: [{ source: "/eip155/:chainId/:address\.md", destination: "/eip155/:chainId/:address/README.md" }],
    };
  },
};

export default withNextra(nextConfig);
