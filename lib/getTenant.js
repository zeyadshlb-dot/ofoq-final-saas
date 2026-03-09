import { cache } from "react";

export const getTenant = cache(async (domain) => {
  try {
    // استخدم الميزة القوية في Next.js للكاشنج: Data Cache (SSG and ISR)
    // كدة الصفحة بالكامل هتتكاش وقت بناءها وتحدث نفسها كل نص ساعة في الخلفية أو حسب الطلب
    // React's cache() function deduplicates multiple calls exactly in a same component tree!
    const res = await fetch(
      `http://127.0.0.1:3001/api/v1/tenants/layout?slug=${domain}`,
      { cache: "no-store" }, // Bypass cache to ensure we get fresh data
    );

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    return json;
  } catch (error) {
    console.error(`Failed to fetch tenant: ${domain}`, error);
    return null;
  }
});
