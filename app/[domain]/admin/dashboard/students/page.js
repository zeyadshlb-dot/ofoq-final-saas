"use client";

import { useState, useEffect } from "react";
import { useTheme, getToken, getSlug } from "../layout";
import {
  Users,
  Search,
  Loader2,
  AlertCircle,
  Eye,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  GraduationCap,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

export default function StudentsPage() {
  const { dark, primaryColor } = useTheme();
  const pc = primaryColor || "#8b5cf6";
  const slug = getSlug();
  const token = getToken();
  const params = useParams();
  const domain = params.domain;

  const [students, setStudents] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("all");
  const [isDeleting, setIsDeleting] = useState(null);

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    if (slug === "main" || !token) return;
    try {
      setLoading(true);
      // Fetch Stages for filtering
      const stagesRes = await fetch(`/api/v1/stages?slug=${slug}`);
      if (stagesRes.ok) {
        const stagesData = await stagesRes.json();
        setStages(
          Array.isArray(stagesData) ? stagesData : stagesData?.data || [],
        );
      }

      // Fetch Students
      const res = await fetch(`/api/v1/students?slug=${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("فشل جلب بيانات الطلاب");
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الطالب نهائياً؟")) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/v1/students/${id}?slug=${slug}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("حدث خطأ أثناء الحذف");
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeleting(null);
    }
  };

  // Stats
  const activeStudents = students.filter((s) => s.status === "active").length;
  const suspendedStudents = students.filter(
    (s) => s.status === "suspended",
  ).length;
  const activePercentage =
    students.length > 0
      ? Math.round((activeStudents / students.length) * 100)
      : 0;

  // Pie Chart Data
  const statusData = [
    { name: "نشط", value: activeStudents, color: "#10b981" },
    { name: "موقوف", value: suspendedStudents, color: "#ef4444" },
  ];

  // Bar Chart Data (Students per Stage)
  const stageData = stages
    .map((stage) => {
      return {
        name: stage.name,
        students: students.filter((s) => s.educational_stage_id === stage.id)
          .length,
      };
    })
    .sort((a, b) => b.students - a.students);

  // Filter
  const filteredStudents = students.filter((s) => {
    const mathcesSearch =
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone?.includes(searchQuery);
    const matchesStage =
      selectedStage === "all" ||
      s.educational_stage_id?.toString() === selectedStage;
    return mathcesSearch && matchesStage;
  });

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      {/* Header & Stats Dashboard */}
      <div
        className={`relative overflow-hidden rounded-[2.5rem] p-8 lg:p-10 ${dark ? "bg-[#141625]/80 border border-white/5" : "bg-white border border-gray-100 shadow-xl shadow-gray-200/40"}`}
      >
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-[100px]"
            style={{ background: pc, opacity: dark ? 0.15 : 0.08 }}
          />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h1
                className={`text-3xl md:text-4xl font-black ${dark ? "text-white" : "text-gray-900"} mb-3 tracking-tight`}
              >
                إدارة الطلاب
              </h1>
              <p
                className={`text-base md:text-lg ${dark ? "text-gray-400" : "text-gray-500"} max-w-xl`}
              >
                تابع طلابك، راقب نشاطاتهم والمراحل الدراسية، وتحكم في الأجهزة
                المسجلة.
              </p>
            </div>
            <div
              className="shrink-0 flex items-center justify-center w-20 h-20 rounded-[2rem] shadow-2xl"
              style={{ background: `linear-gradient(135deg, ${pc}, ${pc}80)` }}
            >
              <Users className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Premium Charts / Stats Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stat 1: Total */}
              <div
                className={`p-6 rounded-3xl border ${dark ? "bg-[#1A1D2B] border-white/10" : "bg-white border-gray-100"} flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-sm font-bold tracking-wider uppercase ${dark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    إجمالي الطلاب
                  </span>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-bold"
                    style={{ backgroundColor: `${pc}20`, color: pc }}
                  >
                    <Users className="w-6 h-6" />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <h3
                    className={`text-6xl font-black tracking-tighter ${dark ? "text-white" : "text-gray-900"}`}
                  >
                    {students.length}
                  </h3>
                  <span
                    className={`text-base font-bold truncate ${dark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    طالب مسجل في منصتك
                  </span>
                </div>
              </div>

              {/* Stat 2: Active / Suspended (Pie Chart) */}
              <div
                className={`p-6 rounded-3xl border ${dark ? "bg-[#1A1D2B] border-white/10" : "bg-white border-gray-100"} flex flex-col`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-sm font-bold tracking-wider uppercase ${dark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    حالة الحسابات
                  </span>
                </div>

                <div className="flex-1 flex items-center justify-center min-h-[160px]">
                  {students.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{
                            borderRadius: "16px",
                            border: "none",
                            backgroundColor: dark ? "#2A2E44" : "#fff",
                            color: dark ? "#fff" : "#000",
                            fontWeight: "bold",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                          }}
                          itemStyle={{ color: dark ? "#fff" : "#000" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p
                      className={`text-sm font-bold ${dark ? "text-gray-600" : "text-gray-400"}`}
                    >
                      لا توجد بيانات
                    </p>
                  )}
                </div>

                <div className="flex justify-center gap-6 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    <span
                      className={`text-sm font-bold ${dark ? "text-gray-300" : "text-gray-600"}`}
                    >
                      نشط ({activeStudents})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                    <span
                      className={`text-sm font-bold ${dark ? "text-gray-300" : "text-gray-600"}`}
                    >
                      موقوف ({suspendedStudents})
                    </span>
                  </div>
                </div>
              </div>

              {/* Stat 3: Distribution by Stage (Bar Chart) */}
              <div
                className={`p-6 rounded-3xl border ${dark ? "bg-[#1A1D2B] border-white/10" : "bg-white border-gray-100"} flex flex-col`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-sm font-bold tracking-wider uppercase ${dark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    أكثر المراحل تسجيلاً
                  </span>
                </div>

                <div className="flex-1 min-h-[160px]">
                  {students.length > 0 && stageData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stageData.slice(0, 3)}
                        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                      >
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: dark ? "#9ca3af" : "#6b7280",
                            fontSize: 12,
                            fontWeight: "bold",
                          }}
                        />
                        <RechartsTooltip
                          cursor={{ fill: dark ? "#ffffff10" : "#00000005" }}
                          contentStyle={{
                            borderRadius: "16px",
                            border: "none",
                            backgroundColor: dark ? "#2A2E44" : "#fff",
                            color: dark ? "#fff" : "#000",
                            fontWeight: "bold",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Bar
                          dataKey="students"
                          fill={pc}
                          radius={[6, 6, 6, 6]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p
                        className={`text-sm font-bold ${dark ? "text-gray-600" : "text-gray-400"}`}
                      >
                        لا توجد بيانات
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters & Search */}
      <div
        className={`p-4 md:p-6 rounded-3xl flex flex-col md:flex-row gap-4 justify-between items-center relative z-10 ${dark ? "bg-[#141625] border border-white/5" : "bg-white border border-gray-100 shadow-sm"}`}
      >
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="ابحث بالاسم أو رقم الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-12 pr-6 py-4 outline-none rounded-2xl font-bold transition-all border-2 ${dark ? "bg-black/20 border-white/10 text-white focus:border-white/30" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-gray-400"}`}
          />
          <Search
            className={`absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 ${dark ? "text-gray-500" : "text-gray-400"}`}
          />
        </div>

        <select
          value={selectedStage}
          onChange={(e) => setSelectedStage(e.target.value)}
          className={`w-full md:w-64 outline-none font-bold px-6 py-4 rounded-2xl transition-all border-2 appearance-none cursor-pointer ${dark ? "bg-black/20 border-white/10 text-white focus:border-white/30" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-gray-400"}`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: "left 1.5rem center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "1.5em 1.5em",
          }}
        >
          <option value="all">كل المراحل الدراسية</option>
          {stages.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table / Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-12 h-12 animate-spin" style={{ color: pc }} />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] text-red-500">
          <AlertCircle className="w-12 h-12 mb-4" />
          <p className="font-bold text-lg">{error}</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div
          className={`text-center py-24 rounded-3xl ${dark ? "bg-[#141625]/50 border border-white/5" : "bg-white border border-gray-100 shadow-sm"}`}
        >
          <div
            className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6"
            style={{ backgroundColor: `${pc}15`, color: pc }}
          >
            <Users className="w-10 h-10 opacity-70" />
          </div>
          <h3
            className={`text-2xl font-black mb-3 ${dark ? "text-white" : "text-gray-900"}`}
          >
            لا يوجد طلاب بالبحث الحالي
          </h3>
          <p className={`text-lg ${dark ? "text-gray-500" : "text-gray-400"}`}>
            جرب تغيير المرحلة الدراسية أو كلمات البحث.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className={`group relative flex flex-col rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${dark ? "bg-[#141625] border border-white/5 hover:border-white/10 shadow-black/50" : "bg-white border border-gray-100 hover:border-gray-200 shadow-sm"}`}
            >
              {/* Card Header Profile */}
              <div className="flex items-start justify-between mb-6 border-b pb-6 dark:border-white/10 border-gray-100">
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner uppercase"
                    style={{ backgroundColor: `${pc}20`, color: pc }}
                  >
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h3
                      className={`font-black text-lg ${dark ? "text-white" : "text-gray-900"} group-hover:text-primary transition-colors`}
                      style={{
                        "--tw-text-opacity": 1,
                        color: `var(--hover-color, inherit)`,
                      }}
                    >
                      {student.name}
                    </h3>
                    <p
                      className={`text-sm font-medium mt-1 ${dark ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {student.phone}
                    </p>
                  </div>
                </div>
                {/* Status Badge */}
                {student.status === "active" ? (
                  <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold text-xs ring-1 ring-emerald-500/20">
                    <ShieldCheck className="w-3.5 h-3.5" /> نشط
                  </div>
                ) : (
                  <div className="bg-red-500/10 text-red-500 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold text-xs ring-1 ring-red-500/20">
                    <ShieldAlert className="w-3.5 h-3.5" /> موقوف
                  </div>
                )}
              </div>

              {/* Card Details */}
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${dark ? "bg-white/5" : "bg-gray-50"}`}
                  >
                    <GraduationCap
                      className={`w-4 h-4 ${dark ? "text-gray-400" : "text-gray-500"}`}
                    />
                  </div>
                  <div>
                    <p
                      className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${dark ? "text-gray-500" : "text-gray-400"}`}
                    >
                      المرحلة الدراسية
                    </p>
                    <p
                      className={`text-sm font-bold ${dark ? "text-white" : "text-gray-900"}`}
                    >
                      {stages.find((s) => s.id === student.educational_stage_id)
                        ?.name || "غير محدد"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-8 pt-4">
                <Link
                  href={`/dashboard/students/${student.id}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: pc }}
                >
                  <Eye className="w-4 h-4" /> عرض البروفايل
                </Link>
                <button
                  onClick={() => handleDelete(student.id)}
                  disabled={isDeleting === student.id}
                  className={`w-12 shrink-0 flex items-center justify-center rounded-xl transition-all ${dark ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-red-50 text-red-500 hover:bg-red-100"} disabled:opacity-50`}
                >
                  {isDeleting === student.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
