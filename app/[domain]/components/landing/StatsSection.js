"use client";

import { useEffect, useRef, useState } from "react";

/* ── Animated Counter ────────────────────────────────────────────── */
function AnimCounter({ to, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          let s = 0;
          const step = (ts) => {
            if (!s) s = ts;
            const p = Math.min((ts - s) / 2200, 1);
            const ease = 1 - Math.pow(1 - p, 4);
            setCount(Math.floor(ease * to));
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString("ar-EG")}
      {suffix}
    </span>
  );
}

/* ── Scroll Reveal ───────────────────────────────────────────────── */
function Reveal({ children, className = "", delay = 0, direction = "up" }) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setV(true);
      },
      { threshold: 0.15 },
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
        transform: v ? "translate(0,0)" : dirs[direction],
        transition: `all 0.8s cubic-bezier(.16,1,.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

export default function StatsSection({ theme }) {
  return (
    <section className="relative mb-20 py-16 w-full bg-transparent overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-12 items-center justify-between">
          {/* Text Area */}
          <Reveal
            className="basis-full md:basis-1/2 p-4 md:p-8"
            delay={0.1}
            direction="right"
          >
            <div className="text-center md:text-right relative flex flex-col justify-center space-y-6">
              <div className="inline-flex items-center gap-2 justify-center md:justify-start">
                <span className="w-8 h-1 bg-primary rounded-full stats-line-grow"></span>
                <p className="text-primary text-xl font-bold tracking-wide">
                  مع {theme?.platformName || "أستاذك"}
                </p>
              </div>

              <div className="relative z-10">
                <h3 className="text-gray-900 dark:text-white text-3xl md:text-5xl font-black leading-[1.4] md:leading-[1.5]">
                  احنا مش بس بنعلّمك ...
                  <br />
                  احنا بنجهّزك تبقى جاهز لأي سؤال
                  <br />
                  في{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-secondary underline decoration-primary/30 decoration-wavy underline-offset-8">
                    الامتحان والحياة
                  </span>
                </h3>
              </div>

              {/* Decorative element behind text */}
              <div className="absolute top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-[50px] -z-10 pointer-events-none stats-orb-pulse"></div>
            </div>
          </Reveal>

          {/* Stats Cards Area */}
          <div className="basis-full md:basis-1/2 flex justify-center flex-col sm:flex-row gap-6">
            {/* Column 1 */}
            <div className="flex flex-col gap-6 w-full sm:w-[280px]">
              {/* Quote Card */}
              <Reveal delay={0.2}>
                <div className="bg-gradient-to-r from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 h-[100px] rounded-[2rem] p-6 flex flex-col justify-center items-center border border-primary/10 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-primary/5 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500"></div>
                  <p className="text-2xl font-bold text-gray-700 dark:text-gray-300 relative z-10">
                    ما النجاح{" "}
                    <span className="text-primary font-black">إلا لحظة</span>
                  </p>
                </div>
              </Reveal>

              {/* Stat Card 1 */}
              <Reveal delay={0.35}>
                <div className="bg-white dark:bg-[#111] rounded-[2rem] p-8 relative overflow-hidden border border-gray-100 dark:border-white/[0.05] shadow-xl hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 group stats-card-tilt">
                  {/* Glow */}
                  <div className="absolute -right-12 -top-12 w-32 h-32 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 group-hover:w-40 group-hover:h-40 transition-all duration-500"></div>
                  <div className="absolute top-6 left-6 text-primary/20 group-hover:text-primary/40 transition-colors group-hover:rotate-12 transition-transform duration-500">
                    <svg
                      className="w-16 h-16"
                      fill="currentColor"
                      viewBox="0 0 24 24"
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
                  </div>

                  <div className="relative z-10 mt-12 pr-2">
                    <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 block mb-2 font-mono">
                      +<AnimCounter to={400} suffix="K" />
                    </span>
                    <p className="text-lg text-gray-500 dark:text-gray-400 font-bold">
                      طالب اختصروا الطريق للقمة
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Column 2 */}
            <div className="flex flex-col-reverse sm:flex-col gap-6 w-full sm:w-[280px] sm:mt-12">
              {/* Stat Card 2 */}
              <Reveal delay={0.45}>
                <div className="bg-white dark:bg-[#111] rounded-[2rem] p-8 relative overflow-hidden border border-gray-100 dark:border-white/[0.05] shadow-xl hover:-translate-y-2 hover:shadow-2xl hover:shadow-secondary/20 transition-all duration-300 group stats-card-tilt">
                  {/* Glow */}
                  <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-secondary/20 rounded-full blur-2xl group-hover:bg-secondary/30 group-hover:w-40 group-hover:h-40 transition-all duration-500"></div>
                  <div className="absolute top-6 right-6 text-secondary/20 group-hover:text-secondary/40 transition-colors group-hover:-rotate-12 transition-transform duration-500">
                    <svg
                      className="w-16 h-16"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div className="relative z-10 mt-12 pr-2">
                    <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 block mb-2 font-mono">
                      +<AnimCounter to={360} suffix="K" />
                    </span>
                    <p className="text-lg text-gray-500 dark:text-gray-400 font-bold">
                      مشترك ومتابع على اليوتيوب
                    </p>
                  </div>
                </div>
              </Reveal>

              {/* Quote Card */}
              <Reveal delay={0.55}>
                <div className="bg-gradient-to-r from-secondary/5 to-primary/5 dark:from-secondary/10 dark:to-primary/10 h-[100px] rounded-[2rem] p-6 flex flex-col justify-center items-center border border-secondary/10 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-secondary/5 translate-y-[-100%] group-hover:translate-y-0 transition-transform duration-500"></div>
                  <p className="text-2xl font-bold text-gray-700 dark:text-gray-300 relative z-10">
                    تهزم فيها{" "}
                    <span className="text-secondary font-black">كل الصعاب</span>
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes stats-line-grow-kf { from { width: 0; } to { width: 2rem; } }
        @keyframes stats-orb-pulse-kf { 0%,100% { transform:scale(1); opacity:.5; } 50% { transform:scale(1.3); opacity:.8; } }
        .stats-line-grow { animation: stats-line-grow-kf 1s 0.5s both; }
        .stats-orb-pulse { animation: stats-orb-pulse-kf 5s ease-in-out infinite; }
        .stats-card-tilt  { transition: transform 0.3s ease; }
        .stats-card-tilt:hover { transform: translateY(-8px) rotate(-1deg); }
      `}</style>
    </section>
  );
}
