"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import imageCompression from "browser-image-compression";

export default function StagesPage() {
  const { dark, primaryColor } = useTheme();
  const pc = primaryColor || "#8b5cf6";
  const slug = getSlug();
  const token = getToken();

  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null); // id of stage being deleted
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [editingStage, setEditingStage] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    short_description: "",
    order_index: "0",
    status: "active",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchStages();
  }, [slug]);

  const fetchStages = async () => {
    if (slug === "main" || !token) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/stages?slug=${slug}`);
      if (!res.ok) throw new Error("فشل جلب المراحل الدراسية");
      const data = await res.json();
      setStages(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (stage = null) => {
    if (stage) {
      setEditingStage(stage);
      setFormData({
        name: stage.name || "",
        short_description: stage.short_description || "",
        order_index: stage.order_index?.toString() || "0",
        status: stage.status || "active",
      });
      setImagePreview(
        stage.image_path?.startsWith("http")
          ? stage.image_path
          : stage.full_image_url || null,
      );
    } else {
      setEditingStage(null);
      setFormData({
        name: "",
        short_description: "",
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
    setEditingStage(null);
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
    if (!formData.name) return;

    setIsSubmitting(true);
    try {
      const data = new FormData();
      // append common fields
      data.append("slug", slug);
      data.append("name", formData.name);
      data.append("short_description", formData.short_description);
      data.append("order_index", formData.order_index);
      data.append("status", formData.status);

      // handle image with strong compression
      if (imageFile) {
        const compressed = await imageCompression(imageFile, {
          maxSizeMB: 0.1, // Strong compression
          maxWidthOrHeight: 800,
          useWebWorker: true,
        });
        data.append("image", compressed, compressed.name);
      }

      const url = editingStage
        ? `/api/v1/stages/${editingStage.id}`
        : "/api/v1/stages";

      const method = editingStage ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (!res.ok) {
        throw new Error("حدث خطأ أثناء حفظ المرحلة");
      }

      await fetchStages();
      handleCloseModal();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه المرحلة؟")) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/v1/stages/${id}?slug=${slug}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("حدث خطأ أثناء الحذف");
      setStages((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
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
              className={`text-2xl lg:text-3xl font-extrabold ${dark ? "text-white" : "text-gray-900"} mb-2`}
            >
              المراحل الدراسية
            </h1>
            <p
              className={`text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}
            >
              إدارة المراحل الدراسية والأقسام المتاحة عبر منصتك
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-105"
            style={{
              backgroundColor: pc,
              boxShadow: `0 8px 24px ${pc}60`,
            }}
          >
            <Plus className="w-5 h-5" />
            إضافة مرحلة جديدة
          </button>
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
      ) : stages.length === 0 ? (
        <div
          className={`text-center py-20 rounded-3xl ${dark ? "bg-[#141625]/50 border border-white/5" : "bg-white border border-gray-100 shadow-sm"}`}
        >
          <div
            className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: `${pc}15`, color: pc }}
          >
            <Search className="w-8 h-8 opacity-70" />
          </div>
          <h3
            className={`text-xl font-bold mb-2 ${dark ? "text-white" : "text-gray-900"}`}
          >
            لا توجد مراحل دراسية بعد
          </h3>
          <p className={dark ? "text-gray-500" : "text-gray-400"}>
            اضغط على زر الإضافة لإنشاء أول مرحلة دراسية في منصتك
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className={`relative overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group flex flex-col ${dark ? "bg-[#141625] border border-white/6 hover:border-white/10 shadow-black/50" : "bg-white border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"}`}
            >
              {/* Image Banner */}
              <div className="h-40 relative w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                {stage.full_image_url || stage.image_path ? (
                  <img
                    src={
                      stage.image_path?.startsWith("http")
                        ? stage.image_path
                        : stage.full_image_url
                    }
                    alt={stage.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md ${stage.status === "active" ? "bg-emerald-500/90 text-white" : "bg-yellow-500/90 text-white"}`}
                  >
                    {stage.status === "active" ? "نشط" : "غير نشط"}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col">
                <h3
                  className={`text-lg font-bold mb-2 ${dark ? "text-white" : "text-gray-900"}`}
                >
                  {stage.name}
                </h3>
                <p
                  className={`text-sm mb-6 flex-1 line-clamp-2 ${dark ? "text-gray-400" : "text-gray-500"}`}
                >
                  {stage.short_description || "لا يوجد وصف مختصر."}
                </p>

                {/* Actions */}
                <div
                  className={`flex items-center justify-between pt-4 border-t ${dark ? "border-white/10" : "border-gray-100"}`}
                >
                  <div
                    className={`text-xs font-semibold ${dark ? "text-gray-500" : "text-gray-400"}`}
                  >
                    الترتيب: {stage.order_index}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenModal(stage)}
                      className={`p-2 rounded-lg transition-colors ${dark ? "bg-white/5 hover:bg-white/10 text-blue-400" : "bg-blue-50 hover:bg-blue-100 text-blue-600"}`}
                      title="تعديل"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(stage.id)}
                      disabled={isDeleting === stage.id}
                      className={`p-2 rounded-lg transition-colors ${dark ? "bg-white/5 hover:bg-white/10 text-red-400" : "bg-red-50 hover:bg-red-100 text-red-600"} disabled:opacity-50`}
                      title="حذف"
                    >
                      {isDeleting === stage.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Screen / Premium Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-0 md:p-6 lg:p-8">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={handleCloseModal}
          />
          <div
            className={`relative w-full h-full max-w-7xl md:rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] flex flex-col md:flex-row ${dark ? "bg-[#0b0d14] border-0 md:border md:border-white/10" : "bg-white border-0 md:border md:border-gray-200"}`}
          >
            {/* Left/Top Side: Image Upload & Visuals */}
            <div
              className={`md:w-5/12 p-8 lg:p-12 flex flex-col justify-center relative overflow-hidden ${dark ? "bg-[#141625]" : "bg-gray-50 border-b md:border-b-0 md:border-r border-gray-100"}`}
            >
              {/* Decorative Glow */}
              <div className="absolute inset-0 pointer-events-none opacity-30">
                <div
                  className="absolute top-0 right-0 w-full h-full rounded-full blur-[120px] mix-blend-screen"
                  style={{ background: pc }}
                />
              </div>

              <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col h-full justify-center">
                <div className="mb-8 text-center md:text-right">
                  <div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 shadow-xl"
                    style={{
                      background: `linear-gradient(135deg, ${pc}, ${pc}80)`,
                    }}
                  >
                    <ImageIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3
                    className={`text-2xl font-black mb-3 ${dark ? "text-white" : "text-gray-900"}`}
                  >
                    صورة المرحلة (اختياري)
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${dark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    اختر صورة تعبر عن المرحلة الدراسية. سيتم ضغط الصورة تلقائيًا
                    لضمان أعلى سرعة تحميل وأفضل أداء للمنصة.
                  </p>
                </div>

                <div
                  className={`relative group flex justify-center items-center w-full aspect-square md:aspect-auto md:flex-1 rounded-3xl border-2 border-dashed overflow-hidden transition-all duration-300 ${dark ? "border-white/20 hover:border-white/40 bg-black/40" : "border-gray-300 hover:border-gray-400 bg-white shadow-sm"}`}
                >
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="preview"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 backdrop-blur-sm">
                        <Pencil className="w-10 h-10 text-white mb-3" />
                        <span className="text-white font-bold text-lg">
                          تغيير الصورة
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center p-6 text-center">
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:rotate-6 shadow-inner"
                        style={{ backgroundColor: `${pc}15`, color: pc }}
                      >
                        <Plus className="w-8 h-8" />
                      </div>
                      <p
                        className={`font-bold text-lg mb-1 ${dark ? "text-gray-300" : "text-gray-700"}`}
                      >
                        التقط أو اختر صورة
                      </p>
                      <p
                        className={`text-xs mt-2 ${dark ? "text-gray-500" : "text-gray-400"}`}
                      >
                        PNG, JPG, WEBP حتى 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right/Bottom Side: Form */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {/* Close Button Mobile */}
              <button
                onClick={handleCloseModal}
                className="absolute top-6 left-6 z-50 p-2 rounded-full bg-black/10 hover:bg-black/20 text-gray-500 hover:text-gray-800 dark:bg-white/10 dark:hover:bg-white/20 dark:text-gray-300 dark:hover:text-white transition-all md:hidden"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex-1 overflow-y-auto p-6 md:p-12">
                {/* Header Details */}
                <div className="mb-10 pr-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2
                        className={`text-3xl md:text-4xl font-black mb-4 tracking-tight ${dark ? "text-white" : "text-gray-900"}`}
                      >
                        {editingStage
                          ? "تعديل بيانات المرحلة"
                          : "إضافة مرحلة جديدة"}
                      </h2>
                      <p
                        className="text-base md:text-lg font-bold leading-relaxed max-w-xl"
                        style={{ color: pc }}
                      >
                        {editingStage
                          ? "قم بتحديث بيانات المرحلة الحالية بدقة لضمان ظهورها بشكل مثالي ومتميز أمام طلابك."
                          : "أضف مرحلة دراسية جديدة لنظامك وابدأ في إنشاء ورفع الكورسات الخاصة بها فوراً."}
                      </p>
                    </div>
                    {/* Close Button Desktop */}
                    <button
                      onClick={handleCloseModal}
                      className="hidden md:flex p-3 rounded-2xl bg-black/5 hover:bg-black/10 text-gray-500 hover:text-gray-800 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-400 dark:hover:text-white transition-all"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
                  {/* Name */}
                  <div className="space-y-3">
                    <label
                      className={`block text-sm font-black uppercase tracking-wider ${dark ? "text-gray-400" : "text-gray-500"}`}
                    >
                      اسم المرحلة <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className={`w-full outline-none font-bold text-lg px-6 py-4 rounded-2xl transition-all border-2 ${dark ? "bg-[#141625] border-white/10 text-white focus:border-white/30" : "bg-white border-gray-200 text-gray-900 focus:border-gray-400 shadow-sm"}`}
                      placeholder="مثال: الصف الأول الثانوي"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <label
                      className={`block text-sm font-black uppercase tracking-wider ${dark ? "text-gray-400" : "text-gray-500"}`}
                    >
                      وصف مختصر
                    </label>
                    <textarea
                      rows={4}
                      value={formData.short_description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          short_description: e.target.value,
                        })
                      }
                      className={`w-full outline-none font-medium text-base px-6 py-4 rounded-2xl transition-all resize-none border-2 ${dark ? "bg-[#141625] border-white/10 text-white focus:border-white/30" : "bg-white border-gray-200 text-gray-900 focus:border-gray-400 shadow-sm"}`}
                      placeholder="نص ترويجي قصير يظهر أسفل اسم المرحلة (اختياري)..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Order Index */}
                    <div className="space-y-3">
                      <label
                        className={`block text-sm font-black uppercase tracking-wider ${dark ? "text-gray-400" : "text-gray-500"}`}
                      >
                        الترتيب المخصص
                      </label>
                      <input
                        type="number"
                        value={formData.order_index}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            order_index: e.target.value,
                          })
                        }
                        className={`w-full outline-none font-bold text-lg px-6 py-4 rounded-2xl transition-all border-2 ${dark ? "bg-[#141625] border-white/10 text-white focus:border-white/30" : "bg-white border-gray-200 text-gray-900 focus:border-gray-400 shadow-sm"}`}
                        min="0"
                      />
                    </div>

                    {/* Status */}
                    <div className="space-y-3">
                      <label
                        className={`block text-sm font-black uppercase tracking-wider ${dark ? "text-gray-400" : "text-gray-500"}`}
                      >
                        حالة الظهور
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                        className={`w-full outline-none font-bold text-lg px-6 py-4 rounded-2xl transition-all border-2 ${dark ? "bg-[#141625] border-white/10 text-white focus:border-white/30" : "bg-white border-gray-200 text-gray-900 focus:border-gray-400 shadow-sm"} cursor-pointer appearance-none`}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: "left 1.5rem center",
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "1.5em 1.5em",
                        }}
                      >
                        <option value="active">🟢 نشط ومرئي</option>
                        <option value="inactive">🔴 غير نشط (مخفي)</option>
                      </select>
                    </div>
                  </div>

                  {/* Submit Btn */}
                  <div className="pt-8 mt-8 border-t border-gray-100 dark:border-white/10">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex justify-center items-center gap-3 py-5 rounded-2xl font-black text-xl text-white transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                      style={{
                        backgroundColor: pc,
                        boxShadow: !isSubmitting
                          ? `0 20px 40px -10px ${pc}`
                          : "none",
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-7 h-7 animate-spin" />
                          <span>جاري الحفظ والرفع...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-7 h-7" />
                          <span>
                            {editingStage
                              ? "حفظ التعديلات"
                              : "اعتماد وإضافة المرحلة"}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
