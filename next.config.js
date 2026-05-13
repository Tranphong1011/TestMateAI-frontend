/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['api.atlassian.com'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
  reactStrictMode: true,
  compiler: {
    ignoreBuildErrors: true,
  },
  experimental: {
    htmlAttributes: {
      suppressHydrationWarning: true,
    },
  },
}

module.exports = nextConfig 