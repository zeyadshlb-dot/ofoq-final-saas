/**
 * Dynamic sitemap.xml — بيطلع خريطة الموقع ديناميكياً من الباك إند
 * جوجل بتستخدمها عشان تعرف كل صفحات الموقع وتأرشفها بسرعة
 */
export default async function sitemap({ params }) {
  const domain = (await params)?.domain || "localhost";
  const protocol = domain.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${domain}`;

  // ─── Static pages ───
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // ─── Fetch stages dynamically ───
  let stageSitemaps = [];
  try {
    const stagesRes = await fetch(
      `https://api.ofoq.site/api/v1/stages?slug=${domain}`,
      { cache: "no-store" },
    );
    if (stagesRes.ok) {
      const stagesData = await stagesRes.json();
      const stages = Array.isArray(stagesData)
        ? stagesData
        : stagesData?.data || [];
      stageSitemaps = stages.map((stage) => ({
        url: `${baseUrl}/years/${stage.id}`,
        lastModified: stage.updated_at
          ? new Date(stage.updated_at)
          : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }));
    }
  } catch (err) {
    console.error("Sitemap: Failed to fetch stages", err);
  }

  // ─── Fetch courses dynamically ───
  let courseSitemaps = [];
  try {
    const coursesRes = await fetch(
      `https://api.ofoq.site/api/v1/courses?slug=${domain}&status=active`,
      { cache: "no-store" },
    );
    if (coursesRes.ok) {
      const coursesData = await coursesRes.json();
      const courses = Array.isArray(coursesData)
        ? coursesData
        : coursesData?.data || [];
      courseSitemaps = courses.map((course) => ({
        url: `${baseUrl}/course/${course.id}`,
        lastModified: course.updated_at
          ? new Date(course.updated_at)
          : new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      }));
    }
  } catch (err) {
    console.error("Sitemap: Failed to fetch courses", err);
  }

  return [...staticPages, ...stageSitemaps, ...courseSitemaps];
}
