"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLogin() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let token = localStorage.getItem("instructor_token");
    if (!token) {
      const cookies = document.cookie.split(";");
      const tokenCookie = cookies.find((c) =>
        c.trim().startsWith("instructor_token="),
      );
      if (tokenCookie) {
        token = tokenCookie.split("=")[1];
      }
    }
    // لو مسجل دخول، حوله للداشبورد مباشرة
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/instructor/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, password }),
      });

      if (!res.ok) {
        throw new Error(
          "فشل تسجيل الدخول. تأكد من صحة رقم الهاتف وكلمة المرور.",
        );
      }

      const data = await res.json();

      // حفظ التوكن
      document.cookie = `instructor_token=${data.token}; path=/; max-age=604800;`;
      localStorage.setItem("instructor_token", data.token);

      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col min-h-screen w-full lg:flex-row bg-gray-50 dark:bg-[#0a0a0a] font-sans"
      dir="rtl"
    >
      {/* القسم الأيمن: تفاصيل نظام أفق والتسويق (اللايوت البنفسجي) */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-purple-700 bg-linear-to-br from-purple-800 to-indigo-900 p-12 text-white">
        {/* أشكال تجميلية في الخلفية */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/30 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-black tracking-widest text-white/90">
              OFOQ SaaS
            </h1>
          </div>

          <div className="mt-20">
            <h2 className="text-4xl leading-tight font-extrabold mb-6">
              الدخول لمنصتك من خلال
              <br /> نظام إدارة أفق
            </h2>
            <p className="text-purple-200 text-lg max-w-md leading-relaxed">
              تحكم في منصتك التعليمية بشكل كامل، تتبع مبيعاتك، كافىء طلابك، وقم
              بإدارة محتواك بضغطة زر.
            </p>
          </div>
        </div>

        <div className="relative z-10 text-sm font-medium text-purple-300">
          &copy; {new Date().getFullYear()} تم التطوير بواسطة نظام أفق التعليمي.
        </div>
      </div>

      {/* القسم الأيسر: فورم تسجيل الدخول */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-[420px] relative z-10">
          <div className="text-right mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              تسجيل دخول المعلم
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              أهلاً بك مجدداً، برجاء إدخال بياناتك
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-500/10 border-r-4 border-red-500 p-4 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400 animate-[pulse_0.5s_ease-in-out]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-semibold">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5 text-right">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                رقم الهاتف
              </label>
              <input
                id="phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01xxxxxxxxx"
                className="w-full px-4 text-left py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all duration-300 text-gray-900 dark:text-white"
                dir="ltr"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5 text-right">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  كلمة المرور
                </label>
                <Link
                  href="#"
                  className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-500 transition-colors"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-left px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all duration-300 text-gray-900 dark:text-white"
                dir="ltr"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-black disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  جاري الدخول...
                </>
              ) : (
                "دخول"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
