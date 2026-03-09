"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// ─── Drawing history entry ───
// { type: "path", points: [{x,y}], color, width, tool }
// { type: "text", x, y, text, color, fontSize }

export default function InlinePDFViewer({ lesson, onClose }) {
  // PDF state
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Annotation state
  const [activeTool, setActiveTool] = useState(null); // null | "pen" | "highlighter" | "eraser" | "text" | "rect" | "circle" | "arrow"
  const [drawColor, setDrawColor] = useState("#ef4444");
  const [drawWidth, setDrawWidth] = useState(3);
  const [history, setHistory] = useState([]); // all drawn items per page: { [pageNum]: [...items] }
  const [undoStack, setUndoStack] = useState({});
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  const [startPoint, setStartPoint] = useState(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [textInput, setTextInput] = useState(null); // { x, y } for text placement
  const [textValue, setTextValue] = useState("");

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const pageContainerRef = useRef(null);

  // PDF URL through proxy
  const pdfUrl = lesson.pdf_path ? `/public/storage/${lesson.pdf_path}` : null;

  const onDocumentLoadSuccess = useCallback(({ numPages: n }) => {
    setNumPages(n);
    setLoading(false);
  }, []);

  const onDocumentLoadError = useCallback(
    (err) => {
      console.error("PDF load error:", err);
      setError(
        `فشل تحميل ملف PDF: ${err?.message || "خطأ غير معروف"}\nURL: ${pdfUrl}`,
      );
      setLoading(false);
    },
    [pdfUrl],
  );

  // Navigation
  const goNext = () => setCurrentPage((p) => Math.min(p + 1, numPages || 1));
  const goPrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const zoomIn = () => setScale((s) => Math.min(s + 0.2, 3));
  const zoomOut = () => setScale((s) => Math.max(s - 0.2, 0.5));

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (textInput) return; // don't intercept when typing
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goNext();
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goPrev();
      }
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zoomIn();
      }
      if (e.key === "-") {
        e.preventDefault();
        zoomOut();
      }
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [numPages, textInput]);

  // Prevent context menu
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const h = (e) => e.preventDefault();
    el.addEventListener("contextmenu", h);
    return () => el.removeEventListener("contextmenu", h);
  }, []);

  // ─── Canvas drawing logic ───
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const handleMouseDown = (e) => {
    if (!activeTool) return;

    if (activeTool === "text") {
      const coords = getCanvasCoords(e);
      setTextInput(coords);
      setTextValue("");
      return;
    }

    setIsDrawing(true);
    const coords = getCanvasCoords(e);
    setStartPoint(coords);
    setCurrentPath([coords]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !activeTool) return;
    const coords = getCanvasCoords(e);
    setCurrentPath((prev) => [...prev, coords]);
    drawLive(coords);
  };

  const handleMouseUp = () => {
    if (!isDrawing || !activeTool) return;
    setIsDrawing(false);

    if (activeTool === "eraser") {
      // Eraser: remove items near the path
      const pageItems = history[currentPage] || [];
      const erasePath = currentPath;
      const remaining = pageItems.filter((item) => {
        if (item.type === "path") {
          return !item.points.some((pt) =>
            erasePath.some((ep) => Math.hypot(pt.x - ep.x, pt.y - ep.y) < 15),
          );
        }
        if (item.type === "text") {
          return !erasePath.some(
            (ep) => Math.hypot(item.x - ep.x, item.y - ep.y) < 25,
          );
        }
        return true;
      });
      setHistory((prev) => ({ ...prev, [currentPage]: remaining }));
    } else if (["pen", "highlighter"].includes(activeTool)) {
      const item = {
        type: "path",
        points: currentPath,
        color: activeTool === "highlighter" ? drawColor + "60" : drawColor,
        width: activeTool === "highlighter" ? drawWidth * 4 : drawWidth,
        tool: activeTool,
      };
      addHistoryItem(item);
    } else if (["rect", "circle", "arrow"].includes(activeTool) && startPoint) {
      const endCoord = currentPath[currentPath.length - 1] || startPoint;
      const item = {
        type: "shape",
        shape: activeTool,
        start: startPoint,
        end: endCoord,
        color: drawColor,
        width: drawWidth,
      };
      addHistoryItem(item);
    }

    setCurrentPath([]);
    setStartPoint(null);
    redrawCanvas();
  };

  const addHistoryItem = (item) => {
    setHistory((prev) => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] || []), item],
    }));
    // Clear redo stack
    setUndoStack((prev) => ({ ...prev, [currentPage]: [] }));
  };

  const handleUndo = () => {
    const pageItems = history[currentPage] || [];
    if (pageItems.length === 0) return;
    const last = pageItems[pageItems.length - 1];
    setHistory((prev) => ({
      ...prev,
      [currentPage]: prev[currentPage].slice(0, -1),
    }));
    setUndoStack((prev) => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] || []), last],
    }));
  };

  const handleRedo = () => {
    const redoItems = undoStack[currentPage] || [];
    if (redoItems.length === 0) return;
    const last = redoItems[redoItems.length - 1];
    setHistory((prev) => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] || []), last],
    }));
    setUndoStack((prev) => ({
      ...prev,
      [currentPage]: prev[currentPage].slice(0, -1),
    }));
  };

  const handleClearPage = () => {
    setHistory((prev) => ({ ...prev, [currentPage]: [] }));
    setUndoStack((prev) => ({ ...prev, [currentPage]: [] }));
    redrawCanvas();
  };

  const handleAddText = () => {
    if (!textInput || !textValue.trim()) {
      setTextInput(null);
      return;
    }
    addHistoryItem({
      type: "text",
      x: textInput.x,
      y: textInput.y,
      text: textValue.trim(),
      color: drawColor,
      fontSize: 16 * scale,
    });
    setTextInput(null);
    setTextValue("");
  };

  // ─── Canvas rendering ───
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = pageContainerRef.current;
    if (!canvas || !container) return;
    const pageEl = container.querySelector(".react-pdf__Page");
    if (!pageEl) return;
    canvas.width = pageEl.offsetWidth;
    canvas.height = pageEl.offsetHeight;
    canvas.style.width = pageEl.offsetWidth + "px";
    canvas.style.height = pageEl.offsetHeight + "px";
    redrawCanvas();
  }, [currentPage, scale, history]);

  useEffect(() => {
    const timer = setTimeout(resizeCanvas, 300);
    return () => clearTimeout(timer);
  }, [currentPage, scale, resizeCanvas, loading]);

  const drawLive = (coord) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    if (activeTool === "pen" || activeTool === "eraser") {
      if (currentPath.length < 2) return;
      const prev = currentPath[currentPath.length - 2];
      ctx.beginPath();
      ctx.strokeStyle = activeTool === "eraser" ? "#ffffff" : drawColor;
      ctx.lineWidth = activeTool === "eraser" ? 20 : drawWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(coord.x, coord.y);
      ctx.stroke();
    } else if (activeTool === "highlighter") {
      if (currentPath.length < 2) return;
      const prev = currentPath[currentPath.length - 2];
      ctx.beginPath();
      ctx.strokeStyle = drawColor + "60";
      ctx.lineWidth = drawWidth * 4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalCompositeOperation = "multiply";
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(coord.x, coord.y);
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
    }
  };

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const items = history[currentPage] || [];
    items.forEach((item) => {
      if (item.type === "path") {
        if (item.points.length < 2) return;
        ctx.beginPath();
        ctx.strokeStyle = item.color;
        ctx.lineWidth = item.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        if (item.tool === "highlighter")
          ctx.globalCompositeOperation = "multiply";
        ctx.moveTo(item.points[0].x, item.points[0].y);
        for (let i = 1; i < item.points.length; i++) {
          ctx.lineTo(item.points[i].x, item.points[i].y);
        }
        ctx.stroke();
        ctx.globalCompositeOperation = "source-over";
      } else if (item.type === "shape") {
        ctx.strokeStyle = item.color;
        ctx.lineWidth = item.width;
        ctx.lineCap = "round";
        if (item.shape === "rect") {
          ctx.strokeRect(
            item.start.x,
            item.start.y,
            item.end.x - item.start.x,
            item.end.y - item.start.y,
          );
        } else if (item.shape === "circle") {
          const rx = Math.abs(item.end.x - item.start.x) / 2;
          const ry = Math.abs(item.end.y - item.start.y) / 2;
          const cx = (item.start.x + item.end.x) / 2;
          const cy = (item.start.y + item.end.y) / 2;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else if (item.shape === "arrow") {
          const angle = Math.atan2(
            item.end.y - item.start.y,
            item.end.x - item.start.x,
          );
          const headLen = 15;
          ctx.beginPath();
          ctx.moveTo(item.start.x, item.start.y);
          ctx.lineTo(item.end.x, item.end.y);
          ctx.lineTo(
            item.end.x - headLen * Math.cos(angle - Math.PI / 6),
            item.end.y - headLen * Math.sin(angle - Math.PI / 6),
          );
          ctx.moveTo(item.end.x, item.end.y);
          ctx.lineTo(
            item.end.x - headLen * Math.cos(angle + Math.PI / 6),
            item.end.y - headLen * Math.sin(angle + Math.PI / 6),
          );
          ctx.stroke();
        }
      } else if (item.type === "text") {
        ctx.font = `bold ${item.fontSize}px Arial`;
        ctx.fillStyle = item.color;
        ctx.fillText(item.text, item.x, item.y);
      }
    });
  }, [history, currentPage]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Color palette
  const colors = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#000000",
    "#ffffff",
  ];

  // Tool definitions
  const tools = [
    { id: "pen", icon: "✏️", label: "قلم" },
    { id: "highlighter", icon: "🖍️", label: "تخطيط" },
    { id: "text", icon: "📝", label: "نص" },
    { id: "rect", icon: "⬜", label: "مستطيل" },
    { id: "circle", icon: "⭕", label: "دائرة" },
    { id: "arrow", icon: "➡️", label: "سهم" },
    { id: "eraser", icon: "🧹", label: "ممحاة" },
  ];

  if (!pdfUrl) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between px-5 py-3 rounded-t-2xl bg-gradient-to-l from-green-600 to-emerald-700 text-white">
          <h3 className="font-black text-lg">خطأ</h3>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold"
          >
            إغلاق
          </button>
        </div>
        <div className="rounded-b-2xl border-2 border-t-0 border-green-600/30 p-10 text-center bg-white dark:bg-[#1A1A1A]">
          <p className="text-red-500 font-bold">❌ لا يوجد ملف PDF مرتبط</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* ═══ HEADER ═══ */}
      <div className="flex items-center justify-between px-5 py-3 rounded-t-2xl bg-gradient-to-l from-green-600 to-emerald-700 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
            📄
          </div>
          <div>
            <h3 className="font-black text-lg leading-tight">{lesson.title}</h3>
            <span className="text-xs text-white/70 font-bold">
              🎁 عرض مجاني{numPages ? ` • ${numPages} صفحة` : ""}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowToolbar((t) => !t)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${showToolbar ? "bg-white text-green-700" : "bg-white/10 hover:bg-white/20 text-white"}`}
          >
            🎨 {showToolbar ? "إخفاء الأدوات" : "أدوات الشرح"}
          </button>
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

      {/* ═══ ANNOTATION TOOLBAR ═══ */}
      {showToolbar && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-x-2 border-green-600/30 space-y-2">
          {/* Tools Row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-400 ml-1">
              الأدوات:
            </span>
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() =>
                  setActiveTool(activeTool === tool.id ? null : tool.id)
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  activeTool === tool.id
                    ? "bg-green-500 text-white shadow-md scale-105"
                    : "bg-white dark:bg-white/10 text-gray-600 dark:text-gray-300 border dark:border-white/10 hover:bg-green-50 dark:hover:bg-green-500/10"
                }`}
                title={tool.label}
              >
                <span>{tool.icon}</span>
                <span className="hidden sm:inline">{tool.label}</span>
              </button>
            ))}
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
            <button
              onClick={() => setActiveTool(null)}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${!activeTool ? "bg-blue-500 text-white" : "bg-white dark:bg-white/10 border dark:border-white/10 text-gray-500 hover:bg-blue-50"}`}
            >
              👆 تصفح
            </button>
          </div>

          {/* Colors + Width Row */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-gray-400">الألوان:</span>
            <div className="flex items-center gap-1">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setDrawColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${drawColor === c ? "border-green-500 scale-125 shadow" : "border-gray-300 dark:border-gray-600 hover:scale-110"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700" />
            <span className="text-xs font-bold text-gray-400">السُمك:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={drawWidth}
              onChange={(e) => setDrawWidth(Number(e.target.value))}
              className="w-20 accent-green-500"
            />
            <span className="text-xs text-gray-400 font-mono">
              {drawWidth}px
            </span>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700" />
            <button
              onClick={handleUndo}
              title="تراجع (Ctrl+Z)"
              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-white/10 border dark:border-white/10 text-sm font-bold hover:bg-gray-100 dark:hover:bg-white/20 transition-all disabled:opacity-30"
              disabled={!(history[currentPage]?.length > 0)}
            >
              ↩️ تراجع
            </button>
            <button
              onClick={handleRedo}
              title="إعادة"
              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-white/10 border dark:border-white/10 text-sm font-bold hover:bg-gray-100 dark:hover:bg-white/20 transition-all disabled:opacity-30"
              disabled={!(undoStack[currentPage]?.length > 0)}
            >
              ↪️ إعادة
            </button>
            <button
              onClick={handleClearPage}
              title="مسح كل الصفحة"
              className="px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-500 text-sm font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-all"
            >
              🗑️ مسح الكل
            </button>
          </div>
        </div>
      )}

      {/* ═══ NAVIGATION TOOLBAR ═══ */}
      <div className="flex items-center justify-between px-5 py-2 bg-gray-100 dark:bg-gray-900 border-x-2 border-green-600/30">
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            disabled={currentPage <= 1}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/10 border dark:border-white/10 text-sm font-bold disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-white/20 transition-all"
          >
            ◀ السابق
          </button>
          <span className="text-sm font-bold text-gray-600 dark:text-gray-400 min-w-[80px] text-center">
            {currentPage} / {numPages || "..."}
          </span>
          <button
            onClick={goNext}
            disabled={currentPage >= (numPages || 1)}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/10 border dark:border-white/10 text-sm font-bold disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-white/20 transition-all"
          >
            التالي ▶
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 border dark:border-white/10 font-black text-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/20 transition-all"
          >
            −
          </button>
          <span className="text-xs font-bold text-gray-500 min-w-[40px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 border dark:border-white/10 font-black text-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/20 transition-all"
          >
            +
          </button>
        </div>
      </div>

      {/* ═══ PDF CONTENT + CANVAS OVERLAY ═══ */}
      <div
        ref={containerRef}
        className="rounded-b-2xl border-2 border-t-0 border-green-600/30 bg-gray-200 dark:bg-gray-950 overflow-auto relative"
        style={{
          maxHeight: "700px",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {loading && !error && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-green-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-bold text-gray-500">
                جاري تحميل PDF...
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-red-500 font-bold text-lg">❌ فشل تحميل الملف</p>
            <p className="text-red-400 text-sm max-w-md text-center font-mono bg-red-50 dark:bg-red-500/10 p-3 rounded-xl whitespace-pre-wrap">
              {error}
            </p>
          </div>
        )}

        {!error && (
          <div className="flex justify-center py-4">
            <div ref={pageContainerRef} className="relative inline-block">
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading=""
              >
                <Page
                  pageNumber={currentPage}
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  loading=""
                  onRenderSuccess={resizeCanvas}
                />
              </Document>

              {/* Drawing Canvas Overlay */}
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0"
                style={{
                  cursor:
                    activeTool === "pen"
                      ? "crosshair"
                      : activeTool === "highlighter"
                        ? "crosshair"
                        : activeTool === "eraser"
                          ? "cell"
                          : activeTool === "text"
                            ? "text"
                            : activeTool
                              ? "crosshair"
                              : "default",
                  pointerEvents: activeTool ? "auto" : "none",
                  zIndex: 20,
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={(e) => {
                  e.preventDefault();
                  const touch = e.touches[0];
                  handleMouseDown({
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                  });
                }}
                onTouchMove={(e) => {
                  e.preventDefault();
                  const touch = e.touches[0];
                  handleMouseMove({
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                  });
                }}
                onTouchEnd={handleMouseUp}
              />

              {/* Text Input Popup */}
              {textInput && (
                <div
                  className="absolute z-30 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-3 border-2 border-green-500"
                  style={{
                    left:
                      (textInput.x / (canvasRef.current?.width || 1)) * 100 +
                      "%",
                    top:
                      (textInput.y / (canvasRef.current?.height || 1)) * 100 +
                      "%",
                  }}
                >
                  <input
                    type="text"
                    autoFocus
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddText();
                      if (e.key === "Escape") setTextInput(null);
                    }}
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-transparent text-sm font-bold focus:outline-none focus:border-green-500 w-48"
                    placeholder="اكتب هنا..."
                    dir="rtl"
                    style={{ color: drawColor }}
                  />
                  <div className="flex gap-1 mt-2">
                    <button
                      onClick={handleAddText}
                      className="flex-1 px-3 py-1 rounded-lg bg-green-500 text-white text-xs font-bold"
                    >
                      ✓ إضافة
                    </button>
                    <button
                      onClick={() => setTextInput(null)}
                      className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Page indicator at bottom */}
        {numPages > 1 && (
          <div className="sticky bottom-0 py-2 bg-gray-200/90 dark:bg-gray-950/90 backdrop-blur flex justify-center">
            <div className="flex items-center gap-1 flex-wrap justify-center px-2">
              {Array.from(
                { length: Math.min(numPages, 20) },
                (_, i) => i + 1,
              ).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 rounded-md text-xs font-bold transition-all ${p === currentPage ? "bg-green-500 text-white shadow" : "bg-white dark:bg-white/10 text-gray-500 hover:bg-green-100 dark:hover:bg-green-500/20"}`}
                >
                  {p}
                </button>
              ))}
              {numPages > 20 && (
                <span className="text-gray-400 text-xs px-1">...</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Active tool indicator */}
      {activeTool && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-green-500 text-white text-sm font-bold shadow-xl animate-pulse">
          🎨 وضع {tools.find((t) => t.id === activeTool)?.label || activeTool} —
          اضغط ESC أو "تصفح" للإلغاء
        </div>
      )}
    </div>
  );
}
