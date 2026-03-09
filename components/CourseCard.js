import Link from "next/link";
import React from "react";

export default function CourseCard({ course }) {
  // Default values to prevent errors if some data is missing
  const {
    id = "#",
    title = "اسم الكورس",
    description = "",
    image = "/placeholder.png",
    isPinned = false,
    price = 0,
    startDate = "تاريخ البداية غير محدد",
    endDate = "تاريخ النهاية غير محدد",
    isSubscribed = false,
  } = course || {};

  return (
    <div className="group relative w-full h-full flex flex-col">
      {/* ─── IMAGE SECTION ─── */}
      <div className="rounded-2xl overflow-hidden w-full relative shadow-sm z-0">
        <img
          src={image}
          alt={title}
          className="w-full aspect-[16/9] object-cover transform text-center group-hover:scale-110 group-hover:brightness-110 group-hover:saturate-150 transition-all duration-500"
        />
        {isPinned && (
          <div className="absolute w-40 pb-1 bg-rose-500 text-white text-center rotate-45 -right-8 top-8 z-10 font-bold text-sm shadow-md">
            كورس مثبت
          </div>
        )}
      </div>

      {/* ─── CONTENT SECTION ─── */}
      <div className="px-3 md:px-5 -mt-10 relative z-10 flex-1 flex flex-col h-full">
        <div className="rounded-2xl w-full bg-white dark:bg-[#16181f] text-gray-900 dark:text-white px-4 md:px-6 py-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-white/10 flex-1 flex flex-col h-full">
          <div className="flex flex-col space-y-6 flex-1 h-full">
            {/* Header & Description */}
            <div className="flex items-start justify-between flex-col gap-4 flex-1">
              <div className="flex flex-col space-y-4 w-full">
                <div className="font-bold text-xl md:text-2xl pl-3 leading-snug">
                  {title}
                </div>
                {/* Divider */}
                <div className="h-1 w-16 rounded-full bg-primary transition-all duration-300 group-hover:w-32"></div>
                {/* Description - Rendering HTML safely if needed or text */}
                <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-h-40 overflow-hidden line-clamp-3">
                  {typeof description === "string" ? (
                    <div dangerouslySetInnerHTML={{ __html: description }} />
                  ) : (
                    description
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="text-sm shrink-0 flex flex-row gap-3 w-full">
                <Link
                  href={`/course/${id}`}
                  className="flex-1 text-center border-2 border-primary rounded-full px-5 py-2 hover:bg-primary hover:text-white transition-all duration-300 text-gray-900 dark:text-white font-bold"
                >
                  التفاصيل
                </Link>
                {!isSubscribed ? (
                  <Link
                    href={`/course/${id}/subscribe`}
                    className="flex-1 text-center bg-gradient-to-l from-primary to-secondary text-white rounded-full px-5 py-2 font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                  >
                    اشترك الآن !
                  </Link>
                ) : (
                  <Link
                    href={`/course/${id}`}
                    className="flex-1 text-center bg-green-500 text-white rounded-full px-5 py-2 font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                  >
                    متابعة الكورس
                  </Link>
                )}
              </div>
            </div>

            {/* Bottom Metadata */}
            <div className="flex flex-col space-y-4 mt-auto pt-4">
              <div className="px-4 md:px-10">
                <div className="h-px bg-gray-100 dark:bg-white/10 w-full transition-all duration-300"></div>
              </div>

              <div className="w-full font-bold text-sm flex flex-col-reverse justify-between items-center gap-4">
                {/* Price Tag */}
                <div className="w-full relative flex justify-center pb-2">
                  <div className="bg-primary text-white rounded-xl py-1 px-3 flex items-center justify-center gap-2 shadow-sm w-fit mx-auto md:mx-0">
                    <span className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white px-3 py-0.5 rounded-lg shadow-inner text-base tabular-nums">
                      {Number(price).toFixed(2)}
                    </span>
                    <span className="text-sm">جنيهًا</span>
                  </div>
                </div>

                {/* Dates */}
                <div className="flex gap-2 w-full justify-between mt-2">
                  <div className="flex items-center justify-center gap-1 bg-gray-50 dark:bg-white/5 py-1.5 px-2 rounded-lg border border-gray-100 dark:border-white/5 whitespace-nowrap overflow-hidden">
                    <span className="text-[10px] sm:text-xs pt-1 truncate">
                      {endDate}
                    </span>
                    <svg
                      className="w-4 h-4 text-primary shrink-0"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm1-13h-2v6l5.25 3.15.75-1.23-4-2.37V7z" />
                    </svg>
                  </div>
                  <div className="flex items-center justify-center gap-1 bg-gray-50 dark:bg-white/5 py-1.5 px-2 rounded-lg border border-gray-100 dark:border-white/5 whitespace-nowrap overflow-hidden">
                    <span className="text-[10px] sm:text-xs pt-1 truncate">
                      {startDate}
                    </span>
                    <svg
                      className="w-4 h-4 text-emerald-500 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.89-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
