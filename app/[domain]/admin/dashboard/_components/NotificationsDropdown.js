"use client";

import { useRef, useState, useEffect } from "react";
import { Bell, ChevronLeft } from "lucide-react";

export default function NotificationsDropdown({
  dark,
  notifications,
  unreadCount,
  setNotifications,
  setUnreadCount,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const d = dark;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) setUnreadCount(0);
        }}
        className={`relative p-2.5 rounded-xl transition-all duration-200
          ${d ? "bg-white/[.06] text-gray-400 hover:bg-white/10 hover:text-gray-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"}
          ${open ? (d ? "bg-white/10 text-gray-200" : "bg-gray-200 text-gray-700") : ""}`}
      >
        <Bell className="w-[18px] h-[18px]" strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="notif-dot absolute top-2 left-2 w-2 h-2 bg-red-500 rounded-full border-[1.5px] border-[#0b0d14]" />
        )}
      </button>

      {open && (
        <div
          className={`
            slide-in absolute left-0 top-full mt-2 w-80 rounded-2xl overflow-hidden z-50
            ${
              d
                ? "bg-[#141625] border border-white/8 shadow-2xl shadow-black/60"
                : "bg-white border border-gray-200/80 shadow-2xl shadow-gray-300/50"
            }
          `}
        >
          {/* Header */}
          <div
            className={`px-4 py-3.5 flex items-center justify-between border-b ${d ? "border-white/6" : "border-gray-100"}`}
          >
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm">الإشعارات</h3>
              {unreadCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={() => setNotifications([])}
              className={`text-xs font-medium ${d ? "text-violet-400 hover:text-violet-300" : "text-violet-600 hover:text-violet-700"} transition`}
            >
              مسح الكل
            </button>
          </div>

          {/* Items */}
          <div
            className={`max-h-64 overflow-y-auto divide-y ${d ? "divide-white/5" : "divide-gray-50"}`}
          >
            {notifications.length === 0 ? (
              <div
                className={`px-4 py-8 text-center ${d ? "text-gray-600" : "text-gray-400"}`}
              >
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">لا توجد إشعارات</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors
                    ${d ? "hover:bg-white/[.04]" : "hover:bg-gray-50/80"}`}
                >
                  <span
                    className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${n.dot}`}
                  />
                  <div>
                    <p className="text-sm font-medium leading-snug">
                      {n.title}
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${d ? "text-gray-600" : "text-gray-400"}`}
                    >
                      {n.time}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div
            className={`px-4 py-3 border-t ${d ? "border-white/6" : "border-gray-100"}`}
          >
            <a
              href="#"
              className={`text-xs font-medium flex items-center justify-center gap-1.5 ${d ? "text-violet-400 hover:text-violet-300" : "text-violet-600 hover:text-violet-700"} transition`}
            >
              عرض كل الإشعارات
              <ChevronLeft className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
