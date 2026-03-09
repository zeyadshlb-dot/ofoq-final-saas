/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    "@wppconnect-team/wppconnect",
    "puppeteer",
    "puppeteer-core",
    "winston",
  ],
  transpilePackages: ["recharts", "es-toolkit", "@reduxjs/toolkit"],

  // مهم جداً عشان الـ Cookies والـ Subdomains تشتغل صح في الـ Production
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.ofoq.site",
        pathname: "/public/storage/**",
      },
    ],
  },

  experimental: {
    proxyTimeout: 3_600_000,
  },

  async rewrites() {
    return [
      {
        // الباك إند (Go)
        source: "/api/:path((?!whatsapp|fawaterk).*)",
        // استخدم localhost لو الباك إند على نفس السيرفر لأداء أسرع
        destination: "http://127.0.0.1:3000/api/:path*",
      },
      {
        source: "/public/storage/:path*",
        destination: "http://127.0.0.1:3000/public/storage/:path*",
      },
      {
        // الـ WebSockets محتاجة معاملة خاصة، بس جرب دي الأول مع Nginx
        source: "/ws/live/:path*",
        destination: "http://127.0.0.1:3000/ws/live/:path*",
      },
    ];
  },
};

export default nextConfig;
