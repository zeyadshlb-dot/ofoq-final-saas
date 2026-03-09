import { notFound } from "next/navigation";
import { getTenant } from "@/lib/getTenant";
import CourseCard from "@/components/CourseCard";
import Link from "next/link";

async function getStageDetails(slug, stageId) {
  try {
    const res = await fetch(
      `https://api.ofoq.site/api/v1/stages?slug=${slug}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    const stages = await res.json();
    const dataList = Array.isArray(stages) ? stages : stages?.data || [];
    return dataList.find((s) => String(s.id) === String(stageId)) || null;
  } catch (error) {
    console.error("Failed to fetch stage details", error);
    return null;
  }
}

async function getStageCourses(slug, stageId) {
  try {
    const res = await fetch(
      `https://api.ofoq.site/api/v1/courses?slug=${slug}&educational_stage_id=${stageId}&status=active`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data?.data || [];
  } catch (error) {
    console.error("Failed to fetch stage courses", error);
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { domain, yearId } = await params;
  const tenant = await getTenant(domain);
  const stage = await getStageDetails(domain, yearId);
  const theme = tenant?.data?.theme || {};
  const platformName = theme.platformName || "منصة تعليمية";

  if (!stage) return { title: "مرحلة غير موجودة" };

  const title = `كورسات ${stage.name}`;
  const desc =
    stage.short_description ||
    `اكتشف أقوى كورسات ${stage.name} على ${platformName} — محتوى تعليمي شامل ومتكامل لجميع المواد.`;
  const imageUrl = stage.image_path?.startsWith("http")
    ? stage.image_path
    : stage.full_image_url || theme.heroImage;
  const protocol = domain.includes("localhost") ? "http" : "https";
  const siteUrl = `${protocol}://${domain}`;

  return {
    title,
    description: desc,
    alternates: { canonical: `/years/${yearId}` },
    openGraph: {
      title: `${title} | ${platformName}`,
      description: desc,
      url: `${siteUrl}/years/${yearId}`,
      siteName: platformName,
      type: "website",
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: title }]
        : [],
      locale: "ar_SA",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${platformName}`,
      description: desc,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function StagePage({ params }) {
  const { domain, yearId } = await params;

  // 1. Fetch Tenant
  const tenant = await getTenant(domain);
  if (!tenant) return notFound();

  // 2. Fetch Stage Data & Courses Parallelly
  const [stage, courses] = await Promise.all([
    getStageDetails(domain, yearId),
    getStageCourses(domain, yearId),
  ]);

  if (!stage) return notFound();

  return (
    <div className="bg-outer-container smooth clr-text-primary negative-nav-margin posisitve-nav-padding-top min-h-screen">
      <div className="px-2 lg:px-4 sm:px-10 py-10 pb-10 space-y-10 max-w-7xl mx-auto pt-24">
        {/* HERO SECTION */}
        <div className="rounded-md py-24 px-8 text-slate-900 relative overflow-hidden pb-32 bg-yellow-400">
          <div className="relative z-10 space-y-6 text-center">
            <Link
              href={`/`}
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-gray-800 hover:text-black transition-colors mb-8 bg-white/30 py-2 px-4 rounded-full"
            >
              <span>&rarr;</span>
              <span>العودة للرئيسية</span>
            </Link>

            {stage.image_path && (
              <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-8 rounded-3xl overflow-hidden shadow-xl border-4 border-white dark:border-gray-800 relative z-10 bg-white">
                <img
                  src={
                    stage.image_path.startsWith("http")
                      ? stage.image_path
                      : stage.full_image_url
                  }
                  alt={stage.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="text-3xl sm:text-4xl md:text-5xl font-bold font-h1 font-w-bold">
              كورسات {stage.name}
            </div>
            {stage.short_description && (
              <div className="text-lg leading-relaxed font-smaller text-gray-800 max-w-2xl mx-auto">
                {stage.short_description}
              </div>
            )}

            {/* Stats Bar */}
            <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
              <div className="bg-white/40 border border-white/10 rounded-2xl py-2 px-6 flex items-center gap-3">
                <span className="text-2xl font-black text-gray-900">
                  {courses.length}
                </span>
                <span className="text-gray-900 text-sm font-bold">
                  كورس متاح
                </span>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Pattern background */}
            <div
              className="w-auto h-full md:w-full opacity-10 relative mr-auto transform"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            ></div>
            <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-yellow-500/50 to-transparent text-yellow-500"></div>
          </div>
        </div>

        {/* COURSES GRID */}
        <div className="py-10">
          <div className="font-bold text-3xl mb-8">
            <div className="relative group inline-block">
              <span className="clr-text-primary smooth group-hover:text-cyan-500 dark:group-hover:text-cyan-600">
                كورسات{" "}
              </span>
              <span className="text-cyan-500 dark:text-cyan-600 group-hover:text-black dark:group-hover:text-white smooth">
                المرحلة
              </span>
            </div>
          </div>

          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {courses.map((course) => {
                const mappedCourse = {
                  id: course.id,
                  title: course.title,
                  description: course.description,
                  image: course.image_path
                    ? course.image_path.startsWith("http")
                      ? course.image_path
                      : course.full_image_url
                    : "/placeholder.png",
                  price: course.price,
                  startDate: "متاح الآن",
                  endDate: "غير محدد",
                  isPinned: course.order_index === 1,
                };

                return (
                  <div key={course.id} className="h-full">
                    <CourseCard course={mappedCourse} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-third-container clr-text-primary rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
              <svg
                className="w-20 h-20 mx-auto text-gray-400 mb-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <h3 className="text-2xl font-bold mb-2">لا توجد كورسات حالياً</h3>
              <p className="clr-text-secondary">
                قريباً سيتم إضافة أقوى الكورسات لهذه المرحلة الدراسية.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
