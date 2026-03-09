"use client";

import { useState, useEffect } from "react";
import {
  Play,
  Video,
  HardDrive,
  Percent,
  Tag,
  Loader2,
  ArrowRight,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { useTheme } from "../../layout";

export default function VideoWalletPage() {
  const { dark, tenant, primaryColor } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gbToBuy, setGbToBuy] = useState(10);
  const [buying, setBuying] = useState(false);
  const d = dark;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("instructor_token");
        if (!token || !tenant?.id) return;

        const res = await fetch(
          `/api/v1/tenants/video-wallet-stats?tenant_id=${tenant.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch video stats", err);
      } finally {
        setLoading(false);
      }
    };

    if (tenant?.id) {
      fetchStats();
    }
  }, [tenant]);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  const gbPrice = Number(stats?.agreement?.custom_gb_price || 10);
  const totalPrice = gbToBuy * gbPrice;

  const handlePurchase = async () => {
    setBuying(true);
    try {
      const token = localStorage.getItem("instructor_token");
      const payload = {
        cartTotal: totalPrice.toString(),
        currency: "EGP",
        customer: {
          first_name: tenant?.name?.split(" ")[0] || "Instructor",
          last_name: "Admin",
          email: "support@ofoq.com", // Fallback
          phone: "01000000000",
          customer_unique_id: tenant?.id?.toString() || Date.now().toString(),
        },
        redirectionUrls: {
          successUrl: `${window.location.origin}/dashboard/wallet/video/success?gb=${gbToBuy}`,
          failUrl: `${window.location.origin}/dashboard/wallet/video/fail`,
          pendingUrl: `${window.location.origin}/dashboard/wallet/video/pending`,
        },
        cartItems: [
          {
            name: `شحن مساحة تخزين: ${gbToBuy} جيجا بايت`,
            price: gbPrice.toString(),
            quantity: gbToBuy.toString(),
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
        throw new Error(result.message || "حدث خطأ أثناء إنشاء الفاتورة");
      }
    } catch (err) {
      alert("خطأ: " + err.message);
    } finally {
      setBuying(false);
    }
  };

  const pc = primaryColor || "#3b82f6";
  const used = stats?.used_gb || 0;
  const total = stats?.total_gb || 0;
  const progress = total > 0 ? (used / total) * 100 : 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div
        className={`p-6 md:p-8 rounded-2xl md:rounded-[32px] border ${
          d ? "bg-[#11131f] border-white/5" : "bg-white border-gray-100"
        } shadow-sm`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-blue-500/15">
              <Play className="w-8 h-8 text-blue-500" strokeWidth={2.5} />
            </div>
            <div>
              <h1
                className={`text-2xl font-bold ${d ? "text-white" : "text-gray-900"}`}
              >
                محفظة الفيديو
              </h1>
              <p
                className={`mt-1 text-sm ${d ? "text-gray-400" : "text-gray-500"}`}
              >
                إدارة المساحة التخزينية وتكاليف البث والعمولات.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className={`p-2.5 rounded-xl border transition-all ${
                d
                  ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                  : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Storage Card */}
          <div
            className={`p-8 rounded-[32px] border relative overflow-hidden ${
              d ? "bg-[#11131f] border-white/5" : "bg-white border-gray-100"
            } shadow-sm`}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] -mr-32 -mt-32" />

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg">المساحة التخزينية</h3>
                  <p className="text-xs opacity-50">
                    نظرة عامة على استهلاكك للجيجات
                  </p>
                </div>
              </div>
              <div className="text-left">
                <span className="text-3xl font-black tabular-nums">{used}</span>
                <span className="text-sm font-bold opacity-40 mr-1">
                  / {total} جيجا
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div
                className={`h-6 w-full rounded-2xl overflow-hidden p-1 ${d ? "bg-white/5" : "bg-gray-100"}`}
              >
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl transition-all duration-1000 relative group"
                  style={{ width: `${Math.min(100, progress)}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between items-center bg-blue-500/5 p-4 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-bold opacity-70">
                    {Math.round(progress)}% مستهلك
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  <span className="text-sm font-bold opacity-70">
                    {stats?.available_gb || 0} جيجا متبقي
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Custom GB Selection */}
          <div
            className={`p-8 rounded-[32px] border ${
              d ? "bg-[#11131f] border-white/5" : "bg-white border-gray-100"
            } shadow-sm`}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg">شحن مساحة إضافية</h3>
                <p className="text-xs opacity-50">
                  اختر عدد الجيجات التي تريد إضافتها لمحفظتك
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-sm font-bold opacity-70 block">
                  عدد الجيجا بايت
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="500"
                    step="1"
                    className="flex-1 accent-blue-500"
                    value={gbToBuy}
                    onChange={(e) => setGbToBuy(Number(e.target.value))}
                  />
                  <div
                    className={`w-24 px-4 py-3 rounded-2xl text-center font-black ${d ? "bg-white/5" : "bg-gray-100"}`}
                  >
                    {gbToBuy} GB
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 50, 100, 250].map((v) => (
                    <button
                      key={v}
                      onClick={() => setGbToBuy(v)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${gbToBuy === v ? "bg-blue-500 text-white" : d ? "bg-white/5 hover:bg-white/10" : "bg-gray-50 hover:bg-gray-100"}`}
                    >
                      {v}G
                    </button>
                  ))}
                </div>
              </div>

              <div
                className={`p-6 rounded-3xl flex flex-col justify-center items-center text-center ${d ? "bg-white/5" : "bg-gray-50"}`}
              >
                <span className="text-xs font-bold opacity-40 mb-1">
                  الإجمالي المطلوب
                </span>
                <div className="text-4xl font-black mb-1">
                  {totalPrice} <span className="text-sm">جنية</span>
                </div>
                <p className="text-[10px] opacity-40">
                  سعر الجيجا: {gbPrice} جنية
                </p>
              </div>
            </div>

            <button
              onClick={handlePurchase}
              disabled={buying || gbToBuy <= 0}
              className="w-full mt-8 py-5 rounded-2xl font-black text-white shadow-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
              style={{ background: pc }}
            >
              {buying ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  إتمام الدفع وشحن المساحة <CreditCard className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Info & Details */}
        <div className="space-y-6">
          <div
            className={`p-6 rounded-[24px] border ${
              d ? "bg-[#11131f] border-white/5" : "bg-white border-gray-100"
            } shadow-sm`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Percent className="w-5 h-5 text-amber-500" />
              </div>
              <span className="font-bold">عمولة المنصة</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black">
                {stats?.agreement?.ofoq_commission_percentage || 0}
              </span>
              <span className="text-lg font-bold opacity-40">%</span>
            </div>
            <p className="mt-2 text-[10px] leading-relaxed opacity-50">
              نسبة تقتطعها المنصة آلياً من كل معالجة دفع تتم عبر بواباتك للطلاب.
            </p>
          </div>

          <div
            className={`p-6 rounded-[24px] border ${
              d ? "bg-[#11131f] border-white/5" : "bg-white border-gray-100"
            } shadow-sm`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="font-bold">سياسة التخزين</span>
            </div>
            <ul className="space-y-3">
              {[
                "المساحة تُضاف فور نجاح الدفع",
                "لا يوجد تاريخ انتهاء للجيجات",
                "خدمة CDN عالمية لضمان السرعة",
                "تشفير الفيديوهات لحمايتها",
              ].map((txt, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-xs opacity-70"
                >
                  <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                  {txt}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
