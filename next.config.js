/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,           // Helps catch potential React issues
  swcMinify: true,                 // Uses the SWC compiler for faster builds
  experimental: {
    appDir: true,                  // Enables the new App Router
    typedRoutes: true,             // Optional: gives typed routing if you want
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',            // Allow any remote images (change if needed)
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,      // Prevent ESLint from breaking the build
  },
}

module.exports = nextConfig
