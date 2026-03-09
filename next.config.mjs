/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    "@wppconnect-team/wppconnect",
    "puppeteer",
    "puppeteer-core",
    "winston",
  ],
  transpilePackages: ["recharts", "es-toolkit", "@reduxjs/toolkit"],
  experimental: {
    proxyTimeout: 3_600_000, // 1 hour for large video uploads
    middlewareClientMaxBodySize: "10gb",
  },
  async rewrites() {
    return {
      // beforeFiles rewrites are checked before pages/public files
      beforeFiles: [],
      // afterFiles rewrites are checked after pages/public files but before dynamic routes
      afterFiles: [
        {
          // Only proxy to Go backend for paths that are NOT /api/whatsapp or /api/fawaterk
          source: "/api/:path((?!whatsapp|fawaterk).*)",
          destination: "http://127.0.0.1:3000/api/:path*",
        },
        {
          // Proxy storage files (PDFs, images, etc.) to Go backend
          source: "/public/storage/:path*",
          destination: "http://127.0.0.1:3000/public/storage/:path*",
        },
        {
          // Proxy WebSockets for live video
          source: "/ws/live/:path*",
          destination: "http://127.0.0.1:3000/ws/live/:path*",
        },
      ],
      // fallback rewrites are checked after both pages/public files and dynamic routes
      fallback: [],
    };
  },
};

export default nextConfig;
