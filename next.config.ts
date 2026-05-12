import type { NextConfig } from 'next'
const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    externalDir: true,
  },
  basePath: '/users',
  assetPrefix: '/users',
  transpilePackages: ['rased-shared-ui'],
}

export default nextConfig
