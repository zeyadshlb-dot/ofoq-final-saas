"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme, getToken, getSlug } from "../layout";
import {
  Ticket,
  Plus,
  Loader2,
  AlertCircle,
  Copy,
  CheckCircle2,
  Banknote,
  Hash,
  Box,
  Download,
  ArrowRight,
} from "lucide-react";

export default function VouchersPage() {
  const { dark, primaryColor } = useTheme();
  const pc = primaryColor || "#8b5cf6";
  const slug = getSlug();
  const token = getToken();
  const router = useRouter();

  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedBatch, setCopiedBatch] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    batch_name: "",
    quantity: "",
    value: "",
  });

  useEffect(() => {
    fetchBatches();
  }, [slug]);

  const fetchBatches = async () => {
    if (slug === "main" || !token) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/vouchers/batches?slug=${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("فشل جلب بيانات الأكواد");
      const data = await res.json();
      setBatches(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    if (!formData.batch_name || !formData.quantity || !formData.value) return;

    setIsSubmitting(true);
    try {
      // POST requires body with these values, the controller looks at Input()
      // Instead of JSON, I'll send FormData as the Go controller uses Input() and Form data
      const data = new FormData();
      data.append("slug", slug);
      data.append("batch_name", formData.batch_name);
      data.append("quantity", formData.quantity);
      data.append("value", formData.value);

      const res = await fetch(`/api/v1/vouchers/batch`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      if (!res.ok) throw new Error("فشل إنشاء الدفعة");

      const newBatch = await res.json();
      setBatches([newBatch, ...batches]);
      setIsModalOpen(false);
      setFormData({ batch_name: "", quantity: "", value: "" });
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stats
  const totalVouchers = batches.reduce(
    (acc, curr) => acc + (curr.quantity || 0),
    0,
  );
  const totalValue = batches.reduce(
    (acc, curr) => acc + (curr.quantity || 0) * (curr.value_per_voucher || 0),
    0,
  );

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      {/* Header & Stats */}
      <div
        className={`relative overflow-hidden rounded-[2.5rem] p-8 lg:p-10 ${dark ? "bg-[#141625]/80 border border-white/5" : "bg-white border border-gray-100 shadow-xl shadow-gray-200/40"}`}
      >
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
          <div
            className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px]"
            style={{
              background: pc,
              opacity: dark ? 0.15 : 0.08,
              transform: "translate(30%, -30%)",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1
              className={`text-3xl md:text-4xl font-black ${dark ? "text-white" : "text-gray-900"} mb-3 tracking-tight`}
            >
              أكواد الشحن (Vouchers)
            </h1>
            <p
              className={`text-base md:text-lg ${dark ? "text-gray-400" : "text-gray-500"} max-w-xl`}
            >
              قم بتوليد دفعات من الأكواد لبيعها للمكتبات أو الطلاب لشحن أرصدتهم
              في المنصة.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="shrink-0 flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-white text-lg transition-all shadow-xl hover:-translate-y-1 hover:scale-105 active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${pc}, ${pc}dd)`,
              boxShadow: `0 10px 25px -5px ${pc}60`,
            }}
          >
            <Plus className="w-6 h-6" /> توليد دفعة جديدة
          </button>
        </div>

        {/* Stats Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className={`p-6 rounded-3xl border ${dark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100"} flex items-center gap-6`}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner"
              style={{ backgroundColor: `${pc}15`, color: pc }}
            >
              <Hash className="w-8 h-8" />
            </div>
            <div>
              <p
                className={`text-sm font-bold uppercase tracking-wider mb-1 ${dark ? "text-gray-500" : "text-gray-400"}`}
              >
                إجمالي الأكواد المُصدرة
              </p>
              <h3
                className={`text-3xl font-black ${dark ? "text-white" : "text-gray-900"}`}
              >
                {totalVouchers}{" "}
                <span className="text-sm font-bold text-gray-400">كود</span>
              </h3>
            </div>
          </div>
          <div
            className={`p-6 rounded-3xl border ${dark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100"} flex items-center gap-6`}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner bg-emerald-500/15 text-emerald-500">
              <Banknote className="w-8 h-8" />
            </div>
            <div>
              <p
                className={`text-sm font-bold uppercase tracking-wider mb-1 ${dark ? "text-gray-500" : "text-gray-400"}`}
              >
                القيمة الإجمالية للأكواد
              </p>
              <h3
                className={`text-3xl font-black ${dark ? "text-white" : "text-gray-900"}`}
              >
                {totalValue}{" "}
                <span className="text-sm font-bold text-gray-400">جنية</span>
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Batches Table */}
      <div
        className={`overflow-hidden rounded-3xl ${dark ? "bg-[#141625] border border-white/5" : "bg-white border border-gray-100 shadow-sm"}`}
      >
        <div className="p-6 md:p-8 border-b dark:border-white/5 border-gray-100 flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${pc}15`, color: pc }}
          >
            <Box className="w-6 h-6" />
          </div>
          <h2
            className={`text-2xl font-black ${dark ? "text-white" : "text-gray-900"}`}
          >
            سجل دفعات الأكواد
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 className="w-12 h-12 animate-spin" style={{ color: pc }} />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-[30vh] text-red-500 flex-col gap-4">
            <AlertCircle className="w-12 h-12" />
            <p className="font-bold">{error}</p>
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center py-24">
            <div
              className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: `${pc}10`, color: pc }}
            >
              <Ticket className="w-10 h-10 opacity-70" />
            </div>
            <h3
              className={`text-2xl font-black mb-2 ${dark ? "text-white" : "text-gray-900"}`}
            >
              لا توجد دفعات مسجلة
            </h3>
            <p
              className={`text-lg mb-8 ${dark ? "text-gray-500" : "text-gray-400"}`}
            >
              قم بتوليد دفعة جديدة للبدء في توزيع الأكواد.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg hover:-translate-y-1"
              style={{ backgroundColor: pc }}
            >
              <Plus className="w-5 h-5 inline-block mr-2" />
              توليد دفعة جديدة
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr
                  className={`${dark ? "bg-white/5 text-gray-400" : "bg-gray-50 text-gray-500"}`}
                >
                  <th className="px-6 py-4 font-bold text-sm">#</th>
                  <th className="px-6 py-4 font-bold text-sm">
                    اسم الدفعة / المكتبة
                  </th>
                  <th className="px-6 py-4 font-bold text-sm">الكمية</th>
                  <th className="px-6 py-4 font-bold text-sm">
                    قيمة الكود الواحد
                  </th>
                  <th className="px-6 py-4 font-bold text-sm">إجمالي القيمة</th>
                  <th className="px-6 py-4 font-bold text-sm">تاريخ التوليد</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${dark ? "divide-white/5" : "divide-gray-100"}`}
              >
                {batches.map((batch, index) => (
                  <tr
                    key={batch.id}
                    onClick={() =>
                      router.push(`/dashboard/vouchers/${batch.id}`)
                    }
                    className={`cursor-pointer transition-colors ${dark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}
                  >
                    <td
                      className={`px-6 py-4 font-bold ${dark ? "text-gray-500" : "text-gray-400"}`}
                    >
                      {index + 1}
                    </td>
                    <td
                      className={`px-6 py-4 font-black ${dark ? "text-white" : "text-gray-900"}`}
                    >
                      {batch.batch_name}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-lg font-bold text-sm ${dark ? "bg-white/10 text-white" : "bg-gray-100 text-gray-900"}`}
                      >
                        {batch.quantity} كود
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-500">
                      {batch.value_per_voucher} جنية
                    </td>
                    <td className="px-6 py-4 font-black text-emerald-500">
                      {(
                        batch.quantity * batch.value_per_voucher
                      ).toLocaleString()}{" "}
                      جنية
                    </td>
                    <td
                      className={`px-6 py-4 text-sm font-bold ${dark ? "text-gray-500" : "text-gray-400"}`}
                    >
                      {new Date(
                        batch.CreatedAt || batch.created_at || Date.now(),
                      ).toLocaleDateString("ar-EG")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Premium Full Screen Modal for Generating */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-0 md:p-6 lg:p-8">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={() => !isSubmitting && setIsModalOpen(false)}
          />

          <div
            className={`relative w-full h-full md:h-auto md:max-h-[90vh] md:max-w-4xl overflow-hidden md:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row transform transition-all ${dark ? "bg-[#141625]" : "bg-white"}`}
          >
            {/* Left Side (Or Top on Mobile): Explanation & UI Art */}
            <div
              className="md:w-5/12 p-8 md:p-12 flex flex-col justify-center relative overflow-hidden"
              style={{ background: pc }}
            >
              <div
                className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at top right, white, transparent 70%)",
                }}
              />
              <div className="relative z-10 text-white">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 shadow-xl">
                  <Ticket className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
                  توليد أكواد شحن جديدة
                </h2>
                <p className="text-white/80 font-bold text-lg mb-8 leading-relaxed">
                  أدخل اسم الدفعة (مثال: مكتبة النور)، عدد الأكواد المطلوبة،
                  وقيمة الكود الواحد، وسيقوم النظام بتوليد مجموعة أكواد قوية
                  جاهزة للطباعة.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-white/90" />
                    <span className="font-bold text-white/90">
                      أكواد غير قابلة للتخمين (تشفير قوي)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-white/90" />
                    <span className="font-bold text-white/90">
                      مرتبطة بالـ Batch لسهولة الفلترة والحسابات
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-white/90" />
                    <span className="font-bold text-white/90">
                      الكود يعمل لمرة واحدة فقط
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side (Form) */}
            <div className="md:w-7/12 p-8 md:p-12 overflow-y-auto w-full">
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${dark ? "bg-white/5 hover:bg-white/10 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"}`}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateBatch} className="space-y-6">
                <div>
                  <label
                    className={`block mb-2 font-bold ${dark ? "text-gray-300" : "text-gray-700"}`}
                  >
                    اسم الدفعة / المكتبة
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.batch_name}
                    onChange={(e) =>
                      setFormData({ ...formData, batch_name: e.target.value })
                    }
                    className={`w-full px-5 py-4 rounded-2xl font-bold transition-all border-2 outline-none ${dark ? "bg-black/20 border-white/10 text-white focus:border-white/30" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-gray-400"}`}
                    placeholder="مثال: مكتبة الأصدقاء الدفعة الأولى"
                  />
                  <p
                    className={`mt-2 text-xs font-bold ${dark ? "text-gray-500" : "text-gray-400"}`}
                  >
                    اسم مميز لتتعرف على مصدر هذه الأكواد لاحقاً.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label
                      className={`block mb-2 font-bold ${dark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      عدد الأكواد (الكمية)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="1000"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      className={`w-full px-5 py-4 rounded-2xl font-bold text-xl text-center transition-all border-2 outline-none ${dark ? "bg-black/20 border-white/10 text-white focus:border-white/30" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-gray-400"}`}
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label
                      className={`block mb-2 font-bold ${dark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      قيمة الكود (بالجنية)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.value}
                      onChange={(e) =>
                        setFormData({ ...formData, value: e.target.value })
                      }
                      className={`w-full px-5 py-4 rounded-2xl font-bold text-xl text-center text-emerald-500 transition-all border-2 outline-none ${dark ? "bg-black/20 border-white/10 focus:border-emerald-500/50" : "bg-gray-50 border-gray-200 focus:border-emerald-500/50"}`}
                      placeholder="50"
                    />
                  </div>
                </div>

                {/* Summary View before generating */}
                {formData.quantity && formData.value && (
                  <div
                    className={`mt-6 p-6 rounded-2xl flex items-center justify-between border-2 border-dashed ${dark ? "border-emerald-500/30 bg-emerald-500/5" : "border-emerald-500/30 bg-emerald-50"}`}
                  >
                    <div>
                      <p
                        className={`text-sm font-bold uppercase tracking-wider mb-1 ${dark ? "text-gray-400" : "text-gray-500"}`}
                      >
                        إجمالي قيمة الدفعة
                      </p>
                      <p className="text-2xl font-black text-emerald-500">
                        {(
                          Number(formData.quantity) * Number(formData.value)
                        ).toLocaleString()}{" "}
                        جنية
                      </p>
                    </div>
                    <Banknote className="w-10 h-10 text-emerald-500 opacity-50" />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-8 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-white text-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                  style={{ backgroundColor: pc }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" /> جاري
                      التوليد...
                    </>
                  ) : (
                    <>
                      توليد الأكواد الآن{" "}
                      <ArrowRight className="w-5 h-5 rotate-180" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
