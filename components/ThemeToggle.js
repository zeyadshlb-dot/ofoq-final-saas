"use client";

import React from "react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme, isForced, mounted } = useTheme();

  if (!mounted) {
    return (
      <div dir="ltr" className="opacity-0">
        <button className="relative inline-flex items-center py-1.5 px-2 rounded-full h-[36px] w-[74px]"></button>
      </div>
    );
  }

  if (isForced) return null;

  const isDark = theme === "dark";

  return (
    <div dir="ltr">
      <button
        onClick={toggleTheme}
        className={`relative inline-flex items-center py-1.5 px-2 rounded-full transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus:outline-none 
          ${isDark ? "bg-slate-800 text-slate-600 focus-visible:ring-slate-800" : "bg-primary text-secondary/30 focus-visible:ring-primary"}
        `}
        role="switch"
        type="button"
        aria-checked={isDark}
      >
        <span className="sr-only">Toggle dark mode</span>

        {/* Background Sun */}
        <svg
          width="24"
          height="24"
          fill="none"
          className={`transform transition-transform duration-500 ${isDark ? "scale-100" : "scale-0"}`}
        >
          <path
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M12 4v1M18 6l-1 1M20 12h-1M18 18l-1-1M12 19v1M7 17l-1 1M5 12H4M7 7 6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>

        {/* Background Moon */}
        <svg
          width="24"
          height="24"
          fill="none"
          className={`ml-3.5 transform transition-transform duration-300 ${isDark ? "scale-0" : "scale-100"}`}
        >
          <path
            d="M18 15.63c-.977.52-1.945.481-3.13.481A6.981 6.981 0 0 1 7.89 9.13c0-1.185-.04-2.153.481-3.13C6.166 7.174 5 9.347 5 12.018A6.981 6.981 0 0 0 11.982 19c2.67 0 4.844-1.166 6.018-3.37ZM16 5c0 2.08-.96 4-3 4 2.04 0 3 .92 3 3 0-2.08.96-3 3-3-2.04 0-3-1.92-3-4Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>

        {/* Sliding Handle */}
        <span
          className={`absolute top-0.5 left-0.5 bg-white w-8 h-8 rounded-full flex items-center justify-center transition duration-500 transform ${isDark ? "translate-x-[38px]" : "translate-x-0"}`}
        >
          {/* Handle Sun */}
          <svg
            width="24"
            height="24"
            fill="none"
            className={`flex-none transition duration-500 transform text-primary ${isDark ? "opacity-0 scale-0" : "opacity-100 scale-100"}`}
          >
            <path
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M12 4v1M18 6l-1 1M20 12h-1M18 18l-1-1M12 19v1M7 17l-1 1M5 12H4M7 7 6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>

          {/* Handle Moon */}
          <svg
            width="24"
            height="24"
            fill="none"
            className={`flex-none -ml-6 transition duration-500 transform text-slate-700 ${isDark ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}
          >
            <path
              d="M18 15.63c-.977.52-1.945.481-3.13.481A6.981 6.981 0 0 1 7.89 9.13c0-1.185-.04-2.153.481-3.13C6.166 7.174 5 9.347 5 12.018A6.981 6.981 0 0 0 11.982 19c2.67 0 4.844-1.166 6.018-3.37ZM16 5c0 2.08-.96 4-3 4 2.04 0 3 .92 3 3 0-2.08.96-3 3-3-2.04 0-3-1.92-3-4Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
        </span>
      </button>
    </div>
  );
}
