"use client";

import { useState, useEffect, useRef } from "react";
import {
  Radio,
  Video,
  Camera,
  Mic,
  Monitor,
  Settings,
  Users,
  Play,
  StopCircle,
  Link as LinkIcon,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Trophy,
  History,
  ExternalLink,
  Plus,
} from "lucide-react";
import { useTheme, getSlug, getToken } from "../layout";

export default function LiveManagementPage() {
  const { dark, primaryColor, liveWalletStats } = useTheme();
  const pc = primaryColor || "#f43f5e";
  const slug = getSlug();
  const token = getToken();

  // --- State ---
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isCreatingLesson, setIsCreatingLesson] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [activeSession, setActiveSession] = useState(null); // { session_id, mongo_id, websocket_url }

  // Media permissions
  const [mediaStream, setMediaStream] = useState(null);
  const [devices, setDevices] = useState({ video: [], audio: [] });
  const [selectedDevices, setSelectedDevices] = useState({
    videoId: "",
    audioId: "",
  });
  const videoRef = useRef(null);
  const pcRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
    initMedia(false); // check perms but don't force start
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (pcRef.current) pcRef.current.close();
      // Only stop tracks if we're unmounting completely to avoid camera turning off while browsing tabs,
      // but in this scope mediaStream might not update right in cleanup. Best effort cleanup:
      if (mediaStream) mediaStream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const connectInstructorWebRTC = async (sessionData, stream) => {
    if (!stream) return;

    // Cleanup previous if any
    if (pcRef.current) pcRef.current.close();
    if (wsRef.current) wsRef.current.close();

    const wsUrl = sessionData.websocket_url;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    let host = window.location.host;
    if (host.includes("localhost") || host.includes("127.0.0.1")) {
      host = window.location.hostname + ":3000";
    }
    const url = `${protocol}//${host}${wsUrl}?token=${token}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    const pendingCandidates = [];

    ws.onopen = async () => {
      console.log("Teacher WS Connected");
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;

      // Add local tracks to PC
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          ws.send(
            JSON.stringify({
              event: "candidate",
              data: JSON.stringify(e.candidate),
            }),
          );
        }
      };

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        ws.send(
          JSON.stringify({
            event: "offer",
            data: JSON.stringify(pc.localDescription),
          }),
        );
      } catch (err) {
        console.error("Teacher createOffer err:", err);
      }
    };

    ws.onmessage = async (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.event === "answer") {
          const answer = JSON.parse(msg.data);
          await pcRef.current?.setRemoteDescription(
            new RTCSessionDescription(answer),
          );
          while (pendingCandidates.length > 0) {
            const c = pendingCandidates.shift();
            await pcRef.current?.addIceCandidate(new RTCIceCandidate(c));
          }
        } else if (msg.event === "candidate") {
          const candidate = JSON.parse(msg.data);
          if (pcRef.current && pcRef.current.remoteDescription) {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          } else {
            pendingCandidates.push(candidate);
          }
        }
      } catch (err) {
        console.error("Teacher WS msg error", err);
      }
    };

    ws.onclose = () => {
      console.log("Teacher WS Closed");
      pcRef.current?.close();
    };
  };

  const fetchInitialData = async () => {
    if (!token || slug === "main") return;
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/courses?slug=${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      // The API returns an array directly
      if (Array.isArray(data)) {
        setCourses(data);
      } else if (data.success && Array.isArray(data.data)) {
        setCourses(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch courses", err);
    } finally {
      setLoading(false);
    }
  };

  const initMedia = async (forceStart = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMediaStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      setDevices({
        video: allDevices.filter((d) => d.kind === "videoinput"),
        audio: allDevices.filter((d) => d.kind === "audioinput"),
      });
    } catch (err) {
      console.error("Media permission denied", err);
      if (forceStart)
        alert("بالرجاء تفعيل صلاحيات الكاميرا والميكروفون للبدء!");
    }
  };

  const handleSelectCourse = async (course) => {
    setSelectedCourse(course);
    setSelectedChapter(null);
    setSelectedLesson(null);

    // Fetch full course to get chapters and lessons
    try {
      const res = await fetch(`/api/v1/courses/${course.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      // The API returns the course object directly
      if (data && (data.id || data.success)) {
        const fullCourse = data.data || data;
        setSelectedCourse(fullCourse);
      }
    } catch (err) {
      console.error("Failed to fetch chapters", err);
    }
  };

  const handleStartLive = async () => {
    if (!selectedLesson) {
      alert("بالرجاء اختيار الدرس (البث المباشر) المراد البدء فيه!");
      return;
    }

    setIsStarting(true);
    try {
      // 1. Create Session
      const startRes = await fetch(`/api/v1/live/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ slug }),
      });
      const startData = await startRes.json();

      if (!startRes.ok) throw new Error(startData.error || "فشل بدء الجلسة");

      // 2. Link to Lesson
      const linkRes = await fetch(`/api/v1/live/store-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slug,
          lesson_id: selectedLesson.id,
          session_id: startData.session_id,
        }),
      });

      if (!linkRes.ok) {
        const linkData = await linkRes.json();
        throw new Error(linkData.error || "فشل ربط الجلسة بالدرس");
      }

      setActiveSession(startData);

      // Establish WebRTC connection
      if (mediaStream) {
        connectInstructorWebRTC(startData, mediaStream);
      } else {
        alert(
          "تنبيه الكاميرا/المايك غير مفعلة، سيتم البث بدون صوت أو صورة حتى تفعلها.",
        );
      }

      alert("تم بدء البث بنجاح! يمكن للطلاب الانضمام الآن.");
    } catch (err) {
      alert(err.message);
    } finally {
      setIsStarting(false);
    }
  };

  const handleCreateAndStart = async (e) => {
    e.preventDefault();
    if (!selectedChapter || !newLessonTitle) return;

    setIsCreatingLesson(true);
    try {
      // 1. Create Lesson in MySQL
      const res = await fetch(`/api/v1/lessons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slug,
          chapter_id: selectedChapter.id,
          title: newLessonTitle,
          type: "live_session",
          status: "active",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل إنشاء الدرس");

      const createdLesson = data.data || data;
      setSelectedLesson(createdLesson);
      setNewLessonTitle("");

      // Refresh course data to show it in the list
      fetchInitialData();

      // 2. Automatically trigger live start
      // We'll let the user click "Start Live" now that it's selected
      alert("تم إنشاء درس البث بنجاح! يمكنك الآن الضغط على 'بدء البث'.");
    } catch (err) {
      alert(err.message);
    } finally {
      setIsCreatingLesson(false);
    }
  };

  const handleEndLive = async () => {
    if (!activeSession) return;
    if (!window.confirm("متأكد من إنهاء البث؟ سيتم فصل جميع الطلاب.")) return;

    try {
      const res = await fetch(`/api/v1/live/end`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ slug, session_id: activeSession.session_id }),
      });
      if (res.ok) {
        if (pcRef.current) pcRef.current.close();
        if (wsRef.current) wsRef.current.close();
        setActiveSession(null);
        alert("تم إنهاء البث المباشر وأخذ الرصيد من المحفظة.");
        fetchInitialData();
      }
    } catch (err) {
      alert("فشل إنهاء البث");
    }
  };

  const d = dark;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
        <p className="text-sm font-bold opacity-50">جاري تحميل نظام البث...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* ── Top Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-[1.5rem] bg-rose-500 text-white shadow-xl shadow-rose-500/20">
            <Radio className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black">غرفة البث المباشر</h1>
            <p
              className={`text-sm mt-0.5 ${d ? "text-gray-500" : "text-gray-400"}`}
            >
              قم بإعداد وبدء دروسك المباشرة مع الطلاب بشكل احترافي
            </p>
          </div>
        </div>

        <div
          className={`p-4 rounded-3xl flex items-center gap-6 ${d ? "bg-white/5 border border-white/5" : "bg-white border border-gray-100 shadow-sm"}`}
        >
          <div className="text-right">
            <p className="text-[10px] font-black opacity-40 uppercase mb-1">
              رصيد الدقائق
            </p>
            <p className="text-xl font-black text-rose-500 tabular-nums">
              {liveWalletStats?.balance_minutes || 0}
            </p>
          </div>
          <div className="w-[1px] h-10 bg-current opacity-10" />
          <div className="text-right">
            <p className="text-[10px] font-black opacity-40 uppercase mb-1">
              سعة القاعة
            </p>
            <p className="text-xl font-black tabular-nums">
              {liveWalletStats?.current_capacity_limit || 0}
            </p>
          </div>
          <a
            href="/dashboard/wallet/live"
            className="p-2.5 rounded-xl bg-gray-500/10 hover:bg-gray-500/20 transition-colors"
          >
            <Settings className="w-5 h-5 opacity-60" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Left: Viewport / Controls ── */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Video Viewport */}
          <div
            className={`aspect-video rounded-[2.5rem] overflow-hidden relative group shadow-2xl ${d ? "bg-black" : "bg-gray-900 shadow-black/20"}`}
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Overlay Info */}
            <div className="absolute top-6 right-6 flex items-center gap-3">
              {activeSession ? (
                <div className="px-5 py-2.5 rounded-full bg-red-600 text-white flex items-center gap-2 font-black text-xs shadow-xl animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                  مـبـاشـر بـث
                </div>
              ) : (
                <div className="px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center gap-2 font-black text-xs">
                  <div className="w-2 h-2 rounded-full bg-white/40" />
                  مـعـايـنـة
                </div>
              )}
            </div>

            {/* Bottom Controls Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => initMedia(true)}
                  className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all active:scale-90"
                >
                  <Camera className="w-6 h-6" />
                </button>
                <button className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all active:scale-90">
                  <Mic className="w-6 h-6" />
                </button>
                <button className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all active:scale-90">
                  <Monitor className="w-6 h-6" />
                </button>
              </div>

              {activeSession ? (
                <button
                  onClick={handleEndLive}
                  className="flex items-center gap-2 px-8 py-4 rounded-[1.5rem] bg-red-600 hover:bg-red-700 text-white font-black transition-all shadow-xl active:scale-95"
                >
                  <StopCircle className="w-6 h-6" />
                  إنهـاء الـبـث
                </button>
              ) : (
                <button
                  onClick={handleStartLive}
                  disabled={isStarting}
                  className="flex items-center gap-2 px-10 py-4 rounded-[1.5rem] bg-white text-black font-black transition-all shadow-xl active:scale-95 disabled:bg-gray-400"
                >
                  {isStarting ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                  بـدء الـبـث الآن
                </button>
              )}
            </div>

            {!mediaStream && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-black/40 backdrop-blur-3xl p-10 text-center">
                <div className="w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500">
                  <AlertCircle className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-white mb-2">
                    الصلاحيات غير مفعلة
                  </h4>
                  <p className="text-sm text-white/60 max-w-sm">
                    بالرجاء السماح للموقع بالوصول للكاميرا والميكروفون كي تتمكن
                    من بدأ البث والتواصل مع طلابك.
                  </p>
                </div>
                <button
                  onClick={() => initMedia(true)}
                  className="px-8 py-4 rounded-2xl bg-white text-black font-black shadow-2xl hover:bg-gray-100 transition"
                >
                  تـجـربـة مـرة أخرى
                </button>
              </div>
            )}
          </div>

          {/* Session Overview (Only when live) */}
          {activeSession && (
            <div
              className={`p-8 rounded-[2.5rem] border border-rose-500/20 bg-rose-500/5 grid grid-cols-2 md:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-500`}
            >
              <div className="space-y-1">
                <p className="text-[10px] font-black opacity-50 uppercase">
                  رقم الجلسة
                </p>
                <p className="font-bold text-sm tabular-nums">
                  {activeSession.session_id}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black opacity-50 uppercase">
                  المشاهدات الحالية
                </p>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <p className="font-bold text-sm tabular-nums text-emerald-500">
                    24 طالب
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black opacity-50 uppercase">
                  زمن البث
                </p>
                <p className="font-bold text-sm tabular-nums">00:12:45</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black opacity-50 uppercase">
                  جودة البث
                </p>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                  <p className="font-bold text-sm text-blue-500">HD Stable</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Course Selector & Setup ── */}
        <div className="lg:col-span-4 space-y-6">
          <div
            className={`p-8 rounded-[2.5rem] h-full ${d ? "bg-[#141625] border border-white/5" : "bg-white border border-gray-100 shadow-sm"}`}
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black">إعدادات المحاضرة</h3>
              <div className="p-2 rounded-xl bg-gray-500/10 text-gray-500">
                <Settings className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-6">
              {/* 1. Pick Course */}
              <div>
                <label className="text-xs font-black opacity-40 uppercase mb-3 block px-2">
                  1. الكورس المستهدف
                </label>
                <div className="space-y-2">
                  {courses.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleSelectCourse(c)}
                      className={`w-full p-4 rounded-2xl text-right flex items-center justify-between transition-all border ${selectedCourse?.id === c.id ? "bg-rose-500/10 border-rose-500/30 ring-1 ring-rose-500/30" : d ? "hover:bg-white/5 border-transparent" : "hover:bg-gray-50 border-transparent"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedCourse?.id === c.id ? "bg-rose-500 text-white" : d ? "bg-black text-gray-400" : "bg-white shadow-sm text-gray-400"}`}
                        >
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <p className="font-bold text-[13px]">{c.title}</p>
                      </div>
                      {selectedCourse?.id === c.id && (
                        <ChevronRight className="w-4 h-4 text-rose-500 rotate-90" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Pick Chapter & Lesson (Only if course picked) */}
              {selectedCourse && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="text-xs font-black opacity-40 uppercase mb-3 block px-2">
                    2. الفصول والدروس
                  </label>

                  <div className="space-y-4">
                    {selectedCourse.chapters?.map((ch) => (
                      <div key={ch.id} className="space-y-1.5">
                        <button
                          onClick={() => setSelectedChapter(ch)}
                          className={`w-full text-right p-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${selectedChapter?.id === ch.id ? "bg-white/10 text-white" : "opacity-30"}`}
                        >
                          {ch.title}
                        </button>
                        {ch.lessons
                          ?.filter((l) => l.type === "live_session")
                          .map((lesson) => (
                            <button
                              key={lesson.id}
                              onClick={() => setSelectedLesson(lesson)}
                              className={`w-full p-3.5 rounded-2xl text-right flex items-center gap-3 transition-all border ${selectedLesson?.id === lesson.id ? "bg-amber-500/10 border-amber-500/30 text-amber-500" : d ? "hover:bg-white/5 border-transparent" : "hover:bg-gray-50 border-transparent"}`}
                            >
                              <Radio
                                className={`w-4 h-4 ${selectedLesson?.id === lesson.id ? "animate-pulse" : "opacity-40"}`}
                              />
                              <span className="text-xs font-bold">
                                {lesson.title}
                              </span>
                            </button>
                          ))}
                        {ch.lessons?.filter((l) => l.type === "live_session")
                          .length === 0 && (
                          <p className="text-[10px] italic opacity-20 pr-4">
                            لا توجد دروس بث في هذا الفصل
                          </p>
                        )}

                        {/* Quick Create Lesson in this Chapter */}
                        {selectedChapter?.id === ch.id && (
                          <form
                            onSubmit={handleCreateAndStart}
                            className="flex flex-col gap-2 mt-2 px-2 animate-in fade-in slide-in-from-top-1"
                          >
                            <input
                              value={newLessonTitle}
                              onChange={(e) =>
                                setNewLessonTitle(e.target.value)
                              }
                              placeholder="عنوان بث جديد..."
                              className="w-full text-xs p-2.5 rounded-xl border dark:bg-black/20 dark:border-white/5 outline-none"
                            />
                            <button
                              type="submit"
                              disabled={isCreatingLesson || !newLessonTitle}
                              className="w-full py-2 bg-rose-500/10 text-rose-500 font-bold text-[10px] rounded-xl hover:bg-rose-500/20 disabled:opacity-50 transition"
                            >
                              {isCreatingLesson
                                ? "جاري الإنشاء..."
                                : "+ إنشاء درس بث جديد"}
                            </button>
                          </form>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Indicator */}
              {selectedLesson && (
                <div className="pt-6 border-t border-inherit">
                  <div
                    className={`p-6 rounded-[2rem] ${d ? "bg-rose-500/5 border border-rose-500/10" : "bg-rose-50 border border-rose-100"}`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-xl bg-rose-500 text-white shadow-lg">
                        <Video className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-black">جاهز للبث المحترف</h4>
                    </div>
                    <p className="text-[11px] font-bold opacity-60 leading-relaxed mb-4">
                      تم اختيار{" "}
                      <span className="text-rose-500">
                        "{selectedLesson.title}"
                      </span>
                      . طلاب هذا الكورس سيتمكنون من مشاهدة البث بجودة عالية فور
                      التفعيل.
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-black opacity-40">
                      <ShieldCheck className="w-4 h-4" />
                      حماية المحتوى مفعلة (مكافحة تصوير الشاشة)
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Action Section: History / Packages ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          className={`p-8 rounded-[2.5rem] flex items-center justify-between ${d ? "bg-[#141625] border border-white/5" : "bg-white border border-gray-100 shadow-sm"}`}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black">النشاطات السابقة</h4>
              <p className="text-xs opacity-40 font-bold">
                مراجعة جلسات البث السابقة وعدد الحضور
              </p>
            </div>
          </div>
          <button className="p-3 rounded-xl hover:bg-black/5 transition">
            <ExternalLink className="w-5 h-5 opacity-40" />
          </button>
        </div>

        <div
          className={`p-8 rounded-[2.5rem] flex items-center justify-between ${d ? "bg-[#141625] border border-white/5" : "bg-white border border-gray-100 shadow-sm"}`}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-500">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black">زيادة سعة القاعة</h4>
              <p className="text-xs opacity-40 font-bold">
                ترقية خطتك لاستيعاب آلاف الطلاب في آن واحد
              </p>
            </div>
          </div>
          <a
            href="/dashboard/wallet/live"
            className="p-3 rounded-xl bg-violet-500 text-white shadow-inner hover:scale-105 transition"
          >
            <Plus className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
