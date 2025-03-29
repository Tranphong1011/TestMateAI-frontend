/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['api.atlassian.com'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
}

module.exports = nextConfig 