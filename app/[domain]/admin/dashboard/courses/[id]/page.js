"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTheme, getToken, getSlug } from "../../layout";
import {
  Loader2,
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
  PlayCircle,
  FileText,
  FileQuestion,
  GripVertical,
  Save,
  ChevronRight,
  MonitorPlay,
  BookOpen,
  Upload,
  X,
  AlertTriangle,
  Film,
  CheckCircle2,
  ArrowUpDown,
  Radio,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function CourseDetailsPage() {
  const { dark, primaryColor } = useTheme();
  const pc = primaryColor || "#8b5cf6";
  const slug = getSlug();
  const token = getToken();
  const router = useRouter();
  const params = useParams();
  const courseId = params.id;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeletingLoading, setIsDeletingLoading] = useState(null);

  // Modals
  const [chapterModal, setChapterModal] = useState({ open: false, data: null });
  const [lessonModal, setLessonModal] = useState({
    open: false,
    data: null,
    chapterId: null,
  });
  const [lessonType, setLessonType] = useState("video");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reorder State
  const [draggedLessonId, setDraggedLessonId] = useState(null);
  const [isSavingReorder, setIsSavingReorder] = useState(false);

  // Exam Management State
  const [examsList, setExamsList] = useState([]);
  const [examManagementModal, setExamManagementModal] = useState(false);

  const [winReady, setWinReady] = useState(false);

  useEffect(() => {
    setWinReady(true);
  }, []);

  useEffect(() => {
    fetchCourse();
    fetchExams();
  }, [slug, courseId]);

  const fetchExams = async () => {
    if (slug === "main" || !token) return;
    try {
      const res = await fetch(`/api/v1/exams?slug=${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setExamsList(data);
    } catch (err) {}
  };

  const fetchCourse = async () => {
    if (slug === "main" || !token) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/courses/${courseId}?slug=${slug}`);
      if (!res.ok) throw new Error("فشل جلب تفاصيل الكورس");
      const data = await res.json();
      setCourse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Chapter Handlers ---
  const handleChapterSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get("title");
    const description = formData.get("description") || "";
    const status = formData.get("status") || "active";
    const order_index = formData.get("order_index") || 0;

    setIsSubmitting(true);
    try {
      const isEdit = !!chapterModal.data;
      const url = isEdit
        ? `/api/v1/chapters/${chapterModal.data.id}`
        : `/api/v1/chapters`;

      const method = isEdit ? "PUT" : "POST";

      const submitData = new FormData();
      submitData.append("slug", slug);
      submitData.append("title", title);
      submitData.append("description", description);
      submitData.append("status", status);
      submitData.append("order_index", order_index);
      if (!isEdit) submitData.append("course_id", courseId);

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: submitData,
      });

      if (!res.ok) throw new Error("فشل الحفظ");
      await fetchCourse();
      setChapterModal({ open: false, data: null });
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteChapter = async (id) => {
    if (!window.confirm("حذف هذا الفصل سيؤدي لحذف جميع الدروس داخله. متأكد؟"))
      return;
    setIsDeletingLoading(id);
    try {
      const res = await fetch(`/api/v1/chapters/${id}?slug=${slug}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("فشل الحذف");
      await fetchCourse();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeletingLoading(null);
    }
  };

  // --- Lesson Handlers ---
  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get("title");
    const type = formData.get("type") || lessonType; // Use lessonType if not in form (edit mode)
    const isEdit = !!lessonModal.data;

    setIsSubmitting(true);
    try {
      const url = isEdit
        ? `/api/v1/lessons/${lessonModal.data.id}`
        : `/api/v1/lessons`;
      const method = isEdit ? "PUT" : "POST";

      const submitData = new FormData();
      submitData.append("slug", slug);
      submitData.append("title", title);
      submitData.append("order_index", formData.get("order_index") || 0);
      submitData.append("status", formData.get("status") || "active");
      submitData.append(
        "is_free_preview",
        formData.get("is_free_preview") ? "true" : "false",
      );

      if (!isEdit) {
        submitData.append("chapter_id", lessonModal.chapterId);
        submitData.append("type", type);
      }

      // Type specific fields
      if ((isEdit ? lessonModal.data.type : type) === "video") {
        submitData.append("video_url", formData.get("video_url") || "");
        submitData.append(
          "video_duration_seconds",
          formData.get("video_duration_seconds") || "0",
        );
      } else if ((isEdit ? lessonModal.data.type : type) === "pdf") {
        const file = formData.get("pdf");
        if (file && file.size > 0) submitData.append("pdf", file);
      } else if ((isEdit ? lessonModal.data.type : type) === "exam") {
        submitData.append("exam_id", formData.get("exam_id") || "0");
      }

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: submitData,
      });

      if (!res.ok) throw new Error("فشل حفظ الدرس");
      await fetchCourse();
      setLessonModal({ open: false, data: null, chapterId: null });
      setLessonType("video"); // Reset lesson type after modal close
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteLesson = async (id) => {
    if (!window.confirm("حذف هذا الدرس؟")) return;
    setIsDeletingLoading(`lesson-${id}`);
    try {
      const res = await fetch(`/api/v1/lessons/${id}?slug=${slug}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("فشل الحذف");
      await fetchCourse();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeletingLoading(null);
    }
  };

  // --- Premium Drag & Drop Reordering ---
  const onDragEnd = async (result) => {
    const { destination, source, type } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "chapter") {
      const newChapters = Array.from(course.chapters);
      const [removed] = newChapters.splice(source.index, 1);
      newChapters.splice(destination.index, 0, removed);

      const reorderedChapters = newChapters.map((ch, idx) => ({
        ...ch,
        order_index: idx,
      }));

      // Optimistic update
      setCourse({ ...course, chapters: reorderedChapters });

      // Save to backend
      await saveChapterOrder(reorderedChapters);
    } else if (type === "lesson") {
      const chapterId = source.droppableId.replace("lessons-", "");
      const chapterIdx = course.chapters.findIndex(
        (c) => c.id.toString() === chapterId,
      );
      if (chapterIdx === -1) return;

      const newLessons = Array.from(course.chapters[chapterIdx].lessons);
      const [removed] = newLessons.splice(source.index, 1);
      newLessons.splice(destination.index, 0, removed);

      const reorderedLessons = newLessons.map((l, idx) => ({
        ...l,
        order_index: idx,
      }));

      const newChapters = [...course.chapters];
      newChapters[chapterIdx] = {
        ...newChapters[chapterIdx],
        lessons: reorderedLessons,
      };

      // Optimistic update
      setCourse({ ...course, chapters: newChapters });

      // Save to backend
      await saveLessonOrder(chapterId, reorderedLessons);
    }
  };

  const saveChapterOrder = async (updatedChapters) => {
    setIsSavingReorder(true);
    try {
      const payload = updatedChapters.map((ch, i) => ({
        id: ch.id,
        order_index: i,
      }));
      const res = await fetch(`/api/v1/chapters/reorder?slug=${slug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("فشل حفظ ترتيب الفصول");
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSavingReorder(false);
    }
  };

  const saveLessonOrder = async (chapterId, updatedLessons) => {
    setIsSavingReorder(true);
    try {
      const payload = updatedLessons.map((l, i) => ({
        id: l.id,
        order_index: i,
      }));
      const res = await fetch(`/api/v1/lessons/reorder?slug=${slug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("فشل حفظ ترتيب الدروس");
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSavingReorder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" style={{ color: pc }} />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-red-500">
        <AlertCircle className="mb-4 w-12 h-12" />
        <h2 className="text-xl font-bold">{error || "الكورس غير موجود"}</h2>
        <button
          onClick={() => router.push("/dashboard/courses")}
          className="mt-4 px-6 py-2 rounded-xl bg-gray-100 text-gray-800 font-bold hover:bg-gray-200"
        >
          العودة للكورسات
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Top Bar for back navigation */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => router.push("/dashboard/courses")}
          className={`flex items-center gap-1 text-sm font-bold transition-colors ${dark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
        >
          <ChevronRight className="w-4 h-4" />
          الكورسات
        </button>
      </div>

      {/* Course Banner */}
      <div
        className={`relative overflow-hidden rounded-[2.5rem] p-8 lg:p-12 shadow-2xl ${dark ? "bg-[#141625]" : "bg-white"} flex flex-col md:flex-row gap-8 items-center`}
      >
        <div className="absolute inset-0 z-0">
          {course.full_image_url ? (
            <div className="w-full h-full relative">
              <img
                src={course.full_image_url}
                className="w-full h-full object-cover opacity-20 dark:opacity-10 blur-sm scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
            </div>
          ) : (
            <div className="w-full h-full bg-linear-to-r from-violet-500/10 to-emerald-500/10" />
          )}
        </div>

        <div className="relative z-10 w-full md:w-1/3 shrink-0">
          {course.full_image_url ? (
            <img
              src={course.full_image_url}
              alt="Cover"
              className="w-full aspect-video object-cover rounded-3xl shadow-xl border-4"
              style={{ borderColor: `${pc}40` }}
            />
          ) : (
            <div
              className="w-full aspect-video rounded-3xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center border-4"
              style={{ borderColor: `${pc}40` }}
            >
              <MonitorPlay className="w-16 h-16 opacity-30 text-gray-500" />
            </div>
          )}
        </div>

        <div className="relative z-10 flex-1 w-full text-center md:text-right">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-black shadow-md ${course.status === "active" ? "bg-emerald-500 text-white" : "bg-gray-500 text-white"}`}
            >
              {course.status === "active" ? "نشط ومتاح للطلاب" : "غير نشط"}
            </span>
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-black shadow-md ${course.pricing_type === "free" ? "bg-violet-500 text-white" : "bg-amber-500 text-white"}`}
            >
              {course.pricing_type === "free" ? "مجاني" : "مدفوع"}
            </span>
          </div>
          <h1
            className={`text-3xl lg:text-5xl font-extrabold mb-4 ${dark ? "text-white" : "text-gray-900"}`}
          >
            {course.title}
          </h1>
          <p
            className={`text-base max-w-2xl leading-relaxed ${dark ? "text-gray-300" : "text-gray-600"}`}
          >
            {course.description || "لا يوجد وصف لهذا الكورس"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-2 mt-8 px-2">
        <h2
          className={`text-2xl font-black flex items-center gap-2 ${dark ? "text-white" : "text-gray-900"}`}
        >
          <BookOpen className="w-6 h-6" style={{ color: pc }} />
          المحتوى والفصول
        </h2>
        <button
          onClick={() => setChapterModal({ open: true, data: null })}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all hover:scale-105"
          style={{ backgroundColor: pc }}
        >
          <Plus className="w-4 h-4" /> فصل جديد
        </button>
      </div>

      {/* Chapters & Lessons List with Drag & Drop */}
      {winReady && (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="chapters" type="chapter">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-6"
              >
                {!course.chapters || course.chapters.length === 0 ? (
                  <div
                    className={`p-10 rounded-3xl border-2 border-dashed text-center ${dark ? "border-gray-800" : "border-gray-200"}`}
                  >
                    <p
                      className={`text-lg font-bold ${dark ? "text-gray-500" : "text-gray-400"}`}
                    >
                      لا توجد فصول دراسية، أضف أول فصل الآن
                    </p>
                  </div>
                ) : (
                  course.chapters.map((ch, idx) => (
                    <Draggable
                      key={ch.id}
                      draggableId={ch.id.toString()}
                      index={idx}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`rounded-[2rem] overflow-hidden border transition-all ${snapshot.isDragging ? "shadow-2xl z-50 scale-[1.01]" : ""} ${dark ? "bg-[#1a1d2d] border-white/5" : "bg-white border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)]"}`}
                        >
                          {/* Chapter Header */}
                          <div
                            className={`p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b ${dark ? "bg-[#141625] border-white/5" : "bg-gray-50/80 border-gray-100"}`}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                {...provided.dragHandleProps}
                                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-lg cursor-grab active:cursor-grabbing"
                                style={{ background: pc }}
                              >
                                {idx + 1}
                              </div>
                              <div>
                                <h3
                                  className={`text-xl font-extrabold ${dark ? "text-white" : "text-gray-900"}`}
                                >
                                  {ch.title}
                                </h3>
                                {ch.description && (
                                  <p
                                    className={`text-sm mt-1 ${dark ? "text-gray-400" : "text-gray-500"}`}
                                  >
                                    {ch.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isSavingReorder && (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-bold animate-pulse">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  جاري الحفظ...
                                </div>
                              )}
                              <button
                                onClick={() => {
                                  setLessonModal({
                                    open: true,
                                    data: null,
                                    chapterId: ch.id,
                                  });
                                  setLessonType("video");
                                }}
                                className="w-10 h-10 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 flex items-center justify-center transition"
                                title="إضافة درس"
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() =>
                                  setChapterModal({ open: true, data: ch })
                                }
                                className="w-10 h-10 rounded-xl bg-gray-500/10 hover:bg-gray-500/20 text-gray-600 dark:text-gray-400 flex items-center justify-center transition"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteChapter(ch.id)}
                                className="w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition"
                              >
                                {isDeletingLoading === ch.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Lessons List - Draggable */}
                          <Droppable
                            droppableId={`lessons-${ch.id}`}
                            type="lesson"
                          >
                            {(provided) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="p-4 space-y-2 relative"
                              >
                                {!ch.lessons || ch.lessons.length === 0 ? (
                                  <div
                                    className={`p-4 text-center rounded-xl text-sm font-bold ${dark ? "text-gray-500 bg-white/5" : "text-gray-400 bg-gray-50"}`}
                                  >
                                    لا يوجد دروس بهذا الفصل
                                  </div>
                                ) : (
                                  ch.lessons.map((lesson, lIdx) => (
                                    <Draggable
                                      key={lesson.id}
                                      draggableId={lesson.id.toString()}
                                      index={lIdx}
                                    >
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className={`flex items-center justify-between p-3.5 pr-4 rounded-2xl border transition-all cursor-move
                                            ${snapshot.isDragging ? "shadow-xl z-[60] scale-[1.02] border-violet-500/30" : "hover:-translate-y-0.5"}
                                            ${dark ? "bg-[#0b0c10] border-white/5 hover:border-white/20" : "bg-white border-gray-100 hover:shadow-md hover:border-violet-200"}`}
                                        >
                                          <div className="flex items-center gap-3">
                                            <GripVertical className="w-5 h-5 opacity-30 text-gray-500" />
                                            <div
                                              className={`w-10 h-10 rounded-xl flex items-center justify-center
                                                ${lesson.type === "video" ? "bg-red-500/10 text-red-500" : lesson.type === "pdf" ? "bg-orange-500/10 text-orange-500" : lesson.type === "exam" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}
                                            >
                                              {lesson.type === "video" && (
                                                <PlayCircle className="w-5 h-5" />
                                              )}
                                              {lesson.type === "pdf" && (
                                                <FileText className="w-5 h-5" />
                                              )}
                                              {lesson.type === "exam" && (
                                                <FileQuestion className="w-5 h-5" />
                                              )}
                                              {lesson.type ===
                                                "live_session" && (
                                                <Radio className="w-5 h-5" />
                                              )}
                                            </div>
                                            <div>
                                              <p
                                                className={`text-sm font-bold ${dark ? "text-white" : "text-gray-900"}`}
                                              >
                                                {lesson.title}
                                              </p>
                                              <p
                                                className={`text-[10px] uppercase font-bold tracking-widest mt-0.5 ${dark ? "text-gray-500" : "text-gray-400"}`}
                                              >
                                                {lesson.type === "video"
                                                  ? "فيديو"
                                                  : lesson.type === "pdf"
                                                    ? "ملف PDF"
                                                    : lesson.type === "exam"
                                                      ? "امتحان"
                                                      : "بث مباشر"}
                                              </p>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-2">
                                            {lesson.is_free_preview && (
                                              <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-500 text-[10px] font-black mr-2">
                                                مفتوح للجميع
                                              </span>
                                            )}
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setLessonModal({
                                                  open: true,
                                                  data: lesson,
                                                  chapterId: ch.id,
                                                });
                                                setLessonType(lesson.type);
                                              }}
                                              className="w-8 h-8 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition text-gray-500"
                                            >
                                              <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                deleteLesson(lesson.id);
                                              }}
                                              className="w-8 h-8 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-500 dark:hover:bg-red-500/10 flex items-center justify-center transition"
                                            >
                                              {isDeletingLoading ===
                                              `lesson-${lesson.id}` ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                              ) : (
                                                <Trash2 className="w-4 h-4" />
                                              )}
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))
                                )}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Chapter Modal */}
      {chapterModal.open && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setChapterModal({ open: false, data: null })}
          />
          <div
            className={`relative w-full max-w-lg rounded-3xl p-8 shadow-2xl ${dark ? "bg-[#141625]" : "bg-white"}`}
          >
            <h2
              className="text-xl font-black mb-6 border-r-4 pr-3 py-1"
              style={{ borderColor: pc }}
            >
              {chapterModal.data ? "تعديل الفصل" : "تسجيل فصل جديد"}
            </h2>
            <form onSubmit={handleChapterSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">
                  اسم الفصل *
                </label>
                <input
                  required
                  name="title"
                  defaultValue={chapterModal.data?.title}
                  className="w-full p-3 rounded-xl border dark:bg-black/40 dark:border-white/10 outline-none"
                  placeholder="مثال: الباب الأول: الكيمياء العضوية"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">
                  وصف مختصر
                </label>
                <textarea
                  rows={2}
                  name="description"
                  defaultValue={chapterModal.data?.description}
                  className="w-full p-3 rounded-xl border dark:bg-black/40 dark:border-white/10 outline-none resize-none"
                  placeholder="نبذة عن محتوى الفصل..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">
                    الترتيب
                  </label>
                  <input
                    type="number"
                    name="order_index"
                    defaultValue={chapterModal.data?.order_index || 0}
                    className="w-full p-3 rounded-xl border dark:bg-black/40 dark:border-white/10 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">الحالة</label>
                  <select
                    name="status"
                    defaultValue={chapterModal.data?.status || "active"}
                    className="w-full p-3 rounded-xl border dark:bg-black/40 dark:border-white/10 outline-none"
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2"
                  style={{ background: pc }}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}{" "}
                  حفظ الفصل
                </button>
                <button
                  type="button"
                  onClick={() => setChapterModal({ open: false, data: null })}
                  className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 font-bold"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Modal — FULL SCREEN */}
      {lessonModal.open && (
        <LessonFullScreenModal
          lessonModal={lessonModal}
          setLessonModal={setLessonModal}
          lessonType={lessonType}
          setLessonType={setLessonType}
          handleLessonSubmit={handleLessonSubmit}
          isSubmitting={isSubmitting}
          examsList={examsList}
          setExamManagementModal={setExamManagementModal}
          dark={dark}
          pc={pc}
          slug={slug}
          token={token}
        />
      )}

      {/* Exam Management Full Screen Modal */}
      {examManagementModal && (
        <ExamManager
          onClose={() => {
            setExamManagementModal(false);
            fetchExams();
          }}
          pc={pc}
          dark={dark}
          slug={slug}
          token={token}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────
// LESSON FULL SCREEN MODAL
// ─────────────────────────────────────────────────
function LessonFullScreenModal({
  lessonModal,
  setLessonModal,
  lessonType,
  setLessonType,
  handleLessonSubmit,
  isSubmitting,
  examsList,
  setExamManagementModal,
  dark,
  pc,
  slug,
  token,
}) {
  const [videoFile, setVideoFile] = useState(null);
  const [uploadState, setUploadState] = useState(null); // null | { status, progress, video_id, video_url, error }
  const [isUploading, setIsUploading] = useState(false);
  const sseRef = useRef(null);
  const pollRef = useRef(null);

  // Warn user before closing during upload
  useEffect(() => {
    const handler = (e) => {
      if (isUploading) {
        e.preventDefault();
        e.returnValue = "جاري رفع الفيديو، هل أنت متأكد أنك تريد المغادرة؟";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isUploading]);

  // Cleanup SSE on unmount
  useEffect(() => {
    return () => {
      if (sseRef.current) sseRef.current.close();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const tryClose = () => {
    if (isUploading) {
      if (
        !window.confirm(
          "⚠️ جاري رفع الفيديو حالياً! هل أنت متأكد أنك تريد الإغلاق؟",
        )
      )
        return;
    }
    setLessonModal({ open: false, data: null, chapterId: null });
  };

  const handleVideoUpload = async () => {
    if (!videoFile) return;

    // 1. Storage Check
    try {
      const sRes = await fetch(
        `/api/v1/tenants/video-wallet-stats?slug=${slug}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const sData = await sRes.json();
      if (sData.success) {
        const availableGB = sData.data.available_gb || 0;
        const fileSizeGB = videoFile.size / (1024 * 1024 * 1024);

        if (fileSizeGB > availableGB) {
          alert(
            `⚠️ مساحة التخزين غير كافية! \nالمتبقي لديك: ${availableGB.toFixed(
              2,
            )} جيجا \nحجم الفيديو: ${fileSizeGB.toFixed(2)} جيجا`,
          );
          return;
        }
      }
    } catch (e) {
      console.error("Storage check failed", e);
    }

    setIsUploading(true);
    setUploadState({
      status: "uploading",
      progress: 0,
      video_id: null,
      video_url: null,
      error: null,
    });

    try {
      const fd = new FormData();
      fd.append("slug", slug);
      fd.append("video", videoFile);

      const res = await fetch("/api/v1/videos/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "فشل رفع الفيديو");

      const videoId = data.video_id;
      setUploadState((prev) => ({
        ...prev,
        status: "processing",
        progress: 5,
        video_id: videoId,
      }));

      // SSE for live progress
      const sse = new EventSource(`/api/v1/videos/${videoId}/stream`);
      sseRef.current = sse;

      sse.onmessage = (event) => {
        try {
          const evt = JSON.parse(event.data);
          setUploadState((prev) => ({
            ...prev,
            status: evt.status,
            progress: evt.progress,
            video_url: evt.url || prev?.video_url,
            error: evt.error || null,
          }));
          if (evt.status === "ready" || evt.status === "failed") {
            sse.close();
            sseRef.current = null;
            setIsUploading(false);
          }
        } catch (e) {}
      };

      sse.onerror = () => {
        sse.close();
        sseRef.current = null;
        // Fallback to polling
        pollRef.current = setInterval(async () => {
          try {
            const r = await fetch(`/api/v1/videos/${videoId}/status`);
            const d = await r.json();
            setUploadState((prev) => ({
              ...prev,
              status: d.status,
              progress: d.progress,
              video_url: d.video_url || prev?.video_url,
              error: d.error_message || null,
            }));
            if (d.status === "ready" || d.status === "failed") {
              clearInterval(pollRef.current);
              pollRef.current = null;
              setIsUploading(false);
            }
          } catch (e) {}
        }, 3000);
      };
    } catch (err) {
      setUploadState((prev) => ({
        ...prev,
        status: "failed",
        error: err.message,
      }));
      setIsUploading(false);
    }
  };

  const fmtSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  };

  const effectiveType = lessonModal.data ? lessonModal.data.type : lessonType;
  const isVideo = effectiveType === "video";

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col"
      style={{ background: dark ? "#0b0c10" : "#f3f4f6" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 shrink-0 border-b"
        style={{
          background: dark ? "#141625" : "#ffffff",
          borderColor: dark ? "rgba(255,255,255,0.08)" : "#e5e7eb",
        }}
      >
        <h2 className="text-xl font-black flex items-center gap-3">
          <span className="w-1.5 h-8 rounded-full" style={{ background: pc }} />
          {lessonModal.data ? "✏️ تعديل الدرس" : "➕ إضافة درس جديد"}
        </h2>
        <button
          onClick={tryClose}
          className="p-2 rounded-xl hover:bg-red-500/10 text-red-500 transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Upload Warning Banner */}
      {isUploading && (
        <div className="flex items-center gap-3 px-6 py-3 bg-amber-500/10 border-b border-amber-500/20 text-amber-600 shrink-0">
          <AlertTriangle className="w-5 h-5 shrink-0 animate-pulse" />
          <span className="font-bold text-sm">
            ⚠️ رجاء لا تغادر هذه الصفحة أثناء رفع ومعالجة الفيديو!
          </span>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleLessonSubmit} className="space-y-6">
            {/* Title */}
            <div
              className={`p-6 rounded-2xl border ${dark ? "bg-[#141625] border-white/8" : "bg-white border-gray-200"}`}
            >
              <label className="block text-sm font-black mb-2">
                عنوان الدرس *
              </label>
              <input
                required
                name="title"
                defaultValue={lessonModal.data?.title}
                className={`w-full p-4 rounded-xl border-2 outline-none text-lg font-bold transition-all focus:ring-2 ${dark ? "bg-black/40 border-white/10 focus:border-violet-500 focus:ring-violet-500/20" : "bg-gray-50 border-gray-200 focus:border-violet-500 focus:ring-violet-500/20"}`}
                placeholder="مثال: المحاضرة الأولى — المقدمة"
              />
            </div>

            {/* Type Selector (new only) */}
            {!lessonModal.data && (
              <div
                className={`p-6 rounded-2xl border ${dark ? "bg-[#141625] border-white/8" : "bg-white border-gray-200"}`}
              >
                <label className="block text-sm font-black mb-3">
                  نوع المحتوى *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    {
                      id: "video",
                      label: "فيديو",
                      icon: PlayCircle,
                      color: "#8b5cf6",
                    },
                    {
                      id: "pdf",
                      label: "ملف PDF",
                      icon: FileText,
                      color: "#3b82f6",
                    },
                    {
                      id: "exam",
                      label: "امتحان",
                      icon: FileQuestion,
                      color: "#ef4444",
                    },
                    {
                      id: "live_session",
                      label: "بث مباشر",
                      icon: Radio,
                      color: "#f43f5e",
                    },
                  ].map((t) => (
                    <label
                      key={t.id}
                      className={`p-5 rounded-2xl border-2 cursor-pointer flex flex-col items-center gap-3 transition-all hover:scale-[1.02] ${lessonType === t.id ? "shadow-lg" : "opacity-60 hover:opacity-100"}`}
                      style={{
                        borderColor:
                          lessonType === t.id
                            ? t.color
                            : dark
                              ? "rgba(255,255,255,0.1)"
                              : "#e5e7eb",
                        background:
                          lessonType === t.id ? t.color + "15" : "transparent",
                      }}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={t.id}
                        checked={lessonType === t.id}
                        onChange={(e) => setLessonType(e.target.value)}
                        className="hidden"
                      />
                      <t.icon className="w-8 h-8" style={{ color: t.color }} />
                      <span className="text-sm font-black">{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Content Section */}
            <div
              className={`p-6 rounded-2xl border ${dark ? "bg-[#141625] border-white/8" : "bg-white border-gray-200"}`}
            >
              <h3 className="text-sm font-black mb-4 flex items-center gap-2">
                {isVideo ? (
                  <Film className="w-4 h-4" style={{ color: pc }} />
                ) : effectiveType === "pdf" ? (
                  <FileText className="w-4 h-4 text-blue-500" />
                ) : (
                  <FileQuestion className="w-4 h-4 text-red-500" />
                )}
                محتوى الدرس
              </h3>

              {/* VIDEO CONTENT */}
              {isVideo && (
                <div className="space-y-5">
                  {/* UPLOAD VIDEO FILE */}
                  <div
                    className={`p-5 rounded-2xl border-2 border-dashed transition-all ${dark ? "border-violet-500/30 bg-violet-500/5" : "border-violet-300 bg-violet-50"}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Upload className="w-5 h-5" style={{ color: pc }} />
                      <h4 className="font-black text-sm">
                        رفع فيديو مباشر (MP4)
                      </h4>
                    </div>
                    <input
                      type="file"
                      accept="video/mp4,video/*"
                      onChange={(e) =>
                        setVideoFile(e.target.files?.[0] || null)
                      }
                      className={`w-full p-3 rounded-xl border outline-none ${dark ? "bg-black/40 border-white/10" : "bg-white border-gray-200"}`}
                    />
                    {videoFile && (
                      <div className="mt-3 flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${dark ? "text-gray-400" : "text-gray-500"}`}
                        >
                          📁 {videoFile.name} — {fmtSize(videoFile.size)}
                        </span>
                        <button
                          type="button"
                          onClick={handleVideoUpload}
                          disabled={isUploading}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-black text-sm transition-all hover:-translate-y-0.5 disabled:opacity-50"
                          style={{
                            background: pc,
                            boxShadow: `0 4px 15px ${pc}40`,
                          }}
                        >
                          {isUploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          {isUploading ? "جاري الرفع..." : "ابدأ الرفع"}
                        </button>
                      </div>
                    )}

                    {/* Progress */}
                    {uploadState && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span>
                            {uploadState.status === "uploading" &&
                              "⬆️ جاري رفع الملف..."}
                            {uploadState.status === "pending" &&
                              "⏳ في الانتظار..."}
                            {uploadState.status === "processing" &&
                              "⚙️ جاري المعالجة والتحويل..."}
                            {uploadState.status === "ready" && "✅ تم بنجاح!"}
                            {uploadState.status === "failed" &&
                              "❌ فشلت المعالجة"}
                          </span>
                          <span style={{ color: pc }}>
                            {uploadState.progress}%
                          </span>
                        </div>
                        <div
                          className="h-3 rounded-full overflow-hidden"
                          style={{
                            background: dark
                              ? "rgba(255,255,255,0.1)"
                              : "#e5e7eb",
                          }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-500 ease-out"
                            style={{
                              width: `${uploadState.progress}%`,
                              background:
                                uploadState.status === "failed"
                                  ? "#ef4444"
                                  : uploadState.status === "ready"
                                    ? "#10b981"
                                    : `linear-gradient(90deg, ${pc}, #a78bfa)`,
                            }}
                          />
                        </div>
                        {uploadState.status === "ready" &&
                          uploadState.video_url && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 text-emerald-600 mt-2">
                              <CheckCircle2 className="w-5 h-5" />
                              <span className="text-sm font-bold">
                                الفيديو جاهز — الرابط تم تعبئته تلقائياً
                              </span>
                            </div>
                          )}
                        {uploadState.status === "failed" &&
                          uploadState.error && (
                            <p className="text-xs font-bold text-red-500 mt-1">
                              ❌ {uploadState.error}
                            </p>
                          )}
                      </div>
                    )}
                  </div>

                  {/* OR: External URL */}
                  <div className="relative flex items-center gap-3 my-2">
                    <div
                      className="flex-1 h-px"
                      style={{
                        background: dark ? "rgba(255,255,255,0.1)" : "#e5e7eb",
                      }}
                    />
                    <span
                      className={`text-xs font-black px-3 ${dark ? "text-gray-500" : "text-gray-400"}`}
                    >
                      أو أدخل رابط خارجي
                    </span>
                    <div
                      className="flex-1 h-px"
                      style={{
                        background: dark ? "rgba(255,255,255,0.1)" : "#e5e7eb",
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5 opacity-70">
                      رابط الفيديو (Vimeo/YouTube/External)
                    </label>
                    <input
                      type="text"
                      name="video_url"
                      defaultValue={
                        uploadState?.video_url ||
                        lessonModal.data?.video_url ||
                        ""
                      }
                      key={uploadState?.video_url || "default"}
                      className={`w-full p-3 rounded-xl border outline-none ${dark ? "bg-black/40 border-white/10" : "bg-gray-50 border-gray-200"}`}
                      placeholder="https://..."
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5 opacity-70">
                      مدة الفيديو (بالثواني)
                    </label>
                    <input
                      type="number"
                      name="video_duration_seconds"
                      defaultValue={
                        lessonModal.data?.video_duration_seconds || 0
                      }
                      className={`w-full p-3 rounded-xl border outline-none text-left ${dark ? "bg-black/40 border-white/10" : "bg-gray-50 border-gray-200"}`}
                      dir="ltr"
                    />
                  </div>
                </div>
              )}

              {/* PDF CONTENT */}
              {effectiveType === "pdf" && (
                <div className="space-y-3">
                  {lessonModal.data?.full_pdf_url && (
                    <a
                      href={lessonModal.data.full_pdf_url}
                      target="_blank"
                      className="text-blue-500 font-bold text-sm underline"
                    >
                      عرض الملف الحالي
                    </a>
                  )}
                  <div>
                    <label className="block text-xs font-bold mb-1.5 opacity-70">
                      رفع ملف PDF {lessonModal.data && "(اختياري)"}
                    </label>
                    <input
                      type="file"
                      name="pdf"
                      accept=".pdf"
                      className={`w-full p-3 rounded-xl border ${dark ? "bg-black/40 border-white/10" : "bg-white border-gray-200"}`}
                    />
                  </div>
                </div>
              )}

              {/* EXAM CONTENT */}
              {effectiveType === "exam" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 opacity-70">
                      اختر الامتحان
                    </label>
                    <select
                      name="exam_id"
                      defaultValue={lessonModal.data?.exam_id || ""}
                      className={`w-full p-3 rounded-xl border outline-none ${dark ? "bg-black/40 border-white/10" : "bg-gray-50 border-gray-200"}`}
                    >
                      <option value="">-- اختر امتحاناً --</option>
                      {examsList.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExamManagementModal(true)}
                    className="w-full py-3 rounded-xl border-2 border-dashed border-violet-500/30 text-violet-600 dark:text-violet-400 font-bold hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors"
                  >
                    إدارة وإنشاء الامتحانات والأسئلة
                  </button>
                </div>
              )}
            </div>

            {/* Settings Row */}
            <div
              className={`p-6 rounded-2xl border ${dark ? "bg-[#141625] border-white/8" : "bg-white border-gray-200"}`}
            >
              <h3 className="text-sm font-black mb-4">⚙️ إعدادات الدرس</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 opacity-70">
                    الترتيب
                  </label>
                  <input
                    type="number"
                    name="order_index"
                    defaultValue={lessonModal.data?.order_index || 0}
                    className={`w-full p-3 rounded-xl border outline-none ${dark ? "bg-black/40 border-white/10" : "bg-gray-50 border-gray-200"}`}
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer p-3 bg-amber-500/10 text-amber-600 rounded-xl">
                    <input
                      type="checkbox"
                      name="is_free_preview"
                      defaultChecked={lessonModal.data?.is_free_preview}
                      className="w-5 h-5 accent-amber-500"
                    />
                    <span className="text-sm font-bold">
                      متاح للجميع (معاينة مجانية)
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div
              className={`p-6 rounded-2xl border flex items-center gap-3 ${dark ? "bg-[#141625] border-white/8" : "bg-white border-gray-200"}`}
            >
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="flex-1 py-4 rounded-xl text-white font-black text-lg flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5 disabled:opacity-50"
                style={{ background: pc, boxShadow: `0 6px 25px ${pc}30` }}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                حفظ الدرس
              </button>
              <button
                type="button"
                onClick={tryClose}
                className={`px-8 py-4 rounded-xl font-bold text-lg ${dark ? "bg-white/10 text-gray-300 hover:bg-white/15" : "bg-gray-100 text-gray-700 hover:bg-gray-200"} transition-all`}
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// EXAM MANAGER COMPONENT
// ─────────────────────────────────────────────────
function ExamManager({ onClose, pc, dark, slug, token }) {
  const [view, setView] = useState("list"); // list, edit_exam, manage_questions, edit_question
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [qType, setQType] = useState("mcq");
  const [examResults, setExamResults] = useState([]);
  const [examStats, setExamStats] = useState(null);

  const [loading, setLoading] = useState(false);
  const [draggedQId, setDraggedQId] = useState(null);
  const [isSavingReorder, setIsSavingReorder] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/exams?slug=${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setExams(data);
    } finally {
      setLoading(false);
    }
  };

  const handleExamSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const body = new URLSearchParams();
    body.append("slug", slug);
    for (const [k, v] of formData.entries()) {
      body.append(k, v);
    }
    body.set(
      "shuffle_questions",
      formData.get("shuffle_questions") ? "true" : "false",
    );
    body.set(
      "shuffle_options",
      formData.get("shuffle_options") ? "true" : "false",
    );
    body.set(
      "show_correct_answers",
      formData.get("show_correct_answers") ? "true" : "false",
    );
    body.set(
      "show_score_after_submit",
      formData.get("show_score_after_submit") ? "true" : "false",
    );

    // Debug: log what we're sending
    console.log("[ExamSubmit] sending:", body.toString());

    const isEdit = !!selectedExam?.id;
    const url = isEdit ? `/api/v1/exams/${selectedExam.id}` : `/api/v1/exams`;

    setLoading(true);
    try {
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData?.error || `HTTP ${res.status}`);
      }
      await fetchExams();
      setView("list");
    } catch (err) {
      alert("❌ خطأ: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteExam = async (id) => {
    if (!window.confirm("حذف الامتحان يعني حذف جميع أسئلته ونتائجه، متأكد؟"))
      return;
    try {
      await fetch(`/api/v1/exams/${id}?slug=${slug}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchExams();
    } catch (err) {}
  };

  const openQuestions = async (exam) => {
    setSelectedExam(exam);
    await fetchQuestions(exam.id);
    setView("manage_questions");
  };

  const openResults = async (exam) => {
    setSelectedExam(exam);
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/exams/${exam.id}/results?slug=${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setExamStats(data);
      setExamResults(data.results || []);
      setView("results");
    } catch (err) {
      alert("خطأ في جلب النتائج");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (examId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/exams/${examId}?slug=${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setQuestions(data.questions || []);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append("slug", slug);
    if (!selectedQuestion) {
      formData.append("exam_id", selectedExam.id);
      formData.append("type", qType);
    } else {
      formData.append("type", selectedQuestion.type);
    }
    const isEdit = !!selectedQuestion;
    const url = isEdit
      ? `/api/v1/exam-questions/${selectedQuestion.id}`
      : `/api/v1/exam-questions`;
    setLoading(true);
    try {
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("فشل الحفظ");
      await fetchQuestions(selectedExam.id);
      setView("manage_questions");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm("حذف السؤال نهائياً؟")) return;
    try {
      await fetch(`/api/v1/exam-questions/${id}?slug=${slug}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchQuestions(selectedExam.id);
    } catch (err) {}
  };

  const onDragStart = (e, id) => {
    setDraggedQId(id);
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  const onDrop = (e, targetId) => {
    e.preventDefault();
    if (!draggedQId || draggedQId === targetId) return;
    setQuestions((prevList) => {
      const items = [...prevList];
      const fromIdx = items.findIndex((q) => q.id === draggedQId);
      const toIdx = items.findIndex((q) => q.id === targetId);
      if (fromIdx < 0 || toIdx < 0) return items;
      const [moved] = items.splice(fromIdx, 1);
      items.splice(toIdx, 0, moved);
      items.forEach((q, i) => {
        q.order_index = i;
      });
      setDraggedQId(null);
      return items;
    });
  };

  const saveQOrder = async () => {
    setIsSavingReorder(true);
    try {
      const payload = questions.map((q) => ({
        id: q.id,
        order_index: q.order_index,
      }));
      await fetch(`/api/v1/exam-questions/reorder?slug=${slug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      alert("✅ تم حفظ ترتيب الأسئلة");
    } finally {
      setIsSavingReorder(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm`}
    >
      <div
        className={`relative w-full h-[90vh] max-w-5xl rounded-3xl shadow-2xl overflow-y-auto ${dark ? "bg-[#141625]" : "bg-white"} p-8`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b dark:border-white/10">
          <h2
            className={`text-2xl font-black ${dark ? "text-white" : "text-gray-900"}`}
          >
            {view === "list" && "إدارة الامتحانات"}
            {view === "edit_exam" &&
              (selectedExam ? "تعديل الامتحان" : "امتحان جديد")}
            {view === "manage_questions" && `أسئلة: ${selectedExam?.title}`}
            {view === "edit_question" && "محرر الأسئلة"}
            {view === "results" && `نتائج: ${selectedExam?.title}`}
          </h2>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 dark:bg-white/10 hover:bg-red-100 text-gray-700 dark:text-gray-300 hover:text-red-500 rounded-xl font-bold transition"
          >
            إغلاق
          </button>
        </div>

        {view === "list" && (
          <div>
            <div className="flex justify-end mb-6">
              <button
                onClick={() => {
                  setSelectedExam(null);
                  setView("edit_exam");
                }}
                className="px-6 py-3 rounded-xl text-white font-bold transition-transform hover:scale-105"
                style={{ backgroundColor: pc }}
              >
                + إنشاء امتحان جديد
              </button>
            </div>
            {loading ? (
              <div className="text-center p-10">جاري التحميل...</div>
            ) : (
              <div className="space-y-3">
                {exams.length === 0 && (
                  <div className="text-center p-10 border border-dashed rounded-2xl dark:border-white/10 dark:text-gray-500">
                    لا توجد امتحانات، أنشئ أول امتحان لك الآن!
                  </div>
                )}
                {exams.map((ex) => (
                  <div
                    key={ex.id}
                    className={`p-5 rounded-2xl flex items-center justify-between border ${dark ? "bg-[#0b0c10] border-white/5" : "bg-gray-50 border-gray-100"}`}
                  >
                    <div>
                      <h3 className="text-lg font-bold">{ex.title}</h3>
                      <p className="text-sm opacity-60">
                        مدة الامتحان: {ex.duration_minutes} دقيقة | نسبة النجاح:
                        %{ex.passing_score}
                      </p>
                      <p
                        className="text-sm font-bold mt-1"
                        style={{ color: pc }}
                      >
                        الأسئلة المدرجة: {ex.questions_count}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openResults(ex)}
                        className="px-4 py-2 bg-emerald-500/10 text-emerald-500 font-bold rounded-xl text-sm hover:bg-emerald-500/20"
                      >
                        النتائج
                      </button>
                      <button
                        onClick={() => openQuestions(ex)}
                        className="px-4 py-2 bg-blue-500/10 text-blue-500 font-bold rounded-xl text-sm hover:bg-blue-500/20"
                      >
                        إدارة الأسئلة
                      </button>
                      <button
                        onClick={() => {
                          setSelectedExam(ex);
                          setView("edit_exam");
                        }}
                        className="px-4 py-2 bg-amber-500/10 text-amber-500 font-bold rounded-xl text-sm hover:bg-amber-500/20"
                      >
                        إعدادات (تعديل)
                      </button>
                      <button
                        onClick={() => deleteExam(ex.id)}
                        className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex justify-center items-center hover:bg-red-500/20"
                      >
                        X
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === "edit_exam" && (
          <form
            onSubmit={handleExamSubmit}
            className="space-y-4 max-w-2xl mx-auto"
          >
            <div>
              <label className="block text-sm font-bold mb-2">
                عنوان الامتحان
              </label>
              <input
                required
                name="title"
                defaultValue={selectedExam?.title}
                className="w-full p-3 rounded-xl border dark:bg-black/40 dark:border-white/10 outline-none"
                placeholder="امتحان منتصف العام..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">وصف قصير</label>
              <textarea
                name="description"
                defaultValue={selectedExam?.description}
                rows={2}
                className="w-full p-3 rounded-xl border dark:bg-black/40 dark:border-white/10 outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold mb-2">
                  المدة (بالدقائق)
                </label>
                <input
                  type="number"
                  name="duration_minutes"
                  defaultValue={selectedExam?.duration_minutes || 60}
                  className="w-full p-3 rounded-xl border dark:bg-black/40 dark:border-white/10 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2">
                  درجة النجاح %
                </label>
                <input
                  type="number"
                  name="passing_score"
                  defaultValue={selectedExam?.passing_score || 50}
                  className="w-full p-3 rounded-xl border dark:bg-black/40 dark:border-white/10 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2">
                  محاولات قصوى
                </label>
                <input
                  type="number"
                  name="max_attempts"
                  placeholder="0 للمفتوح"
                  defaultValue={selectedExam?.max_attempts || 0}
                  className="w-full p-3 rounded-xl border dark:bg-black/40 dark:border-white/10 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  name="shuffle_questions"
                  defaultChecked={selectedExam?.shuffle_questions}
                  className="w-5 h-5 accent-violet-500"
                />{" "}
                <span className="text-sm font-bold">خلط الأسئلة عشوائياً</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  name="shuffle_options"
                  defaultChecked={selectedExam?.shuffle_options}
                  className="w-5 h-5 accent-violet-500"
                />{" "}
                <span className="text-sm font-bold">
                  خلط الاختيارات عشوائياً
                </span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  name="show_score_after_submit"
                  defaultChecked={selectedExam?.show_score_after_submit ?? true}
                  className="w-5 h-5 accent-violet-500"
                />{" "}
                <span className="text-sm font-bold">
                  إظهار الدرجة بعد الإرسال
                </span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  name="show_correct_answers"
                  defaultChecked={selectedExam?.show_correct_answers ?? true}
                  className="w-5 h-5 accent-violet-500"
                />{" "}
                <span className="text-sm font-bold">
                  إظهار الإجابات الصحيحة
                </span>
              </label>
            </div>

            <div className="flex gap-2 pt-6 border-t dark:border-white/10">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl text-white font-bold"
                style={{ backgroundColor: pc }}
              >
                {loading ? "جاري الحفظ..." : "حفظ بيانات الامتحان"}
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className="px-6 py-3 rounded-xl bg-gray-200 dark:bg-white/10 font-bold"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}

        {view === "results" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 rounded-xl border bg-gray-50 border-gray-100 flex flex-col">
                <span className="text-gray-500 font-bold text-sm mb-1">
                  المحاولات
                </span>
                <span className="text-2xl font-black">
                  {examStats?.total_attempts}
                </span>
              </div>
              <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-100 flex flex-col">
                <span className="text-emerald-500 font-bold text-sm mb-1">
                  ناجح
                </span>
                <span className="text-2xl font-black text-emerald-600">
                  {examStats?.passed_count}
                </span>
              </div>
              <div className="p-4 rounded-xl border bg-red-50 border-red-100 flex flex-col">
                <span className="text-red-500 font-bold text-sm mb-1">
                  راسب
                </span>
                <span className="text-2xl font-black text-red-600">
                  {examStats?.failed_count}
                </span>
              </div>
              <div className="p-4 rounded-xl border bg-blue-50 border-blue-100 flex flex-col">
                <span className="text-blue-500 font-bold text-sm mb-1">
                  متوسط الدرجات
                </span>
                <span className="text-2xl font-black text-blue-600">
                  {examStats?.avg_score}%
                </span>
              </div>
            </div>

            {loading ? (
              <div className="p-10 text-center text-gray-400 font-bold">
                جاري تحميل النتائج...
              </div>
            ) : examResults.length === 0 ? (
              <div className="p-10 text-center border border-dashed rounded-2xl">
                لم يمتحن أحد هذا الامتحان بعد.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border">
                <table className="w-full text-right align-middle">
                  <thead className="bg-gray-50 dark:bg-white/5 border-b">
                    <tr>
                      <th className="p-4 font-bold text-sm text-gray-500">
                        اسم الطالب
                      </th>
                      <th className="p-4 font-bold text-sm text-gray-500">
                        رقم الهاتف
                      </th>
                      <th className="p-4 font-bold text-sm text-gray-500">
                        تاريخ التسليم
                      </th>
                      <th className="p-4 font-bold text-sm text-gray-500">
                        الدرجة
                      </th>
                      <th className="p-4 font-bold text-sm text-gray-500">
                        النتيجة
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm font-bold">
                    {examResults.map((r) => (
                      <tr key={r.attempt_id} className="hover:bg-gray-50/50">
                        <td className="p-4">{r.student_name}</td>
                        <td className="p-4" dir="ltr">
                          {r.student_phone}
                        </td>
                        <td className="p-4">
                          {new Date(r.submitted_at).toLocaleString("ar-EG")}
                        </td>
                        <td className="p-4">
                          {r.score} من {r.total_points} ({r.percentage}%)
                        </td>
                        <td className="p-4">
                          {r.passed ? (
                            <span className="text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg text-xs">
                              ناجح
                            </span>
                          ) : (
                            <span className="text-red-500 bg-red-50 px-2 py-1 rounded-lg text-xs">
                              راسب
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <button
              onClick={() => setView("list")}
              className="px-6 py-2.5 rounded-xl bg-gray-200 dark:bg-white/10 font-bold mt-4"
            >
              العودة للامتحانات
            </button>
          </div>
        )}

        {view === "manage_questions" && (
          <div>
            <div className="flex justify-between items-center mb-6 bg-gray-50 dark:bg-white/5 p-4 rounded-2xl">
              <button
                onClick={() => setView("list")}
                className="px-4 py-2 font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl"
              >
                &rarr; عودة
              </button>
              <div className="flex gap-2">
                <button
                  onClick={saveQOrder}
                  disabled={isSavingReorder}
                  className="px-6 py-2 rounded-xl text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 font-bold"
                >
                  {" "}
                  {isSavingReorder ? "جاري الحفظ..." : "حفظ الترتيب وعرضه"}{" "}
                </button>
                <button
                  onClick={() => {
                    setSelectedQuestion(null);
                    setQType("mcq");
                    setView("edit_question");
                  }}
                  className="px-6 py-2 rounded-xl text-white font-bold hover:scale-105 transition-transform"
                  style={{ backgroundColor: pc }}
                >
                  {" "}
                  + إضافة سؤال جديد
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center p-10">جاري التحميل...</div>
            ) : (
              <div className="space-y-2">
                {questions.length === 0 && (
                  <div className="p-10 text-center font-bold opacity-50 border-2 border-dashed rounded-2xl dark:border-white/10">
                    لا يوجد أسئلة، اضغط لإضافة سؤال.
                  </div>
                )}
                {questions.map((q) => (
                  <div
                    key={q.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, q.id)}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, q.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-move hover:-translate-y-0.5
                            ${draggedQId === q.id ? "opacity-40" : ""}
                            ${dark ? "bg-[#0b0c10] border-white/5 hover:border-white/20" : "bg-white border-gray-100 hover:shadow-md hover:border-violet-200"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="opacity-30 flex flex-col justify-center text-xl font-bold px-2 cursor-grab active:cursor-grabbing">
                        ⋮⋮
                      </div>
                      <div>
                        <div
                          className="font-bold text-sm line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: q.question_text }}
                        />
                        <div className="text-[10px] uppercase font-bold tracking-widest mt-1 opacity-70 px-2 py-0.5 bg-gray-200 dark:bg-gray-800 rounded inline-block">
                          {q.type} | {q.points} Points
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedQuestion(q);
                          setQType(q.type);
                          setView("edit_question");
                        }}
                        className="px-4 py-2 border border-blue-500/30 rounded-xl text-blue-500 hover:bg-blue-50 font-bold text-sm"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => deleteQuestion(q.id)}
                        className="px-4 py-2 border border-red-500/30 rounded-xl text-red-500 hover:bg-red-50 font-bold text-sm"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === "edit_question" && (
          <form onSubmit={handleQuestionSubmit} className="space-y-5">
            <div className="flex justify-between items-center bg-gray-50 dark:bg-white/5 p-4 rounded-2xl mb-6">
              <div className="font-bold text-xl">
                {selectedQuestion ? "تعديل السؤال" : "إضافة سؤال"}
              </div>
              {!selectedQuestion && (
                <select
                  value={qType}
                  onChange={(e) => setQType(e.target.value)}
                  className="p-2 rounded-xl border dark:bg-black/40 outline-none font-bold text-violet-600 bg-white"
                >
                  <option value="mcq">اختياري (MCQ)</option>
                  <option value="true_false">صح أو خطأ</option>
                  <option value="short_answer">إجابة قصيرة</option>
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">نص السؤال</label>
              <textarea
                required
                name="question_text"
                defaultValue={selectedQuestion?.question_text}
                rows={3}
                className="w-full p-3 rounded-xl border dark:bg-black/40 dark:border-white/10 outline-none"
                placeholder="اكتب السؤال هنا..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">
                  درجة السؤال
                </label>
                <input
                  type="number"
                  step="0.5"
                  name="points"
                  defaultValue={selectedQuestion?.points || 1}
                  className="w-full p-3 rounded-xl border dark:bg-black/40 dark:border-white/10 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">
                  شرح الإجابة (يظهر للطالب للتعلم - اختياري)
                </label>
                <input
                  type="text"
                  name="explanation"
                  defaultValue={selectedQuestion?.explanation || ""}
                  className="w-full p-3 rounded-xl border dark:bg-black/40 dark:border-white/10 outline-none"
                  placeholder="شرح مبسط..."
                />
              </div>
            </div>

            <div className="p-4 bg-violet-50/50 dark:bg-white/5 rounded-2xl border border-violet-100 dark:border-white/10">
              {/* Depends on Type */}
              {(qType === "mcq" || qType === "true_false") && (
                <div>
                  <label className="block text-sm font-bold mb-2 text-violet-700 dark:text-violet-300">
                    الاختيارات بصيغة JSON
                  </label>
                  <p className="text-xs opacity-60 mb-2">
                    الرجاء الالتزام بصيغة المصفوفة
                    `[&#123;"id":"a","text":"الخيار
                    الأول","is_correct":true&#125;]`
                  </p>
                  <textarea
                    dir="ltr"
                    name="options_json"
                    rows={6}
                    defaultValue={
                      selectedQuestion?.options_json ||
                      `[\n  {"id":"a", "text":"خيار صحيح", "is_correct":true},\n  {"id":"b", "text":"خيار خاطئ", "is_correct":false}\n]`
                    }
                    className="w-full p-3 rounded-xl border border-white/10 bg-white dark:bg-black/90 font-mono text-sm outline-none"
                  />
                </div>
              )}
              {qType === "short_answer" && (
                <div>
                  <label className="block text-sm font-bold mb-2">
                    الإجابة الصحيحة الدقيقة (نصّاً)
                  </label>
                  <input
                    type="text"
                    name="correct_answer"
                    defaultValue={selectedQuestion?.correct_answer || ""}
                    className="w-full p-3 rounded-xl border bg-white dark:bg-black/40 outline-none"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-6 border-t dark:border-white/10">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl text-white font-bold shadow-lg shadow-violet-500/30"
                style={{ backgroundColor: pc }}
              >
                {loading ? "جاري الحفظ..." : "حفظ واستمرار"}
              </button>
              <button
                type="button"
                onClick={() => setView("manage_questions")}
                className="px-6 py-3 rounded-xl bg-gray-200 dark:bg-white/10 font-bold"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
