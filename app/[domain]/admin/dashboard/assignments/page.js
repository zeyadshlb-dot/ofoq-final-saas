"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import {
  FileEdit,
  Plus,
  Loader2,
  Trash2,
  Eye,
  Calendar,
  BookOpen,
  Users,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  User,
  Image as ImageIcon,
  Send,
  Sparkles,
  Trophy,
} from "lucide-react";

export default function AssignmentsPage() {
  const router = useRouter();
  const params = useParams();
  const domain = params.domain;
  const { toast } = useToast();
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // "list" or "submissions"
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    course_id: "",
    due_date: "",
    max_score: 100,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Grading states
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeData, setGradeData] = useState({ score: 0, feedback: "" });
  const [isGrading, setIsGrading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchAssignments(), fetchCourses()]);
    setLoading(false);
  };

  const fetchAssignments = async () => {
    try {
      const res = await fetch("/api/v1/assignments", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("instructor_token")}`,
        },
      });
      if (!res.ok) throw new Error("فشل جلب الواجبات");
      const data = await res.json();
      setAssignments(data.data || []);
    } catch (err) {
      toast("حدث خطأ أثناء تحميل الواجبات", "error");
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch(`/api/v1/courses?slug=${domain}`);
      if (!res.ok) throw new Error("فشل جلب الكورسات");
      const data = await res.json();
      // Logic for IndexCourses returns raw array usually
      setCourses(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!newAssignment.title || !newAssignment.course_id) {
      toast("يرجى ملء البيانات المطلوبة", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/v1/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("instructor_token")}`,
        },
        body: JSON.stringify(newAssignment),
      });

      if (!res.ok) throw new Error("فشل الإنشاء");
      toast("تم إنشاء الواجب بنجاح", "success");
      setShowCreateModal(false);
      setNewAssignment({
        title: "",
        description: "",
        course_id: "",
        due_date: "",
        max_score: 100,
      });
      fetchAssignments();
    } catch (err) {
      toast("حدث خطأ أثناء الإنشاء", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewSubmissions = async (assignment) => {
    setSelectedAssignment(assignment);
    setView("submissions");
    setSubmissionsLoading(true);
    try {
      const res = await fetch(
        `/api/v1/assignments/${assignment.id}/submissions`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("instructor_token")}`,
          },
        },
      );
      const data = await res.json();
      setSubmissions(data.data || []);
    } catch (err) {
      toast("حدث خطأ أثناء تحميل الإجابات", "error");
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleGrade = async (e) => {
    e.preventDefault();
    try {
      setIsGrading(true);
      const res = await fetch(
        `/api/v1/assignments/submissions/${gradingSubmission.id}/grade`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("instructor_token")}`,
          },
          body: JSON.stringify(gradeData),
        },
      );

      if (!res.ok) throw new Error("فشل التقييم");
      toast("تم التقييم بنجاح", "success");
      setGradingSubmission(null);
      // Refresh submissions
      handleViewSubmissions(selectedAssignment);
    } catch (err) {
      toast("حدث خطأ أثناء التقييم", "error");
    } finally {
      setIsGrading(false);
    }
  };

  const handleGenerateAI = async (submissionId) => {
    try {
      setIsGeneratingAI(true);
      const res = await fetch(
        `/api/v1/assignments/submissions/${submissionId}/ai-feedback`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("instructor_token")}`,
          },
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "فشل الذكاء الاصطناعي");

      toast("تم إنشاء التقييم الذكي", "success");
      // Update local state if needed or just refresh
      handleViewSubmissions(selectedAssignment);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا الواجب؟")) return;
    try {
      const res = await fetch(`/api/v1/assignments/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("instructor_token")}`,
        },
      });
      if (!res.ok) throw new Error("فشل الحذف");
      toast("تم حذف الواجب", "success");
      fetchAssignments();
    } catch (err) {
      toast("حدث خطأ أثناء الحذف", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2.5 rounded-2xl">
              <FileEdit className="w-8 h-8 text-emerald-500" />
            </div>
            {view === "list"
              ? "إدارة الواجبات التعليمية"
              : `تسليمات: ${selectedAssignment.title}`}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
            {view === "list"
              ? "أنشئ وتابع واجبات الطلاب وقم بتقييمها بسهولة"
              : "راجع إجابات الطلاب وقم بتصحيحها يدوياً أو باستخدام الذكاء الاصطناعي"}
          </p>
        </div>

        {view === "list" ? (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-2xl font-black transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            إضافة واجب جديد
          </button>
        ) : (
          <button
            onClick={() => setView("list")}
            className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 text-gray-700 dark:text-white px-6 py-3.5 rounded-2xl font-black transition-all active:scale-95"
          >
            <ChevronRight className="w-5 h-5" />
            العودة للواجبات
          </button>
        )}
      </div>

      {view === "list" ? (
        /* Assignments Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <div className="bg-gray-100 dark:bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileEdit className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                لا توجد واجبات حالياً
              </h3>
              <p className="text-gray-500 mt-2">ابدأ بإضافة أول واجب لطلابك</p>
            </div>
          ) : (
            assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="group bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/50 dark:shadow-none hover:border-emerald-500/50 transition-all relative overflow-hidden"
              >
                {/* Status Badge */}
                <div
                  className={`absolute top-0 left-0 px-4 py-1.5 rounded-br-2xl text-[10px] font-black uppercase tracking-wider ${
                    assignment.status === "active"
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-500 text-white"
                  }`}
                >
                  {assignment.status === "active" ? "نشط" : "مغلق"}
                </div>

                <div className="mt-4">
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-lg flex items-center w-fit gap-1 mb-3">
                    <BookOpen className="w-3 h-3" />
                    {assignment.course_name}
                  </span>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white line-clamp-1 group-hover:text-emerald-500 transition-colors">
                    {assignment.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 h-10 overflow-hidden leading-relaxed">
                    {assignment.description || "لا يوجد وصف"}
                  </p>
                </div>

                {/* Progress Mini Stats */}
                <div className="grid grid-cols-3 gap-2 mt-6">
                  <div className="bg-blue-50 dark:bg-blue-500/10 p-3 rounded-2xl text-center">
                    <div className="text-lg font-black text-blue-600 dark:text-blue-400">
                      {assignment.total_submissions}
                    </div>
                    <div className="text-[10px] text-blue-500 font-bold">
                      تسليمات
                    </div>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-500/10 p-3 rounded-2xl text-center">
                    <div className="text-lg font-black text-orange-600 dark:text-orange-400">
                      {assignment.pending_count}
                    </div>
                    <div className="text-[10px] text-orange-500 font-bold">
                      قيد التصحيح
                    </div>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-2xl text-center">
                    <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      {assignment.graded_count}
                    </div>
                    <div className="text-[10px] text-emerald-500 font-bold">
                      مكتمل
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                    <Calendar className="w-4 h-4" />
                    {assignment.due_date
                      ? new Date(assignment.due_date).toLocaleString("ar-EG", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : "بدون أجل"}
                  </div>
                  <div className="flex-1" />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewSubmissions(assignment)}
                      className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                      title="عرض التسليمات"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteAssignment(assignment.id)}
                      className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      title="حذف"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Submissions View */
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {submissionsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-bold font-lg">
                لم يقم أحد بتسليم الواجب بعد
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-start md:items-center gap-6 group hover:border-emerald-500/30 transition-all"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    <User className="w-7 h-7" />
                  </div>

                  <div className="flex-1">
                    <h4 className="text-lg font-black text-gray-900 dark:text-white">
                      {sub.student_name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-4 mt-1">
                      <span className="text-xs text-gray-400 font-bold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(sub.created_at).toLocaleString("ar-EG")}
                      </span>
                      {sub.status === "pending" ? (
                        <span className="bg-orange-500/10 text-orange-500 text-[10px] font-black px-3 py-1 rounded-full border border-orange-500/20 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> جاري المراجعة
                        </span>
                      ) : (
                        <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                          <Trophy className="w-3 h-3" /> تم التقييم ({sub.score}
                          /{selectedAssignment.max_score})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {sub.answer_image && (
                      <a
                        href={
                          sub.answer_image.startsWith("http")
                            ? sub.answer_image
                            : `https://api.ofoq.site/${sub.answer_image}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-black border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all"
                      >
                        <ImageIcon className="w-4 h-4" />
                        عرض المرفق
                      </a>
                    )}

                    <button
                      onClick={() => {
                        setGradingSubmission(sub);
                        setGradeData({
                          score: sub.score || 0,
                          feedback: sub.feedback || "",
                        });
                      }}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                    >
                      {sub.status === "graded"
                        ? "تعديل التقييم"
                        : "تصحيح الإجابة"}
                    </button>

                    {!sub.ai_feedback && (
                      <button
                        disabled={isGeneratingAI}
                        onClick={() => handleGenerateAI(sub.id)}
                        className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 hover:bg-purple-600 hover:text-white transition-all group/ai relative"
                        title="تصحيح بالذكاء الاصطناعي"
                      >
                        {isGeneratingAI ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Sparkles className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-[32px] w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                <div className="bg-emerald-500 p-2 rounded-xl text-white">
                  <Plus className="w-6 h-6" />
                </div>
                إضافة واجب جديد
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 bg-gray-100 dark:bg-gray-800 p-2 rounded-full"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-2">
                  اسم الواجب
                </label>
                <input
                  type="text"
                  required
                  value={newAssignment.title}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      title: e.target.value,
                    })
                  }
                  placeholder="مثلاً: واجب الأسبوع الأول - القوانين الأساسية"
                  className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-4 font-bold focus:border-emerald-500 transition-all outline-none text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-2">
                    الكورس
                  </label>
                  <select
                    required
                    value={newAssignment.course_id}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        course_id: e.target.value,
                      })
                    }
                    className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-4 font-bold focus:border-emerald-500 transition-all outline-none text-gray-900 dark:text-white appearance-none"
                  >
                    <option value="">اختر الكورس</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-2">
                    أقصى درجة
                  </label>
                  <input
                    type="number"
                    value={newAssignment.max_score}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        max_score: e.target.value,
                      })
                    }
                    className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-4 font-bold focus:border-emerald-500 transition-all outline-none text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-2">
                    تاريخ التسليم
                  </label>
                  <div className="relative">
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      required
                      value={
                        newAssignment.due_date
                          ? newAssignment.due_date.split("T")[0]
                          : ""
                      }
                      onChange={(e) => {
                        const time = newAssignment.due_date
                          ? newAssignment.due_date.split("T")[1] || "00:00"
                          : "00:00";
                        setNewAssignment({
                          ...newAssignment,
                          due_date: `${e.target.value}T${time}`,
                        });
                      }}
                      className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl pr-12 pl-5 py-4 font-bold focus:border-emerald-500 transition-all outline-none text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-2">
                    الوقت
                  </label>
                  <div className="relative">
                    <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="time"
                      required
                      value={
                        newAssignment.due_date
                          ? newAssignment.due_date.split("T")[1] || "00:00"
                          : "00:00"
                      }
                      onChange={(e) => {
                        const date = newAssignment.due_date
                          ? newAssignment.due_date.split("T")[0] ||
                            new Date().toISOString().split("T")[0]
                          : new Date().toISOString().split("T")[0];
                        setNewAssignment({
                          ...newAssignment,
                          due_date: `${date}T${e.target.value}`,
                        });
                      }}
                      className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl pr-12 pl-5 py-4 font-bold focus:border-emerald-500 transition-all outline-none text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-2">
                  وصف الواجب أو الأسئلة
                </label>
                <textarea
                  value={newAssignment.description}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                  placeholder="اكتب الأسئلة هنا أو أي ملاحظات إضافية..."
                  className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-4 font-bold focus:border-emerald-500 transition-all outline-none text-gray-900 dark:text-white resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-white" />
                ) : (
                  "حفظ ونشر الواجب"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Grading Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  تصحيح واجب: {gradingSubmission.student_name}
                </h3>
                <p className="text-xs text-gray-400 font-bold mt-1">
                  واجب: {selectedAssignment.title}
                </p>
              </div>
              <button
                onClick={() => setGradingSubmission(null)}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Side: Submission Details */}
              <div className="space-y-6">
                <div className="bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/10">
                  <h4 className="flex items-center gap-2 text-emerald-600 font-black mb-3 text-sm italic">
                    <Send className="w-4 h-4" /> إجابة الطالب
                  </h4>
                  <p className="text-gray-800 dark:text-gray-200 font-bold leading-relaxed whitespace-pre-wrap">
                    {gradingSubmission.answer_text || "لا يوجد نص"}
                  </p>
                </div>

                {gradingSubmission.answer_image && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-black text-gray-400 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" /> الصور المرفقة
                    </h4>
                    <div className="rounded-3xl border-2 border-gray-100 dark:border-gray-700 overflow-hidden group relative">
                      <img
                        src={
                          gradingSubmission.answer_image.startsWith("http")
                            ? gradingSubmission.answer_image
                            : `https://api.ofoq.site/${gradingSubmission.answer_image}`
                        }
                        className="w-full h-auto max-h-[400px] object-contain bg-gray-900"
                        alt="Answer attachment"
                      />
                      <a
                        href={
                          gradingSubmission.answer_image.startsWith("http")
                            ? gradingSubmission.answer_image
                            : `https://api.ofoq.site/${gradingSubmission.answer_image}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-lg gap-2"
                      >
                        <Eye className="w-6 h-6" /> عرض بالحجم الكامل
                      </a>
                    </div>
                  </div>
                )}

                {gradingSubmission.ai_feedback && (
                  <div className="bg-purple-500/5 p-6 rounded-3xl border border-purple-500/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-1.5 bg-purple-500 text-white rounded-bl-xl opacity-20 group-hover:opacity-100 transition-opacity">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="flex items-center gap-2 text-purple-600 font-black mb-3 text-sm italic">
                      <Sparkles className="w-4 h-4" /> تحليل الذكاء الاصطناعي
                    </h4>
                    <div className="text-gray-700 dark:text-gray-200 text-sm font-bold leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto scrollbar-hide">
                      {gradingSubmission.ai_feedback}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Grading Form */}
              <form
                onSubmit={handleGrade}
                className="space-y-6 bg-gray-50 dark:bg-gray-700/30 p-8 rounded-[40px] border border-gray-100 dark:border-gray-700 h-fit sticky top-0"
              >
                <div>
                  <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-2">
                    رصد الدرجة (من {selectedAssignment.max_score})
                  </label>
                  <div className="relative">
                    <Trophy className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-500" />
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={gradeData.score}
                      onChange={(e) =>
                        setGradeData({ ...gradeData, score: e.target.value })
                      }
                      className="w-full bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl pr-14 pl-5 py-5 font-black text-2xl focus:border-emerald-500 transition-all outline-none text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-2">
                    ملاحظاتك للطالب (الفيدباك)
                  </label>
                  <textarea
                    rows={6}
                    value={gradeData.feedback}
                    onChange={(e) =>
                      setGradeData({ ...gradeData, feedback: e.target.value })
                    }
                    placeholder="أحسنت يا بطل، إجابتك ممتازة ولكن انتبه لـ..."
                    className="w-full bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-4 font-bold focus:border-emerald-500 transition-all outline-none text-gray-900 dark:text-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGrading}
                  className="w-full py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-3"
                >
                  {isGrading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-6 h-6" />
                      اعتماد الدرجة وإرسالها
                    </>
                  )}
                </button>

                <div className="pt-4 text-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Ofoq AI System Enabled
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
