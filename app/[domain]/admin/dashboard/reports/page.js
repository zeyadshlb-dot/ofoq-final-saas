"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/components/ToastProvider";
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  DollarSign,
  CalendarCheck,
  Eye,
  Award,
  Loader2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  FileText,
  X,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   SVG CHART COMPONENTS (no dependency)
   ═══════════════════════════════════════════════════════════ */

function AreaChart({
  data,
  color = "#f43f5e",
  height = 160,
  label = "القيمة",
}) {
  if (!data || data.length === 0)
    return (
      <p className="text-center text-sm text-gray-400 py-8">لا توجد بيانات</p>
    );
  const max = Math.max(...data.map((d) => d.value), 1);
  const w = 100,
    h = 100;
  const pts = data.map((d, i) => ({
    x: (i / (data.length - 1 || 1)) * w,
    y: h - (d.value / max) * h * 0.85,
  }));
  const line = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  return (
    <div className="relative" style={{ height }}>
      <svg
        viewBox={`0 0 ${w} ${h + 10}`}
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id={`g-${color.replace("#", "")}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points={area} fill={`url(#g-${color.replace("#", "")})`} />
        <polyline
          points={line}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="1.2"
            fill={color}
            opacity={data[i].value > 0 ? 1 : 0.3}
          >
            <title>{`${data[i].label}: ${data[i].value}`}</title>
          </circle>
        ))}
      </svg>
      <div className="flex justify-between mt-1 px-1">
        {data
          .filter(
            (_, i) =>
              i % Math.ceil(data.length / 7) === 0 || i === data.length - 1,
          )
          .map((d, i) => (
            <span key={i} className="text-[9px] text-gray-400 font-bold">
              {d.label}
            </span>
          ))}
      </div>
    </div>
  );
}

function HBarChart({ data, color = "#f43f5e" }) {
  if (!data || data.length === 0)
    return (
      <p className="text-center text-sm text-gray-400 py-8">لا توجد بيانات</p>
    );
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2.5">
      {data.slice(0, 8).map((item, i) => (
        <div key={i}>
          <div className="flex justify-between mb-1">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate max-w-[70%]">
              {item.label}
            </span>
            <span className="text-xs font-black" style={{ color }}>
              {item.value.toLocaleString()}
              {item.suffix || ""}
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.max((item.value / max) * 100, 2)}%`,
                background: `linear-gradient(90deg, ${color}, ${color}88)`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({
  value,
  max = 100,
  color = "#f43f5e",
  size = 100,
  label = "",
}) {
  const pct = Math.min(Math.round((value / (max || 1)) * 100), 100);
  const r = 35,
    circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-gray-100 dark:text-white/5"
          strokeWidth="8"
        />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={circ - (pct / 100) * circ}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
          className="transition-all duration-1000"
        />
        <text
          x="40"
          y="38"
          textAnchor="middle"
          className="fill-gray-900 dark:fill-white text-[13px] font-black"
        >
          {pct}%
        </text>
        <text
          x="40"
          y="52"
          textAnchor="middle"
          className="fill-gray-400 text-[7px] font-bold"
        >
          {label}
        </text>
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   WIDGET DEFINITIONS
   ═══════════════════════════════════════════════════════════ */
const WIDGET_DEFS = {
  kpi_overview: { title: "نظرة عامة", icon: BarChart3, size: "full" },
  revenue_chart: {
    title: "تقرير الإيرادات — 30 يوم",
    icon: DollarSign,
    size: "half",
  },
  students_chart: { title: "نمو الطلاب — 30 يوم", icon: Users, size: "half" },
  top_courses: { title: "أفضل الكورسات", icon: BookOpen, size: "half" },
  top_lessons: { title: "أكثر الدروس مشاهدة", icon: Eye, size: "half" },
  exam_performance: { title: "أداء الامتحانات", icon: Award, size: "half" },
  attendance_stats: {
    title: "إحصائيات الحضور",
    icon: CalendarCheck,
    size: "half",
  },
};

const DEFAULT_LAYOUT = [
  "kpi_overview",
  "revenue_chart",
  "students_chart",
  "top_courses",
  "top_lessons",
  "exam_performance",
  "attendance_stats",
];

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */
export default function ReportsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [layout, setLayout] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("reports_layout");
      if (saved)
        try {
          return JSON.parse(saved);
        } catch {}
    }
    return DEFAULT_LAYOUT;
  });
  const [dragging, setDragging] = useState(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const [collapsed, setCollapsed] = useState({});

  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    localStorage.setItem("reports_layout", JSON.stringify(layout));
  }, [layout]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/analytics/advanced-reports", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("instructor_token")}`,
        },
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json.data || {});
    } catch {
      toast("حدث خطأ أثناء تحميل التقارير", "error");
    } finally {
      setLoading(false);
    }
  };

  // Drag & Drop
  const onDragStart = (e, id) => {
    setDragging(id);
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (e, id) => {
    e.preventDefault();
    if (!dragging || dragging === id) return;
    setLayout((prev) => {
      const from = prev.indexOf(dragging),
        to = prev.indexOf(id);
      if (from === -1 || to === -1) return prev;
      const next = [...prev];
      next.splice(from, 1);
      next.splice(to, 0, dragging);
      return next;
    });
  };
  const onDragEnd = () => setDragging(null);
  const toggleWidget = (id) => {
    setLayout((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };
  const toggleCollapse = (id) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );

  const ov = data?.overview || {};

  /* ═══ Widget Content Renderer ═══ */
  const renderWidget = (id) => {
    switch (id) {
      case "kpi_overview":
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              {
                icon: Users,
                label: "الطلاب",
                val: ov.total_students,
                color: "#3b82f6",
              },
              {
                icon: BookOpen,
                label: "الكورسات",
                val: ov.total_courses,
                color: "#8b5cf6",
              },
              {
                icon: DollarSign,
                label: "الإيرادات",
                val: `${(ov.total_revenue || 0).toLocaleString()} ج.م`,
                color: "#10b981",
              },
              {
                icon: Award,
                label: "الامتحانات",
                val: ov.total_exams,
                color: "#f59e0b",
              },
              {
                icon: Eye,
                label: "المشاهدات",
                val: ov.total_views,
                color: "#ef4444",
              },
              {
                icon: FileText,
                label: "دروس مكتملة",
                val: ov.total_completions,
                color: "#06b6d4",
              },
            ].map((k, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 flex flex-col items-center text-center gap-2"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: k.color + "18", color: k.color }}
                >
                  <k.icon size={18} />
                </div>
                <p className="text-[11px] font-bold text-gray-500">{k.label}</p>
                <p className="text-lg font-black text-gray-900 dark:text-white">
                  {k.val || 0}
                </p>
              </div>
            ))}
          </div>
        );
      case "revenue_chart":
        return (
          <AreaChart
            data={(data?.revenue_trend || []).map((d) => ({
              label: d.date,
              value: d.value,
            }))}
            color="#10b981"
            height={170}
          />
        );
      case "students_chart":
        return (
          <AreaChart
            data={(data?.registration_trend || []).map((d) => ({
              label: d.date,
              value: d.value,
            }))}
            color="#3b82f6"
            height={170}
          />
        );
      case "top_courses":
        return (
          <HBarChart
            data={(data?.top_courses || []).map((c) => ({
              label: c.name,
              value: c.enrollments,
              suffix: " طالب",
            }))}
            color="#8b5cf6"
          />
        );
      case "top_lessons":
        return (
          <HBarChart
            data={(data?.top_lessons || []).map((l) => ({
              label: l.name,
              value: l.views,
              suffix: " مشاهدة",
            }))}
            color="#ef4444"
          />
        );
      case "exam_performance": {
        const exams = data?.exam_stats || [];
        if (exams.length === 0)
          return (
            <p className="text-center text-sm text-gray-400 py-8">
              لا توجد امتحانات بعد
            </p>
          );
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 justify-center mb-2">
              {exams.slice(0, 4).map((ex, i) => (
                <DonutChart
                  key={i}
                  value={ex.pass_rate}
                  label={ex.name?.substring(0, 12)}
                  color={["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6"][i % 4]}
                  size={90}
                />
              ))}
            </div>
            <div className="divide-y divide-gray-100 dark:divide-white/6">
              {exams.map((ex, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2.5 text-sm"
                >
                  <span className="font-bold text-gray-700 dark:text-gray-300 truncate max-w-[50%]">
                    {ex.name}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500">
                      {ex.attempts} محاولة
                    </span>
                    <span className="font-black text-primary">
                      {Math.round(ex.avg_score)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
      case "attendance_stats": {
        const att = data?.attendance || {};
        const sessions = att.session_details || [];
        return (
          <div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl text-center">
                <p className="text-2xl font-black text-primary">
                  {att.total_sessions || 0}
                </p>
                <p className="text-xs font-bold text-gray-500">جلسة حضور</p>
              </div>
              <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl text-center">
                <p className="text-2xl font-black text-emerald-500">
                  {att.total_records || 0}
                </p>
                <p className="text-xs font-bold text-gray-500">تسجيل حضور</p>
              </div>
            </div>
            <HBarChart
              data={sessions.map((s) => ({
                label: s.name || "جلسة",
                value: s.count,
                suffix: " طالب",
              }))}
              color="#6366f1"
            />
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#16181f] p-6 rounded-3xl border border-gray-100 dark:border-white/6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg">
            <BarChart3 size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              مصنع التقارير المتقدمة
            </h1>
            <p className="text-sm text-gray-500 font-bold mt-1">
              {data?.platform_name || "المنصة"} — آخر 30 يوم
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCustomize(!showCustomize)}
          className="px-5 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-800 dark:text-white font-bold rounded-xl transition-all flex items-center gap-2 text-sm"
        >
          <GripVertical size={16} />
          تخصيص الـ Widgets
        </button>
      </div>

      {/* Customize Panel */}
      {showCustomize && (
        <div className="bg-white dark:bg-[#16181f] p-5 rounded-2xl border border-gray-100 dark:border-white/6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-gray-900 dark:text-white text-sm">
              اختر الـ Widgets المطلوبة واسحب لإعادة الترتيب
            </h3>
            <button
              onClick={() => setShowCustomize(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(WIDGET_DEFS).map(([id, def]) => {
              const active = layout.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => toggleWidget(id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    active
                      ? "bg-primary text-white"
                      : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  <def.icon size={14} />
                  {def.title}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-gray-400 mt-3">
            💡 اسحب كل Widget وأفلت في المكان المطلوب لإعادة الترتيب. التخصيصات
            تُحفظ تلقائياً.
          </p>
        </div>
      )}

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {layout.map((id) => {
          const def = WIDGET_DEFS[id];
          if (!def) return null;
          const isCollapsed = collapsed[id];
          const isFullWidth = def.size === "full";
          return (
            <div
              key={id}
              draggable
              onDragStart={(e) => onDragStart(e, id)}
              onDragOver={(e) => onDragOver(e, id)}
              onDragEnd={onDragEnd}
              className={`bg-white dark:bg-[#16181f] rounded-3xl border shadow-sm transition-all ${
                dragging === id
                  ? "opacity-50 border-primary border-2 scale-[0.98]"
                  : "border-gray-100 dark:border-white/6 hover:shadow-md"
              } ${isFullWidth ? "lg:col-span-2" : ""}`}
            >
              {/* Widget Header */}
              <div className="flex items-center justify-between p-5 pb-0 cursor-grab active:cursor-grabbing">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-primary rounded-full opacity-50" />
                  <GripVertical
                    size={14}
                    className="text-gray-300 dark:text-white/20"
                  />
                  <def.icon size={18} className="text-primary" />
                  <h3 className="font-black text-gray-900 dark:text-white text-sm">
                    {def.title}
                  </h3>
                </div>
                <button
                  onClick={() => toggleCollapse(id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {isCollapsed ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronUp size={16} />
                  )}
                </button>
              </div>
              {/* Widget Body */}
              {!isCollapsed && (
                <div className="p-5 pt-4">{renderWidget(id)}</div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
