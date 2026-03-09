"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import Link from "next/link";
import {
  CalendarCheck,
  ChevronRight,
  Loader2,
  ScanLine,
  UserCheck,
  RefreshCcw,
  Camera,
  CameraOff,
} from "lucide-react";

export default function AttendanceScannerPage() {
  const params = useParams();
  const { toast } = useToast();
  const sessionId = params.id;

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerError, setScannerError] = useState(null);
  const [scanning, setScanning] = useState(false);

  const scannerRef = useRef(null);
  const lastScanned = useRef(null);

  useEffect(() => {
    fetchRecords();
    return () => {
      stopScanner();
    };
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await fetch(
        `/api/v1/attendance/sessions/${sessionId}/records`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("instructor_token")}`,
          },
        },
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRecords(data.data || []);
    } catch {
      toast("حدث خطأ أثناء تحميل الحضور", "error");
    } finally {
      setLoading(false);
    }
  };

  const initScanner = useCallback(async () => {
    setScannerError(null);

    // First check if camera permission is grantable
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop()); // release immediately
    } catch (err) {
      setScannerError(
        "لم يتم منح صلاحية الكاميرا. يرجى السماح بالوصول إلى الكاميرا في إعدادات المتصفح ثم حاول مجدداً.",
      );
      return;
    }

    setScannerActive(true);
    setScanning(true);

    // Dynamic import to avoid SSR issues
    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      const qrCode = new Html5Qrcode("qr-reader-element");
      scannerRef.current = qrCode;

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        setScannerError(
          "لم يتم اكتشاف كاميرا. يرجى التأكد من وجود كاميرا متصلة.",
        );
        setScannerActive(false);
        setScanning(false);
        return;
      }

      // Prefer back camera on mobile
      const camera =
        cameras.find((c) => /back|rear|environment/i.test(c.label)) ||
        cameras[0];

      await qrCode.start(
        camera.id,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        () => {}, // ignore non-QR frames silently
      );
      setScanning(false);
    } catch (err) {
      console.error("Scanner init error:", err);
      setScannerError(
        "فشل تشغيل الكاميرا: " + (err?.message || "خطأ غير معروف"),
      );
      setScannerActive(false);
      setScanning(false);
    }
  }, [sessionId]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState?.();
        // State 2 = SCANNING, only stop if scanning
        if (!state || state === 2) {
          await scannerRef.current.stop();
        }
      } catch (e) {
        // ignore
      }
      scannerRef.current = null;
    }
    setScannerActive(false);
  }, []);

  const onScanSuccess = useCallback(
    async (decodedText) => {
      // Prevent duplicate scans within 5 seconds
      if (lastScanned.current === decodedText) return;
      lastScanned.current = decodedText;
      setTimeout(() => {
        lastScanned.current = null;
      }, 5000);

      try {
        const res = await fetch(`/api/v1/attendance/sessions/scan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("instructor_token")}`,
          },
          body: JSON.stringify({
            session_id: sessionId,
            qr_payload: decodedText,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          toast(data.error || "خطأ في تسجيل الحضور", "error");
        } else {
          toast(`✅ تم تحضير: ${data.student_name}`, "success");
          fetchRecords();
        }
      } catch {
        toast("حدث خطأ في الاتصال بالخادم", "error");
      }
    },
    [sessionId],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#16181f] p-6 rounded-3xl border border-gray-100 dark:border-white/6 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/attendance"
            className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all dark:hover:bg-white/10"
          >
            <ChevronRight size={20} />
          </Link>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <ScanLine size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white">
              مسح البطاقات الذكية
            </h1>
            <p className="text-sm font-bold text-gray-500 mt-1">
              جلسة رقم: {sessionId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchRecords}
            className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:text-primary transition-all dark:hover:bg-white/10"
            title="تحديث"
          >
            <RefreshCcw size={18} />
          </button>
          <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2.5 rounded-xl font-black flex items-center gap-2">
            <UserCheck size={18} />
            {records.length} حضور
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scanner */}
        <div className="lg:col-span-1 bg-white dark:bg-[#16181f] rounded-3xl border border-gray-100 dark:border-white/6 shadow-sm p-6 flex flex-col items-center text-center gap-4">
          <h2 className="font-black text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <Camera size={20} className="text-primary" />
            الكاميرا
          </h2>

          {/* Scanner Error */}
          {scannerError && (
            <div className="w-full p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-200 dark:border-red-500/20 text-right">
              <p className="text-red-600 dark:text-red-400 text-sm font-bold leading-relaxed">
                {scannerError}
              </p>
            </div>
          )}

          {/* Camera View */}
          <div className="w-full">
            {!scannerActive ? (
              <div className="aspect-square bg-gray-50 dark:bg-white/5 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-white/10 gap-4 p-6">
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400">
                  <CameraOff size={32} />
                </div>
                <p className="text-sm font-bold text-gray-500">
                  اضغط الزر لتشغيل الكاميرا ومسح البطاقة
                </p>
                <button
                  onClick={initScanner}
                  disabled={scanning}
                  className="bg-primary text-white font-bold py-2.5 px-6 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center gap-2"
                >
                  {scanning ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Camera size={18} />
                  )}
                  {scanning ? "جاري التشغيل..." : "تشغيل الكاميرا"}
                </button>
              </div>
            ) : (
              <div className="relative w-full">
                {/* html5-qrcode renders into this div */}
                <div
                  id="qr-reader-element"
                  className="w-full rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10 bg-black min-h-[260px]"
                />
                <button
                  onClick={stopScanner}
                  className="mt-4 px-6 py-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-100 transition-all w-full flex items-center justify-center gap-2"
                >
                  <CameraOff size={18} />
                  إيقاف الكاميرا
                </button>
              </div>
            )}
          </div>

          <p className="text-xs font-medium text-gray-400 leading-relaxed">
            وجّه الكاميرا نحو الـ QR Code الموجود في البطاقة الذكية للطالب. سيتم
            التسجيل تلقائياً.
          </p>
        </div>

        {/* Records List */}
        <div className="lg:col-span-2 bg-white dark:bg-[#16181f] rounded-3xl border border-gray-100 dark:border-white/6 shadow-sm p-6 flex flex-col">
          <h2 className="font-black text-xl text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <UserCheck size={22} className="text-emerald-500" />
            سجل الحضور
          </h2>

          <div
            className="flex-1 overflow-y-auto"
            style={{ maxHeight: "500px" }}
          >
            {records.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-400 mb-2">
                  <UserCheck size={24} />
                </div>
                <p className="text-sm font-bold text-gray-400">
                  لم يتم تسجيل حضور أي طالب بعد
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-white/6">
                {records.map((rec, i) => (
                  <div
                    key={rec.id || i}
                    className="py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/[0.02] px-3 -mx-3 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-lg shrink-0">
                        {rec.student_name?.charAt(0) || "ط"}
                      </div>
                      <div>
                        <div className="font-black text-gray-900 dark:text-white">
                          {rec.student_name}
                        </div>
                        <div
                          className="text-xs font-bold text-gray-400 mt-0.5"
                          dir="ltr"
                        >
                          {new Date(rec.created_at).toLocaleTimeString("ar-EG")}
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[11px] font-black uppercase tracking-wider shrink-0">
                      حاضر ✓
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
