"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ── Scroll Reveal ───────────────────────────────────────────────── */
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
    down: "translateY(-50px)",
    left: "translateX(50px)",
    right: "translateX(-50px)",
  };
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: v ? 1 : 0,
        transform: v
          ? "translate(0,0) scale(1)"
          : `${dirs[direction]} scale(0.97)`,
        transition: `all 0.8s cubic-bezier(.16,1,.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

export default function YearsSection({ theme, stages = [] }) {
  const STYLE_MAP = [
    {
      color: "from-blue-500 to-cyan-400",
      icon: (
        <svg
          className="w-10 h-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
    {
      color: "from-violet-500 to-purple-400",
      icon: (
        <svg
          className="w-10 h-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      ),
    },
    {
      color: "from-orange-500 to-amber-400",
      icon: (
        <svg
          className="w-10 h-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M12 14l9-5-9-5-9 5 9 5z" />
          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
          />
        </svg>
      ),
    },
    {
      color: "from-emerald-500 to-teal-400",
      icon: (
        <svg
          className="w-10 h-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
  ];

  // Map DB stages directly to our UI style map.
  const displayStages =
    stages?.length > 0
      ? stages.map((stage, idx) => ({
          id: stage.id,
          title: stage.name,
          description:
            stage.short_description ||
            "محتوى متكامل يشمل الشرح والواجبات والمتابعة.",
          num: `0${idx + 1}`.slice(-2),
          image: stage.image_path
            ? stage.image_path.startsWith("http")
              ? stage.image_path
              : stage.full_image_url
            : null,
          ...STYLE_MAP[idx % STYLE_MAP.length],
        }))
      : [];

  return (
    <section className="py-24 relative bg-white dark:bg-[#0a0a0a] overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent"></div>

      {/* Subtle floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/10 dark:bg-primary/5 rounded-full years-particle"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${4 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Title */}
        <Reveal delay={0.1}>
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-2 h-10 md:h-12 bg-primary rounded-full hidden sm:block years-bar-grow"></div>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white">
                جميع{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  السنوات الدراسية
                </span>
              </h2>
              <div className="w-2 h-10 md:h-12 bg-primary rounded-full hidden sm:block years-bar-grow"></div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-lg mt-4 max-w-lg mx-auto">
              اختر مرحلتك الدراسية وابدأ مسيرة التفوق والنجاح مع أقوى الكورسات
              المخصصة لك.
            </p>
          </div>
        </Reveal>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {displayStages.map((year, idx) => (
            <Reveal key={year.id} delay={0.15 + idx * 0.15}>
              <Link
                href={`/years/${year.id}`}
                className="group block relative h-full"
              >
                {/* Background Glow */}
                <div
                  className={`absolute -inset-0.5 bg-gradient-to-r ${year.color} rounded-[2rem] blur opacity-0 group-hover:opacity-30 dark:group-hover:opacity-20 transition duration-500`}
                ></div>

                {/* Card Content */}
                <div className="relative bg-gray-50 dark:bg-[#111] p-6 lg:p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 h-full flex flex-col items-center text-center shadow-lg group-hover:-translate-y-3 transition-all duration-400 years-card-tilt">
                  {/* Large faded number */}
                  <span className="absolute top-4 right-6 text-7xl font-black text-gray-100 dark:text-white/[0.03] select-none pointer-events-none group-hover:text-primary/10 transition-colors duration-500 z-10">
                    {year.num}
                  </span>

                  {/* Image Container */}
                  {year.image && (
                    <div className="w-full aspect-video rounded-2xl overflow-hidden mb-8 shadow-sm relative group-hover:shadow-md transition-all duration-500">
                      <div
                        className={`absolute inset-0 bg-gradient-to-t opacity-10 group-hover:opacity-0 transition-opacity duration-500 ${year.color} z-10 mix-blend-multiply dark:mix-blend-screen`}
                      ></div>
                      <img
                        src={year.image}
                        alt={year.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                  )}

                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 group-hover:text-primary transition-colors duration-300 z-10 mt-auto">
                    {year.title}
                  </h3>

                  <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-6">
                    {year.description}
                  </p>

                  {/* Animated Arrow */}
                  <div className="mt-auto flex items-center gap-2 text-sm font-bold text-primary opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400">
                    <span>ابدأ الدراسة</span>
                    <span className="group-hover:-translate-x-2 transition-transform duration-300">
                      ←
                    </span>
                  </div>

                  {/* Bottom gradient line */}
                  <div
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-0 group-hover:w-3/4 bg-gradient-to-r ${year.color} rounded-full transition-all duration-500`}
                  ></div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes years-particle-kf { 0%,100% { transform:translateY(0) scale(1); opacity:.5; } 50% { transform:translateY(-30px) scale(1.5); opacity:1; } }
        @keyframes years-bar-grow-kf { from { height:0; opacity:0; } to { height:3rem; opacity:1; } }
        .years-particle  { animation: years-particle-kf 4s ease-in-out infinite; }
        .years-bar-grow   { animation: years-bar-grow-kf 0.8s 0.3s both; }
        .years-card-tilt  { transition: transform 0.4s cubic-bezier(.16,1,.3,1), box-shadow 0.4s ease; }
        .years-card-tilt:hover { transform: translateY(-12px) rotate(-0.5deg); }
      `}</style>
    </section>
  );
}
