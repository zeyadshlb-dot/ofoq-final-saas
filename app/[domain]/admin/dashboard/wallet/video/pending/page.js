"use client";

import React from "react";
import { Clock, HardDrive, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function VideoPendingPage() {
  return (
    <div
      className="min-h-[70vh] flex items-center justify-center p-4 text-center"
      dir="rtl"
    >
      <div className="bg-white dark:bg-white/5 p-12 rounded-[3rem] shadow-2xl max-w-md w-full border border-amber-500/10 backdrop-blur-xl">
        <div className="relative mx-auto mb-8 w-24 h-24">
          <div className="absolute inset-0 bg-amber-500 rounded-full animate-ping opacity-20"></div>
          <div className="relative w-24 h-24 bg-amber-500 text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-amber-500/20">
            <Clock className="w-12 h-12" />
          </div>
        </div>

        <h1 className="text-3xl font-black mb-4 text-amber-600">
          انتظار الدفع
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-4 font-bold">
          طلب شحن المساحة قيد الانتظار. يرجى إتمام عملية السداد عبر الكود
          المستلم.
        </p>
        <p className="text-xs font-bold opacity-40 mb-10 leading-relaxed">
          بمجرد سداد القيمة، سيتم إضافة الجيجات لمحفظتك فوراً.
        </p>

        <Link
          href="/dashboard/wallet/video"
          className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-xl"
        >
          <CheckCircle className="w-5 h-5" />
          حسناً، الانتقال للمحفظة
        </Link>
      </div>
    </div>
  );
}
