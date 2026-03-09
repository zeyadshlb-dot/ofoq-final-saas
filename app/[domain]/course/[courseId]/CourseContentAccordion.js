"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import "plyr/dist/plyr.css";
import { Loader2 } from "lucide-react";

// Dynamic import of PDF viewer (client-only, avoids DOMMatrix SSR crash)
const InlinePDFViewer = dynamic(() => import("./InlinePDFViewer"), {
  ssr: false,
});

/* ═══════════════════════════════════════════════════════════
   CONTENT PROTECTION SYSTEM
   ═══════════════════════════════════════════════════════════ */
function useContentProtection(containerRef, isActive) {
  useEffect(() => {
    if (!isActive) return;

    // 1. Block right-click
    const onContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // 2. Block keyboard shortcuts (PrintScreen, Ctrl+S, Ctrl+P, F12, etc)
    const onKeyDown = (e) => {
      if (
        e.key === "PrintScreen" ||
        (e.ctrlKey &&
          ["s", "p", "u", "c", "j", "i"].includes(e.key.toLowerCase())) ||
        e.key === "F12" ||
        (e.ctrlKey &&
          e.shiftKey &&
          ["i", "j", "c"].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // 3. Detect tab switching / screen capture
    const onVisibilityChange = () => {
      const el = containerRef?.current;
      if (!el) return;
      if (document.hidden) {
        el.classList.add("content-hidden");
      } else {
        setTimeout(() => el.classList.remove("content-hidden"), 300);
      }
    };

    // 4. Detect PiP (Picture in Picture)
    const onPipEnter = () => {
      const el = containerRef?.current;
      if (el) el.classList.add("content-hidden");
    };
    const onPipLeave = () => {
      const el = containerRef?.current;
      if (el) el.classList.remove("content-hidden");
    };

    // 5. Block drag
    const onDragStart = (e) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("dragstart", onDragStart);

    const videos = containerRef?.current?.querySelectorAll("video") || [];
    videos.forEach((v) => {
      v.addEventListener("enterpictureinpicture", onPipEnter);
      v.addEventListener("leavepictureinpicture", onPipLeave);
      v.disablePictureInPicture = true;
    });

    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("dragstart", onDragStart);
      videos.forEach((v) => {
        v.removeEventListener("enterpictureinpicture", onPipEnter);
        v.removeEventListener("leavepictureinpicture", onPipLeave);
      });
    };
  }, [isActive, containerRef]);
}

/* Protection CSS injected once */
function ContentProtectionStyles() {
  return (
    <style>{`
      .content-protected {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
      }
      .content-protected video {
        pointer-events: auto;
      }
      .content-protected video::-webkit-media-controls-enclosure {
        /* Keep controls but prevent download */
      }
      .content-hidden video,
      .content-hidden canvas {
        filter: blur(30px) brightness(0.3) !important;
        transition: filter 0.15s ease;
      }
      .content-hidden .watermark-overlay {
        font-size: 3rem !important;
        opacity: 0.8 !important;
      }
      /* Anti-screenshot: overlay on focus-loss */
      .content-hidden::after {
        content: '🔒 المحتوى محمي — لا يمكن تسجيل الشاشة';
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0,0,0,0.9);
        color: #f43f5e;
        font-size: 1.2rem;
        font-weight: 900;
        z-index: 9999;
        direction: rtl;
        text-align: center;
        padding: 2rem;
      }
      /* Multiple watermark grid */
      .watermark-grid {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 50;
        overflow: hidden;
      }
      .watermark-grid-inner {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(3, 1fr);
        width: 100%;
        height: 100%;
        gap: 0;
      }
      .watermark-grid-item {
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(255,255,255,0.08);
        font-size: clamp(10px, 2vw, 16px);
        font-weight: 900;
        transform: rotate(-25deg);
        user-select: none;
        pointer-events: none;
        line-height: 1.3;
        text-align: center;
      }
    `}</style>
  );
}

/* Static watermark grid that covers the entire video */
function WatermarkGrid({ studentName, studentPhone }) {
  if (!studentName) return null;
  const cells = Array(9).fill(null);
  return (
    <div className="watermark-grid">
      <div className="watermark-grid-inner">
        {cells.map((_, i) => (
          <div key={i} className="watermark-grid-item">
            <div>
              <div>{studentName}</div>
              {studentPhone && (
                <div dir="ltr" style={{ fontSize: "0.8em" }}>
                  {studentPhone}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Animated Watermark for Live Player
function LiveWatermark({ studentName, studentPhone }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;
    let x = Math.random() * 60 + 10,
      y = Math.random() * 60 + 10;
    let dx = 0.35 + Math.random() * 0.2,
      dy = 0.25 + Math.random() * 0.15;
    let rafId;
    function tick() {
      const pw = parent.offsetWidth,
        ph = parent.offsetHeight;
      const ew = el.offsetWidth,
        eh = el.offsetHeight;
      x += dx;
      y += dy;
      if (x + ew >= pw || x <= 0) dx = -dx;
      if (y + eh >= ph || y <= 0) dy = -dy;
      x = Math.max(0, Math.min(x, pw - ew));
      y = Math.max(0, Math.min(y, ph - eh));
      el.style.transform = `translate(${x}px, ${y}px)`;
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);
  return (
    <div
      ref={ref}
      className="absolute top-0 left-0 pointer-events-none select-none watermark-overlay"
      style={{ zIndex: 100, willChange: "transform", whiteSpace: "nowrap" }}
    >
      <div
        style={{
          color: "rgba(255,255,255,0.35)",
          fontSize: "clamp(18px, 3vw, 28px)",
          fontWeight: 900,
          letterSpacing: "2px",
          userSelect: "none",
          lineHeight: 1.5,
        }}
      >
        <div>{studentName}</div>
        {studentPhone && <div dir="ltr">{studentPhone}</div>}
      </div>
    </div>
  );
}

// Dynamic import for Live Player (WebRTC/WS)
function InlineLivePlayer({ lesson, onClose, studentName, studentPhone }) {
  const videoRef = useRef(null);
  const pcRef = useRef(null);
  const wsRef = useRef(null);
  const liveContainerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionData, setSessionData] = useState(null);

  useContentProtection(liveContainerRef, !loading && !error);

  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (pcRef.current) pcRef.current.close();
    };
  }, []);

  const connectStudentWebRTC = (wsUrl) => {
    // Cleanup previous connection
    if (pcRef.current) pcRef.current.close();
    if (wsRef.current) wsRef.current.close();

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    let host = window.location.host;
    if (host.includes("localhost") || host.includes("127.0.0.1")) {
      host = window.location.hostname + ":3000";
    }
    const url = `${protocol}//${host}${wsUrl}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    const pendingCandidates = [];
    let isReconnecting = false;

    ws.onopen = async () => {
      console.log("Student WS Connected");
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;

      pc.oniceconnectionstatechange = () => {
        console.log("ICE State:", pc.iceConnectionState);
        if (pc.iceConnectionState === "failed") {
          console.warn("ICE Failed, retrying...");
          setTimeout(() => connectStudentWebRTC(wsUrl), 2000);
        }
      };

      // Ensure we can receive audio/video
      pc.addTransceiver("video", { direction: "recvonly" });
      pc.addTransceiver("audio", { direction: "recvonly" });

      pc.ontrack = (event) => {
        console.log(
          "Student received track:",
          event.track.kind,
          event.track.id,
        );
        event.track.onunmute = () =>
          console.log("Track unmuted:", event.track.kind);
        event.track.onmute = () =>
          console.log("Track muted:", event.track.kind);

        if (videoRef.current) {
          if (!videoRef.current.srcObject) {
            videoRef.current.srcObject = new MediaStream();
          }
          videoRef.current.srcObject.addTrack(event.track);

          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              console.warn("Autoplay blocked, trying muted...", err);
              if (videoRef.current) {
                videoRef.current.muted = true;
                videoRef.current.play();
              }
            });
          }
        }
      };

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
        console.error("Student createOffer err:", err);
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
        } else if (msg.event === "teacher_joined") {
          if (isReconnecting) return;
          isReconnecting = true;
          console.log("Teacher joined or added a track! Reconnecting in 1s...");
          setTimeout(() => {
            connectStudentWebRTC(wsUrl);
            isReconnecting = false;
          }, 1000);
        }
      } catch (err) {
        console.error("Student WS msg error", err);
      }
    };

    ws.onclose = (event) => {
      console.log("Student WS Closed", event.code, event.reason);
      pcRef.current?.close();
    };
  };

  useEffect(() => {
    const joinLive = async () => {
      const token = localStorage.getItem("student_token");
      try {
        // Fetch up-to-date course info to avoid stale live_session_id if instructor restarted
        const courseRes = await fetch(
          `/api/v1/courses/${lesson.course_id || window.location.pathname.split("/").pop()}`,
          { cache: "no-store" },
        );
        let upToDateSessionId = lesson.session_id || lesson.live_session_id;

        if (courseRes.ok) {
          const courseData = await courseRes.json();
          const foundLesson = courseData.chapters
            ?.flatMap((c) => c.lessons)
            ?.find((l) => l.id === lesson.id);
          if (foundLesson && foundLesson.live_session_id) {
            upToDateSessionId = foundLesson.live_session_id;
          }
        }

        const res = await fetch(`/api/v1/live/join/${upToDateSessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "فشل الانضمام للبث");

        setSessionData(data);
        connectStudentWebRTC(data.websocket_url);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    joinLive();
  }, [lesson.id]);

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black">
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#0f1117] text-white border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-base leading-tight">
              بث مباشر: {lesson.title}
            </h3>
            <span className="text-[10px] text-red-400 font-black animate-pulse uppercase tracking-widest">
              Live Now
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/60 text-sm font-bold transition-all border border-white/5"
        >
          إغلاق
        </button>
      </div>

      <div
        className="aspect-video relative bg-gray-900 flex items-center justify-center content-protected"
        ref={liveContainerRef}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-4 text-white/40">
            <Loader2 className="w-10 h-10 animate-spin" />
            <span className="text-sm font-bold">جاري الاتصال بالبث...</span>
          </div>
        ) : error ? (
          <div className="text-center p-10">
            <p className="text-red-400 font-bold mb-2">⚠️ {error}</p>
            <p className="text-xs text-white/40">
              قد يكون البث قد انتهى أو وصلت القاعة للحد الأقصى
            </p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              controls
              controlsList="nodownload noremoteplayback"
              disablePictureInPicture
              onContextMenu={(e) => e.preventDefault()}
              className="w-full h-full object-contain"
            />
            <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-black flex items-center gap-2 z-[60]">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              🔴 LIVE
            </div>
            {/* Animated floating watermark */}
            {studentName && (
              <LiveWatermark
                studentName={studentName}
                studentPhone={studentPhone}
              />
            )}
            {/* Static grid watermark */}
            <WatermarkGrid
              studentName={studentName}
              studentPhone={studentPhone}
            />
          </>
        )}
        <ContentProtectionStyles />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// INLINE VIDEO PLAYER (Plyr + HLS quality switcher)
// ─────────────────────────────────────────────────
function InlineVideoPlayer({ lesson, onClose, studentName, studentPhone }) {
  const videoRef = useRef(null);
  const plyrRef = useRef(null);
  const hlsRef = useRef(null);
  const watermarkRef = useRef(null);
  const animFrameRef = useRef(null);
  const videoContainerRef = useRef(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  useContentProtection(videoContainerRef, ready);

  // Watermark animation: moves randomly across the video container
  useEffect(() => {
    if (!ready || !studentName) return;
    const el = watermarkRef.current;
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;

    let x = Math.random() * 60 + 10; // start at 10-70%
    let y = Math.random() * 60 + 10;
    let dx = 0.3 + Math.random() * 0.2; // speed px per frame
    let dy = 0.2 + Math.random() * 0.15;

    function animate() {
      const pw = parent.offsetWidth;
      const ph = parent.offsetHeight;
      const ew = el.offsetWidth;
      const eh = el.offsetHeight;

      x += dx;
      y += dy;

      if (x + ew >= pw || x <= 0) dx = -dx;
      if (y + eh >= ph || y <= 0) dy = -dy;

      // Clamp
      if (x < 0) x = 0;
      if (y < 0) y = 0;
      if (x + ew > pw) x = pw - ew;
      if (y + eh > ph) y = ph - eh;

      el.style.transform = `translate(${x}px, ${y}px)`;
      animFrameRef.current = requestAnimationFrame(animate);
    }

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [ready, studentName]);

  const lastSyncTimeRef = useRef(0);
  const syncProgress = useCallback(
    async (currentTime, isCompleted = false) => {
      const token = localStorage.getItem("student_token");
      if (!token || !lesson?.id) return;

      // Sync every 10 seconds or when completed
      const now = Date.now();
      if (!isCompleted && now - lastSyncTimeRef.current < 10000) return;

      lastSyncTimeRef.current = now;

      try {
        await fetch("/api/v1/lessons/progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            lesson_id: lesson.id,
            progress_seconds: Math.floor(currentTime),
            is_completed: isCompleted,
          }),
        });
      } catch (e) {
        console.error("Failed to sync progress", e);
      }
    },
    [lesson?.id],
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !lesson?.video_url) return;

    const url = lesson.video_url;
    const isHLS = url.includes(".m3u8");
    const isYoutube = url.includes("youtube.com") || url.includes("youtu.be");
    const isVimeo = url.includes("vimeo.com");

    const setupPlyrEvents = (player) => {
      player.on("timeupdate", (event) => {
        const instance = event.detail.plyr;
        syncProgress(instance.currentTime);
      });
      player.on("ended", (event) => {
        const instance = event.detail.plyr;
        syncProgress(instance.currentTime, true);
      });
    };

    Promise.all([
      import("plyr").then((m) => m.default),
      isHLS ? import("hls.js").then((m) => m.default) : Promise.resolve(null),
    ])
      .then(([Plyr, Hls]) => {
        if (isYoutube || isVimeo) {
          const provider = isYoutube ? "youtube" : "vimeo";
          let videoId = "";
          if (isYoutube) {
            const m = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
            videoId = m ? m[1] : "";
          } else {
            const m = url.match(/vimeo\.com\/(\d+)/);
            videoId = m ? m[1] : "";
          }
          video.setAttribute("data-plyr-provider", provider);
          video.setAttribute("data-plyr-embed-id", videoId);
          plyrRef.current = new Plyr(video, {
            controls: [
              "play-large",
              "play",
              "progress",
              "current-time",
              "duration",
              "mute",
              "volume",
              "settings",
              "fullscreen",
            ],
            settings: ["quality", "speed"],
            autoplay: true,
            i18n: { speed: "السرعة", quality: "الجودة", normal: "عادي" },
          });
          setupPlyrEvents(plyrRef.current);
          setReady(true);
          return;
        }

        if (isHLS && Hls && Hls.isSupported()) {
          const hls = new Hls({ maxBufferLength: 30, maxMaxBufferLength: 60 });
          hlsRef.current = hls;
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            const levels = hls.levels.map((l) => l.height);
            const defaultQuality = levels[levels.length - 1];
            plyrRef.current = new Plyr(video, {
              controls: [
                "play-large",
                "play",
                "rewind",
                "fast-forward",
                "progress",
                "current-time",
                "duration",
                "mute",
                "volume",
                "settings",
                "pip",
                "fullscreen",
              ],
              settings: ["quality", "speed"],
              quality: {
                default: defaultQuality,
                options: levels,
                forced: true,
                onChange: (q) => {
                  hls.levels.forEach((l, i) => {
                    if (l.height === q) hls.currentLevel = i;
                  });
                },
              },
              speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
              autoplay: true,
              i18n: { speed: "السرعة", quality: "الجودة", normal: "عادي" },
            });
            setupPlyrEvents(plyrRef.current);
            setReady(true);
            video.play().catch(() => {});
          });
          hls.on(Hls.Events.ERROR, (_, d) => {
            if (d.fatal) setError("حدث خطأ في تشغيل الفيديو");
          });
          return;
        }

        if (isHLS && video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (!isHLS) {
          video.src = url;
        } else {
          setError("المتصفح لا يدعم تشغيل فيديو HLS");
          return;
        }

        plyrRef.current = new Plyr(video, {
          controls: [
            "play-large",
            "play",
            "rewind",
            "fast-forward",
            "progress",
            "current-time",
            "duration",
            "mute",
            "volume",
            "settings",
            "pip",
            "fullscreen",
          ],
          settings: ["speed"],
          speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
          autoplay: true,
          i18n: { speed: "السرعة", quality: "الجودة", normal: "عادي" },
        });
        setupPlyrEvents(plyrRef.current);
        setReady(true);
        video.play().catch(() => {});
      })
      .catch(() => setError("فشل تحميل مشغل الفيديو"));

    return () => {
      if (plyrRef.current) {
        plyrRef.current.destroy();
        plyrRef.current = null;
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [lesson?.video_url]);

  const isEmbed =
    lesson?.video_url?.includes("youtube.com") ||
    lesson?.video_url?.includes("youtu.be") ||
    lesson?.video_url?.includes("vimeo.com");

  return (
    <div
      className="w-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10"
      ref={videoContainerRef}
    >
      {/* Premium Header Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#0f1117] text-white border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-black text-base leading-tight">
              {lesson.title}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              {lesson.is_free_preview && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20">
                  عرض مجاني 🎁
                </span>
              )}
              {lesson.video_duration_seconds > 0 && (
                <span className="text-[11px] text-white/40 font-bold">
                  {Math.floor(lesson.video_duration_seconds / 60)} دقيقة
                </span>
              )}
              <span className="text-[9px] text-white/20 font-bold flex items-center gap-1">
                🔒 محمي
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/60 text-sm font-bold transition-all border border-white/5 hover:border-red-500/20"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          إغلاق
        </button>
      </div>

      {/* Video Container */}
      <div
        className="bg-black relative content-protected"
        style={{ minHeight: "300px" }}
      >
        {error ? (
          <div className="aspect-video flex items-center justify-center text-red-400 text-lg font-bold bg-[#0a0a0a]">
            <div className="text-center space-y-2">
              <div className="text-4xl">❌</div>
              <div>{error}</div>
            </div>
          </div>
        ) : (
          <>
            {!ready && (
              <div className="aspect-video flex items-center justify-center bg-[#0a0a0a]">
                <div className="flex flex-col items-center gap-4 text-white/50">
                  <div className="relative">
                    <div className="w-12 h-12 border-3 border-emerald-500/30 rounded-full" />
                    <div className="absolute inset-0 w-12 h-12 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <span className="text-sm font-bold">
                    جاري تحميل المشغل...
                  </span>
                </div>
              </div>
            )}
            {isEmbed ? (
              <div
                ref={videoRef}
                data-plyr-provider={
                  lesson.video_url.includes("vimeo") ? "vimeo" : "youtube"
                }
                data-plyr-embed-id=""
              />
            ) : (
              <video
                ref={videoRef}
                className={`w-full ${ready ? "" : "hidden"}`}
                crossOrigin="anonymous"
                playsInline
                controlsList="nodownload noremoteplayback"
                disablePictureInPicture
                onContextMenu={(e) => e.preventDefault()}
              />
            )}
          </>
        )}

        {/* Floating Animated Watermark */}
        {studentName && ready && (
          <div
            ref={watermarkRef}
            className="absolute top-0 left-0 pointer-events-none select-none watermark-overlay"
            style={{
              zIndex: 100,
              willChange: "transform",
              whiteSpace: "nowrap",
            }}
          >
            <div
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: "clamp(18px, 3vw, 28px)",
                fontWeight: 900,
                letterSpacing: "2px",
                userSelect: "none",
                lineHeight: 1.5,
              }}
            >
              <div>{studentName}</div>
              {studentPhone && <div dir="ltr">{studentPhone}</div>}
            </div>
          </div>
        )}

        {/* Static Grid Watermark */}
        {studentName && ready && (
          <WatermarkGrid
            studentName={studentName}
            studentPhone={studentPhone}
          />
        )}

        <ContentProtectionStyles />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// INLINE EXAM PLAYER
// ─────────────────────────────────────────────────
function InlineExamPlayer({ lesson, onClose }) {
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState({}); // { questionId: optionId }
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [activeAttempt, setActiveAttempt] = useState(null);
  const [shuffledQuestions, setShuffledQuestions] = useState(null);
  const timerRef = useRef(null);
  const submittedRef = useRef(false);

  // Fetch exam metadata just to show the intro
  useEffect(() => {
    if (!lesson?.exam_id) {
      setError("لا يوجد امتحان مرتبط بهذا الدرس");
      setLoading(false);
      return;
    }
    fetch(`/api/v1/exams/${lesson.exam_id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setExam(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [lesson?.exam_id]);

  const startExam = async () => {
    setLoading(true);
    const token = localStorage.getItem("student_token");
    try {
      const res = await fetch("/api/v1/exams/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ exam_id: lesson.exam_id }),
      });
      const data = await res.json();
      if (res.ok) {
        setActiveAttempt(data);
        setStarted(true);
        if (data.remaining_seconds > 0) setTimeLeft(data.remaining_seconds);
        // Ensure options are populated properly
        const qs = data.questions || [];
        setShuffledQuestions(
          qs.map((q) => ({
            ...q,
            _displayOptions: q.options || [],
          })),
        );
      } else {
        setError(data.error || "لا يمكن بدء هذا الامتحان");
      }
    } catch (err) {
      setError("حدث خطأ في بدء الامتحان");
    } finally {
      setLoading(false);
    }
  };

  const saveAnswer = async (qId, answerVal) => {
    setAnswers((prev) => ({ ...prev, [qId]: answerVal }));
    const token = localStorage.getItem("student_token");
    if (!token || !activeAttempt) return;
    try {
      await fetch("/api/v1/exams/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          attempt_id: activeAttempt.attempt_id,
          question_id: qId,
          answer_text: typeof answerVal === "string" ? answerVal : "",
          answer_json:
            typeof answerVal === "string" ? "" : JSON.stringify(answerVal),
        }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const doSubmit = async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setLoading(true);
    const token = localStorage.getItem("student_token");
    if (!token || !activeAttempt) return;
    try {
      const res = await fetch("/api/v1/exams/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ attempt_id: activeAttempt.attempt_id }),
      });
      const data = await res.json();
      if (res.ok) {
        setScore({
          correct: data.score,
          total: data.total_points,
          percentage: data.percentage,
          passed: data.passed,
        });
        if (data.answers && data.answers.length > 0) {
          setExam((prev) => ({ ...prev, questions: data.answers }));
        } else {
          setExam((prev) => ({ ...prev, questions: shuffledQuestions }));
        }
        setSubmitted(true);
      } else {
        setError(data.error || "خطأ في تسليم الامتحان");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (!started || timeLeft === null || timeLeft <= 0 || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          doSubmit(); // Auto-submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started, submitted]);

  const fmtTime = (s) => {
    if (s === null || s === undefined) return "--:--";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // Find correct option text for a question
  const getCorrectText = (q) => {
    const opts = Array.isArray(q.options) ? q.options : [];
    const correct = opts.find((o) => o.is_correct);
    return correct
      ? correct.text || correct.label || correct.id || q.correct_answer
      : q.correct_answer || "—";
  };

  // Find user answer text
  const getUserAnswerText = (q) => {
    // If backend already provided your_answer
    const rawAnswer = q.your_answer || q.your_answer_json;
    if (rawAnswer) {
      const cleanRaw =
        typeof rawAnswer === "string" ? rawAnswer.replace(/"/g, "") : rawAnswer;
      const opts = Array.isArray(q.options) ? q.options : [];
      const chosen = opts.find((o) => String(o.id) === String(cleanRaw));
      return chosen ? chosen.text || chosen.label : cleanRaw;
    }

    const userOptId = answers[q.id];
    if (!userOptId) return null;
    const opts = Array.isArray(q.options) ? q.options : [];
    const chosen = opts.find((o) => o.id === userOptId);
    return chosen ? chosen.text || chosen.label : userOptId;
  };

  // Check if user answer is correct for a question
  const isUserCorrect = (q) => {
    if (q.is_correct !== undefined) return q.is_correct; // Use backend result if available

    const userOptId = answers[q.id];
    if (!userOptId) return false;
    const opts = Array.isArray(q.options) ? q.options : [];
    const chosen = opts.find((o) => o.id === userOptId);
    return chosen ? !!chosen.is_correct : false;
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between px-5 py-3 rounded-t-2xl bg-gradient-to-l from-violet-600 to-indigo-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              📝
            </div>
            <h3 className="font-black text-lg">{lesson.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-all"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            إغلاق
          </button>
        </div>
        <div className="rounded-b-2xl border-2 border-t-0 border-violet-600/30 p-10 flex items-center justify-center bg-white dark:bg-[#1A1A1A]">
          <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between px-5 py-3 rounded-t-2xl bg-gradient-to-l from-red-600 to-rose-700 text-white">
          <h3 className="font-black text-lg">خطأ</h3>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold"
          >
            إغلاق
          </button>
        </div>
        <div className="rounded-b-2xl border-2 border-t-0 border-red-600/30 p-10 text-center bg-white dark:bg-[#1A1A1A]">
          <p className="text-red-500 font-bold">❌ {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 rounded-t-2xl bg-gradient-to-l from-violet-600 to-indigo-700 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
            📝
          </div>
          <div>
            <h3 className="font-black text-lg leading-tight">
              {exam?.title || lesson.title}
            </h3>
            <span className="text-xs text-white/70 font-bold">
              🎁 عرض مجاني
              {exam?.questions_count > 0 && ` • ${exam.questions_count} سؤال`}
              {exam?.duration_minutes > 0 &&
                ` • ${exam.duration_minutes} دقيقة`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {started && timeLeft !== null && !submitted && (
            <div
              className={`px-4 py-2 rounded-xl font-mono font-black text-lg ${timeLeft < 60 ? "bg-red-500/20 text-red-300 animate-pulse" : "bg-white/10 text-white"}`}
            >
              ⏱ {fmtTime(timeLeft)}
            </div>
          )}
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-all"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            إغلاق
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="rounded-b-2xl border-2 border-t-0 border-violet-600/30 bg-white dark:bg-[#1A1A1A] overflow-hidden">
        {/* ── INTRO SCREEN ── */}
        {!started && !submitted && (
          <div className="p-10 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-violet-500/10 flex items-center justify-center text-4xl">
              📋
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
              {exam?.title}
            </h2>
            {exam?.description && (
              <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                {exam.description}
              </p>
            )}

            <div className="flex flex-wrap justify-center gap-3 text-sm">
              {exam?.questions_count > 0 && (
                <span className="px-4 py-2 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 font-bold">
                  📊 {exam.questions_count} سؤال
                </span>
              )}
              {exam?.duration_minutes > 0 && (
                <span className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
                  ⏱ {exam.duration_minutes} دقيقة
                </span>
              )}
              {exam?.passing_score > 0 && (
                <span className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                  🎯 درجة النجاح: {exam.passing_score}%
                </span>
              )}
              {exam?.max_attempts > 0 && (
                <span className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold">
                  🔄 الحد الأقصى: {exam.max_attempts} محاولة
                </span>
              )}
              {exam?.attempts_count > 0 && (
                <span className="px-4 py-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold">
                  📈 تمت {exam.attempts_count} محاولة حتى الآن
                </span>
              )}
            </div>

            <button
              onClick={startExam}
              className="px-10 py-4 rounded-2xl text-white font-black text-lg transition-all hover:-translate-y-1 hover:shadow-xl active:scale-95"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                boxShadow: "0 8px 30px rgba(139, 92, 246, 0.3)",
              }}
            >
              🚀 ابدأ الامتحان
            </button>
          </div>
        )}

        {/* ── QUESTIONS ── */}
        {started && !submitted && shuffledQuestions && (
          <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
            {shuffledQuestions.map((q, idx) => {
              const displayOpts = q._displayOptions || [];
              return (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/30 space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 w-9 h-9 rounded-xl bg-violet-500 text-white font-black flex items-center justify-center text-sm">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 dark:text-white text-lg leading-relaxed">
                        {q.question_text}
                      </p>
                      {q.points && q.points !== 1 && (
                        <span className="text-xs text-violet-500 font-bold">
                          ({q.points} درجة)
                        </span>
                      )}
                      {q.full_image_url && (
                        <img
                          src={q.full_image_url}
                          alt=""
                          className="mt-3 rounded-xl max-h-52 object-contain"
                        />
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-12">
                    {displayOpts.map((opt, oi) => {
                      const optId = opt.id || `opt_${oi}`;
                      const optText =
                        typeof opt === "string"
                          ? opt
                          : opt.text || opt.label || JSON.stringify(opt);
                      const isSelected = answers[q.id] === optId;
                      return (
                        <button
                          key={optId}
                          type="button"
                          onClick={() => saveAnswer(q.id, optId)}
                          className={`p-4 rounded-xl border-2 text-right font-bold transition-all text-sm ${
                            isSelected
                              ? "border-violet-500 bg-violet-500/10 text-violet-700 dark:text-violet-300 shadow-md scale-[1.02]"
                              : "border-gray-200 dark:border-white/10 hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-500/5 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <span className="inline-flex items-center gap-2">
                            <span
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? "border-violet-500 bg-violet-500" : "border-gray-300 dark:border-gray-600"}`}
                            >
                              {isSelected && (
                                <svg
                                  className="w-3.5 h-3.5 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </span>
                            {optText}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Submit bar */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-500">
                  📊 أجبت على {Object.keys(answers).length} من{" "}
                  {shuffledQuestions.length} سؤال
                </span>
                {timeLeft !== null && (
                  <span
                    className={`text-sm font-mono font-bold ${timeLeft < 60 ? "text-red-500 animate-pulse" : "text-gray-400"}`}
                  >
                    ⏱ {fmtTime(timeLeft)}
                  </span>
                )}
              </div>
              <button
                onClick={doSubmit}
                className="px-8 py-3 rounded-xl text-white font-black transition-all hover:-translate-y-0.5 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                  boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)",
                }}
              >
                ✅ تسليم الامتحان
              </button>
            </div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {submitted && score && (
          <div className="p-10 text-center space-y-6">
            <div
              className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center text-5xl font-black border-4 ${score.passed ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600" : "border-red-500 bg-red-50 dark:bg-red-500/10 text-red-600"}`}
            >
              {score.percentage}%
            </div>
            <h2
              className={`text-3xl font-black ${score.passed ? "text-emerald-600" : "text-red-600"}`}
            >
              {score.passed ? "🎉 مبروك! نجحت!" : "😔 للأسف لم تنجح"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              حصلت على{" "}
              <strong className="text-gray-900 dark:text-white">
                {score.correct}
              </strong>{" "}
              من{" "}
              <strong className="text-gray-900 dark:text-white">
                {score.total}
              </strong>{" "}
              درجة
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <span className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 font-bold">
                ✅ {exam.questions.filter((q) => isUserCorrect(q)).length} صحيحة
              </span>
              <span className="px-4 py-2 rounded-xl bg-red-500/10 text-red-600 font-bold">
                ❌{" "}
                {
                  exam.questions.filter(
                    (q) => answers[q.id] && !isUserCorrect(q),
                  ).length
                }{" "}
                خاطئة
              </span>
              <span className="px-4 py-2 rounded-xl bg-gray-500/10 text-gray-500 font-bold">
                ⏭ {exam.questions.filter((q) => !answers[q.id]).length} لم تُجب
              </span>
            </div>

            {/* Review answers */}
            {exam?.questions && exam?.show_correct_answers !== false && (
              <div className="text-right space-y-4 max-w-2xl mx-auto mt-6">
                <h3 className="font-black text-lg border-b pb-2 dark:border-white/10">
                  📋 مراجعة الإجابات
                </h3>
                {exam.questions.map((q, idx) => {
                  const correct = isUserCorrect(q);
                  const userText = getUserAnswerText(q);
                  const correctText = getCorrectText(q);
                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border-2 ${correct ? "border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-500/5" : "border-red-500/30 bg-red-50/50 dark:bg-red-500/5"}`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-lg">
                          {correct ? "✅" : answers[q.id] ? "❌" : "⏭"}
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {idx + 1}. {q.question_text}
                        </span>
                      </div>
                      {userText && !correct && (
                        <p className="text-red-500 text-sm font-bold mr-7">
                          إجابتك: {userText}
                        </p>
                      )}
                      {!userText && (
                        <p className="text-gray-400 text-sm font-bold mr-7">
                          لم تُجب على هذا السؤال
                        </p>
                      )}
                      <p className="text-emerald-600 dark:text-emerald-400 text-sm font-bold mr-7">
                        ✓ الإجابة الصحيحة: {correctText}
                      </p>
                      {q.explanation && (
                        <p className="text-gray-500 text-xs mr-7 mt-1">
                          💡 {q.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={onClose}
              className="mt-4 px-8 py-3 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-white/15 transition-all"
            >
              إغلاق النتيجة
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// ACCORDION COMPONENT
// ─────────────────────────────────────────────────
export default function CourseContentAccordion({
  chapters,
  isSubscribed,
  studentName,
  studentPhone,
}) {
  const [openChapterId, setOpenChapterId] = useState(
    chapters && chapters.length > 0 ? chapters[0].id : null,
  );
  const [activeLesson, setActiveLesson] = useState(null); // { ...lesson, _viewType: "video" | "exam" }
  const playerContainerRef = useRef(null);

  if (!chapters || chapters.length === 0) {
    return (
      <div className="text-gray-500 py-4 text-center">
        لا يوجد محتوى مضاف لهذا الكورس حتى الآن.
      </div>
    );
  }

  const toggleChapter = (id) => {
    setOpenChapterId(openChapterId === id ? null : id);
  };

  const handlePlayLesson = (lesson, viewType) => {
    const isFree = lesson.is_free_preview;
    const canView = isSubscribed || isFree;

    if (!canView) return;

    setActiveLesson({ ...lesson, _viewType: viewType });
    setTimeout(() => {
      playerContainerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* ===== INLINE PLAYER (Video or Exam) ===== */}
      <div ref={playerContainerRef}>
        {activeLesson && activeLesson._viewType === "video" && (
          <div className="mb-8">
            <InlineVideoPlayer
              lesson={activeLesson}
              onClose={() => setActiveLesson(null)}
              studentName={studentName}
              studentPhone={studentPhone}
            />
          </div>
        )}
        {activeLesson && activeLesson._viewType === "exam" && (
          <div className="mb-8">
            <InlineExamPlayer
              lesson={activeLesson}
              onClose={() => setActiveLesson(null)}
            />
          </div>
        )}
        {activeLesson && activeLesson._viewType === "pdf" && (
          <div className="mb-8">
            <InlinePDFViewer
              lesson={activeLesson}
              onClose={() => setActiveLesson(null)}
            />
          </div>
        )}
        {activeLesson && activeLesson._viewType === "live_session" && (
          <div className="mb-8">
            <InlineLivePlayer
              lesson={activeLesson}
              onClose={() => setActiveLesson(null)}
              studentName={studentName}
              studentPhone={studentPhone}
            />
          </div>
        )}
      </div>

      {/* ===== CHAPTER ACCORDION ===== */}
      {chapters.map((chapter) => {
        const isOpen = openChapterId === chapter.id;
        const lessons = chapter.lessons || [];

        return (
          <div key={chapter.id} className="mb-5">
            <button
              className="w-full"
              type="button"
              aria-expanded={isOpen}
              onClick={() => toggleChapter(chapter.id)}
            >
              <div className="flex justify-between items-center bg-gray-50 dark:bg-white/5 clr-text-primary px-6 py-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 hover:border-blue-500/30 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center text-xl">
                    📁
                  </div>
                  <span className="font-h2 font-w-bold text-lg md:text-xl font-bold">
                    {chapter.title}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-full">
                    {lessons.length} درس
                  </span>
                  <span
                    className={`transform transition-transform duration-300 text-slate-400 ${isOpen ? "rotate-180" : "rotate-0"}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </div>
              </div>
            </button>

            {isOpen && (
              <div className="mt-4 px-4 space-y-3">
                {lessons.length > 0 ? (
                  lessons.map((lesson) => {
                    const hasVideo =
                      lesson.type === "video" && lesson.video_url;
                    const hasExam = lesson.type === "exam" && lesson.exam_id;
                    const hasPdf =
                      lesson.type === "pdf" &&
                      (lesson.full_pdf_url || lesson.pdf_path);
                    const isPlaying =
                      activeLesson && activeLesson.id === lesson.id;
                    const isFree = lesson.is_free_preview;
                    const canView = isSubscribed || isFree;

                    return (
                      <div key={lesson.id} className="w-full">
                        <div
                          className={`flex flex-row justify-between px-5 py-4 rounded-2xl smooth transition-all ${
                            isPlaying
                              ? "bg-blue-600 shadow-xl shadow-blue-500/20 text-white"
                              : "bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-blue-500/50"
                          }`}
                        >
                          <div className="flex flex-row flex-center-both gap-4 items-center">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                                isPlaying
                                  ? "bg-white/20 text-white"
                                  : lesson.type === "video"
                                    ? "bg-blue-500/10 text-blue-500"
                                    : lesson.type === "pdf"
                                      ? "bg-green-500/10 text-green-500"
                                      : "bg-violet-500/10 text-violet-500"
                              }`}
                            >
                              {lesson.type === "video"
                                ? "🎬"
                                : lesson.type === "exam"
                                  ? "📝"
                                  : lesson.type === "pdf"
                                    ? "📄"
                                    : "📡"}
                            </div>
                            <div className="flex flex-col text-right">
                              <div
                                className={`font-bold pb-1 flex items-center gap-2 ${isPlaying ? "text-white" : "text-gray-900 dark:text-white"}`}
                              >
                                <div className="flex items-center gap-2">
                                  {lesson.title}
                                  {lesson.type === "live_session" && (
                                    <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-black animate-pulse">
                                      LIVE 📡
                                    </span>
                                  )}
                                  {!isSubscribed && isFree && (
                                    <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-black">
                                      عرض مجاني 🎁
                                    </span>
                                  )}
                                </div>
                                {isPlaying && (
                                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                                )}
                              </div>
                              {lesson.description && (
                                <div
                                  className={`text-xs ${isPlaying ? "text-white/70" : "text-gray-500 dark:text-gray-400"}`}
                                >
                                  {lesson.description}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {canView ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handlePlayLesson(lesson, lesson.type)
                                }
                                className={`px-5 py-2 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 active:scale-95 ${
                                  isPlaying
                                    ? "bg-white text-blue-600"
                                    : isFree && !isSubscribed
                                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                                      : "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                }`}
                              >
                                {isPlaying
                                  ? "إيقاف"
                                  : isFree && !isSubscribed
                                    ? "مشاهدة مجانًا"
                                    : lesson.type === "live_session"
                                      ? "انضمام للبث"
                                      : "مشاهدة الآن"}
                              </button>
                            ) : (
                              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-gray-100 dark:bg-white/5 px-4 py-2 rounded-xl border border-gray-100 dark:border-white/5">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                                </svg>
                                محتوى مقفل
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-center text-gray-500 py-6 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                    لا توجد دروس مضافة لهذا الفصل بعد.
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
