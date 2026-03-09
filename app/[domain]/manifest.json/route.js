import { NextResponse } from "next/server";
import { getTenant } from "@/lib/getTenant";

export async function GET(request, { params }) {
  const { domain } = await params;
  const layoutData = await getTenant(domain);
  const theme = layoutData?.data?.theme || {};

  const platformName = theme.platformName || "أكاديميتنا";
  const desc =
    theme.metaDescription || "منصة تعليمية متكاملة تقدم أحدث الكورسات";
  const logo = theme.favicon || theme.logo || "/favicon.ico";

  // Extract a clean hex color for the PWA theme color, with fallback
  const primary = theme.primary || "#8b5cf6";
  const themeColor = primary.startsWith("oklch") ? "#8b5cf6" : primary;

  const manifest = {
    name: platformName,
    short_name: platformName.substring(0, 12),
    description: desc,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: themeColor,
    icons: [
      {
        src: logo,
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: logo,
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: logo,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: logo,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
    },
  });
}
