"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export function InstallPwaModal({ theme }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const platformName = theme?.platformName || "أكاديميتنا";
  const logo = theme?.logo || "/favicon.ico";

  useEffect(() => {
    const isDismissed = localStorage.getItem("pwa_install_dismissed");

    // Register Service Worker for PWA support
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch((err) => {
          console.error("Service Worker registration failed: ", err);
        });
      });
    }

    const handler = (e) => {
      // Prevent the default mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      if (!isDismissed) {
        setShowModal(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowModal(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowModal(false);
    localStorage.setItem("pwa_install_dismissed", "true");
  };

  if (!showModal) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:bottom-8 md:right-8 md:left-auto md:w-[24rem] z-[8000] animate-[slideUp_0.5s_cubic-bezier(0.16,1,0.3,1)]">
      <div
        className="bg-white/95 dark:bg-[#141625]/95 backdrop-blur-2xl border border-gray-200/50 dark:border-white/10 p-5 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col gap-5 relative overflow-hidden"
        dir="rtl"
      >
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] pointer-events-none rounded-full shrink-0 -translate-y-1/2 translate-x-1/2"></div>

        <button
          onClick={handleDismiss}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-gray-100 dark:bg-white/5 p-1.5 rounded-full z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-[1.2rem] bg-white shadow-lg border border-gray-100/50 overflow-hidden shrink-0 flex items-center justify-center p-2">
            <img
              src={logo}
              alt={platformName}
              className="w-full h-full object-contain drop-shadow-sm"
            />
          </div>
          <div className="pt-1">
            <h3 className="font-black text-gray-900 dark:text-white text-lg tracking-tight leading-tight mb-1">
              {platformName}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-[11px] font-bold">
              ثبت التطبيق لتجربة أسرع وأفضل وتنبيهات فورية.
            </p>
          </div>
        </div>

        <button
          onClick={handleInstall}
          className="w-full py-4 rounded-2xl font-black text-white shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 overflow-hidden relative group"
          style={{ backgroundColor: "var(--primary, #8b5cf6)" }}
        >
          <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1s_forwards]"></div>
          <Download className="w-5 h-5" />
          تثبيت التطبيق الآن
        </button>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `,
        }}
      />
    </div>
  );
}
