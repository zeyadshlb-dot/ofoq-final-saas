"use client";

import { useTheme } from "../layout";

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "139, 92, 246";
}

export default function DashboardStyles() {
  const { primaryColor, secondaryColor, tenantLayout } = useTheme();
  const pc = primaryColor || "#8b5cf6";
  const sc = secondaryColor || "#c4b5fd";
  const pcRgb = hexToRgb(pc);
  const scRgb = hexToRgb(sc);

  const theme = tenantLayout?.theme || {};
  const fontName = theme.font || "IBM Plex Sans Arabic";
  const fontUrl =
    theme.fontUrl ||
    "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap";

  return (
    <style>{`
      @import url('${fontUrl}');

      :root {
        --primary: ${pc};
        --primary-rgb: ${pcRgb};
        --secondary: ${sc};
        --secondary-rgb: ${scRgb};
      }

      * { font-family: '${fontName}', sans-serif; }

      .sidebar-link-active-light { background: linear-gradient(135deg, rgba(var(--primary-rgb),.08) 0%, rgba(var(--primary-rgb),.12) 100%); }
      .sidebar-link-active-dark  { background: linear-gradient(135deg, rgba(var(--primary-rgb),.18) 0%, rgba(var(--primary-rgb),.12) 100%); }

      .logo-glow { filter: drop-shadow(0 0 18px rgba(var(--primary-rgb),.45)); }

      .notif-dot { animation: pulse-dot 2s infinite; }
      @keyframes pulse-dot {
        0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,.6); }
        50%      { box-shadow: 0 0 0 5px rgba(239,68,68,0); }
      }

      .avatar-ring {
        background: conic-gradient(from 180deg, var(--primary), rgba(var(--primary-rgb),.6), #06b6d4, var(--primary));
        padding: 2px;
        border-radius: 14px;
      }

      .search-glow:focus-within {
        box-shadow: 0 0 0 3px rgba(var(--primary-rgb),.25);
      }

      .nav-item-hover { transition: all .18s cubic-bezier(.4,0,.2,1); }

      .sidebar-scroll::-webkit-scrollbar { width: 4px; }
      .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
      .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(var(--primary-rgb),.3); border-radius: 99px; }

      .slide-in { animation: slideIn .22s cubic-bezier(.4,0,.2,1); }
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(-8px) scale(.97); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }

      .live-badge { animation: livePulse 1.4s ease-in-out infinite; }
      @keyframes livePulse {
        0%,100% { opacity: 1; }
        50%      { opacity: .55; }
      }

      .header-blur {
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
      }

      .wallet-badge-glow {
        animation: walletGlow 3s ease-in-out infinite;
      }
      @keyframes walletGlow {
        0%,100% { filter: brightness(1); }
        50%     { filter: brightness(1.15); }
      }

      .primary-gradient {
        background: linear-gradient(135deg, var(--primary), rgba(var(--primary-rgb),.7));
      }

      .primary-text {
        color: var(--primary);
      }

      .primary-bg-soft {
        background: rgba(var(--primary-rgb),.1);
      }
    `}</style>
  );
}
