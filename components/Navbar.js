"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar({ theme, domain }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [studentBalance, setStudentBalance] = useState(null);
  const pathname = usePathname();

  // Check login state and fetch balance
  useEffect(() => {
    async function checkAuthAndBalance() {
      const token = localStorage.getItem("student_token");
      if (token) {
        setIsLoggedIn(true);
        try {
          // Fetch balance
          const res = await fetch("/api/v1/student/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            setStudentBalance(data.balance || 0);
          } else {
            // Optional: Handle invalid token
          }
        } catch (err) {
          console.error("Failed to fetch balance for header", err);
        }
      } else {
        setIsLoggedIn(false);
        setStudentBalance(null);
      }
    }
    checkAuthAndBalance();
  }, [pathname]);

  // تأكد من إن الناف بار مش بيظهر في صفحات الداشبورد
  const isHiddenPage = pathname?.startsWith("/dashboard");

  // شريط التقدم عند التمرير (Scroll Progress Bar)
  useEffect(() => {
    if (isHiddenPage) return;

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      if (windowHeight > 0) {
        const scroll = totalScroll / windowHeight;
        setScrollProgress(scroll * 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHiddenPage]);

  // منع التمرير عند فتح المنيو في الموبايل
  useEffect(() => {
    if (isHiddenPage) return;

    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen, isHiddenPage]);

  if (isHiddenPage) return null;

  return (
    <>
      {/* 
        زدنا الـ z-index لـ z-[100] عشان الناف بار يفضل فوووووق كل العناصر في المنصة
        حتى لو في كروت او عناصر واخده زِد اندكس عالي.
      */}
      <nav
        className="fixed top-0 left-0 right-0 z-[100] h-[72px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-100/50 dark:border-gray-800/50 transition-colors duration-500 shadow-sm"
        dir="rtl"
      >
        <div className="relative h-full">
          {/* Progress Bar Track & Moving */}
          <div
            className={`absolute inset-x-0 -bottom-[1px] bg-secondary/10 dark:bg-secondary/20 transition-all duration-300 ease-in-out h-[3px] transform ${
              scrollProgress > 0
                ? "translate-y-0 opacity-100"
                : "-translate-y-2 opacity-0"
            }`}
          >
            <div
              className="bg-primary h-full right-0 absolute transition-all duration-100 ease-out rounded-l-full"
              style={{ width: `${scrollProgress}%` }}
            ></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
            {/* RTL Layout: Logo on Right (start), Links on Left (end) */}
            <div className="flex items-center justify-between h-full">
              {/* === Mobile Menu Button (Right Side on Mobile) === */}
              <div className="flex items-center md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="inline-flex items-center justify-center p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary text-gray-700 dark:text-gray-300 transition-colors duration-300 ease-in-out hover:bg-primary/10 hover:text-primary"
                  type="button"
                >
                  <span className="sr-only">فتح القائمة الرئيسية</span>
                  <div className="flex flex-col gap-[5px] w-6">
                    <span className="h-0.5 w-full bg-current rounded-full"></span>
                    <span className="h-0.5 w-full bg-current rounded-full"></span>
                    <span className="h-0.5 w-full bg-current rounded-full"></span>
                  </div>
                </button>
              </div>

              {/* === Brand Logo (Right Side / Start) === */}
              <div className="flex-shrink-0 flex items-center h-full py-1.5 z-10">
                <Link
                  href="/"
                  className="h-full flex items-center justify-center group"
                >
                  {theme?.logo ? (
                    <img
                      className="h-10 sm:h-12 w-auto object-contain drop-shadow-sm transform group-hover:scale-105 transition-transform duration-500"
                      src={theme.logo}
                      alt={theme.platformName || "Platform Logo"}
                    />
                  ) : (
                    <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-linear-to-l from-primary to-secondary drop-shadow-sm">
                      {theme?.platformName || domain}
                    </span>
                  )}
                </Link>
              </div>

              {/* === Mobile Elements (Left Side on Mobile) === */}
              <div className="flex items-center gap-2 sm:gap-3 md:hidden">
                <ThemeToggle />
                <div className="text-xl flex items-center justify-center group cursor-pointer text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">
                  <span className="flex items-center justify-center transform group-hover:bg-primary/10 rounded-xl p-2 transition-all duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      role="img"
                      width="1.2em"
                      height="1.2em"
                      preserveAspectRatio="xMidYMid meet"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14"
                      ></path>
                    </svg>
                  </span>
                </div>
              </div>

              {/* === Desktop Navigation & Actions (Left Side / End) === */}
              <div className="hidden md:flex items-center gap-6 z-10">
                {/* Desktop Search */}
                <div className="flex items-center">
                  <div className="flex items-center gap-2 group cursor-pointer text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors bg-gray-100/50 dark:bg-gray-800/50 hover:bg-primary/5 rounded-full px-2 py-1.5 border border-transparent hover:border-primary/20">
                    <span className="flex items-center justify-center transform rounded-full p-1.5 transition-transform duration-500 group-hover:rotate-90">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        role="img"
                        width="1.2em"
                        height="1.2em"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14"
                        ></path>
                      </svg>
                    </span>
                    <div className="overflow-hidden relative text-sm font-bold w-0 group-hover:w-[110px] transition-all duration-500 ease-out whitespace-nowrap">
                      <div className="pr-1 text-primary">ابحث في المنصة</div>
                    </div>
                  </div>
                </div>

                <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 hidden lg:block"></div>

                <div className="flex items-center gap-3 lg:gap-4">
                  {isLoggedIn ? (
                    <>
                      <Link
                        href="/panel/wallet"
                        className="relative overflow-hidden px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 group hover:-translate-y-0.5"
                      >
                        <span className="flex items-center justify-center gap-1.5 z-10">
                          <span className="text-lg">💰</span>
                          {studentBalance !== null ? (
                            <span dir="ltr">{studentBalance} EGP</span>
                          ) : (
                            <div className="w-8 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          )}
                        </span>
                      </Link>

                      <Link
                        href="/panel"
                        className="relative overflow-hidden px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 border-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white group hover:-translate-y-0.5"
                      >
                        <span className="flex items-center justify-center gap-2 z-10">
                          <span>لوحة التحكم</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      </Link>
                    </>
                  ) : (
                    <>
                      {/* Login Button with Hover Translation */}
                      <Link
                        href="/login"
                        className="relative overflow-hidden px-5 lg:px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 ease-out flex items-center gap-2 border-2 border-primary/20 bg-background/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 hover:bg-primary/5 hover:border-primary/50 group hover:-translate-y-0.5"
                      >
                        <span className="flex items-center justify-center gap-1 z-10">
                          <span>تسجيل</span>
                          <span className="text-primary font-black">
                            الدخول
                          </span>
                        </span>
                        <span className="flex items-center justify-center text-primary text-xl transform group-hover:-translate-x-1.5 transition-transform duration-300 z-10">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                            role="img"
                            width="1.2em"
                            height="1.2em"
                            viewBox="0 0 24 24"
                          >
                            <g fill="none">
                              <path
                                fill="currentColor"
                                fillRule="evenodd"
                                d="M10.138 1.815A3 3 0 0 1 14 4.688v14.624a3 3 0 0 1-3.862 2.873l-6-1.8A3 3 0 0 1 2 17.512V6.488a3 3 0 0 1 2.138-2.873zM15 4a1 1 0 0 1 1-1h3a3 3 0 0 1 3 3v1a1 1 0 1 1-2 0V6a1 1 0 0 0-1-1h-3a1 1 0 0 1-1-1m6 12a1 1 0 0 1 1 1v1a3 3 0 0 1-3 3h-3a1 1 0 1 1 0-2h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1M9 11a1 1 0 1 0 0 2h.001a1 1 0 1 0 0-2z"
                                clipRule="evenodd"
                              ></path>
                              <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M21 12h-5m0 0l2-2m-2 2l2 2"
                              ></path>
                            </g>
                          </svg>
                        </span>
                      </Link>

                      {/* Sign Up Button with Sweep Shine Effect */}
                      <Link
                        href="/register"
                        className="relative overflow-hidden px-5 lg:px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 ease-out flex items-center gap-2 bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 group hover:-translate-y-0.5 hover:ring-2 ring-primary/50 ring-offset-2 dark:ring-offset-slate-900"
                      >
                        {/* Sweep Shine Animation */}
                        <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-[150%] skew-x-[-30deg] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out"></span>

                        <span className="relative z-10 flex items-center justify-center">
                          انشئ حسابك !
                        </span>
                        <span className="relative z-10 flex items-center justify-center text-xl text-white group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                            role="img"
                            width="1.2em"
                            height="1.2em"
                            viewBox="0 0 256 256"
                          >
                            <g fill="currentColor">
                              <path
                                d="M208 32H64a8 8 0 0 0-8 8v176a8 8 0 0 0 8 8h144a8 8 0 0 0 8-8V40a8 8 0 0 0-8-8m-72 112a32 32 0 1 1 32-32a32 32 0 0 1-32 32"
                                opacity=".2"
                              ></path>
                              <path d="M83.19 174.4a8 8 0 0 0 11.21-1.6a52 52 0 0 1 83.2 0a8 8 0 1 0 12.8-9.6a67.9 67.9 0 0 0-27.4-21.69a40 40 0 1 0-53.94 0A67.9 67.9 0 0 0 81.6 163.2a8 8 0 0 0 1.59 11.2M112 112a24 24 0 1 1 24 24a24 24 0 0 1-24-24m96-88H64a16 16 0 0 0-16 16v24H32a8 8 0 0 0 0 16h16v40H32a8 8 0 0 0 0 16h16v40H32a8 8 0 0 0 0 16h16v24a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V40a16 16 0 0 0-16-16m0 192H64V40h144Z"></path>
                            </g>
                          </svg>
                        </span>
                      </Link>
                    </>
                  )}
                </div>

                <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 hidden lg:block mx-1"></div>

                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 
        This div is a spacer to ensure the content doesn't hide behind the fixed navbar.
        It perfectly matches the h-[72px] of the navbar.
      */}
      <div className="h-[72px] w-full relative z-30 bg-transparent transition-colors duration-500"></div>

      {/* =========================================
          Mobile Menu Overlay & Drawer (Animated)
          ========================================= */}

      {/* 1. Backdrop Overlay */}
      <div
        className={`fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      {/* 2. Side Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-[120] w-[80%] max-w-sm bg-primary border-l border-white/10 shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] md:hidden flex flex-col ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        dir="rtl"
      >
        {/* Header inside drawer */}
        <div className="flex items-center justify-between p-6 border-b border-black/10 dark:border-white/10">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3"
          >
            {theme?.logo ? (
              <img
                className="h-10 w-auto object-contain drop-shadow-md brightness-0 invert"
                src={theme.logo}
                alt={theme.platformName || "Platform Logo"}
              />
            ) : (
              <span className="text-2xl font-black text-white drop-shadow-md">
                {theme?.platformName || domain}
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-white/90 hover:text-white hover:bg-black/10 rounded-full transition-colors flex items-center justify-center"
          >
            <span className="sr-only">إغلاق القائمة</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Links & CTA inside drawer */}
        <div className="flex flex-col gap-5 p-8 flex-grow overflow-y-auto">
          <div className="space-y-4 pt-4 border-t border-black/10 dark:border-white/10 mt-auto">
            {isLoggedIn ? (
              <>
                <Link
                  href="/panel/wallet"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between gap-2 p-4 rounded-xl text-lg font-bold text-white bg-white/10 hover:bg-white/20 transition-colors w-full border border-white/10"
                >
                  <div className="flex items-center gap-2">
                    <span>💰</span>
                    <span>المحفظة</span>
                  </div>
                  {studentBalance !== null ? (
                    <span dir="ltr">{studentBalance} EGP</span>
                  ) : (
                    <div className="w-12 h-6 bg-white/20 rounded animate-pulse"></div>
                  )}
                </Link>
                <Link
                  href="/panel"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 p-4 rounded-xl text-lg font-bold text-primary bg-white hover:bg-gray-50 transition-colors w-full shadow-lg"
                >
                  <span>لوحة التحكم</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 p-4 rounded-xl text-lg font-bold text-primary bg-white hover:bg-gray-50 transition-colors w-full shadow-lg"
                >
                  <span>تسجيل الدخول</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    width="1.2em"
                    height="1.2em"
                    viewBox="0 0 24 24"
                  >
                    <g fill="none">
                      <path
                        fill="currentColor"
                        fillRule="evenodd"
                        d="M10.138 1.815A3 3 0 0 1 14 4.688v14.624a3 3 0 0 1-3.862 2.873l-6-1.8A3 3 0 0 1 2 17.512V6.488a3 3 0 0 1 2.138-2.873zM15 4a1 1 0 0 1 1-1h3a3 3 0 0 1 3 3v1a1 1 0 1 1-2 0V6a1 1 0 0 0-1-1h-3a1 1 0 0 1-1-1m6 12a1 1 0 0 1 1 1v1a3 3 0 0 1-3 3h-3a1 1 0 1 1 0-2h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1M9 11a1 1 0 1 0 0 2h.001a1 1 0 1 0 0-2z"
                        clipRule="evenodd"
                      ></path>
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 12h-5m0 0l2-2m-2 2l2 2"
                      ></path>
                    </g>
                  </svg>
                </Link>

                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 p-4 rounded-xl text-lg font-bold text-white border-2 border-white/30 hover:bg-black/10 transition-colors w-full"
                >
                  <span>انشئ حسابك !</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    width="1.2em"
                    height="1.2em"
                    viewBox="0 0 256 256"
                  >
                    <g fill="currentColor">
                      <path
                        d="M208 32H64a8 8 0 0 0-8 8v176a8 8 0 0 0 8 8h144a8 8 0 0 0 8-8V40a8 8 0 0 0-8-8m-72 112a32 32 0 1 1 32-32a32 32 0 0 1-32 32"
                        opacity=".2"
                      ></path>
                      <path d="M83.19 174.4a8 8 0 0 0 11.21-1.6a52 52 0 0 1 83.2 0a8 8 0 1 0 12.8-9.6a67.9 67.9 0 0 0-27.4-21.69a40 40 0 1 0-53.94 0A67.9 67.9 0 0 0 81.6 163.2a8 8 0 0 0 1.59 11.2M112 112a24 24 0 1 1 24 24a24 24 0 0 1-24-24m96-88H64a16 16 0 0 0-16 16v24H32a8 8 0 0 0 0 16h16v40H32a8 8 0 0 0 0 16h16v40H32a8 8 0 0 0 0 16h16v24a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V40a16 16 0 0 0-16-16m0 192H64V40h144Z"></path>
                    </g>
                  </svg>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
