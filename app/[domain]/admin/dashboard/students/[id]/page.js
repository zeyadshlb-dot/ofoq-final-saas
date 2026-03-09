"use client";

import { useState, useEffect } from "react";
import { useTheme, getToken, getSlug } from "../../layout";
import {
  ArrowRight,
  User,
  Phone,
  MonitorSmartphone,
  ShieldAlert,
  ShieldCheck,
  Ban,
  Loader2,
  Trash2,
  AlertCircle,
  GraduationCap,
  CalendarDays,
  Activity,
  UserCheck,
  UserX,
  ClipboardList,
  CheckCircle,
  XCircle,
  TrendingUp,
  BarChart3,
  Award,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
} from "recharts";

export default function StudentProfilePage() {
  const { dark, primaryColor } = useTheme();
  const pc = primaryColor || "#8b5cf6";
  const slug = getSlug();
  const token = getToken();
  const params = useParams();
  const router = useRouter();
  const studentId = params.id;
  const d = dark;

  const [student, setStudent] = useState(null);
  const [stages, setStages] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registerFields, setRegisterFields] = useState([]);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeletingDevice, setIsDeletingDevice] = useState(null);
  const [progress, setProgress] = useState([]);

  // Exam data
  const [exams, setExams] = useState([]);
  const [examResults, setExamResults] = useState({});
  const [examsLoading, setExamsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [slug, studentId]);
  useEffect(() => {
    fetchExamData();
  }, [slug, studentId]);

  const fetchProfile = async () => {
    if (slug === "main" || !token) return;
    try {
      setLoading(true);
      const stagesRes = await fetch(`/api/v1/stages?slug=${slug}`);
      if (stagesRes.ok) {
        const stagesData = await stagesRes.json();
        setStages(
          Array.isArray(stagesData) ? stagesData : stagesData?.data || [],
        );
      }

      const layoutRes = await fetch(`/api/v1/tenants/layout?slug=${slug}`);
      if (layoutRes.ok) {
        const layoutData = await layoutRes.json();
        setRegisterFields(layoutData?.data?.["register-fields"] || []);
      }

      const studentsRes = await fetch(`/api/v1/students?slug=${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!studentsRes.ok) throw new Error("فشل جلب بيانات الطلاب");
      const studentsData = await studentsRes.json();
      const allStudents = Array.isArray(studentsData)
        ? studentsData
        : studentsData?.data || [];
      const foundStudent = allStudents.find(
        (s) => s.id.toString() === studentId,
      );
      if (!foundStudent) throw new Error("الطالب غير موجود");
      setStudent(foundStudent);

      const devicesRes = await fetch(
        `/api/v1/students/devices?student_id=${studentId}&slug=${slug}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (devicesRes.ok) setDevices(await devicesRes.json());

      const progressRes = await fetch(
        `/api/v1/students/${studentId}/progress?slug=${slug}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (progressRes.ok) {
        setProgress(await progressRes.json());
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchExamData = async () => {
    if (slug === "main" || !token) return;
    setExamsLoading(true);
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
      const examsData = await safeJson(`/api/v1/exams?slug=${slug}`);
      const allExams = Array.isArray(examsData) ? examsData : [];
      setExams(allExams);

      const results = {};
      for (const exam of allExams.slice(0, 20)) {
        const result = await safeJson(`/api/v1/exams/${exam.id}/results`);
        if (result) results[exam.id] = result;
      }
      setExamResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setExamsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!student) return;
    setIsUpdatingStatus(true);
    const newStatus = student.status === "active" ? "suspended" : "active";
    try {
      const data = new FormData();
      data.append("slug", slug);
      data.append("status", newStatus);
      const res = await fetch(`/api/v1/students/${studentId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      if (!res.ok) throw new Error("فشل تحديث حالة الطالب");
      setStudent({ ...student, status: newStatus });
    } catch (err) {
      alert(err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleRemoveDevice = async (deviceId) => {
    if (
      !window.confirm(
        "حذف هذا الجهاز سيسمح للطالب بالدخول من جهاز جديد. المتابعة؟",
      )
    )
      return;
    setIsDeletingDevice(deviceId);
    try {
      const res = await fetch(
        `/api/v1/students/devices/${deviceId}?slug=${slug}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error("فشل إزالة الجهاز");
      setDevices((prev) => prev.filter((d) => d.id !== deviceId));
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeletingDevice(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2
          className="w-16 h-16 animate-spin mb-4"
          style={{ color: pc }}
        />
        <p className={`font-bold ${d ? "text-gray-400" : "text-gray-500"}`}>
          جاري جلب الملف الشخصي...
        </p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
        <h2
          className={`text-2xl font-black mb-2 ${d ? "text-white" : "text-gray-900"}`}
        >
          {error || "طالب غير معروف"}
        </h2>
        <button
          onClick={() => router.back()}
          className="mt-8 px-8 py-3 rounded-xl font-bold text-white shadow-xl hover:-translate-y-1 transition-all"
          style={{ backgroundColor: pc }}
        >
          العودة للقائمة
        </button>
      </div>
    );
  }

  const stageName =
    stages.find((s) => s.id === student.educational_stage_id)?.name ||
    "مرحلة غير معروفة";

  let parsedCustomData = {};
  try {
    if (
      student.custom_data &&
      student.custom_data !== "{}" &&
      student.custom_data !== "null"
    ) {
      parsedCustomData = JSON.parse(student.custom_data);
    }
  } catch (e) {
    console.error("Failed to parse student custom data", e);
  }

  // ─── Student exam attempts ───
  const studentAttempts = [];
  Object.entries(examResults).forEach(([examId, result]) => {
    const attempts =
      result?.results || result?.data?.results || result?.attempts || [];
    if (!Array.isArray(attempts)) return;
    attempts.forEach((att) => {
      if (
        att.student_id?.toString() === studentId ||
        att.StudentID?.toString() === studentId
      ) {
        const exam = exams.find((e) => e.id.toString() === examId.toString());
        studentAttempts.push({
          ...att,
          examTitle: exam?.title || "امتحان",
          examId,
        });
      }
    });
  });

  const totalAttempts = studentAttempts.length;
  const avgScore =
    totalAttempts > 0
      ? Math.round(
          studentAttempts.reduce((a, att) => a + (att.percentage || 0), 0) /
            totalAttempts,
        )
      : 0;
  const passedAttempts = studentAttempts.filter((a) => a.passed).length;
  const failedAttempts = totalAttempts - passedAttempts;
  const passRate =
    totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;
  const bestScore =
    totalAttempts > 0
      ? Math.max(...studentAttempts.map((a) => a.score || 0))
      : 0;

  // Chart: scores per exam
  const examScoresChart = studentAttempts.map((att, i) => ({
    name: att.examTitle?.substring(0, 12) || `#${i + 1}`,
    الدرجة: att.percentage || att.score || 0,
  }));

  // Pie
  const pieData = [
    { name: "ناجح", value: passedAttempts, color: "#22c55e" },
    { name: "راسب", value: failedAttempts, color: "#ef4444" },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* ═══ Header ═══ */}
      <div
        className={`relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 ${d ? "bg-[#141625]/80 border border-white/5" : "bg-white border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]"}`}
      >
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[150px] opacity-20 pointer-events-none"
          style={{ backgroundColor: pc, transform: "translate(30%, -30%)" }}
        />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 flex-1 text-center md:text-right">
            <div className="relative">
              <div
                className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] flex items-center justify-center font-black text-6xl shadow-2xl uppercase border-4 border-white/10"
                style={{ backgroundColor: `${pc}20`, color: pc }}
              >
                {student.name.charAt(0)}
              </div>
              <div className="absolute -bottom-3 -right-3 md:-right-5 md:-bottom-2">
                {student.status === "active" ? (
                  <div
                    className="bg-emerald-500 text-white p-2.5 rounded-xl shadow-lg border-2"
                    style={{ borderColor: d ? "#141625" : "#fff" }}
                  >
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                ) : (
                  <div
                    className="bg-red-500 text-white p-2.5 rounded-xl shadow-lg border-2"
                    style={{ borderColor: d ? "#141625" : "#fff" }}
                  >
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                )}
              </div>
            </div>
            {/* ═══ Exams History List ═══ */}
            <div
              className={`mt-6 rounded-2xl p-6 ${d ? "bg-[#141625] border border-white/[.06]" : "bg-white border border-gray-100 shadow-sm"}`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-500/10">
                  <BarChart3 className="w-5 h-5 text-violet-500" />
                </div>
                <div>
                  <h3
                    className={`font-black text-lg ${d ? "text-white" : "text-gray-800"}`}
                  >
                    سجل الامتحانات (المحاولات)
                  </h3>
                  <p
                    className={`text-xs font-bold ${d ? "text-gray-500" : "text-gray-400"}`}
                  >
                    تفاصيل المحاولات لكل الامتحانات المسجلة
                  </p>
                </div>
              </div>

              {studentAttempts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studentAttempts.map((att, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border flex flex-col justify-between ${
                        att.passed
                          ? d
                            ? "bg-emerald-500/5 border-emerald-500/20"
                            : "bg-emerald-50 border-emerald-100"
                          : d
                            ? "bg-red-500/5 border-red-500/20"
                            : "bg-red-50 border-red-100"
                      }`}
                    >
                      <div>
                        <h4
                          className={`font-bold text-sm mb-1 line-clamp-1 ${d ? "text-white" : "text-gray-800"}`}
                        >
                          {att.examTitle}
                        </h4>
                        <div
                          className={`flex items-center gap-2 text-xs font-bold ${d ? "text-gray-400" : "text-gray-500"}`}
                        >
                          <span>
                            تسليم:{" "}
                            {new Date(
                              att.submitted_at || att.started_at,
                            ).toLocaleString("ar-EG")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4 border-t pt-3 dark:border-white/5">
                        <span
                          className={`text-xl font-black ${att.passed ? "text-emerald-500" : "text-red-500"}`}
                        >
                          {att.percentage || att.score || 0}%
                        </span>
                        <div
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 ${
                            att.passed
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {att.passed ? "ناجح" : "راسب"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10">
                  {examsLoading ? (
                    <Loader2
                      className="w-8 h-8 animate-spin"
                      style={{ color: pc }}
                    />
                  ) : (
                    <p
                      className={`text-sm font-bold ${d ? "text-gray-500" : "text-gray-400"}`}
                    >
                      لم يقم الطالب بأي محاولات امتحانات بعد.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="h-20" />
            <div className="pt-2">
              <h1
                className={`text-4xl md:text-5xl font-black mb-4 tracking-tight ${d ? "text-white" : "text-gray-900"}`}
              >
                {student.name}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-5 mt-4">
                <div
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm ${d ? "bg-white/5 text-gray-300" : "bg-gray-100 text-gray-700"}`}
                >
                  <Phone className="w-4 h-4 text-gray-500" /> {student.phone}
                </div>
                <div
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm ${d ? "bg-white/5 text-gray-300" : "bg-gray-100 text-gray-700"}`}
                >
                  <GraduationCap className="w-4 h-4 text-gray-500" />{" "}
                  {stageName}
                </div>
                <div
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm ${d ? "bg-white/5 text-gray-300" : "bg-gray-100 text-gray-700"}`}
                >
                  <CalendarDays className="w-4 h-4 text-gray-500" /> مسجل من:{" "}
                  {new Date(
                    student.CreatedAt || student.created_at,
                  ).toLocaleDateString("ar-EG")}
                </div>
              </div>
            </div>
          </div>
          <div className="shrink-0 flex flex-col gap-3 min-w-[200px]">
            <button
              onClick={handleUpdateStatus}
              disabled={isUpdatingStatus}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-black text-white transition-all shadow-xl hover:-translate-y-1 hover:scale-105 active:scale-95 disabled:opacity-50 ${student.status === "active" ? "bg-red-500 hover:bg-red-600" : "bg-emerald-500 hover:bg-emerald-600"}`}
            >
              {isUpdatingStatus ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : student.status === "active" ? (
                <>
                  <UserX className="w-5 h-5" />
                  <span>إيقاف الحساب</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-5 h-5" />
                  <span>تفعيل الحساب</span>
                </>
              )}
            </button>
            <Link
              href="/dashboard/students"
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold transition-all border-2 ${d ? "border-white/10 text-white hover:bg-white/5" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
            >
              <ArrowRight className="w-5 h-5" /> رجوع للطلاب
            </Link>
          </div>
        </div>
      </div>

      {/* ═══ Exam Summary Cards ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          d={d}
          label="عدد المحاولات"
          value={totalAttempts}
          icon={ClipboardList}
          color="#8b5cf6"
        />
        <StatCard
          d={d}
          label="متوسط الدرجات"
          value={`${avgScore}%`}
          icon={Activity}
          color="#3b82f6"
        />
        <StatCard
          d={d}
          label="نسبة النجاح"
          value={`${passRate}%`}
          icon={TrendingUp}
          color="#10b981"
        />
        <StatCard
          d={d}
          label="أعلى درجة"
          value={`${bestScore}%`}
          icon={Award}
          color="#f59e0b"
        />
        <StatCard
          d={d}
          label="ناجح / راسب"
          value={`${passedAttempts} / ${failedAttempts}`}
          icon={BarChart3}
          color="#ec4899"
        />
      </div>

      {/* ═══ Charts Row ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scores bar chart */}
        <div
          className={`lg:col-span-2 rounded-2xl p-6 ${d ? "bg-[#141625] border border-white/[.06]" : "bg-white border border-gray-100 shadow-sm"}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-500/10">
              <BarChart3 className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <h3
                className={`font-black ${d ? "text-white" : "text-gray-800"}`}
              >
                درجات الامتحانات
              </h3>
              <p
                className={`text-xs font-bold ${d ? "text-gray-500" : "text-gray-400"}`}
              >
                درجة الطالب في كل امتحان حاول فيه
              </p>
            </div>
          </div>
          <div className="h-[280px]">
            {examScoresChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={examScoresChart}
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
                  <Bar dataKey="الدرجة" radius={[8, 8, 0, 0]}>
                    {examScoresChart.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={(entry.الدرجة || 0) >= 50 ? "#22c55e" : "#ef4444"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                {examsLoading ? (
                  <Loader2
                    className="w-8 h-8 animate-spin"
                    style={{ color: pc }}
                  />
                ) : (
                  <p
                    className={`text-sm font-bold ${d ? "text-gray-600" : "text-gray-300"}`}
                  >
                    لم يدخل هذا الطالب أي امتحان بعد
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Pie */}
        <div
          className={`rounded-2xl p-6 flex flex-col ${d ? "bg-[#141625] border border-white/[.06]" : "bg-white border border-gray-100 shadow-sm"}`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/10">
              <Activity className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className={`font-black ${d ? "text-white" : "text-gray-800"}`}>
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

      {/* ═══ Detailed Exam Attempts Table ═══ */}
      {studentAttempts.length > 0 && (
        <div
          className={`rounded-2xl p-6 ${d ? "bg-[#141625] border border-white/[.06]" : "bg-white border border-gray-100 shadow-sm"}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/10">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3
                className={`font-black ${d ? "text-white" : "text-gray-800"}`}
              >
                تفاصيل محاولات الامتحانات
              </h3>
              <p
                className={`text-xs font-bold ${d ? "text-gray-500" : "text-gray-400"}`}
              >
                كل محاولة قدمها الطالب مع الدرجة والحالة
              </p>
            </div>
          </div>
          <div
            className={`rounded-xl overflow-hidden border ${d ? "border-white/5" : "border-gray-100"}`}
          >
            <div
              className={`grid grid-cols-12 gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider ${d ? "bg-white/5 text-gray-500" : "bg-gray-50 text-gray-400"}`}
            >
              <div className="col-span-4">الامتحان</div>
              <div className="col-span-2 text-center">الدرجة</div>
              <div className="col-span-2 text-center">الحالة</div>
              <div className="col-span-2 text-center">الوقت</div>
              <div className="col-span-2 text-center">التاريخ</div>
            </div>
            {studentAttempts.map((att, i) => {
              const passed = (att.score || 0) >= (att.passing_score || 50);
              const duration = att.duration_seconds
                ? `${Math.round(att.duration_seconds / 60)} دقيقة`
                : att.time_taken || "—";
              const date = att.submitted_at || att.created_at || att.CreatedAt;
              return (
                <div
                  key={i}
                  className={`grid grid-cols-12 gap-2 px-4 py-3.5 text-sm border-t transition-colors ${d ? "border-white/5 hover:bg-white/5" : "border-gray-50 hover:bg-gray-50"}`}
                >
                  <div
                    className={`col-span-4 font-bold truncate ${d ? "text-white" : "text-gray-800"}`}
                  >
                    {att.examTitle}
                  </div>
                  <div className="col-span-2 text-center">
                    <span
                      className={`font-mono font-black px-2.5 py-1 rounded-lg text-xs ${passed ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}
                    >
                      {att.score || 0}%
                    </span>
                  </div>
                  <div className="col-span-2 text-center">
                    {passed ? (
                      <span className="flex items-center justify-center gap-1 text-xs font-bold text-emerald-500">
                        <CheckCircle className="w-3.5 h-3.5" /> ناجح
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1 text-xs font-bold text-red-500">
                        <XCircle className="w-3.5 h-3.5" /> راسب
                      </span>
                    )}
                  </div>
                  <div
                    className={`col-span-2 text-center text-xs font-bold ${d ? "text-gray-500" : "text-gray-400"}`}
                  >
                    {duration}
                  </div>
                  <div
                    className={`col-span-2 text-center text-xs font-bold ${d ? "text-gray-500" : "text-gray-400"}`}
                  >
                    {date ? new Date(date).toLocaleDateString("ar-EG") : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ Analytics & Layout split ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Balance + Info */}
        <div className="lg:col-span-1 space-y-8">
          <div
            className={`rounded-3xl p-6 ${d ? "bg-[#141625] border border-white/5" : "bg-white border border-gray-100 shadow-sm"}`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-yellow-500/10 text-yellow-500">
                <Activity className="w-5 h-5" />
              </div>
              <h3
                className={`font-black text-xl ${d ? "text-white" : "text-gray-900"}`}
              >
                رصيد المحفظة
              </h3>
            </div>
            <div
              className="text-center py-6 border-2 border-dashed rounded-2xl"
              style={{ borderColor: d ? "rgba(255,255,255,0.1)" : "#e5e7eb" }}
            >
              <span
                className={`text-4xl font-black ${d ? "text-white" : "text-gray-900"} block`}
              >
                {student.balance || 0} جنية
              </span>
              <span
                className={`text-sm mt-2 block font-bold ${d ? "text-gray-500" : "text-gray-400"}`}
              >
                الرصيد المتاح من الكروت
              </span>
            </div>
          </div>

          <div
            className={`rounded-3xl p-6 ${d ? "bg-[#141625] border border-white/5" : "bg-white border border-gray-100 shadow-sm"}`}
          >
            <h3
              className={`font-black text-xl mb-6 ${d ? "text-white" : "text-gray-900"}`}
            >
              معلومات النظام
            </h3>
            <div className="space-y-4">
              <div
                className={`p-4 rounded-2xl ${d ? "bg-white/5" : "bg-gray-50"}`}
              >
                <p
                  className={`text-xs font-bold uppercase tracking-wider mb-1 ${d ? "text-gray-500" : "text-gray-400"}`}
                >
                  معرف الطالب
                </p>
                <p
                  className={`font-mono text-sm font-bold ${d ? "text-white" : "text-gray-900"}`}
                >
                  #{student.id.toString().padStart(6, "0")}
                </p>
              </div>
            </div>
          </div>
          {registerFields.length > 0 &&
            Object.keys(parsedCustomData).length > 0 && (
              <div
                className={`p-4 rounded-2xl md:col-span-1 border ${d ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"}`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <FileText
                    className={`w-4 h-4 ${d ? "text-gray-400" : "text-gray-500"}`}
                  />
                  <p
                    className={`text-xs font-black uppercase tracking-wider ${d ? "text-gray-300" : "text-gray-700"}`}
                  >
                    البيانات الإضافية (مخصصة)
                  </p>
                </div>

                <div className="space-y-4">
                  {registerFields.map((field, idx) => {
                    const val = parsedCustomData[field.name];
                    if (!val) return null;

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl ${d ? "bg-[#141625]" : "bg-white"} shadow-sm`}
                      >
                        <p
                          className={`text-[11px] font-bold mb-1 ${d ? "text-gray-500" : "text-gray-400"}`}
                        >
                          {field.label}
                        </p>
                        {field.type === "image" ? (
                          <a
                            href={val}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={val}
                              alt={field.label}
                              className="w-20 h-20 object-cover rounded-lg border border-dashed hover:scale-105 transition-transform"
                              style={{ borderColor: pc }}
                            />
                          </a>
                        ) : (
                          <p
                            className={`text-sm font-bold ${d ? "text-gray-200" : "text-gray-800"}`}
                          >
                            {val}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
        </div>

        {/* Right: Devices */}
        <div className="lg:col-span-2 space-y-8">
          <div
            className={`rounded-3xl p-6 md:p-8 ${d ? "bg-[#141625] border border-white/5" : "bg-white border border-gray-100 shadow-sm"}`}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                  style={{
                    background: `linear-gradient(to bottom right, ${pc}, ${pc}90)`,
                  }}
                >
                  <MonitorSmartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3
                    className={`font-black text-2xl ${d ? "text-white" : "text-gray-900"}`}
                  >
                    الأجهزة المعتمدة
                  </h3>
                  <p
                    className={`text-sm font-bold mt-1 ${d ? "text-gray-400" : "text-gray-500"}`}
                  >
                    إدارة ومراقبة أجهزة تسجيل الدخول
                  </p>
                </div>
              </div>
              <span
                className={`px-4 py-2 rounded-xl font-bold text-sm ${d ? "bg-white/10 text-white" : "bg-gray-100 text-gray-900"}`}
              >
                {devices.length} أجهزة
              </span>
            </div>

            {devices.length === 0 ? (
              <div
                className={`text-center py-12 border-2 border-dashed rounded-2xl ${d ? "border-white/10 bg-white/5" : "border-gray-200 bg-gray-50"}`}
              >
                <MonitorSmartphone
                  className={`w-12 h-12 mx-auto mb-4 ${d ? "text-gray-600" : "text-gray-300"}`}
                />
                <h4
                  className={`text-lg font-bold mb-2 ${d ? "text-gray-300" : "text-gray-700"}`}
                >
                  لم يتم تسجيل أي أجهزة بعد
                </h4>
                <p
                  className={`text-sm ${d ? "text-gray-500" : "text-gray-400"}`}
                >
                  سيظهر هنا الجهاز بمجرد تسجيل الطالب دخوله لأول مرة.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className={`group flex flex-col justify-between p-5 rounded-2xl border-2 transition-all hover:border-red-200 ${d ? "bg-black/20 border-white/5 hover:bg-black/40" : "bg-white border-gray-100 hover:shadow-lg shadow-sm"}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${d ? "bg-white/10 text-gray-300" : "bg-gray-100 text-gray-600"}`}
                        >
                          {device.device_type || "جهاز"}
                        </span>
                        <MonitorSmartphone
                          className={`w-5 h-5 ${d ? "text-gray-500" : "text-gray-400"}`}
                        />
                      </div>
                      <h4
                        className={`text-lg font-black truncate mb-1 ${d ? "text-gray-200" : "text-gray-900"}`}
                        title={device.device_name}
                      >
                        {device.device_name || "جهاز غير معروف"}
                      </h4>
                      <p
                        className={`text-xs font-mono truncate mb-4 ${d ? "text-gray-500" : "text-gray-400"}`}
                        title={device.device_fingerprint}
                      >
                        ID: {device.device_fingerprint}
                      </p>
                      <p
                        className={`text-xs font-bold flex flex-col gap-1 ${d ? "text-gray-400" : "text-gray-500"}`}
                      >
                        <span>آخر تسجيل دخول:</span>
                        <span className={d ? "text-white" : "text-gray-900"}>
                          {device.last_login_at
                            ? new Date(device.last_login_at).toLocaleString(
                                "ar-EG",
                              )
                            : "غير مسجل"}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveDevice(device.id)}
                      disabled={isDeletingDevice === device.id}
                      className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                    >
                      {isDeletingDevice === device.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Ban className="w-4 h-4" />
                      )}
                      إزالة وعمل Logout للجهاز
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Video Progress Stats ═══ */}
      <div
        className={`mt-6 rounded-2xl p-6 ${d ? "bg-[#141625] border border-white/[.06]" : "bg-white border border-gray-100 shadow-sm"}`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/10">
            <MonitorSmartphone className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3
              className={`font-black text-lg ${d ? "text-white" : "text-gray-800"}`}
            >
              متابعة الدروس (الفيديوهات)
            </h3>
            <p
              className={`text-xs font-bold ${d ? "text-gray-500" : "text-gray-400"}`}
            >
              تفاصيل مشاهدة الطالب للدروس
            </p>
          </div>
        </div>

        {progress && progress.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {progress.map((p, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  p.is_completed
                    ? d
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : "bg-emerald-50 border-emerald-100"
                    : d
                      ? "bg-white/5 border-white/5"
                      : "bg-gray-50 border-gray-100"
                }`}
              >
                <div>
                  <h4
                    className={`font-bold text-sm mb-1 ${d ? "text-white" : "text-gray-800"}`}
                  >
                    درس رقم #{p.lesson_id}
                  </h4>
                  <div
                    className={`flex items-center gap-2 text-xs font-bold ${d ? "text-gray-400" : "text-gray-500"}`}
                  >
                    <span>
                      ⏱ {Math.floor(p.progress_seconds / 60)} دقيقة و{" "}
                      {p.progress_seconds % 60} ثانية
                    </span>
                  </div>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 ${
                    p.is_completed
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-amber-500/10 text-amber-500"
                  }`}
                >
                  {p.is_completed ? (
                    <>
                      <CheckCircle className="w-4 h-4" /> مكتمل
                    </>
                  ) : (
                    <>
                      <Activity className="w-4 h-4" /> قيد المشاهدة
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40">
            <p
              className={`text-sm font-bold ${d ? "text-gray-600" : "text-gray-300"}`}
            >
              لم يشاهد هذا الطالب أي دروس بعد
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ d, label, value, icon: Icon, color }) {
  return (
    <div
      className={`rounded-xl p-4 transition-all hover:scale-105 ${d ? "bg-[#141625] border border-white/[.06]" : "bg-white border border-gray-100 shadow-sm"}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" style={{ color }} />
        <span
          className={`text-[11px] font-bold ${d ? "text-gray-500" : "text-gray-400"}`}
        >
          {label}
        </span>
      </div>
      <p className={`text-xl font-black ${d ? "text-white" : "text-gray-800"}`}>
        {value}
      </p>
    </div>
  );
}
