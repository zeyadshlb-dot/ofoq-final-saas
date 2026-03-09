"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  HardDrive,
  ArrowRight,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useTheme, getSlug } from "../../../layout";

function SuccessContent() {
  const { dark, primaryColor, tenant } = useTheme();
  const slug = getSlug();
  const searchParams = useSearchParams();

  const invoiceId = searchParams.get("invoice_id");
  const gb = searchParams.get("gb");

  const [status, setStatus] = useState("verifying"); // verifying, adding_storage, success, error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (invoiceId && gb) {
      verifyAndAddStorage();
    } else if (!invoiceId || !gb) {
      setStatus("error");
      setErrorMessage("بيانات الدفع غير مكتملة.");
    }
  }, [invoiceId, gb]);

  const verifyAndAddStorage = async () => {
    try {
      const token = localStorage.getItem("instructor_token");

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

      // 2. Add Storage to Video Wallet via Backend
      setStatus("adding_storage");
      const apiRes = await fetch(`/api/v1/tenants/video-wallet/recharge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slug: slug,
          gb: Number(gb),
        }),
      });
      const apiData = await apiRes.json();

      if (apiData.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(
          apiData.message || "حدث خطأ أثناء شحن المساحة الإضافية.",
        );
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage("حدث خطأ في الاتصال بالسيرفر.");
    }
  };

  if (status === "verifying" || status === "adding_storage") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
          <div className="relative w-20 h-20 bg-gradient-to-tr from-blue-600 to-cyan-500 text-white rounded-[2rem] flex items-center justify-center shadow-2xl">
            <Loader2 className="w-10 h-10 animate-spin" />
          </div>
        </div>
        <h2 className="text-2xl font-black mb-2 animate-pulse">
          {status === "verifying"
            ? "جاري التحقق من الدفع..."
            : "جاري إضافة المساحة لمحفظتك..."}
        </h2>
        <p className="text-gray-500 font-bold opacity-60">
          يرجى عدم إغلاق الصفحة
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
        <h1 className="text-3xl font-black mb-4 text-red-500">فشلت العملية</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-sm font-bold leading-relaxed">
          {errorMessage}
        </p>
        <Link
          href="/dashboard/wallet/video"
          className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all shadow-xl"
        >
          <ArrowRight className="w-5 h-5 rotate-180" />
          العودة لمحفظة الفيديو
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-10">
        <div className="absolute -inset-10 bg-blue-500/20 blur-3xl rounded-full animate-pulse"></div>
        <div className="relative w-28 h-28 bg-blue-600 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/30">
          <CheckCircle2 className="w-14 h-14" />
        </div>
      </div>

      <h1 className="text-4xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
        تم شحن المساحة!
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-10 font-bold">
        تمت عملية الدفع وإضافة {gb} جيجا بايت بنجاح.
      </p>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-10">
        <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-3xl">
          <div className="flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-wider mb-2">
            <HardDrive className="w-4 h-4" />
            المساحة المضافة
          </div>
          <p className="text-xl font-black text-blue-600">+{gb} GB</p>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-3xl">
          <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-wider mb-2">
            <Zap className="w-4 h-4" />
            التفعيل
          </div>
          <p className="text-xl font-black text-emerald-600">فوري</p>
        </div>
      </div>

      <Link
        href="/dashboard/wallet/video"
        className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-10 py-5 rounded-[2rem] font-black flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-2xl"
      >
        <span>العودة للمحفظة</span>
        <ArrowRight className="w-5 h-5" />
      </Link>
    </div>
  );
}

export default function VideoSuccessPage() {
  return (
    <Suspense fallback={<div>جاري التحميل...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
