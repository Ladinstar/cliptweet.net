// `output: 'export'` (full static build to `out/`) is required for production —
// nginx serves the static files and reverse-proxies /api. But it's incompatible
// with `next dev` for dynamic [locale] routes (it demands generateStaticParams on
// every page). So we only enable it for production builds; dev runs as a normal
// on-demand SSR server.
const isDev = process.env.NODE_ENV === 'development';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: isDev ? undefined : 'export',
  trailingSlash: true,
  images: {
    // next/image optimization needs a server; static export uses plain <img>.
    unoptimized: true,
  },
  reactStrictMode: true,
};

export default nextConfig;
