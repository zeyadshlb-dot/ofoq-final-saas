"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import Link from "next/link";
import CourseCard from "@/components/CourseCard";
import StudentHeatmap from "./StudentHeatmap";
import QRCode from "react-qr-code";

/* ─── State initialization ─── */
const MOCK_COURSES = [];

function AttendanceRecords() {
  const [records, setRecords] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/v1/attendance/my-records", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("student_token")}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setRecords(data.data || []);
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  return (
    <div className="w-full bg-white dark:bg-[#16181f] rounded-3xl border border-gray-100 dark:border-white/6 p-6 shadow-sm mt-6">
      <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        📋 سجل الحضور والغياب
      </h3>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm font-bold text-gray-400">
            لا توجد سجلات حضور بعد
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {records.map((rec, i) => (
            <div
              key={rec.id || i}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl"
            >
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-sm">
                  {rec.session_name || "جلسة"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5" dir="ltr">
                  {rec.session_date
                    ? new Date(rec.session_date).toLocaleDateString("ar-EG")
                    : ""}
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-black">
                {rec.status === "present" ? "حاضر ✓" : rec.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const TRANSACTIONS = [];

const IconAssignment = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
    />
  </svg>
);

/* ─── Icon Components ─── */
const IconBook = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
);
const IconRefresh = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);
const IconWallet = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  </svg>
);
const IconTask = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
    />
  </svg>
);
const IconVideo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);
const IconSettings = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);
const IconLogout = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);

/* ─── Avatar with Initials ─── */
const UserAvatar = ({ name, size = "lg" }) => {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  const sizeClasses =
    size === "lg" ? "w-20 h-20 text-2xl" : "w-10 h-10 text-base";
  return (
    <div
      className={`${sizeClasses} rounded-2xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center font-black text-white shadow-lg shadow-primary/30 select-none`}
    >
      {initials}
    </div>
  );
};

/* ─── Stat Card ─── */
const StatCard = ({ icon, label, value, color }) => (
  <div
    className={`relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-[#16181f] border border-gray-100 dark:border-white/[0.06] shadow-sm group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}
  >
    <div
      className={`absolute top-0 left-0 w-24 h-24 rounded-full blur-3xl opacity-20 ${color}`}
    />
    <div className="relative z-10 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${color} shadow-md`}
      >
        {icon}
      </div>
      <div>
        <div className="text-2xl font-black text-gray-900 dark:text-white">
          {value}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          {label}
        </div>
      </div>
    </div>
  </div>
);

export default function StudentPanelClient({ theme, domain }) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("courses");
  const [mounted, setMounted] = useState(false);
  const [userData, setUserData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState([]);

  // Exams states
  const [availableExams, setAvailableExams] = useState([]);
  const [examHistory, setExamHistory] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [assignmentSubmitting, setAssignmentSubmitting] = useState(false);
  const [activeAttempt, setActiveAttempt] = useState(null); // When taking an exam
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [examLoading, setExamLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submissionText, setSubmissionText] = useState("");
  const [activeAssignment, setActiveAssignment] = useState(null);

  // Voucher charging states
  const [voucherCode, setVoucherCode] = useState("");
  const [isCharging, setIsCharging] = useState(false);
  const [showVoucherInput, setShowVoucherInput] = useState(false);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
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
          setUserData(data);

          if (data.tenant_id && data.educational_stage_id) {
            try {
              const coursesRes = await fetch(
                `/api/v1/courses?tenant_id=${data.tenant_id}&educational_stage_id=${data.educational_stage_id}`,
              );
              if (coursesRes.ok) {
                const coursesData = await coursesRes.json();
                setCourses(coursesData || []);
              }

              const progressRes = await fetch("/api/v1/lessons/progress", {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (progressRes.ok) {
                setProgressData(await progressRes.json());
              }

              const examsRes = await fetch(
                `/api/v1/exams?slug=${data.tenant_id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                },
              );
              if (examsRes.ok) {
                const examsData = await examsRes.json();
                setAvailableExams(
                  Array.isArray(examsData) ? examsData : examsData?.data || [],
                );
              }

              const historyRes = await fetch("/api/v1/exams/attempts", {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (historyRes.ok) {
                setExamHistory(await historyRes.json());
              }

              const leaderboardRes = await fetch(
                `/api/v1/students/leaderboard?slug=${data.tenant_id}`,
              );
              if (leaderboardRes.ok) {
                setLeaderboard(await leaderboardRes.json());
              }

              const assignmentsRes = await fetch("/api/v1/assignments/my", {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (assignmentsRes.ok) {
                const asData = await assignmentsRes.json();
                setAssignments(asData.data || []);
              }
            } catch (e) {}
          }

          setMounted(true);
        } else {
          toast("انتهت الجلسة، برجاء تسجيل الدخول مجدداً", "error");
          localStorage.removeItem("student_token");
          document.cookie = "student_token=; path=/; max-age=0;";
          router.push("/login");
        }
      } catch (err) {
        toast("خطأ في جلب بيانات الحساب", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router, toast]);

  const handleChargeVoucher = async () => {
    if (!voucherCode.trim()) {
      toast("برجاء إدخال كود الشحن", "error");
      return;
    }

    setIsCharging(true);
    const token = localStorage.getItem("student_token");

    try {
      const res = await fetch("/api/v1/vouchers/charge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: voucherCode.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        toast(`تم شحن المحفظة بنجاح بـ ${data.value} جنيه 🎉`, "success");
        setUserData((prev) => ({
          ...prev,
          balance: prev.balance + data.value,
        }));
        setVoucherCode("");
        setShowVoucherInput(false);
      } else {
        toast(data.error || "كود الشحن غير صالح أو تم استخدامه", "error");
      }
    } catch (err) {
      toast("حدث خطأ أثناء الشحن، حاول مرة أخرى", "error");
    } finally {
      setIsCharging(false);
    }
  };

  const fetchAssignments = async () => {
    setAssignmentLoading(true);
    try {
      const res = await fetch("/api/v1/assignments/my", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("student_token")}`,
        },
      });
      const data = await res.json();
      setAssignments(data.data || []);
    } catch (err) {
      toast("حدث خطأ أثناء تحميل الواجبات", "error");
    } finally {
      setAssignmentLoading(false);
    }
  };

  const submitAssignment = async (e, assignmentId, text, imageFile) => {
    e.preventDefault();
    setAssignmentSubmitting(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        // Use the existing Cloudinary upload logic
        const reader = new FileReader();
        const base64Promise = new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(imageFile);
        });
        const base64Image = await base64Promise;

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64Image, folder: "assignments" }),
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) {
          imageUrl = uploadData.url;
        } else {
          throw new Error("فشل رفع الصورة");
        }
      }

      const res = await fetch("/api/v1/assignments/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("student_token")}`,
        },
        body: JSON.stringify({
          assignment_id: assignmentId,
          answer_text: text || "",
          answer_image: imageUrl,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast("تم تسليم الواجب بنجاح! سيتم مراجعته قريباً.", "success");
        // Update local state so it switches to result view immediately
        setActiveAssignment((prev) => ({
          ...prev,
          submitted: true,
          my_status: "pending",
        }));
        fetchAssignments();
      } else {
        toast(data.message || "حدث خطأ أثناء التسليم", "error");
      }
    } catch (err) {
      toast(err.message || "حدث خطأ", "error");
    } finally {
      setAssignmentSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("student_token");
    document.cookie = "student_token=; path=/; max-age=0;";
    toast("تم تسجيل الخروج بنجاح 👋", "success");
    router.push("/login");
  };

  // ─────────────────────────────────────────────────
  // EXAM ACTIONS
  // ─────────────────────────────────────────────────
  const startExam = async (examId) => {
    setExamLoading(true);
    const token = localStorage.getItem("student_token");
    try {
      const res = await fetch("/api/v1/exams/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ exam_id: examId }),
      });
      const data = await res.json();
      if (res.ok) {
        setActiveAttempt(data);
        setCurrentQuestionIndex(0);
      } else {
        toast(data.error || "لا يمكن بدء هذا الامتحان", "error");
      }
    } catch (err) {
      toast("حدث خطأ", "error");
    } finally {
      setExamLoading(false);
    }
  };

  const submitAnswer = async (questionId, answerVal) => {
    if (!activeAttempt) return;
    const token = localStorage.getItem("student_token");

    // Optimistic update
    const updatedQs = [...activeAttempt.questions];
    const qIdx = updatedQs.findIndex((q) => q.id === questionId);
    if (qIdx > -1) {
      updatedQs[qIdx].student_answer = {
        answer_text: answerVal,
        answer_json:
          typeof answerVal === "string" ? "" : JSON.stringify(answerVal),
      };
      setActiveAttempt({ ...activeAttempt, questions: updatedQs });
    }

    try {
      const body = {
        attempt_id: activeAttempt.attempt_id,
        question_id: questionId,
        answer_text: typeof answerVal === "string" ? answerVal : "",
        answer_json:
          typeof answerVal === "string" ? "" : JSON.stringify(answerVal),
      };
      await fetch("/api/v1/exams/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      console.error("Failed to save answer", err);
    }
  };

  const submitExam = async () => {
    if (!confirm("هل أنت متأكد من تسليم الامتحان والتصحيح؟")) return;
    setExamLoading(true);
    const token = localStorage.getItem("student_token");
    try {
      const res = await fetch("/api/v1/exams/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ attempt_id: activeAttempt.attempt_id }),
      });
      const data = await res.json();
      if (res.ok) {
        toast(
          `تم تسليم الامتحان النتيجة: ${data.passed ? "نجاح" : "رسوب"} (${data.percentage}%)`,
          "success",
        );
        setActiveAttempt(null);
        // Refresh history
        const historyRes = await fetch("/api/v1/exams/attempts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (historyRes.ok) {
          setExamHistory(await historyRes.json());
        }
      } else {
        toast(data.error || "خطأ في تسليم الامتحان", "error");
      }
    } catch (err) {
      toast("حدث خطأ", "error");
    } finally {
      setExamLoading(false);
    }
  };

  const idCardRef = useRef(null);

  const handleDownloadIdCard = async (format) => {
    const cardElement = idCardRef.current;
    if (!cardElement) {
      toast("لم يتم إيجاد عنصر البطاقة", "error");
      return;
    }

    try {
      const htmlToImage = await import("html-to-image");

      const options = {
        quality: 1,
        pixelRatio: 3,
        skipFonts: true,
        fetchRequestInit: { mode: "no-cors" },
        filter: (node) => {
          // Skip external images that may fail to load
          if (
            node.tagName === "IMG" &&
            node.src &&
            !node.src.startsWith("data:") &&
            !node.src.startsWith(window.location.origin)
          ) {
            return false;
          }
          return true;
        },
      };

      if (format === "png") {
        const dataUrl = await htmlToImage.toPng(cardElement, options);
        const link = document.createElement("a");
        link.download = `smart_id_${user.id || "card"}.png`;
        link.href = dataUrl;
        link.click();
        toast("تم تحميل البطاقة بنجاح", "success");
      } else if (format === "pdf") {
        const { jsPDF } = await import("jspdf");
        const dataUrl = await htmlToImage.toPng(cardElement, options);
        const pdf = new jsPDF("p", "mm", "a5");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight =
          (cardElement.offsetHeight * pdfWidth) / cardElement.offsetWidth;
        const yOffset = (pdf.internal.pageSize.getHeight() - pdfHeight) / 2;
        pdf.addImage(dataUrl, "PNG", 0, yOffset, pdfWidth, pdfHeight);
        pdf.save(`smart_id_${user.id || "card"}.pdf`);
        toast("تم تحميل البطاقة بنجاح", "success");
      }
    } catch (err) {
      console.error("ID card download error:", err);
      toast("حدث خطأ أثناء تحميل البطاقة", "error");
    }
  };

  if (loading || !mounted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Fallback for missing data
  const user = userData || {};
  const gradeDisplay = user.stage_id
    ? `المرحلة ${user.stage_id}`
    : user.grade || "مرحلة دراسية";
  const joinedDateDisplay = user.CreatedAt
    ? new Date(user.CreatedAt).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
      })
    : "";

  const tabs = [
    { id: "courses", label: "كورساتي", icon: <IconBook /> },
    { id: "progress", label: "متابعة الدروس", icon: <IconVideo /> },
    { id: "wallet", label: "المحفظة", icon: <IconWallet /> },
    { id: "assignments", label: "الواجبات", icon: <IconAssignment /> },
    { id: "exams", label: "الامتحانات", icon: <IconTask /> },
    {
      id: "leaderboard",
      label: "لوحة الشرف",
      icon: <span className="text-xl">🏆</span>,
    },
    {
      id: "id_card",
      label: "البطاقة الذكية",
      icon: <span className="text-xl">🪪</span>,
    },
    { id: "settings", label: "الإعدادات", icon: <IconSettings /> },
  ];

  return (
    <div
      className="min-h-[calc(100vh-144px)] bg-[#f4f6fb] dark:bg-[#0d0f14] pb-20"
      dir="rtl"
    >
      {/* ─── HERO BANNER ─── */}
      <div className="relative bg-gradient-to-l from-primary via-primary/90 to-secondary overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-[-60px] right-[-60px] w-80 h-80 rounded-full bg-white/5 border border-white/10" />
          <div className="absolute top-[20px] right-[100px] w-40 h-40 rounded-full bg-white/5 border border-white/10" />
          <div className="absolute bottom-[-80px] left-[-40px] w-64 h-64 rounded-full bg-black/10" />
          <div className="absolute top-[10px] left-[200px] w-2 h-2 rounded-full bg-white/40" />
          <div className="absolute top-[50px] left-[350px] w-3 h-3 rounded-full bg-white/20" />
          <div className="absolute top-[30px] left-[500px] w-1.5 h-1.5 rounded-full bg-secondary/60" />
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.04]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="white"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-28">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <UserAvatar name={user.name || "طالب"} size="lg" />

            {/* Info */}
            <div className="text-center sm:text-right flex-1 text-white">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="text-xs bg-secondary/30 text-secondary border border-secondary/40 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                  {user.status === "active" ? "طالب نشط ✦" : "حساب موقوف"}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black mb-3 leading-tight">
                {user.name}
              </h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <span className="flex items-center gap-1.5 text-sm text-white/70 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block" />
                  {user.phone}
                </span>
                <span className="text-white/30">|</span>
                <span className="flex items-center gap-1.5 text-sm text-white/70 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block" />
                  {gradeDisplay}
                </span>
                <span className="text-white/30">|</span>
                <span className="flex items-center gap-1.5 text-sm text-white/70 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block" />
                  انضم {joinedDateDisplay}
                </span>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold transition-all text-sm backdrop-blur-sm group shrink-0"
            >
              <IconLogout />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 space-y-6">
        {/* ─── Stats Row ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon="🔥"
            label="أيام النشاط"
            value={(() => {
              const dates = new Set(
                progressData.map((p) => {
                  const d = new Date(p.updated_at || p.UpdatedAt);
                  return d.toISOString().split("T")[0];
                }),
              );
              return dates.size;
            })()}
            color="from-orange-400 to-red-400"
          />
          <StatCard
            icon="📚"
            label="دروس مكتملة"
            value={
              progressData.filter((p) => p.is_completed || p.IsCompleted).length
            }
            color="from-blue-400 to-cyan-400"
          />
          <StatCard
            icon="⭐"
            label="نقاط مكتسبة"
            value={
              progressData.filter((p) => p.is_completed || p.IsCompleted)
                .length * 10
            }
            color="from-amber-400 to-yellow-300"
          />
          <StatCard
            icon="💰"
            label="رصيد المحفظة"
            value={`${user.balance !== undefined ? user.balance : 0} ج`}
            color="from-green-400 to-emerald-400"
          />
        </div>

        {/* ─── Tabs Navigation ─── */}
        <div className="bg-white dark:bg-[#16181f] rounded-2xl p-1.5 shadow-sm border border-gray-100 dark:border-white/[0.06] flex overflow-x-auto hide-scroll gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-xl transition-all duration-200 whitespace-nowrap flex-1 justify-center font-bold text-sm
                ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-800 dark:hover:text-white"
                }`}
            >
              <span
                className={
                  activeTab === tab.id
                    ? "text-white"
                    : "text-gray-400 dark:text-gray-500"
                }
              >
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── TAB CONTENT ─── */}
        <div
          key={activeTab}
          style={{ animation: "fadeSlideUp 0.35s ease-out" }}
        >
          {/* ══ COURSES TAB ══ */}
          {activeTab === "courses" &&
            (() => {
              const subscribedCourses = courses.filter((c) =>
                user.enrolled_course_ids?.includes(c.id),
              );
              const unsubscribedCourses = courses.filter(
                (c) => !user.enrolled_course_ids?.includes(c.id),
              );

              return (
                <div className="space-y-10">
                  {/* My Courses */}
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white">
                          كورساتي المشترك فيها
                        </h2>
                        <span className="bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full font-bold border border-primary/20">
                          {subscribedCourses.length} كورس
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {subscribedCourses.length === 0 ? (
                        <div className="col-span-full py-8 text-center text-gray-500 font-bold bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
                          لا يوجد كورسات مشترك بها حالياً
                        </div>
                      ) : (
                        subscribedCourses.map((course) => (
                          <div key={course.id} className="w-full flex h-full">
                            <CourseCard
                              course={{
                                id: course.id,
                                title: course.title,
                                description: course.description,
                                image:
                                  course.full_image_url || "/placeholder.png",
                                isPinned: course.order_index === 1,
                                price:
                                  course.pricing_type === "paid"
                                    ? course.discount_price > 0 &&
                                      course.discount_price < course.price
                                      ? course.discount_price
                                      : course.price
                                    : 0,
                                startDate: "متاح الآن",
                                endDate: "غير محدد",
                                isSubscribed: true,
                              }}
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Unsubscribed Courses */}
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white">
                          كورسات متاحة لمرحلتك
                        </h2>
                        <span className="bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 text-xs px-2.5 py-1 rounded-full font-bold">
                          {unsubscribedCourses.length} كورس
                        </span>
                      </div>
                      <Link
                        href="/courses"
                        className="flex items-center gap-1 text-primary hover:text-primary/80 font-bold text-sm transition-colors"
                      >
                        استكشف المزيد
                        <span className="text-lg leading-none">»</span>
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {unsubscribedCourses.length === 0 ? (
                        <div className="col-span-full py-8 text-center text-gray-500 font-bold bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
                          لا يوجد كورسات أخرى متاحة حالياً
                        </div>
                      ) : (
                        unsubscribedCourses.map((course) => (
                          <div key={course.id} className="w-full flex h-full">
                            <CourseCard
                              course={{
                                id: course.id,
                                title: course.title,
                                description: course.description,
                                image:
                                  course.full_image_url || "/placeholder.png",
                                isPinned: course.order_index === 1,
                                price:
                                  course.pricing_type === "paid"
                                    ? course.discount_price > 0 &&
                                      course.discount_price < course.price
                                      ? course.discount_price
                                      : course.price
                                    : 0,
                                startDate: "متاح الآن",
                                endDate: "غير محدد",
                                isSubscribed: false,
                              }}
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

          {/* ══ PROGRESS TAB ══ */}
          {activeTab === "progress" && (
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-500">
                  <IconVideo />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">
                    متابعة الفيديوهات والدروس
                  </h2>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                    تابع تقدمك وتحليلات نشاطك في مسيرتك التعليمية
                  </p>
                </div>
              </div>

              {/* Heatmap Section */}
              <StudentHeatmap
                progressData={progressData}
                dark={true}
                primaryColor={theme.primaryColor || "#f43f5e"}
              />

              <div className="pt-4">
                <h3 className="text-lg font-black mb-5">تفصيل الدروس:</h3>
              </div>

              {progressData && progressData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {progressData.map((p, idx) => (
                    <div
                      key={idx}
                      className={`p-5 rounded-2xl border flex flex-col gap-3 justify-between shadow-sm transition-all hover:shadow-md ${
                        p.is_completed
                          ? "bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20"
                          : "bg-white dark:bg-[#16181f] border-gray-100 dark:border-white/[0.06]"
                      }`}
                    >
                      <div>
                        <h4 className="font-black text-base mb-1 text-gray-900 dark:text-white">
                          درس رقم #{p.lesson_id}
                        </h4>
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400">
                          <span>
                            ⏱ شاهدت: {Math.floor(p.progress_seconds / 60)} دقيقة
                            و {p.progress_seconds % 60} ثانية
                          </span>
                        </div>
                      </div>
                      <div
                        className={`self-start px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 ${
                          p.is_completed
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {p.is_completed ? <>مكتمل 🚀</> : <>قيد المشاهدة ⏳</>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10 text-center">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center mb-6">
                    <IconVideo className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                    لا توجد سجلات مشاهدة
                  </h3>
                  <p className="text-gray-500 font-bold max-w-sm">
                    يبدو أنك لم تبدأ بمشاهدة أي من الدروس بعد، ابدأ الآن رحلتك
                    التعليمية!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ══ WALLET TAB ══ */}
          {activeTab === "wallet" && (
            <div className="max-w-2xl mx-auto space-y-5">
              {/* Balance Card */}
              <div className="relative bg-gradient-to-l from-primary to-secondary rounded-3xl p-8 text-white overflow-hidden shadow-2xl shadow-primary/30">
                <div className="absolute inset-0">
                  <div className="absolute top-[-40px] left-[-40px] w-48 h-48 rounded-full border-[30px] border-white/10" />
                  <div className="absolute bottom-[-60px] right-[-20px] w-64 h-64 rounded-full border-[40px] border-white/5" />
                  <svg
                    className="absolute inset-0 w-full h-full opacity-[0.05]"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <pattern
                        id="dots"
                        width="20"
                        height="20"
                        patternUnits="userSpaceOnUse"
                      >
                        <circle cx="2" cy="2" r="1.5" fill="white" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#dots)" />
                  </svg>
                </div>
                <div className="relative z-10">
                  <p className="text-white/70 font-bold text-sm mb-1 tracking-wider uppercase">
                    الرصيد المتاح
                  </p>
                  <div className="flex items-end gap-3 mt-2">
                    <span className="text-6xl font-black tabular-nums">
                      {user.balance !== undefined ? user.balance : 0}
                    </span>
                    <span className="text-xl font-bold text-white/60 mb-2">
                      جنيه مصري
                    </span>
                  </div>

                  {showVoucherInput ? (
                    <div className="mt-6 flex flex-col sm:flex-row gap-2 max-w-sm">
                      <input
                        type="text"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        placeholder="أدخل كود الشحن"
                        className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 outline-none focus:border-white/40 focus:bg-white/15 transition-all text-sm font-bold"
                        dir="ltr"
                      />
                      <button
                        onClick={handleChargeVoucher}
                        disabled={isCharging}
                        className="px-6 py-2.5 bg-white text-primary font-bold rounded-xl text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {isCharging ? "جاري الشحن..." : "تأكيد"}
                      </button>
                      <button
                        onClick={() => setShowVoucherInput(false)}
                        className="px-4 py-2.5 bg-white/10 text-white font-bold rounded-xl text-sm border border-white/20 hover:bg-white/20 transition-all backdrop-blur-sm"
                      >
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setShowVoucherInput(true)}
                        className="px-6 py-2.5 bg-white text-primary font-bold rounded-xl text-sm shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all"
                      >
                        + شحن الرصيد بأكواد
                      </button>
                      <button className="hidden px-6 py-2.5 bg-white/15 text-white font-bold rounded-xl text-sm border border-white/20 hover:bg-white/25 transition-all backdrop-blur-sm">
                        سجل العمليات
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Transactions */}
              <div className="bg-white dark:bg-[#16181f] rounded-2xl border border-gray-100 dark:border-white/[0.06] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    سجل المعاملات
                  </h3>
                  <span className="text-xs text-gray-400 font-medium">
                    {TRANSACTIONS.length} عملية
                  </span>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
                  {TRANSACTIONS.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0
                        ${tx.type === "credit" ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500" : "bg-red-50 dark:bg-red-500/10 text-red-500"}`}
                      >
                        {tx.type === "credit" ? "↓" : "↑"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-800 dark:text-white text-sm truncate">
                          {tx.label}
                        </div>
                        <div className="text-xs text-gray-400 font-medium mt-0.5">
                          {tx.time}
                        </div>
                      </div>
                      <div
                        className={`font-black text-base tabular-nums shrink-0 ${tx.type === "credit" ? "text-emerald-500" : "text-red-500"}`}
                      >
                        {tx.type === "credit" ? "+" : "-"}
                        {tx.amount} ج
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ EXAMS TAB ══ */}
          {activeTab === "exams" && (
            <div className="max-w-5xl mx-auto space-y-8">
              {activeAttempt ? (
                /* ─── ACTIVE EXAM ─── */
                <div className="bg-white dark:bg-[#16181f] rounded-3xl border border-gray-100 dark:border-white/[0.06] shadow-lg overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                  {/* Sidebar Timeline */}
                  <div className="w-full md:w-64 bg-gray-50/50 dark:bg-black/20 border-l border-gray-100 dark:border-white/[0.06] p-6 flex flex-col items-center">
                    <h3 className="font-black text-lg text-gray-900 dark:text-white mb-6 text-center">
                      {activeAttempt.title}
                    </h3>

                    <div className="grid grid-cols-5 gap-2 w-full mb-8">
                      {activeAttempt.questions.map((q, i) => (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQuestionIndex(i)}
                          className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                            currentQuestionIndex === i
                              ? "bg-primary text-white shadow-md shadow-primary/30"
                              : q.student_answer?.answer_text ||
                                  q.student_answer?.answer_json
                                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                : "bg-white dark:bg-white/5 text-gray-400 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={submitExam}
                      disabled={examLoading}
                      className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-black rounded-xl shadow-lg transition-colors mt-auto"
                    >
                      {examLoading ? "جاري..." : "إنهاء وتسليم!"}
                    </button>
                  </div>

                  {/* Question Content */}
                  <div className="flex-1 p-6 md:p-10 flex flex-col relative min-h-full">
                    <div className="mb-6 flex items-center justify-between">
                      <span className="font-black text-gray-500 dark:text-gray-400">
                        سؤال {currentQuestionIndex + 1} من{" "}
                        {activeAttempt.questions_count}
                      </span>
                      <span className="bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 px-3 py-1 font-bold rounded-lg text-sm truncate max-w-xs">
                        {activeAttempt.questions[currentQuestionIndex]?.type ===
                        "mcq"
                          ? "اختر الإجابة"
                          : activeAttempt.questions[currentQuestionIndex]
                                ?.type === "true_false"
                            ? "صح أم خطأ"
                            : "اختر الإجابة"}
                      </span>
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 leading-relaxed">
                      {
                        activeAttempt.questions[currentQuestionIndex]
                          ?.question_text
                      }
                    </h2>

                    {activeAttempt.questions[currentQuestionIndex]
                      ?.full_image_url && (
                      <img
                        src={
                          activeAttempt.questions[currentQuestionIndex]
                            .full_image_url
                        }
                        alt="Question"
                        className="max-h-64 object-contain rounded-xl mb-6 shadow-sm border"
                      />
                    )}

                    <div className="flex-1 mt-4">
                      {activeAttempt.questions[currentQuestionIndex]?.type ===
                        "mcq" &&
                        activeAttempt.questions[currentQuestionIndex]
                          ?.options && (
                          <div className="space-y-3">
                            {activeAttempt.questions[
                              currentQuestionIndex
                            ].options.map((opt) => {
                              const qId =
                                activeAttempt.questions[currentQuestionIndex]
                                  .id;
                              const sAns =
                                activeAttempt.questions[currentQuestionIndex]
                                  .student_answer?.answer_text;
                              // Just a simplistic active check (assuming single answer for simplicity right now)
                              const isActive =
                                sAns === `"${opt.id}"` ||
                                sAns === opt.id ||
                                (sAns && sAns.includes(opt.id));
                              return (
                                <button
                                  key={opt.id}
                                  onClick={() =>
                                    submitAnswer(qId, `"${opt.id}"`)
                                  }
                                  className={`w-full p-4 rounded-xl border-2 text-right transition-all font-bold ${
                                    isActive
                                      ? "bg-primary/10 border-primary text-primary"
                                      : "bg-gray-50 dark:bg-white/5 border-transparent text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20"
                                  }`}
                                >
                                  {opt.text}
                                </button>
                              );
                            })}
                          </div>
                        )}

                      {activeAttempt.questions[currentQuestionIndex]?.type ===
                        "true_false" && (
                        <div className="flex gap-4">
                          {["true", "false"].map((val, idx) => {
                            const qId =
                              activeAttempt.questions[currentQuestionIndex].id;
                            const sAns =
                              activeAttempt.questions[currentQuestionIndex]
                                .student_answer?.answer_text;
                            const isActive = sAns === val;
                            return (
                              <button
                                key={val}
                                onClick={() => submitAnswer(qId, val)}
                                className={`flex-1 p-6 rounded-2xl border-2 text-center transition-all font-black text-xl ${
                                  isActive
                                    ? "bg-primary/10 border-primary text-primary"
                                    : "bg-gray-50 dark:bg-white/5 border-transparent text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20"
                                }`}
                              >
                                {val === "true" ? "✔️ صواب" : "❌ خطأ"}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {activeAttempt.questions[currentQuestionIndex]?.type ===
                        "short_answer" && (
                        <div>
                          <textarea
                            className="w-full p-4 rounded-xl border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-white font-bold outline-none focus:border-primary resize-none"
                            rows="4"
                            placeholder="اكتب إجابتك هنا..."
                            value={
                              activeAttempt.questions[currentQuestionIndex]
                                .student_answer?.answer_text || ""
                            }
                            onChange={(e) => {
                              const qId =
                                activeAttempt.questions[currentQuestionIndex]
                                  .id;
                              submitAnswer(qId, e.target.value);
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100 dark:border-white/[0.06]">
                      <button
                        disabled={currentQuestionIndex === 0}
                        onClick={() =>
                          setCurrentQuestionIndex(
                            Math.max(0, currentQuestionIndex - 1),
                          )
                        }
                        className="px-6 py-2 rounded-xl border border-gray-300 dark:border-white/20 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        السابق
                      </button>
                      <button
                        disabled={
                          currentQuestionIndex ===
                          activeAttempt.questions.length - 1
                        }
                        onClick={() =>
                          setCurrentQuestionIndex(
                            Math.min(
                              activeAttempt.questions.length - 1,
                              currentQuestionIndex + 1,
                            ),
                          )
                        }
                        className="px-6 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        التالي
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* ─── EXAMS LIST ─── */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Exams Available */}
                  <div className="space-y-4">
                    <h3 className="font-black text-xl text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                      <span className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        🎯
                      </span>
                      امتحانات متاحة لك
                    </h3>

                    {availableExams.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 bg-white dark:bg-[#16181f] rounded-2xl border border-dashed border-gray-200 dark:border-white/10 font-bold">
                        لا توجد امتحانات متاحة الآن
                      </div>
                    ) : (
                      availableExams.map((ex) => {
                        const maxAtt = ex.max_attempts;
                        const historyAtts = examHistory.filter(
                          (h) => h.exam.title === ex.title,
                        ).length;
                        const canTake = maxAtt === 0 || historyAtts < maxAtt;
                        return (
                          <div
                            key={ex.id}
                            className="p-6 bg-white dark:bg-[#16181f] rounded-2xl border border-gray-100 dark:border-white/[0.06] shadow-sm hover:shadow-md transition-all flex flex-col border-r-4 border-r-primary"
                          >
                            <h4 className="font-black text-lg text-gray-900 dark:text-white mb-2">
                              {ex.title}
                            </h4>
                            <p className="text-gray-500 dark:text-gray-400 font-bold text-sm mb-4 line-clamp-2">
                              {ex.description || "لا يوجد وصف."}
                            </p>
                            <div className="flex items-center gap-4 text-xs font-bold text-gray-400 mb-6">
                              {ex.duration_minutes > 0 ? (
                                <span>⏳ {ex.duration_minutes} دقيقة</span>
                              ) : (
                                <span>♾️ وقت مفتوح</span>
                              )}
                              <span>
                                🔄{" "}
                                {maxAtt === 0
                                  ? "مفتوح"
                                  : `${historyAtts}/${maxAtt} محاولات`}
                              </span>
                              <span>✅ نجاح من {ex.passing_score}</span>
                            </div>
                            <button
                              onClick={() => startExam(ex.id)}
                              disabled={!canTake || examLoading}
                              className={`w-full py-2.5 rounded-xl font-black shadow-sm transition-all ${
                                !canTake
                                  ? "bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed"
                                  : "bg-primary hover:bg-primary/90 text-white hover:shadow-md hover:-translate-y-0.5"
                              }`}
                            >
                              {!canTake
                                ? "استنفذت المحاولات"
                                : examLoading
                                  ? "جاري..."
                                  : "ابدأ الامتحان الآن"}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* History */}
                  <div className="space-y-4">
                    <h3 className="font-black text-xl text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                      <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        📋
                      </span>
                      سجل امتحاناتي
                    </h3>

                    {examHistory.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 bg-white dark:bg-[#16181f] rounded-2xl border border-dashed border-gray-200 dark:border-white/10 font-bold">
                        لم تقم بأي امتحانات بعد
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {examHistory.map((h, i) => (
                          <div
                            key={i}
                            className={`p-4 rounded-xl border flex items-center justify-between ${
                              h.attempt.status === "in_progress"
                                ? "bg-blue-50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/20"
                                : h.attempt.passed
                                  ? "bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20"
                                  : "bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20"
                            }`}
                          >
                            <div>
                              <h5 className="font-black text-gray-900 dark:text-white mb-1 leading-snug">
                                {h.exam.title}
                              </h5>
                              <div className="text-xs font-bold text-gray-500">
                                {new Date(h.attempt.started_at).toLocaleString(
                                  "ar-EG",
                                )}
                              </div>
                            </div>

                            {h.attempt.status === "in_progress" ? (
                              <button
                                onClick={() => startExam(h.attempt.exam_id)}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-black shadow-sm hover:bg-blue-700"
                              >
                                استكمال
                              </button>
                            ) : (
                              <div className="text-center shrink-0 min-w-16">
                                <div
                                  className={`text-xl font-black ${h.attempt.passed ? "text-emerald-600" : "text-red-500"}`}
                                >
                                  {h.attempt.percentage}%
                                </div>
                                <div
                                  className={`text-[10px] font-bold uppercase tracking-wider ${h.attempt.passed ? "text-emerald-500" : "text-red-400"}`}
                                >
                                  {h.attempt.passed ? "ناجح" : "راسب"}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ LEADERBOARD TAB ══ */}
          {activeTab === "leaderboard" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl text-white shadow-xl shadow-indigo-500/20 mb-8 relative overflow-hidden">
                <div className="absolute top-[-30px] right-[-30px] w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute bottom-[-30px] left-[-30px] w-40 h-40 bg-white/10 rounded-full blur-2xl" />

                <h2 className="text-3xl font-black mb-2 relative z-10 flex items-center gap-3">
                  <span className="text-4xl">🏆</span> لوحة الشرف
                </h2>
                <p className="text-indigo-100 font-medium relative z-10 max-w-md">
                  تنافس مع زملائك وتصدر القائمة! احصل على نقاط عند إكمال الدروس
                  والتفوق في الامتحانات.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20 relative z-10">
                  <span className="font-bold text-white text-sm">
                    نقاطك الحالية:
                  </span>
                  <span className="text-xl font-black tabular-nums text-yellow-300 drop-shadow-sm">
                    {user.points || 0}
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-[#16181f] rounded-3xl border border-gray-100 dark:border-white/[0.06] shadow-sm overflow-hidden">
                {leaderboard && leaderboard.length > 0 ? (
                  <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
                    {leaderboard.map((student, index) => {
                      const isCurrentUser = student.id === user.id;
                      let rankBadge = null;

                      if (index === 0) {
                        rankBadge = (
                          <div className="w-10 h-10 shrink-0 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center font-black text-xl shadow-inner border border-yellow-200 dark:border-yellow-500/30">
                            🥇
                          </div>
                        );
                      } else if (index === 1) {
                        rankBadge = (
                          <div className="w-10 h-10 shrink-0 bg-gray-200 dark:bg-gray-500/20 text-gray-500 dark:text-gray-400 rounded-full flex items-center justify-center font-black text-xl shadow-inner border border-gray-300 dark:border-gray-500/30">
                            🥈
                          </div>
                        );
                      } else if (index === 2) {
                        rankBadge = (
                          <div className="w-10 h-10 shrink-0 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center font-black text-xl shadow-inner border border-orange-200 dark:border-orange-500/30">
                            🥉
                          </div>
                        );
                      } else {
                        rankBadge = (
                          <div className="w-10 h-10 shrink-0 bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500 rounded-full flex items-center justify-center font-black shadow-inner border border-gray-100 dark:border-white/10">
                            {index + 1}
                          </div>
                        );
                      }

                      return (
                        <div
                          key={student.id}
                          className={`flex items-center gap-4 px-6 py-4 transition-all ${
                            isCurrentUser
                              ? "bg-indigo-50/50 dark:bg-indigo-500/10 border-l-4 border-indigo-500"
                              : "hover:bg-gray-50 dark:hover:bg-white/[0.02] border-l-4 border-transparent"
                          }`}
                        >
                          {rankBadge}

                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-black shrink-0 relative overflow-hidden">
                            <span className="relative z-10 text-xs">
                              {(student.name || "ط").charAt(0)}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-extrabold text-gray-900 dark:text-white truncate text-base flex items-center gap-2">
                              {student.name}
                              {isCurrentUser && (
                                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-500/30 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full uppercase tracking-wider font-black">
                                  أنت
                                </span>
                              )}
                            </h4>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 bg-yellow-50 dark:bg-yellow-500/10 px-3 py-1.5 rounded-xl border border-yellow-100 dark:border-yellow-500/20">
                            <span className="text-yellow-600 dark:text-yellow-400 font-black tabular-nums">
                              {student.points}
                            </span>
                            <span className="text-xs text-yellow-700/60 dark:text-yellow-400/60 font-bold">
                              نقطة
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-16 flex flex-col items-center justify-center text-center">
                    <div className="text-6xl mb-4 opacity-50 grayscale">🏆</div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                      القائمة فارغة
                    </h3>
                    <p className="text-gray-500 font-medium">
                      كن أول من يحصل على النقاط ويتصدر لوحة الشرف!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ ASSIGNMENTS TAB ══ */}
          {activeTab === "assignments" && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                    <span className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                      <IconAssignment />
                    </span>
                    الواجبات والمهام التعليمية
                  </h2>
                  <p className="text-gray-400 font-bold mt-1 text-sm">
                    تابع مهامك الأسبوعية وراجع تصحيح المدرس والذكاء الاصطناعي
                  </p>
                </div>
                <button
                  onClick={fetchAssignments}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-emerald-500 transition-colors"
                >
                  {assignmentLoading ? (
                    <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <IconRefresh />
                  )}
                </button>
              </div>

              {assignments.length === 0 ? (
                <div className="bg-white dark:bg-[#16181f] rounded-3xl p-20 text-center border border-dashed border-gray-200 dark:border-white/10 shadow-sm">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <IconAssignment />
                  </div>
                  <p className="text-gray-400 font-black">
                    لا توجد واجبات مطلوبة منك حالياً
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignments.map((a) => (
                    <div
                      key={a.id}
                      className="bg-white dark:bg-[#16181f] rounded-3xl border border-gray-100 dark:border-white/6 p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative"
                    >
                      {a.submitted && (
                        <div className="absolute top-0 right-0 px-4 py-1.5 bg-emerald-500 text-white text-[10px] font-black rounded-bl-2xl uppercase tracking-wider">
                          تم التسليم
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 px-2 py-1 bg-emerald-500/10 rounded-lg mb-2 inline-block">
                            {a.course_name}
                          </span>
                          <h3 className="text-xl font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                            {a.title}
                          </h3>
                        </div>
                      </div>

                      <p className="text-sm text-gray-400 font-bold mb-6 line-clamp-2 h-10">
                        {a.description}
                      </p>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 dark:border-white/5">
                        <div className="flex items-center gap-3 text-[11px] font-bold text-gray-400">
                          <div className="flex items-center gap-1.5">
                            📅{" "}
                            {a.due_date
                              ? new Date(a.due_date).toLocaleString("ar-EG", {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })
                              : "بدون تاريخ"}
                          </div>
                          <div className="flex items-center gap-1.5 font-black text-primary bg-primary/5 px-2 py-0.5 rounded">
                            💯 {a.max_score} درجة
                          </div>
                        </div>

                        {!a.submitted ? (
                          <button
                            onClick={() => {
                              setActiveAssignment(a);
                              setSubmissionText("");
                              setSelectedFile(null);
                            }}
                            className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-xl text-xs font-black transition-all shadow-lg shadow-primary/20 active:scale-95"
                          >
                            حل الآن
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveAssignment(a);
                              setSubmissionText("");
                              setSelectedFile(null);
                            }}
                            className="bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white px-5 py-2 rounded-xl text-xs font-black hover:bg-emerald-500 hover:text-white transition-all active:scale-95"
                          >
                            عرض التصحيح
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Submission / View Modal */}
              {activeAssignment && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
                  <div className="bg-white dark:bg-[#16181f] rounded-[40px] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-white/10">
                    <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50 dark:bg-white/[0.02]">
                      <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white">
                          {activeAssignment.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            {activeAssignment.course_name}
                          </span>
                          <span className="text-[10px] font-black text-gray-400">
                            الدرجة النهائية: {activeAssignment.max_score}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setActiveAssignment(null);
                          setSubmissionText("");
                          setSelectedFile(null);
                        }}
                        className="text-gray-400 p-2 bg-gray-100 dark:bg-white/5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10"
                      >
                        <span className="text-xl leading-none">✕</span>
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                      {!(
                        activeAssignment.submitted || activeAssignment.Submitted
                      ) ? (
                        <form
                          onSubmit={(e) =>
                            submitAssignment(
                              e,
                              activeAssignment.id,
                              submissionText,
                              selectedFile,
                            )
                          }
                          className="space-y-6"
                        >
                          <div className="bg-emerald-500/5 p-5 rounded-3xl border border-emerald-500/10 mb-6">
                            <h4 className="flex items-center gap-2 text-emerald-600 font-black mb-2 text-sm italic">
                              📌 الأسئلة والمطلوب
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 font-bold leading-relaxed whitespace-pre-wrap">
                              {activeAssignment.description ||
                                "لا يوجد وصف إضافي"}
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-2 font-black italic underline decoration-primary/30">
                              إجابتك (نصياً)
                            </label>
                            <textarea
                              rows={6}
                              value={submissionText}
                              onChange={(e) =>
                                setSubmissionText(e.target.value)
                              }
                              placeholder="اكتب إجابتك النموذجية هنا..."
                              className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-primary rounded-2xl p-5 font-bold outline-none transition-all text-gray-900 dark:text-white resize-none shadow-inner"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-2 font-black italic underline decoration-primary/30 text-emerald-500">
                              أرفق صورة الحل (اختياري)
                            </label>
                            <div className="relative group/upload">
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) =>
                                  setSelectedFile(e.target.files[0])
                                }
                                className="hidden"
                                id="sub-file"
                              />
                              <label
                                htmlFor="sub-file"
                                className="w-full h-32 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary group-hover/upload:bg-primary/5 transition-all bg-gray-50 dark:bg-transparent"
                              >
                                {selectedFile ? (
                                  <div className="flex flex-col items-center">
                                    <span className="text-primary font-black animate-bounce text-2xl">
                                      ✓
                                    </span>
                                    <span className="text-xs text-primary font-black">
                                      {selectedFile.name} (تم الاختيار)
                                    </span>
                                  </div>
                                ) : (
                                  <>
                                    <span className="text-3xl grayscale group-hover/upload:grayscale-0 transition-all">
                                      🖼️
                                    </span>
                                    <span className="text-sm font-black text-gray-400">
                                      اضغط لرفع ورقة الإجابة أو ملف PDF
                                    </span>
                                  </>
                                )}
                              </label>
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={assignmentSubmitting}
                            className="w-full py-5 rounded-2xl bg-primary hover:bg-primary/95 text-white font-black text-lg transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50"
                          >
                            {assignmentSubmitting ? (
                              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                            ) : (
                              "إرسال الواجب للمستر 🚀"
                            )}
                          </button>
                        </form>
                      ) : (
                        <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                          {/* Result Overview */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 text-center relative overflow-hidden group">
                              <div className="text-[10px] text-gray-400 font-black uppercase mb-1 tracking-widest relative z-10">
                                الحالة
                              </div>
                              <div
                                className={`text-xl font-black relative z-10 ${activeAssignment.my_status === "graded" ? "text-emerald-500" : "text-orange-500"}`}
                              >
                                {activeAssignment.my_status === "graded"
                                  ? "تم التصحيح ✅"
                                  : "قيد المراجعة ⏳"}
                              </div>
                              <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 text-center relative overflow-hidden group">
                              <div className="text-[10px] text-gray-400 font-black uppercase mb-1 tracking-widest relative z-10">
                                الدرجة
                              </div>
                              <div className="text-3xl font-black text-primary relative z-10">
                                {activeAssignment.my_score || 0} /{" "}
                                {activeAssignment.max_score}
                              </div>
                              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>

                          {/* Student Answer Record */}
                          <div className="bg-gray-50 dark:bg-white/5 p-7 rounded-[32px] border border-gray-100 dark:border-white/10">
                            <h4 className="flex items-center gap-2 text-gray-500 font-black mb-3 text-sm italic">
                              📝 إجابتك التي تم تسليمها
                            </h4>
                            <p className="text-gray-800 dark:text-gray-200 font-bold leading-relaxed whitespace-pre-wrap mb-4">
                              {activeAssignment.my_answer_text || "لا يوجد نص"}
                            </p>
                            {activeAssignment.my_answer_image && (
                              <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 group relative max-w-md">
                                <img
                                  src={
                                    activeAssignment.my_answer_image.startsWith(
                                      "http",
                                    )
                                      ? activeAssignment.my_answer_image
                                      : `https://api.ofoq.site/${activeAssignment.my_answer_image}`
                                  }
                                  className="w-full h-auto object-cover"
                                  alt="My submission"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <a
                                    href={
                                      activeAssignment.my_answer_image.startsWith(
                                        "http",
                                      )
                                        ? activeAssignment.my_answer_image
                                        : `https://api.ofoq.site/${activeAssignment.my_answer_image}`
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-white text-gray-900 px-4 py-2 rounded-xl text-xs font-black"
                                  >
                                    عرض بالحجم الكامل 🔍
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>

                          {activeAssignment.ai_feedback && (
                            <div className="bg-purple-500/5 p-7 rounded-[32px] border border-purple-500/10 relative overflow-hidden group shadow-sm">
                              <div className="absolute top-4 left-4 text-purple-500/10 text-4xl group-hover:text-purple-500/20 transition-all font-serif">
                                AI
                              </div>
                              <h4 className="flex items-center gap-2 text-purple-600 font-black mb-4 text-sm italic">
                                ✨ تحليل أفق الذكي (AI Analysis)
                              </h4>
                              <div className="text-gray-700 dark:text-gray-200 text-sm font-bold leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto scrollbar-hide pr-2">
                                {activeAssignment.ai_feedback}
                              </div>
                            </div>
                          )}

                          {(activeAssignment.feedback ||
                            activeAssignment.my_status === "graded") && (
                            <div className="bg-emerald-500/5 p-7 rounded-[32px] border border-emerald-500/10 relative overflow-hidden">
                              <div className="absolute top-4 left-4 text-emerald-500/20 text-4xl font-serif">
                                ❝
                              </div>
                              <h4 className="flex items-center gap-2 text-emerald-600 font-black mb-3 text-sm italic">
                                👨‍🏫 تقييم المدرس (Feedback)
                              </h4>
                              <p className="text-gray-800 dark:text-gray-200 font-bold leading-relaxed">
                                {activeAssignment.feedback ||
                                  "أحسنت واصل الاجتهاد! لم يكتب المدرس ملاحظات إضافية."}
                              </p>
                            </div>
                          )}

                          <div className="pt-4 flex justify-center">
                            <button
                              onClick={() => setActiveAssignment(null)}
                              className="text-gray-400 font-black hover:text-gray-600 transition-colors py-2 px-6 border-b-2 border-transparent hover:border-gray-200"
                            >
                              إغلاق الواجب
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ SETTINGS TAB ══ */}
          {activeTab === "settings" && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="bg-white dark:bg-[#16181f] rounded-2xl border border-gray-100 dark:border-white/[0.06] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.02]">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      <IconSettings />
                    </span>
                    بيانات الحساب
                  </h3>
                </div>
                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                        الاسم الكامل
                      </label>
                      <input
                        type="text"
                        defaultValue={user.name}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white outline-none cursor-not-allowed opacity-75 font-medium transition-all"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                        رقم الهاتف
                      </label>
                      <input
                        type="text"
                        defaultValue={user.phone}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white outline-none cursor-not-allowed opacity-75 font-medium transition-all"
                        dir="ltr"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                        الصف الدراسي
                      </label>
                      <input
                        type="text"
                        defaultValue={gradeDisplay}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white outline-none cursor-not-allowed opacity-75 font-medium transition-all"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                        تاريخ الانضمام
                      </label>
                      <input
                        type="text"
                        defaultValue={joinedDateDisplay}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white outline-none cursor-not-allowed opacity-75 font-medium transition-all"
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ ID CARD TAB ══ */}
          {activeTab === "id_card" && (
            <div className="max-w-md mx-auto space-y-6 flex flex-col items-center">
              <div
                ref={idCardRef}
                id="student-id-card"
                className="w-full relative overflow-hidden rounded-3xl bg-white dark:bg-[#16181f] border border-gray-100 dark:border-white/6 shadow-2xl pb-6"
                style={{ direction: "rtl", minHeight: "450px" }}
              >
                {/* Header Decoration */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-primary to-secondary z-0 opacity-10" />
                <div className="relative z-10 pt-8 pb-4 flex flex-col items-center gap-2">
                  <h2 className="text-2xl font-black text-primary drop-shadow-sm">
                    {domain
                      ? domain.replace(".ofoq.info", "").toUpperCase()
                      : "منصة أفق التعليمية"}
                  </h2>
                  <p className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest">
                    Smart Student ID
                  </p>
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center p-6 space-y-6">
                  <div className="p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
                    <QRCode
                      value={JSON.stringify({
                        type: "attendance",
                        student_id: user.id,
                      })}
                      size={200}
                      level="H"
                    />
                  </div>

                  <div className="text-center w-full space-y-1">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight">
                      {user.name}
                    </h3>
                    <p
                      className="text-sm font-bold text-gray-500 tracking-wide font-mono"
                      dir="ltr"
                    >
                      {user.phone}
                    </p>
                    <p className="text-sm font-bold text-primary mt-1">
                      {gradeDisplay}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 w-full text-center mt-2 border-t border-gray-100 dark:border-white/5 pt-4">
                  <span className="text-[10px] font-black text-gray-400 flex items-center justify-center gap-1 opacity-70">
                    تم الاصدار بواسطة
                    <img
                      src="https://ofoq.info/assets/ofoq-logo-D0iL9A-r.webp"
                      alt="أفق"
                      className="h-4 brightness-0 dark:invert opacity-60"
                    />
                    أفق
                  </span>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => handleDownloadIdCard("png")}
                  className="flex-1 py-3.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-800 dark:text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  صورة (PNG)
                </button>
                <button
                  onClick={() => handleDownloadIdCard("pdf")}
                  className="flex-1 py-3.5 bg-primary text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  ملف (PDF)
                </button>
              </div>

              {/* Attendance Records */}
              <AttendanceRecords />
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
