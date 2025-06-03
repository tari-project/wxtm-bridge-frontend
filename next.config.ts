import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')

    return config
  },
  output: 'export',
  images: {
    loaderFile: './utils/imageLoader.ts',
    path: process.env.NEXT_PUBLIC_PATH,
  },
}

const withNextIntl = createNextIntlPlugin()

export default withNextIntl(nextConfig)
