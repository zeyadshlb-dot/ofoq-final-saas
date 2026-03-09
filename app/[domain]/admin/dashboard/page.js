"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme, getSlug, getToken } from "./layout";
import {
  Users,
  BookOpen,
  GraduationCap,
  FileText,
  TrendingUp,
  Zap,
  Video,
  Radio,
  CreditCard,
  BarChart3,
  Activity,
  ChevronLeft,
  ClipboardList,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function InstructorDashboard() {
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const { dark, primaryColor } = useTheme();
  const slug = getSlug();

  const [stats, setStats] = useState({
    students: [],
    courses: [],
    stages: [],
    exams: [],
    examResults: {},
    vouchers: [],
    videos: [],
    liveWallet: null,
    aiBalance: null,
    paymentGateways: [],
    configuredGateways: [],
    videoWalletStats: null,
  });

  const d = dark;
  const pc = primaryColor || "#8b5cf6";

  const fetchAll = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    const safeJson = async (url) => {
      try {
        const r = await fetch(url, { headers });
        if (!r.ok) return null;
        const d = await r.json();
        return d?.data ?? d;
      } catch {
        return null;
      }
    };

    try {
      const [
        instructorData,
        studentsData,
        coursesData,
        stagesData,
        examsData,
        vouchersData,
        videosData,
        liveWalletData,
        aiBalanceData,
        paymentGwData,
        confGwData,
        videoWalletStatsData,
      ] = await Promise.all([
        safeJson("/api/v1/instructor/me"),
        safeJson(`/api/v1/students?slug=${slug}`),
        safeJson(`/api/v1/courses?slug=${slug}`),
        safeJson(`/api/v1/educational-stages?slug=${slug}`),
        safeJson(`/api/v1/exams?slug=${slug}`),
        safeJson("/api/v1/vouchers/batches"),
        safeJson(`/api/v1/videos?slug=${slug}`),
        safeJson(`/api/v1/live/wallet?slug=${slug}`),
        safeJson(`/api/v1/ai/balance?slug=${slug}`),
        safeJson("/api/v1/payments/gateways/available"),
        safeJson(`/api/v1/payments/tenant-gateways?slug=${slug}`),
        safeJson(`/api/v1/tenants/video-wallet-stats?slug=${slug}`),
      ]);

      if (instructorData) setInstructor(instructorData);

      const exams = Array.isArray(examsData) ? examsData : [];
      const examResults = {};
      for (const exam of exams.slice(0, 10)) {
        const result = await safeJson(`/api/v1/exams/${exam.id}/results`);
        if (result) examResults[exam.id] = result;
      }

      setStats({
        students: Array.isArray(studentsData) ? studentsData : [],
        courses: Array.isArray(coursesData) ? coursesData : [],
        stages: Array.isArray(stagesData) ? stagesData : [],
        exams,
        examResults,
        vouchers: Array.isArray(vouchersData) ? vouchersData : [],
        videos: Array.isArray(videosData) ? videosData : [],
        liveWallet: liveWalletData,
        aiBalance: aiBalanceData,
        paymentGateways: Array.isArray(paymentGwData) ? paymentGwData : [],
        configuredGateways: Array.isArray(confGwData) ? confGwData : [],
        videoWalletStats: videoWalletStatsData,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login/instructor");
      return;
    }
    fetchAll();
  }, [fetchAll, router]);

  // ─── Computed ───
  const totalStudents = stats.students.length;
  const totalCourses = stats.courses.length;
  const totalStages = stats.stages.length;
  const totalExams = stats.exams.length;
  const totalVideos = stats.videos.length;
  const activeGateways = stats.configuredGateways.filter(
    (g) => g.is_active,
  ).length;

  const allAttempts = [];
  Object.values(stats.examResults).forEach((result) => {
    const attempts = result?.attempts || result?.data?.attempts || [];
    if (Array.isArray(attempts)) allAttempts.push(...attempts);
  });
  const totalAttempts = allAttempts.length;
  const avgScore =
    totalAttempts > 0
      ? Math.round(
          allAttempts.reduce((a, att) => a + (att.score || 0), 0) /
            totalAttempts,
        )
      : 0;
  const passedAttempts = allAttempts.filter(
    (a) => (a.score || 0) >= (a.passing_score || 50),
  ).length;
  const failedAttempts = totalAttempts - passedAttempts;
  const passRate =
    totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

  // ─── Chart Data ───
  // Exam performance per exam (bar chart)
  const examBarData = stats.exams.slice(0, 8).map((exam) => {
    const r = stats.examResults[exam.id];
    const att = r?.attempts || r?.data?.attempts || [];
    const attArr = Array.isArray(att) ? att : [];
    const avg =
      attArr.length > 0
        ? Math.round(
            attArr.reduce((a, x) => a + (x.score || 0), 0) / attArr.length,
          )
        : 0;
    const maxS =
      attArr.length > 0 ? Math.max(...attArr.map((a) => a.score || 0)) : 0;
    return {
      name: exam.title?.substring(0, 15) || "امتحان",
      المتوسط: avg,
      أعلى: maxS,
      محاولات: attArr.length,
    };
  });

  // Pie chart: pass/fail
  const pieData = [
    { name: "ناجح", value: passedAttempts, color: "#22c55e" },
    { name: "راسب", value: failedAttempts, color: "#ef4444" },
  ];

  // Student registration trend (group by date or mock from data)
  const studentTrendData = (() => {
    const byDate = {};
    stats.students.forEach((s) => {
      const d = s.CreatedAt || s.created_at;
      if (!d) return;
      const key = new Date(d).toLocaleDateString("ar-EG", {
        month: "short",
        day: "numeric",
      });
      byDate[key] = (byDate[key] || 0) + 1;
    });
    const entries = Object.entries(byDate).slice(-10);
    let cumulative = 0;
    return entries.map(([date, count]) => {
      cumulative += count;
      return { name: date, جدد: count, إجمالي: cumulative };
    });
  })();

  // Course students distribution
  const courseDistData = stats.courses.slice(0, 6).map((c) => ({
    name: c.title?.substring(0, 12) || "كورس",
    طلاب: c.students_count || 0,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: pc, borderTopColor: "transparent" }}
          />
          <p
            className={`text-lg font-medium ${d ? "text-gray-400" : "text-gray-500"}`}
          >
            جاري تحميل البيانات...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className={`p-6 rounded-2xl max-w-md w-full text-center ${d ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600"}`}
        >
          <XCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  const wallets = [
    {
      key: "ai",
      label: "محفظة الذكاء الاصطناعي",
      value: stats.aiBalance?.wallet?.balance ?? instructor?.ai_wallet ?? 0,
      unit: "نقطة",
      gradient: "from-violet-500 via-fuchsia-500 to-indigo-500",
      icon: Zap,
    },
    {
      key: "video",
      label: "محفظة الفيديوهات",
      value: stats.videoWalletStats
        ? `${stats.videoWalletStats.used_gb}/${stats.videoWalletStats.total_gb}`
        : "0",
      unit: "جيجا",
      gradient: "from-blue-500 via-cyan-500 to-teal-400",
      icon: Video,
    },
    {
      key: "live",
      label: "محفظة البث المباشر",
      value: stats.liveWallet?.balance_minutes ?? instructor?.live_wallet ?? 0,
      unit: "دقيقة",
      gradient: "from-rose-500 via-red-500 to-orange-500",
      icon: Radio,
    },
  ];

  const mainStats = [
    {
      label: "إجمالي الطلاب",
      value: totalStudents,
      icon: Users,
      color: "#3b82f6",
    },
    {
      label: "الكورسات",
      value: totalCourses,
      icon: BookOpen,
      color: "#10b981",
    },
    {
      label: "المراحل الدراسية",
      value: totalStages,
      icon: GraduationCap,
      color: "#f59e0b",
    },
    {
      label: "الامتحانات",
      value: totalExams,
      icon: ClipboardList,
      color: "#8b5cf6",
    },
    { label: "الفيديوهات", value: totalVideos, icon: Video, color: "#06b6d4" },
    {
      label: "بوابات الدفع",
      value: `${activeGateways}/${stats.paymentGateways.length}`,
      icon: CreditCard,
      color: "#ec4899",
    },
  ];

  const CHART_COLORS = [
    "#8b5cf6",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#ec4899",
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* ═══ Welcome ═══ */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-black">
          مرحباً،{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(135deg, ${pc}, ${pc}99)`,
            }}
          >
            {instructor?.name || "معلم"}
          </span>{" "}
          👋
        </h1>
        <p className={`mt-1 text-sm ${d ? "text-gray-500" : "text-gray-400"}`}>
          نظرة عامة شاملة على منصتك — الإحصائيات والأداء والمحافظ
        </p>
      </div>

      {/* ═══ Wallet Cards ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {wallets.map((w, i) => {
          const Icon = w.icon;
          return (
            <button
              key={i}
              onClick={() => router.push(`/dashboard/wallet/${w.key}`)}
              className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 text-right group ${d ? "bg-[#141625] border border-white/[.06]" : "bg-white border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.04)]"}`}
            >
              <div
                className={`absolute top-0 right-0 w-28 h-28 rounded-full bg-gradient-to-bl ${w.gradient} opacity-[0.08] blur-3xl -translate-y-10 translate-x-10 group-hover:opacity-20 transition-opacity duration-500`}
              />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p
                    className={`text-[11px] font-bold tracking-wide uppercase mb-2 ${d ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {w.label}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-3xl font-black bg-clip-text text-transparent bg-gradient-to-l ${w.gradient}`}
                    >
                      {w.value}
                    </span>
                    <span
                      className={`text-xs font-bold ${d ? "text-gray-500" : "text-gray-400"}`}
                    >
                      {w.unit}
                    </span>
                  </div>

                  {/* Real Progress Bar for Video Wallet */}
                  {w.key === "video" && stats.videoWalletStats && (
                    <div className="mt-3 w-32">
                      <div
                        className={`h-1.5 w-full rounded-full overflow-hidden ${d ? "bg-white/5" : "bg-gray-100"}`}
                      >
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                          style={{
                            width: `${Math.min(100, (stats.videoWalletStats.used_gb / stats.videoWalletStats.total_gb) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div
                  className={`p-3 rounded-2xl bg-gradient-to-br ${w.gradient} text-white shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ═══ Main Stats Grid ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {mainStats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className={`rounded-2xl p-4 transition-all hover:scale-105 ${d ? "bg-[#141625] border border-white/[.06]" : "bg-white border border-gray-100 shadow-sm"}`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: s.color + "15" }}
              >
                <Icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <p
                className={`text-2xl font-black ${d ? "text-white" : "text-gray-800"}`}
              >
                {s.value}
              </p>
              <p
                className={`text-[11px] font-bold mt-1 ${d ? "text-gray-500" : "text-gray-400"}`}
              >
                {s.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* ═══ Charts Row 1: Student Trend + Course Distribution ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student registrations trend */}
        <div
          className={`rounded-2xl p-6 ${d ? "bg-[#141625] border border-white/[.06]" : "bg-white border border-gray-100 shadow-sm"}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: pc + "20" }}
            >
              <TrendingUp className="w-5 h-5" style={{ color: pc }} />
            </div>
            <div>
              <h3
                className={`font-black ${d ? "text-white" : "text-gray-800"}`}
              >
                معدل التسجيل
              </h3>
              <p
                className={`text-xs font-bold ${d ? "text-gray-500" : "text-gray-400"}`}
              >
                تسجيلات الطلاب الجدد حسب التاريخ
              </p>
            </div>
          </div>
          <div className="h-[260px]">
            {studentTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={studentTrendData}
                  margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="gradStudents"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={pc} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={pc} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={d ? "#ffffff08" : "#00000008"}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: d ? "#6b7280" : "#9ca3af",
                      fontSize: 11,
                      fontWeight: "bold",
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: d ? "#6b7280" : "#9ca3af", fontSize: 11 }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "none",
                      backgroundColor: d ? "#1e2130" : "#fff",
                      color: d ? "#fff" : "#000",
                      fontWeight: "bold",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="جدد"
                    stroke={pc}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#gradStudents)"
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p
                  className={`text-sm font-bold ${d ? "text-gray-600" : "text-gray-300"}`}
                >
                  لا توجد بيانات كافية لعرض الرسم
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Course student distribution */}
        <div
          className={`rounded-2xl p-6 ${d ? "bg-[#141625] border border-white/[.06]" : "bg-white border border-gray-100 shadow-sm"}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/10">
              <BookOpen className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h3
                className={`font-black ${d ? "text-white" : "text-gray-800"}`}
              >
                توزيع الطلاب على الكورسات
              </h3>
              <p
                className={`text-xs font-bold ${d ? "text-gray-500" : "text-gray-400"}`}
              >
                عدد الطلاب المسجلين في كل كورس
              </p>
            </div>
          </div>
          <div className="h-[260px]">
            {courseDistData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={courseDistData}
                  margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={d ? "#ffffff08" : "#00000008"}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: d ? "#6b7280" : "#9ca3af",
                      fontSize: 10,
                      fontWeight: "bold",
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: d ? "#6b7280" : "#9ca3af", fontSize: 11 }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "none",
                      backgroundColor: d ? "#1e2130" : "#fff",
                      color: d ? "#fff" : "#000",
                      fontWeight: "bold",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="طلاب" radius={[8, 8, 0, 0]}>
                    {courseDistData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p
                  className={`text-sm font-bold ${d ? "text-gray-600" : "text-gray-300"}`}
                >
                  لا توجد كورسات بعد
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Charts Row 2: Exam Performance + Pass/Fail Pie ═══ */}
      {totalExams > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exam bar chart (2/3) */}
          <div
            className={`lg:col-span-2 rounded-2xl p-6 ${d ? "bg-[#141625] border border-white/[.06]" : "bg-white border border-gray-100 shadow-sm"}`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-500/10">
                  <BarChart3 className="w-5 h-5 text-violet-500" />
                </div>
                <div>
                  <h3
                    className={`font-black ${d ? "text-white" : "text-gray-800"}`}
                  >
                    أداء الامتحانات
                  </h3>
                  <p
                    className={`text-xs font-bold ${d ? "text-gray-500" : "text-gray-400"}`}
                  >
                    متوسط وأعلى درجة لكل امتحان
                  </p>
                </div>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${d ? "bg-white/5 text-gray-400" : "bg-gray-100 text-gray-500"}`}
              >
                {totalAttempts} محاولة
              </span>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={examBarData}
                  margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={d ? "#ffffff08" : "#00000008"}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: d ? "#6b7280" : "#9ca3af",
                      fontSize: 10,
                      fontWeight: "bold",
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: d ? "#6b7280" : "#9ca3af", fontSize: 11 }}
                    domain={[0, 100]}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "none",
                      backgroundColor: d ? "#1e2130" : "#fff",
                      color: d ? "#fff" : "#000",
                      fontWeight: "bold",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, fontWeight: "bold" }} />
                  <Bar dataKey="المتوسط" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="أعلى" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pass/Fail pie (1/3) */}
          <div
            className={`rounded-2xl p-6 flex flex-col ${d ? "bg-[#141625] border border-white/[.06]" : "bg-white border border-gray-100 shadow-sm"}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/10">
                <Activity className="w-5 h-5 text-emerald-500" />
              </div>
              <h3
                className={`font-black ${d ? "text-white" : "text-gray-800"}`}
              >
                نسبة النجاح
              </h3>
            </div>

            <div className="flex-1 flex items-center justify-center">
              {totalAttempts > 0 ? (
                <div className="relative w-full max-w-[200px]">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: "none",
                          backgroundColor: d ? "#1e2130" : "#fff",
                          fontWeight: "bold",
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p
                        className={`text-3xl font-black ${d ? "text-white" : "text-gray-800"}`}
                      >
                        {passRate}%
                      </p>
                      <p
                        className={`text-[10px] font-bold ${d ? "text-gray-500" : "text-gray-400"}`}
                      >
                        نجاح
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p
                  className={`text-sm font-bold ${d ? "text-gray-600" : "text-gray-300"}`}
                >
                  لا توجد محاولات
                </p>
              )}
            </div>

            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span
                  className={`text-xs font-bold ${d ? "text-gray-400" : "text-gray-500"}`}
                >
                  ناجح ({passedAttempts})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span
                  className={`text-xs font-bold ${d ? "text-gray-400" : "text-gray-500"}`}
                >
                  راسب ({failedAttempts})
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Quick Overview Cards Row ═══ */}
      {totalExams > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickStat
            d={d}
            label="متوسط الدرجات"
            value={`${avgScore}%`}
            icon={Activity}
            color="#3b82f6"
          />
          <QuickStat
            d={d}
            label="نسبة النجاح"
            value={`${passRate}%`}
            icon={TrendingUp}
            color="#10b981"
          />
          <QuickStat
            d={d}
            label="ناجحون"
            value={passedAttempts}
            icon={CheckCircle}
            color="#22c55e"
          />
          <QuickStat
            d={d}
            label="راسبون"
            value={failedAttempts}
            icon={XCircle}
            color="#ef4444"
          />
        </div>
      )}

      {/* ═══ Recent Students ═══ */}
      {stats.students.length > 0 && (
        <div
          className={`rounded-2xl p-6 ${d ? "bg-[#141625] border border-white/[.06]" : "bg-white border border-gray-100 shadow-sm"}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className={`text-lg font-black flex items-center gap-2 ${d ? "text-white" : "text-gray-800"}`}
            >
              <Users className="w-5 h-5" style={{ color: pc }} /> أحدث الطلاب
              المسجلين
            </h2>
            <button
              onClick={() => router.push("/dashboard/students")}
              className={`text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${d ? "bg-white/5 hover:bg-white/10 text-gray-400" : "bg-gray-100 hover:bg-gray-200 text-gray-500"}`}
            >
              عرض الكل <ChevronLeft className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.students
              .slice(-6)
              .reverse()
              .map((s, i) => (
                <button
                  key={s.id || i}
                  onClick={() => router.push(`/dashboard/students/${s.id}`)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all text-right ${d ? "bg-white/5 hover:bg-white/10" : "bg-gray-50 hover:bg-gray-100"}`}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0"
                    style={{ background: pc }}
                  >
                    {s.name?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-bold truncate ${d ? "text-white" : "text-gray-800"}`}
                    >
                      {s.name}
                    </p>
                    <p
                      className={`text-[10px] font-bold ${d ? "text-gray-500" : "text-gray-400"}`}
                      dir="ltr"
                      style={{ textAlign: "right" }}
                    >
                      {s.phone || "—"}
                    </p>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* ═══ Personal Info ═══ */}
      {instructor && (
        <div
          className={`rounded-2xl p-6 ${d ? "bg-[#141625] border border-white/[.06]" : "bg-white border border-gray-100 shadow-sm"}`}
        >
          <h2
            className={`text-lg font-black mb-5 pb-4 border-b flex items-center gap-2 ${d ? "border-white/5 text-white" : "border-gray-100 text-gray-800"}`}
          >
            <Eye className="w-5 h-5" style={{ color: pc }} /> البيانات الشخصية
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <InfoItem dark={d} label="الاسم" value={instructor.name} />
            <InfoItem
              dark={d}
              label="رقم الهاتف"
              value={instructor.phone}
              dir="ltr"
            />
            <InfoItem
              dark={d}
              label="الحالة"
              badge
              badgeColor={instructor.status === "active" ? "green" : "yellow"}
              value={
                instructor.status === "active"
                  ? "نشط"
                  : instructor.status || "غير معروف"
              }
            />
            <InfoItem
              dark={d}
              label="رقم المعرف (ID)"
              value={instructor.id}
              mono
            />
          </div>
        </div>
      )}
    </div>
  );
}

function QuickStat({ d, label, value, icon: Icon, color }) {
  return (
    <div
      className={`rounded-xl p-4 ${d ? "bg-[#141625] border border-white/[.06]" : "bg-white border border-gray-100 shadow-sm"}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" style={{ color }} />
        <span
          className={`text-[11px] font-bold ${d ? "text-gray-500" : "text-gray-400"}`}
        >
          {label}
        </span>
      </div>
      <p
        className={`text-2xl font-black ${d ? "text-white" : "text-gray-800"}`}
      >
        {value}
      </p>
    </div>
  );
}

function InfoItem({ dark, label, value, dir, mono, badge, badgeColor }) {
  const colorMap = {
    green: dark
      ? "bg-emerald-500/15 text-emerald-400"
      : "bg-emerald-50 text-emerald-700",
    yellow: dark
      ? "bg-yellow-500/15 text-yellow-400"
      : "bg-yellow-50 text-yellow-700",
  };
  return (
    <div className="flex flex-col gap-1">
      <span
        className={`text-xs font-medium ${dark ? "text-gray-500" : "text-gray-400"}`}
      >
        {label}
      </span>
      {badge ? (
        <span
          className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold w-max ${colorMap[badgeColor]}`}
        >
          {value || "غير متوفر"}
        </span>
      ) : (
        <span
          dir={dir}
          className={`font-semibold text-base ${mono ? "font-mono" : ""} ${dark ? "text-gray-200" : "text-gray-800"}`}
          style={dir === "ltr" ? { textAlign: "right" } : undefined}
        >
          {value || "غير متوفر"}
        </span>
      )}
    </div>
  );
}
