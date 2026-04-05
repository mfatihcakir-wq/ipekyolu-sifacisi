import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Type', value: 'text/html; charset=utf-8' },
        ],
      },
    ]
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /supabase\/functions\//,
      use: 'ignore-loader',
    })
    return config
  },
}

export default withNextIntl(nextConfig)
