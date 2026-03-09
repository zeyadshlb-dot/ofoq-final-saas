"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = "success") => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 4s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast Render Container */}
      <div className="fixed top-28 left-1/2 transform -translate-x-1/2 z-[300] flex flex-col items-center gap-3 w-full max-w-sm px-4 pointer-events-none transition-all">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`
              pointer-events-auto flex items-center justify-between w-full px-5 py-3.5 rounded-2xl shadow-2xl transition-all duration-300 animate-[bounceIn_0.4s_ease-out_forwards] backdrop-blur-md border border-white/20
              ${t.type === "success" ? "bg-primary text-white" : "bg-red-500/90 text-white"}
            `}
            dir="rtl"
          >
            <div className="flex items-center gap-3">
              {t.type === "success" ? (
                <div className="bg-white/20 rounded-full p-1">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              ) : (
                <div className="bg-white/20 rounded-full p-1">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              )}
              <span className="font-bold text-sm tracking-wide">
                {t.message}
              </span>
            </div>

            <button
              onClick={() =>
                setToasts((prev) => prev.filter((x) => x.id !== t.id))
              }
              className="opacity-60 hover:opacity-100 transition-opacity p-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes bounceIn {
          0% { opacity: 0; transform: translateY(-20px) scale(0.9); }
          50% { opacity: 1; transform: translateY(5px) scale(1.02); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `,
        }}
      />
    </ToastContext.Provider>
  );
}
