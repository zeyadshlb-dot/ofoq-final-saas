"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme, getToken, getSlug } from "../layout";
import {
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Loader2,
  X,
  CheckCircle,
  AlertCircle,
  Search,
  BookOpen,
  DollarSign,
  MonitorPlay,
} from "lucide-react";
import imageCompression from "browser-image-compression";

export default function CoursesPage() {
  const { dark, primaryColor } = useTheme();
  const pc = primaryColor || "#8b5cf6";
  const slug = getSlug();
  const token = getToken();
  const router = useRouter();

  const [courses, setCourses] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [filterStage, setFilterStage] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Form State
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    educational_stage_id: "",
    pricing_type: "paid",
    price: "",
    discount_price: "",
    order_index: "0",
    status: "active",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchStages();
  }, [slug]);

  useEffect(() => {
    fetchCourses();
  }, [slug, filterStage, filterStatus]);

  const fetchStages = async () => {
    if (slug === "main" || !token) return;
    try {
      const res = await fetch(`/api/v1/stages?slug=${slug}`);
      if (res.ok) {
        const data = await res.json();
        setStages(Array.isArray(data) ? data : data?.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourses = async () => {
    if (slug === "main" || !token) return;
    try {
      setLoading(true);
      let url = `/api/v1/courses?slug=${slug}&status=${filterStatus}`;
      if (filterStage) url += `&educational_stage_id=${filterStage}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("فشل جلب الكورسات");
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        title: course.title || "",
        description: course.description || "",
        educational_stage_id: course.educational_stage_id?.toString() || "",
        pricing_type: course.pricing_type || "paid",
        price: course.price?.toString() || "",
        discount_price: course.discount_price?.toString() || "",
        order_index: course.order_index?.toString() || "0",
        status: course.status || "active",
      });
      setImagePreview(
        course.image_path?.startsWith("http")
          ? course.image_path
          : course.full_image_url || null,
      );
    } else {
      setEditingCourse(null);
      setFormData({
        title: "",
        description: "",
        educational_stage_id:
          filterStage || (stages.length > 0 ? stages[0].id.toString() : ""),
        pricing_type: "paid",
        price: "",
        discount_price: "",
        order_index: "0",
        status: "active",
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.educational_stage_id) {
      alert("يرجى إدخال عنوان الكورس واختيار المرحلة الدراسية");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("slug", slug);
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("educational_stage_id", formData.educational_stage_id);
      data.append("pricing_type", formData.pricing_type);
      data.append("price", formData.price || 0);
      data.append("discount_price", formData.discount_price || 0);
      data.append("order_index", formData.order_index || 0);
      data.append("status", formData.status);
      data.append("external_link", formData.external_link || "");

      if (imageFile) {
        data.append("image", imageFile);
      }

      const url = editingCourse
        ? `/api/v1/courses/${editingCourse.id}`
        : "/api/v1/courses";

      const method = editingCourse ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (!res.ok) {
        throw new Error("حدث خطأ أثناء حفظ الكورس");
      }

      await fetchCourses();
      handleCloseModal();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الكورس وجميع محتوياته؟"))
      return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/v1/courses/${id}?slug=${slug}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("حدث خطأ أثناء الحذف");
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Section */}
      <div
        className={`relative overflow-hidden rounded-[2rem] p-7 lg:p-9 ${dark ? "bg-[#141625]/80 border border-white/5" : "bg-white border border-gray-100 shadow-xl shadow-gray-200/40"}`}
      >
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div
            className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px]"
            style={{ background: pc, opacity: dark ? 0.15 : 0.08 }}
          />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <h1
              className={`text-2xl lg:text-3xl font-extrabold ${dark ? "text-white" : "text-gray-900"} mb-2 flex items-center gap-3`}
            >
              <MonitorPlay className="w-8 h-8" style={{ color: pc }} />
              الكورسات والمحتوى
            </h1>
            <p
              className={`text-sm tracking-wide ${dark ? "text-gray-400" : "text-gray-500"}`}
            >
              إدارة الكورسات، الفصول، والدروس الخاصة بمنصتك
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="shrink-0 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-105"
            style={{
              backgroundColor: pc,
              boxShadow: `0 8px 24px ${pc}60`,
            }}
          >
            <Plus className="w-5 h-5" />
            إضافة كورس جديد
          </button>
        </div>
      </div>

      {/* Filters */}
      <div
        className={`p-4 rounded-2xl flex flex-wrap gap-4 items-center ${dark ? "bg-[#141625]/80 border border-white/5" : "bg-white border border-gray-100 shadow-sm"}`}
      >
        <div className="flex-1 min-w-[200px]">
          <label
            className={`block text-xs font-bold mb-1.5 ${dark ? "text-gray-400" : "text-gray-500"}`}
          >
            تصفية حسب المرحلة
          </label>
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl text-sm font-bold outline-none transition-all ${
              dark
                ? "bg-[#0b0c10] border-white/10 text-white focus:border-white/30"
                : "bg-gray-50 border-gray-200 text-gray-900 focus:border-gray-400"
            }`}
            style={{ border: "1px solid" }}
          >
            <option value="">جميع المراحل</option>
            {stages.map((stg) => (
              <option key={stg.id} value={stg.id}>
                {stg.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label
            className={`block text-xs font-bold mb-1.5 ${dark ? "text-gray-400" : "text-gray-500"}`}
          >
            حالة الكورس
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl text-sm font-bold outline-none transition-all ${
              dark
                ? "bg-[#0b0c10] border-white/10 text-white focus:border-white/30"
                : "bg-gray-50 border-gray-200 text-gray-900 focus:border-gray-400"
            }`}
            style={{ border: "1px solid" }}
          >
            <option value="all">الكل (نشط وغير نشط)</option>
            <option value="active">نشط فقط</option>
            <option value="inactive">غير نشط فقط</option>
          </select>
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: pc }} />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[40vh] text-red-500">
          <AlertCircle className="w-8 h-8 ml-2" />
          <p className="font-bold">{error}</p>
        </div>
      ) : courses.length === 0 ? (
        <div
          className={`text-center py-20 rounded-3xl ${dark ? "bg-[#141625]/50 border border-white/5" : "bg-white border border-gray-100 shadow-sm"}`}
        >
          <div
            className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: `${pc}15`, color: pc }}
          >
            <MonitorPlay className="w-10 h-10 opacity-70" />
          </div>
          <h3
            className={`text-xl font-bold mb-2 ${dark ? "text-white" : "text-gray-900"}`}
          >
            لا توجد كورسات بعد
          </h3>
          <p className={dark ? "text-gray-500" : "text-gray-400"}>
            ابدأ بإضافة أول كورس لإنشاء محتواك التعليمي
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() => router.push(`/dashboard/courses/${course.id}`)}
              className={`relative overflow-hidden rounded-[2rem] transition-all cursor-pointer hover:-translate-y-1 hover:shadow-2xl group flex flex-col ${
                dark
                  ? "bg-[#141625] border border-white/5 hover:border-white/10 shadow-black/50"
                  : "bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)]"
              }`}
            >
              {/* Image Banner */}
              <div className="h-48 relative overflow-hidden bg-gray-100">
                {course.full_image_url ? (
                  <img
                    src={course.full_image_url}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <MonitorPlay className="w-12 h-12 mb-2 opacity-50" />
                    <span className="text-sm font-bold">بدون صورة</span>
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span
                    className={`px-3 py-1.5 rounded-xl text-xs font-black backdrop-blur-md ${course.status === "active" ? "bg-emerald-500/90 text-white" : "bg-gray-500/90 text-white"}`}
                  >
                    {course.status === "active" ? "نشط" : "غير نشط"}
                  </span>
                </div>

                <div className="absolute top-4 left-4 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal(course);
                    }}
                    className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white transition-all shadow-lg"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(course.id);
                    }}
                    className="w-8 h-8 rounded-xl bg-red-500/80 hover:bg-red-600 backdrop-blur-md flex items-center justify-center text-white transition-all shadow-lg"
                  >
                    {isDeleting === course.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Number of chapters */}
                <div className="absolute bottom-4 right-4">
                  <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-black/60 text-white backdrop-blur-md shadow-lg flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    {course.chapters_count || 0} وحدة
                  </span>
                </div>
              </div>

              {/* Content Details */}
              <div className="p-6 flex-1 flex flex-col justify-between relative z-10">
                <div>
                  <h3
                    className={`text-lg font-bold mb-2 leading-tight ${dark ? "text-white group-hover:text-emerald-400" : "text-gray-900 group-hover:text-violet-600"} transition-colors`}
                  >
                    {course.title}
                  </h3>
                  <p
                    className={`text-xs line-clamp-2 leading-relaxed ${dark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {course.description || "لا يوجد وصف"}
                  </p>
                </div>

                <div
                  className={`mt-5 pt-4 border-t flex items-center justify-between ${dark ? "border-white/5" : "border-gray-50"}`}
                >
                  <div className="flex flex-col">
                    <span
                      className={`text-[10px] uppercase tracking-wider font-bold ${dark ? "text-gray-500" : "text-gray-400"}`}
                    >
                      السعر
                    </span>
                    <span
                      className={`text-sm font-black flex items-center gap-1 mt-0.5 ${course.pricing_type === "free" ? "text-emerald-500" : dark ? "text-white" : "text-gray-900"}`}
                    >
                      {course.pricing_type === "free"
                        ? "مجاني"
                        : `EGP ${course.price}`}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span
                      className={`text-[10px] uppercase tracking-wider font-bold ${dark ? "text-gray-500" : "text-gray-400"}`}
                    >
                      المرحلة
                    </span>
                    <span
                      className={`text-xs font-bold mt-0.5 px-2 py-0.5 rounded border ${dark ? "border-white/10 text-gray-300" : "border-gray-200 text-gray-600"}`}
                    >
                      {stages.find((s) => s.id === course.educational_stage_id)
                        ?.name || "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          <div
            className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 lg:p-8 shadow-2xl ${dark ? "bg-[#141625] border border-white/10" : "bg-white"}`}
          >
            <button
              onClick={handleCloseModal}
              className={`absolute top-6 left-6 p-2 rounded-full transition-colors ${dark ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
            >
              <X className="w-5 h-5" />
            </button>

            <h2
              className={`text-2xl font-black mb-8 pr-2 border-r-4 ${dark ? "text-white" : "text-gray-900"}`}
              style={{ borderColor: pc }}
            >
              {editingCourse ? "تعديل الكورس" : "إضافة كورس جديد"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div>
                <label
                  className={`block text-sm font-bold mb-3 ${dark ? "text-gray-300" : "text-gray-700"}`}
                >
                  صورة غلاف الكورس
                </label>
                <div
                  className={`relative h-48 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all group ${
                    imagePreview
                      ? "border-emerald-500"
                      : dark
                        ? "border-gray-700 bg-[#0b0c10]"
                        : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <p className="text-white font-bold text-sm bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">
                          تغيير الصورة
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center z-10">
                      <div
                        className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${pc}15`, color: pc }}
                      >
                        <ImageIcon className="w-7 h-7" />
                      </div>
                      <p
                        className={`font-bold text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}
                      >
                        اضغط هنا أو اسحب الصورة للرفع
                      </p>
                      <p className="text-xs text-gray-500 mt-2 font-medium">
                        يفضل أن تكون أبعاد الصورة 16:9 وتكون أقل من 2 ميجابايت
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Stage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label
                    className={`block text-sm font-bold mb-2 ${dark ? "text-gray-300" : "text-gray-700"}`}
                  >
                    اسم الكورس *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className={`w-full px-4 py-3.5 rounded-xl font-bold transition-all outline-none ${
                      dark
                        ? "bg-[#0b0c10] border border-white/10 text-white focus:border-white/30"
                        : "bg-gray-50 border border-gray-200 text-gray-900 focus:border-gray-400 focus:bg-white"
                    }`}
                    placeholder="مثال: كورس الفيزياء المكثف"
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-bold mb-2 ${dark ? "text-gray-300" : "text-gray-700"}`}
                  >
                    المرحلة الدراسية *
                  </label>
                  <select
                    required
                    value={formData.educational_stage_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        educational_stage_id: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-3.5 rounded-xl font-bold transition-all outline-none ${
                      dark
                        ? "bg-[#0b0c10] border border-white/10 text-white focus:border-white/30"
                        : "bg-gray-50 border border-gray-200 text-gray-900 focus:border-gray-400 focus:bg-white"
                    }`}
                  >
                    <option value="" disabled>
                      اختر المرحلة
                    </option>
                    {stages.map((stg) => (
                      <option key={stg.id} value={stg.id}>
                        {stg.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  className={`block text-sm font-bold mb-2 ${dark ? "text-gray-300" : "text-gray-700"}`}
                >
                  وصف مختصر
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-3.5 rounded-xl font-bold transition-all outline-none resize-none ${
                    dark
                      ? "bg-[#0b0c10] border border-white/10 text-white focus:border-white/30"
                      : "bg-gray-50 border border-gray-200 text-gray-900 focus:border-gray-400 focus:bg-white"
                  }`}
                  placeholder="وصف محتوى الكورس وما سيتعلمه الطالب..."
                />
              </div>

              {/* Pricing Section */}
              <div
                className={`p-5 rounded-2xl ${dark ? "bg-[#0b0c10]/50 border border-white/5" : "bg-gray-50/50 border border-gray-100"}`}
              >
                <h3
                  className={`font-black text-sm mb-4 flex items-center gap-2 ${dark ? "text-white" : "text-gray-800"}`}
                >
                  <DollarSign className="w-4 h-4 text-emerald-500" /> خيارات
                  التسعير
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label
                      className={`block text-xs font-bold mb-2 ${dark ? "text-gray-400" : "text-gray-500"}`}
                    >
                      نوع الكورس
                    </label>
                    <select
                      value={formData.pricing_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricing_type: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-3 rounded-xl font-bold transition-all outline-none ${
                        dark
                          ? "bg-[#141625] border border-white/10 text-white focus:border-white/30"
                          : "bg-white border border-gray-200 text-gray-900 focus:border-gray-400"
                      }`}
                    >
                      <option value="free">مجاني</option>
                      <option value="paid">مدفوع</option>
                    </select>
                  </div>

                  {formData.pricing_type === "paid" && (
                    <>
                      <div>
                        <label
                          className={`block text-xs font-bold mb-2 ${dark ? "text-gray-400" : "text-gray-500"}`}
                        >
                          السعر الأساسي (EGP)
                        </label>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                          }
                          className={`w-full px-4 py-3 rounded-xl font-bold transition-all outline-none ${
                            dark
                              ? "bg-[#141625] border border-white/10 text-white focus:border-white/30"
                              : "bg-white border border-gray-200 text-gray-900 focus:border-gray-400"
                          }`}
                          placeholder="مثال: 500"
                        />
                      </div>
                      <div>
                        <label
                          className={`block text-xs font-bold mb-2 ${dark ? "text-gray-400" : "text-gray-500"}`}
                        >
                          سعر التخفيض (اختياري)
                        </label>
                        <input
                          type="number"
                          value={formData.discount_price}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              discount_price: e.target.value,
                            })
                          }
                          className={`w-full px-4 py-3 rounded-xl font-bold transition-all outline-none ${
                            dark
                              ? "bg-[#141625] border border-white/10 text-white focus:border-white/30"
                              : "bg-white border border-gray-200 text-gray-900 focus:border-gray-400"
                          }`}
                          placeholder="مثال: 450"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Status and Order */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label
                    className={`block text-sm font-bold mb-2 ${dark ? "text-gray-300" : "text-gray-700"}`}
                  >
                    ترتيب العرض
                  </label>
                  <input
                    type="number"
                    value={formData.order_index}
                    onChange={(e) =>
                      setFormData({ ...formData, order_index: e.target.value })
                    }
                    className={`w-full px-4 py-3.5 rounded-xl font-bold transition-all outline-none ${
                      dark
                        ? "bg-[#0b0c10] border border-white/10 text-white focus:border-white/30"
                        : "bg-gray-50 border border-gray-200 text-gray-900 focus:border-gray-400 focus:bg-white"
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-bold mb-2 ${dark ? "text-gray-300" : "text-gray-700"}`}
                  >
                    حالة الكورس
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className={`w-full px-4 py-3.5 rounded-xl font-bold transition-all outline-none ${
                      dark
                        ? "bg-[#0b0c10] border border-white/10 text-white focus:border-white/30"
                        : "bg-gray-50 border border-gray-200 text-gray-900 focus:border-gray-400 focus:bg-white"
                    }`}
                  >
                    <option value="active">نشط (يظهر للطلاب)</option>
                    <option value="inactive">غير نشط (مخفي)</option>
                  </select>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={`px-6 py-3.5 rounded-xl font-bold transition-colors ${
                    dark
                      ? "bg-white/5 hover:bg-white/10 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                  }`}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3.5 rounded-xl text-white font-bold flex items-center gap-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-70"
                  style={{
                    backgroundColor: pc,
                    boxShadow: `0 8px 24px ${pc}50`,
                  }}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : editingCourse ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  {editingCourse ? "حفظ التعديلات" : "إضافة الكورس"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
