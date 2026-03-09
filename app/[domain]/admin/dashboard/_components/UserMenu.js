"use client";

import { useRef, useState, useEffect } from "react";
import { LogOut, ChevronDown } from "lucide-react";

export default function UserMenu({
  dark,
  instructor,
  tenant,
  onLogout,
  primaryColor,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const d = dark;
  const pc = primaryColor ;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initial = instructor?.name ? instructor.name.charAt(0) : "م";

  return (
    <div className="relative" ref={ref}>
      <div
        className={`flex items-center gap-2 cursor-pointer p-1.5 pr-3 rounded-2xl transition-all duration-200
          ${d ? "hover:bg-white/5" : "hover:bg-gray-50"}
          ${open ? (d ? "bg-white/5" : "bg-gray-50") : ""}
        `}
        onClick={() => setOpen(!open)}
      >
        <div className="avatar-ring">
          <div
            className="w-8 h-8 rounded-[10px] flex items-center justify-center text-white font-bold text-sm"
            style={{ background: pc }}
          >
            {initial}
          </div>
        </div>
        <div className="hidden sm:block">
          <p
            className={`text-xs font-semibold leading-none ${d ? "text-gray-200" : "text-gray-700"}`}
          >
            {instructor?.name || "جاري التحميل..."}
          </p>
          <p
            className={`text-[10px] mt-0.5 ${d ? "text-gray-500" : "text-gray-400"}`}
          >
            {instructor?.phone ? "معلم" : "..."}
          </p>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 hidden sm:block transition-transform duration-200 ${d ? "text-gray-500" : "text-gray-400"} ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </div>

      {open && (
        <div
          className={`
            slide-in absolute left-0 top-full mt-2 w-64 rounded-2xl overflow-hidden z-50
            ${
              d
                ? "bg-[#141625] border border-white/8 shadow-2xl shadow-black/60"
                : "bg-white border border-gray-200/80 shadow-2xl shadow-gray-300/50"
            }
          `}
        >
          {/* User Info */}
          <div
            className={`px-4 py-3.5 border-b ${d ? "border-white/6" : "border-gray-100"}`}
          >
            <div className="flex items-center gap-3">
              <div className="avatar-ring shrink-0">
                <div
                  className="w-10 h-10 rounded-[12px] flex items-center justify-center text-white font-bold text-base"
                  style={{ background: pc }}
                >
                  {initial}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-bold truncate ${d ? "text-gray-100" : "text-gray-800"}`}
                >
                  {instructor?.name || "—"}
                </p>
                <p
                  className={`text-[11px] mt-0.5 truncate ${d ? "text-gray-500" : "text-gray-400"}`}
                  dir="ltr"
                  style={{ textAlign: "right" }}
                >
                  {instructor?.phone || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Platform */}
          <div
            className={`px-4 py-3 border-b ${d ? "border-white/6" : "border-gray-100"}`}
          >
            <p
              className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${d ? "text-gray-600" : "text-gray-400"}`}
            >
              المنصة الحالية
            </p>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: pc }}
              >
                <span className="text-white text-[10px] font-bold">
                  {tenant?.name ? tenant.name.charAt(0) : "—"}
                </span>
              </div>
              <p className="text-sm font-bold truncate" style={{ color: pc }}>
                {tenant?.name || "غير محدد"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="p-1.5">
            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${d ? "text-red-400/80 hover:text-red-400 hover:bg-red-500/10" : "text-red-500/70 hover:text-red-600 hover:bg-red-50"}`}
            >
              <LogOut className="w-[18px] h-[18px]" strokeWidth={1.7} />
              تسجيل الخروج
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
