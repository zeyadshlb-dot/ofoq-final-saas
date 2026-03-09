import { Cairo } from "next/font/google";
import "./globals.css";
import PWARegister from "@/components/PWARegister";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap", // تحسين أداء الخطوط — يعرض خط النظام أولاً ثم يتحول
});

export const metadata = {
  title: {
    default: "Ofoq — منصة تعليمية ذكية",
    template: "%s | Ofoq",
  },
  description:
    "منصة أُفُق التعليمية الأذكى للمدرسين والطلاب — كورسات، امتحانات، واتساب، ذكاء اصطناعي.",
  keywords: [
    "أفق",
    "منصة تعليمية",
    "كورسات",
    "تعليم أونلاين",
    "Ofoq",
    "مدرس",
    "طالب",
  ],
  authors: [{ name: "Ofoq Platform" }],
  creator: "Ofoq",
  publisher: "Ofoq",
  manifest: "/manifest.json",
  icons: {
    apple: "/icon-192x192.png",
  },
  formatDetection: { telephone: false },
  metadataBase: new URL("https://ofoq.app"),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    siteName: "Ofoq",
    title: "Ofoq — منصة تعليمية ذكية",
    description: "منصة أُفُق التعليمية الأذكى للمدرسين والطلاب.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ofoq — منصة تعليمية ذكية",
    description: "منصة أُفُق التعليمية الأذكى للمدرسين والطلاب.",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${cairo.className} ${cairo.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
