"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
  isForced: false,
});

export function ThemeProvider({ children, forcedTheme }) {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (forcedTheme && forcedTheme !== "auto") {
      setTheme(forcedTheme);
      return;
    }

    const savedTheme = localStorage.getItem("tenant-theme");
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setTheme("dark");
    }
  }, [forcedTheme]);

  useEffect(() => {
    if (!mounted) return;

    // Add smooth transition class to html root to animate everything beautifully
    document.documentElement.classList.add(
      "transition-colors",
      "duration-500",
      "ease-in-out",
    );

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    if (!forcedTheme || forcedTheme === "auto") {
      localStorage.setItem("tenant-theme", theme);
    }
  }, [theme, forcedTheme, mounted]);

  const toggleTheme = () => {
    if (forcedTheme && forcedTheme !== "auto") return; // Toggle disabled if forced
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Prevent flash of incorrect theme before hydration finishes mapping the correct states
  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        isForced: !!(forcedTheme && forcedTheme !== "auto"),
        mounted,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
