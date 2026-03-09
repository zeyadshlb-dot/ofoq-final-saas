"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import { useTheme, getToken, getSlug } from "../../layout";
import {
  Ticket,
  Loader2,
  AlertCircle,
  Copy,
  CheckCircle2,
  ArrowRight,
  Printer,
  Share2,
  Search,
  LayoutGrid,
  Columns,
  Square,
  Image as ImageIcon,
  Send,
  X,
} from "lucide-react";

/* ─── Print layout presets ─── */
const PRINT_LAYOUTS = [
  {
    id: "grid-4",
    label: "4 أكواد / صفحة",
    cols: 2,
    rows: 2,
    perPage: 4,
    shape: "landscape",
  },
  {
    id: "grid-6",
    label: "6 أكواد / صفحة",
    cols: 2,
    rows: 3,
    perPage: 6,
    shape: "landscape",
  },
  {
    id: "grid-8",
    label: "8 أكواد / صفحة",
    cols: 2,
    rows: 4,
    perPage: 8,
    shape: "square",
  },
  {
    id: "grid-9",
    label: "9 أكواد / صفحة",
    cols: 3,
    rows: 3,
    perPage: 9,
    shape: "square",
  },
  {
    id: "grid-12",
    label: "12 كود / صفحة",
    cols: 3,
    rows: 4,
    perPage: 12,
    shape: "compact",
  },
];

export default function BatchVouchersPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const { dark, primaryColor, tenantLayout, tenant } = useTheme();
  const pc = primaryColor || "#8b5cf6";
  const slug = getSlug();
  const token = getToken();

  const [vouchers, setVouchers] = useState([]);
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedVouchers, setSelectedVouchers] = useState([]);
  const [printLayout, setPrintLayout] = useState(PRINT_LAYOUTS[1]); // default 6 per page
  const [showPrintSettings, setShowPrintSettings] = useState(false);

  // Share as Image state
  const [shareVoucherData, setShareVoucherData] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    fetchData();
  }, [slug, id]);

  const fetchData = async () => {
    if (slug === "main" || !token || !id) return;
    try {
      setLoading(true);

      // Fetch batch info (to get value_per_voucher)
      const batchRes = await fetch(`/api/v1/vouchers/batches?slug=${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (batchRes.ok) {
        const batchData = await batchRes.json();
        const allBatches = Array.isArray(batchData)
          ? batchData
          : batchData?.data || [];
        const found = allBatches.find(
          (b) => String(b.id) === String(id) || String(b.ID) === String(id),
        );
        if (found) setBatch(found);
      }

      // Fetch vouchers
      const res = await fetch(
        `/api/v1/vouchers/batches/${id}/vouchers?slug=${slug}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("فشل جلب بيانات الأكواد للدفعة");
      const data = await res.json();
      setVouchers(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleShareImageClick = async (voucher) => {
    setShareVoucherData(voucher);
    if (students.length === 0) {
      setStudentsLoading(true);
      try {
        const res = await fetch(`/api/v1/students?slug=${slug}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setStudents(Array.isArray(data) ? data : data?.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setStudentsLoading(false);
      }
    }
  };

  const generateAndSend = async (student) => {
    if (!shareVoucherData) return;
    setIsGeneratingImage(true);
    try {
      // Find the specific voucher element on screen to render
      const element = document.getElementById(
        `voucher-card-${shareVoucherData.id}`,
      );
      if (!element) throw new Error("لم يتم العثور على الكارت");

      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(element, {
        scale: 3,
        backgroundColor: dark ? "#141625" : "#ffffff", // Use a solid background so it looks good as an image
        useCORS: true,
      });

      canvas.toBlob((blob) => {
        if (!blob) throw new Error("فشل إنشاء الصورة");

        // Prepare WhatsApp message
        const val = batch?.value_per_voucher || batch?.ValuePerVoucher || "";
        const text = `أهلاً ${student.name}! 🎉\nإليك كود شحن الرصيد الخاص بك من منصة ${tenant?.name || ""}:\n\n🎫 الكود: ${shareVoucherData.code}\n💰 القيمة: ${val} جنيه\n\nقمแนبنسخ الكود واستخدامه في صفحة المحفظة.`;

        // Initiate download of the image
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Voucher_${shareVoucherData.code}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Open WhatsApp
        let phone = student.phone || "";
        if (phone && phone.startsWith("0")) phone = "+2" + phone;
        const whatsAppUrl = `https://wa.me/${phone.replace(/[^0-9+]/g, "")}?text=${encodeURIComponent(text)}`;

        window.open(whatsAppUrl, "_blank");

        // Close modal
        setShareVoucherData(null);
        setStudentSearch("");
      }, "image/png");
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء إنشاء الصورة.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handlePrint = () => {
    setShowPrintSettings(true);
  };

  const executePrint = () => {
    setShowPrintSettings(false);
    setTimeout(() => window.print(), 300);
  };

  const toggleSelect = (vId) => {
    setSelectedVouchers((prev) =>
      prev.includes(vId) ? prev.filter((x) => x !== vId) : [...prev, vId],
    );
  };

  const selectAll = () => {
    if (selectedVouchers.length === filteredVouchers.length) {
      setSelectedVouchers([]);
    } else {
      setSelectedVouchers(filteredVouchers.map((v) => v.id));
    }
  };

  const filteredVouchers = vouchers.filter((v) => {
    if (filter === "used" && v.status !== "used") return false;
    if (filter === "active" && v.status !== "active") return false;
    if (search && !v.code.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const selectedForPrint = filteredVouchers.filter((v) =>
    selectedVouchers.includes(v.id),
  );
  const voucherValue = batch?.value_per_voucher || batch?.ValuePerVoucher || 0;

  // Split selected vouchers into pages based on chosen layout
  const pages = [];
  for (let i = 0; i < selectedForPrint.length; i += printLayout.perPage) {
    pages.push(selectedForPrint.slice(i, i + printLayout.perPage));
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      {/* Header */}
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

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard/vouchers")}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${dark ? "bg-white/5 hover:bg-white/10 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"}`}
            >
              <ArrowRight className="w-6 h-6" />
            </button>
            <div>
              <h1
                className={`text-3xl font-black ${dark ? "text-white" : "text-gray-900"} tracking-tight`}
              >
                {batch?.batch_name || `أكواد الدفعة #${id}`}
              </h1>
              <p
                className={`text-base font-bold mt-1 ${dark ? "text-gray-400" : "text-gray-500"}`}
              >
                {batch
                  ? `${batch.quantity} كود • قيمة الكود الواحد: ${voucherValue} جنيه`
                  : "جاري التحميل..."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={selectAll}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all ${selectedVouchers.length === filteredVouchers.length && filteredVouchers.length > 0 ? "text-white" : dark ? "bg-white/5 hover:bg-white/10 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
              style={
                selectedVouchers.length === filteredVouchers.length &&
                filteredVouchers.length > 0
                  ? { backgroundColor: pc }
                  : {}
              }
            >
              <CheckCircle2 className="w-4 h-4" />
              {selectedVouchers.length === filteredVouchers.length &&
              filteredVouchers.length > 0
                ? "إلغاء التحديد"
                : "تحديد الكل"}
            </button>
            <button
              onClick={handlePrint}
              disabled={selectedVouchers.length === 0}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-white transition-all shadow-xl hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              style={{ backgroundColor: pc }}
            >
              <Printer className="w-5 h-5" /> طباعة المحددة (
              {selectedVouchers.length})
            </button>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div
        className={`p-4 rounded-3xl flex flex-col md:flex-row gap-4 items-center justify-between ${dark ? "bg-[#141625] border border-white/5" : "bg-white border border-gray-100 shadow-sm"}`}
      >
        <div className="w-full md:w-1/3 relative">
          <Search
            className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${dark ? "text-gray-500" : "text-gray-400"}`}
          />
          <input
            type="text"
            placeholder="ابحث برقم الكود..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pr-12 pl-4 py-3 rounded-2xl font-bold transition-all outline-none border-2 ${dark ? "bg-black/20 border-white/5 text-white focus:border-white/20" : "bg-gray-50 border-gray-100 text-gray-900 focus:border-gray-300"}`}
          />
        </div>
        <div
          className="flex p-1 rounded-xl w-full md:w-auto overflow-x-auto"
          style={{
            backgroundColor: dark
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.05)",
          }}
        >
          {[
            { key: "all", label: "الكل" },
            { key: "active", label: "النشطة" },
            { key: "used", label: "المستخدمة" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-6 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${filter === f.key ? "shadow-sm text-white" : dark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
              style={filter === f.key ? { backgroundColor: pc } : {}}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Vouchers */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-12 h-12 animate-spin" style={{ color: pc }} />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[30vh] text-red-500 flex-col gap-4">
          <AlertCircle className="w-12 h-12" />
          <p className="font-bold">{error}</p>
        </div>
      ) : filteredVouchers.length === 0 ? (
        <div className="text-center py-24">
          <Ticket
            className={`w-16 h-16 mx-auto mb-4 opacity-50 ${dark ? "text-gray-500" : "text-gray-400"}`}
          />
          <h3
            className={`text-xl font-black ${dark ? "text-white" : "text-gray-900"}`}
          >
            لا توجد أكواد مطابقة
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 print:hidden">
          {filteredVouchers.map((voucher, idx) => {
            const isSelected = selectedVouchers.includes(voucher.id);

            return (
              <div
                key={voucher.id}
                id={`voucher-card-${voucher.id}`}
                onClick={() => toggleSelect(voucher.id)}
                className={`relative overflow-hidden group rounded-2xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? "ring-4 ring-offset-2 scale-[1.02]"
                    : dark
                      ? "border-white/5 hover:border-white/20"
                      : "border-gray-100 hover:border-gray-300 shadow-sm"
                }`}
                style={isSelected ? { ringColor: pc, borderColor: pc } : {}}
              >
                {/* Main Header */}
                <div className="p-4 relative" style={{ background: pc }}>
                  {/* Decorative circles */}
                  <div className="absolute top-2 left-2 w-20 h-20 rounded-full bg-white/10" />
                  <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-black/5 translate-x-8 translate-y-8" />

                  <div className="relative z-10 flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-white/70 mb-1">
                        كود شحن رصيد
                      </p>
                      <p
                        className="font-mono text-xl font-black tracking-[3px]"
                        style={{
                          color: "#fff",
                          textShadow: "0 2px 8px rgba(0,0,0,0.2)",
                        }}
                      >
                        {voucher.code}
                      </p>
                    </div>
                    {/* Checkbox */}
                    <div
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${isSelected ? "border-white bg-white" : "border-white/50 bg-white/10"}`}
                    >
                      {isSelected && (
                        <CheckCircle2
                          className="w-4 h-4"
                          style={{
                            color: "#333",
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Value Badge */}
                  {voucherValue > 0 && (
                    <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-xs font-black text-white">
                        {voucherValue} جنيه
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className={`p-4 ${dark ? "bg-[#1A1D2B]" : "bg-white"}`}>
                  <div className="flex justify-between items-center">
                    <div
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${voucher.status === "active" ? (dark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700") : dark ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-700"}`}
                    >
                      {voucher.status === "active" ? "نشط" : "مستخدم"}
                    </div>
                    <Ticket
                      className={`w-4 h-4 ${dark ? "text-gray-600" : "text-gray-300"}`}
                    />
                  </div>

                  {voucher.status === "active" && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(voucher.code);
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-xs transition-all ${copiedCode === voucher.code ? "bg-emerald-500/10 text-emerald-500" : dark ? "bg-white/5 hover:bg-white/10 text-gray-300" : "bg-gray-50 hover:bg-gray-100 text-gray-700"}`}
                      >
                        {copiedCode === voucher.code ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {copiedCode === voucher.code ? "تم" : "نسخ"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareImageClick(voucher);
                        }}
                        className={`w-10 flex items-center justify-center rounded-xl transition-all ${dark ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400" : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600"}`}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* Print Settings Modal */}
      {/* ════════════════════════════════════════════════════════════ */}
      {showPrintSettings && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setShowPrintSettings(false)}
          />
          <div
            className={`relative w-full max-w-xl rounded-3xl shadow-2xl p-8 ${dark ? "bg-[#141625]" : "bg-white"}`}
          >
            <h2
              className={`text-2xl font-black mb-2 ${dark ? "text-white" : "text-gray-900"}`}
            >
              إعدادات الطباعة
            </h2>
            <p
              className={`text-sm font-bold mb-6 ${dark ? "text-gray-400" : "text-gray-500"}`}
            >
              اختر عدد الأكواد في الصفحة الواحدة • سيتم طباعة{" "}
              {selectedForPrint.length} كود على{" "}
              {Math.ceil(selectedForPrint.length / printLayout.perPage)} صفحة
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              {PRINT_LAYOUTS.map((layout) => (
                <button
                  key={layout.id}
                  onClick={() => setPrintLayout(layout)}
                  className={`p-4 rounded-2xl border-2 transition-all text-center ${
                    printLayout.id === layout.id
                      ? "border-2 text-white shadow-lg scale-[1.03]"
                      : dark
                        ? "border-white/10 bg-white/5 text-gray-300 hover:border-white/20"
                        : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
                  }`}
                  style={
                    printLayout.id === layout.id
                      ? { borderColor: pc, backgroundColor: pc }
                      : {}
                  }
                >
                  <div className="text-2xl font-black mb-1">
                    {layout.perPage}
                  </div>
                  <div className="text-xs font-bold opacity-80">
                    {layout.label}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPrintSettings(false)}
                className={`flex-1 py-3 rounded-2xl font-bold transition-all ${dark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"}`}
              >
                إلغاء
              </button>
              <button
                onClick={executePrint}
                className="flex-1 py-3 rounded-2xl font-black text-white transition-all shadow-xl hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
                style={{ backgroundColor: pc }}
              >
                <Printer className="w-5 h-5" /> ابدأ الطباعة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* Share to Student Modal */}
      {/* ════════════════════════════════════════════════════════════ */}
      {shareVoucherData && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setShareVoucherData(null)}
          />
          <div
            className={`relative w-full max-w-lg rounded-3xl shadow-2xl p-6 ${dark ? "bg-[#141625]" : "bg-white"} flex flex-col h-[80vh] max-h-[600px]`}
          >
            <div className="flex justify-between items-center mb-6 shrink-0">
              <div>
                <h2
                  className={`text-2xl font-black ${dark ? "text-white" : "text-gray-900"}`}
                >
                  إرسال الكود لطالب
                </h2>
                <p
                  className={`text-sm mt-1 font-bold ${dark ? "text-gray-400" : "text-gray-500"}`}
                >
                  كود:{" "}
                  <span className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {shareVoucherData.code}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setShareVoucherData(null)}
                className={`p-2 rounded-xl transition-all ${dark ? "bg-white/5 hover:bg-white/10 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative mb-4 shrink-0">
              <Search
                className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${dark ? "text-gray-500" : "text-gray-400"}`}
              />
              <input
                type="text"
                placeholder="ابحث باسم الطالب أو رقم الهاتف..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className={`w-full pr-12 pl-4 py-3 rounded-2xl font-bold transition-all outline-none border-2 ${dark ? "bg-black/20 border-white/5 text-white focus:border-white/20" : "bg-gray-50 border-gray-100 text-gray-900 focus:border-gray-300"}`}
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {studentsLoading ? (
                <div className="flex flex-col items-center justify-center h-40">
                  <Loader2
                    className="w-8 h-8 animate-spin mb-4"
                    style={{ color: pc }}
                  />
                  <p
                    className={`font-bold ${dark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    جاري جلب الطلاب...
                  </p>
                </div>
              ) : students.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <AlertCircle
                    className={`w-10 h-10 mb-3 opacity-50 ${dark ? "text-gray-500" : "text-gray-400"}`}
                  />
                  <p
                    className={`font-bold ${dark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    لا يوجد طلاب مسجلين
                  </p>
                </div>
              ) : (
                students
                  .filter(
                    (s) =>
                      s.name
                        ?.toLowerCase()
                        .includes(studentSearch.toLowerCase()) ||
                      s.phone?.includes(studentSearch),
                  )
                  .map((student) => (
                    <div
                      key={student.id}
                      className={`flex items-center justify-between p-3 rounded-2xl transition-all border ${dark ? "border-white/5 hover:border-white/10 bg-white/5" : "border-gray-100 hover:border-gray-200 bg-gray-50"}`}
                    >
                      <div>
                        <h4
                          className={`font-black text-sm mb-1 ${dark ? "text-white" : "text-gray-900"}`}
                        >
                          {student.name}
                        </h4>
                        <p
                          className={`text-xs font-bold ${dark ? "text-gray-400" : "text-gray-500"}`}
                        >
                          {student.phone}
                        </p>
                      </div>
                      <button
                        onClick={() => generateAndSend(student)}
                        disabled={isGeneratingImage}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${isGeneratingImage ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-0.5 active:scale-95"}`}
                        style={{ backgroundColor: pc, color: "#fff" }}
                      >
                        {isGeneratingImage ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        إرسال
                      </button>
                    </div>
                  ))
              )}
              {!studentsLoading &&
                students.filter(
                  (s) =>
                    s.name
                      ?.toLowerCase()
                      .includes(studentSearch.toLowerCase()) ||
                    s.phone?.includes(studentSearch),
                ).length === 0 &&
                students.length > 0 && (
                  <div className="text-center py-10">
                    <p
                      className={`font-bold ${dark ? "text-gray-400" : "text-gray-500"}`}
                    >
                      لا يوجد طالب بهذا الاسم أو الرقم
                    </p>
                  </div>
                )}
            </div>

            <div
              className={`mt-4 pt-4 border-t ${dark ? "border-white/10" : "border-gray-100"} shrink-0`}
            >
              <p
                className={`text-xs font-bold text-center ${dark ? "text-gray-400" : "text-gray-500"}`}
              >
                عند الضغط على إرسال سيتم تحويل كارت الكود إلى صورة مقصوصة
                وتحميلها، ليتم إرسالها للطالب.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* Printable Area — Portal into document.body so CSS can reach it */}
      {/* ════════════════════════════════════════════════════════════ */}
      <PrintPortal
        pages={pages}
        printLayout={printLayout}
        voucherValue={voucherValue}
        tenant={tenant}
        tenantLayout={tenantLayout}
        pc={pc}
      />
    </div>
  );
}

/* ─── Print Portal Component ─── */
function PrintPortal({
  pages,
  printLayout,
  voucherValue,
  tenant,
  tenantLayout,
  pc,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Inject global print styles into <head>
    const styleId = "voucher-print-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @media print {
          /* Hide the entire app */
          body > *:not(#voucher-print-portal) {
            display: none !important;
            visibility: hidden !important;
          }
          /* Show print portal */
          #voucher-print-portal {
            display: block !important;
            visibility: visible !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            z-index: 999999 !important;
          }
          #voucher-print-portal * {
            visibility: visible !important;
          }
          .voucher-print-page {
            display: grid !important;
            width: 100% !important;
            min-height: 97vh !important;
            box-sizing: border-box !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          @page {
            margin: 8mm;
            size: A4;
          }
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, []);

  if (!mounted || pages.length === 0) return null;

  return createPortal(
    <div
      id="voucher-print-portal"
      style={{ display: "none" }} // hidden on screen, shown via @media print
    >
      {pages.map((pageVouchers, pageIdx) => (
        <div
          key={pageIdx}
          className="voucher-print-page"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${printLayout.cols}, 1fr)`,
            gridTemplateRows: `repeat(${printLayout.rows}, 1fr)`,
            gap: "14px",
            padding: "16px",
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
            pageBreakAfter: pageIdx < pages.length - 1 ? "always" : "auto",
          }}
        >
          {pageVouchers.map((voucher, vIdx) => {
            const isCompact = printLayout.shape === "compact";

            return (
              <div
                key={voucher.id}
                style={{
                  background: pc,
                  borderRadius: "18px",
                  padding: isCompact ? "12px" : "18px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  overflow: "hidden",
                  direction: "rtl",
                }}
              >
                {/* Decorative Blobs */}
                <div
                  style={{
                    position: "absolute",
                    top: "-25px",
                    left: "-25px",
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.12)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "-30px",
                    right: "-30px",
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.08)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%,-50%)",
                    width: "160px",
                    height: "160px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.04)",
                  }}
                />

                {/* Top: Logo + Name */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    position: "relative",
                    zIndex: 1,
                    marginBottom: isCompact ? "4px" : "10px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        color: "rgba(255,255,255,0.6)",
                        marginBottom: "1px",
                      }}
                    >
                      منصة
                    </div>
                    <div
                      style={{
                        fontSize: isCompact ? "12px" : "16px",
                        fontWeight: "900",
                        color: "#fff",
                        textShadow: "0 1px 4px rgba(0,0,0,0.15)",
                      }}
                    >
                      {tenant?.name || "---"}
                    </div>
                  </div>
                  {tenantLayout?.logoUrl ? (
                    <img
                      src={tenantLayout.logoUrl}
                      alt="Logo"
                      style={{
                        height: isCompact ? "22px" : "32px",
                        width: "auto",
                        objectFit: "contain",
                        filter: "brightness(0) invert(1)",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: isCompact ? "24px" : "32px",
                        height: isCompact ? "24px" : "32px",
                        borderRadius: "8px",
                        background: "rgba(255,255,255,0.25)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "900",
                        color: "#fff",
                        fontSize: isCompact ? "10px" : "14px",
                      }}
                    >
                      {tenant?.name?.charAt(0) || "ش"}
                    </div>
                  )}
                </div>

                {/* Center: Code */}
                <div
                  style={{
                    textAlign: "center",
                    position: "relative",
                    zIndex: 1,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "8px",
                      fontWeight: "700",
                      color: "rgba(255,255,255,0.55)",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      marginBottom: "4px",
                    }}
                  >
                    كود تفعيل رصيد
                  </div>
                  <div
                    style={{
                      fontFamily: "'Courier New', Courier, monospace",
                      fontSize: isCompact ? "16px" : "24px",
                      fontWeight: "900",
                      color: "#fff",
                      letterSpacing: "4px",
                      textShadow: "0 2px 8px rgba(0,0,0,0.25)",
                      background: "rgba(0,0,0,0.18)",
                      padding: isCompact ? "4px 10px" : "8px 18px",
                      borderRadius: "10px",
                    }}
                  >
                    {voucher.code}
                  </div>
                  {voucherValue > 0 && (
                    <div
                      style={{
                        marginTop: "6px",
                        background: "rgba(255,255,255,0.2)",
                        borderRadius: "999px",
                        padding: "3px 14px",
                        fontSize: isCompact ? "9px" : "12px",
                        fontWeight: "900",
                        color: "#fff",
                      }}
                    >
                      💰 {voucherValue} جنيه
                    </div>
                  )}
                </div>

                {/* Bottom */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    position: "relative",
                    zIndex: 1,
                    borderTop: "1px solid rgba(255,255,255,0.15)",
                    paddingTop: isCompact ? "4px" : "8px",
                    marginTop: isCompact ? "4px" : "8px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "8px",
                      fontWeight: "700",
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    {voucher.status === "active" ? "✅ نشط" : "⛔ مستخدم"}
                  </div>
                  <div
                    style={{
                      fontSize: "8px",
                      fontWeight: "700",
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    تم الإصدار بواسطة{" "}
                    <span
                      style={{
                        fontWeight: "900",
                        fontSize: "11px",
                        color: "#fff",
                      }}
                    >
                      Ofoq
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>,
    document.body,
  );
}
