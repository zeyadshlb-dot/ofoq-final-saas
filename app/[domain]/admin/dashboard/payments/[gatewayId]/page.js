"use client";

import React, { useState, useEffect } from "react";
import { useTheme, getSlug, getToken } from "../../layout";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  Save,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function GatewaySetupPage() {
  const { dark, primaryColor } = useTheme();
  const slug = getSlug();
  const router = useRouter();
  const params = useParams();
  const gatewayId = params.gatewayId;

  const [gateway, setGateway] = useState(null);
  const [credentials, setCredentials] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = getToken();
      try {
        // 1. Fetch available gateways to get the schema
        const availRes = await fetch("/api/v1/payments/gateways/available", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const availData = await availRes.json();
        const found = (availData.data || []).find(
          (g) => g.gateway_id === gatewayId,
        );

        if (!found) {
          setErrorMsg("هذه البوابة غير متاحة أو تم إيقافها.");
          setLoading(false);
          return;
        }
        setGateway(found);

        // 2. Fetch existing config
        const confRes = await fetch(
          `/api/v1/payments/tenant-gateways?slug=${slug}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const confData = await confRes.json();
        const existing = (confData.data || []).find(
          (g) => g.gateway_id === gatewayId,
        );

        if (existing && existing.credentials) {
          try {
            // Backend might hide tokens or send them, handle carefully
            setCredentials(existing.credentials);
          } catch (e) {
            setCredentials({});
          }
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("تعذر الاتصال بالخادم لجلب بيانات البوابة.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, gatewayId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    const token = getToken();
    const formData = new URLSearchParams();
    formData.append("slug", slug);
    formData.append("gateway_id", gatewayId);
    formData.append("credentials", JSON.stringify(credentials));
    formData.append("is_active", "true");

    try {
      const res = await fetch("/api/v1/payments/tenant-gateways", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
        body: formData.toString(),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "حدث خطأ أثناء حفظ الإعدادات");
      }

      setSuccessMsg("تم ربط البوابة بنجاح! جاري العودة...");
      setTimeout(() => {
        router.push("/dashboard/payments");
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-32">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin shadow-lg"></div>
        <p className="mt-4 text-gray-500 font-bold">
          جاري تحميل إعدادات البوابة...
        </p>
      </div>
    );
  }

  if (!gateway) {
    return (
      <div className="p-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 font-bold text-gray-500 hover:text-gray-800 transition"
        >
          <ArrowRight className="w-4 h-4" /> عودة
        </button>
        <div className="p-6 bg-red-50 text-red-500 border border-red-200 rounded-2xl flex items-center gap-3 font-bold">
          <AlertTriangle className="w-6 h-6" /> {errorMsg}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Top Header & Back */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.push("/dashboard/payments")}
          className="flex items-center gap-2 px-4 py-2 font-bold text-sm bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-sm"
        >
          <ArrowRight className="w-4 h-4" /> عودة للبوابات
        </button>
      </div>

      <div
        className={`overflow-hidden rounded-3xl border shadow-xl ${dark ? "bg-[#11131f] border-white/10" : "bg-white border-gray-100"}`}
      >
        {/* Banner */}
        <div className="p-8 border-b border-gray-100 dark:border-white/5 bg-gradient-to-br from-gray-50 to-white dark:from-white/5 dark:to-transparent flex items-center justify-between">
          <div className="flex items-center gap-5">
            {gateway.logo ? (
              <div className="w-20 h-20 p-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
                <img
                  src={gateway.logo}
                  alt={gateway.name}
                  className="w-full object-contain"
                />
              </div>
            ) : (
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-4xl shadow-inner">
                💳
              </div>
            )}
            <div>
              <h1 className="text-3xl font-black">{gateway.name}</h1>
              <p
                className={`text-sm mt-2 font-medium flex items-center gap-1.5 ${dark ? "text-gray-400" : "text-gray-500"}`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> اتصال آمن
                ومشفّر من طرف إلى طرف
              </p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8">
          <form onSubmit={handleSave} className="space-y-6">
            {errorMsg && (
              <div className="p-4 rounded-xl auto-fade bg-red-50/80 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-3 shadow-sm">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-4 rounded-xl auto-fade bg-emerald-50/80 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center gap-3 shadow-sm">
                <CheckCircle className="w-5 h-5 shrink-0" />
                {successMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(gateway.config_schema || []).map((conf) => {
                const fieldKey = conf.key;
                return (
                  <div key={fieldKey} className="group">
                    <label className="block text-sm font-bold mb-2 opacity-90 transition-opacity group-focus-within:opacity-100 flex items-center gap-1">
                      {conf.label || fieldKey}
                      {conf.required && (
                        <span className="text-red-500 px-1" title="مطلوب">
                          *
                        </span>
                      )}
                    </label>

                    <input
                      type={conf.type === "string" ? "text" : conf.type}
                      required={conf.required || conf.is_required}
                      placeholder={
                        conf.placeholder || `أدخل ${conf.label || fieldKey}`
                      }
                      value={credentials[fieldKey] || ""}
                      onChange={(e) =>
                        setCredentials({
                          ...credentials,
                          [fieldKey]: e.target.value,
                        })
                      }
                      className={`w-full px-5 py-3.5 rounded-2xl border-2 outline-none font-mono text-sm shadow-sm transition-all focus:-translate-y-0.5 ${
                        dark
                          ? "bg-white/5 border-white/5 focus:border-emerald-500 focus:bg-white/10"
                          : "bg-gray-50 border-gray-100 focus:border-emerald-500 focus:bg-white"
                      }`}
                      style={{ transitionDuration: "300ms" }}
                    />
                  </div>
                );
              })}
            </div>

            <div
              className={`mt-8 p-5 rounded-2xl border ${dark ? "bg-emerald-900/20 border-emerald-500/30 text-emerald-300" : "bg-emerald-50 border-emerald-200 text-emerald-800"} flex gap-4 items-start`}
            >
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold leading-relaxed">
                ملاحظة أمان: سيتم تشفير جميع المفاتيح والأرقام السرية في قاعدة
                البيانات بمعيار AES-256. لا يمكن لأي شخص ولا حتى لإدارة النظام
                استرداد هذه المفاتيح في شكلها الأصلي.
              </p>
            </div>

            <div className="pt-8 mt-8 border-t border-gray-100 dark:border-white/5 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className={`px-8 py-3.5 rounded-2xl font-bold shadow-sm transition-all ${
                  dark
                    ? "bg-white/5 hover:bg-white/10 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                }`}
              >
                تحويل وتراجع
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-10 py-3.5 rounded-2xl text-white font-black shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm flex items-center gap-2 group disabled:opacity-50 disabled:hover:translate-y-0"
                style={{ background: primaryColor }}
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري التحقق...
                  </>
                ) : (
                  <>
                    تفعيل واستقبال المدفوعات{" "}
                    <Save className="w-5 h-5 transition-transform group-hover:scale-110" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
