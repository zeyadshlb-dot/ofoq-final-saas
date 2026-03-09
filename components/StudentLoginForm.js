"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useToast } from "./ToastProvider";
import { useRouter } from "next/navigation";

/* ─── Animated Input Component ─── */
function AnimatedInput({
  icon,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  dir = "rtl",
  required = true,
  disabled = false,
}) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef(null);
  const hasValue = value && value.length > 0;

  return (
    <div
      className="relative group cursor-text"
      onClick={() => inputRef.current?.focus()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Glow ring behind the input */}
      <div
        className={`absolute -inset-[2px] rounded-[20px] bg-linear-to-r from-primary via-secondary to-primary opacity-0 blur-md transition-all duration-500 ${focused ? "opacity-40" : hovered ? "opacity-20" : "opacity-0"}`}
      ></div>

      <div
        className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-500 ease-out
        ${
          focused
            ? "border-primary bg-white dark:bg-black shadow-lg shadow-primary/10 scale-[1.02]"
            : hovered
              ? "border-primary/30 bg-white dark:bg-white/5 shadow-md scale-[1.01]"
              : "border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 shadow-sm"
        }`}
      >
        {/* Animated gradient bar at bottom */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-[3px] bg-linear-to-r from-primary via-secondary to-primary transition-all duration-500 ease-out ${focused ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}`}
        ></div>

        {/* Shimmer effect on hover */}
        <div
          className={`absolute inset-0 bg-linear-to-r from-transparent via-primary/5 to-transparent transition-all duration-700 ${hovered && !focused ? "translate-x-full" : "-translate-x-full"}`}
        ></div>

        <div className="relative flex items-center">
          {/* Icon */}
          <div
            className={`flex items-center justify-center mr-0 pr-4 transition-all duration-500 ${focused ? "text-primary scale-110" : hovered ? "text-primary/70" : "text-gray-400"}`}
          >
            {icon}
          </div>

          <div className="flex-1 relative py-4 pl-4">
            {/* Floating Label */}
            <label
              className={`absolute pointer-events-none transition-all duration-300 ease-out font-bold
              ${
                focused || hasValue
                  ? "text-[11px] top-0 text-primary"
                  : "text-sm top-1/2 -translate-y-1/2 text-gray-400"
              }`}
            >
              {label}
            </label>

            <input
              ref={inputRef}
              type={type}
              value={value}
              onChange={onChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={focused ? placeholder : ""}
              className="w-full bg-transparent ring-0 outline-none text-gray-900 dark:text-white font-bold text-base pt-2"
              dir={dir}
              required={required}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Floating Particles Background ─── */
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-primary/20 animate-[float_8s_ease-in-out_infinite]"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
            animationDelay: `${i * 1.2}s`,
            animationDuration: `${6 + i * 2}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Student Login Form - Premium Edition
   ═══════════════════════════════════════════════════════════════════ */
export default function StudentLoginForm({ theme, domain }) {
  const { toast } = useToast();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [useCode, setUseCode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const bgImage =
    theme?.heroImage ||
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop";
  const platformName = theme?.platformName || "أكاديميتنا";
  const logoUrl = theme?.logo;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phone) {
      toast("الرجاء إدخال رقم الهاتف", "error");
      return;
    }

    setLoading(true);

    if (useCode) {
      // Handle OTP logic here when implemented
      setTimeout(() => {
        setLoading(false);
        toast("تم إرسال كود التأكيد في رسالة لهاتفك 📲", "success");
      }, 1500);
      return;
    }

    try {
      // Fingerprint logic
      let device_fingerprint = localStorage.getItem("device_fingerprint");
      if (!device_fingerprint) {
        device_fingerprint =
          "fp_" +
          Date.now().toString(36) +
          Math.random().toString(36).substr(2);
        localStorage.setItem("device_fingerprint", device_fingerprint);
      }

      const getDeviceName = () => {
        const ua = navigator.userAgent;
        let browser = "متصفح غير معروف";
        if (ua.includes("Firefox")) browser = "Firefox";
        else if (ua.includes("Edg")) browser = "Edge";
        else if (ua.includes("Chrome")) browser = "Chrome";
        else if (ua.includes("Safari")) browser = "Safari";

        let os = "نظام التشغيل غير معروف";
        if (ua.includes("Win")) os = "Windows";
        else if (ua.includes("Mac")) os = "MacOS / iOS";
        else if (ua.includes("Linux")) os = "Linux";
        else if (/Android/.test(ua)) os = "Android";
        else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";

        return `${os} - ${browser}`;
      };

      const payload = {
        tenant_slug: domain || window.location.hostname,
        phone,
        password,
        device_fingerprint,
        device_name: getDeviceName(),
        device_type: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
          ? "mobile"
          : "desktop",
      };

      const res = await fetch("/api/v1/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast(data.error || "خطأ في تسجيل الدخول", "error");
        setLoading(false);
        return;
      }

      // Save token and info
      document.cookie = `student_token=${data.token}; path=/; max-age=604800;`;
      localStorage.setItem("student_token", data.token);

      toast("تم تسجيل الدخول بنجاح! 🚀 جاري التحويل...", "success");
      setTimeout(() => router.push("/panel"), 1200);
    } catch (err) {
      toast("خطأ في الاتصال بالخادم", "error");
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col lg:flex-row min-h-[calc(100vh-72px)] bg-white dark:bg-[#060608] w-full"
      dir="rtl"
    >
      {/* ─── قسم الصورة (يمين) ─── */}
      <div className="hidden lg:flex lg:w-[45%] h-[calc(100vh-72px)] sticky top-[72px] overflow-hidden group">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] group-hover:scale-110"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        <div className="absolute inset-0 bg-primary/60 dark:bg-black/70 mix-blend-multiply" />
        <div className="absolute inset-0 bg-linear-to-t lg:bg-linear-to-l from-primary/90 via-primary/40 to-transparent" />

        {/* Animated circles */}
        <div className="absolute top-20 right-20 w-32 h-32 border-2 border-white/20 rounded-full animate-[spin_20s_linear_infinite]" />
        <div className="absolute bottom-32 left-16 w-48 h-48 border border-white/10 rounded-full animate-[spin_30s_linear_infinite_reverse]" />
        <div className="absolute top-1/2 right-1/3 w-20 h-20 border border-white/15 rounded-full animate-[pulse_4s_ease-in-out_infinite]" />

        <div
          className={`absolute inset-0 flex flex-col justify-end p-14 z-10 text-white transition-all duration-1000 ${mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <div className="flex items-center gap-4 mb-8">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={platformName}
                className="h-20 object-contain drop-shadow-2xl animate-[fadeInUp_0.8s_ease-out]"
              />
            ) : (
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 animate-[bounce_3s_ease-in-out_infinite]">
                <span className="text-3xl font-bold">📚</span>
              </div>
            )}
          </div>
          <h2 className="text-4xl lg:text-5xl font-black mb-4 drop-shadow-lg leading-tight">
            مرحباً بك في <br />
            <span className="text-secondary">{platformName}</span>
          </h2>
          <p className="text-white/90 text-lg font-medium drop-shadow-md max-w-sm leading-relaxed">
            نسهل عليك رحلتك التعليمية لنبني معاً مستقبلك المشرق في أفضل بيئة
            للتعلم عن بُعد.
          </p>

          {/* Stats */}
          <div className="flex gap-6 mt-10">
            {[
              { num: "+500", label: "طالب نشط" },
              { num: "+50", label: "كورس متاح" },
              { num: "4.9", label: "تقييم المنصة" },
            ].map((s, i) => (
              <div
                key={i}
                className="text-center bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-2xl font-black text-secondary">
                  {s.num}
                </div>
                <div className="text-white/70 text-xs font-bold">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── قسم الفورم (يسار) ─── */}
      <div className="w-full lg:w-[55%] flex items-center justify-center px-6 sm:px-12 py-4 relative min-h-[calc(100vh-72px)]">
        <FloatingParticles />

        {/* Background glows */}
        <div className="absolute top-10 right-10 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none animate-[pulse_8s_ease-in-out_infinite]" />

        <div
          className={`w-full max-w-[480px] relative z-10 transition-all duration-1000 delay-300 ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <div className="mb-10 text-right">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-bold mb-4 animate-[fadeInUp_0.6s_ease-out]">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              مرحباً بعودتك
            </div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3">
              تسجيل{" "}
              <span className="text-primary relative inline-block">
                الدخول
                <svg
                  className="absolute w-full h-3 -bottom-1.5 right-0 text-primary/30"
                  viewBox="0 0 100 20"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 10 Q 50 20 100 10"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-semibold text-lg">
              أدخل بياناتك للاستمرار واستكمال رحلتك
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <AnimatedInput
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              }
              label="رقم الهاتف"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01xxxxxxxxx"
              dir="ltr"
              disabled={loading}
            />

            <div
              className={`transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] origin-top ${useCode ? "opacity-0 max-h-0 overflow-hidden scale-y-0" : "opacity-100 max-h-[200px] scale-y-100"}`}
            >
              <AnimatedInput
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                }
                label="كلمة السر"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                required={!useCode}
                disabled={loading}
              />
              <div className="flex justify-end mt-2">
                <Link
                  href="#"
                  className="text-sm font-bold text-primary hover:text-primary/70 transition-colors hover:-translate-y-0.5 transform inline-block"
                >
                  نسيت كلمة السر؟
                </Link>
              </div>
            </div>

            {/* Toggle code/password */}
            <div
              className="group flex items-center justify-between p-4 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/15 hover:border-primary/40 hover:bg-primary/10 transition-all duration-500 cursor-pointer hover:shadow-md hover:shadow-primary/5"
              onClick={() => setUseCode(!useCode)}
            >
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 group-hover:text-primary transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-primary"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                تسجيل الدخول عن طريق الكود
              </span>
              <button
                type="button"
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-all duration-500 ease-out ${useCode ? "bg-primary shadow-lg shadow-primary/30" : "bg-gray-300 dark:bg-gray-600"}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setUseCode(!useCode);
                }}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 mt-0.5 transform rounded-full bg-white shadow-lg transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${useCode ? "-translate-x-[18px]" : "translate-x-[2px]"}`}
                />
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-3 text-center rounded-2xl text-lg font-black bg-primary text-white shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/50 hover:-translate-y-1.5 active:translate-y-0 active:shadow-lg transition-all duration-300 disabled:opacity-75 disabled:hover:translate-y-0 disabled:cursor-not-allowed overflow-hidden relative group"
            >
              {/* Sweep shine */}
              <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              {/* Ripple glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-r from-primary via-secondary to-primary bg-size-[200%_100%] animate-[shimmer_2s_linear_infinite]"
                style={{ mixBlendMode: "overlay" }}
              />

              <span className="relative flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-6 w-6 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    جاري الدخول...
                  </>
                ) : (
                  <>
                    {useCode ? "إرسال كود التأكيد" : "تسجيل الدخول"}
                    <span className="text-xl group-hover:translate-x-1 transition-transform">
                      🚀
                    </span>
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="mt-10 text-center text-base font-bold text-gray-500 dark:text-gray-400">
            لا يوجد لديك حساب؟{" "}
            <Link
              href="/register"
              className="text-primary hover:text-secondary transition-colors inline-flex items-center gap-1 group font-black"
            >
              انشئ حسابك الآن
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-30px) rotate(180deg); opacity: 0.8; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `,
        }}
      />
    </div>
  );
}
