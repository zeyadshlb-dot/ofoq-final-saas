import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[75vh] px-4 text-center w-full relative overflow-hidden"
      dir="rtl"
    >
      {/* Background Glows matching the tenant's primary color (if available via CSS vars) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse"></div>

      <div className="relative mb-2">
        <h1 className="text-[120px] md:text-[180px] font-black leading-none text-transparent bg-clip-text bg-linear-to-b from-primary to-secondary/30 drop-shadow-sm select-none">
          404
        </h1>
        {/* Animated Object */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center">
          <div className="w-16 h-16 md:w-24 md:h-24 bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-2xl shadow-2xl animate-[spin_10s_linear_infinite] transform -rotate-45"></div>
        </div>
      </div>

      <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 z-10">
        أوبس! الصفحة دي مش موجودة
      </h2>
      <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-lg mx-auto z-10">
        يبدو أنك ضللت الطريق. الصفحة التي تبحث عنها غير موجودة أو تم نقلها. لكن
        لا تقلق، يمكنك العودة واستكمال رحلتك التعليمية.
      </p>

      <Link
        href="/"
        className="relative z-10 flex items-center gap-3 px-8 py-3.5 rounded-full font-bold text-white bg-primary hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 group"
      >
        <span>العودة للصفحة الرئيسية</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
      </Link>
    </div>
  );
}
