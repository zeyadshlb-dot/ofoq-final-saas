"use client";

import { useEffect, useState } from "react";

export default function PWARegister() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("✅ SW registered:", reg.scope);
        })
        .catch((err) => console.error("SW registration failed:", err));
    }

    // Capture Install Prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      // Show banner only if not already installed
      if (!window.matchMedia("(display-mode: standalone)").matches) {
        setTimeout(() => setShowInstallBanner(true), 3000);
      }
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBanner(false);
    }
    setInstallPrompt(null);
  };

  if (!showInstallBanner) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-[200] flex items-center gap-3 bg-gradient-to-r from-primary to-secondary text-white p-4 rounded-2xl shadow-2xl animate-slide-up mx-auto max-w-md"
      dir="rtl"
      style={{ animation: "slideUp 0.4s ease-out" }}
    >
      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl shrink-0">
        📲
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-black text-sm">حمّل التطبيق على جهازك!</p>
        <p className="text-[11px] opacity-80 mt-0.5">وصول أسرع بدون متصفح</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstall}
          className="bg-white text-primary font-bold text-xs px-4 py-2 rounded-xl hover:bg-white/90 transition-all"
        >
          تثبيت
        </button>
        <button
          onClick={() => setShowInstallBanner(false)}
          className="text-white/60 hover:text-white text-lg"
        >
          ✕
        </button>
      </div>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
