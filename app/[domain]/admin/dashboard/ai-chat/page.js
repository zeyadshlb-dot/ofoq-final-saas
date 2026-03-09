"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Brain,
  Trash2,
  Loader2,
  Zap,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useTheme, getToken } from "../layout";

export default function AiChatPage() {
  const { dark, primaryColor } = useTheme();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("normal");
  const [balance, setBalance] = useState(null);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const [history, setHistory] = useState([]);

  const d = dark;
  const pc = primaryColor || "#8b5cf6";
  const token = getToken();

  const fetchBalance = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/ai/balance", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setBalance(data.data.wallet.balance);
    } catch (err) {
      console.error("Failed to fetch balance", err);
    }
  }, [token]);

  useEffect(() => {
    fetchBalance();
    const saved = localStorage.getItem("ofoq_ai_chat_history");
    if (saved) setMessages(JSON.parse(saved));
  }, [fetchBalance]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (messages.length > 0)
      localStorage.setItem("ofoq_ai_chat_history", JSON.stringify(messages));
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setHistory((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setLoading(true);

    let aiResponse = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, aiResponse]);

    try {
      const response = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: currentInput,
          mode: mode,
          stream: true,
          history: history.slice(-6),
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "فشل الاتصال بالذكاء الاصطناعي");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.replace("data: ", "");
            if (jsonStr === "[DONE]") break;
            try {
              const data = JSON.parse(jsonStr);
              const content = data.choices[0]?.delta?.content || "";
              fullText += content;

              let thinkContent = "";
              let cleanContent = fullText;
              const thinkMatch = fullText.match(/<think>([\s\S]*?)<\/think>/);
              if (thinkMatch) {
                thinkContent = thinkMatch[1];
                cleanContent = fullText
                  .replace(/<think>[\s\S]*?<\/think>/, "")
                  .trim();
              } else if (fullText.includes("<think>")) {
                thinkContent = fullText.split("<think>")[1];
                cleanContent = fullText.split("<think>")[0].trim();
              }

              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1].content = cleanContent;
                updated[updated.length - 1].thinking = thinkContent;
                updated[updated.length - 1].isThinking =
                  fullText.includes("<think>") &&
                  !fullText.includes("</think>");
                return updated;
              });
            } catch (e) {}
          }
        }
      }

      const finalThinkMatch = fullText.match(/<think>([\s\S]*?)<\/think>/);
      const finalCleanContent = finalThinkMatch
        ? fullText.replace(/<think>[\s\S]*?<\/think>/, "").trim()
        : fullText;

      setHistory((prev) => [
        ...prev,
        { role: "assistant", content: finalCleanContent },
      ]);
      fetchBalance();
    } catch (err) {
      console.error(err);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].content =
          "عذراً، حدث خطأ أثناء معالجة طلبك: " + err.message;
        updated[updated.length - 1].isError = true;
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    if (confirm("هل أنت متأكد من مسح المحادثة؟")) {
      setMessages([]);
      setHistory([]);
      localStorage.removeItem("ofoq_ai_chat_history");
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const HINTS = [
    { icon: "⚛️", text: "اكتب لي 5 أسئلة صعبة عن قوانين نيوتن" },
    { icon: "🌿", text: "لخص لي أهم نقاط درس الخلية النباتية" },
    { icon: "💡", text: "كيف أشجع طلابي على التفاعل أكثر؟" },
    { icon: "📋", text: "صمم لي خطة درس مدتها 45 دقيقة" },
  ];

  return (
    <div className={`chat-root ${d ? "dark" : "light"}`}>
      {/* Ambient background */}
      <div className="ambient-orb orb-1" style={{ background: pc }} />
      <div className="ambient-orb orb-2" style={{ background: pc }} />

      {/* ─── Header ─── */}
      <header className="chat-header">
        <div className="header-identity">
          <div className="header-avatar" style={{ "--pc": pc }}>
            <Sparkles className="avatar-icon" />
            <span className="avatar-pulse" />
          </div>
          <div className="header-text">
            <h1 className="header-title">المساعد الذكي أفق</h1>
            <p className="header-sub">
              <span className="status-dot" />
              متصل · الجيل الخامس
            </p>
          </div>
        </div>

        <div className="header-actions">
          {balance !== null && (
            <div className="balance-chip">
              <Zap className="balance-icon" />
              <span className="balance-val">{balance.toLocaleString()}</span>
              <span className="balance-label">نقطة</span>
            </div>
          )}
          <button
            className="icon-btn danger"
            onClick={clearChat}
            title="مسح المحادثة"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ─── Messages ─── */}
      <main className="chat-body sidebar-scroll">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-avatar" style={{ "--pc": pc }}>
              <Bot className="w-10 h-10" />
            </div>
            <h2 className="empty-title">كيف يمكنني مساعدتك اليوم؟</h2>
            <p className="empty-desc">
              أنا مساعدك الذكي في منصة أفق — يمكنني مساعدتك في تحضير الدروس،
              كتابة الأسئلة، أو شرح المفاهيم لطلابك.
            </p>
            <div className="hints-grid">
              {HINTS.map((h, i) => (
                <button
                  key={i}
                  className="hint-card"
                  style={{ "--pc": pc, animationDelay: `${i * 80}ms` }}
                  onClick={() => setInput(h.text)}
                >
                  <span className="hint-icon">{h.icon}</span>
                  <span className="hint-text">{h.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`msg-row ${msg.role === "user" ? "user-row" : "ai-row"}`}
              >
                <div
                  className={`msg-avatar ${msg.role === "user" ? "user-avatar-icon" : "ai-avatar-icon"}`}
                  style={{ "--pc": pc }}
                >
                  {msg.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Sparkles className="w-4 h-4 sparkle-anim" />
                  )}
                </div>

                <div className="msg-content-wrap">
                  {/* Thinking block */}
                  {msg.thinking && (
                    <details className="think-details">
                      <summary className="think-summary">
                        <Brain className="w-3 h-3" />
                        {msg.isThinking ? "جاري التفكير..." : "خطوات التفكير"}
                        <span className="think-chevron">›</span>
                      </summary>
                      <div className="think-body">{msg.thinking}</div>
                    </details>
                  )}

                  {/* Bubble */}
                  <div
                    className={`msg-bubble ${msg.role === "user" ? "user-bubble" : "ai-bubble"} ${msg.isError ? "error-bubble" : ""}`}
                    style={{ "--pc": pc }}
                  >
                    {msg.content ? (
                      <div className="markdown-content">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      loading &&
                      idx === messages.length - 1 && (
                        <div className="typing-indicator">
                          <span />
                          <span />
                          <span />
                        </div>
                      )
                    )}
                  </div>

                  {/* Copy action */}
                  {msg.role === "assistant" &&
                    !loading &&
                    idx === messages.length - 1 &&
                    msg.content && (
                      <button
                        className="copy-btn"
                        onClick={() => copyText(msg.content)}
                      >
                        نسخ النص
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      {/* ─── Input Area ─── */}
      <footer className="chat-footer">
        {/* Mode switcher */}
        <div className="mode-bar">
          <div className="mode-switches">
            <button
              onClick={() => setMode("normal")}
              className={`mode-btn ${mode === "normal" ? "mode-active" : ""}`}
              style={{ "--pc": pc }}
            >
              <Zap className="w-3 h-3" />
              سريع
            </button>
            <button
              onClick={() => setMode("thinking")}
              className={`mode-btn thinking-btn ${mode === "thinking" ? "mode-active thinking-active" : ""}`}
              style={{ "--pc": pc }}
            >
              <Brain className="w-3 h-3" />
              تفكير عميق
            </button>
          </div>
          <span className="mode-cost">
            {mode === "thinking" ? "10 نقاط / ١٠٠٠ كلمة" : "2 نقطة / ١٠٠٠ كلمة"}
          </span>
        </div>

        {/* Composer */}
        <form onSubmit={handleSend} className="composer" style={{ "--pc": pc }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="تحدث مع مساعدك الذكي..."
            className="composer-input"
            disabled={loading}
            dir="auto"
            rows={1}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="send-btn"
            style={{ background: pc }}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Send className="w-5 h-5 text-white" />
            )}
          </button>
        </form>

        <p className="footer-note">
          مدعوم من منصة أفق للذكاء الاصطناعي · نسخة 2.5
        </p>
      </footer>

      <style jsx>{`
        /* ── Root ── */
        .chat-root {
          position: relative;
          display: flex;
          flex-direction: column;
          height: calc(100vh - 140px);
          border-radius: 24px;
          overflow: hidden;
          font-family: "Tajawal", "Cairo", system-ui, sans-serif;
        }
        .dark.chat-root {
          background: #080b14;
          border: 1px solid rgba(255, 255, 255, 0.04);
        }
        .light.chat-root {
          background: #fafafa;
          border: 1px solid rgba(0, 0, 0, 0.07);
          box-shadow: 0 4px 40px rgba(0, 0, 0, 0.06);
        }

        /* Ambient orbs */
        .ambient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.04;
          pointer-events: none;
          z-index: 0;
        }
        .orb-1 {
          width: 400px;
          height: 400px;
          top: -100px;
          right: -100px;
        }
        .orb-2 {
          width: 300px;
          height: 300px;
          bottom: 60px;
          left: -80px;
        }
        .dark .ambient-orb {
          opacity: 0.07;
        }

        /* ── Header ── */
        .chat-header {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          backdrop-filter: blur(20px);
        }
        .dark .chat-header {
          background: rgba(8, 11, 20, 0.9);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .light .chat-header {
          background: rgba(250, 250, 250, 0.95);
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        .header-identity {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-avatar {
          position: relative;
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: var(--pc);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px color-mix(in srgb, var(--pc) 40%, transparent);
        }
        .avatar-icon {
          width: 20px;
          height: 20px;
          color: white;
        }
        .avatar-pulse {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #22c55e;
          border: 2px solid;
          animation: pulse 2s infinite;
        }
        .dark .avatar-pulse {
          border-color: #080b14;
        }
        .light .avatar-pulse {
          border-color: #fafafa;
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .header-title {
          font-size: 15px;
          font-weight: 800;
          margin: 0;
        }
        .dark .header-title {
          color: #f1f5f9;
        }
        .light .header-title {
          color: #0f172a;
        }

        .header-sub {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          margin: 2px 0 0;
        }
        .dark .header-sub {
          color: #4b5563;
        }
        .light .header-sub {
          color: #9ca3af;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .balance-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 50px;
          font-size: 12px;
        }
        .dark .balance-chip {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.07);
        }
        .light .balance-chip {
          background: #f1f5f9;
          border: 1px solid rgba(0, 0, 0, 0.06);
        }
        .balance-icon {
          width: 13px;
          height: 13px;
          color: #f59e0b;
        }
        .balance-val {
          font-weight: 900;
          font-size: 13px;
        }
        .dark .balance-val {
          color: #f1f5f9;
        }
        .light .balance-val {
          color: #0f172a;
        }
        .balance-label {
          font-weight: 600;
          font-size: 10px;
          opacity: 0.5;
        }

        .icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .dark .icon-btn.danger {
          background: transparent;
          color: #6b7280;
        }
        .light .icon-btn.danger {
          background: transparent;
          color: #9ca3af;
        }
        .icon-btn.danger:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        /* ── Messages ── */
        .chat-body {
          flex: 1;
          overflow-y: auto;
          padding: 28px 20px;
          position: relative;
          z-index: 1;
        }

        .empty-state {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          max-width: 520px;
          margin: 0 auto;
          gap: 0;
        }

        .empty-avatar {
          width: 72px;
          height: 72px;
          border-radius: 24px;
          background: color-mix(in srgb, var(--pc) 12%, transparent);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          animation: floaty 3s ease-in-out infinite;
        }
        .empty-avatar svg {
          color: var(--pc);
        }
        @keyframes floaty {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .empty-title {
          font-size: 22px;
          font-weight: 900;
          margin: 0 0 10px;
        }
        .dark .empty-title {
          color: #f1f5f9;
        }
        .light .empty-title {
          color: #0f172a;
        }

        .empty-desc {
          font-size: 13px;
          line-height: 1.8;
          max-width: 380px;
          margin: 0 0 28px;
        }
        .dark .empty-desc {
          color: #4b5563;
        }
        .light .empty-desc {
          color: #6b7280;
        }

        .hints-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          width: 100%;
        }
        @media (max-width: 480px) {
          .hints-grid {
            grid-template-columns: 1fr;
          }
        }

        .hint-card {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 14px 16px;
          border-radius: 16px;
          text-align: right;
          cursor: pointer;
          transition: all 0.2s;
          animation: fadeUp 0.4s ease both;
          border: none;
        }
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .dark .hint-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: #94a3b8;
        }
        .light .hint-card {
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.07);
          color: #374151;
          box-shadow: 0 1px 8px rgba(0, 0, 0, 0.04);
        }
        .hint-card:hover {
          border-color: var(--pc);
          box-shadow:
            0 0 0 1px var(--pc),
            0 4px 20px color-mix(in srgb, var(--pc) 15%, transparent);
          transform: translateY(-2px);
        }
        .hint-icon {
          font-size: 18px;
          flex-shrink: 0;
        }
        .hint-text {
          font-size: 12px;
          font-weight: 700;
          line-height: 1.6;
        }

        /* ── Message rows ── */
        .messages-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .msg-row {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          animation: msgIn 0.3s ease both;
        }
        @keyframes msgIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .user-row {
          flex-direction: row-reverse;
        }
        .ai-row {
          flex-direction: row;
        }

        .msg-avatar {
          flex-shrink: 0;
          width: 34px;
          height: 34px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .user-avatar-icon {
          background: color-mix(in srgb, var(--pc) 15%, transparent);
          color: var(--pc);
        }
        .ai-avatar-icon {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .sparkle-anim {
          animation: sparkleGlow 2.5s ease-in-out infinite;
        }
        @keyframes sparkleGlow {
          0%,
          100% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.6) drop-shadow(0 0 4px white);
          }
        }

        .msg-content-wrap {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-width: 78%;
        }
        .user-row .msg-content-wrap {
          align-items: flex-end;
        }
        .ai-row .msg-content-wrap {
          align-items: flex-start;
        }

        /* Thinking */
        .think-details {
          border-radius: 12px;
          overflow: hidden;
          font-size: 12px;
          width: 100%;
        }
        .dark .think-details {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .light .think-details {
          background: #f8fafc;
          border: 1px solid rgba(0, 0, 0, 0.06);
        }

        .think-summary {
          padding: 8px 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 800;
          font-size: 10px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          list-style: none;
          user-select: none;
        }
        .dark .think-summary {
          color: #6b7280;
        }
        .light .think-summary {
          color: #9ca3af;
        }
        .think-chevron {
          margin-right: auto;
          transition: transform 0.2s;
        }
        details[open] .think-chevron {
          transform: rotate(90deg);
        }

        .think-body {
          padding: 10px 14px 12px;
          font-size: 11.5px;
          line-height: 1.7;
          font-style: italic;
          opacity: 0.65;
          border-top: 1px solid;
        }
        .dark .think-body {
          border-color: rgba(255, 255, 255, 0.05);
          color: #9ca3b0;
        }
        .light .think-body {
          border-color: rgba(0, 0, 0, 0.05);
          color: #6b7280;
        }

        /* Bubbles */
        .msg-bubble {
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.75;
        }
        .user-bubble {
          border-top-right-radius: 4px;
        }
        .dark .user-bubble {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.07);
          color: #e2e8f0;
        }
        .light .user-bubble {
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.07);
          color: #1e293b;
          box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
        }

        .ai-bubble {
          border-top-left-radius: 4px;
        }
        .dark .ai-bubble {
          background: rgba(16, 185, 129, 0.07);
          border: 1px solid rgba(16, 185, 129, 0.15);
          color: #d1fae5;
        }
        .light .ai-bubble {
          background: #f0fdf4;
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #064e3b;
        }

        .error-bubble {
          background: rgba(239, 68, 68, 0.08) !important;
          border-color: rgba(239, 68, 68, 0.2) !important;
          color: #ef4444 !important;
        }

        /* Typing dots */
        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 4px 2px;
        }
        .typing-indicator span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.4;
          animation: blink 1.2s infinite;
        }
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes blink {
          0%,
          100% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
        }

        .copy-btn {
          font-size: 10px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          transition: all 0.15s;
          opacity: 0.5;
        }
        .dark .copy-btn {
          background: rgba(255, 255, 255, 0.05);
          color: #94a3b8;
        }
        .light .copy-btn {
          background: rgba(0, 0, 0, 0.05);
          color: #6b7280;
        }
        .copy-btn:hover {
          opacity: 1;
        }

        /* ── Footer ── */
        .chat-footer {
          position: relative;
          z-index: 10;
          padding: 16px 20px 20px;
        }
        .dark .chat-footer {
          background: rgba(8, 11, 20, 0.9);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .light .chat-footer {
          background: rgba(250, 250, 250, 0.95);
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }

        .mode-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          padding: 0 2px;
        }
        .mode-switches {
          display: flex;
          gap: 6px;
        }

        .mode-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 12px;
          border-radius: 50px;
          font-size: 11px;
          font-weight: 800;
          border: 1px solid;
          cursor: pointer;
          transition: all 0.2s;
        }
        .dark .mode-btn {
          background: transparent;
          border-color: rgba(255, 255, 255, 0.08);
          color: #6b7280;
        }
        .light .mode-btn {
          background: transparent;
          border-color: rgba(0, 0, 0, 0.1);
          color: #9ca3af;
        }

        .dark .mode-btn.mode-active {
          background: color-mix(in srgb, var(--pc) 15%, transparent);
          border-color: var(--pc);
          color: var(--pc);
        }
        .light .mode-btn.mode-active {
          background: color-mix(in srgb, var(--pc) 10%, transparent);
          border-color: var(--pc);
          color: var(--pc);
        }

        .thinking-active {
          background: rgba(245, 158, 11, 0.12) !important;
          border-color: #f59e0b !important;
          color: #f59e0b !important;
        }

        .mode-cost {
          font-size: 10px;
          font-weight: 700;
        }
        .dark .mode-cost {
          color: #374151;
        }
        .light .mode-cost {
          color: #d1d5db;
        }

        /* Composer */
        .composer {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          padding: 10px 10px 10px 14px;
          border-radius: 20px;
          transition: all 0.25s;
        }
        .dark .composer {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .dark .composer:focus-within {
          border-color: color-mix(in srgb, var(--pc) 50%, transparent);
          background: rgba(255, 255, 255, 0.06);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--pc) 10%, transparent);
        }
        .light .composer {
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
        .light .composer:focus-within {
          border-color: color-mix(in srgb, var(--pc) 60%, transparent);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--pc) 10%, transparent);
        }

        .composer-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          resize: none;
          font-size: 13.5px;
          font-weight: 600;
          line-height: 1.6;
          font-family: inherit;
          max-height: 160px;
          padding: 4px 0;
        }
        .dark .composer-input {
          color: #e2e8f0;
          caret-color: var(--pc);
        }
        .light .composer-input {
          color: #0f172a;
          caret-color: var(--pc);
        }
        .composer-input::placeholder {
          opacity: 0.35;
        }

        .send-btn {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          border-radius: 13px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        .send-btn:hover:not(:disabled) {
          transform: scale(1.05);
          filter: brightness(1.1);
        }
        .send-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          box-shadow: none;
        }

        .footer-note {
          text-align: center;
          font-size: 10px;
          font-weight: 700;
          margin: 10px 0 0;
        }
        .dark .footer-note {
          color: rgba(255, 255, 255, 0.1);
        }
        .light .footer-note {
          color: rgba(0, 0, 0, 0.15);
        }

        /* ── Scrollbar ── */
        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(128, 128, 128, 0.15);
          border-radius: 8px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(128, 128, 128, 0.3);
        }

        /* ── Markdown ── */
        .markdown-content p {
          margin: 0 0 0.75rem;
        }
        .markdown-content p:last-child {
          margin-bottom: 0;
        }

        .markdown-content h1,
        .markdown-content h2,
        .markdown-content h3 {
          font-weight: 900;
          color: ${pc};
          margin: 1.4rem 0 0.6rem;
        }
        .markdown-content h1 {
          font-size: 1.4rem;
          border-bottom: 2px solid ${pc}22;
          padding-bottom: 6px;
        }
        .markdown-content h2 {
          font-size: 1.2rem;
        }
        .markdown-content h3 {
          font-size: 1.05rem;
        }

        .markdown-content ul,
        .markdown-content ol {
          padding-right: 1.4rem;
          margin: 0 0 0.8rem;
        }
        .markdown-content ul {
          list-style-type: disc;
        }
        .markdown-content ol {
          list-style-type: decimal;
        }
        .markdown-content li {
          margin-bottom: 0.3rem;
        }

        .markdown-content table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin: 1.2rem 0;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid ${d ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"};
          font-size: 13px;
        }
        .markdown-content th {
          background: ${d ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"};
          padding: 10px 14px;
          text-align: right;
          font-weight: 800;
          color: ${pc};
          border-bottom: 1px solid
            ${d ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"};
        }
        .markdown-content td {
          padding: 9px 14px;
          border-bottom: 1px solid
            ${d ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"};
        }
        .markdown-content tr:last-child td {
          border-bottom: none;
        }
        .markdown-content tr:nth-child(even) td {
          background: ${d ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.01)"};
        }
        .markdown-content tr:hover td {
          background: ${pc}08;
        }

        .markdown-content code {
          background: ${d ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"};
          padding: 2px 7px;
          border-radius: 6px;
          font-size: 0.88em;
          font-family: "Fira Code", monospace;
          font-weight: 600;
        }
        .markdown-content pre {
          background: ${d ? "#04060e" : "#f1f5f9"};
          padding: 14px 16px;
          border-radius: 14px;
          overflow-x: auto;
          margin: 1rem 0;
          border: 1px solid ${d ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"};
        }
        .markdown-content pre code {
          background: transparent;
          padding: 0;
          font-weight: 400;
        }

        .markdown-content strong {
          font-weight: 900;
          color: ${pc};
        }
        .markdown-content blockquote {
          border-right: 3px solid ${pc};
          background: ${pc}08;
          padding: 10px 16px;
          margin: 1rem 0;
          border-radius: 3px 12px 12px 3px;
          font-style: italic;
          opacity: 0.85;
        }

        .markdown-content a {
          color: ${pc};
          text-decoration: underline;
          opacity: 0.9;
        }
        .markdown-content hr {
          border: none;
          height: 1px;
          background: ${d ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"};
          margin: 1.2rem 0;
        }
      `}</style>
    </div>
  );
}
