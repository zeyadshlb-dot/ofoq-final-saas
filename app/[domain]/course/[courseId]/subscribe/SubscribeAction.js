"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";

export default function SubscribeAction({ course, whatsapp }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [studentBalance, setStudentBalance] = useState(null);
  const [isCheckingBalance, setIsCheckingBalance] = useState(true);

  const price = Number(course.price || 0);
  const discountPrice = Number(course.discount_price || 0);
  const finalPrice =
    discountPrice > 0 && discountPrice < price ? discountPrice : price;

  useEffect(() => {
    async function fetchBalance() {
      const token = localStorage.getItem("student_token");
      if (!token) {
        toast("برجاء تسجيل الدخول أولاً", "error");
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("/api/v1/student/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setStudentBalance(data.balance || 0);
        } else {
          toast("انتهت الجلسة، برجاء تسجيل الدخول مجدداً", "error");
          router.push("/login");
        }
      } catch (err) {
        console.error("Failed to fetch balance", err);
      } finally {
        setIsCheckingBalance(false);
      }
    }

    fetchBalance();
  }, [router, toast]);

  const handleSubscribe = async () => {
    const token = localStorage.getItem("student_token");
    if (!token) {
      toast("برجاء تسجيل الدخول أولاً", "error");
      router.push("/login");
      return;
    }

    if (course.pricing_type === "paid" && studentBalance < finalPrice) {
      toast("لازم تشحن كود، تواصل مع الإدارة", "error");
      if (whatsapp) {
        window.open(
          `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`,
          "_blank",
        );
      }
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/courses/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ course_id: course.id }),
      });

      const data = await res.json();

      if (res.ok) {
        toast("تم الاشتراك بنجاح 🎉", "success");
        // Redirect to course page after success
        setTimeout(() => {
          router.push(`/course/${course.id}`);
          router.refresh();
        }, 1500);
      } else {
        toast(data.error || "حدث خطأ أثناء الاشتراك", "error");
      }
    } catch (err) {
      toast("حدث خطأ في الاتصال بالخادم", "error");
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingBalance) {
    return (
      <div className="w-full h-12 flex items-center justify-center">
        <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-5 w-full flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center text-xl">
            💰
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 font-bold mb-1">
              رصيد محفظتك الحالي
            </div>
            <div className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-1.5">
              {studentBalance} <span className="text-sm">جنية</span>
            </div>
          </div>
        </div>

        {course.pricing_type === "paid" && studentBalance < finalPrice && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl text-sm font-bold flex flex-col md:flex-row items-center gap-2 text-center text-balance border border-red-100 dark:border-red-500/20">
            <span>رصيدك الحالي غير كافي للاشتراك</span>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-red-700 dark:hover:text-red-300"
              >
                تواصل مع الإدارة لشحن كود
              </a>
            )}
          </div>
        )}
      </div>

      <button
        onClick={handleSubscribe}
        disabled={loading}
        className={`w-full px-8 py-4 rounded-xl font-black text-lg text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
          loading
            ? "bg-blue-400 cursor-not-allowed"
            : course.pricing_type === "paid" && studentBalance < finalPrice
              ? "bg-red-500 hover:bg-red-600 shadow-red-500/30"
              : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30"
        }`}
      >
        {loading ? (
          <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : course.pricing_type === "paid" && studentBalance < finalPrice ? (
          "شحن كود (تواصل مع الإدارة)"
        ) : (
          "تأكيد الاشتراك الآن"
        )}
      </button>
    </div>
  );
}
