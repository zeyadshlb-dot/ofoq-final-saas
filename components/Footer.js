"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ---------------------------------------------------------
// Helper: Get Icon based on platform name
// ---------------------------------------------------------
function SocialIcon({ platform }) {
  const iconClass = "w-6 h-6 text-white";
  switch (platform.toLowerCase()) {
    case "facebook":
      return (
        <svg
          className={iconClass}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "instagram":
      return (
        <svg
          className={iconClass}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "twitter":
      return (
        <svg
          className={iconClass}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      );
    case "youtube":
      return (
        <svg
          className={iconClass}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "telegram":
      return (
        <svg
          className={iconClass}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.18-.08-.04-.19-.02-.27 0l-3.85 2.42c-.52.36-1.04.53-1.52.52-.53-.01-1.55-.3-2.31-.55-.93-.3-1.67-.46-1.61-.97.03-.26.39-.53 1.07-.81 4.19-1.82 6.98-3.02 8.37-3.6.39-.17.76-.25 1.01-.25.26 0 .5.06.68.21.18.15.24.35.26.54z" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg
          className={iconClass}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12.01 2A10 10 0 0 0 2.22 17L1 22l5.18-1.17A10 10 0 1 0 12.01 2zm5.32 14.36c-.22.63-1.28 1.2-1.8 1.26-.45.06-1.05.1-3.23-.84-2.6-1.12-4.26-3.84-4.39-4.01-.13-.17-1.05-1.4-1.05-2.66 0-1.28.66-1.92.89-2.18.23-.26.5-.33.67-.33.16 0 .33.01.48.01.16 0 .38-.06.6.48.23.54.76 1.83.82 1.96.06.13.1.28.02.45-.08.16-.13.26-.26.42-.13.16-.28.35-.4.49-.13.15-.27.31-.12.57.15.26.66 1.1 1.42 1.78.98.88 1.81 1.15 2.07 1.28.26.13.41.11.57-.06.15-.18.66-.78.84-1.05.18-.26.36-.22.59-.13.23.09 1.46.69 1.72.82.26.13.43.2.49.3.06.11.06.63-.16 1.26z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg
          className={iconClass}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "tiktok":
      return (
        <svg
          className={iconClass}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.59-1.43 5.3-3.73 6.64-1.23.63-2.61.9-3.95.89-3.53-.04-6.8-2.65-7.51-6.13-.53-2.63.13-5.5 2.1-7.3 1.4-1.27 3.32-1.92 5.18-1.89h.1v4.06c-1.56.09-3.23.82-3.93 2.22-.59 1.18-.32 2.89.59 3.8.8.81 2.05 1.12 3.16.89 1.84-.4 2.8-2.29 2.82-4.14.04-5.32.01-10.63.02-15.95z" />
        </svg>
      );
    case "website":
      return (
        <svg
          className={iconClass}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
      );
    default:
      return (
        <svg
          className={iconClass}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            clipRule="evenodd"
          />
        </svg>
      );
  }
}

// ---------------------------------------------------------
// Main Footer Component
// ---------------------------------------------------------
export function Footer({ theme }) {
  const pathname = usePathname();

  // تأكد من إن الفوتر مش بيظهر في صفحات الداشبورد
  const isHiddenPage = pathname?.startsWith("/dashboard");

  if (isHiddenPage) return null;

  // تصفية السوشيال ميديا للروابط الشغالة بس
  const socialLinksObj = theme?.socialLinks || {};
  const activeSocials = Object.keys(socialLinksObj)
    .map((key) => ({
      platform: key,
      url: socialLinksObj[key],
    }))
    .filter((s) => s.url && s.url.trim() !== "");

  // لاستخدام رابط الواتساب أو التليجرام لزرار الدعم العائم
  const supportLink = socialLinksObj.whatsapp || socialLinksObj.telegram || "#";

  return (
    <>
      <footer
        className="relative bg-primary overflow-hidden mt-12 py-14"
        dir="rtl"
      >
        {/* الطبقة الغامقة (Dark Overlay) لعمل لون أغمق من اللون الرئيسي تماشياً مع طلبك */}
        <div className="absolute inset-0 bg-black/50 dark:bg-black/80 mix-blend-multiply pointer-events-none"></div>

        {/* Animation Pattern in Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden flex items-center justify-center">
          <div className="w-[800px] h-[800px] border-[40px] border-white/20 rounded-full animate-[spin_60s_linear_infinite]"></div>
          <div className="absolute w-[600px] h-[600px] border-[20px] border-white/20 rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex w-full pb-10 justify-between items-center sm:items-stretch flex-col-reverse md:flex-row gap-14 border-b border-white/10">
            {/* اللوجو والمعلومات */}
            <div className="flex-1 w-full flex flex-col md:flex-row gap-10">
              <div className="basis-full md:basis-1/2 flex flex-col gap-6 items-center justify-center group">
                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/5 shadow-2lg transform group-hover:scale-105 transition-all duration-500">
                  {theme?.logo ? (
                    <img
                      src={theme.logo}
                      alt="Footer Logo"
                      className="max-w-[150px] md:max-w-[200px] max-h-24 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all duration-300"
                    />
                  ) : (
                    <h2 className="text-3xl font-black text-white">
                      {theme?.platformName}
                    </h2>
                  )}
                </div>
                <p className="text-center text-lg lg:text-xl font-bold text-white/90 leading-relaxed max-w-sm">
                  {theme?.platformName} <br />
                  <span className="text-white/70 text-base font-medium">
                    متخصصة لطلابنا الساعين للتفوق والنجاح المستمر.
                  </span>
                </p>
              </div>

              {/* التواصل والسوشيال ميديا */}
              <div className="basis-full md:basis-1/2 flex flex-col items-center justify-center gap-5">
                <p className="text-secondary/90 font-bold px-4 py-1.5 bg-secondary/10 border border-secondary/20 rounded-full">
                  متنساش تتابعنا وتتواصل معانا من خلال :
                </p>

                {activeSocials.length > 0 ? (
                  <div className="flex gap-4 sm:gap-6 justify-center w-full flex-wrap">
                    {activeSocials.map((social) => (
                      <a
                        key={social.platform}
                        href={social.url}
                        target="_blank"
                        rel="noreferrer"
                        className="relative w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white border border-white/20 hover:border-white shadow-lg transition-all duration-500 group overflow-hidden"
                      >
                        {/* Hover Animation Effect inside button */}
                        <div className="absolute inset-0 translate-y-full group-hover:translate-y-0 bg-gradient-to-t from-white/20 to-white/80 transition-transform duration-300 ease-out"></div>
                        <span className="relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:text-primary">
                          <SocialIcon platform={social.platform} />
                        </span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/50 text-sm">
                    لم يتم إضافة روابط تواصل بعد.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* حقوق الملكية التابعة لأفق */}
          <div className="mt-8 pt-4 flex flex-col items-center gap-2">
            <div className="text-center space-x-2 space-x-reverse opacity-90 px-5 flex flex-wrap justify-center items-center gap-1.5 text-sm sm:text-base">
              <span className="font-bold space-x-1 space-x-reverse">
                <span className="text-secondary">&lt;</span>
                <span className="text-white/80">Developed By</span>
                <span className="text-secondary">&gt;</span>
              </span>
              <span>
                <a
                  href="https://ofoq.com/"
                  target="_blank"
                  className="bg-black/30 hover:bg-black/50 hover:-translate-y-0.5 shadow-md transition-all px-3 py-1.5 rounded-lg text-white font-black tracking-widest border border-white/10 mx-1"
                >
                  OFOQ
                </a>
              </span>
              <span className="font-bold space-x-1 space-x-reverse">
                <span className="text-secondary">&lt;</span>
                <span className="text-white/80">
                  All Copy Rights Reserved @{new Date().getFullYear()}
                </span>
                <span className="text-secondary">&gt;</span>
              </span>
            </div>

            
          </div>
        </div>
      </footer>

      {/* =========================================
          Floating Support Button 
          ========================================= */}
      <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 flex-row-reverse group font-sans">
        {/* Tooltip Popup */}
        <div
          className="
            px-4 py-2.5 rounded-xl text-sm font-bold shadow-2xl pointer-events-none
            bg-white text-gray-900 border border-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-700
            transform -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]
          "
        >
          تواصل مع الدعم الفني هنا
        </div>

        {/* Floating Button */}
        <a
          href={supportLink}
          target="_blank"
          rel="noreferrer"
          className="relative w-[60px] h-[60px] flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 hover:-translate-y-1 hover:scale-105"
        >
          {/* Waves Ripple Effect */}
          <span className="absolute inset-0 rounded-2xl border-2 border-primary animate-ping opacity-25"></span>

          <svg
            className="w-8 h-8 text-white z-10"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12.01 2A10 10 0 0 0 2.22 17L1 22l5.18-1.17A10 10 0 1 0 12.01 2zm5.32 14.36c-.22.63-1.28 1.2-1.8 1.26-.45.06-1.05.1-3.23-.84-2.6-1.12-4.26-3.84-4.39-4.01-.13-.17-1.05-1.4-1.05-2.66 0-1.28.66-1.92.89-2.18.23-.26.5-.33.67-.33.16 0 .33.01.48.01.16 0 .38-.06.6.48.23.54.76 1.83.82 1.96.06.13.1.28.02.45-.08.16-.13.26-.26.42-.13.16-.28.35-.4.49-.13.15-.27.31-.12.57.15.26.66 1.1 1.42 1.78.98.88 1.81 1.15 2.07 1.28.26.13.41.11.57-.06.15-.18.66-.78.84-1.05.18-.26.36-.22.59-.13.23.09 1.46.69 1.72.82.26.13.43.2.49.3.06.11.06.63-.16 1.26z" />
          </svg>
        </a>
      </div>
    </>
  );
}
