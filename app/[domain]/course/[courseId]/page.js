import { notFound } from "next/navigation";
import { getTenant } from "@/lib/getTenant";
import CourseContentAccordion from "./CourseContentAccordion";
import Link from "next/link";
import { cookies } from "next/headers";

async function getCourseDetails(courseId) {
  try {
    const res = await fetch(
      `https://api.ofoq.site/api/v1/courses/${courseId}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch course details", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { domain, courseId } = await params;
  const tenant = await getTenant(domain);
  const course = await getCourseDetails(courseId);
  const theme = tenant?.data?.theme || {};
  const platformName = theme.platformName || "منصة تعليمية";

  if (!course) return { title: "كورس غير موجود" };

  const title = course.title || "كورس تعليمي";
  const desc = course.description
    ? course.description.substring(0, 160)
    : `تعلّم ${title} مع ${platformName} — كورس شامل ومتكامل مع فيديوهات وامتحانات.`;
  const imageUrl = course.image_path?.startsWith("http")
    ? course.image_path
    : course.full_image_url || theme.heroImage;

  const protocol = domain.includes("localhost") ? "http" : "https";
  const siteUrl = `${protocol}://${domain}`;

  return {
    title,
    description: desc,
    alternates: { canonical: `/course/${courseId}` },
    openGraph: {
      title: `${title} | ${platformName}`,
      description: desc,
      url: `${siteUrl}/course/${courseId}`,
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

export default async function CoursePage({ params }) {
  const { domain, courseId } = await params;

  const tenant = await getTenant(domain);
  if (!tenant) return notFound();

  const course = await getCourseDetails(courseId);
  if (!course) return notFound();

  // Check if student is logged in and enrolled
  const cookieStore = await cookies();
  const token = cookieStore.get("student_token")?.value;
  let isSubscribed = false;
  let studentName = "";
  let studentPhone = "";

  if (token) {
    try {
      const studentRes = await fetch(
        `https://api.ofoq.site/api/v1/student/me?slug=${domain}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        },
      );
      if (studentRes.ok) {
        const student = await studentRes.json();
        isSubscribed = student.enrolled_course_ids?.includes(Number(courseId));
        studentName = student.name || "";
        studentPhone = student.phone || "";
      }
    } catch (e) {
      console.error("Failed to fetch student data", e);
    }
  }

  const formattedCreatedAt = course.created_at
    ? new Intl.DateTimeFormat("ar-EG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(course.created_at.replace(" ", "T")))
    : "غير متوفر";

  const formattedUpdatedAt = course.updated_at
    ? new Intl.DateTimeFormat("ar-EG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(course.updated_at.replace(" ", "T")))
    : formattedCreatedAt;

  const imageUrl =
    course.image_path && course.image_path.startsWith("http")
      ? course.image_path
      : course.full_image_url || "/placeholder.png";

  const theme = tenant?.data?.theme || {};
  const platformName = theme.platformName || "منصة تعليمية";
  const protocol = domain.includes("localhost") ? "http" : "https";
  const siteUrl = `${protocol}://${domain}`;

  // JSON-LD Course Schema for rich search results
  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description:
      typeof course.description === "string"
        ? course.description.replace(/<[^>]*>/g, "").substring(0, 300)
        : "",
    provider: {
      "@type": "EducationalOrganization",
      name: platformName,
      url: siteUrl,
    },
    url: `${siteUrl}/course/${courseId}`,
    image: imageUrl,
    dateCreated: course.created_at || undefined,
    dateModified: course.updated_at || undefined,
    inLanguage: "ar",
    isAccessibleForFree: course.price === 0 || course.is_free,
    ...(course.price && !course.is_free
      ? {
          offers: {
            "@type": "Offer",
            price: course.price,
            priceCurrency: "EGP",
            availability: "https://schema.org/InStock",
            url: `${siteUrl}/course/${courseId}`,
          },
        }
      : {}),
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: `${course.chapters?.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0) || 0} درس`,
    },
  };

  // Breadcrumb for this course
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: course.title,
        item: `${siteUrl}/course/${courseId}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="bg-outer-container smooth clr-text-primary relative pt-4 pb-16 min-h-screen w-full">
        <div className="px-2 lg:px-4 sm:px-10 py-10 pb-10 space-y-10 w-full">
          <div className="rounded-md py-24 px-8 text-slate-900 relative pb-56 bg-yellow-400 w-full overflow-hidden shadow-2xl shadow-yellow-500/20">
            <div className="relative z-10 space-y-6">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold font-h1 font-w-bold">
                {course.title || "عنوان الكورس"}
              </div>
              {course.description && (
                <div className="text-lg leading-relaxed font-smaller opacity-90 max-w-3xl">
                  {typeof course.description === "string" ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: course.description }}
                    />
                  ) : (
                    course.description
                  )}
                </div>
              )}

              {isSubscribed && (
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 text-slate-900 font-black shadow-xl animate-pulse">
                  <span className="text-2xl">✅</span>
                  أنت مشترك بالفعل في هذا الكورس
                </div>
              )}

              <div className="flex flex-col sm:flex-row font-smaller text-slate-900 sm:space-y-0 space-y-4 sm:space-x-8 sm:space-x-reverse items-center">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      role="img"
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83l1.41 1.41L19 6.41V10h2V3h-7z" />
                    </svg>
                  </span>
                  <span className="font-bold underline">انضم إلينا الآن</span>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 w-full h-full pointer-events-none">
              <div
                className="w-full h-full opacity-10"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(0,0,0,0.2) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/5 to-white/10"></div>
            </div>
          </div>

          <div className="px-2 lg:px-4 sm:px-10 relative py-0 space-y-10 z-20">
            <div className="flex flex-col md:flex-row-reverse space-y-10 md:space-y-0 md:space-x-10 md:gap-10">
              <div className="md:basis-1/3 relative -mt-52">
                <div className="w-full glassy smooth clr-text-primary shadow-2xl rounded-3xl overflow-hidden bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-white/5">
                  <div className="p-6 space-y-8">
                    <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/50 aspect-video flex items-center justify-center group">
                      <img
                        src={imageUrl}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <div className="flex flex-wrap justify-between items-center text-center gap-4">
                      <div className="rounded-2xl font-small shadow-xl flex overflow-hidden border border-blue-100 dark:border-blue-900/30">
                        <div className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white">
                          <span className="text-2xl font-black">
                            {Number(course.price || 0).toFixed(0)}
                          </span>
                          <span className="text-sm font-bold opacity-80 mt-1">
                            جنية
                          </span>
                        </div>
                      </div>
                    </div>

                    {isSubscribed ? (
                      <div className="w-full text-center py-4 px-6 bg-emerald-500/10 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 rounded-2xl font-black text-lg flex items-center justify-center gap-2">
                        <svg
                          className="w-6 h-6"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.24.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        تم الاشتراك
                      </div>
                    ) : (
                      <Link
                        href={`/course/${course.id}/subscribe`}
                        className="w-full text-center py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/30 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                      >
                        🚀 اشترك الآن وانطلق
                      </Link>
                    )}

                    <div className="pt-4 border-t border-gray-100 dark:border-white/5 space-y-4">
                      <div className="flex items-center gap-3 text-sm font-bold text-gray-600 dark:text-gray-400">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                          📅
                        </div>
                        تاريخ الإنشاء: {formattedCreatedAt}
                      </div>
                      <div className="flex items-center gap-3 text-sm font-bold text-gray-600 dark:text-gray-400">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
                          🔄
                        </div>
                        آخر تحديث: {formattedUpdatedAt}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:basis-2/3">
                <div className="space-y-8">
                  <div className="rounded-3xl shadow-2xl overflow-hidden border-4 border-white dark:border-white/5">
                    <img
                      src={imageUrl}
                      alt="course"
                      className="w-full max-h-[500px] object-cover"
                    />
                  </div>
                  <div className="p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#1A1A1A] space-y-8">
                    <div className="space-y-6">
                      <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <span className="w-12 h-1.5 bg-blue-600 rounded-full"></span>
                        عن الكورس
                      </h2>
                      <div className="text-gray-600 dark:text-gray-400 leading-loose text-lg">
                        {typeof course.description === "string" ? (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: course.description,
                            }}
                          />
                        ) : (
                          course.description ||
                          "لا يوجد وصف متوفر لهذا الكورس حالياً."
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl shadow-2xl w-full relative overflow-hidden bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-white/5 flex flex-col z-10">
            <div className="p-6 md:p-12">
              <div className="space-y-8">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3 border-b border-gray-100 dark:border-white/5 pb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center text-2xl">
                    📚
                  </div>
                  محتوى الكورس
                </h2>

                <CourseContentAccordion
                  chapters={course.chapters}
                  isSubscribed={isSubscribed}
                  studentName={studentName}
                  studentPhone={studentPhone}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
