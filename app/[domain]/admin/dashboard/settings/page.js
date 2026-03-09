"use client";

import { useTheme } from "../layout";
import { getToken } from "../layout";
import {
  Palette,
  Type,
  Globe,
  Layers,
  Monitor,
  Smartphone,
  Eye,
  Copy,
  CheckCircle,
  Paintbrush,
  Aperture,
  Save,
  Loader2,
  Upload,
  Image as ImageIcon,
  X,
  Sun,
  Moon,
  LayoutGrid,
  List,
  Square,
  Circle,
  Sparkles,
  ExternalLink,
  Facebook,
  Youtube,
  MessageCircle,
  Send,
  Linkedin,
  Instagram,
  Twitter,
  Globe2,
  Hash,
  Share2,
  FileText,
  Smartphone as Phone,
  Camera,
  MousePointerClick,
  Trash2,
  Edit2,
  Home as HomeIcon,
  CheckSquare,
  ChevronUp,
  ChevronDown,
  List as ListIcon,
  Calendar,
  MapPin,
  CreditCard,
  User,
  Image,
  Building,
  GraduationCap,
} from "lucide-react";
import { useState, useEffect, useRef, Suspense } from "react";
import imageCompression from "browser-image-compression";
import dynamic from "next/dynamic";

const PuckEditor = dynamic(() => import("./PuckEditor"), { ssr: false });

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const ARABIC_FONTS = [
  {
    name: "Cairo",
    url: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap",
  },
  {
    name: "Tajawal",
    url: "https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap",
  },
  {
    name: "Almarai",
    url: "https://fonts.googleapis.com/css2?family=Almarai:wght@400;700;800&display=swap",
  },
  {
    name: "Changa",
    url: "https://fonts.googleapis.com/css2?family=Changa:wght@400;500;700&display=swap",
  },
  {
    name: "El Messiri",
    url: "https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;600;700&display=swap",
  },
  {
    name: "Readex Pro",
    url: "https://fonts.googleapis.com/css2?family=Readex+Pro:wght@400;500;700&display=swap",
  },
  {
    name: "IBM Plex Sans Arabic",
    url: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap",
  },
  {
    name: "Noto Kufi Arabic",
    url: "https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;500;700&display=swap",
  },
  {
    name: "Outfit",
    url: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700&display=swap",
  },
];

const SOCIAL_PLATFORMS = [
  {
    key: "facebook",
    label: "Facebook",
    icon: Facebook,
    placeholder: "https://facebook.com/...",
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: Youtube,
    placeholder: "https://youtube.com/@...",
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: Instagram,
    placeholder: "https://instagram.com/...",
  },
  {
    key: "twitter",
    label: "X (Twitter)",
    icon: Twitter,
    placeholder: "https://x.com/...",
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: Camera,
    placeholder: "https://tiktok.com/@...",
  },
  {
    key: "telegram",
    label: "Telegram",
    icon: Send,
    placeholder: "https://t.me/...",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    icon: Phone,
    placeholder: "https://wa.me/...",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    placeholder: "https://linkedin.com/in/...",
  },
  {
    key: "snapchat",
    label: "Snapchat",
    icon: MessageCircle,
    placeholder: "https://snapchat.com/add/...",
  },
  {
    key: "pinterest",
    label: "Pinterest",
    icon: Share2,
    placeholder: "https://pinterest.com/...",
  },
  {
    key: "website",
    label: "الموقع الشخصي",
    icon: Globe2,
    placeholder: "https://mysite.com",
  },
];

const TABS = [
  { id: "colors", label: "الألوان والخطوط", icon: Palette },
  { id: "ui", label: "شكل الواجهة", icon: MousePointerClick },
  { id: "brand", label: "الهوية المرئية", icon: ImageIcon },
  { id: "seo", label: "السيو والتواصل", icon: Globe },
  { id: "registerFields", label: "خانات التسجيل", icon: CheckSquare },
];

/* ═══════════════════════════════════════════════════════════════
   COLOR HELPERS
   ═══════════════════════════════════════════════════════════════ */
function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
  return r
    ? `${parseInt(r[1], 16)}, ${parseInt(r[2], 16)}, ${parseInt(r[3], 16)}`
    : null;
}
function lighten(hex, p) {
  if (!hex) return "#fff";
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (n >> 16) + Math.round(255 * p));
  const g = Math.min(255, ((n >> 8) & 0xff) + Math.round(255 * p));
  const b = Math.min(255, (n & 0xff) + Math.round(255 * p));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}
function darken(hex, p) {
  if (!hex) return "#000";
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (n >> 16) - Math.round(255 * p));
  const g = Math.max(0, ((n >> 8) & 0xff) - Math.round(255 * p));
  const b = Math.max(0, (n & 0xff) - Math.round(255 * p));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}
function hexToHsl(hex) {
  const res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
  if (!res) return { h: 0, s: 0, l: 0 };
  let r = parseInt(res[1], 16) / 255,
    g = parseInt(res[2], 16) / 255,
    b = parseInt(res[3], 16) / 255;
  const mx = Math.max(r, g, b),
    mn = Math.min(r, g, b);
  let h,
    s,
    l = (mx + mn) / 2;
  if (mx === mn) {
    h = s = 0;
  } else {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    switch (mx) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}
function hslToHex(h, s, l) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN SETTINGS PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function SettingsPage() {
  const { dark, tenantLayout, primaryColor, secondaryColor } = useTheme();
  const [copied, setCopied] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("colors");
  const d = dark;

  const theme = tenantLayout?.theme || {};
  const [registerFields, setRegisterFields] = useState(
    tenantLayout?.["register-fields"] || [],
  );
  const slug = tenantLayout?.tenant_slug || "—";

  // ── Colors & Font State ──
  const [editPrimary, setEditPrimary] = useState(primaryColor || "#8b5cf6");
  const [editSecondary, setEditSecondary] = useState(
    secondaryColor || "#c4b5fd",
  );
  const [editFont, setEditFont] = useState(
    theme.font || "IBM Plex Sans Arabic",
  );

  // ── UI Style State ──
  const [forceTheme, setForceTheme] = useState(theme.forceTheme || "auto");
  const [coursesLayout, setCoursesLayout] = useState(
    theme.coursesLayout || "grid",
  );
  const [coursesPerRow, setCoursesPerRow] = useState(theme.coursesPerRow || 3);
  const [borderRadius, setBorderRadius] = useState(
    theme.borderRadius || "rounded",
  );
  const [buttonStyle, setButtonStyle] = useState(theme.buttonStyle || "flat");
  const [shadowLevel, setShadowLevel] = useState(theme.shadowLevel || "soft");

  // ── Brand Assets State ──
  const [logo, setLogo] = useState(theme.logo || "");
  const [favicon, setFavicon] = useState(theme.favicon || "");
  const [loginBanner, setLoginBanner] = useState(theme.loginBanner || "");
  const [heroImage, setHeroImage] = useState(theme.heroImage || "");
  const [uploading, setUploading] = useState(null);

  // ── SEO & Social State ──
  const [platformName, setPlatformName] = useState(theme.platformName || "");
  const [metaDescription, setMetaDescription] = useState(
    theme.metaDescription || "",
  );
  const [socialLinks, setSocialLinks] = useState(theme.socialLinks || {});

  // ── Register Fields State ──
  const PREDEFINED_FIELDS = [
    {
      name: "parentPhone",
      label: "رقم هاتف ولي الأمر",
      type: "text",
      icon: Phone,
    },
    {
      name: "whatsappPhone",
      label: "رقم واتساب",
      type: "text",
      icon: MessageCircle,
    },
    {
      name: "gender",
      label: "النوع (ذكر/أنثى)",
      type: "select",
      options: "ذكر,أنثى",
      icon: User,
    },
    { name: "birthDate", label: "تاريخ الميلاد", type: "date", icon: Calendar },
    { name: "school", label: "المدرسة", type: "text", icon: Building },
    {
      name: "educationYear",
      label: "السنة الدراسية / الصف",
      type: "text",
      icon: GraduationCap,
    },
    { name: "governorate", label: "المحافظة", type: "text", icon: MapPin },
    { name: "city", label: "المدينة / المركز", type: "text", icon: MapPin },
    {
      name: "address",
      label: "العنوان بالتفصيل",
      type: "textarea",
      icon: MapPin,
    },
    {
      name: "nationalId",
      label: "الرقم القومي",
      type: "number",
      icon: CreditCard,
    },
    {
      name: "nationalIdImage",
      label: "صورة البطاقة",
      type: "image",
      icon: Image,
    },
    { name: "personalImage", label: "صورة شخصية", type: "image", icon: Image },
  ];

  // Sync state
  useEffect(() => {
    if (tenantLayout?.["register-fields"]) {
      setRegisterFields(tenantLayout["register-fields"]);
    }
    if (tenantLayout?.theme) {
      const t = tenantLayout.theme;
      if (t.primary) setEditPrimary(t.primary);
      if (t.secondary) setEditSecondary(t.secondary);
      if (t.font) setEditFont(t.font);
      if (t.forceTheme) setForceTheme(t.forceTheme);
      if (t.coursesLayout) setCoursesLayout(t.coursesLayout);
      if (t.coursesPerRow) setCoursesPerRow(t.coursesPerRow);
      if (t.borderRadius) setBorderRadius(t.borderRadius);
      if (t.buttonStyle) setButtonStyle(t.buttonStyle);
      if (t.shadowLevel) setShadowLevel(t.shadowLevel);
      if (t.logo) setLogo(t.logo);
      if (t.favicon) setFavicon(t.favicon);
      if (t.loginBanner) setLoginBanner(t.loginBanner);
      if (t.heroImage) setHeroImage(t.heroImage);
      if (t.platformName) setPlatformName(t.platformName);
      if (t.metaDescription) setMetaDescription(t.metaDescription);
      if (t.socialLinks) setSocialLinks(t.socialLinks);
    }
  }, [tenantLayout]);

  const pc = editPrimary;
  const pcRgb = hexToRgb(pc) || "139,92,246";
  const scRgb = hexToRgb(editSecondary) || "196,181,253";

  const colorVariants = [
    { label: "أفتح 40%", value: lighten(pc, 0.4) },
    { label: "أفتح 20%", value: lighten(pc, 0.2) },
    { label: "الأساسي", value: pc, main: true },
    { label: "أغمق 20%", value: darken(pc, 0.2) },
    { label: "أغمق 40%", value: darken(pc, 0.4) },
  ];

  const getSuggestions = (hex) => {
    const { h, s, l } = hexToHsl(hex);
    return [
      hslToHex((h + 180) % 360, s, Math.max(l, 40)),
      hslToHex((h + 30) % 360, s, l),
      hslToHex((h + 330) % 360, s, l),
      hslToHex((h + 120) % 360, s, l),
      hslToHex((h + 240) % 360, s, l),
    ];
  };
  const suggestions = getSuggestions(pc);

  useEffect(() => {
    if (!tenantLayout?.theme?.secondary && editPrimary !== primaryColor) {
      const { h, s, l } = hexToHsl(editPrimary);
      setEditSecondary(hslToHex((h + 180) % 360, s, Math.max(l, 40)));
    }
  }, [editPrimary]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  /* ── Image Upload ── */
  const handleImageUpload = async (file, setter, field) => {
    if (!file) return;
    setUploading(field);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.3,
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
            body: JSON.stringify({ image: base64, folder: `ofoq/${slug}` }),
          });
          if (res.ok) {
            const data = await res.json();
            setter(data.url);
          } else {
            alert("فشل الرفع");
          }
        } catch {
          alert("تعذر الاتصال");
        }
        setUploading(null);
      };
      reader.readAsDataURL(compressed);
    } catch {
      alert("فشل ضغط الصورة");
      setUploading(null);
    }
  };

  /* ── Toggle Register Fields ── */
  const toggleField = (fieldBase) => {
    const exists = registerFields.find((f) => f.name === fieldBase.name);
    if (exists) {
      setRegisterFields(
        registerFields.filter((f) => f.name !== fieldBase.name),
      );
    } else {
      setRegisterFields([...registerFields, { ...fieldBase, required: false }]);
    }
  };

  const toggleFieldRequired = (name, isRequired) => {
    setRegisterFields(
      registerFields.map((f) =>
        f.name === name ? { ...f, required: isRequired } : f,
      ),
    );
  };

  /* ── Save All ── */
  const handleSave = async () => {
    if (slug === "—") return;
    setIsSaving(true);
    const token = getToken();
    const fontObj =
      ARABIC_FONTS.find((f) => f.name === editFont) || ARABIC_FONTS[6];

    const payload = {
      slug,
      theme: {
        primary: editPrimary,
        secondary: editSecondary,
        font: fontObj.name,
        fontUrl: fontObj.url,
        forceTheme,
        coursesLayout,
        coursesPerRow,
        borderRadius,
        buttonStyle,
        shadowLevel,
        logo,
        favicon,
        loginBanner,
        heroImage,
        platformName,
        metaDescription,
        socialLinks,
      },
      "register-fields": registerFields,
    };

    try {
      const res = await fetch("/api/v1/tenants/layout", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) window.location.reload();
      else alert("حدث خطأ أثناء الحفظ");
    } catch {
      alert("تعذر الاتصال بالخادم");
    } finally {
      setIsSaving(false);
    }
  };

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className="w-full space-y-6">
      {/* Inject all font links */}
      <style>{`${ARABIC_FONTS.map((f) => `@import url('${f.url}');`).join("\n")}`}</style>

      {/* ── Hero Header ── */}
      <div
        className={`relative overflow-hidden rounded-[2rem] p-7 lg:p-9 ${d ? "bg-[#141625]/80 border border-white/5" : "bg-white border border-gray-100 shadow-xl shadow-gray-200/40"}`}
      >
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div
            className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px]"
            style={{ background: pc, opacity: d ? 0.15 : 0.08 }}
          />
          <div
            className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-[100px]"
            style={{ background: pc, opacity: d ? 0.1 : 0.05 }}
          />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <div
              className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ backgroundColor: `rgba(${pcRgb},0.1)`, color: pc }}
            >
              <Aperture className="w-3.5 h-3.5" />
              <span>هوية المنصة</span>
            </div>
            <h1
              className={`text-2xl lg:text-3xl font-extrabold ${d ? "text-white" : "text-gray-900"} mb-2`}
            >
              إعدادات التصميم والمظهر
            </h1>
            <p className={`text-sm ${d ? "text-gray-400" : "text-gray-500"}`}>
              تحكم كامل في كل تفاصيل هوية منصتك التعليمية
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 disabled:opacity-50"
            style={{
              backgroundColor: pc,
              boxShadow: `0 8px 24px rgba(${pcRgb},0.3)`,
            }}
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {isSaving ? "جاري الحفظ..." : "حفظ كل التغييرات"}
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div
        className={`flex gap-1 p-1 rounded-2xl overflow-x-auto ${d ? "bg-[#141625]/60" : "bg-gray-100/60"}`}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200
                ${
                  active
                    ? "text-white shadow-lg"
                    : d
                      ? "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                      : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                }
              `}
              style={
                active
                  ? {
                      backgroundColor: pc,
                      boxShadow: `0 4px 16px rgba(${pcRgb},0.3)`,
                    }
                  : undefined
              }
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════
         TAB 1: COLORS & TYPOGRAPHY
         ══════════════════════════════════════════════════════ */}
      {activeTab === "colors" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left: Info + Font */}
            <div className="xl:col-span-1 space-y-6">
              <Card
                d={d}
                title="بيانات النطاق"
                icon={<Globe className="w-5 h-5" style={{ color: pc }} />}
              >
                <InfoRow
                  d={d}
                  label="Slug"
                  value={slug}
                  onCopy={() => handleCopy(slug, "slug")}
                  copied={copied === "slug"}
                />
                <InfoRow
                  d={d}
                  label="عدد الخانات الإضافية"
                  value={`${registerFields.length} خانة`}
                />
              </Card>
              <Card
                d={d}
                title="الخطوط (Typography)"
                icon={<Type className="w-5 h-5" style={{ color: pc }} />}
              >
                <label
                  className={`block text-xs font-bold mb-2 ${d ? "text-gray-400" : "text-gray-500"}`}
                >
                  الخط الأساسي
                </label>
                <select
                  value={editFont}
                  onChange={(e) => setEditFont(e.target.value)}
                  className={`w-full outline-none font-bold text-sm px-4 py-3 rounded-xl mb-4 ${d ? "bg-[#0b0d14] border border-white/10 text-white" : "bg-gray-50 border border-gray-200 text-gray-900"}`}
                >
                  {ARABIC_FONTS.map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.name}
                    </option>
                  ))}
                </select>
                <div
                  className={`rounded-2xl p-5 ${d ? "bg-white/5" : "bg-gray-50"}`}
                >
                  <div style={{ fontFamily: editFont }} className="space-y-3">
                    <p className="text-2xl font-bold" style={{ color: pc }}>
                      {editFont}
                    </p>
                    <p
                      className={`text-base ${d ? "text-gray-300" : "text-gray-700"}`}
                    >
                      التعليم هو جواز السفر إلى المستقبل.
                    </p>
                    <p
                      className={`text-sm ${d ? "text-gray-500" : "text-gray-400"}`}
                    >
                      Education is the passport to the future.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right: Colors */}
            <div className="xl:col-span-2">
              <Card
                d={d}
                title="لوحة الألوان (Color System)"
                icon={<Paintbrush className="w-6 h-6" style={{ color: pc }} />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <ColorPicker
                    d={d}
                    label="اللون الأساسي (Primary)"
                    value={editPrimary}
                    onChange={setEditPrimary}
                  />
                  <div>
                    <ColorPicker
                      d={d}
                      label="اللون الثانوي (Secondary)"
                      value={editSecondary}
                      onChange={setEditSecondary}
                    />
                    <p
                      className={`text-[10px] font-bold mt-3 mb-1.5 ${d ? "text-gray-500" : "text-gray-400"}`}
                    >
                      ترشيحات مناسبة:
                    </p>
                    <div className="flex gap-2">
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => setEditSecondary(s)}
                          className="w-7 h-7 rounded-lg hover:scale-110 transition shadow border border-white/10"
                          style={{ background: s }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p
                  className={`text-xs font-bold mb-3 ${d ? "text-gray-400" : "text-gray-500"}`}
                >
                  تدرجات الأساسي
                </p>
                <div className="grid grid-cols-5 gap-2 mb-8">
                  {colorVariants.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => handleCopy(c.value, `c${i}`)}
                      className={`rounded-xl overflow-hidden transition hover:-translate-y-1 hover:shadow-lg ${c.main ? "ring-2 ring-offset-2 shadow-xl" : ""}${c.main && d ? " ring-white/20 ring-offset-[#141625]" : ""}${c.main && !d ? " ring-gray-300 ring-offset-white" : ""}`}
                      style={{ background: c.value }}
                    >
                      <div className="pt-[80%]" />
                      <div
                        className={`p-2 text-center backdrop-blur-md text-[9px] font-bold ${d ? "bg-black/30 text-white" : "bg-white/40 text-gray-900"}`}
                      >
                        <p>{c.label}</p>
                        <p className="font-mono opacity-70">
                          {c.value.toUpperCase()}
                        </p>
                      </div>
                      {copied === `c${i}` && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {/* UI Preview */}
                <p
                  className={`text-xs font-bold mb-3 ${d ? "text-gray-400" : "text-gray-500"}`}
                >
                  معاينة
                </p>
                <div
                  className={`flex flex-wrap gap-3 p-5 rounded-2xl ${d ? "bg-white/5" : "bg-gray-50"}`}
                >
                  <button
                    className="px-5 py-2 rounded-xl text-sm font-bold text-white"
                    style={{ background: pc, fontFamily: editFont }}
                  >
                    زر أساسي
                  </button>
                  <button
                    className="px-5 py-2 rounded-xl text-sm font-bold text-white"
                    style={{ background: editSecondary, fontFamily: editFont }}
                  >
                    زر ثانوي
                  </button>
                  <button
                    className={`px-5 py-2 rounded-xl text-sm font-bold border-2 ${d ? "hover:bg-white/5" : "hover:bg-gray-100"}`}
                    style={{ borderColor: pc, color: pc, fontFamily: editFont }}
                  >
                    مفرغ
                  </button>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: `rgba(${pcRgb},0.15)`, color: pc }}
                  >
                    شارة
                  </span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
         TAB 2: UI STYLING
         ══════════════════════════════════════════════════════ */}
      {activeTab === "ui" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Force Theme */}
          <Card
            d={d}
            title="وضع العرض للطلاب"
            icon={<Sun className="w-5 h-5" style={{ color: pc }} />}
          >
            <p
              className={`text-xs mb-4 ${d ? "text-gray-400" : "text-gray-500"}`}
            >
              هل المعلم عايز يجبر المنصة تفتح بوضع معين ولا يسيب الطلاب يختاروا؟
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  value: "auto",
                  label: "حرية الاختيار",
                  icon: <Sparkles className="w-5 h-5" />,
                  desc: "الطالب يختار",
                },
                {
                  value: "dark",
                  label: "داكن دائماً",
                  icon: <Moon className="w-5 h-5" />,
                  desc: "Force Dark",
                },
                {
                  value: "light",
                  label: "فاتح دائماً",
                  icon: <Sun className="w-5 h-5" />,
                  desc: "Force Light",
                },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setForceTheme(opt.value)}
                  className={`p-4 rounded-2xl text-center transition-all border-2 ${forceTheme === opt.value ? "" : d ? "border-white/5 hover:border-white/10 bg-white/[.02]" : "border-gray-100 hover:border-gray-200 bg-gray-50"}`}
                  style={
                    forceTheme === opt.value
                      ? { borderColor: pc, background: `rgba(${pcRgb},0.08)` }
                      : undefined
                  }
                >
                  <div
                    className="mb-2 mx-auto w-fit"
                    style={forceTheme === opt.value ? { color: pc } : undefined}
                  >
                    {opt.icon}
                  </div>
                  <p
                    className={`text-xs font-bold ${d ? "text-gray-200" : "text-gray-800"}`}
                  >
                    {opt.label}
                  </p>
                  <p
                    className={`text-[10px] mt-1 ${d ? "text-gray-500" : "text-gray-400"}`}
                  >
                    {opt.desc}
                  </p>
                </button>
              ))}
            </div>
          </Card>

          {/* Courses Layout */}
          <Card
            d={d}
            title="شكل عرض الكورسات"
            icon={<LayoutGrid className="w-5 h-5" style={{ color: pc }} />}
          >
            <p
              className={`text-xs mb-4 ${d ? "text-gray-400" : "text-gray-500"}`}
            >
              اختر طريقة عرض الكورسات للطلاب وكام كورس يظهر في الصف
            </p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                {
                  value: "grid",
                  label: "شبكة Grid",
                  icon: <LayoutGrid className="w-5 h-5" />,
                },
                {
                  value: "list",
                  label: "قائمة List",
                  icon: <List className="w-5 h-5" />,
                },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setCoursesLayout(opt.value)}
                  className={`p-4 rounded-2xl text-center transition-all border-2 ${coursesLayout === opt.value ? "" : d ? "border-white/5 bg-white/[.02]" : "border-gray-100 bg-gray-50"}`}
                  style={
                    coursesLayout === opt.value
                      ? { borderColor: pc, background: `rgba(${pcRgb},0.08)` }
                      : undefined
                  }
                >
                  <div
                    className="mb-2 mx-auto w-fit"
                    style={
                      coursesLayout === opt.value ? { color: pc } : undefined
                    }
                  >
                    {opt.icon}
                  </div>
                  <p
                    className={`text-xs font-bold ${d ? "text-gray-200" : "text-gray-800"}`}
                  >
                    {opt.label}
                  </p>
                </button>
              ))}
            </div>
            {coursesLayout === "grid" && (
              <div>
                <label
                  className={`text-xs font-bold mb-2 block ${d ? "text-gray-400" : "text-gray-500"}`}
                >
                  كام كورس في الصف؟
                </label>
                <div className="flex gap-2">
                  {[2, 3, 4].map((n) => (
                    <button
                      key={n}
                      onClick={() => setCoursesPerRow(n)}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border-2 ${coursesPerRow === n ? "text-white" : d ? "border-white/5 text-gray-400 bg-white/[.02]" : "border-gray-100 text-gray-600 bg-gray-50"}`}
                      style={
                        coursesPerRow === n
                          ? { background: pc, borderColor: pc }
                          : undefined
                      }
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Border Radius */}
          <Card
            d={d}
            title="حواف العناصر (Border Radius)"
            icon={<Square className="w-5 h-5" style={{ color: pc }} />}
          >
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "sharp", label: "حادة (Sharp)", radius: "4px" },
                { value: "rounded", label: "مدورة (Rounded)", radius: "12px" },
                { value: "pill", label: "اسطوانية (Pill)", radius: "999px" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setBorderRadius(opt.value)}
                  className={`p-4 rounded-2xl text-center transition-all border-2 ${borderRadius === opt.value ? "" : d ? "border-white/5 bg-white/[.02]" : "border-gray-100 bg-gray-50"}`}
                  style={
                    borderRadius === opt.value
                      ? { borderColor: pc, background: `rgba(${pcRgb},0.08)` }
                      : undefined
                  }
                >
                  <div
                    className="w-14 h-10 mx-auto mb-3 border-2"
                    style={{
                      borderRadius: opt.radius,
                      borderColor:
                        borderRadius === opt.value ? pc : d ? "#444" : "#ccc",
                      background:
                        borderRadius === opt.value
                          ? `rgba(${pcRgb},0.15)`
                          : "transparent",
                    }}
                  />
                  <p
                    className={`text-xs font-bold ${d ? "text-gray-200" : "text-gray-800"}`}
                  >
                    {opt.label}
                  </p>
                </button>
              ))}
            </div>
          </Card>

          {/* Button Style */}
          <Card
            d={d}
            title="تأثير الزراير (Button Style)"
            icon={
              <MousePointerClick className="w-5 h-5" style={{ color: pc }} />
            }
          >
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "flat", label: "سادة (Flat)" },
                { value: "gradient", label: "تدرج (Gradient)" },
                { value: "glass", label: "زجاجي (Glass)" },
              ].map((opt) => {
                const isActive = buttonStyle === opt.value;
                let btnStyle = {};
                if (opt.value === "flat") btnStyle = { background: pc };
                if (opt.value === "gradient")
                  btnStyle = {
                    background: `linear-gradient(135deg, ${pc}, ${editSecondary})`,
                  };
                if (opt.value === "glass")
                  btnStyle = {
                    background: `rgba(${pcRgb},0.2)`,
                    backdropFilter: "blur(10px)",
                    border: `1px solid rgba(${pcRgb},0.3)`,
                    color: pc,
                  };
                return (
                  <button
                    key={opt.value}
                    onClick={() => setButtonStyle(opt.value)}
                    className={`p-4 rounded-2xl text-center transition-all border-2 ${isActive ? "" : d ? "border-white/5 bg-white/[.02]" : "border-gray-100 bg-gray-50"}`}
                    style={
                      isActive
                        ? { borderColor: pc, background: `rgba(${pcRgb},0.08)` }
                        : undefined
                    }
                  >
                    <div
                      className="mb-3 mx-auto px-4 py-2 rounded-lg text-xs font-bold text-white w-fit"
                      style={btnStyle}
                    >
                      أهلاً
                    </div>
                    <p
                      className={`text-xs font-bold ${d ? "text-gray-200" : "text-gray-800"}`}
                    >
                      {opt.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Shadows */}
          <Card
            d={d}
            title="الظلال (Shadows)"
            icon={<Layers className="w-5 h-5" style={{ color: pc }} />}
          >
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  value: "soft",
                  label: "ناعم (Soft)",
                  shadow: "0 2px 8px rgba(0,0,0,0.08)",
                },
                {
                  value: "medium",
                  label: "متوسط (Medium)",
                  shadow: "0 4px 16px rgba(0,0,0,0.12)",
                },
                {
                  value: "hard",
                  label: "قوي (Hard)",
                  shadow: "0 8px 32px rgba(0,0,0,0.2)",
                },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setShadowLevel(opt.value)}
                  className={`p-4 rounded-2xl text-center transition-all border-2 ${shadowLevel === opt.value ? "" : d ? "border-white/5 bg-white/[.02]" : "border-gray-100 bg-gray-50"}`}
                  style={
                    shadowLevel === opt.value
                      ? { borderColor: pc, background: `rgba(${pcRgb},0.08)` }
                      : undefined
                  }
                >
                  <div
                    className={`w-16 h-10 mx-auto mb-3 rounded-lg ${d ? "bg-white/10" : "bg-white"}`}
                    style={{ boxShadow: opt.shadow }}
                  />
                  <p
                    className={`text-xs font-bold ${d ? "text-gray-200" : "text-gray-800"}`}
                  >
                    {opt.label}
                  </p>
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
         TAB 3: BRAND ASSETS
         ══════════════════════════════════════════════════════ */}
      {activeTab === "brand" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ImageUploadCard
            d={d}
            pc={pc}
            pcRgb={pcRgb}
            label="اللوجو الأساسي (Logo)"
            desc="يظهر في الهيدر وصفحة تسجيل الدخول"
            value={logo}
            onChange={setLogo}
            field="logo"
            uploading={uploading}
            onUpload={handleImageUpload}
            aspect="aspect-square"
            maxW="max-w-[160px]"
          />
          <ImageUploadCard
            d={d}
            pc={pc}
            pcRgb={pcRgb}
            label="أيقونة المتصفح (Favicon)"
            desc="الأيقونة في تاب المتصفح"
            value={favicon}
            onChange={setFavicon}
            field="favicon"
            uploading={uploading}
            onUpload={handleImageUpload}
            aspect="aspect-square"
            maxW="max-w-[80px]"
          />
          <ImageUploadCard
            d={d}
            pc={pc}
            pcRgb={pcRgb}
            label="خلفية تسجيل الدخول (Login Banner)"
            desc="صورة بتظهر في صفحة تسجيل دخول الطلاب"
            value={loginBanner}
            onChange={setLoginBanner}
            field="loginBanner"
            uploading={uploading}
            onUpload={handleImageUpload}
            aspect="aspect-video"
          />
          <ImageUploadCard
            d={d}
            pc={pc}
            pcRgb={pcRgb}
            label="صورة الغلاف (Hero Image)"
            desc="صورة أو إعلان في الصفحة الرئيسية للطلاب"
            value={heroImage}
            onChange={setHeroImage}
            field="heroImage"
            uploading={uploading}
            onUpload={handleImageUpload}
            aspect="aspect-video"
          />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
         TAB 4: SEO & SOCIAL
         ══════════════════════════════════════════════════════ */}
      {activeTab === "seo" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card
              d={d}
              title="بيانات المنصة (SEO)"
              icon={<FileText className="w-5 h-5" style={{ color: pc }} />}
            >
              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-xs font-bold mb-2 ${d ? "text-gray-400" : "text-gray-500"}`}
                  >
                    اسم المنصة (Platform Name)
                  </label>
                  <input
                    type="text"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    placeholder='مثال: "أكاديمية أفق"'
                    className={`w-full outline-none font-bold text-sm px-4 py-3 rounded-xl ${d ? "bg-[#0b0d14] border border-white/10 text-white placeholder:text-gray-600" : "bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-bold mb-2 ${d ? "text-gray-400" : "text-gray-500"}`}
                  >
                    وصف المنصة (Meta Description)
                  </label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    rows={3}
                    placeholder="وصف قصير يظهر في نتائج بحث جوجل وعند مشاركة الرابط"
                    className={`w-full outline-none font-semibold text-sm px-4 py-3 rounded-xl resize-none ${d ? "bg-[#0b0d14] border border-white/10 text-white placeholder:text-gray-600" : "bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400"}`}
                  />
                </div>
              </div>
              {/* Preview Card */}
              <div className="mt-5">
                <p
                  className={`text-[10px] font-bold uppercase mb-2 ${d ? "text-gray-500" : "text-gray-400"}`}
                >
                  معاينة لينك واتساب / جوجل
                </p>
                <div
                  className={`rounded-xl p-4 border ${d ? "bg-[#0b0d14] border-white/5" : "bg-white border-gray-200 shadow-sm"}`}
                >
                  <p className="text-sm font-bold" style={{ color: pc }}>
                    {platformName || "اسم المنصة"}
                  </p>
                  <p
                    className={`text-xs mt-1 ${d ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {metaDescription || "وصف المنصة سيظهر هنا..."}
                  </p>
                  <p
                    className={`text-[10px] mt-2 ${d ? "text-gray-600" : "text-gray-400"}`}
                  >
                    {slug}.ofoq.com
                  </p>
                </div>
              </div>
            </Card>

            <Card
              d={d}
              title="روابط التواصل الاجتماعي"
              icon={<Share2 className="w-5 h-5" style={{ color: pc }} />}
            >
              <p
                className={`text-xs mb-4 ${d ? "text-gray-400" : "text-gray-500"}`}
              >
                أضف روابط حساباتك على شبكات التواصل وهتظهر تلقائياً في فوتر
                الموقع للطلاب
              </p>
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 sidebar-scroll">
                {SOCIAL_PLATFORMS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.key}
                      className={`flex items-center gap-3 p-3 rounded-xl ${d ? "bg-white/[.02] hover:bg-white/[.04]" : "bg-gray-50 hover:bg-gray-100"} transition`}
                    >
                      <div
                        className={`p-2 rounded-lg shrink-0 ${d ? "bg-white/5" : "bg-gray-200/50"}`}
                      >
                        <Icon
                          className={`w-4 h-4 ${d ? "text-gray-400" : "text-gray-500"}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-[10px] font-bold mb-1 ${d ? "text-gray-500" : "text-gray-400"}`}
                        >
                          {s.label}
                        </p>
                        <input
                          type="url"
                          dir="ltr"
                          value={socialLinks[s.key] || ""}
                          onChange={(e) =>
                            setSocialLinks((prev) => ({
                              ...prev,
                              [s.key]: e.target.value,
                            }))
                          }
                          placeholder={s.placeholder}
                          className={`w-full outline-none text-xs px-0 py-0 bg-transparent font-medium ${d ? "text-gray-300 placeholder:text-gray-700" : "text-gray-700 placeholder:text-gray-300"}`}
                        />
                      </div>
                      {socialLinks[s.key] && (
                        <a
                          href={socialLinks[s.key]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-1.5 rounded-lg ${d ? "hover:bg-white/10 text-gray-500" : "hover:bg-gray-200 text-gray-400"}`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
         TAB 5: REGISTER FIELDS
         ══════════════════════════════════════════════════════ */}
      {activeTab === "registerFields" && (
        <Card
          d={d}
          title="تخصيص الخانات الإضافية للتسجيل"
          icon={<CheckSquare className="w-5 h-5" style={{ color: pc }} />}
        >
          <p
            className={`text-sm mb-6 ${d ? "text-gray-400" : "text-gray-500"}`}
          >
            قم باختيار الخانات الإضافية التي ترغب بطلبها من الطالب عند إنشاء
            حساب جديد.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PREDEFINED_FIELDS.map((pf) => {
              const activeField = registerFields.find(
                (f) => f.name === pf.name,
              );
              const isEnabled = !!activeField;
              const isRequired = activeField?.required || false;
              const FieldIcon = pf.icon || Hash;

              return (
                <div
                  key={pf.name}
                  className={`flex flex-col gap-3 p-4 rounded-xl border transition-all ${
                    isEnabled
                      ? d
                        ? "bg-[#141625] border-white/20"
                        : "bg-white border-gray-300 shadow-md"
                      : d
                        ? "bg-white/5 border-white/5 opacity-70 hover:opacity-100"
                        : "bg-gray-50 border-gray-100 hover:border-gray-200"
                  }`}
                  style={
                    isEnabled
                      ? {
                          borderColor: `rgba(${pcRgb},0.4)`,
                          boxShadow: `0 4px 12px rgba(${pcRgb},0.08)`,
                        }
                      : {}
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-all ${
                          isEnabled ? "shadow-inner" : "grayscale opacity-50"
                        }`}
                        style={{
                          background: isEnabled
                            ? `linear-gradient(135deg, ${pc}, ${darken(pc, 0.2)})`
                            : d
                              ? "#333"
                              : "#ccc",
                          color: "#fff",
                        }}
                      >
                        <FieldIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p
                          className={`font-bold text-sm ${d ? "text-white" : "text-gray-900"}`}
                        >
                          {pf.label}
                        </p>
                        <p
                          className={`text-[10px] mt-0.5 ${d ? "text-gray-400" : "text-gray-500"}`}
                        >
                          النوع:{" "}
                          {pf.type === "textarea"
                            ? "نص طويل"
                            : pf.type === "select"
                              ? "قائمة منسدلة"
                              : pf.type === "date"
                                ? "تاريخ"
                                : pf.type === "image"
                                  ? "صورة"
                                  : pf.type === "number"
                                    ? "رقم"
                                    : "نص قصير"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between border-t border-dashed mt-1 pt-3"
                    style={{
                      borderColor: d
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.1)",
                    }}
                  >
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() =>
                          toggleField({
                            name: pf.name,
                            label: pf.label,
                            type: pf.type,
                            options: pf.options,
                          })
                        }
                        className="w-4 h-4 rounded text-blue-600"
                      />
                      <span
                        className={`text-xs font-bold ${isEnabled ? (d ? "text-white" : "text-gray-900") : d ? "text-gray-500" : "text-gray-400"}`}
                      >
                        {isEnabled ? "مفعل" : "غير مفعل"}
                      </span>
                    </label>

                    {isEnabled && (
                      <label
                        className={`flex items-center gap-2 cursor-pointer transition-all ${isRequired ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
                      >
                        <input
                          type="checkbox"
                          checked={isRequired}
                          onChange={(e) =>
                            toggleFieldRequired(pf.name, e.target.checked)
                          }
                          className="w-4 h-4 rounded"
                        />
                        <span
                          className={`text-xs font-bold ${isRequired ? "text-red-500" : d ? "text-gray-400" : "text-gray-500"}`}
                        >
                          مطلوب (إجباري)
                        </span>
                      </label>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

function Card({ d, title, icon, children }) {
  return (
    <div
      className={`p-6 rounded-2xl border ${d ? "bg-[#141625] border-white/5" : "bg-white border-gray-100 shadow-xl shadow-gray-200/40"}`}
    >
      <div className="flex items-center gap-3 mb-6">
        {icon && (
          <div className={`p-2 rounded-xl ${d ? "bg-white/5" : "bg-gray-50"}`}>
            {icon}
          </div>
        )}
        <h2
          className={`font-bold text-lg ${d ? "text-white" : "text-gray-900"}`}
        >
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ d, label, value, onCopy, copied }) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl border ${d ? "bg-[#0b0d14] border-white/5" : "bg-gray-50 border-gray-100"}`}
    >
      <div>
        <span
          className={`text-[10px] font-bold uppercase ${d ? "text-gray-500" : "text-gray-400"}`}
        >
          {label}
        </span>
        <p
          className={`font-mono text-sm mt-0.5 ${d ? "text-gray-300" : "text-gray-700"}`}
        >
          {value}
        </p>
      </div>
      {onCopy && (
        <button
          onClick={onCopy}
          className={`p-2 rounded-lg transition ${copied ? "text-green-500" : d ? "text-gray-400 hover:text-white hover:bg-white/10" : "text-gray-400 hover:text-gray-900 hover:bg-gray-200"}`}
        >
          {copied ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
}

function ColorPicker({ d, label, value, onChange }) {
  return (
    <div>
      <label
        className={`block text-xs font-bold mb-2 ${d ? "text-gray-400" : "text-gray-500"}`}
      >
        {label}
      </label>
      <div
        className={`flex items-center gap-3 p-2 rounded-xl border ${d ? "bg-[#0b0d14] border-white/10" : "bg-gray-50 border-gray-200"}`}
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
        />
        <input
          type="text"
          dir="ltr"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`flex-1 w-full bg-transparent outline-none font-mono text-sm ${d ? "text-white" : "text-gray-900"}`}
        />
      </div>
    </div>
  );
}

function ImageUploadCard({
  d,
  pc,
  pcRgb,
  label,
  desc,
  value,
  onChange,
  field,
  uploading,
  onUpload,
  aspect,
  maxW,
}) {
  const inputRef = useRef(null);
  const isUploading = uploading === field;
  return (
    <Card
      d={d}
      title={label}
      icon={<ImageIcon className="w-5 h-5" style={{ color: pc }} />}
    >
      <p className={`text-xs mb-4 ${d ? "text-gray-400" : "text-gray-500"}`}>
        {desc}
      </p>
      {value ? (
        <div className="relative group">
          <div
            className={`${aspect || "aspect-video"} ${maxW || "w-full"} mx-auto rounded-2xl overflow-hidden border-2 ${d ? "border-white/10" : "border-gray-200"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt={label}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl gap-3">
            <button
              onClick={() => inputRef.current?.click()}
              className="p-3 rounded-full bg-white text-black hover:scale-110 transition"
            >
              <Upload className="w-5 h-5" />
            </button>
            <button
              onClick={() => onChange("")}
              className="p-3 rounded-full bg-red-500 text-white hover:scale-110 transition"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className={`w-full ${maxW || ""} mx-auto ${aspect || "aspect-video"} rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all ${isUploading ? "opacity-50" : ""} ${d ? "border-white/10 hover:border-white/20 bg-white/[.02]" : "border-gray-200 hover:border-gray-300 bg-gray-50"}`}
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: pc }} />
          ) : (
            <>
              <Upload className="w-8 h-8" style={{ color: pc }} />
              <span
                className={`text-xs font-bold ${d ? "text-gray-400" : "text-gray-500"}`}
              >
                اضغط لرفع صورة
              </span>
              <span
                className={`text-[10px] ${d ? "text-gray-600" : "text-gray-400"}`}
              >
                يتم ضغطها تلقائياً
              </span>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) onUpload(e.target.files[0], onChange, field);
          e.target.value = "";
        }}
      />
    </Card>
  );
}
