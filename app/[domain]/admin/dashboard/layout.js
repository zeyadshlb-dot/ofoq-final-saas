"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import DashboardStyles from "./_components/DashboardStyles";
import Sidebar from "./_components/Sidebar";
import Header from "./_components/Header";
import { useToast } from "@/components/ToastProvider";

/* ─── Theme Context ─── */
const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

/* ─── Helper: extract slug from hostname ─── */
export function getSlug() {
  if (typeof window === "undefined") return "main";
  const host = window.location.hostname; // e.g. "zeyad.localhost" or "alwody.example.com"

  let slug = "main";
  if (host.endsWith(".localhost")) {
    slug = host.replace(".localhost", "") || "main";
  } else if (host !== "localhost") {
    const parts = host.split(".");
    if (parts.length >= 3) slug = parts[0];
  }

  // إزالة "admin-" عشان يقرأ الـ Theme الصح من الـ Database
  if (slug.startsWith("admin-")) {
    slug = slug.replace("admin-", "");
  }

  return slug;
}

/* ─── Helper: get token ─── */
export function getToken() {
  if (typeof window === "undefined") return null;
  let token = localStorage.getItem("instructor_token");
  if (!token) {
    const cookies = document.cookie.split(";");
    const c = cookies.find((c) => c.trim().startsWith("instructor_token="));
    if (c) token = c.split("=")[1];
  }
  return token;
}

/* ═══════════════════════════════════════════════════════════════════
   Dashboard Layout
   ═══════════════════════════════════════════════════════════════════ */
export default function DashboardLayout({ children }) {
  const [dark, setDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [instructor, setInstructor] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [tenantLayout, setTenantLayout] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [videoWalletStats, setVideoWalletStats] = useState(null);
  const [aiWalletStats, setAiWalletStats] = useState(null);
  const [liveWalletStats, setLiveWalletStats] = useState(null);
  const router = useRouter();
  const { toast } = useToast();
  const slug = getSlug();

  /* ─── Theme persistence ─── */
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDark = () => {
    setDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return next;
    });
  };

  /* ─── Data fetching & WebSocket ─── */
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    let ws;

    const init = async () => {
      try {
        // Fetch instructor
        const res = await fetch("/api/v1/instructor/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setInstructor(await res.json());

        // Fetch tenant list
        const tenantRes = await fetch("/api/v1/tenants", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (tenantRes.ok) {
          const td = await tenantRes.json();
          if (td.data?.length > 0) setTenant(td.data[0]);
        }

        // Fetch tenant layout (colors)
        const layoutRes = await fetch(`/api/v1/tenants/layout?slug=${slug}`);
        if (layoutRes.ok) {
          const ld = await layoutRes.json();
          if (ld.success && ld.data) {
            setTenantLayout(ld.data);
          }
        }

        // Fetch video stats
        const videoStatsRes = await fetch(
          `/api/v1/tenants/video-wallet-stats?slug=${slug}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (videoStatsRes.ok) {
          const vs = await videoStatsRes.json();
          if (vs.success) setVideoWalletStats(vs.data);
        }

        // Fetch AI stats
        const aiStatsRes = await fetch(`/api/v1/ai/balance?slug=${slug}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (aiStatsRes.ok) {
          const as = await aiStatsRes.json();
          if (as.success) setAiWalletStats(as.data?.wallet);
        }

        // Fetch Live stats
        const liveStatsRes = await fetch(`/api/v1/live/wallet?slug=${slug}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (liveStatsRes.ok) {
          const ls = await liveStatsRes.json();
          if (ls.success) setLiveWalletStats(ls.data);
        }
      } catch {}

      // WebSocket
      const wsProto = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${wsProto}//${window.location.host}/api/v1/instructor/ws?token=${token}`;
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // ─── 1. Persistent Notification Log ───
          const notifId = data.id || Date.now();
          const newNotif = {
            id: notifId,
            title: data.message || "إشعار جديد",
            time: "الآن",
            dot:
              data.type === "error" || data.type === "ai_wallet_alert"
                ? "bg-red-400"
                : "bg-violet-400",
            type: data.type,
          };

          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);

          // ─── 2. Actionable Live Events ───
          switch (data.type) {
            case "student_enrolled":
              toast(`🎓 طالب جديد: ${data.message}`, "info");
              // Maybe refresh some stats here if needed
              break;

            case "ai_wallet_deduction":
              // Instantly update the AI balance state
              if (data.data?.new_balance !== undefined) {
                setAiWalletStats((prev) => ({
                  ...prev,
                  balance: data.data.new_balance,
                }));
              }
              break;

            case "ai_wallet_alert":
              toast(`⚠️ تنبيه الرصيد: ${data.message}`, "error");
              break;

            case "video_wallet_deduction":
              if (data.data?.new_balance !== undefined) {
                setVideoWalletStats((prev) => ({
                  ...prev,
                  balance: data.data.new_balance,
                }));
              }
              break;

            case "live_wallet_deduction":
              if (data.data?.new_balance !== undefined) {
                setLiveWalletStats((prev) => ({
                  ...prev,
                  balance: data.data.new_balance,
                }));
              }
              break;

            default:
              // Generic toast for other messages if important
              if (data.type === "success") toast(data.message, "success");
              if (data.type === "error") toast(data.message, "error");
          }
        } catch (err) {
          console.error("WS parse error", err);
        }
      };

      ws.onopen = () => console.log("✅ Connected to Ofoq Real-time Hub");
      ws.onclose = () =>
        console.warn("❌ Disconnected from Ofoq Real-time Hub");
      ws.onerror = (err) => console.error("⚠️ WebSocket Error:", err);
    };

    init();
    return () => {
      if (ws?.readyState === 1) ws.close();
    };
  }, []);

  /* ─── Logout ─── */
  const handleLogout = () => {
    localStorage.removeItem("instructor_token");
    document.cookie = "instructor_token=; path=/; max-age=0;";
    router.push("/login");
  };

  const d = dark;
  const pc = tenantLayout?.theme?.primary;
  const sc = tenantLayout?.theme?.secondary;

  return (
    <ThemeContext.Provider
      value={{
        dark,
        toggleDark,
        tenantLayout,
        primaryColor: pc,
        secondaryColor: sc,
        tenant,
        instructor,
        videoWalletStats,
        aiWalletStats,
        liveWalletStats,
      }}
    >
      <DashboardStyles />

      <div
        className={`h-screen w-full flex overflow-hidden transition-colors duration-300 relative ${d ? "bg-[#06080f] text-gray-100" : "bg-[#f4f6f9] text-gray-900"}`}
        dir="rtl"
      >
        {/* Premium Background Orbs & Effects */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex justify-center items-center">
          <div
            className={`absolute -top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full blur-[150px] transition-opacity duration-1000 ${d ? "opacity-20" : "opacity-[0.08]"}`}
            style={{ background: pc }}
          ></div>
          <div
            className={`absolute top-[40%] -left-[10%] w-[400px] h-[400px] rounded-full blur-[150px] transition-opacity duration-1000 ${d ? "opacity-10" : "opacity-[0.05]"}`}
            style={{ background: sc || pc }}
          ></div>
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden transition-all duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <Sidebar
          dark={d}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          instructor={instructor}
          tenant={tenant}
          onLogout={handleLogout}
          primaryColor={pc}
        />

        {/* Main Area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          <Header
            dark={d}
            toggleDark={toggleDark}
            onMenuClick={() => setSidebarOpen(true)}
            instructor={instructor}
            tenant={tenant}
            notifications={notifications}
            unreadCount={unreadCount}
            setNotifications={setNotifications}
            setUnreadCount={setUnreadCount}
            onLogout={handleLogout}
            primaryColor={pc}
          />

          {/* Page Content */}
          <main className="flex-1 p-4 lg:p-7 overflow-auto relative z-10 scroll-smooth">
            {children}
          </main>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
