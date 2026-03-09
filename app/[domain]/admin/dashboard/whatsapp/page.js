"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme, getSlug, getToken } from "../layout";
import {
  MessageCircle,
  Wifi,
  WifiOff,
  QrCode,
  Loader2,
  CheckCircle2,
  AlertCircle,
  SendHorizonal,
  Phone,
  RefreshCw,
  Shield,
  Zap,
  Smartphone,
  Power,
  PowerOff,
  Image as ImageIcon,
  FileText,
  MapPin,
  Link2,
  Contact,
  Eye,
  Type,
  Search,
  Settings,
  ArrowRight,
  Check,
  CheckCheck,
  Paperclip,
  Smile,
  X,
  ChevronDown,
  Users,
  CheckSquare,
  Square,
} from "lucide-react";

/* ─── Status Map ─── */
const STS = {
  disconnected: { label: "غير متصل", color: "#ef4444", icon: WifiOff },
  connecting: { label: "جاري الاتصال...", color: "#f59e0b", icon: Loader2 },
  qr_ready: { label: "مسح QR Code", color: "#3b82f6", icon: QrCode },
  connected: { label: "متصل", color: "#10b981", icon: CheckCircle2 },
  idle: { label: "خامل (موفر RAM)", color: "#06b6d4", icon: Zap },
  error: { label: "خطأ", color: "#ef4444", icon: AlertCircle },
  needs_reconnect: { label: "إعادة اتصال...", color: "#f59e0b", icon: Loader2 },
};

/* ─── helpers ─── */
const fmtTime = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
};
const fmtDate = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "اليوم";
  const yday = new Date(today);
  yday.setDate(yday.getDate() - 1);
  if (d.toDateString() === yday.toDateString()) return "أمس";
  return d.toLocaleDateString("ar-EG", { month: "short", day: "numeric" });
};

/* ─── TABS ─── */
const TABS = [
  { id: "chat", label: "المحادثات", icon: MessageCircle },
  { id: "send", label: "إرسال جديد", icon: SendHorizonal },
  { id: "settings", label: "إعدادات الربط", icon: Settings },
];

const SEND_TYPES = [
  { id: "text", label: "نص", icon: Type },
  { id: "image", label: "صورة", icon: ImageIcon },
  { id: "file", label: "ملف", icon: FileText },
  { id: "location", label: "موقع", icon: MapPin },
  { id: "link", label: "رابط", icon: Link2 },
  { id: "contact", label: "جهة اتصال", icon: Contact },
];

/* ─── Generate random short ID ─── */
const genId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

/* ─── Variable replacer ─── */
const replaceVars = (text, student) => {
  if (!student) return text;
  return text
    .replace(/\{name\}/g, student.name || "")
    .replace(/\{phone\}/g, student.phone || "")
    .replace(/\{id\}/g, String(student.id || ""));
};

export default function WhatsAppPage() {
  const { dark } = useTheme();
  const slug = getSlug();
  const token = getToken();

  /* ─── Connection State ─── */
  const [status, setStatus] = useState("disconnected");
  const [qrCode, setQrCode] = useState(null);
  const [error, setError] = useState(null);
  const [connectedPhone, setConnectedPhone] = useState(null);
  const [lastActivity, setLastActivity] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ─── UI State ─── */
  const [mainTab, setMainTab] = useState("chat");
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  /* ─── Send New State ─── */
  const [sendType, setSendType] = useState("text");
  const [sendPhone, setSendPhone] = useState("");
  const [sendMsg, setSendMsg] = useState("");
  const [sendCaption, setSendCaption] = useState("");
  const [sendLat, setSendLat] = useState("");
  const [sendLng, setSendLng] = useState("");
  const [sendTitle, setSendTitle] = useState("");
  const [sendUrl, setSendUrl] = useState("");
  const [sendContactPhone, setSendContactPhone] = useState("");
  const [sendContactName, setSendContactName] = useState("");
  const [file64, setFile64] = useState(null);
  const [fileNm, setFileNm] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  /* ─── Students State ─── */
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [sendMode, setSendMode] = useState("manual"); // manual | students
  const [bulkProgress, setBulkProgress] = useState(null);

  const chatEndRef = useRef(null);
  const pollRef = useRef(null);

  const isConnected = status === "connected" || status === "idle";
  const isConnecting =
    status === "connecting" ||
    status === "qr_ready" ||
    status === "needs_reconnect";

  /* ─── Fetch Status ─── */
  const fetchStatus = useCallback(async () => {
    if (!slug || slug === "main") return;
    try {
      const r = await fetch(`/api/whatsapp?action=status&session=${slug}`);
      if (r.ok) {
        const d = await r.json();
        setStatus(d.status || "disconnected");
        setQrCode(d.qrCode || null);
        setError(d.error || null);
        setConnectedPhone(d.connectedPhone || null);
        setLastActivity(d.lastActivity || null);
      }
    } catch (e) {
      /* ignore */
    }
  }, [slug]);

  /* ─── Fetch Conversations ─── */
  const fetchConvos = useCallback(async () => {
    if (!slug || !isConnected) return;
    try {
      const r = await fetch(
        `/api/whatsapp?action=conversations&session=${slug}`,
      );
      if (r.ok) {
        const d = await r.json();
        setConversations(d.conversations || []);
      }
    } catch (e) {
      /* ignore */
    }
  }, [slug, isConnected]);

  /* ─── Fetch Messages for selected chat ─── */
  const fetchMessages = useCallback(async () => {
    if (!slug || !selectedChat) return;
    try {
      const r = await fetch(
        `/api/whatsapp?action=messages&session=${slug}&chatId=${encodeURIComponent(selectedChat)}`,
      );
      if (r.ok) {
        const d = await r.json();
        setChatMessages(d.messages || []);
      }
    } catch (e) {
      /* ignore */
    }
  }, [slug, selectedChat]);

  /* ─── Polling ─── */
  useEffect(() => {
    fetchStatus();
    const interval = isConnecting ? 3000 : 10000;
    pollRef.current = setInterval(() => {
      fetchStatus();
      if (isConnected) {
        fetchConvos();
        if (selectedChat) fetchMessages();
      }
    }, interval);
    return () => clearInterval(pollRef.current);
  }, [
    fetchStatus,
    fetchConvos,
    fetchMessages,
    isConnected,
    isConnecting,
    selectedChat,
  ]);

  useEffect(() => {
    fetchConvos();
  }, [fetchConvos]);
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  /* ─── Fetch Students ─── */
  useEffect(() => {
    if (!slug || slug === "main" || !token) return;
    const fetchStudents = async () => {
      setStudentsLoading(true);
      try {
        const r = await fetch(`/api/v1/students?slug=${slug}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (r.ok) {
          const d = await r.json();
          setStudents(Array.isArray(d) ? d : d?.data || []);
        }
      } catch (e) {
        /* ignore */
      } finally {
        setStudentsLoading(false);
      }
    };
    fetchStudents();
  }, [slug, token]);

  /* ─── Handlers ─── */
  const connect = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "connect", session: slug }),
      });
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d.error);
      }
      setStatus("connecting");
      setMainTab("settings");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    setLoading(true);
    try {
      await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disconnect", session: slug }),
      });
      setStatus("disconnected");
      setQrCode(null);
      setConnectedPhone(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async () => {
    if (!replyText.trim() || !selectedChat) return;
    setSendingReply(true);
    try {
      const r = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reply",
          session: slug,
          chatId: selectedChat,
          message: replyText,
        }),
      });
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d.error);
      }
      setReplyText("");
      setTimeout(fetchMessages, 500);
    } catch (e) {
      console.error(e);
    } finally {
      setSendingReply(false);
    }
  };

  const handleFilePick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileNm(f.name);
    const r = new FileReader();
    r.onload = () => setFile64(r.result);
    r.readAsDataURL(f);
  };

  /* ─── Format phone: always prefix with 2 for Egypt ─── */
  const fmtPhone = (phone) => {
    let p = phone.replace(/[^0-9]/g, "");
    if (p.startsWith("0")) p = "2" + p; // 01xxx → 201xxx
    if (!p.startsWith("2")) p = "2" + p;
    return p;
  };

  /* ─── Toggle student selection ─── */
  const toggleStudent = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };
  const selectAllStudents = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map((s) => s.id));
    }
  };

  /* ─── Insert variable at cursor ─── */
  const insertVar = (v) => {
    setSendMsg((prev) => prev + v);
  };

  /* ─── Send to single or bulk ─── */
  const handleSendNew = async () => {
    setSending(true);
    setSendResult(null);
    setBulkProgress(null);

    // Determine recipients
    let recipients = [];
    if (sendMode === "students") {
      recipients = students.filter(
        (s) => selectedStudents.includes(s.id) && s.phone,
      );
      if (recipients.length === 0) {
        setSendResult({ ok: false, msg: "اختر طالب واحد على الأقل" });
        setSending(false);
        return;
      }
    } else {
      if (!sendPhone.trim()) {
        setSending(false);
        return;
      }
      recipients = [{ name: "", phone: sendPhone, id: "" }];
    }

    let success = 0;
    let failed = 0;

    for (let i = 0; i < recipients.length; i++) {
      const student = recipients[i];
      const phone = fmtPhone(student.phone);
      const rid = genId();

      // Replace variables + add random ID
      let finalMsg = replaceVars(sendMsg, student);
      if (sendType === "text" && finalMsg) {
        finalMsg = `#${rid}\n${finalMsg}\n#${rid}`;
      }
      let finalCaption = replaceVars(sendCaption, student);

      let payload = { session: slug, phone };
      switch (sendType) {
        case "text":
          payload = { ...payload, action: "send_text", message: finalMsg };
          break;
        case "image":
          payload = {
            ...payload,
            action: "send_image",
            image: file64,
            caption: finalCaption,
          };
          break;
        case "file":
          payload = {
            ...payload,
            action: "send_file",
            file: file64,
            filename: fileNm,
            caption: finalCaption,
          };
          break;
        case "location":
          payload = {
            ...payload,
            action: "send_location",
            lat: sendLat,
            lng: sendLng,
            title: sendTitle,
          };
          break;
        case "link":
          payload = {
            ...payload,
            action: "send_link",
            url: sendUrl,
            caption: finalCaption,
          };
          break;
        case "contact":
          payload = {
            ...payload,
            action: "send_contact",
            contactPhone: sendContactPhone,
            contactName: sendContactName,
          };
          break;
      }

      try {
        const r = await fetch("/api/whatsapp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        success++;
      } catch (e) {
        failed++;
      }

      if (recipients.length > 1) {
        setBulkProgress({
          current: i + 1,
          total: recipients.length,
          success,
          failed,
        });
        // Small delay between messages to avoid rate limiting
        if (i < recipients.length - 1)
          await new Promise((r) => setTimeout(r, 1500));
      }
    }

    if (recipients.length === 1) {
      setSendResult({
        ok: success > 0,
        msg: success > 0 ? "✅ تم الإرسال بنجاح" : "❌ فشل الإرسال",
      });
    } else {
      setSendResult({
        ok: failed === 0,
        msg: `✅ تم الإرسال: ${success} | ❌ فشل: ${failed} من ${recipients.length}`,
      });
    }
    setBulkProgress(null);
    setSending(false);
  };

  const filteredConvos = conversations.filter(
    (c) => !searchQ || c.name?.includes(searchQ) || c.phone?.includes(searchQ),
  );

  const filteredStudents = students.filter(
    (s) =>
      !studentSearch ||
      s.name?.includes(studentSearch) ||
      s.phone?.includes(studentSearch),
  );

  const selectedConvo = conversations.find((c) => c.chatId === selectedChat);
  const stsInfo = STS[status] || STS.disconnected;
  const StsIcon = stsInfo.icon;

  // ─── Styles ───
  const bg = dark ? "#0b141a" : "#eae6df";
  const panelBg = dark ? "#111b21" : "#ffffff";
  const headerBg = dark ? "#202c33" : "#008069";
  const chatBg = dark ? "#0b141a" : "#e5ddd5";
  const bubbleMe = dark ? "#005c4b" : "#d9fdd3";
  const bubbleOther = dark ? "#202c33" : "#ffffff";
  const inputBg = dark ? "#2a3942" : "#ffffff";
  const textMain = dark ? "#e9edef" : "#111b21";
  const textSub = dark ? "#8696a0" : "#667781";
  const borderC = dark ? "#2a3942" : "#e9edef";

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ background: bg, height: "calc(100vh - 64px)" }}
    >
      {/* ═══ Top Bar ═══ */}
      <div
        className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{ background: headerBg }}
      >
        {/* Tabs */}
        <div className="flex items-center gap-1">
          {TABS.map((t) => {
            const I = t.icon;
            const active = mainTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setMainTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${active ? "bg-white/20 text-white" : "text-white/60 hover:text-white hover:bg-white/10"}`}
              >
                <I className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>
        {/* Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10">
          <StsIcon
            className={`w-3.5 h-3.5 text-white ${isConnecting ? "animate-spin" : ""}`}
          />
          <span className="text-white text-xs font-bold">{stsInfo.label}</span>
          {isConnected && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </div>
      </div>

      {/* ═══ SETTINGS TAB ═══ */}
      {mainTab === "settings" && (
        <div
          className="flex-1 overflow-y-auto p-6"
          style={{ background: panelBg }}
        >
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Disconnected */}
            {status === "disconnected" && (
              <div className="text-center py-16">
                <div
                  className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
                  style={{ background: dark ? "#202c33" : "#f0f2f5" }}
                >
                  <WifiOff className="w-12 h-12" style={{ color: textSub }} />
                </div>
                <h2
                  className="text-2xl font-black mb-2"
                  style={{ color: textMain }}
                >
                  الواتساب غير متصل
                </h2>
                <p
                  className="text-sm font-bold mb-8"
                  style={{ color: textSub }}
                >
                  اضغط على &quot;ابدأ الاتصال&quot; ثم امسح QR Code
                </p>
                <button
                  onClick={connect}
                  disabled={loading}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-white transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                  style={{
                    background: "#008069",
                    boxShadow: "0 8px 30px rgba(0,128,105,0.3)",
                  }}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Power className="w-5 h-5" />
                  )}
                  ابدأ الاتصال
                </button>
              </div>
            )}

            {/* QR */}
            {isConnecting && (
              <div className="text-center py-10">
                {qrCode ? (
                  <>
                    <div className="inline-block p-6 rounded-3xl bg-white shadow-xl mb-6">
                      <img src={qrCode} alt="QR" className="w-64 h-64" />
                    </div>
                    <h3
                      className="text-lg font-black"
                      style={{ color: textMain }}
                    >
                      امسح الكود من الواتساب
                    </h3>
                    <p
                      className="text-xs font-bold mt-1"
                      style={{ color: textSub }}
                    >
                      الإعدادات → الأجهزة المرتبطة → ربط جهاز
                    </p>
                  </>
                ) : (
                  <div className="py-16">
                    <Loader2
                      className="w-16 h-16 animate-spin mx-auto mb-6"
                      style={{ color: "#008069" }}
                    />
                    <h3
                      className="text-lg font-black"
                      style={{ color: textMain }}
                    >
                      جاري تجهيز QR Code...
                    </h3>
                  </div>
                )}
                <button
                  onClick={disconnect}
                  className="mt-6 px-6 py-3 rounded-xl font-bold text-sm"
                  style={{
                    background: dark ? "#2a3942" : "#f0f2f5",
                    color: textSub,
                  }}
                >
                  إلغاء
                </button>
              </div>
            )}

            {/* Connected */}
            {isConnected && (
              <div className="space-y-4">
                <div
                  className="flex items-center gap-4 p-5 rounded-2xl"
                  style={{
                    background: dark ? "#005c4b22" : "#d9fdd3",
                    border: `1px solid ${dark ? "#005c4b44" : "#b8e6b0"}`,
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "#008069" }}
                  >
                    <Wifi className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black" style={{ color: textMain }}>
                      الحساب مُتصل بنجاح ✅
                    </h4>
                    {connectedPhone && (
                      <p
                        className="text-sm font-bold mt-0.5"
                        style={{ color: "#008069" }}
                      >
                        📱 {connectedPhone}
                      </p>
                    )}
                    {lastActivity && (
                      <p
                        className="text-xs font-bold mt-0.5"
                        style={{ color: textSub }}
                      >
                        آخر نشاط:{" "}
                        {new Date(lastActivity).toLocaleString("ar-EG")}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={disconnect}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-all ring-1 ring-red-500/20 shrink-0"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <PowerOff className="w-4 h-4" />
                    )}
                    قطع
                  </button>
                </div>
                {/* Features */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    {
                      icon: MessageCircle,
                      label: "رسائل نصية",
                      color: "#25D366",
                    },
                    { icon: ImageIcon, label: "صور وملفات", color: "#34b7f1" },
                    { icon: MapPin, label: "مواقع", color: "#e74c3c" },
                    { icon: Contact, label: "جهات اتصال", color: "#8e44ad" },
                  ].map((f, i) => {
                    const I = f.icon;
                    return (
                      <div
                        key={i}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl"
                        style={{ background: dark ? "#2a3942" : "#f0f2f5" }}
                      >
                        <I className="w-6 h-6" style={{ color: f.color }} />
                        <span
                          className="text-xs font-black"
                          style={{ color: textMain }}
                        >
                          {f.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Error */}
            {status === "error" && (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3
                  className="text-xl font-black mb-2"
                  style={{ color: textMain }}
                >
                  حدث خطأ
                </h3>
                <p className="text-sm font-bold text-red-400 mb-6">{error}</p>
                <button
                  onClick={connect}
                  className="px-6 py-3 rounded-xl font-bold text-white"
                  style={{ background: "#008069" }}
                >
                  <RefreshCw className="w-4 h-4 inline ml-2" />
                  إعادة المحاولة
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ CHAT TAB ═══ */}
      {mainTab === "chat" && (
        <div className="flex flex-1 overflow-hidden">
          {/* ── Left: Conversations ── */}
          <div
            className="w-[340px] shrink-0 flex flex-col border-l"
            style={{ background: panelBg, borderColor: borderC }}
          >
            {/* Search */}
            <div
              className="p-2"
              style={{ background: dark ? "#111b21" : "#f0f2f5" }}
            >
              <div className="relative">
                <Search
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: textSub }}
                />
                <input
                  type="text"
                  placeholder="بحث أو ابدأ محادثة جديدة"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 rounded-lg text-sm font-bold outline-none"
                  style={{ background: inputBg, color: textMain }}
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {!isConnected ? (
                <div className="flex flex-col items-center justify-center h-full px-4">
                  <WifiOff
                    className="w-10 h-10 mb-3"
                    style={{ color: textSub }}
                  />
                  <p
                    className="text-sm font-bold text-center"
                    style={{ color: textSub }}
                  >
                    اتصل بالواتساب أولاً من تبويب &quot;إعدادات الربط&quot;
                  </p>
                </div>
              ) : filteredConvos.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-4">
                  <MessageCircle
                    className="w-10 h-10 mb-3"
                    style={{ color: textSub }}
                  />
                  <p
                    className="text-sm font-bold text-center"
                    style={{ color: textSub }}
                  >
                    لا توجد محادثات بعد
                    <br />
                    أرسل رسالة أو انتظر استقبال رسائل
                  </p>
                </div>
              ) : (
                filteredConvos.map((c) => {
                  const active = selectedChat === c.chatId;
                  return (
                    <button
                      key={c.chatId}
                      onClick={() => {
                        setSelectedChat(c.chatId);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-3 transition-all text-right border-b"
                      style={{
                        background: active
                          ? dark
                            ? "#2a3942"
                            : "#f0f2f5"
                          : "transparent",
                        borderColor: borderC,
                      }}
                    >
                      {/* Avatar */}
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-white font-black text-sm"
                        style={{
                          background: c.isGroup ? "#00a884" : "#8696a0",
                        }}
                      >
                        {c.isGroup
                          ? "👥"
                          : c.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span
                            className="font-black text-sm truncate"
                            style={{ color: textMain }}
                          >
                            {c.name || c.phone}
                          </span>
                          <span
                            className="text-[10px] font-bold shrink-0"
                            style={{
                              color: c.unread > 0 ? "#00a884" : textSub,
                            }}
                          >
                            {fmtDate(c.lastTimestamp)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <p
                            className="text-xs font-bold truncate"
                            style={{ color: textSub }}
                          >
                            {c.lastMessage}
                          </p>
                          {c.unread > 0 && (
                            <span
                              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
                              style={{ background: "#25D366" }}
                            >
                              {c.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Right: Chat Window ── */}
          <div className="flex-1 flex flex-col" style={{ background: chatBg }}>
            {!selectedChat ? (
              /* Empty state */
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-[320px] text-center">
                  <MessageCircle
                    className="w-20 h-20 mx-auto mb-6"
                    style={{ color: textSub + "40" }}
                  />
                  <h2
                    className="text-3xl font-black mb-2"
                    style={{ color: textMain }}
                  >
                    واتساب ويب
                  </h2>
                  <p className="text-sm font-bold" style={{ color: textSub }}>
                    اختر محادثة من القائمة لبدء المراسلة
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div
                  className="flex items-center gap-3 px-4 py-2.5 shrink-0"
                  style={{
                    background: dark ? "#202c33" : "#f0f2f5",
                    borderBottom: `1px solid ${borderC}`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm"
                    style={{
                      background: selectedConvo?.isGroup
                        ? "#00a884"
                        : "#8696a0",
                    }}
                  >
                    {selectedConvo?.isGroup
                      ? "👥"
                      : selectedConvo?.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1">
                    <h3
                      className="font-black text-sm"
                      style={{ color: textMain }}
                    >
                      {selectedConvo?.name || selectedChat?.split("@")[0]}
                    </h3>
                    <p className="text-xs font-bold" style={{ color: textSub }}>
                      {selectedConvo?.phone}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedChat(null)}
                    className="p-2 rounded-full hover:bg-black/5 transition-all"
                  >
                    <X className="w-5 h-5" style={{ color: textSub }} />
                  </button>
                </div>

                {/* Messages */}
                <div
                  className="flex-1 overflow-y-auto px-12 py-4 space-y-1"
                  style={{
                    backgroundImage: dark
                      ? "none"
                      : "url(\"data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='a' patternUnits='userSpaceOnUse' width='20' height='20'%3E%3Ccircle cx='10' cy='10' r='.5' fill='%23d4d0ca' opacity='.3'/%3E%3C/pattern%3E%3C/defs%3E%3Crect fill='url(%23a)' width='100' height='100'/%3E%3C/svg%3E\")",
                  }}
                >
                  {chatMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p
                        className="text-sm font-bold px-4 py-2 rounded-lg"
                        style={{
                          background: dark ? "#1e2a30" : "#fef3c7",
                          color: textSub,
                        }}
                      >
                        لا توجد رسائل بعد
                      </p>
                    </div>
                  ) : (
                    chatMessages.map((m, i) => (
                      <div
                        key={m.id || i}
                        className={`flex ${m.isMe ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className="max-w-[65%] px-3 py-1.5 rounded-lg shadow-sm relative"
                          style={{
                            background: m.isMe ? bubbleMe : bubbleOther,
                          }}
                        >
                          {!m.isMe && m.sender && (
                            <p
                              className="text-xs font-black mb-0.5"
                              style={{ color: "#00a884" }}
                            >
                              ~{m.sender}
                            </p>
                          )}
                          {m.hasMedia && (
                            <p
                              className="text-xs font-bold"
                              style={{ color: textSub }}
                            >
                              📎 {m.mimetype || "ملف مرفق"}
                            </p>
                          )}
                          <p
                            className="text-sm font-bold leading-relaxed whitespace-pre-wrap"
                            style={{ color: textMain }}
                          >
                            {m.body}
                          </p>
                          <div className="flex items-center justify-end gap-1 mt-0.5">
                            <span
                              className="text-[10px] font-bold"
                              style={{ color: textSub }}
                            >
                              {fmtTime(m.timestamp)}
                            </span>
                            {m.isMe && (
                              <CheckCheck
                                className="w-3.5 h-3.5"
                                style={{ color: "#53bdeb" }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Reply Input */}
                <div
                  className="flex items-center gap-2 px-4 py-3 shrink-0"
                  style={{ background: dark ? "#202c33" : "#f0f2f5" }}
                >
                  <input
                    type="text"
                    placeholder="اكتب رسالة..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendReply();
                      }
                    }}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold outline-none"
                    style={{ background: inputBg, color: textMain }}
                  />
                  <button
                    onClick={sendReply}
                    disabled={sendingReply || !replyText.trim()}
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all disabled:opacity-40"
                    style={{ background: "#008069" }}
                  >
                    {sendingReply ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <SendHorizonal className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══ SEND NEW TAB ═══ */}
      {mainTab === "send" && (
        <div
          className="flex-1 overflow-y-auto p-6"
          style={{ background: panelBg }}
        >
          {!isConnected ? (
            <div className="flex flex-col items-center justify-center h-full">
              <WifiOff className="w-12 h-12 mb-4" style={{ color: textSub }} />
              <p className="text-sm font-bold" style={{ color: textSub }}>
                اتصل بالواتساب أولاً
              </p>
              <button
                onClick={() => setMainTab("settings")}
                className="mt-4 px-6 py-2 rounded-xl font-bold text-white text-sm"
                style={{ background: "#008069" }}
              >
                إعدادات الربط
              </button>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              <h2 className="text-xl font-black" style={{ color: textMain }}>
                📤 إرسال رسالة جديدة
              </h2>

              {/* Send Mode Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSendMode("manual")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm transition-all ${sendMode === "manual" ? "text-white" : ""}`}
                  style={
                    sendMode === "manual"
                      ? { background: "#008069" }
                      : {
                          background: dark ? "#2a3942" : "#f0f2f5",
                          color: textSub,
                        }
                  }
                >
                  <Phone className="w-4 h-4" />
                  رقم يدوي
                </button>
                <button
                  onClick={() => setSendMode("students")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm transition-all ${sendMode === "students" ? "text-white" : ""}`}
                  style={
                    sendMode === "students"
                      ? { background: "#008069" }
                      : {
                          background: dark ? "#2a3942" : "#f0f2f5",
                          color: textSub,
                        }
                  }
                >
                  <Users className="w-4 h-4" />
                  اختر طلاب ({students.length})
                </button>
              </div>

              {/* Manual Phone */}
              {sendMode === "manual" && (
                <div className="relative">
                  <Phone
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: textSub }}
                  />
                  <input
                    type="text"
                    placeholder="رقم الهاتف (01012345678)"
                    value={sendPhone}
                    onChange={(e) => setSendPhone(e.target.value)}
                    className="w-full pr-12 pl-4 py-3 rounded-xl text-sm font-bold outline-none"
                    style={{
                      background: inputBg,
                      color: textMain,
                      border: `1px solid ${borderC}`,
                    }}
                  />
                  <p
                    className="text-[10px] font-bold mt-1 mr-1"
                    style={{ color: textSub }}
                  >
                    سيتم إضافة كود الدولة (2) تلقائياً
                  </p>
                </div>
              )}

              {/* Student Picker */}
              {sendMode === "students" && (
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ border: `1px solid ${borderC}` }}
                >
                  <div
                    className="flex items-center gap-2 p-2"
                    style={{ background: dark ? "#202c33" : "#f0f2f5" }}
                  >
                    <div className="relative flex-1">
                      <Search
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                        style={{ color: textSub }}
                      />
                      <input
                        type="text"
                        placeholder="بحث عن طالب..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="w-full pr-9 pl-3 py-2 rounded-lg text-xs font-bold outline-none"
                        style={{ background: inputBg, color: textMain }}
                      />
                    </div>
                    <button
                      onClick={selectAllStudents}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-black shrink-0 transition-all"
                      style={{
                        background:
                          selectedStudents.length === filteredStudents.length &&
                          filteredStudents.length > 0
                            ? "#008069"
                            : dark
                              ? "#2a3942"
                              : "#e5e7eb",
                        color:
                          selectedStudents.length === filteredStudents.length &&
                          filteredStudents.length > 0
                            ? "#fff"
                            : textSub,
                      }}
                    >
                      {selectedStudents.length === filteredStudents.length &&
                      filteredStudents.length > 0 ? (
                        <CheckSquare className="w-3.5 h-3.5" />
                      ) : (
                        <Square className="w-3.5 h-3.5" />
                      )}
                      الكل ({filteredStudents.length})
                    </button>
                  </div>
                  {selectedStudents.length > 0 && (
                    <div
                      className="px-3 py-1.5 text-xs font-black"
                      style={{ background: "#005c4b22", color: "#00a884" }}
                    >
                      ✅ تم اختيار {selectedStudents.length} طالب
                    </div>
                  )}
                  <div className="max-h-[200px] overflow-y-auto">
                    {studentsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2
                          className="w-6 h-6 animate-spin"
                          style={{ color: textSub }}
                        />
                      </div>
                    ) : filteredStudents.length === 0 ? (
                      <div
                        className="text-center py-6 text-xs font-bold"
                        style={{ color: textSub }}
                      >
                        لا يوجد طلاب
                      </div>
                    ) : (
                      filteredStudents.map((s) => {
                        const sel = selectedStudents.includes(s.id);
                        return (
                          <button
                            key={s.id}
                            onClick={() => toggleStudent(s.id)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-right transition-all border-b"
                            style={{
                              background: sel
                                ? dark
                                  ? "#005c4b22"
                                  : "#d9fdd3"
                                : "transparent",
                              borderColor: borderC,
                            }}
                          >
                            {sel ? (
                              <CheckSquare
                                className="w-4 h-4 shrink-0"
                                style={{ color: "#00a884" }}
                              />
                            ) : (
                              <Square
                                className="w-4 h-4 shrink-0"
                                style={{ color: textSub }}
                              />
                            )}
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                              style={{ background: "#8696a0" }}
                            >
                              {s.name?.charAt(0) || "?"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span
                                className="text-sm font-black block truncate"
                                style={{ color: textMain }}
                              >
                                {s.name}
                              </span>
                              <span
                                className="text-[10px] font-bold block"
                                style={{ color: textSub }}
                              >
                                {s.phone || "لا يوجد رقم"}
                              </span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Type Tabs */}
              <div className="flex flex-wrap gap-1">
                {SEND_TYPES.map((t) => {
                  const I = t.icon;
                  const active = sendType === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSendType(t.id);
                        setSendResult(null);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black transition-all ${active ? "text-white" : ""}`}
                      style={
                        active
                          ? { background: "#008069" }
                          : {
                              background: dark ? "#2a3942" : "#f0f2f5",
                              color: textSub,
                            }
                      }
                    >
                      <I className="w-3.5 h-3.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Variables Bar */}
              {sendType === "text" && (
                <div
                  className="rounded-xl p-3"
                  style={{
                    background: dark ? "#1a2730" : "#f8f9fa",
                    border: `1px solid ${borderC}`,
                  }}
                >
                  <p
                    className="text-xs font-black mb-2"
                    style={{ color: textSub }}
                  >
                    📌 أدخل متغيرات (يتم استبدالها بمعلومات كل طالب)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { v: "{name}", label: "اسم الطالب", color: "#3b82f6" },
                      { v: "{phone}", label: "رقم الهاتف", color: "#10b981" },
                      { v: "{id}", label: "ID الطالب", color: "#f59e0b" },
                    ].map((item) => (
                      <button
                        key={item.v}
                        onClick={() => insertVar(item.v)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-black text-white transition-all hover:-translate-y-0.5 active:scale-95"
                        style={{ background: item.color }}
                      >
                        <code className="text-[10px]">{item.v}</code>{" "}
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <p
                    className="text-[10px] font-bold mt-2"
                    style={{ color: textSub }}
                  >
                    💡 سيتم إضافة ID عشوائي في أول وآخر كل رسالة تلقائياً
                  </p>
                </div>
              )}

              {/* Text Field + Preview */}
              {sendType === "text" && (
                <>
                  <textarea
                    placeholder={"اكتب رسالتك... مثال: مرحباً {name} 👋"}
                    value={sendMsg}
                    onChange={(e) => setSendMsg(e.target.value)}
                    rows={4}
                    className="w-full p-4 rounded-xl text-sm font-bold outline-none resize-none"
                    style={{
                      background: inputBg,
                      color: textMain,
                      border: `1px solid ${borderC}`,
                    }}
                  />
                  {sendMsg && (
                    <div
                      className="rounded-xl p-3"
                      style={{
                        background: dark ? "#005c4b" : "#d9fdd3",
                        border: `1px solid ${dark ? "#005c4b66" : "#b8e6b0"}`,
                      }}
                    >
                      <p
                        className="text-[10px] font-black mb-1"
                        style={{ color: dark ? "#a3c9a8" : "#3a6f3e" }}
                      >
                        👁️ معاينة:
                      </p>
                      <pre
                        className="text-xs font-bold whitespace-pre-wrap leading-relaxed"
                        style={{ color: textMain }}
                      >
                        {`#ABC123\n${replaceVars(sendMsg, { name: "أحمد محمد", phone: "01012345678", id: "42" })}\n#ABC123`}
                      </pre>
                    </div>
                  )}
                </>
              )}

              {/* Image/File */}
              {(sendType === "image" || sendType === "file") && (
                <>
                  <label
                    className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all"
                    style={{
                      borderColor: file64 ? "#008069" : borderC,
                      background: file64
                        ? dark
                          ? "#005c4b22"
                          : "#d9fdd3"
                        : "transparent",
                    }}
                  >
                    {sendType === "image" ? (
                      <ImageIcon
                        className="w-8 h-8"
                        style={{ color: file64 ? "#008069" : textSub }}
                      />
                    ) : (
                      <FileText
                        className="w-8 h-8"
                        style={{ color: file64 ? "#008069" : textSub }}
                      />
                    )}
                    <span
                      className="text-xs font-bold"
                      style={{ color: textSub }}
                    >
                      {file64
                        ? `✅ ${fileNm}`
                        : sendType === "image"
                          ? "اختر صورة"
                          : "اختر ملف"}
                    </span>
                    <input
                      type="file"
                      accept={sendType === "image" ? "image/*" : "*"}
                      className="hidden"
                      onChange={handleFilePick}
                    />
                  </label>
                  <input
                    type="text"
                    placeholder="عنوان (يدعم {name} {phone})"
                    value={sendCaption}
                    onChange={(e) => setSendCaption(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm font-bold outline-none"
                    style={{
                      background: inputBg,
                      color: textMain,
                      border: `1px solid ${borderC}`,
                    }}
                  />
                </>
              )}
              {sendType === "location" && (
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Latitude"
                    value={sendLat}
                    onChange={(e) => setSendLat(e.target.value)}
                    className="px-4 py-3 rounded-xl text-sm font-bold outline-none"
                    style={{
                      background: inputBg,
                      color: textMain,
                      border: `1px solid ${borderC}`,
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Longitude"
                    value={sendLng}
                    onChange={(e) => setSendLng(e.target.value)}
                    className="px-4 py-3 rounded-xl text-sm font-bold outline-none"
                    style={{
                      background: inputBg,
                      color: textMain,
                      border: `1px solid ${borderC}`,
                    }}
                  />
                  <input
                    type="text"
                    placeholder="اسم المكان"
                    value={sendTitle}
                    onChange={(e) => setSendTitle(e.target.value)}
                    className="col-span-2 px-4 py-3 rounded-xl text-sm font-bold outline-none"
                    style={{
                      background: inputBg,
                      color: textMain,
                      border: `1px solid ${borderC}`,
                    }}
                  />
                </div>
              )}
              {sendType === "link" && (
                <>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={sendUrl}
                    onChange={(e) => setSendUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm font-bold outline-none"
                    style={{
                      background: inputBg,
                      color: textMain,
                      border: `1px solid ${borderC}`,
                    }}
                  />
                  <input
                    type="text"
                    placeholder="رسالة مرفقة (اختياري)"
                    value={sendCaption}
                    onChange={(e) => setSendCaption(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm font-bold outline-none"
                    style={{
                      background: inputBg,
                      color: textMain,
                      border: `1px solid ${borderC}`,
                    }}
                  />
                </>
              )}
              {sendType === "contact" && (
                <>
                  <input
                    type="text"
                    placeholder="رقم جهة الاتصال"
                    value={sendContactPhone}
                    onChange={(e) => setSendContactPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm font-bold outline-none"
                    style={{
                      background: inputBg,
                      color: textMain,
                      border: `1px solid ${borderC}`,
                    }}
                  />
                  <input
                    type="text"
                    placeholder="اسم جهة الاتصال"
                    value={sendContactName}
                    onChange={(e) => setSendContactName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm font-bold outline-none"
                    style={{
                      background: inputBg,
                      color: textMain,
                      border: `1px solid ${borderC}`,
                    }}
                  />
                </>
              )}

              {/* Bulk Progress */}
              {bulkProgress && (
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: dark ? "#1a2730" : "#f0f9ff",
                    border: `1px solid ${borderC}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-xs font-black"
                      style={{ color: textMain }}
                    >
                      ⏳ جاري الإرسال...
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: textSub }}
                    >
                      {bulkProgress.current}/{bulkProgress.total}
                    </span>
                  </div>
                  <div
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{ background: dark ? "#2a3942" : "#e5e7eb" }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(bulkProgress.current / bulkProgress.total) * 100}%`,
                        background: "#00a884",
                      }}
                    />
                  </div>
                  <div className="flex gap-4 mt-2">
                    <span className="text-[10px] font-bold text-emerald-500">
                      ✅ {bulkProgress.success} نجح
                    </span>
                    {bulkProgress.failed > 0 && (
                      <span className="text-[10px] font-bold text-red-500">
                        ❌ {bulkProgress.failed} فشل
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Send Button */}
              <button
                onClick={handleSendNew}
                disabled={
                  sending ||
                  (sendMode === "manual" && !sendPhone.trim()) ||
                  (sendMode === "students" && selectedStudents.length === 0)
                }
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-white transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-40"
                style={{
                  background: "#008069",
                  boxShadow: "0 8px 24px rgba(0,128,105,0.25)",
                }}
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <SendHorizonal className="w-5 h-5" />
                )}
                {sendMode === "students"
                  ? `إرسال لـ ${selectedStudents.length} طالب`
                  : "إرسال"}
              </button>
              {sendResult && (
                <div
                  className={`p-3 rounded-xl text-sm font-bold text-center ${sendResult.ok ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"}`}
                >
                  {sendResult.msg}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
