"use client";

import React from "react";
import { XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function VideoFailPage() {
  return (
    <div
      className="min-h-[70vh] flex items-center justify-center p-4 text-center"
      dir="rtl"
    >
      <div className="bg-white dark:bg-white/5 p-12 rounded-[3rem] shadow-2xl max-w-md w-full border border-red-500/10 backdrop-blur-xl">
        <div className="w-20 h-20 bg-red-500 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-red-500/20">
          <XCircle className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-black mb-4 text-red-500">
          فشل شحن المساحة
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10 font-bold leading-relaxed">
          نأسف، لم تكتمل عملية الدفع لشراء المساحة الإضافية. يرجى المحاولة مرة
          أخرى أو اختيار وسيلة دفع بديلة.
        </p>

        <Link
          href="/dashboard/wallet/video"
          className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-xl"
        >
          <ArrowLeft className="w-5 h-5 rotate-180" />
          العودة لمحفظة الفيديو
        </Link>
      </div>
    </div>
  );
}
