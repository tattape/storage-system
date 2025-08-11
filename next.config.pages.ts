import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options for GitHub Pages */
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: '/storage-system', // GitHub Pages subdirectory
  assetPrefix: '/storage-system/',
  // Disable server-side features
  experimental: {
    esmExternals: true,
  },
};

export default nextConfig;
