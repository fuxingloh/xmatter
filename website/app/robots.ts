import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/_next/", "/_vercel/"],
      },
      {
        userAgent: "*",
        disallow: "/",
      },
    ],
    sitemap: `https://xmatter.org/sitemap.xml`,
  };
}
