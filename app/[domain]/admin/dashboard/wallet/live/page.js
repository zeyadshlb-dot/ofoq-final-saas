"use client";

import { useState, useEffect } from "react";
import {
  Radio,
  History,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Plus,
  ShoppingBag,
  Users,
  Clock,
  Zap,
} from "lucide-react";
import { useTheme, getSlug, getToken } from "../../layout";

export default function LiveWalletPage() {
  const { dark, primaryColor, tenant, instructor } = useTheme();
  const pc = primaryColor || "#f43f5e"; // Rose 500 as default for Live
  const slug = getSlug();
  const token = getToken();

  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(null);
  const [data, setData] = useState({
    wallet: { balance_minutes: 0, current_capacity_limit: 0 },
    transactions: [],
    packages: [],
  });

  const fetchData = async () => {
    if (!token || slug === "main") return;
    try {
      setLoading(true);

      // 1. Wallet Balance
      const wRes = await fetch(`/api/v1/live/wallet?slug=${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const wData = await wRes.json();

      // 2. Ledger (Transactions)
      const lRes = await fetch(`/api/v1/live/ledger?slug=${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const lData = await lRes.json();

      // 3. Available Packages
      const pRes = await fetch(`/api/v1/live/packages/available?slug=${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pData = await pRes.json();

      setData({
        wallet: wData.data || { balance_minutes: 0, current_capacity_limit: 0 },
        transactions: Array.isArray(lData.data) ? lData.data : [],
        packages: Array.isArray(pData.data) ? pData.data : [],
      });
    } catch (err) {
      console.error("Failed to fetch live wallet data", err);
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
      const priceVal = (pkg.price_qirsh / 100).toString();
      const payload = {
        cartTotal: priceVal,
        currency: "EGP",
        customer: {
          first_name: instructor?.name?.split(" ")[0] || "Instructor",
          last_name: instructor?.name?.split(" ")[1] || "Admin",
          email: instructor?.email || "support@ofoq.com",
          phone: instructor?.phone || "01000000000",
          customer_unique_id:
            instructor?.id?.toString() || Date.now().toString(),
        },
        redirectionUrls: {
          successUrl: `${window.location.origin}/dashboard/wallet/live/success?package_id=${pkg.id}`,
          failUrl: `${window.location.origin}/dashboard/wallet/live/fail`,
          pendingUrl: `${window.location.origin}/dashboard/wallet/live/pending`,
        },
        cartItems: [
          {
            name: `باقة بث مباشر: ${pkg.name_ar} (${pkg.total_minutes} دقيقة)`,
            price: priceVal,
            quantity: "1",
          },
        ],
      };

      const response = await fetch("/api/fawaterk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createInvoice",
          data: payload,
          isSandbox: true,
        }),
      });

      const result = await response.json();
      if (result.status === "success" && result.data?.url) {
        window.location.href = result.data.url;
      } else {
        throw new Error(result.message || JSON.stringify(result));
      }
    } catch (err) {
      console.error("Fawaterk Error:", err);
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
          جاري تحميل محفظة البث المباشر...
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
              className={`p-2.5 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-lg`}
            >
              <Radio className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black">محفظة البث المباشر</h1>
          </div>
          <p className={`text-sm ${d ? "text-gray-400" : "text-gray-500"}`}>
            إدارة دقائق البث، سعة القاعة، وشحن الرصيد للدروس المباشرة
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
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-600/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div
            className={`mb-6 p-4 rounded-3xl ${d ? "bg-rose-500/10 border border-rose-500/20" : "bg-rose-50 border border-rose-100"}`}
          >
            <Radio className="w-10 h-10 text-rose-500 animate-pulse" />
          </div>
          <h2
            className={`text-sm font-bold uppercase tracking-[0.2em] mb-3 ${d ? "text-gray-500" : "text-gray-400"}`}
          >
            رصيدك من الدقائق
          </h2>

          <div className="flex items-baseline gap-4 mb-8">
            <span className="text-7xl md:text-8xl font-black tabular-nums bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-orange-500 to-rose-500">
              {data.wallet.balance_minutes}
            </span>
            <span
              className={`text-xl md:text-2xl font-bold ${d ? "text-gray-500" : "text-gray-400"}`}
            >
              دقيقة
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
            <div
              className={`p-6 rounded-3xl flex items-center justify-between ${d ? "bg-white/5 backdrop-blur-md" : "bg-gray-50"}`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <p
                    className={`text-xs font-bold mb-1 ${d ? "text-gray-500" : "text-gray-400"}`}
                  >
                    أقصى سعة للقاعة
                  </p>
                  <p className="text-lg font-black tabular-nums">
                    {data.wallet.current_capacity_limit}{" "}
                    <span className="text-sm font-bold opacity-60">طالب</span>
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`p-6 rounded-3xl flex items-center justify-between ${d ? "bg-white/5 backdrop-blur-md" : "bg-gray-50"}`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-500">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <p
                    className={`text-xs font-bold mb-1 ${d ? "text-gray-500" : "text-gray-400"}`}
                  >
                    تاريخ آخر شحن
                  </p>
                  <p className="text-lg font-black tracking-tight">
                    {data.transactions.find(
                      (t) => t.transaction_type === "charge",
                    )?.CreatedAt
                      ? new Date(
                          data.transactions.find(
                            (t) => t.transaction_type === "charge",
                          ).CreatedAt,
                        ).toLocaleDateString("ar-EG")
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Buy Live Packages ── */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 rounded-xl bg-rose-500/10 text-rose-500`}>
            <ShoppingBag className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-black">باقات البث المباشر</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`group relative overflow-hidden rounded-[2.5rem] p-8 transition-all duration-500 hover:-translate-y-2 ${d ? "bg-[#141625] border border-white/5" : "bg-white border border-gray-100 shadow-sm"}`}
            >
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div
                    className={`p-3 rounded-2xl bg-gradient-to-br from-rose-500/10 to-orange-500/10`}
                  >
                    <Radio className="w-6 h-6 text-rose-500" />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">
                      سعة القاعة
                    </p>
                    <p className="text-sm font-black text-rose-500">
                      {pkg.max_capacity} طالب
                    </p>
                  </div>
                </div>

                <h4 className="text-xl font-black mb-4">{pkg.name_ar}</h4>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span className="text-sm font-bold opacity-70">
                      {pkg.total_minutes} دقيقة بث مباشر
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span className="text-sm font-bold opacity-70">
                      جودة بث عالية HD
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span className="text-sm font-bold opacity-70">
                      دعم فني مخصص
                    </span>
                  </div>
                </div>

                <div
                  className={`flex items-end justify-between p-5 rounded-3xl mb-6 ${d ? "bg-white/5" : "bg-gray-50"}`}
                >
                  <div>
                    <p className="text-[10px] font-black opacity-40 uppercase mb-1">
                      السعر الإجمالي
                    </p>
                    <p className="text-3xl font-black">
                      {(pkg.price_qirsh / 100).toFixed(0)}
                      <span className="text-sm font-bold opacity-40 mr-1">
                        ج.م
                      </span>
                    </p>
                  </div>
                  <div className="text-right opacity-40">
                    <p className="text-[10px] font-bold">للدقيقة</p>
                    <p className="text-xs font-black">
                      {(pkg.price_qirsh / 100 / pkg.total_minutes).toFixed(2)} ج
                    </p>
                  </div>
                </div>

                <button
                  disabled={buying === pkg.id}
                  onClick={() => handlePurchase(pkg)}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm transition-all shadow-xl active:scale-95 ${buying === pkg.id ? "bg-gray-200 cursor-not-allowed text-gray-400" : "bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white shadow-rose-500/20"}`}
                >
                  {buying === pkg.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      اشتراك في الباقة
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
        className={`rounded-[2.5rem] overflow-hidden ${d ? "bg-[#141625] border border-white/[.06]" : "bg-white border border-gray-100 shadow-sm"}`}
      >
        <div className="p-8 border-b border-inherit bg-inherit flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-blue-500/10 text-blue-500`}>
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black">سجل استهلاك الدقائق</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr
                className={`text-[11px] font-bold uppercase tracking-wider ${d ? "bg-white/[0.02] text-gray-500" : "bg-gray-50 text-gray-400"}`}
              >
                <th className="px-8 py-5">العملية</th>
                <th className="px-8 py-5">المرجع / الجلسة</th>
                <th className="px-8 py-5 text-center">الدقائق</th>
                <th className="px-8 py-5 text-center">التاريخ</th>
                <th className="px-8 py-5 text-center">التكلفة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {data.transactions.length > 0 ? (
                data.transactions.map((tr) => (
                  <tr
                    key={tr.id}
                    className={`${d ? "hover:bg-white/[0.02]" : "hover:bg-gray-50/70"} transition-colors`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-xl ${tr.transaction_type === "charge" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}
                        >
                          {tr.transaction_type === "charge" ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                        </div>
                        <span className="text-sm font-bold">
                          {tr.transaction_type === "charge"
                            ? "شحن رصيد"
                            : "استهلاك بث"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p
                        className={`text-sm font-medium tabular-nums ${d ? "text-gray-300" : "text-gray-600"}`}
                      >
                        {tr.reference_id || "—"}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span
                        className={`text-sm font-black tabular-nums ${tr.transaction_type === "charge" ? "text-green-500" : "text-red-500"}`}
                      >
                        {tr.transaction_type === "charge" ? "+" : "-"}
                        {tr.minutes}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold">
                          {new Date(tr.CreatedAt).toLocaleDateString("ar-EG")}
                        </span>
                        <span className="text-[10px] opacity-40 font-black tracking-tight">
                          {new Date(tr.CreatedAt).toLocaleTimeString("ar-EG", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-sm font-black tabular-nums opacity-60">
                        {tr.amount_qirsh > 0
                          ? (tr.amount_qirsh / 100).toFixed(2) + " ج"
                          : "—"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <Clock className="w-12 h-12 mb-2" />
                      <p className="text-sm font-bold">
                        لا توجد عمليات سابقة في سجل البث المباشر
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Footer / Support ── */}
      <div
        className={`p-10 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 ${d ? "bg-white/[0.02]" : "bg-gray-100/50"}`}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500">
            <Zap className="w-6 h-6" />
          </div>
          <div className="text-right">
            <h5 className="text-sm font-black mb-1">تحتاج لسعة أكبر؟</h5>
            <p className="text-xs font-bold opacity-50">
              تواصل مع الدعم الفني لطلب تخصيص باقات للمؤتمرات الضخمة أو سعات غير
              محدودة.
            </p>
          </div>
        </div>
        <button
          className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${d ? "bg-white/10 hover:bg-white/20" : "bg-white shadow-sm hover:shadow-md"}`}
        >
          طلب باقة مخصصة
        </button>
      </div>
    </div>
  );
}
