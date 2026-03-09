"use client";

import { Zap, Play, Radio } from "lucide-react";
import { useTheme } from "../layout";

const walletItems = [
  {
    key: "ai",
    label: "AI",
    field: "ai_wallet",
    icon: Zap,
    gradient: "from-violet-500 to-fuchsia-500",
    bg: "bg-violet-500/15",
    bgLight: "bg-violet-50",
    text: "text-violet-400",
    textLight: "text-violet-600",
  },
  {
    key: "video",
    label: "فيديو",
    field: "video_wallet",
    icon: Play,
    gradient: "from-blue-500 to-cyan-400",
    bg: "bg-blue-500/15",
    bgLight: "bg-blue-50",
    text: "text-blue-400",
    textLight: "text-blue-600",
    isGB: true,
  },
  {
    key: "live",
    label: "بث",
    field: "live_wallet",
    icon: Radio,
    gradient: "from-rose-500 to-orange-400",
    bg: "bg-rose-500/15",
    bgLight: "bg-rose-50",
    text: "text-rose-400",
    textLight: "text-rose-600",
  },
];

export default function WalletBadges({ dark, instructor }) {
  const { videoWalletStats, aiWalletStats, liveWalletStats } = useTheme();
  const d = dark;

  return (
    <div className="hidden lg:flex items-center gap-1.5">
      {walletItems.map((w) => {
        const Icon = w.icon;
        let val = instructor?.[w.field] ?? "—";
        let unit = "";

        if (w.key === "video" && videoWalletStats) {
          val = `${videoWalletStats.used_gb}/${videoWalletStats.total_gb}`;
          unit = "GB";
        }

        if (w.key === "ai" && aiWalletStats) {
          val = aiWalletStats.balance;
        }

        if (w.key === "live" && liveWalletStats) {
          val = liveWalletStats.balance_minutes;
          unit = "د";
        }

        return (
          <a
            key={w.key}
            href={`/dashboard/wallet/${w.key}`}
            className={`
              wallet-badge-glow flex items-center gap-1.5 px-3 py-1.5 rounded-xl
              transition-all duration-200 hover:scale-105 hover:-translate-y-0.5
              ${d ? `${w.bg} border border-white/5` : `${w.bgLight} border border-gray-100`}
            `}
            title={w.label}
          >
            <div className={`p-1 rounded-lg bg-gradient-to-br ${w.gradient}`}>
              <Icon className="w-3 h-3 text-white" strokeWidth={2.5} />
            </div>
            <span
              className={`text-[11px] font-bold tabular-nums ${d ? w.text : w.textLight}`}
            >
              {val} {unit}
            </span>
          </a>
        );
      })}
    </div>
  );
}
