function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_URL) {
    return process.env.NEXT_PUBLIC_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return `http://localhost:${process.env.PORT ?? 3000}`;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    BASE_URL: getBaseUrl(),
  },
  output: "standalone",
  trailingSlash: false,
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
