import { getTenant } from "@/lib/getTenant";
import { notFound } from "next/navigation";
import StudentLoginForm from "@/components/StudentLoginForm";

export async function generateMetadata({ params }) {
  const { domain } = await params;
  const layoutData = await getTenant(domain);

  if (!layoutData || !layoutData.data) {
    return { title: "تسجيل الدخول | 404" };
  }

  const theme = layoutData.data.theme || {};
  const platformName = theme.platformName || "أكاديميتنا";
  const protocol = domain.includes("localhost") ? "http" : "https";
  const siteUrl = `${protocol}://${domain}`;

  return {
    title: `تسجيل الدخول | ${platformName}`,
    description: `سجّل دخولك إلى ${platformName} لاستكمال رحلتك التعليمية — الوصول لكورساتك وامتحاناتك ومحفظتك.`,
    alternates: { canonical: "/login" },
    openGraph: {
      title: `تسجيل الدخول | ${platformName}`,
      description: `سجّل دخولك إلى ${platformName} لاستكمال رحلتك التعليمية.`,
      url: `${siteUrl}/login`,
      siteName: platformName,
      type: "website",
      locale: "ar_SA",
    },
    robots: { index: false, follow: true },
  };
}

export default async function LoginPage({ params }) {
  const { domain } = await params;
  const layoutData = await getTenant(domain);

  if (!layoutData || !layoutData.data) {
    notFound();
  }

  const theme = layoutData.data.theme || {};

  return <StudentLoginForm theme={theme} domain={domain} />;
}
