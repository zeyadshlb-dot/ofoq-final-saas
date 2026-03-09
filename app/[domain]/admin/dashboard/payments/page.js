"use client";

import React, { useState, useEffect } from "react";
import { useTheme, getSlug, getToken } from "../layout";
import {
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Power,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function PaymentsPage() {
  const { dark, primaryColor } = useTheme();
  const slug = getSlug();
  const router = useRouter();

  const [availableGateways, setAvailableGateways] = useState([]);
  const [configuredGateways, setConfiguredGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    const token = getToken();
    try {
      // 1. Fetch available gateways
      const availRes = await fetch("/api/v1/payments/gateways/available", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const availData = await availRes.json();
      const gateways = availData.data || [];

      // 2. Fetch configured gateways
      const confRes = await fetch(
        `/api/v1/payments/tenant-gateways?slug=${slug}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const confData = await confRes.json();
      const configured = confData.data || [];

      setAvailableGateways(gateways);
      setConfiguredGateways(configured);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [slug]);

  const handleDeactivate = async (gatewayId, existingConfig) => {
    if (
      !window.confirm(
        "هل أنت متأكد من رغبتك في إلغاء تفعيل هذه البوابة؟ لن تتمكن من استقبال مدفوعات من خلالها.",
      )
    ) {
      return;
    }

    setProcessingId(gatewayId);
    const token = getToken();

    // We send is_active=false, using the existing credentials so we don't lose them
    const formData = new URLSearchParams();
    formData.append("slug", slug);
    formData.append("gateway_id", gatewayId);
    // send empty or old credentials
    const credsObj = existingConfig?.credentials
      ? existingConfig.credentials
      : {};
    formData.append("credentials", JSON.stringify(credsObj));
    formData.append("is_active", "false");

    try {
      const res = await fetch("/api/v1/payments/tenant-gateways", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
        body: formData.toString(),
      });

      if (res.ok) {
        // Refresh the list
        await fetchData();
      } else {
        alert("حدث خطأ أثناء إلغاء التفعيل");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black mb-2 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
            style={{ background: primaryColor }}
          >
            <CreditCard className="w-5 h-5" />
          </div>
          بوابات الدفع المتاحة
        </h1>
        <p className={`text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>
          قم بإدارة بوابات الدفع الخاصة بمنصتك، وفعل البوابات اللي حابب تستقبل
          مدفوعات من خلالها للطلاب.
        </p>
      </div>

      {/* Grid of Available Gateways */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
        {availableGateways.map((gateway) => {
          const configConfig = configuredGateways.find(
            (g) => g.gateway_id === gateway.gateway_id,
          );
          const isConfiguredAndActive = configConfig && configConfig.is_active;
          const isProcessing = processingId === gateway.gateway_id;

          return (
            <div
              key={gateway.gateway_id}
              className={`relative overflow-hidden rounded-2xl border ${
                dark
                  ? "bg-white/5 border-white/10"
                  : "bg-white border-gray-100 shadow-sm"
              } transition-colors p-6 group`}
            >
              {/* Status Badge */}
              <div className="absolute top-4 left-4">
                {isConfiguredAndActive ? (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-lg animate-fade-in">
                    <CheckCircle className="w-4 h-4" /> مفعلة ومربوطة
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-500/10 text-gray-500 dark:text-gray-400">
                    غير مفعلة
                  </span>
                )}
              </div>

              <div className="flex flex-col items-center text-center mt-6">
                {gateway.logo ? (
                  <img
                    src={gateway.logo}
                    alt={gateway.name}
                    className="h-16 object-contain mb-4 transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-3xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center mb-4 text-3xl shadow-inner">
                    💳
                  </div>
                )}
                <h3 className="text-xl font-bold">{gateway.name}</h3>
                <p
                  className={`text-xs mt-2 px-2 leading-relaxed ${dark ? "text-gray-400" : "text-gray-500"}`}
                >
                  اسمح لطلابك بالدفع الآمن باستخدام {gateway.name}. تحتاج لربط
                  حساب البوابة أولاً.
                </p>

                <div className="mt-8 w-full flex flex-col gap-2">
                  {isConfiguredAndActive ? (
                    <>
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/payments/${gateway.gateway_id}`,
                          )
                        }
                        disabled={isProcessing}
                        className="w-full py-3 rounded-xl text-sm font-bold transition-all bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white flex items-center justify-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        تعديل الربط
                      </button>
                      <button
                        onClick={() =>
                          handleDeactivate(gateway.gateway_id, configConfig)
                        }
                        disabled={isProcessing}
                        className="w-full py-3 rounded-xl text-sm font-bold transition-all border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <Power className="w-4 h-4" />
                            إلغاء التفعيل
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() =>
                        router.push(`/dashboard/payments/${gateway.gateway_id}`)
                      }
                      disabled={isProcessing}
                      className="w-full py-3.5 rounded-xl text-sm font-bold transition-all text-white flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                      style={{ background: primaryColor }}
                    >
                      إعداد وتفعيل البوابة
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {availableGateways.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center text-gray-500 bg-gray-50/50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
            <AlertTriangle className="w-16 h-16 mb-4 opacity-40 text-orange-500" />
            <h3 className="text-xl font-bold mb-2 text-gray-700 dark:text-gray-300">
              لا توجد بوابات متاحة
            </h3>
            <p className="max-w-md">
              الإدارة لم تقم بإتاحة بوابات الدفع حالياً. يرجى مراجعة الدعم الفني
              أو السوبر أدمن.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
