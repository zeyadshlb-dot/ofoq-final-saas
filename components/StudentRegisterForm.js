"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useToast } from "./ToastProvider";
import { useRouter } from "next/navigation";

/* ─── Animated Input Component (Shared with Login) ─── */
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
  children,
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
      {/* Glow ring */}
      <div
        className={`absolute -inset-[2px] rounded-[20px] bg-linear-to-r from-primary via-secondary to-primary opacity-0 blur-md transition-all duration-500 ${focused ? "opacity-40" : hovered ? "opacity-20" : "opacity-0"}`}
      />

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
        {/* Animated bottom bar */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-[3px] bg-linear-to-r from-primary via-secondary to-primary transition-all duration-500 ease-out ${focused ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}`}
        />

        {/* Shimmer */}
        <div
          className={`absolute inset-0 bg-linear-to-r from-transparent via-primary/5 to-transparent transition-all duration-700 ${hovered && !focused ? "translate-x-full" : "-translate-x-full"}`}
        />

        <div className="relative flex items-center">
          <div
            className={`flex items-center justify-center mr-0 pr-4 transition-all duration-500 ${focused ? "text-primary scale-110" : hovered ? "text-primary/70" : "text-gray-400"}`}
          >
            {icon}
          </div>

          <div className="flex-1 relative py-4 pl-4">
            <label
              className={`absolute pointer-events-none transition-all duration-300 ease-out font-bold
              ${
                focused || hasValue
                  ? "text-[11px] -top-0 text-primary"
                  : "text-sm top-1/2 -translate-y-1/2 text-gray-400"
              }`}
            >
              {label}
            </label>

            {children ? (
              <div className="pt-2">{children}</div>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Animated Select Component ─── */
function AnimatedSelect({ icon, label, value, onChange, options }) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const hasValue = value && value.length > 0;

  return (
    <div
      className="relative group cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`absolute -inset-[2px] rounded-[20px] bg-linear-to-r from-primary via-secondary to-primary opacity-0 blur-md transition-all duration-500 ${focused ? "opacity-40" : hovered ? "opacity-20" : "opacity-0"}`}
      />

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
        <div
          className={`absolute bottom-0 left-0 right-0 h-[3px] bg-linear-to-r from-primary via-secondary to-primary transition-all duration-500 ease-out ${focused ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}`}
        />
        <div
          className={`absolute inset-0 bg-linear-to-r from-transparent via-primary/5 to-transparent transition-all duration-700 ${hovered && !focused ? "translate-x-full" : "-translate-x-full"}`}
        />

        <div className="relative flex items-center">
          <div
            className={`flex items-center justify-center mr-0 pr-4 transition-all duration-500 ${focused ? "text-primary scale-110" : hovered ? "text-primary/70" : "text-gray-400"}`}
          >
            {icon}
          </div>

          <div className="flex-1 relative py-4 pl-4">
            <label
              className={`absolute pointer-events-none transition-all duration-300 ease-out font-bold
              ${
                focused || hasValue
                  ? "text-[11px] -top-0 text-primary"
                  : "text-sm top-1/2 -translate-y-1/2 text-gray-400"
              }`}
            >
              {label}
            </label>

            <select
              value={value}
              onChange={onChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="w-full bg-transparent ring-0 outline-none text-gray-900 dark:text-white font-bold text-base pt-2 appearance-none cursor-pointer"
              required
            >
              <option value="" disabled className="text-gray-400">
                اختر...
              </option>
              {options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="text-gray-900"
                >
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Dropdown arrow */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 transition-all duration-300 ${focused ? "text-primary rotate-180" : "text-gray-400"}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Floating Particles ─── */
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

/* ─── Password Strength Indicator ─── */
function PasswordStrength({ password }) {
  const getStrength = () => {
    if (!password) return { level: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1)
      return { level: 1, label: "ضعيفة جداً", color: "bg-red-500" };
    if (score <= 2) return { level: 2, label: "ضعيفة", color: "bg-orange-500" };
    if (score <= 3)
      return { level: 3, label: "متوسطة", color: "bg-yellow-500" };
    if (score <= 4) return { level: 4, label: "قوية", color: "bg-green-500" };
    return { level: 5, label: "قوية جداً", color: "bg-emerald-500" };
  };

  const strength = getStrength();
  if (!password) return null;

  return (
    <div className="mt-2 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-gray-100 dark:bg-white/10">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`flex-1 rounded-full transition-all duration-500 ease-out ${
              level <= strength.level ? strength.color : "bg-transparent"
            }`}
          />
        ))}
      </div>
      <p
        className={`text-xs font-bold mt-1 text-left transition-colors ${
          strength.level <= 2
            ? "text-red-500"
            : strength.level <= 3
              ? "text-yellow-600"
              : "text-green-600"
        }`}
      >
        {strength.label}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Student Register Form - Premium Edition
   ═══════════════════════════════════════════════════════════════════ */
export default function StudentRegisterForm({
  theme,
  registerFields = [],
  domain,
  stages = [],
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    grade: "",
  });
  const [dynamicFields, setDynamicFields] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const extraFields = registerFields || [];

  const handleDynamicChange = (name, value) => {
    setDynamicFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (file, name) => {
    if (!file) return;
    setUploadingField(name);
    try {
      const { default: imageCompression } =
        await import("browser-image-compression");
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      });
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64, folder: "student_uploads" }),
          });
          if (res.ok) {
            const data = await res.json();
            handleDynamicChange(name, data.url);
          } else {
            toast("فشل رفع الصورة", "error");
          }
        } catch {
          toast("الرجاء المحاولة لاحقاً", "error");
        }
        setUploadingField(null);
      };
      reader.readAsDataURL(compressed);
    } catch {
      toast("فشل ضغط الصورة", "error");
      setUploadingField(null);
    }
  };

  const bgImage =
    theme?.heroImage ||
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop";
  const platformName = theme?.platformName || "أكاديميتنا";
  const logoUrl = theme?.logo;

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSelectChange = (e) =>
    setFormData({ ...formData, grade: e.target.value });

  const handleRegister = (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.phone ||
      !formData.password ||
      !formData.grade
    ) {
      toast("الرجاء إكمال جميع الحقول الأساسية", "error");
      return;
    }

    // Check dynamic fields
    for (const field of extraFields) {
      const val = dynamicFields[field.name];

      if (field.required && !val) {
        toast(`الحقل مطلوب: ${field.label}`, "error");
        return;
      }

      if (val) {
        if (
          field.name.toLowerCase().includes("phone") &&
          !/^01\d{9}$/.test(val)
        ) {
          toast(`الرجاء إدخال رقم هاتف صحيح لـ: ${field.label}`, "error");
          return;
        }
        if (field.name === "nationalId" && !/^\d{14}$/.test(val)) {
          toast(`الرقم القومي يجب أن يتكون من 14 رقماً`, "error");
          return;
        }
      }
    }

    const submitData = async () => {
      setLoading(true);
      try {
        const payload = {
          tenant_slug: domain || window.location.hostname,
          stage_id: formData.grade,
          name: formData.name,
          phone: formData.phone,
          password: formData.password,
          custom_data: JSON.stringify(dynamicFields),
        };

        const res = await fetch("/api/v1/student/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          toast(data.error || "خطأ أثناء إنشاء الحساب", "error");
          setLoading(false);
          return;
        }

        toast("🎉 تم إنشاء الحساب بنجاح! مرحباً بك", "success");
        setTimeout(() => router.push("/login"), 1500);
      } catch (err) {
        toast("خطأ في الاتصال بالخادم", "error");
        setLoading(false);
      }
    };
    submitData();
  };

  return (
    <div
      className="flex flex-col lg:flex-row min-h-[calc(100vh-72px)] bg-white dark:bg-[#060608] w-full"
      dir="rtl"
    >
      {/* ─── Image Section ─── */}
      <div className="hidden lg:flex lg:w-[42%] h-[calc(100vh-72px)] sticky top-[72px] overflow-hidden group">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] group-hover:scale-110"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        <div className="absolute inset-0 bg-primary/70 dark:bg-black/80 mix-blend-multiply" />
        <div className="absolute inset-0 bg-linear-to-t lg:bg-linear-to-l from-primary/90 via-primary/50 to-transparent" />

        {/* Animated circles */}
        <div className="absolute top-16 right-16 w-40 h-40 border-2 border-white/15 rounded-full animate-[spin_25s_linear_infinite]" />
        <div className="absolute bottom-28 left-12 w-56 h-56 border border-white/10 rounded-full animate-[spin_35s_linear_infinite_reverse]" />
        <div className="absolute top-1/3 left-1/4 w-24 h-24 border border-white/10 rounded-full animate-[pulse_5s_ease-in-out_infinite]" />

        <div
          className={`absolute inset-0 flex flex-col justify-end p-14 z-10 text-white transition-all duration-1000 ${mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <div className="flex items-center gap-4 mb-8">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={platformName}
                className="h-20 object-contain drop-shadow-2xl"
              />
            ) : (
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 animate-[bounce_3s_ease-in-out_infinite]">
                <span className="text-3xl font-bold">💎</span>
              </div>
            )}
          </div>
          <h2 className="text-4xl lg:text-5xl font-black mb-4 drop-shadow-lg leading-tight max-w-[90%]">
            انضم لعائلة <br />
            <span className="text-secondary">{platformName}</span>
          </h2>
          <p className="text-white/90 text-lg font-medium drop-shadow-md max-w-sm leading-relaxed">
            أنشئ حسابك واستكشف مئات الكورسات المصممة خصيصاً لتميزك ونجاحك
            الأكاديمي.
          </p>

          {/* Trust Section */}
          <div className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-3 space-x-reverse">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-11 h-11 rounded-full border-[3px] border-white/80 overflow-hidden shadow-lg hover:scale-110 transition-transform duration-300"
                >
                  <img
                    src={`https://i.pravatar.cc/100?img=${i + 10}`}
                    alt="Student"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div>
              <div className="text-white font-black text-lg">+500 طالب</div>
              <div className="text-white/60 font-bold text-xs">
                انضموا لنا هذا الشهر
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Form Section ─── */}
      <div className="w-full lg:w-[58%] flex items-center justify-center px-6 sm:px-10 py-4 relative min-h-[calc(100vh-72px)]">
        <FloatingParticles />

        <div className="absolute top-10 right-10 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none animate-[pulse_8s_ease-in-out_infinite]" />

        <div
          className={`w-full max-w-[520px] relative z-10 py-2 transition-all duration-1000 delay-300 ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <div className="mb-8 text-right">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-bold mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              مجاناً ١٠٠٪
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-3">
              حساب{" "}
              <span className="text-primary relative inline-block">
                جديد بانتظارك
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
              أكمل البيانات التالية واشترك في منصتنا في خطوة واحدة
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              }
              label="الاسم بالكامل"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="محمد أحمد محمود"
              disabled={loading}
            />

            {/* Phone + Grade Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="01xxxxxxxxx"
                dir="ltr"
                disabled={loading}
              />

              <AnimatedSelect
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
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                }
                label="المرحلة الدراسية"
                value={formData.grade}
                onChange={handleSelectChange}
                options={stages.map((stg) => ({
                  value: stg.id.toString(),
                  label: stg.name,
                }))}
              />
            </div>

            {/* Dynamic Fields */}
            {extraFields.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {extraFields.map((field) => {
                  if (field.type === "image") {
                    return (
                      <div key={field.name} className="relative">
                        <AnimatedInput
                          label={`${field.label} ${field.required ? "*" : ""}`}
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
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          }
                          required={field.required}
                        >
                          <div className="mt-2 flex items-center gap-3">
                            <label
                              className={`px-4 py-2 rounded-xl text-sm font-bold bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer border-2 border-primary/20 transition-all ${uploadingField === field.name ? "opacity-50 pointer-events-none" : ""}`}
                            >
                              {uploadingField === field.name
                                ? "جاري الرفع..."
                                : "اختر صورة"}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleImageUpload(
                                    e.target.files[0],
                                    field.name,
                                  )
                                }
                              />
                            </label>
                            {dynamicFields[field.name] && (
                              <img
                                src={dynamicFields[field.name]}
                                alt="Preview"
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            )}
                          </div>
                        </AnimatedInput>
                      </div>
                    );
                  }

                  if (field.type === "select") {
                    const opts = (field.options || "")
                      .split(",")
                      .map((o) => ({ value: o, label: o }));
                    return (
                      <AnimatedSelect
                        key={field.name}
                        label={`${field.label} ${field.required ? "*" : ""}`}
                        value={dynamicFields[field.name] || ""}
                        onChange={(e) =>
                          handleDynamicChange(field.name, e.target.value)
                        }
                        options={opts}
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
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        }
                      />
                    );
                  }

                  if (field.type === "textarea") {
                    return (
                      <AnimatedInput
                        key={field.name}
                        label={`${field.label} ${field.required ? "*" : ""}`}
                        required={field.required}
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
                              d="M4 6h16M4 12h16m-7 6h7"
                            />
                          </svg>
                        }
                      >
                        <textarea
                          value={dynamicFields[field.name] || ""}
                          onChange={(e) =>
                            handleDynamicChange(field.name, e.target.value)
                          }
                          className="w-full bg-transparent ring-0 outline-none text-gray-900 dark:text-white font-bold text-sm min-h-[60px] resize-none pt-2"
                          required={field.required}
                        />
                      </AnimatedInput>
                    );
                  }

                  if (field.type === "date") {
                    return (
                      <AnimatedInput
                        key={field.name}
                        label={`${field.label} ${field.required ? "*" : ""}`}
                        type="date"
                        value={dynamicFields[field.name] || ""}
                        onChange={(e) =>
                          handleDynamicChange(field.name, e.target.value)
                        }
                        required={field.required}
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
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        }
                      />
                    );
                  }

                  return (
                    <AnimatedInput
                      key={field.name}
                      label={`${field.label} ${field.required ? "*" : ""}`}
                      type={field.type === "number" ? "number" : "text"}
                      value={dynamicFields[field.name] || ""}
                      onChange={(e) =>
                        handleDynamicChange(field.name, e.target.value)
                      }
                      required={field.required}
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
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      }
                    />
                  );
                })}
              </div>
            )}

            {/* Password */}
            <div>
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
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="••••••••"
                dir="ltr"
                disabled={loading}
              />
              <PasswordStrength password={formData.password} />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-3 text-center rounded-2xl text-lg font-black bg-primary text-white shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/50 hover:-translate-y-1.5 active:translate-y-0 active:shadow-lg transition-all duration-300 disabled:opacity-75 disabled:hover:translate-y-0 disabled:cursor-not-allowed overflow-hidden relative group"
            >
              <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-out" />
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
                    جاري إنشاء حسابك...
                  </>
                ) : (
                  <>
                    إنشاء الحساب الآن
                    <span className="text-xl group-hover:rotate-12 transition-transform">
                      🚀
                    </span>
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center text-base font-bold text-gray-500 dark:text-gray-400">
            تمتلك حساباً بالفعل؟{" "}
            <Link
              href="/login"
              className="text-primary hover:text-secondary transition-colors inline-flex items-center gap-1 group font-black"
            >
              سجل دخولك من هنا
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
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
