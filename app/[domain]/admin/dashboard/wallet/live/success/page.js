"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Radio,
  ArrowRight,
  Zap,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useTheme, getSlug, getToken } from "../../../layout";

function SuccessContent() {
  const { dark, primaryColor } = useTheme();
  const searchParams = useSearchParams();
  const slug = getSlug();
  const token = getToken();

  const invoiceId = searchParams.get("invoice_id");
  const packageId = searchParams.get("package_id");

  const [status, setStatus] = useState("verifying"); // verifying, adding_minutes, success, error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (invoiceId && packageId && slug !== "main") {
      verifyAndAddMinutes();
    } else if (!invoiceId || !packageId) {
      setStatus("error");
      setErrorMessage("بيانات الدفع غير مكتملة.");
    }
  }, [invoiceId, packageId, slug]);

  const verifyAndAddMinutes = async () => {
    try {
      // 1. Verify Payment with Fawaterk
      const fawaterkRes = await fetch("/api/fawaterk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getInvoiceData",
          data: { invoiceId },
          isSandbox: true,
        }),
      });
      const fawaterkData = await fawaterkRes.json();

      if (fawaterkData.status !== "success" || fawaterkData.data?.paid !== 1) {
        setStatus("error");
        setErrorMessage("لم يتم التأكد من إتمام عملية الدفع بنجاح.");
        return;
      }

      // 2. Add Minutes via Backend
      setStatus("adding_minutes");
      const apiRes = await fetch(`/api/v1/live/buy-package`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slug: slug,
          package_id: Number(packageId),
        }),
      });
      const apiData = await apiRes.json();

      if (apiData.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(apiData.message || "حدث خطأ أثناء تفعيل الباقة.");
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage("حدث خطأ في الاتصال بالسيرفر.");
    }
  };

  if (status === "verifying" || status === "adding_minutes") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-20"></div>
          <div className="relative w-20 h-20 bg-gradient-to-tr from-rose-600 to-orange-500 text-white rounded-[2rem] flex items-center justify-center shadow-2xl">
            <Loader2 className="w-10 h-10 animate-spin" />
          </div>
        </div>
        <h2 className="text-2xl font-black mb-2 animate-pulse">
          {status === "verifying"
            ? "جاري التحقق من الدفع..."
            : "جاري تفعيل باقة البث..."}
        </h2>
        <p className="text-gray-500 font-bold opacity-60 text-sm">
          يرجى عدم إغلاق هذه الصفحة لتلقي رصيدك
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-red-500 text-white rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-red-500/20">
          <XCircle className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-black mb-4 text-red-500">حدثت مشكلة</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-sm font-bold leading-relaxed">
          {errorMessage}
        </p>
        <Link
          href="/dashboard/wallet/live"
          className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all shadow-xl"
        >
          <ArrowRight className="w-5 h-5 rotate-180" />
          العودة لمحفظة البث
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-10">
        <div className="absolute -inset-10 bg-rose-500/20 blur-3xl rounded-full animate-pulse"></div>
        <div className="relative w-28 h-28 bg-rose-600 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-rose-500/30">
          <CheckCircle2 className="w-14 h-14" />
        </div>
      </div>

      <h1 className="text-4xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-orange-600">
        تم تفعيل الباقة!
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-10 font-bold">
        تمت عملية الدفع وإضافة الدقائق بنجاح لمحفظتك.
      </p>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-10">
        <div className="bg-rose-500/5 border border-rose-500/10 p-6 rounded-3xl">
          <div className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-wider mb-2">
            <Radio className="w-4 h-4" />
            رصيدك الجديد
          </div>
          <p className="text-xl font-black text-rose-600">جاهز الآن</p>
        </div>
        <div className="bg-orange-500/5 border border-orange-500/10 p-6 rounded-3xl">
          <div className="flex items-center gap-2 text-orange-500 text-[10px] font-black uppercase tracking-wider mb-2">
            <Zap className="w-4 h-4" />
            التفعيل
          </div>
          <p className="text-xl font-black text-orange-600">فوري</p>
        </div>
      </div>

      <Link
        href="/dashboard/wallet/live"
        className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-10 py-5 rounded-[2rem] font-black flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-2xl"
      >
        <span>العودة للمحفظة</span>
        <ArrowRight className="w-5 h-5" />
      </Link>
    </div>
  );
}

export default function LiveSuccessPage() {
  return (
    <Suspense fallback={<div>جاري التحميل...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
