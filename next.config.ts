import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')

    return config
  },
  output: 'export',
  images: {
    loaderFile: './utils/imageLoader.ts',
    path: process.env.NEXT_PUBLIC_PATH,
  }

}

export default nextConfig
