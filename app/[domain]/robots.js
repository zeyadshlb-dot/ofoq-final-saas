/**
 * Dynamic robots.txt — يُنشئ ملف robots.txt تلقائياً لكل تينانت
 * بيخبر محركات البحث إيه الصفحات اللي يزورها وإيه اللي يتجنبها
 */
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/dashboard/",
          "/api/",
          "/panel/",
          "/login",
          "/register",
          "/_next/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/dashboard/", "/api/", "/panel/"],
      },
    ],
    sitemap: "/sitemap.xml",
  };
}
