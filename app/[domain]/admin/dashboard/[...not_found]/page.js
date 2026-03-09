"use client";

import Link from "next/link";
import { useTheme } from "../layout";
import { AlertCircle, ArrowRight, Home } from "lucide-react";

export default function DashboardNotFound() {
  const { dark, primaryColor } = useTheme();
  // Provide fallback color in case context is missing
  const pc = primaryColor || "#8b5cf6";

  return (
    <div className="flex-1 h-full min-h-[80vh] flex flex-col items-center justify-center p-6 relative">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div
          className={`w-[400px] h-[400px] rounded-full blur-[120px] transition-opacity duration-1000 ${dark ? "opacity-20" : "opacity-10"}`}
          style={{ background: pc }}
        ></div>
      </div>

      <div
        className={`relative z-10 p-10 md:p-14 rounded-3xl backdrop-blur-xl flex flex-col items-center text-center max-w-2xl w-full transition-all duration-300 ${dark ? "bg-white/3 border border-white/10 shadow-2xl shadow-black/50" : "bg-white/60 border border-white shadow-xl shadow-gray-200/50"}`}
      >
        {/* 404 Header */}
        <div className="relative mb-6">
          <h1
            className="text-8xl md:text-9xl font-black tracking-tighter"
            style={{
              color: "transparent",
              WebkitTextStroke: `2px ${pc}`,
              textShadow: dark ? `0 0 40px ${pc}60` : `0 0 40px ${pc}40`,
            }}
          >
            404
          </h1>
          <div
            className={`absolute inset-0 flex items-center justify-center ${dark ? "text-white" : "text-gray-900"}`}
          >
            <h1 className="text-8xl md:text-9xl font-black tracking-tighter opacity-10">
              404
            </h1>
          </div>
        </div>

        {/* Messaging */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <h2
            className={`text-2xl md:text-3xl font-bold ${dark ? "text-white" : "text-gray-900"}`}
          >
            عفواً، الصفحة غير موجودة
          </h2>
        </div>

        <p
          className={`text-lg mb-10 max-w-md ${dark ? "text-gray-400" : "text-gray-600"}`}
        >
          يبدو أنك وصلت إلى رابط غير صحيح أو تم نقل الصفحة التي تبحث عنها. لا
          تقلق، يمكنك العودة للصفحة الرئيسية واستئناف عملك.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg w-full sm:w-auto group relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${pc}, ${pc}dd)`,
              boxShadow: `0 8px 24px ${pc}40`,
            }}
          >
            <Home className="w-5 h-5" />
            <span>العودة للرئيسية</span>
            <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </Link>

          <button
            onClick={() => window.history.back()}
            className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all duration-300 w-full sm:w-auto hover:-translate-y-1 group ${dark ? "bg-white/5 text-gray-200 border border-white/10 hover:bg-white/10 hover:border-white/20" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm"}`}
          >
            <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>الرجوع للخلف</span>
          </button>
        </div>
      </div>
    </div>
  );
}
