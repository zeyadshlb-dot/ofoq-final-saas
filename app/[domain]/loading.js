import React from "react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-50/80 dark:bg-black/80 backdrop-blur-md transition-colors duration-500 min-h-screen">
      <div className="relative flex justify-center items-center">
        {/* Outer Ring */}
        <div className="absolute w-24 h-24 border-4 border-primary/20 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>

        {/* Spinner */}
        <div className="w-16 h-16 border-4 border-transparent border-t-primary border-b-secondary rounded-full animate-spin flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary animate-pulse opacity-70"></div>
        </div>
      </div>

      <h2 className="mt-6 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary animate-pulse drop-shadow-sm font-sans tracking-wide">
        جاري التحميل...
      </h2>
    </div>
  );
}
