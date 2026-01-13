import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@tari-project/wxtm-bridge-contracts'],
  serverExternalPackages: ['pino-pretty', 'lokijs', 'encoding'],
  images: {
    loaderFile: './utils/imageLoader.ts',
    path: process.env.NEXT_PUBLIC_PATH,
  },
  output: 'export',
}

export default nextConfig
