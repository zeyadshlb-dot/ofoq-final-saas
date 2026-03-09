"use client";

import { useState } from "react";
import { Search, Sun, Moon, Menu } from "lucide-react";
import WalletBadges from "./WalletBadges";
import NotificationsDropdown from "./NotificationsDropdown";
import UserMenu from "./UserMenu";

export default function Header({
  dark,
  toggleDark,
  onMenuClick,
  instructor,
  tenant,
  notifications,
  unreadCount,
  setNotifications,
  setUnreadCount,
  onLogout,
  primaryColor,
}) {
  const [searchFocused, setSearchFocused] = useState(false);
  const d = dark;
  const pc = primaryColor;

  return (
    <header
      className={`
        sticky top-0 z-30 px-4 lg:px-6 py-2.5 flex items-center gap-3 header-blur
        ${
          d
            ? "bg-[#06080f]/80 border-b border-white/5 shadow-sm"
            : "bg-white/80 border-b border-black/5 shadow-sm"
        }
      `}
    >
      {/* Hamburger */}
      <button
        className={`lg:hidden p-2 rounded-xl transition ${d ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-600"}`}
        onClick={onMenuClick}
      >
        <Menu className="w-5 h-5" strokeWidth={2} />
      </button>

      {/* Search */}
      <div
        className={`
          search-glow hidden md:flex items-center gap-2.5 flex-1 max-w-md px-4 py-2 rounded-2xl transition-all duration-200
          ${
            d
              ? "bg-white/5 border border-white/8 text-gray-400 focus-within:border-(--primary)/40"
              : "bg-gray-100/70 border border-transparent text-gray-500 focus-within:border-(--primary)/40 focus-within:bg-white"
          }
        `}
      >
        <Search className="w-4 h-4 shrink-0" strokeWidth={2} />
        <input
          type="text"
          placeholder="بحث سريع..."
          className="bg-transparent outline-none w-full text-[13.5px] font-medium placeholder:text-current/60 transition-colors"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        {searchFocused && (
          <kbd
            className={`text-[10px] px-1.5 py-0.5 rounded-md border font-mono ${d ? "border-gray-700 text-gray-600 bg-white/5" : "border-gray-200 text-gray-400 bg-gray-50"}`}
          >
            ⌘K
          </kbd>
        )}
      </div>

      {/* ── Right Section ── */}
      <div className="flex items-center gap-2 mr-auto">
        {/* Wallet Badges */}
        <WalletBadges dark={d} instructor={instructor} primaryColor={pc} />

        {/* Separator */}
        <div
          className={`hidden lg:block h-7 w-px mx-1 ${d ? "bg-white/8" : "bg-gray-200"}`}
        />

        {/* Dark Mode */}
        <button
          onClick={toggleDark}
          className={`
            relative p-2.5 rounded-xl transition-all duration-300 overflow-hidden
            ${
              d
                ? "bg-amber-400/10 text-amber-400 hover:bg-amber-400/20"
                : "bg-indigo-50 text-indigo-500 hover:bg-indigo-100"
            }
          `}
          title={d ? "الوضع الفاتح" : "الوضع الداكن"}
        >
          {d ? (
            <Sun className="w-[18px] h-[18px]" strokeWidth={2} />
          ) : (
            <Moon
              className="w-[18px] h-[18px] text-gray-600"
              strokeWidth={2.5}
            />
          )}
        </button>

        {/* Notifications */}
        <NotificationsDropdown
          dark={d}
          notifications={notifications}
          unreadCount={unreadCount}
          setNotifications={setNotifications}
          setUnreadCount={setUnreadCount}
          primaryColor={pc}
        />

        {/* Separator */}
        <div className={`h-7 w-px mx-1 ${d ? "bg-white/8" : "bg-gray-200"}`} />

        {/* User Menu */}
        <UserMenu
          dark={d}
          instructor={instructor}
          tenant={tenant}
          onLogout={onLogout}
          primaryColor={pc}
        />
      </div>
    </header>
  );
}
