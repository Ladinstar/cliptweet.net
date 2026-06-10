/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: `next build` emits a fully static site to `out/`,
  // served by nginx (which also reverse-proxies /api to the Express API).
  output: 'export',
  trailingSlash: true,
  images: {
    // next/image optimization needs a server; static export uses plain <img>.
    unoptimized: true,
  },
  reactStrictMode: true,
};

export default nextConfig;
