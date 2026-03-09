import { getTenant } from "@/lib/getTenant";
import { notFound } from "next/navigation";
import StudentRegisterForm from "@/components/StudentRegisterForm";

export async function generateMetadata({ params }) {
  const { domain } = await params;
  const layoutData = await getTenant(domain);

  if (!layoutData || !layoutData.data) {
    return { title: "إنشاء حساب | 404" };
  }

  const theme = layoutData.data.theme || {};
  const platformName = theme.platformName || "أكاديميتنا";
  const protocol = domain.includes("localhost") ? "http" : "https";
  const siteUrl = `${protocol}://${domain}`;

  return {
    title: `إنشاء حساب جديد | ${platformName}`,
    description: `انضم إلى ${platformName} الآن — أنشئ حسابك مجاناً وابدأ رحلتك التعليمية مع أقوى الكورسات والامتحانات.`,
    alternates: { canonical: "/register" },
    openGraph: {
      title: `إنشاء حساب جديد | ${platformName}`,
      description: `انضم إلى ${platformName} الآن — أنشئ حسابك مجاناً وابدأ رحلتك التعليمية.`,
      url: `${siteUrl}/register`,
      siteName: platformName,
      type: "website",
      locale: "ar_SA",
    },
    robots: { index: false, follow: true },
  };
}

export default async function RegisterPage({ params }) {
  const { domain } = await params;
  const layoutData = await getTenant(domain);

  if (!layoutData || !layoutData.data) {
    notFound();
  }

  const theme = layoutData.data.theme || {};
  const registerFields = layoutData.data["register-fields"] || [];

  // Fetch stages dynamically based on the slug/domain
  let stages = [];
  try {
    const res = await fetch(
      `https://api.ofoq.site/api/v1/stages?slug=${domain}`,
      {
        cache: "no-store",
      },
    );
    if (res.ok) {
      const data = await res.json();
      stages = Array.isArray(data) ? data : data?.data || [];
    }
  } catch (err) {
    console.error("Failed to fetch stages", err);
  }

  return (
    <StudentRegisterForm
      theme={theme}
      registerFields={registerFields}
      domain={domain}
      stages={stages}
    />
  );
}
