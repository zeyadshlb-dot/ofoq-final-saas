"use client";

import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  BookOpen,
  Radio,
  Settings,
  LogOut,
  X,
  Sparkles,
  LayoutDashboard,
  GraduationCap,
  Ticket,
  MessageCircle,
  CreditCard,
  Video,
  Zap,
  Wallet,
  Flame,
  BarChart3,
} from "lucide-react";
import sidebarLinks from "./sidebar.json";

const iconMap = {
  Home,
  Users,
  BookOpen,
  Radio,
  Settings,
  LayoutDashboard,
  GraduationCap,
  Ticket,
  MessageCircle,
  CreditCard,
  Sparkles,
  Video,
  Zap,
  Wallet,
  Flame,
  BarChart3,
};

export default function Sidebar({
  dark,
  open,
  onClose,
  instructor,
  tenant,
  onLogout,
  primaryColor,
}) {
  const pathname = usePathname();
  const d = dark;
  const pc = primaryColor;
  const initial = instructor?.name ? instructor.name.charAt(0) : "م";

  return (
    <aside
      className={`
        fixed right-0 top-0 z-50 h-full w-[272px] flex flex-col
        transition-transform duration-300 ease-out
        lg:translate-x-0 lg:relative lg:z-auto
        ${open ? "translate-x-0" : "translate-x-full"}
        ${
          d
            ? "bg-[#06080f]/80 border-l border-white/8 backdrop-blur-2xl"
            : "bg-white/70 border-l border-gray-200/60 backdrop-blur-2xl"
        }
      `}
      style={{
        boxShadow: d ? "0 0 60px rgba(0,0,0,.7)" : "4px 0 40px rgba(0,0,0,.07)",
      }}
    >
      {/* ─── Logo / Platform ─── */}
      <div
        className={`px-6 pt-8 pb-6 flex items-center justify-between border-b ${d ? "border-white/8" : "border-gray-100"}`}
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center logo-glow shadow-lg"
              style={{ background: pc, boxShadow: `0 8px 24px ${pc}40` }}
            >
              <Sparkles className="w-5 h-5 text-white" strokeWidth={1.8} />
            </div>
            <span
              className="absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2"
              style={{ borderColor: d ? "#0f1120" : "#fff" }}
            />
          </div>
          <div>
            <h2
              className="text-base font-bold leading-tight"
              style={{ color: pc }}
            >
              {tenant?.name || "جاري التحميل..."}
            </h2>
            <p
              className={`text-[10px] mt-0.5 font-medium tracking-wider uppercase ${d ? "text-gray-600" : "text-gray-400"}`}
            >
              لوحة المعلم
            </p>
          </div>
        </div>
        <button
          className={`lg:hidden p-1.5 rounded-lg ${d ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-500"} transition`}
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ─── Navigation ─── */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto sidebar-scroll">
        {sidebarLinks.map((section, sidx) => (
          <div key={sidx} className={sidx > 0 ? "mt-6" : ""}>
            <p
              className={`text-[10px] font-bold uppercase tracking-[0.15em] px-4 mb-3 opacity-60 ${d ? "text-gray-400" : "text-gray-500"}`}
            >
              {section.category}
            </p>
            <div className="space-y-1">
              {section.links.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/dashboard" &&
                    pathname?.startsWith(link.href));
                const Icon = iconMap[link.icon] || Home;
                const isLive = link.badge === "LIVE";

                return (
                  <a
                    key={link.id}
                    href={link.href}
                    className={`
                      flex items-center gap-3 px-3 py-3 rounded-2xl text-[13.5px] font-bold relative group transition-all duration-300
                      ${
                        isActive
                          ? d
                            ? "bg-white/10 text-white border border-white/5 shadow-inner"
                            : "bg-gray-100/80 text-gray-900 border border-black/5 shadow-sm"
                          : d
                            ? "text-gray-500 hover:text-white hover:bg-white/5"
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/80"
                      }
                    `}
                    style={isActive ? { color: pc } : undefined}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <span
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-l-full shadow-md"
                        style={{
                          background: pc,
                          boxShadow: `0 0 12px ${pc}60`,
                        }}
                      />
                    )}

                    <span
                      className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-300 ${isActive ? (d ? "bg-white/10" : "bg-white shadow-sm") : ""}`}
                      style={isActive ? { color: pc } : {}}
                    >
                      <Icon
                        className="w-[18px] h-[18px]"
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    </span>

                    <span className="flex-1 tracking-tight">{link.label}</span>

                    {isLive && (
                      <span className="live-badge flex items-center gap-1 text-[9px] font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full ring-1 ring-red-500/20">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        LIVE
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ─── Sidebar Footer ─── */}
      <div
        className={`p-4 border-t ${d ? "border-white/8" : "border-black/5"}`}
      >
        {/* Mini user card */}
        <div
          className={`flex items-center gap-3 px-3 py-3 rounded-2xl mb-2 transition-colors duration-300 ${d ? "hover:bg-white/5 bg-white/5 border border-white/5" : "hover:bg-gray-100/50 bg-gray-50/80 border border-black/5"}`}
        >
          <div className="shrink-0 relative">
            <div
              className={`w-10 h-10 rounded-[14px] flex items-center justify-center font-black text-sm shadow-md ${d ? "bg-[#06080f]" : "bg-white"}`}
            >
              <span style={{ color: pc }}>{initial}</span>
            </div>
            <span
              className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 rounded-full z-10"
              style={{ borderColor: d ? "#06080f" : "#fff" }}
            ></span>
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={`text-xs font-bold truncate ${d ? "text-gray-200" : "text-gray-700"}`}
            >
              {instructor?.name || "جاري التحميل..."}
            </p>
            <p
              className={`text-[10px] truncate mt-0.5 ${d ? "text-gray-600" : "text-gray-400"}`}
              dir="ltr"
              style={{ textAlign: "right" }}
            >
              {instructor?.phone || "..."}
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
            ${d ? "text-red-400/80 hover:text-red-400 hover:bg-red-500/10" : "text-red-500/70 hover:text-red-600 hover:bg-red-50"}`}
        >
          <LogOut className="w-[18px] h-[18px]" strokeWidth={1.7} />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
