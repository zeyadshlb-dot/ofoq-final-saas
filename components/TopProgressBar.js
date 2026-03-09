"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Whenever the route completes loading and sets new pathname/searchParams, hide the bar
    setIsNavigating(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    // Intercept clicks on links globally
    const handleAnchorClick = (e) => {
      // Find closest anchor tag incase they clicked on an SVG or child element
      const target = e.target.closest("a");

      if (
        target &&
        target.href &&
        target.target !== "_blank" &&
        !target.href.includes("#") &&
        target.hostname === window.location.hostname
      ) {
        const targetPath =
          new URL(target.href).pathname + new URL(target.href).search;
        const currentPath = window.location.pathname + window.location.search;

        // If it's a new route, trigger loading bar
        if (targetPath !== currentPath) {
          setIsNavigating(true);
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, []);

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[5000] h-1 bg-transparent overflow-hidden pointer-events-none">
      <div className="h-full bg-primary animate-[infiniteProgressBar_1s_ease-out_infinite] w-1/3 rounded-r-full shadow-[0_0_10px_var(--primary)]"></div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes infiniteProgressBar {
          0% { transform: translateX(300%); width: 0%; }
          50% { width: 50%; opacity: 1; }
          100% { transform: translateX(-100%); width: 10%; opacity: 0; }
        }
      `,
        }}
      />
    </div>
  );
}
