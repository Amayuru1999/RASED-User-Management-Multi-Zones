import type { NextConfig } from 'next'
import path from 'node:path'

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    externalDir: true,
  },
  turbopack: {
    root: path.join(__dirname, '..'),
  },
  basePath: '/users',
  assetPrefix: '/users',
  transpilePackages: ['rased-shared-ui'],
}

export default nextConfig
