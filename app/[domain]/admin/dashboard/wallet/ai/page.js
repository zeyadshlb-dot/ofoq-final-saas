"use client";

import { useState, useEffect } from "react";
import {
  Zap,
  History,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Clock,
  ChevronLeft,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Plus,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useTheme, getSlug, getToken } from "../../layout";

export default function AIWalletPage() {
  const { dark, primaryColor, instructor } = useTheme();
  const pc = primaryColor || "#8b5cf6";
  const slug = getSlug();
  const token = getToken();

  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(null); // package_id being bought
  const [data, setData] = useState({
    wallet: { balance: 0, total_consumed: 0 },
    transactions: [],
    packages: [],
  });

  const fetchData = async () => {
    if (!token || slug === "main") return;
    try {
      setLoading(true);

      // 1. Balance & Transactions
      const bRes = await fetch(`/api/v1/ai/balance?slug=${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const bData = await bRes.json();

      // 2. Available Packages
      const pRes = await fetch(`/api/v1/ai/packages/available?slug=${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pData = await pRes.json();

      setData({
        wallet: bData.data?.wallet || { balance: 0, total_consumed: 0 },
        transactions: bData.data?.transactions || [],
        packages: pData.data || [],
      });
    } catch (err) {
      console.error("Failed to fetch AI wallet data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [slug]);

  const handlePurchase = async (pkg) => {
    setBuying(pkg.id);
    try {
      // 1. Prepare Payload for Fawaterk
      const payload = {
        cartTotal: (pkg.price_in_qirsh / 100).toString(),
        currency: "EGP",
        customer: {
          first_name: instructor?.name?.split(" ")[0] || "Instructor",
          last_name: instructor?.name?.split(" ")[1] || "User",
          email: instructor?.email || "test@fawaterk.com",
          phone: instructor?.phone || "01000000000",
          customer_unique_id:
            instructor?.id?.toString() || Date.now().toString(),
        },
        redirectionUrls: {
          successUrl: `${window.location.origin}/dashboard/wallet/ai/success?package_id=${pkg.id}`,
          failUrl: `${window.location.origin}/dashboard/wallet/ai/fail`,
          pendingUrl: `${window.location.origin}/dashboard/wallet/ai/pending`,
        },
        cartItems: [
          {
            name: `باقة ذكاء اصطناعي: ${pkg.name} (${pkg.points_count} نقطة)`,
            price: (pkg.price_in_qirsh / 100).toString(),
            quantity: "1",
          },
        ],
      };

      // 2. Call our Fawaterk API Proxy
      const response = await fetch("/api/fawaterk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createInvoice",
          data: payload,
          isSandbox: true, // Check if this should be dynamic based on env
        }),
      });

      const result = await response.json();

      if (result.status === "success" && result.data?.url) {
        // Redirect to Fawaterk checkout
        window.location.href = result.data.url;
      } else {
        throw new Error(result.message || "حدث خطأ أثناء إنشاء الفاتورة");
      }
    } catch (err) {
      alert("خطأ: " + err.message);
    } finally {
      setBuying(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: pc }} />
        <p className="text-sm font-medium animate-pulse opacity-70">
          جاري تحميل محفظة الذكاء الاصطناعي...
        </p>
      </div>
    );
  }

  const d = dark;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`p-2.5 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg`}
            >
              <Zap className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black">محفظة الذكاء الاصطناعي</h1>
          </div>
          <p className={`text-sm ${d ? "text-gray-400" : "text-gray-500"}`}>
            إدارة نقاط الـ AI، شحن الرصيد، ومتابعة سجل الاستهلاك
          </p>
        </div>

        <button
          onClick={() => window.history.back()}
          className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${d ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-white border-gray-200 hover:bg-gray-50 shadow-sm"}`}
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-bold">العودة للوحة القيادة</span>
        </button>
      </div>

      {/* ── Main Stats Card ── */}
      <div
        className={`relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 ${d ? "bg-[#141625] border border-white/[.06]" : "bg-white border border-gray-100 shadow-[0_8px_40px_rgba(0,0,0,0.03)]"}`}
      >
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-600/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div
            className={`mb-6 p-4 rounded-3xl ${d ? "bg-violet-500/10 border border-violet-500/20" : "bg-violet-50 border border-violet-100"}`}
          >
            <Sparkles className="w-10 h-10 text-violet-500" />
          </div>
          <h2
            className={`text-sm font-bold uppercase tracking-[0.2em] mb-3 ${d ? "text-gray-500" : "text-gray-400"}`}
          >
            رصيدك الحالي
          </h2>

          <div className="flex items-baseline gap-4 mb-8">
            <span className="text-7xl md:text-8xl font-black tabular-nums bg-clip-text text-transparent bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500">
              {data.wallet.balance}
            </span>
            <span
              className={`text-xl md:text-2xl font-bold ${d ? "text-gray-500" : "text-gray-400"}`}
            >
              نقطة
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
            <div
              className={`p-6 rounded-3xl flex items-center justify-between ${d ? "bg-white/5 backdrop-blur-md" : "bg-gray-50"}`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-fuchsia-500/10 text-fuchsia-500">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <p
                    className={`text-xs font-bold mb-1 ${d ? "text-gray-500" : "text-gray-400"}`}
                  >
                    إجمالي المستهلك
                  </p>
                  <p className="text-lg font-black tabular-nums">
                    {data.wallet.total_consumed}{" "}
                    <span className="text-sm font-bold opacity-60">نقطة</span>
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`p-6 rounded-3xl flex items-center justify-between ${d ? "bg-white/5 backdrop-blur-md" : "bg-gray-50"}`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <p
                    className={`text-xs font-bold mb-1 ${d ? "text-gray-500" : "text-gray-400"}`}
                  >
                    تاريخ آخر عملية
                  </p>
                  <p className="text-lg font-black">
                    {data.transactions[0]?.created_at
                      ? new Date(
                          data.transactions[0].created_at,
                        ).toLocaleDateString("ar-EG")
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Buy Points Section ── */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 rounded-xl bg-orange-500/10 text-orange-500`}>
            <ShoppingBag className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-black">شحن رصيد النقاط</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {data.packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`group relative overflow-hidden rounded-[2rem] p-6 transition-all duration-300 hover:-translate-y-2 ${d ? "bg-[#141625] border border-white/5" : "bg-white border border-gray-100 shadow-sm"}`}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className={`mb-4 p-3 rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10`}
                >
                  <Zap className="w-6 h-6 text-violet-500" />
                </div>
                <h4 className="text-lg font-black mb-1">{pkg.name}</h4>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-black text-violet-500">
                    {pkg.points_count}
                  </span>
                  <span className="text-xs font-bold opacity-50">نقطة</span>
                </div>

                <div
                  className={`w-full p-4 rounded-2xl mb-6 ${d ? "bg-white/5" : "bg-gray-50"}`}
                >
                  <p
                    className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${d ? "text-gray-500" : "text-gray-400"}`}
                  >
                    السعر
                  </p>
                  <p className="text-2xl font-black tracking-tight">
                    {(pkg.price_in_qirsh / 100).toFixed(2)}{" "}
                    <span className="text-sm">ج.م</span>
                  </p>
                </div>

                <button
                  disabled={buying === pkg.id}
                  onClick={() => handlePurchase(pkg)}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 ${buying === pkg.id ? "bg-gray-200 cursor-not-allowed text-gray-400" : "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-violet-500/20"}`}
                >
                  {buying === pkg.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      شراء الآن
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Transactions History ── */}
      <div
        className={`rounded-[2rem] overflow-hidden ${d ? "bg-[#141625] border border-white/[.06]" : "bg-white border border-gray-100 shadow-sm"}`}
      >
        <div className="p-6 border-b border-inherit bg-inherit flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-blue-500/10 text-blue-500`}>
              <History className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black">سجل العمليات</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr
                className={`text-[11px] font-bold uppercase tracking-wider ${d ? "bg-white/[0.02] text-gray-500" : "bg-gray-50 text-gray-400"}`}
              >
                <th className="px-6 py-4">العملية</th>
                <th className="px-6 py-4">التفاصيل</th>
                <th className="px-6 py-4 text-center">النقاط</th>
                <th className="px-6 py-4 text-center">التاريخ</th>
                <th className="px-6 py-4 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {data.transactions.length > 0 ? (
                data.transactions.map((tr) => (
                  <tr
                    key={tr.id}
                    className={`${d ? "hover:bg-white/[0.02]" : "hover:bg-gray-50/70"} transition-colors`}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-xl ${tr.type === "credit" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}
                        >
                          {tr.type === "credit" ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                        </div>
                        <span className="text-sm font-bold">
                          {tr.type === "credit" ? "شحن رصيد" : "خصم استهلاك"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p
                        className={`text-sm font-medium ${d ? "text-gray-300" : "text-gray-600"}`}
                      >
                        {tr.description}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span
                        className={`text-sm font-black tabular-nums ${tr.type === "credit" ? "text-green-500" : "text-red-500"}`}
                      >
                        {tr.type === "credit" ? "+" : "-"}
                        {tr.points_amount}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold">
                          {new Date(tr.created_at).toLocaleDateString("ar-EG")}
                        </span>
                        <span className="text-[10px] opacity-40 font-bold">
                          {new Date(tr.created_at).toLocaleTimeString("ar-EG", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-green-500/10 text-green-500">
                        <CheckCircle2 className="w-3 h-3" />
                        مكتملة
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <History className="w-10 h-10 mb-2" />
                      <p className="text-sm font-bold">
                        لا توجد عمليات سابقة حتى الآن
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              {/* Example points consumption as requested */}
              {data.transactions.length > 0 && (
                <tr className="bg-orange-500/[0.03] border-t-2 border-orange-500/10 italic">
                  <td className="px-6 py-4 opacity-50" colSpan="5">
                    <div className="flex items-center gap-2 text-xs font-bold text-orange-500/70">
                      <AlertCircle className="w-3 h-3" />
                      مثال لخصم استهلاك: يتم الخصم تلقائياً عند توليد محتوى ذكي
                      (مثل جلب شرح الدروس أو توليد أسئلة)
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Footer ── */}
      <div
        className={`p-8 rounded-[2rem] text-center ${d ? "bg-white/[0.02]" : "bg-gray-100/50"}`}
      >
        <p className="text-sm font-bold opacity-40">
          تطبق سياسة الاستخدام العادل على نقاط الذكاء الاصطناعي. النقاط صلاحيتها
          12 شهر من تاريخ الشحن.
        </p>
      </div>
    </div>
  );
}
