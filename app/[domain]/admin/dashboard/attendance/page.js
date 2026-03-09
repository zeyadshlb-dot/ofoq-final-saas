"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import Link from "next/link";
import {
  CalendarCheck,
  Plus,
  Loader2,
  Trash2,
  Eye,
  CalendarDays,
  Users,
} from "lucide-react";

export default function AttendancePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const [newSessionDate, setNewSessionDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/attendance/sessions", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("instructor_token")}`,
        },
      });
      if (!res.ok) throw new Error("فشل الجلب");
      const data = await res.json();
      setSessions(data.data || []);
    } catch (err) {
      toast("حدث خطأ أثناء تحميل الجلسات", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!newSessionName.trim()) {
      toast("يرجى إدخال اسم الجلسة", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/v1/attendance/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("instructor_token")}`,
        },
        body: JSON.stringify({
          name: newSessionName,
          date: newSessionDate,
        }),
      });

      if (!res.ok) throw new Error("فشل الإنشاء");
      const data = await res.json();
      setSessions([data.data, ...sessions]);
      toast("تم إنشاء جلسة الحضور بنجاح", "success");
      setShowCreateModal(false);
      setNewSessionName("");
      const now2 = new Date();
      now2.setMinutes(now2.getMinutes() - now2.getTimezoneOffset());
      setNewSessionDate(now2.toISOString().slice(0, 16));
    } catch (err) {
      toast("حدث خطأ أثناء الإنشاء", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#16181f] p-6 rounded-3xl border border-gray-100 dark:border-white/[0.06] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <CalendarCheck size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              الغياب والحضور
            </h1>
            <p className="text-sm font-bold text-gray-500 mt-1">
              إدارة جلسات الحضور ومسح الـ QR للطلاب
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} />
          جلسة جديدة
        </button>
      </div>

      {/* Grid */}
      {sessions.length === 0 ? (
        <div className="bg-white dark:bg-[#16181f] p-12 rounded-3xl border border-gray-100 dark:border-white/[0.06] flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-300 mb-4">
            <CalendarCheck size={40} />
          </div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">
            لا توجد جلسات حضور
          </h2>
          <p className="text-gray-500 font-medium max-w-sm mb-6">
            قم بإنشاء جلسة جديدة لتبدأ في تسجيل حضور طلابك من خلال مسح بطاقاتهم
            (QR).
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            إنشاء جلسة الآن
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white dark:bg-[#16181f] rounded-3xl border border-gray-100 dark:border-white/[0.06] p-6 hover:shadow-md transition-all flex flex-col h-full relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white flex-1 leading-snug">
                    {session.name}
                  </h3>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
                    <CalendarDays size={16} className="text-primary/70" />
                    <span dir="ltr" className="text-right flex-1">
                      {new Date(session.date).toLocaleString("ar-EG")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-white/[0.06] mt-auto">
                <Link
                  href={`/dashboard/attendance/${session.id}`}
                  className="w-full py-2.5 bg-gray-50 dark:bg-white/5 hover:bg-primary hover:text-white dark:hover:bg-primary text-gray-600 dark:text-gray-300 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-white"
                >
                  <Eye size={18} />
                  فتح وتسجيل الحضور
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm rtl">
          <div className="bg-white dark:bg-[#16181f] w-full max-w-md rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-white/[0.06]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                إنشاء جلسة حضور
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-500 transition-colors"
                disabled={isSubmitting}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  اسم الجلسة (مثال: الحصة الأولى - سنتر الهدى)
                </label>
                <input
                  type="text"
                  required
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/[0.08] focus:border-primary outline-none transition-all dark:text-white font-medium placeholder:text-gray-400"
                  placeholder="أدخل اسم الجلسة..."
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  تاريخ الجلسة
                </label>
                <input
                  type="datetime-local"
                  value={newSessionDate}
                  onChange={(e) => setNewSessionDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/8 focus:border-primary outline-none transition-all dark:text-white font-medium"
                  disabled={isSubmitting}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all"
                  disabled={isSubmitting}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    "إنشاء الجلسة"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
