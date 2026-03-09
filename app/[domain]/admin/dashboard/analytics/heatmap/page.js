"use client";

import React, { useState, useEffect } from "react";
import {
  Flame,
  BarChart3,
  Video,
  Users,
  Clock,
  TrendingUp,
  Loader2,
  Calendar,
  Zap,
  ChevronRight,
  Info,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import { useTheme, getSlug, getToken } from "../../layout";

const DAYS = [
  "الأحد",
  "الأثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];
const HOURS = Array.from({ length: 24 }, (_, i) => `${i}:00`);

export default function HeatmapPage() {
  const { dark, primaryColor } = useTheme();
  const pc = primaryColor || "#f43f5e";
  const slug = getSlug();
  const token = getToken();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [slug]);

  const fetchAnalytics = async () => {
    if (!token || slug === "main") return;
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/analytics/video?slug=${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch heatmap data", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 animate-spin" style={{ color: pc }} />
        <p className="text-sm font-bold animate-pulse opacity-60">
          جاري تحليل بيانات المشاهدة...
        </p>
      </div>
    );
  }

  const d = dark;
  const heatmapData = data?.heatmap || [];
  const topLessons = data?.top_lessons || [];
  const summary = data?.summary || {};

  // Find max value for heatmap scaling
  const maxVal = Math.max(...heatmapData.map((d) => d.value), 1);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-500/20">
              <Flame className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">
              الخريطة الحرارية للمشاهدة
            </h1>
          </div>
          <p
            className={`text-sm font-medium ${d ? "text-gray-400" : "text-gray-500"}`}
          >
            تحليل أوقات ذروة النشاط وتقادم الطلاب في المحتوى التعليمي
          </p>
        </div>

        <div className="flex gap-3">
          <div
            className={`px-4 py-2 rounded-xl flex items-center gap-2 border ${d ? "bg-white/5 border-white/5" : "bg-white border-gray-100 shadow-sm"}`}
          >
            <Users className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-black">
              {summary.total_progress_records} سجل تقدم
            </span>
          </div>
          <div
            className={`px-4 py-2 rounded-xl flex items-center gap-2 border ${d ? "bg-white/5 border-white/5" : "bg-white border-gray-100 shadow-sm"}`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-black">
              {summary.total_completions} إتمام فيديو
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Heatmap Grid ── */}
      <div
        className={`rounded-[2.5rem] p-8 ${d ? "bg-[#141625] border border-white/5" : "bg-white border border-gray-100 shadow-xl shadow-gray-200/50"}`}
      >
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black">كثافة النشاط الأسبوعي</h3>
              <p className="text-xs text-gray-500 font-bold">
                توزيع المشاهدات حسب اليوم والساعة
              </p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-4">
            <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">
              مفتاح الكثافة
            </span>
            <div className="flex gap-1">
              {[0.1, 0.3, 0.6, 0.9].map((op, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-sm"
                  style={{ backgroundColor: pc, opacity: op }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <div className="min-w-[900px] flex gap-2">
            {/* Hour Labels */}
            <div className="w-20 pt-10">
              {DAYS.map((day, i) => (
                <div
                  key={i}
                  className="h-10 flex items-center justify-end pr-4 text-[10px] font-bold text-gray-400"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-24 gap-1.5 mb-2">
                {HOURS.map((h, i) => (
                  <div
                    key={i}
                    className="text-center text-[10px] font-bold text-gray-400 rotate-45 h-10"
                  >
                    {h}
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-1.5">
                {DAYS.map((_, dIdx) => (
                  <div key={dIdx} className="grid grid-cols-24 gap-1.5 h-10">
                    {Array.from({ length: 24 }).map((_, hIdx) => {
                      const cell = heatmapData.find(
                        (h) => h.day === dIdx && h.hour === hIdx,
                      );
                      const val = cell ? cell.value : 0;
                      const opacity =
                        val === 0 ? 0.05 : (val / maxVal) * 0.9 + 0.1;
                      return (
                        <div
                          key={hIdx}
                          className="rounded-md transition-all group relative cursor-pointer hover:ring-2 hover:ring-white/20"
                          style={{
                            backgroundColor:
                              val > 0 ? pc : d ? "#ffffff10" : "#00000005",
                            opacity: opacity,
                          }}
                        >
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[9px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                            {val} مشاهدة في هذا الوقت
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Lessons Bar Chart */}
        <div
          className={`rounded-[2.5rem] p-8 ${d ? "bg-[#141625] border border-white/5" : "bg-white border border-gray-100 shadow-xl shadow-gray-200/50"}`}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black">أكثر الدروس مشاهدة</h3>
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topLessons}
                layout="vertical"
                margin={{ left: 40, right: 20 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: d ? "#94a3b8" : "#64748b",
                    fontSize: 11,
                    fontWeight: "bold",
                  }}
                  width={120}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    borderRadius: 16,
                    border: "none",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar dataKey="views" radius={[0, 10, 10, 0]}>
                  {topLessons.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index % 2 === 0 ? pc : "#3b82f6"}
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 gap-6">
          <div
            className={`rounded-3xl p-8 flex items-center justify-between border ${d ? "bg-gradient-to-br from-rose-500/10 to-transparent border-rose-500/20" : "bg-gradient-to-br from-rose-50 to-white border-rose-100 shadow-lg shadow-rose-500/5"}`}
          >
            <div className="space-y-1">
              <p className="text-xs font-black text-rose-500 uppercase tracking-tighter">
                معدل الإتمام الكلي
              </p>
              <h4 className="text-4xl font-black">
                {summary.total_progress_records > 0
                  ? Math.round(
                      (summary.total_completions /
                        summary.total_progress_records) *
                        100,
                    )
                  : 0}
                %
              </h4>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/10 dark:bg-white/5 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-rose-500" />
            </div>
          </div>

          <div
            className={`rounded-3xl p-8 border ${d ? "bg-[#141625] border-white/5" : "bg-white border-gray-100 shadow-lg shadow-gray-500/5"}`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Info className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-gray-500">
                ملاحظات التحليل
              </h3>
            </div>
            <div className="space-y-4">
              <p className="text-sm font-medium leading-relaxed opacity-70">
                • يتركز نشاط الطلاب عادة في الساعات التي تتلون باللون الغامق في
                الخريطة.
              </p>
              <p className="text-sm font-medium leading-relaxed opacity-70">
                • الدروس ذات المشاهدات الأقل قد تحتاج لمراجعة أسلوب تقديمها أو
                التأكد من إتاحتها للطلاب.
              </p>
              <p className="text-sm font-medium leading-relaxed opacity-70">
                • يتم تحديث هذه البيانات لحظياً بناءً على تقادم الطلاب في المشغل
                المدمج.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .grid-cols-24 {
          grid-template-columns: repeat(24, minmax(0, 1fr));
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
