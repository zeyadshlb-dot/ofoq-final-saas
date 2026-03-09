"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error("Layout Error:", error);
  }, [error]);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center w-full"
      dir="rtl"
    >
      {/* Animated SVG Graphic */}
      <div className="relative mb-8 text-red-500 animate-[bounce_2s_infinite]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-24 w-24 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div className="absolute inset-0 blur-xl bg-red-500/20 rounded-full scale-150 -z-10"></div>
      </div>

      <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4 drop-shadow-sm">
        عذراً! حدث خطأ غير متوقع
      </h1>
      <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto leading-relaxed">
        يبدو أن هناك مشكلة في النظام أثناء محاولة الوصول للصفحة، مهندسينا
        بيراجعوا المشكلة حالياً. لا تقلق بيانتك في أمان تام!
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() => reset()} // re-render the segment
          className="px-8 py-3 rounded-full font-bold text-white bg-red-600 hover:bg-red-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
        >
          حاول مرة أخرى
        </button>

        <Link
          href="/"
          className="px-8 py-3 rounded-full font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 dark:text-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
