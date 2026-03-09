import Link from "next/link";
import { notFound } from "next/navigation";
import { getTenant } from "@/lib/getTenant";
import SubscribeAction from "./SubscribeAction";

async function getCourseDetails(courseId) {
  try {
    const res = await fetch(
      `http://127.0.0.1:3001/api/v1/courses/${courseId}`,
      {
        cache: "no-store",
      },
    );
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export default async function SubscribePage({ params }) {
  const { domain, courseId } = await params;

  const tenant = await getTenant(domain);
  const theme = tenant?.data?.theme || {};
  const whatsapp = theme.whatsapp || "";

  const course = await getCourseDetails(courseId);
  if (!course) return notFound();

  const price = Number(course.price || 0);
  const discountPrice = Number(course.discount_price || 0);
  const finalPrice =
    discountPrice > 0 && discountPrice < price ? discountPrice : price;

  const imageUrl = course.image_path?.startsWith("http")
    ? course.image_path
    : course.full_image_url || "/placeholder.png";

  return (
    <div
      className="min-h-[calc(100vh-80px)] bg-[#f4f6fb] dark:bg-[#0d0f14] py-12 px-4 sm:px-6 lg:px-8"
      dir="rtl"
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white">
            إتمام عملية الاشتراك
          </h1>
          <Link
            href={`/course/${courseId}`}
            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-bold text-sm bg-white dark:bg-white/5 px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-white/5"
          >
            العودة للكورس
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 rotate-180"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Right Column - Course Details & Image */}
          <div className="lg:col-span-7 bg-white dark:bg-[#16181f] rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-white/6 flex flex-col gap-6">
            <h2 className="text-xl font-black text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-4">
              ملخص الطلب
            </h2>

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Image */}
              <div className="w-full sm:w-48 shrink-0 overflow-hidden rounded-2xl bg-gray-100 dark:bg-white/5 relative aspect-video sm:aspect-square group">
                <img
                  src={imageUrl}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4">
                  <span className="text-white text-xs font-bold leading-none capitalize px-2 py-1 bg-white/20 backdrop-blur-md rounded-md inline-block w-fit mb-1 border border-white/20">
                    {course.pricing_type === "free" ? "مجاني" : "مدفوع"}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 space-y-3">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                  {course.title}
                </h3>
                {course.description && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-3">
                    {course.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-3 mt-3 justify-start mb-0! font-bold text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-white/5">
                    <span className="text-blue-500 text-lg">📁</span>
                    <span>{course.chapters_count || 0} فصل</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-white/5">
                    <span className="text-orange-500 text-lg">✨</span>
                    <span>متاح فوراً</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100/50 dark:border-blue-800/20 mt-auto">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  🛡️
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                    ضمان الوصول مدى الحياة
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">
                    بمجرد اشتراكك في هذا الكورس، ستحصل على وصول غير محدود لجميع
                    الفيديوهات والملفات المرفقة بالإضافة للتحديثات المستقبلية.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Left Column - Payment/Subscribe Action */}
          <div className="lg:col-span-5 bg-white dark:bg-[#16181f] rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-white/6 sticky top-24">
            <h2 className="text-xl font-black text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-4 mb-6">
              تفاصيل الدفع
            </h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-sm font-bold text-gray-600 dark:text-gray-400">
                <span>سعر الكورس الأصلي</span>
                <span>{price} جنيه</span>
              </div>

              {discountPrice > 0 && discountPrice < price && (
                <div className="flex justify-between items-center text-sm font-bold text-emerald-500">
                  <span>الخصم المتاح</span>
                  <span>- {price - discountPrice} جنيه</span>
                </div>
              )}

              <div className="pt-4 border-t border-dashed border-gray-200 dark:border-white/10 flex justify-between items-end">
                <span className="font-black text-gray-900 dark:text-white text-lg">
                  الإجمالي المطلوب
                </span>
                <div className="text-4xl font-black text-blue-600 dark:text-blue-400">
                  {finalPrice.toFixed(0)}{" "}
                  <span className="text-lg font-bold">جنية</span>
                </div>
              </div>
            </div>

            <SubscribeAction course={course} whatsapp={whatsapp} />

            <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              عملية اشتراك آمنة وموثوقة
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
