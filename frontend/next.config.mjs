/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Remove static export configuration for Vercel deployment
  // Vercel handles Next.js builds natively without static export
}

export default nextConfig
