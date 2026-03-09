"use client";

import Link from "next/link";
import React, { useRef, useState, useEffect } from "react";
import CourseCard from "@/components/CourseCard";

function Reveal({ children, className = "", delay = 0, direction = "up" }) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setV(true);
      },
      { threshold: 0.1 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const dirs = {
    up: "translateY(50px)",
    left: "translateX(50px)",
    right: "translateX(-50px)",
  };
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: v ? 1 : 0,
        transform: v ? "translate(0,0)" : dirs[direction],
        transition: `all 0.8s cubic-bezier(.16,1,.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

export default function SuggestedCourses({
  theme,
  courses = [],
  title,
  subtitle,
}) {
  const sliderRef = useRef(null);

  const scrollNext = () => {
    if (sliderRef.current) {
      // dir="rtl" means logical "next" is moving left (-) on screen physically
      sliderRef.current.scrollBy({ left: -350, behavior: "smooth" });
    }
  };

  const scrollPrev = () => {
    if (sliderRef.current) {
      // dir="rtl" means logical "prev" is moving right (+) on screen physically
      sliderRef.current.scrollBy({ left: 350, behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden mb-20 py-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0a0a0a] dark:to-[#111]">
      <div className="absolute inset-0 w-full h-full opacity-40 pointer-events-none">
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="dots_bg"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1.5" className="fill-primary/20" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots_bg)" />
        </svg>
      </div>

      {/* Decorative Blur — animated */}
      <div className="absolute -left-40 top-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] pointer-events-none courses-orb-float" />
      <div className="absolute -right-20 bottom-1/4 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none courses-orb-float-reverse" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-20">
          {/* Text Info */}
          <Reveal
            className="w-full lg:basis-1/3 text-center lg:text-right lg:sticky lg:top-24"
            delay={0.1}
            direction="right"
          >
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
              <div className="hidden lg:block w-2 h-14 bg-primary rounded-full"></div>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
                {title ? (
                  title
                ) : (
                  <>
                    الكورسات
                    <br className="hidden lg:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-secondary">
                      {" "}
                      المُقترحة
                    </span>
                  </>
                )}
              </h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
              {subtitle ||
                "استاذك رشحلك أفضل الكورسات اللي هتخليك تفرق عن باقي زمايلك. اجهز يا طالب لرحلة نجاحك على المنصة!"}
            </p>

            {/* Slider Navigation Buttons (Desktop) */}
            <div className="hidden lg:flex items-center gap-4 mb-8">
              <button
                onClick={scrollPrev}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-[#16181f] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-primary shadow-sm hover:text-white hover:border-primary transition-all duration-300 transform hover:scale-110 group focus:outline-none"
                aria-label="السابق"
              >
                <svg
                  className="w-6 h-6 rtl:rotate-180 group-hover:-translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={scrollNext}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-[#16181f] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-primary shadow-sm hover:text-white hover:border-primary transition-all duration-300 transform hover:scale-110 group focus:outline-none"
                aria-label="التالي"
              >
                <svg
                  className="w-6 h-6 rtl:rotate-180 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            <Link
              href="/courses"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-l from-primary to-secondary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/40 transition-all hover:-translate-y-1 gap-2 group w-full sm:w-auto"
            >
              <span>استكشف المكتبة كاملة</span>
              <span className="group-hover:-translate-x-1 transition-transform">
                ←
              </span>
            </Link>
          </Reveal>

          {/* Slider Container */}
          <Reveal
            className="w-full lg:basis-2/3 relative group"
            delay={0.25}
            direction="left"
          >
            {/* Slider Navigation Buttons (Mobile/Tablet over the slider) */}
            <div className="flex lg:hidden justify-between items-center mb-4 px-2">
              <button
                onClick={scrollPrev}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#16181f] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 shadow-sm focus:outline-none active:scale-95 transition-transform"
              >
                <svg
                  className="w-5 h-5 rtl:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={scrollNext}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#16181f] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 shadow-sm focus:outline-none active:scale-95 transition-transform"
              >
                <svg
                  className="w-5 h-5 rtl:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            <div className="bg-white/50 dark:bg-white/[0.02] p-4 md:p-8 rounded-[2rem] shadow-2xl border border-white dark:border-white/5 relative overflow-hidden backdrop-blur-xl">
              {/* Scrollable track */}
              <div
                ref={sliderRef}
                className="flex overflow-x-auto gap-6 hide-scroll snap-x snap-mandatory pb-8 pt-4 px-2 -mx-2 items-stretch scroll-smooth touch-pan-x"
                style={{ scrollPadding: "0 1rem" }}
              >
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="w-[300px] sm:w-[340px] md:w-[380px] lg:w-[400px] snap-center shrink-0 flex flex-col transition-opacity duration-300"
                  >
                    <CourseCard course={course} />
                  </div>
                ))}
              </div>

              {/* Gradient Fades indicating scrollability */}
              <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-gray-50/100 to-transparent dark:from-[#0a0a0a]/100 rounded-l-[2rem] pointer-events-none hidden md:block z-20"></div>
              <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-gray-50/100 to-transparent dark:from-[#0a0a0a]/100 rounded-r-[2rem] pointer-events-none hidden md:block z-20"></div>
            </div>
          </Reveal>
        </div>
      </div>

      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes courses-orb-kf { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-25px); } }
        @keyframes courses-orb-rev-kf { 0%,100% { transform:translateY(0); } 50% { transform:translateY(20px); } }
        .courses-orb-float { animation: courses-orb-kf 6s ease-in-out infinite; }
        .courses-orb-float-reverse { animation: courses-orb-rev-kf 5s ease-in-out infinite; }
      `}</style>
    </section>
  );
}
