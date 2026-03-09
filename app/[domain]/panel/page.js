import { getTenant } from "@/lib/getTenant";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import StudentPanelClient from "./StudentPanelClient";

export async function generateMetadata({ params }) {
  const { domain } = await params;
  const layoutData = await getTenant(domain);

  if (!layoutData || !layoutData.data) {
    return { title: "لوحة الطالب | 404" };
  }

  const theme = layoutData.data.theme || {};
  const platformName = theme.platformName || "أكاديميتنا";

  return {
    title: `لوحة التحكم الخاصة بك | ${platformName}`,
    description: `تتبع كورساتك، اختباراتك، ومحفظتك من خلال لوحة تحكم الطالب الشاملة على ${platformName}.`,
    alternates: { canonical: "/panel" },
    robots: { index: false, follow: false },
  };
}

export default async function StudentPanelPage({ params }) {
  const { domain } = await params;
  const layoutData = await getTenant(domain);

  if (!layoutData || !layoutData.data) {
    notFound();
  }

  const theme = layoutData.data.theme || {};

  const reqHeaders = await headers();
  const cookieHeader = reqHeaders.get("cookie");

  return <StudentPanelClient theme={theme} domain={domain} />;
}
