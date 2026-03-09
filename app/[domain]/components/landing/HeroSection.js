"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ── Scroll-triggered reveal ────────────────────────────────────── */
function Reveal({ children, className = "", delay = 0, direction = "up" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const dirs = {
    up: "translateY(40px)",
    down: "translateY(-40px)",
    left: "translateX(40px)",
    right: "translateX(-40px)",
  };
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate(0,0)" : dirs[direction],
        transition: `opacity 0.7s cubic-bezier(.16,1,.3,1) ${delay}s, transform 0.7s cubic-bezier(.16,1,.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

export default function HeroSection({ theme, studentName }) {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  const handleMouseMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setMouseX(((e.clientX - r.left) / r.width - 0.5) * 30);
    setMouseY(((e.clientY - r.top) / r.height - 0.5) * 30);
  };

  return (
    <section
      className="relative overflow-hidden mb-10 min-h-[calc(100vh-80px)] flex flex-col justify-center bg-gray-50 dark:bg-[#0a0a0a]"
      onMouseMove={handleMouseMove}
    >
      {/* Decorative Background Elements — parallax on mouse */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/10 rounded-full blur-[100px]"
          style={{
            transform: `translate(${mouseX * 0.3}px, ${mouseY * 0.3}px)`,
            transition: "transform 1s ease-out",
          }}
        />
        <div
          className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-secondary/10 rounded-full blur-[100px]"
          style={{
            transform: `translate(${mouseX * -0.2}px, ${mouseY * -0.2}px)`,
            transition: "transform 1s ease-out",
          }}
        />
        {/* Extra subtle orb */}
        <div
          className="absolute top-[40%] left-[40%] w-64 h-64 bg-primary/5 rounded-full blur-[80px]"
          style={{
            transform: `translate(${mouseX * 0.15}px, ${mouseY * 0.15}px)`,
            transition: "transform 1.2s ease-out",
          }}
        />
      </div>

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.04] dark:opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 py-12 md:py-20">
        <div className="flex flex-col-reverse md:flex-row items-center gap-12 md:gap-8 justify-between h-full">
          {/* Content */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-right space-y-8">
            {/* Logo or Platform Name */}
            <Reveal delay={0.1}>
              <div className="mb-2">
                {theme?.logo ? (
                  <img
                    src={theme.logo}
                    alt={theme.platformName || "شعار المنصة"}
                    className="h-20 md:h-28 object-contain dark:brightness-200 transition-all duration-300"
                  />
                ) : (
                  <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tight">
                    {theme?.platformName || "أستاذي"}
                  </h1>
                )}
              </div>
            </Reveal>

            {/* Main Headline */}
            <Reveal delay={0.25}>
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-tight">
                  {studentName ? (
                    <>
                      أهلاً بك يا بطل،{" "}
                      <span className="hero-gradient-text text-transparent bg-clip-text bg-gradient-to-l from-primary to-secondary block mt-2 text-3xl md:text-5xl">
                        {studentName}
                      </span>
                    </>
                  ) : (
                    <>
                      هنا تبدأ حكايتك{" "}
                      <span className="hero-gradient-text text-transparent bg-clip-text bg-gradient-to-l from-primary to-secondary block mt-2">
                        نحـو التفـوق...
                      </span>
                    </>
                  )}
                </h2>
                <p className="text-2xl md:text-3xl text-gray-600 dark:text-gray-300 font-bold mt-4">
                  فهمًا، <span className="text-secondary">إتقانًا،</span>{" "}
                  ونجاحًا
                </p>
              </div>
            </Reveal>

            {/* CTAs */}
            <Reveal delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-4 w-full pt-4 md:w-auto">
                {!studentName && (
                  <Link
                    href="/register"
                    className="hero-btn-primary group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 text-lg relative overflow-hidden"
                  >
                    {/* Shimmer sweep on hover */}
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <span className="relative z-10">انضم لينا الآن</span>
                    <svg
                      className="w-5 h-5 relative z-10 group-hover:-translate-x-1 transition-transform duration-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                  </Link>
                )}
                <Link
                  href={studentName ? "/panel" : "/courses"}
                  className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-primary/10 text-primary dark:bg-white/5 dark:text-white border border-primary/20 dark:border-white/10 font-bold rounded-xl hover:bg-primary/20 dark:hover:bg-white/10 transition-all duration-300 text-lg"
                >
                  <span>
                    {studentName ? "انتقل للوحة التحكم" : "استكشف الكورسات"}
                  </span>
                  <svg
                    className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300"
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
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Hero Image */}
          <Reveal
            className="flex-1 flex justify-center items-center w-full max-w-lg md:max-w-none"
            delay={0.15}
            direction="left"
          >
            <div className="relative w-full aspect-square md:aspect-[4/3] flex items-center justify-center">
              {/* Glow Behind Image */}
              <div className="absolute inset-4 bg-gradient-to-tr from-primary/30 to-secondary/30 rounded-[3rem] rotate-3 blur-2xl -z-10 hero-glow-pulse" />

              {/* Rotating dashed ring */}
              <div className="absolute inset-2 md:inset-0 rounded-full border border-dashed border-primary/10 dark:border-primary/5 hero-spin pointer-events-none" />

              {theme?.heroImage ? (
                <img
                  src={theme.heroImage}
                  alt="Hero"
                  className="w-full h-full object-contain relative z-10 drop-shadow-2xl hero-float"
                  style={{
                    filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.15))",
                    transform: `perspective(800px) rotateY(${-mouseX * 0.3}deg) rotateX(${mouseY * 0.3}deg)`,
                    transition: "transform 0.5s ease-out",
                  }}
                />
              ) : (
                <div
                  className="w-full h-full bg-gradient-to-tr from-gray-200 to-gray-100 dark:from-white/5 dark:to-white/10 rounded-[3rem] border border-white/20 shadow-2xl flex items-center justify-center relative z-10 hero-float"
                  style={{
                    transform: `perspective(800px) rotateY(${-mouseX * 0.2}deg) rotateX(${mouseY * 0.2}deg)`,
                    transition: "transform 0.5s ease-out",
                  }}
                >
                  <span className="text-gray-400 dark:text-gray-600 font-bold text-2xl">
                    صورة المعلم / المنصة
                  </span>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 hero-fade-in-late">
        <span className="text-xs text-gray-400 dark:text-gray-600 tracking-widest font-medium">
          اكتشف أكثر
        </span>
        <div className="w-6 h-10 rounded-full border border-gray-300 dark:border-white/10 flex justify-center pt-2">
          <div className="w-1 h-2 bg-primary rounded-full hero-scroll-dot" />
        </div>
      </div>

      <style>{`
        @keyframes hero-float-kf     { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-15px); } }
        @keyframes hero-glow-kf      { 0%,100% { opacity:.5; transform:scale(1) rotate(3deg); } 50% { opacity:.8; transform:scale(1.05) rotate(3deg); } }
        @keyframes hero-spin-kf      { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes hero-scroll-kf    { 0%,100% { transform:translateY(0); opacity:1; } 50% { transform:translateY(12px); opacity:0; } }
        @keyframes hero-fadein-kf    { from { opacity:0; } to { opacity:1; } }

        .hero-float       { animation: hero-float-kf 6s ease-in-out infinite; }
        .hero-glow-pulse   { animation: hero-glow-kf 4s ease-in-out infinite; }
        .hero-spin         { animation: hero-spin-kf 25s linear infinite; }
        .hero-scroll-dot   { animation: hero-scroll-kf 2s ease-in-out infinite; }
        .hero-fade-in-late { animation: hero-fadein-kf 1s 1.2s both; }
      `}</style>
    </section>
  );
}
