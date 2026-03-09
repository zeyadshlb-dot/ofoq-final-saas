import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getTenant } from "@/lib/getTenant";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ToastProvider } from "@/components/ToastProvider";
import { TopProgressBar } from "@/components/TopProgressBar";
import { InstallPwaModal } from "@/components/InstallPwaModal";

function getRadiusValue(radiusStr) {
  const map = {
    none: "0rem",
    sm: "0.25rem",
    rounded: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    full: "9999px",
  };
  return map[radiusStr] || "0.5rem"; // default
}

export async function generateMetadata({ params }) {
  const { domain } = await params;
  const layoutData = await getTenant(domain);

  if (!layoutData || !layoutData.data) {
    return { title: "غير موجود | 404" };
  }

  const theme = layoutData.data.theme || {};
  const platformName = theme.platformName || "منصة تعليمية مبتكرة";
  const desc =
    theme.metaDescription ||
    `${platformName} — منصة تعليمية متكاملة تقدم كورسات ودورات مميزة عن بُعد مع دعم للذكاء الاصطناعي والبث المباشر.`;

  const protocol = domain.includes("localhost") ? "http" : "https";
  const siteUrl = `${protocol}://${domain}`;
  let metadataBase = new URL(siteUrl);

  return {
    metadataBase,
    title: {
      default: `${platformName} — تعلّم بذكاء`,
      template: `%s | ${platformName}`,
    },
    description: desc,
    keywords: [
      platformName,
      "كورسات",
      "تعليم أونلاين",
      "دورات عن بعد",
      "أكاديمية",
      "تعليم إلكتروني",
      "منصة تعليمية",
      "امتحانات إلكترونية",
      "بث مباشر تعليمي",
      "ذكاء اصطناعي تعليمي",
      "كورسات أونلاين عربية",
    ],
    authors: [{ name: platformName }],
    creator: platformName,
    publisher: platformName,
    formatDetection: { telephone: false, email: false },
    alternates: {
      canonical: "/",
      languages: { "ar-SA": "/", "ar-EG": "/" },
    },
    icons: {
      icon: theme.favicon || "/favicon.ico",
      shortcut: theme.favicon || "/favicon.ico",
      apple: theme.favicon || "/favicon.ico",
    },
    manifest: "/manifest.json",
    openGraph: {
      title: `${platformName} — تعلّم بذكاء`,
      description: desc,
      url: siteUrl,
      siteName: platformName,
      images: theme.heroImage
        ? [
            {
              url: theme.heroImage,
              width: 1200,
              height: 630,
              alt: `${platformName} — منصة تعليمية`,
            },
            {
              url: theme.logo || theme.heroImage,
              width: 512,
              height: 512,
              alt: `شعار ${platformName}`,
            },
          ]
        : [],
      locale: "ar_SA",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${platformName} — تعلّم بذكاء`,
      description: desc,
      images: theme.heroImage ? [theme.heroImage] : [],
      creator: theme.twitterHandle || undefined,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    category: "education",
    classification: "Educational Platform",
    other: {
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "black-translucent",
      "mobile-web-app-capable": "yes",
    },
  };
}

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function DomainLayout({ children, params }) {
  const { domain } = await params;
  const layoutData = await getTenant(domain);

  if (!layoutData || !layoutData.data) {
    notFound();
  }

  const theme = layoutData.data.theme;
  const platformName = theme.platformName || "أكاديمية تعليمية";
  const siteUrl = `https://${domain}`;

  const requestHeaders = await headers();
  const isAdminRoute = requestHeaders.get("x-is-admin") === "true";

  // ─── JSON-LD: EducationalOrganization ───
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${siteUrl}/#organization`,
    name: platformName,
    description:
      theme.metaDescription || `${platformName} — منصة تعليمية متكاملة`,
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: theme.logo || `${siteUrl}/favicon.ico`,
      width: 512,
      height: 512,
    },
    image: theme.heroImage || "",
    sameAs: [
      theme.facebookUrl,
      theme.twitterUrl,
      theme.youtubeUrl,
      theme.instagramUrl,
    ].filter(Boolean),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      availableLanguage: ["Arabic"],
    },
  };

  // ─── JSON-LD: WebSite with SearchAction ───
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: platformName,
    url: siteUrl,
    description: theme.metaDescription || "",
    publisher: { "@id": `${siteUrl}/#organization` },
    inLanguage: "ar",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/years/{search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  // ─── JSON-LD: BreadcrumbList ───
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: siteUrl },
    ],
  };

  const jsonLd = [orgJsonLd, websiteJsonLd, breadcrumbJsonLd];

  return (
    <div className="relative flex flex-col min-h-screen w-full bg-gray-50 dark:bg-black transition-colors duration-500">
      {/* Dynamic Theme Injection */}
      {theme && (
        <>
          {/* Inject dynamic font if provided */}
          {theme.fontUrl && <link href={theme.fontUrl} rel="stylesheet" />}

          {/* Inject PWA Manifest */}
          <link rel="manifest" href="/manifest.json" />

          {/* Inject Structured Data JSON-LD for Search Engines */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />

          {/* Inject CSS variables overriding Tailwind/Shadcn configurations */}
          <style
            dangerouslySetInnerHTML={{
              __html: `
                :root {
                  --primary: ${theme.primary || "oklch(0.205 0 0)"};
                  --secondary: ${theme.secondary || "oklch(0.97 0 0)"};
                  --radius: ${getRadiusValue(theme.borderRadius)};
                  --color-primary: ${theme.primary || "oklch(0.205 0 0)"};
                }
                body {
                  ${
                    theme.font
                      ? `font-family: '${theme.font}', 'Cairo', sans-serif !important;`
                      : ""
                  }
                }
              `,
            }}
          />
        </>
      )}

      <ThemeProvider forcedTheme={theme.forceTheme}>
        <ToastProvider>
          {/* Top Loading Progress Bar */}
          {!isAdminRoute && <TopProgressBar />}

          {/* PWA Install Modal */}
          {!isAdminRoute && <InstallPwaModal theme={theme} />}

          {/* Render the stunning Dynamic Navbar only for non-admin pages */}
          {!isAdminRoute && <Navbar theme={theme} domain={domain} />}

          {/* Render children (page.js content) */}
          <main className="grow relative">{children}</main>

          {/* --- Render Powerful Animated Footer only for non-admin pages --- */}
          {!isAdminRoute && <Footer theme={theme} />}
        </ToastProvider>
      </ThemeProvider>
    </div>
  );
}
