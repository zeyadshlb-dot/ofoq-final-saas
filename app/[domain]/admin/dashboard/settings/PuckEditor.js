"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  CheckCircle,
  Image as ImageIcon,
  LayoutGrid,
  Type,
  Square,
  CreditCard,
  ChevronDown,
  Video,
  Presentation,
  Sparkles,
  BookOpen,
  Users,
  Star,
  Award,
  Play,
  ArrowRight,
  Zap,
  Globe,
  Shield,
  TrendingUp,
  Clock,
  Download,
  Eye,
  Heart,
  Share2,
  GraduationCap,
  FlaskConical,
  Calculator,
  Pen,
  Music,
  Code,
  Atom,
  Languages,
  Package,
  Tag,
  Percent,
  ShoppingCart,
  ChevronRight,
  Moon,
  Sun,
  Layers,
  Palette,
  Move,
  Settings,
  Copy,
  Trash2,
  Plus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  List,
  Grid,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════
   UTILITY: Export page to full standalone HTML
══════════════════════════════════════════════════════════════ */
function exportToHTML(sections, theme) {
  const primary = theme?.primary || "#6366f1";
  const secondary = theme?.secondary || "#4f46e5";
  const font = theme?.font || "Cairo";

  const renderSection = (section) => {
    switch (section.type) {
      case "Hero": {
        const {
          title,
          subtitle,
          btnText,
          btnLink,
          bgType,
          bgColor,
          bgGradient,
          bgImage,
          darkOverlay,
          minHeight,
          textAlign,
          showBadge,
          badgeText,
          showSecondBtn,
          secondBtnText,
          secondBtnLink,
        } = section.props;
        const bg =
          bgType === "image"
            ? `linear-gradient(rgba(0,0,0,${darkOverlay || 0.6}),rgba(0,0,0,${darkOverlay || 0.6})),url(${bgImage}) center/cover`
            : bgType === "gradient"
              ? bgGradient || `linear-gradient(135deg,${primary},${secondary})`
              : bgColor || primary;
        return `
        <section class="hero-section aos-fade-up" style="background:${bg};padding:${minHeight || "8rem"} 2rem;text-align:${textAlign || "center"};color:#fff;position:relative;overflow:hidden;border-radius:2rem;margin:1rem 0;">
          ${showBadge ? `<span class="badge" style="background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.3);backdrop-filter:blur(10px);padding:8px 20px;border-radius:100px;font-size:0.9rem;font-weight:700;display:inline-block;margin-bottom:1.5rem;letter-spacing:0.05em;">${badgeText || "🎓 منصة تعليمية متكاملة"}</span>` : ""}
          <h1 style="font-size:clamp(2.5rem,6vw,5rem);font-weight:900;margin-bottom:1.5rem;line-height:1.1;">${title}</h1>
          <p style="font-size:clamp(1.1rem,2vw,1.5rem);opacity:0.9;margin-bottom:3rem;max-width:700px;margin-left:auto;margin-right:auto;line-height:1.8;">${subtitle}</p>
          <div style="display:flex;gap:16px;justify-content:${textAlign === "right" ? "flex-end" : textAlign === "left" ? "flex-start" : "center"};flex-wrap:wrap;">
            <a href="${btnLink || "#"}" class="btn-primary" style="padding:18px 44px;background:#fff;color:${primary};font-weight:800;font-size:1.1rem;border-radius:14px;text-decoration:none;transition:all 0.3s;box-shadow:0 10px 30px rgba(0,0,0,0.2);">${btnText}</a>
            ${showSecondBtn ? `<a href="${secondBtnLink || "#"}" style="padding:18px 44px;background:transparent;color:#fff;font-weight:700;font-size:1.1rem;border-radius:14px;text-decoration:none;border:2px solid rgba(255,255,255,0.6);transition:all 0.3s;">${secondBtnText || "تعرف على المزيد"}</a>` : ""}
          </div>
          <div class="hero-blob" style="position:absolute;top:-50%;right:-20%;width:600px;height:600px;background:radial-gradient(circle,rgba(255,255,255,0.08),transparent 60%);border-radius:50%;pointer-events:none;"></div>
        </section>`;
      }

      case "StatsBar": {
        const { items, bgColor, textColor } = section.props;
        return `
        <section class="stats-bar aos-fade-up" style="background:${bgColor || primary};padding:3rem 2rem;border-radius:1.5rem;margin:1rem 0;">
          <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:2rem;text-align:center;">
            ${(items || [])
              .map(
                (item) => `
              <div class="stat-item">
                <div style="font-size:2.8rem;font-weight:900;color:${textColor || "#fff"};">${item.value}</div>
                <div style="font-size:1rem;color:${textColor || "rgba(255,255,255,0.8)"};font-weight:600;margin-top:6px;">${item.label}</div>
              </div>`,
              )
              .join("")}
          </div>
        </section>`;
      }

      case "FeaturesGrid": {
        const {
          title,
          subtitle,
          items,
          columns,
          style: cardStyle,
        } = section.props;
        return `
        <section class="features aos-fade-up" style="padding:5rem 2rem;">
          <div style="max-width:1200px;margin:0 auto;">
            ${title ? `<h2 style="font-size:2.5rem;font-weight:900;text-align:center;margin-bottom:${subtitle ? "0.5rem" : "3rem"};color:#111827;">${title}</h2>` : ""}
            ${subtitle ? `<p style="text-align:center;color:#6b7280;font-size:1.1rem;margin-bottom:3rem;">${subtitle}</p>` : ""}
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(${columns === 4 ? "220px" : columns === 2 ? "380px" : "280px"},1fr));gap:24px;">
              ${(items || [])
                .map(
                  (item, i) => `
                <div class="feature-card aos-fade-up" style="animation-delay:${i * 0.1}s;background:${cardStyle === "colored" ? `${primary}10` : "#fff"};padding:32px;border-radius:20px;border:1px solid ${cardStyle === "bordered" ? primary + "40" : "#f3f4f6"};box-shadow:0 10px 40px -10px rgba(0,0,0,0.06);text-align:center;transition:transform 0.3s,box-shadow 0.3s;">
                  <div style="font-size:3rem;margin-bottom:20px;display:inline-flex;align-items:center;justify-content:center;width:80px;height:80px;background:${primary}15;border-radius:24px;">${item.icon}</div>
                  <h3 style="font-size:1.3rem;font-weight:800;color:#111827;margin-bottom:10px;">${item.title}</h3>
                  <p style="color:#6b7280;line-height:1.7;font-size:0.95rem;">${item.desc}</p>
                </div>`,
                )
                .join("")}
            </div>
          </div>
        </section>`;
      }

      case "CoursesPlaceholder": {
        const { title, subtitle, categoryFilter } = section.props;
        return `
        <section style="padding:5rem 2rem;background:#f9fafb;">
          <div style="max-width:1200px;margin:0 auto;">
            <h2 style="font-size:2.5rem;font-weight:900;margin-bottom:0.5rem;color:#111827;">${title}</h2>
            ${subtitle ? `<p style="color:#6b7280;margin-bottom:2rem;">${subtitle}</p>` : ""}
            <!-- DYNAMIC COURSES FROM BACKEND - categoryFilter: ${categoryFilter || "all"} -->
            <div id="courses-grid" data-category="${categoryFilter || "all"}" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px;">
              <!-- Courses will be injected here by backend/JS -->
            </div>
          </div>
        </section>`;
      }

      case "GradesSection": {
        const { title, grades } = section.props;
        return `
        <section style="padding:5rem 2rem;background:#fff;">
          <div style="max-width:1200px;margin:0 auto;">
            <h2 style="font-size:2.5rem;font-weight:900;text-align:center;margin-bottom:3rem;color:#111827;">${title}</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:20px;">
              ${(grades || [])
                .map(
                  (g) => `
                <a href="/grade/${g.slug || "#"}" class="grade-card" style="background:linear-gradient(135deg,${g.color || primary},${g.color2 || secondary});padding:30px;border-radius:20px;text-align:center;text-decoration:none;color:#fff;transition:transform 0.3s,box-shadow 0.3s;display:block;">
                  <div style="font-size:2.5rem;margin-bottom:12px;">${g.icon || "📚"}</div>
                  <div style="font-size:1.2rem;font-weight:800;">${g.name}</div>
                  ${g.count ? `<div style="font-size:0.85rem;opacity:0.8;margin-top:6px;">${g.count} دورة</div>` : "<!-- Grade count from backend -->"}
                </a>`,
                )
                .join("")}
            </div>
          </div>
        </section>`;
      }

      case "BookBundle": {
        const {
          title,
          coverImage,
          price,
          oldPrice,
          description,
          features,
          ctaText,
          ctaLink,
          badge,
        } = section.props;
        return `
        <section style="padding:5rem 2rem;background:linear-gradient(135deg,#0f0c29,#302b63,#24243e);">
          <div style="max-width:1000px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center;">
            <div style="position:relative;">
              ${badge ? `<div style="position:absolute;top:-15px;right:-15px;background:#f59e0b;color:#fff;padding:8px 18px;border-radius:100px;font-weight:800;font-size:0.85rem;z-index:2;">${badge}</div>` : ""}
              <img src="${coverImage || "https://placehold.co/400x500/6366f1/fff?text=كتاب"}" alt="${title}" style="width:100%;border-radius:20px;box-shadow:0 40px 80px rgba(0,0,0,0.5);transform:rotate(-3deg);transition:transform 0.3s;" />
            </div>
            <div style="color:#fff;">
              <h2 style="font-size:2.5rem;font-weight:900;margin-bottom:1rem;">${title}</h2>
              <p style="color:rgba(255,255,255,0.8);line-height:1.8;margin-bottom:2rem;">${description}</p>
              <ul style="list-style:none;padding:0;margin-bottom:2rem;">
                ${(features || []).map((f) => `<li style="display:flex;align-items:center;gap:10px;margin-bottom:10px;color:rgba(255,255,255,0.9);"><span style="color:#34d399;font-size:1.2rem;">✓</span>${f}</li>`).join("")}
              </ul>
              <div style="display:flex;align-items:center;gap:16px;margin-bottom:2rem;">
                ${oldPrice ? `<span style="text-decoration:line-through;color:rgba(255,255,255,0.4);font-size:1.5rem;">${oldPrice}</span>` : ""}
                <span style="font-size:3rem;font-weight:900;color:#f59e0b;">${price}</span>
              </div>
              <a href="${ctaLink || "#"}" style="display:inline-block;padding:18px 44px;background:${primary};color:#fff;font-weight:800;font-size:1.1rem;border-radius:14px;text-decoration:none;box-shadow:0 10px 30px ${primary}50;transition:all 0.3s;">${ctaText || "اشتري الآن"}</a>
            </div>
          </div>
        </section>`;
      }

      case "TestimonialsSlider": {
        const { title, items } = section.props;
        return `
        <section style="padding:5rem 2rem;background:#fff;">
          <div style="max-width:1200px;margin:0 auto;">
            <h2 style="font-size:2.5rem;font-weight:900;text-align:center;margin-bottom:3rem;color:#111827;">${title}</h2>
            <div class="testimonials-track" style="display:flex;gap:24px;overflow-x:auto;padding-bottom:16px;scrollbar-width:none;">
              ${(items || [])
                .map(
                  (item) => `
                <div style="min-width:320px;background:#f9fafb;padding:32px;border-radius:20px;border:1px solid #f3f4f6;">
                  <div style="display:flex;gap:4px;margin-bottom:16px;">${"★"
                    .repeat(item.stars || 5)
                    .split("")
                    .map(() => `<span style="color:#f59e0b;">★</span>`)
                    .join("")}</div>
                  <p style="color:#374151;line-height:1.8;margin-bottom:20px;font-size:1.05rem;">"${item.text}"</p>
                  <div style="display:flex;align-items:center;gap:12px;">
                    <img src="${item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=${primary.replace("#", "")}&color=fff`}" alt="${item.name}" style="width:48px;height:48px;border-radius:50%;object-fit:cover;" />
                    <div>
                      <div style="font-weight:800;color:#111827;">${item.name}</div>
                      <div style="font-size:0.85rem;color:#6b7280;">${item.role || ""}</div>
                    </div>
                  </div>
                </div>`,
                )
                .join("")}
            </div>
          </div>
        </section>`;
      }

      case "VideoSection": {
        const { title, videoUrl, thumbnail, caption } = section.props;
        const embedUrl = videoUrl?.includes("youtu")
          ? videoUrl
              .replace("watch?v=", "embed/")
              .replace("youtu.be/", "youtube.com/embed/")
          : videoUrl;
        return `
        <section style="padding:5rem 2rem;background:#f9fafb;text-align:center;">
          <div style="max-width:900px;margin:0 auto;">
            ${title ? `<h2 style="font-size:2.5rem;font-weight:900;margin-bottom:2rem;color:#111827;">${title}</h2>` : ""}
            <div style="border-radius:24px;overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,0.12);position:relative;aspect-ratio:16/9;">
              <iframe src="${embedUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ"}" style="width:100%;height:100%;border:none;" allowfullscreen></iframe>
            </div>
            ${caption ? `<p style="margin-top:1.5rem;color:#6b7280;font-size:1rem;">${caption}</p>` : ""}
          </div>
        </section>`;
      }

      case "FAQ": {
        const { title, questions } = section.props;
        return `
        <section style="padding:5rem 2rem;background:#fff;">
          <div style="max-width:800px;margin:0 auto;">
            ${title ? `<h2 style="font-size:2.5rem;font-weight:900;text-align:center;margin-bottom:3rem;color:#111827;">${title}</h2>` : ""}
            ${(questions || [])
              .map(
                (item, i) => `
              <details style="border:1px solid #e5e7eb;border-radius:14px;padding:20px;margin-bottom:12px;background:#fff;" ${i === 0 ? "open" : ""}>
                <summary style="font-size:1.15rem;font-weight:800;color:#111827;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;">${item.q}<span style="color:${primary};font-size:1.5rem;">+</span></summary>
                <p style="margin-top:14px;color:#4b5563;line-height:1.7;">${item.a}</p>
              </details>`,
              )
              .join("")}
          </div>
        </section>`;
      }

      case "CTABanner": {
        const { title, subtitle, btnText, btnLink, bg } = section.props;
        return `
        <section style="padding:5rem 2rem;background:${bg || `linear-gradient(135deg,${primary},${secondary})`};text-align:center;border-radius:2rem;margin:1rem 0;">
          <h2 style="font-size:3rem;font-weight:900;color:#fff;margin-bottom:1rem;">${title}</h2>
          ${subtitle ? `<p style="color:rgba(255,255,255,0.85);font-size:1.2rem;margin-bottom:2.5rem;">${subtitle}</p>` : ""}
          <a href="${btnLink || "#"}" style="display:inline-block;padding:18px 48px;background:#fff;color:${primary};font-weight:900;font-size:1.15rem;border-radius:14px;text-decoration:none;box-shadow:0 20px 40px rgba(0,0,0,0.15);">${btnText}</a>
        </section>`;
      }

      case "ImageText": {
        const { title, text, image, imagePosition, btnText, btnLink } =
          section.props;
        const row = imagePosition === "left" ? "row" : "row-reverse";
        return `
        <section style="padding:5rem 2rem;background:#fff;">
          <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center;direction:${row === "row" ? "ltr" : "rtl"};">
            <img src="${image || "https://placehold.co/600x400"}" style="width:100%;border-radius:20px;box-shadow:0 20px 40px rgba(0,0,0,0.08);" />
            <div style="direction:rtl;">
              <h2 style="font-size:2.5rem;font-weight:900;color:#111827;margin-bottom:1.5rem;">${title}</h2>
              <p style="color:#4b5563;line-height:1.9;font-size:1.05rem;margin-bottom:2rem;">${text}</p>
              ${btnText ? `<a href="${btnLink || "#"}" style="display:inline-block;padding:14px 36px;background:${primary};color:#fff;font-weight:800;border-radius:12px;text-decoration:none;">${btnText}</a>` : ""}
            </div>
          </div>
        </section>`;
      }

      case "Text": {
        const { content, tag, align, color, fontSize } = section.props;
        const Tag = tag || "p";
        const fs =
          fontSize ||
          (tag === "h1" ? "3rem" : tag === "h2" ? "2.2rem" : "1.1rem");
        return `<${Tag} class="aos-fade-up" style="text-align:${align || "right"};font-size:${fs};font-weight:${tag === "p" ? "500" : "900"};color:${color || "#111827"};line-height:1.7;margin:0 auto 1.5rem;max-width:900px;padding:0 2rem;">${content}</${Tag}>`;
      }

      case "Spacer": {
        const { height } = section.props;
        return `<div style="height:${height || 60}px;"></div>`;
      }

      case "Divider": {
        const { style: dvStyle, color: dvColor } = section.props;
        return `<hr style="border:none;border-top:${dvStyle === "dashed" ? "2px dashed" : dvStyle === "thick" ? "4px solid" : "1px solid"} ${dvColor || "#e5e7eb"};margin:2rem auto;max-width:900px;" />`;
      }

      default:
        return `<!-- Unknown section: ${section.type} -->`;
    }
  };

  const body = sections.map(renderSection).join("\n");

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>صفحة المنصة</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=${font.replace(" ", "+")}:wght@300;400;600;700;800;900&display=swap" rel="stylesheet" />
  <!-- AOS Scroll Animations -->
  <link href="https://unpkg.com/aos@2.3.4/dist/aos.css" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: '${font}', sans-serif;
      background: #f9fafb;
      color: #111827;
      direction: rtl;
      -webkit-font-smoothing: antialiased;
    }
    .container { max-width: 1280px; margin: 0 auto; padding: 0 24px; }

    /* AOS animations */
    [data-aos] { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease, transform 0.7s ease; }
    [data-aos].aos-animate { opacity: 1; transform: translateY(0); }

    /* Feature card hover */
    .feature-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important; }
    .grade-card:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 20px 40px rgba(0,0,0,0.3) !important; }

    /* Testimonials scrollbar */
    .testimonials-track::-webkit-scrollbar { display: none; }

    @media (max-width: 768px) {
      section > div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
    }
  </style>
</head>
<body>

${body}

<script src="https://unpkg.com/aos@2.3.4/dist/aos.js"></script>
<script>
  AOS.init({ duration: 700, once: true, offset: 80 });

  // Add AOS attrs dynamically
  document.querySelectorAll('.aos-fade-up').forEach(el => {
    el.setAttribute('data-aos', 'fade-up');
  });
  document.querySelectorAll('.feature-card').forEach((el, i) => {
    el.setAttribute('data-aos', 'fade-up');
    el.setAttribute('data-aos-delay', i * 80);
  });
  document.querySelectorAll('.stat-item').forEach((el, i) => {
    el.setAttribute('data-aos', 'zoom-in');
    el.setAttribute('data-aos-delay', i * 100);
  });

  // Counter animation for stats
  function animateCounter(el, target) {
    let current = 0;
    const isK = target.includes('k') || target.includes('+');
    const num = parseFloat(target);
    const step = num / 60;
    const suffix = target.replace(/[\d.]/g, '');
    const timer = setInterval(() => {
      current = Math.min(current + step, num);
      el.textContent = Math.floor(current) + suffix;
      if (current >= num) clearInterval(timer);
    }, 16);
  }

  // Intersection Observer for counters
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const statValues = entry.target.querySelectorAll('.stat-item > div:first-child');
        statValues.forEach(v => animateCounter(v, v.textContent));
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stats-bar').forEach(el => counterObserver.observe(el));
</script>
</body>
</html>`;
}

/* ══════════════════════════════════════════════════════════════
   SECTION DEFINITIONS (types & default props)
══════════════════════════════════════════════════════════════ */
const SECTION_DEFS = {
  Hero: {
    label: "هيرو / صفحة رئيسية",
    icon: "🌟",
    category: "header",
    defaultProps: {
      title: "ارتقِ بمستواك التعليمي",
      subtitle:
        "منصة ذكية توفر لك كل ما تحتاجه للنجاح بأحدث تقنيات التعليم التفاعلي",
      btnText: "ابدأ رحلتك الآن",
      btnLink: "#",
      bgType: "gradient",
      bgColor: "#6366f1",
      bgGradient:
        "linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #7c3aed 100%)",
      bgImage: "",
      darkOverlay: "0.6",
      minHeight: "8rem",
      textAlign: "center",
      showBadge: true,
      badgeText: "🎓 منصة تعليمية متكاملة",
      showSecondBtn: true,
      secondBtnText: "تعرف على المزيد",
      secondBtnLink: "#",
    },
  },
  StatsBar: {
    label: "شريط الإحصائيات",
    icon: "📊",
    category: "content",
    defaultProps: {
      bgColor: "#4f46e5",
      textColor: "#ffffff",
      items: [
        { value: "50k+", label: "طالب مسجل" },
        { value: "1200+", label: "دورة متاحة" },
        { value: "98%", label: "نسبة الرضا" },
        { value: "500+", label: "معلم متخصص" },
      ],
    },
  },
  FeaturesGrid: {
    label: "شبكة المميزات",
    icon: "⚡",
    category: "content",
    defaultProps: {
      title: "لماذا تختار منصتنا؟",
      subtitle: "نقدم لك تجربة تعليمية فريدة ومتكاملة",
      columns: 3,
      style: "default",
      items: [
        {
          title: "بث مباشر تفاعلي",
          desc: "تفاعل مع المعلمين والطلاب في وقت فعلي",
          icon: "🔴",
        },
        {
          title: "اختبارات ذكية",
          desc: "قيّم مستواك بدقة مع تصحيح تلقائي",
          icon: "🧠",
        },
        {
          title: "ملازم للتحميل",
          desc: "احتفظ بمحتوى الدروس بجودة عالية",
          icon: "📚",
        },
        {
          title: "شهادات معتمدة",
          desc: "احصل على شهادات موثقة عند إتمام الدورة",
          icon: "🏆",
        },
        {
          title: "دعم 24/7",
          desc: "فريق دعم جاهز للمساعدة في أي وقت",
          icon: "💬",
        },
        {
          title: "تعلم بالذكاء الاصطناعي",
          desc: "مسارات تعليمية مخصصة لكل طالب",
          icon: "🤖",
        },
      ],
    },
  },
  CoursesPlaceholder: {
    label: "سكشن الكورسات (ديناميكي)",
    icon: "🎓",
    category: "dynamic",
    defaultProps: {
      title: "أحدث الدورات المضافة",
      subtitle: "استعرض أحدث الدورات المضافة من قِبَل معلمينا",
      categoryFilter: "all",
      limit: 8,
    },
  },
  GradesSection: {
    label: "المراحل الدراسية (ديناميكي)",
    icon: "📖",
    category: "dynamic",
    defaultProps: {
      title: "تصفح حسب المرحلة الدراسية",
      grades: [
        {
          name: "الصف الأول الإعدادي",
          icon: "1️⃣",
          slug: "grade-7",
          color: "#6366f1",
          color2: "#4f46e5",
        },
        {
          name: "الصف الثاني الإعدادي",
          icon: "2️⃣",
          slug: "grade-8",
          color: "#8b5cf6",
          color2: "#7c3aed",
        },
        {
          name: "الصف الثالث الإعدادي",
          icon: "3️⃣",
          slug: "grade-9",
          color: "#ec4899",
          color2: "#db2777",
        },
        {
          name: "الصف الأول الثانوي",
          icon: "🔵",
          slug: "grade-10",
          color: "#14b8a6",
          color2: "#0d9488",
        },
        {
          name: "الصف الثاني الثانوي",
          icon: "🟡",
          slug: "grade-11",
          color: "#f59e0b",
          color2: "#d97706",
        },
        {
          name: "الصف الثالث الثانوي",
          icon: "🔴",
          slug: "grade-12",
          color: "#ef4444",
          color2: "#dc2626",
        },
      ],
    },
  },
  BookBundle: {
    label: "كتاب / بندل للبيع",
    icon: "📦",
    category: "sales",
    defaultProps: {
      title: "بندل الثانوية العامة الشامل",
      description:
        "احصل على جميع المواد في بندل واحد بسعر استثنائي. يشمل جميع الشروحات والملازم والاختبارات.",
      price: "299 جنيه",
      oldPrice: "599 جنيه",
      coverImage: "",
      badge: "🔥 عرض محدود",
      features: [
        "جميع مواد الصف الثالث الثانوي",
        "100+ ساعة فيديو شرح",
        "ملازم مراجعة قابلة للطباعة",
        "اختبارات تجريبية على النمط الجديد",
        "دعم مباشر من المعلمين",
      ],
      ctaText: "اشتري الآن بخصم 50%",
      ctaLink: "#",
    },
  },
  TestimonialsSlider: {
    label: "آراء الطلاب",
    icon: "💬",
    category: "social",
    defaultProps: {
      title: "ماذا يقول طلابنا؟",
      items: [
        {
          name: "أحمد محمد",
          role: "طالب ثانوي",
          text: "المنصة غيرت طريقة تعلمي بشكل كامل. الشروحات واضحة والمعلمين متفاعلين.",
          stars: 5,
          avatar: "",
        },
        {
          name: "فاطمة علي",
          role: "طالبة إعدادي",
          text: "أحسن منصة استخدمتها. الاختبارات التلقائية ساعدتني كتير في المذاكرة.",
          stars: 5,
          avatar: "",
        },
        {
          name: "محمود حسن",
          role: "ولي أمر",
          text: "ابني تحسن مستواه بشكل واضح. المحتوى منظم ومتاح في أي وقت.",
          stars: 5,
          avatar: "",
        },
        {
          name: "سارة أحمد",
          role: "طالبة جامعية",
          text: "حتى بعد الثانوي لسه بستخدم المنصة. محتوى ممتاز وسعر معقول جداً.",
          stars: 5,
          avatar: "",
        },
      ],
    },
  },
  VideoSection: {
    label: "فيديو تعريفي",
    icon: "▶️",
    category: "media",
    defaultProps: {
      title: "شاهد كيف تعمل المنصة",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      caption: "دقيقتان تكفيك لتعرف كل حاجة عن المنصة",
    },
  },
  ImageText: {
    label: "صورة + نص",
    icon: "🖼️",
    category: "content",
    defaultProps: {
      title: "تعليم بلا حدود",
      text: "نوفر لك منصة تعليمية متكاملة تجمع بين الجودة والسهولة. سواء كنت طالباً أو معلماً، ستجد كل ما تحتاجه لتحقيق أهدافك التعليمية.",
      image:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800",
      imagePosition: "right",
      btnText: "اعرف أكثر",
      btnLink: "#",
    },
  },
  CTABanner: {
    label: "بانر دعوة للعمل",
    icon: "📢",
    category: "conversion",
    defaultProps: {
      title: "ابدأ رحلتك التعليمية اليوم!",
      subtitle: "انضم لأكثر من 50,000 طالب يتعلمون معنا كل يوم",
      btnText: "سجل مجاناً الآن",
      btnLink: "#",
      bg: "linear-gradient(135deg, #6366f1, #4f46e5)",
    },
  },
  FAQ: {
    label: "الأسئلة الشائعة",
    icon: "❓",
    category: "content",
    defaultProps: {
      title: "الأسئلة الشائعة",
      questions: [
        {
          q: "كيف يمكنني الاشتراك في دورة؟",
          a: "ببساطة قم باختيار الدورة المناسبة والضغط على زر الاشتراك ثم إكمال عملية الدفع.",
        },
        {
          q: "هل أحصل على شهادة؟",
          a: "نعم، بمجرد اجتيازك للاختبار النهائي بنجاح يتم إصدار شهادة معتمدة تلقائياً.",
        },
        {
          q: "هل المحتوى متاح دايماً؟",
          a: "نعم! بمجرد اشتراكك في الدورة، يصبح المحتوى متاحاً لك إلى الأبد.",
        },
      ],
    },
  },
  Text: {
    label: "نص / عنوان",
    icon: "✍️",
    category: "basic",
    defaultProps: {
      content: "اكتب نصك هنا...",
      tag: "p",
      align: "right",
      color: "#4b5563",
      fontSize: "",
    },
  },
  Spacer: {
    label: "مسافة فارغة",
    icon: "↕️",
    category: "basic",
    defaultProps: { height: 60 },
  },
  Divider: {
    label: "خط فاصل",
    icon: "➖",
    category: "basic",
    defaultProps: { style: "solid", color: "#e5e7eb" },
  },
};

const CATEGORIES = {
  header: { label: "الهيدر", color: "#6366f1" },
  content: { label: "المحتوى", color: "#10b981" },
  dynamic: { label: "ديناميكي (باك اند)", color: "#f59e0b" },
  sales: { label: "المبيعات", color: "#ef4444" },
  social: { label: "اجتماعي", color: "#ec4899" },
  media: { label: "الميديا", color: "#8b5cf6" },
  conversion: { label: "التحويل", color: "#14b8a6" },
  basic: { label: "أساسي", color: "#64748b" },
};

/* ══════════════════════════════════════════════════════════════
   SECTION EDITORS (field renderers per section type)
══════════════════════════════════════════════════════════════ */
const FieldRow = ({ label, children }) => (
  <div style={{ marginBottom: "16px" }}>
    <label
      style={{
        display: "block",
        fontSize: "12px",
        fontWeight: 700,
        color: "#6b7280",
        marginBottom: "6px",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {label}
    </label>
    {children}
  </div>
);

const Input = ({ value, onChange, placeholder, type = "text" }) => (
  <input
    type={type}
    value={value || ""}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    style={{
      width: "100%",
      padding: "10px 14px",
      background: "#f9fafb",
      border: "1.5px solid #e5e7eb",
      borderRadius: "10px",
      fontSize: "13px",
      color: "#111827",
      outline: "none",
      fontFamily: "inherit",
    }}
  />
);

const Textarea = ({ value, onChange, rows = 3 }) => (
  <textarea
    value={value || ""}
    onChange={(e) => onChange(e.target.value)}
    rows={rows}
    style={{
      width: "100%",
      padding: "10px 14px",
      background: "#f9fafb",
      border: "1.5px solid #e5e7eb",
      borderRadius: "10px",
      fontSize: "13px",
      color: "#111827",
      outline: "none",
      fontFamily: "inherit",
      resize: "vertical",
    }}
  />
);

const Select = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{
      width: "100%",
      padding: "10px 14px",
      background: "#f9fafb",
      border: "1.5px solid #e5e7eb",
      borderRadius: "10px",
      fontSize: "13px",
      color: "#111827",
      outline: "none",
      fontFamily: "inherit",
    }}
  >
    {options.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
);

const Toggle = ({ value, onChange, label }) => (
  <label
    style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      cursor: "pointer",
    }}
  >
    <div
      onClick={() => onChange(!value)}
      style={{
        width: "40px",
        height: "22px",
        borderRadius: "100px",
        background: value ? "#6366f1" : "#e5e7eb",
        position: "relative",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "3px",
          left: value ? "calc(100% - 19px)" : "3px",
          width: "16px",
          height: "16px",
          background: "#fff",
          borderRadius: "50%",
          transition: "left 0.2s",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }}
      />
    </div>
    <span style={{ fontSize: "13px", color: "#374151", fontWeight: 600 }}>
      {label}
    </span>
  </label>
);

const ColorPicker = ({ value, onChange, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
    <input
      type="color"
      value={value || "#6366f1"}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "36px",
        height: "36px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        padding: 0,
      }}
    />
    <Input value={value} onChange={onChange} placeholder="#6366f1" />
  </div>
);

function SectionEditor({ section, onChange, theme }) {
  const p = section.props;
  const up = (key, val) =>
    onChange({ ...section, props: { ...p, [key]: val } });
  const primary = theme?.primary || "#6366f1";

  const updateArrayItem = (key, idx, field, val) => {
    const arr = [...(p[key] || [])];
    arr[idx] = { ...arr[idx], [field]: val };
    up(key, arr);
  };
  const addArrayItem = (key, template) =>
    up(key, [...(p[key] || []), { ...template }]);
  const removeArrayItem = (key, idx) =>
    up(
      key,
      (p[key] || []).filter((_, i) => i !== idx),
    );

  switch (section.type) {
    case "Hero":
      return (
        <>
          <FieldRow label="العنوان الرئيسي">
            <Textarea
              value={p.title}
              onChange={(v) => up("title", v)}
              rows={2}
            />
          </FieldRow>
          <FieldRow label="الوصف">
            <Textarea value={p.subtitle} onChange={(v) => up("subtitle", v)} />
          </FieldRow>
          <FieldRow label="نص الزر الأول">
            <Input value={p.btnText} onChange={(v) => up("btnText", v)} />
          </FieldRow>
          <FieldRow label="رابط الزر الأول">
            <Input value={p.btnLink} onChange={(v) => up("btnLink", v)} />
          </FieldRow>
          <FieldRow label="نوع الخلفية">
            <Select
              value={p.bgType || "gradient"}
              onChange={(v) => up("bgType", v)}
              options={[
                { value: "gradient", label: "تدرج لوني" },
                { value: "color", label: "لون ثابت" },
                { value: "image", label: "صورة" },
              ]}
            />
          </FieldRow>
          {(p.bgType === "gradient" || !p.bgType) && (
            <FieldRow label="CSS التدرج">
              <Input
                value={p.bgGradient}
                onChange={(v) => up("bgGradient", v)}
                placeholder="linear-gradient(...)"
              />
            </FieldRow>
          )}
          {p.bgType === "color" && (
            <FieldRow label="اللون">
              <ColorPicker
                value={p.bgColor}
                onChange={(v) => up("bgColor", v)}
              />
            </FieldRow>
          )}
          {p.bgType === "image" && (
            <>
              <FieldRow label="رابط الصورة">
                <Input value={p.bgImage} onChange={(v) => up("bgImage", v)} />
              </FieldRow>
              <FieldRow label="شدة التعتيم">
                <Select
                  value={p.darkOverlay || "0.6"}
                  onChange={(v) => up("darkOverlay", v)}
                  options={[
                    { value: "0.2", label: "خفيف جداً" },
                    { value: "0.4", label: "خفيف" },
                    { value: "0.6", label: "متوسط" },
                    { value: "0.8", label: "قوي" },
                  ]}
                />
              </FieldRow>
            </>
          )}
          <FieldRow label="محاذاة النص">
            <Select
              value={p.textAlign || "center"}
              onChange={(v) => up("textAlign", v)}
              options={[
                { value: "right", label: "يمين" },
                { value: "center", label: "وسط" },
                { value: "left", label: "يسار" },
              ]}
            />
          </FieldRow>
          <FieldRow label="شارة علوية">
            <Toggle
              value={p.showBadge}
              onChange={(v) => up("showBadge", v)}
              label="إظهار الشارة"
            />
          </FieldRow>
          {p.showBadge && (
            <FieldRow label="نص الشارة">
              <Input value={p.badgeText} onChange={(v) => up("badgeText", v)} />
            </FieldRow>
          )}
          <FieldRow label="زر ثاني">
            <Toggle
              value={p.showSecondBtn}
              onChange={(v) => up("showSecondBtn", v)}
              label="إظهار الزر الثاني"
            />
          </FieldRow>
          {p.showSecondBtn && (
            <FieldRow label="نص الزر الثاني">
              <Input
                value={p.secondBtnText}
                onChange={(v) => up("secondBtnText", v)}
              />
            </FieldRow>
          )}
        </>
      );

    case "StatsBar":
      return (
        <>
          <FieldRow label="لون الخلفية">
            <ColorPicker value={p.bgColor} onChange={(v) => up("bgColor", v)} />
          </FieldRow>
          <FieldRow label="لون النص">
            <ColorPicker
              value={p.textColor}
              onChange={(v) => up("textColor", v)}
            />
          </FieldRow>
          <FieldRow label="العناصر">
            {(p.items || []).map((item, i) => (
              <div
                key={i}
                style={{
                  background: "#f9fafb",
                  borderRadius: "10px",
                  padding: "12px",
                  marginBottom: "10px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{ display: "flex", gap: "8px", marginBottom: "8px" }}
                >
                  <Input
                    value={item.value}
                    onChange={(v) => updateArrayItem("items", i, "value", v)}
                    placeholder="50k+"
                  />
                  <button
                    onClick={() => removeArrayItem("items", i)}
                    style={{
                      background: "#fee2e2",
                      border: "none",
                      borderRadius: "8px",
                      padding: "0 10px",
                      cursor: "pointer",
                      color: "#ef4444",
                    }}
                  >
                    ×
                  </button>
                </div>
                <Input
                  value={item.label}
                  onChange={(v) => updateArrayItem("items", i, "label", v)}
                  placeholder="طالب مسجل"
                />
              </div>
            ))}
            <button
              onClick={() =>
                addArrayItem("items", { value: "0+", label: "عنصر جديد" })
              }
              style={{
                width: "100%",
                padding: "10px",
                background: `${primary}10`,
                border: `1.5px dashed ${primary}60`,
                borderRadius: "10px",
                color: primary,
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              + إضافة عنصر
            </button>
          </FieldRow>
        </>
      );

    case "FeaturesGrid":
      return (
        <>
          <FieldRow label="العنوان">
            <Input value={p.title} onChange={(v) => up("title", v)} />
          </FieldRow>
          <FieldRow label="الوصف">
            <Input value={p.subtitle} onChange={(v) => up("subtitle", v)} />
          </FieldRow>
          <FieldRow label="عدد الأعمدة">
            <Select
              value={p.columns || 3}
              onChange={(v) => up("columns", parseInt(v))}
              options={[
                { value: 2, label: "2 أعمدة" },
                { value: 3, label: "3 أعمدة" },
                { value: 4, label: "4 أعمدة" },
              ]}
            />
          </FieldRow>
          <FieldRow label="ستايل البطاقات">
            <Select
              value={p.style || "default"}
              onChange={(v) => up("style", v)}
              options={[
                { value: "default", label: "ابيض" },
                { value: "colored", label: "ملون خفيف" },
                { value: "bordered", label: "بوردر" },
              ]}
            />
          </FieldRow>
          <FieldRow label="العناصر">
            {(p.items || []).map((item, i) => (
              <div
                key={i}
                style={{
                  background: "#f9fafb",
                  borderRadius: "10px",
                  padding: "12px",
                  marginBottom: "10px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{ display: "flex", gap: "8px", marginBottom: "8px" }}
                >
                  <Input
                    value={item.icon}
                    onChange={(v) => updateArrayItem("items", i, "icon", v)}
                    placeholder="🎓"
                  />
                  <button
                    onClick={() => removeArrayItem("items", i)}
                    style={{
                      background: "#fee2e2",
                      border: "none",
                      borderRadius: "8px",
                      padding: "0 10px",
                      cursor: "pointer",
                      color: "#ef4444",
                      flexShrink: 0,
                    }}
                  >
                    ×
                  </button>
                </div>
                <div style={{ marginBottom: "6px" }}>
                  <Input
                    value={item.title}
                    onChange={(v) => updateArrayItem("items", i, "title", v)}
                    placeholder="العنوان"
                  />
                </div>
                <Textarea
                  value={item.desc}
                  onChange={(v) => updateArrayItem("items", i, "desc", v)}
                  rows={2}
                />
              </div>
            ))}
            <button
              onClick={() =>
                addArrayItem("items", {
                  icon: "⭐",
                  title: "مميزة جديدة",
                  desc: "وصف المميزة",
                })
              }
              style={{
                width: "100%",
                padding: "10px",
                background: `${primary}10`,
                border: `1.5px dashed ${primary}60`,
                borderRadius: "10px",
                color: primary,
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              + إضافة ميزة
            </button>
          </FieldRow>
        </>
      );

    case "CoursesPlaceholder":
      return (
        <>
          <FieldRow label="العنوان">
            <Input value={p.title} onChange={(v) => up("title", v)} />
          </FieldRow>
          <FieldRow label="الوصف">
            <Input value={p.subtitle} onChange={(v) => up("subtitle", v)} />
          </FieldRow>
          <FieldRow label="فلتر الفئة">
            <Select
              value={p.categoryFilter || "all"}
              onChange={(v) => up("categoryFilter", v)}
              options={[
                { value: "all", label: "الكل" },
                { value: "popular", label: "الأكثر مشاهدة" },
                { value: "new", label: "الأحدث" },
                { value: "recommended", label: "موصى به" },
              ]}
            />
          </FieldRow>
          <FieldRow label="عدد الكورسات">
            <Select
              value={p.limit || 8}
              onChange={(v) => up("limit", parseInt(v))}
              options={[
                { value: 4, label: "4" },
                { value: 8, label: "8" },
                { value: 12, label: "12" },
              ]}
            />
          </FieldRow>
          <div
            style={{
              background: "#fef3c7",
              borderRadius: "10px",
              padding: "12px",
              fontSize: "12px",
              color: "#92400e",
              border: "1px solid #fde68a",
            }}
          >
            ⚡ هذا السكشن ديناميكي — الكورسات هتيجي تلقائياً من الباك اند حسب
            الفلتر
          </div>
        </>
      );

    case "GradesSection":
      return (
        <>
          <FieldRow label="العنوان">
            <Input value={p.title} onChange={(v) => up("title", v)} />
          </FieldRow>
          <FieldRow label="المراحل">
            {(p.grades || []).map((grade, i) => (
              <div
                key={i}
                style={{
                  background: "#f9fafb",
                  borderRadius: "10px",
                  padding: "12px",
                  marginBottom: "10px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{ display: "flex", gap: "8px", marginBottom: "8px" }}
                >
                  <Input
                    value={grade.icon}
                    onChange={(v) => updateArrayItem("grades", i, "icon", v)}
                    placeholder="📚"
                  />
                  <button
                    onClick={() => removeArrayItem("grades", i)}
                    style={{
                      background: "#fee2e2",
                      border: "none",
                      borderRadius: "8px",
                      padding: "0 10px",
                      cursor: "pointer",
                      color: "#ef4444",
                      flexShrink: 0,
                    }}
                  >
                    ×
                  </button>
                </div>
                <div style={{ marginBottom: "6px" }}>
                  <Input
                    value={grade.name}
                    onChange={(v) => updateArrayItem("grades", i, "name", v)}
                    placeholder="اسم المرحلة"
                  />
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="color"
                    value={grade.color || "#6366f1"}
                    onChange={(e) =>
                      updateArrayItem("grades", i, "color", e.target.value)
                    }
                    style={{
                      width: "40px",
                      height: "36px",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  />
                  <Input
                    value={grade.slug}
                    onChange={(v) => updateArrayItem("grades", i, "slug", v)}
                    placeholder="grade-7"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() =>
                addArrayItem("grades", {
                  name: "مرحلة جديدة",
                  icon: "📗",
                  slug: "new-grade",
                  color: "#6366f1",
                  color2: "#4f46e5",
                })
              }
              style={{
                width: "100%",
                padding: "10px",
                background: `${primary}10`,
                border: `1.5px dashed ${primary}60`,
                borderRadius: "10px",
                color: primary,
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              + إضافة مرحلة
            </button>
          </FieldRow>
          <div
            style={{
              background: "#fef3c7",
              borderRadius: "10px",
              padding: "12px",
              fontSize: "12px",
              color: "#92400e",
              border: "1px solid #fde68a",
            }}
          >
            ⚡ عدد الكورسات هيجي من الباك اند تلقائياً
          </div>
        </>
      );

    case "BookBundle":
      return (
        <>
          <FieldRow label="العنوان">
            <Input value={p.title} onChange={(v) => up("title", v)} />
          </FieldRow>
          <FieldRow label="الوصف">
            <Textarea
              value={p.description}
              onChange={(v) => up("description", v)}
            />
          </FieldRow>
          <FieldRow label="السعر الحالي">
            <Input
              value={p.price}
              onChange={(v) => up("price", v)}
              placeholder="299 جنيه"
            />
          </FieldRow>
          <FieldRow label="السعر القديم (اختياري)">
            <Input
              value={p.oldPrice}
              onChange={(v) => up("oldPrice", v)}
              placeholder="599 جنيه"
            />
          </FieldRow>
          <FieldRow label="رابط صورة الغلاف">
            <Input
              value={p.coverImage}
              onChange={(v) => up("coverImage", v)}
              placeholder="https://..."
            />
          </FieldRow>
          <FieldRow label="نص الشارة">
            <Input
              value={p.badge}
              onChange={(v) => up("badge", v)}
              placeholder="🔥 عرض محدود"
            />
          </FieldRow>
          <FieldRow label="نص زر الشراء">
            <Input value={p.ctaText} onChange={(v) => up("ctaText", v)} />
          </FieldRow>
          <FieldRow label="رابط الشراء">
            <Input value={p.ctaLink} onChange={(v) => up("ctaLink", v)} />
          </FieldRow>
          <FieldRow label="المميزات">
            {(p.features || []).map((feat, i) => (
              <div
                key={i}
                style={{ display: "flex", gap: "8px", marginBottom: "8px" }}
              >
                <Input
                  value={feat}
                  onChange={(v) => {
                    const arr = [...p.features];
                    arr[i] = v;
                    up("features", arr);
                  }}
                />
                <button
                  onClick={() =>
                    up(
                      "features",
                      p.features.filter((_, j) => j !== i),
                    )
                  }
                  style={{
                    background: "#fee2e2",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0 10px",
                    cursor: "pointer",
                    color: "#ef4444",
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                up("features", [...(p.features || []), "ميزة جديدة"])
              }
              style={{
                width: "100%",
                padding: "10px",
                background: `${primary}10`,
                border: `1.5px dashed ${primary}60`,
                borderRadius: "10px",
                color: primary,
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              + إضافة ميزة
            </button>
          </FieldRow>
        </>
      );

    case "TestimonialsSlider":
      return (
        <>
          <FieldRow label="العنوان">
            <Input value={p.title} onChange={(v) => up("title", v)} />
          </FieldRow>
          <FieldRow label="الآراء">
            {(p.items || []).map((item, i) => (
              <div
                key={i}
                style={{
                  background: "#f9fafb",
                  borderRadius: "10px",
                  padding: "12px",
                  marginBottom: "10px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{ display: "flex", gap: "8px", marginBottom: "8px" }}
                >
                  <Input
                    value={item.name}
                    onChange={(v) => updateArrayItem("items", i, "name", v)}
                    placeholder="الاسم"
                  />
                  <button
                    onClick={() => removeArrayItem("items", i)}
                    style={{
                      background: "#fee2e2",
                      border: "none",
                      borderRadius: "8px",
                      padding: "0 10px",
                      cursor: "pointer",
                      color: "#ef4444",
                      flexShrink: 0,
                    }}
                  >
                    ×
                  </button>
                </div>
                <div style={{ marginBottom: "6px" }}>
                  <Input
                    value={item.role}
                    onChange={(v) => updateArrayItem("items", i, "role", v)}
                    placeholder="الدور"
                  />
                </div>
                <Textarea
                  value={item.text}
                  onChange={(v) => updateArrayItem("items", i, "text", v)}
                  rows={2}
                />
              </div>
            ))}
            <button
              onClick={() =>
                addArrayItem("items", {
                  name: "اسم الطالب",
                  role: "طالب",
                  text: "تجربة رائعة!",
                  stars: 5,
                })
              }
              style={{
                width: "100%",
                padding: "10px",
                background: `${primary}10`,
                border: `1.5px dashed ${primary}60`,
                borderRadius: "10px",
                color: primary,
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              + إضافة رأي
            </button>
          </FieldRow>
        </>
      );

    case "VideoSection":
      return (
        <>
          <FieldRow label="العنوان">
            <Input value={p.title} onChange={(v) => up("title", v)} />
          </FieldRow>
          <FieldRow label="رابط يوتيوب (embed)">
            <Input
              value={p.videoUrl}
              onChange={(v) => up("videoUrl", v)}
              placeholder="https://www.youtube.com/embed/..."
            />
          </FieldRow>
          <FieldRow label="تعليق الفيديو">
            <Input value={p.caption} onChange={(v) => up("caption", v)} />
          </FieldRow>
        </>
      );

    case "ImageText":
      return (
        <>
          <FieldRow label="العنوان">
            <Input value={p.title} onChange={(v) => up("title", v)} />
          </FieldRow>
          <FieldRow label="النص">
            <Textarea value={p.text} onChange={(v) => up("text", v)} />
          </FieldRow>
          <FieldRow label="رابط الصورة">
            <Input value={p.image} onChange={(v) => up("image", v)} />
          </FieldRow>
          <FieldRow label="موقع الصورة">
            <Select
              value={p.imagePosition || "right"}
              onChange={(v) => up("imagePosition", v)}
              options={[
                { value: "right", label: "يمين" },
                { value: "left", label: "يسار" },
              ]}
            />
          </FieldRow>
          <FieldRow label="نص الزر (اختياري)">
            <Input value={p.btnText} onChange={(v) => up("btnText", v)} />
          </FieldRow>
          <FieldRow label="رابط الزر">
            <Input value={p.btnLink} onChange={(v) => up("btnLink", v)} />
          </FieldRow>
        </>
      );

    case "CTABanner":
      return (
        <>
          <FieldRow label="العنوان">
            <Input value={p.title} onChange={(v) => up("title", v)} />
          </FieldRow>
          <FieldRow label="الوصف">
            <Input value={p.subtitle} onChange={(v) => up("subtitle", v)} />
          </FieldRow>
          <FieldRow label="نص الزر">
            <Input value={p.btnText} onChange={(v) => up("btnText", v)} />
          </FieldRow>
          <FieldRow label="الخلفية (CSS)">
            <Input
              value={p.bg}
              onChange={(v) => up("bg", v)}
              placeholder="linear-gradient(...)"
            />
          </FieldRow>
        </>
      );

    case "FAQ":
      return (
        <>
          <FieldRow label="العنوان">
            <Input value={p.title} onChange={(v) => up("title", v)} />
          </FieldRow>
          <FieldRow label="الأسئلة">
            {(p.questions || []).map((item, i) => (
              <div
                key={i}
                style={{
                  background: "#f9fafb",
                  borderRadius: "10px",
                  padding: "12px",
                  marginBottom: "10px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{ display: "flex", gap: "8px", marginBottom: "8px" }}
                >
                  <Input
                    value={item.q}
                    onChange={(v) => updateArrayItem("questions", i, "q", v)}
                    placeholder="السؤال"
                  />
                  <button
                    onClick={() => removeArrayItem("questions", i)}
                    style={{
                      background: "#fee2e2",
                      border: "none",
                      borderRadius: "8px",
                      padding: "0 10px",
                      cursor: "pointer",
                      color: "#ef4444",
                      flexShrink: 0,
                    }}
                  >
                    ×
                  </button>
                </div>
                <Textarea
                  value={item.a}
                  onChange={(v) => updateArrayItem("questions", i, "a", v)}
                  rows={2}
                />
              </div>
            ))}
            <button
              onClick={() =>
                addArrayItem("questions", { q: "سؤال جديد؟", a: "الإجابة هنا" })
              }
              style={{
                width: "100%",
                padding: "10px",
                background: `${primary}10`,
                border: `1.5px dashed ${primary}60`,
                borderRadius: "10px",
                color: primary,
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              + إضافة سؤال
            </button>
          </FieldRow>
        </>
      );

    case "Text":
      return (
        <>
          <FieldRow label="المحتوى">
            <Textarea
              value={p.content}
              onChange={(v) => up("content", v)}
              rows={4}
            />
          </FieldRow>
          <FieldRow label="نوع العنصر">
            <Select
              value={p.tag || "p"}
              onChange={(v) => up("tag", v)}
              options={[
                { value: "h1", label: "H1 - عنوان رئيسي" },
                { value: "h2", label: "H2 - عنوان فرعي" },
                { value: "p", label: "فقرة نصية" },
              ]}
            />
          </FieldRow>
          <FieldRow label="المحاذاة">
            <Select
              value={p.align || "right"}
              onChange={(v) => up("align", v)}
              options={[
                { value: "right", label: "يمين" },
                { value: "center", label: "وسط" },
                { value: "left", label: "يسار" },
              ]}
            />
          </FieldRow>
          <FieldRow label="اللون">
            <ColorPicker
              value={p.color || "#111827"}
              onChange={(v) => up("color", v)}
            />
          </FieldRow>
        </>
      );

    case "Spacer":
      return (
        <FieldRow label="الارتفاع (px)">
          <Input
            value={p.height}
            onChange={(v) => up("height", parseInt(v))}
            type="number"
          />
        </FieldRow>
      );

    case "Divider":
      return (
        <>
          <FieldRow label="النمط">
            <Select
              value={p.style || "solid"}
              onChange={(v) => up("style", v)}
              options={[
                { value: "solid", label: "خط عادي" },
                { value: "dashed", label: "متقطع" },
                { value: "thick", label: "سميك" },
              ]}
            />
          </FieldRow>
          <FieldRow label="اللون">
            <ColorPicker
              value={p.color || "#e5e7eb"}
              onChange={(v) => up("color", v)}
            />
          </FieldRow>
        </>
      );

    default:
      return (
        <div style={{ color: "#6b7280", fontSize: "13px" }}>
          لا توجد إعدادات لهذا السكشن
        </div>
      );
  }
}

/* ══════════════════════════════════════════════════════════════
   SECTION PREVIEW RENDERER
══════════════════════════════════════════════════════════════ */
function SectionPreview({ section, theme, isSelected, onClick }) {
  const p = section.props;
  const primary = theme?.primary || "#6366f1";
  const secondary = theme?.secondary || "#4f46e5";

  const previewStyle = {
    cursor: "pointer",
    outline: isSelected ? `2.5px solid ${primary}` : "2px solid transparent",
    outlineOffset: "2px",
    borderRadius: "4px",
    transition: "outline 0.15s",
    position: "relative",
  };

  switch (section.type) {
    case "Hero": {
      const bg =
        p.bgType === "image"
          ? `linear-gradient(rgba(0,0,0,${p.darkOverlay || 0.6}),rgba(0,0,0,${p.darkOverlay || 0.6})),url(${p.bgImage}) center/cover`
          : p.bgType === "gradient" || !p.bgType
            ? p.bgGradient || `linear-gradient(135deg,${primary},${secondary})`
            : p.bgColor || primary;
      return (
        <div style={previewStyle} onClick={onClick}>
          <section
            style={{
              background: bg,
              padding: "5rem 2rem",
              borderRadius: "1.5rem",
              overflow: "hidden",
              color: "#fff",
              textAlign: p.textAlign || "center",
              margin: "8px",
              position: "relative",
            }}
          >
            {p.showBadge && (
              <div
                style={{
                  display: "inline-block",
                  background: "rgba(255,255,255,0.2)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  backdropFilter: "blur(10px)",
                  padding: "6px 16px",
                  borderRadius: "100px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  marginBottom: "1rem",
                }}
              >
                {p.badgeText}
              </div>
            )}
            <h1
              style={{
                fontSize: "clamp(1.8rem,4vw,3.5rem)",
                fontWeight: 900,
                marginBottom: "1rem",
                lineHeight: 1.2,
              }}
            >
              {p.title}
            </h1>
            <p
              style={{
                fontSize: "clamp(0.9rem,1.5vw,1.2rem)",
                opacity: 0.9,
                marginBottom: "2rem",
                maxWidth: "600px",
                margin: "0 auto 2rem",
                lineHeight: 1.7,
              }}
            >
              {p.subtitle}
            </p>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent:
                  p.textAlign === "right"
                    ? "flex-end"
                    : p.textAlign === "left"
                      ? "flex-start"
                      : "center",
                flexWrap: "wrap",
              }}
            >
              <button
                style={{
                  padding: "14px 32px",
                  background: "#fff",
                  color: primary,
                  fontWeight: 800,
                  fontSize: "1rem",
                  borderRadius: "12px",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                }}
              >
                {p.btnText}
              </button>
              {p.showSecondBtn && (
                <button
                  style={{
                    padding: "14px 32px",
                    background: "transparent",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "1rem",
                    borderRadius: "12px",
                    border: "2px solid rgba(255,255,255,0.6)",
                    cursor: "pointer",
                  }}
                >
                  {p.secondBtnText}
                </button>
              )}
            </div>
          </section>
        </div>
      );
    }

    case "StatsBar":
      return (
        <div style={previewStyle} onClick={onClick}>
          <section
            style={{
              background: p.bgColor || primary,
              padding: "2.5rem 2rem",
              borderRadius: "1.2rem",
              margin: "8px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${Math.min((p.items || []).length, 4)}, 1fr)`,
                gap: "1.5rem",
                textAlign: "center",
              }}
            >
              {(p.items || []).map((item, i) => (
                <div key={i}>
                  <div
                    style={{
                      fontSize: "2.2rem",
                      fontWeight: 900,
                      color: p.textColor || "#fff",
                    }}
                  >
                    {item.value}
                  </div>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: p.textColor || "rgba(255,255,255,0.8)",
                      fontWeight: 600,
                      marginTop: "4px",
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      );

    case "FeaturesGrid":
      return (
        <div style={previewStyle} onClick={onClick}>
          <section style={{ padding: "2.5rem 2rem", margin: "8px" }}>
            {p.title && (
              <h2
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 900,
                  textAlign: "center",
                  marginBottom: p.subtitle ? "0.4rem" : "2rem",
                  color: "#111827",
                }}
              >
                {p.title}
              </h2>
            )}
            {p.subtitle && (
              <p
                style={{
                  textAlign: "center",
                  color: "#6b7280",
                  marginBottom: "2rem",
                }}
              >
                {p.subtitle}
              </p>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${p.columns || 3}, 1fr)`,
                gap: "16px",
              }}
            >
              {(p.items || []).map((item, i) => (
                <div
                  key={i}
                  style={{
                    background: p.style === "colored" ? `${primary}10` : "#fff",
                    padding: "20px",
                    borderRadius: "16px",
                    border: `1px solid ${p.style === "bordered" ? primary + "40" : "#f3f4f6"}`,
                    textAlign: "center",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "2rem",
                      marginBottom: "12px",
                      display: "inline-flex",
                      width: "60px",
                      height: "60px",
                      alignItems: "center",
                      justifyContent: "center",
                      background: `${primary}15`,
                      borderRadius: "16px",
                    }}
                  >
                    {item.icon}
                  </div>
                  <h3
                    style={{
                      fontWeight: 800,
                      color: "#111827",
                      marginBottom: "6px",
                      fontSize: "1rem",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: "0.85rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      );

    case "CoursesPlaceholder":
      return (
        <div style={previewStyle} onClick={onClick}>
          <section
            style={{
              padding: "2.5rem 2rem",
              background: "#f9fafb",
              margin: "8px",
              borderRadius: "12px",
            }}
          >
            <h2
              style={{
                fontSize: "1.8rem",
                fontWeight: 900,
                marginBottom: "0.4rem",
                color: "#111827",
              }}
            >
              {p.title}
            </h2>
            {p.subtitle && (
              <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
                {p.subtitle}
              </p>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "12px",
              }}
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    background: "#fff",
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <div
                    style={{
                      height: "100px",
                      background: `linear-gradient(135deg, ${primary}30, ${secondary}30)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                    }}
                  >
                    🎓
                  </div>
                  <div style={{ padding: "10px" }}>
                    <div
                      style={{
                        height: "10px",
                        background: "#e5e7eb",
                        borderRadius: "4px",
                        marginBottom: "6px",
                      }}
                    />
                    <div
                      style={{
                        height: "8px",
                        background: "#f3f4f6",
                        borderRadius: "4px",
                        width: "60%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                textAlign: "center",
                marginTop: "12px",
                padding: "8px",
                background: "#fef3c7",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#92400e",
                border: "1px solid #fde68a",
              }}
            >
              ⚡ يتم تحميل {p.limit || 8} كورسات من الباك اند (
              {p.categoryFilter || "all"})
            </div>
          </section>
        </div>
      );

    case "GradesSection":
      return (
        <div style={previewStyle} onClick={onClick}>
          <section style={{ padding: "2.5rem 2rem", margin: "8px" }}>
            <h2
              style={{
                fontSize: "1.8rem",
                fontWeight: 900,
                textAlign: "center",
                marginBottom: "2rem",
                color: "#111827",
              }}
            >
              {p.title}
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "12px",
              }}
            >
              {(p.grades || []).map((g, i) => (
                <div
                  key={i}
                  style={{
                    background: `linear-gradient(135deg,${g.color || primary},${g.color2 || secondary})`,
                    padding: "20px",
                    borderRadius: "16px",
                    textAlign: "center",
                    color: "#fff",
                  }}
                >
                  <div style={{ fontSize: "2rem", marginBottom: "8px" }}>
                    {g.icon}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: "0.9rem" }}>
                    {g.name}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      );

    case "BookBundle":
      return (
        <div style={previewStyle} onClick={onClick}>
          <section
            style={{
              padding: "2.5rem 2rem",
              background: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
              margin: "8px",
              borderRadius: "16px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: "2rem",
                alignItems: "center",
              }}
            >
              <div style={{ position: "relative" }}>
                {p.badge && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-8px",
                      right: "-8px",
                      background: "#f59e0b",
                      color: "#fff",
                      padding: "4px 12px",
                      borderRadius: "100px",
                      fontWeight: 700,
                      fontSize: "0.7rem",
                      zIndex: 2,
                    }}
                  >
                    {p.badge}
                  </div>
                )}
                <div
                  style={{
                    background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                    borderRadius: "12px",
                    aspectRatio: "3/4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                    transform: "rotate(-3deg)",
                  }}
                >
                  {p.coverImage ? (
                    <img
                      src={p.coverImage}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "12px",
                      }}
                    />
                  ) : (
                    "📦"
                  )}
                </div>
              </div>
              <div style={{ color: "#fff" }}>
                <h2
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: 900,
                    marginBottom: "0.8rem",
                  }}
                >
                  {p.title}
                </h2>
                <p
                  style={{
                    opacity: 0.8,
                    fontSize: "0.85rem",
                    marginBottom: "1rem",
                    lineHeight: 1.7,
                  }}
                >
                  {p.description?.substring(0, 100)}...
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "1rem",
                  }}
                >
                  {p.oldPrice && (
                    <span
                      style={{
                        textDecoration: "line-through",
                        opacity: 0.4,
                        fontSize: "1rem",
                      }}
                    >
                      {p.oldPrice}
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: 900,
                      color: "#f59e0b",
                    }}
                  >
                    {p.price}
                  </span>
                </div>
                <div
                  style={{
                    display: "inline-block",
                    padding: "10px 24px",
                    background: primary,
                    borderRadius: "10px",
                    fontWeight: 800,
                    fontSize: "0.9rem",
                  }}
                >
                  {p.ctaText}
                </div>
              </div>
            </div>
          </section>
        </div>
      );

    case "TestimonialsSlider":
      return (
        <div style={previewStyle} onClick={onClick}>
          <section style={{ padding: "2.5rem 2rem", margin: "8px" }}>
            <h2
              style={{
                fontSize: "1.8rem",
                fontWeight: 900,
                textAlign: "center",
                marginBottom: "2rem",
                color: "#111827",
              }}
            >
              {p.title}
            </h2>
            <div
              style={{
                display: "flex",
                gap: "16px",
                overflowX: "auto",
                paddingBottom: "8px",
              }}
            >
              {(p.items || []).slice(0, 3).map((item, i) => (
                <div
                  key={i}
                  style={{
                    minWidth: "260px",
                    background: "#f9fafb",
                    padding: "20px",
                    borderRadius: "16px",
                    border: "1px solid #f3f4f6",
                  }}
                >
                  <div
                    style={{
                      color: "#f59e0b",
                      marginBottom: "10px",
                      fontSize: "0.9rem",
                    }}
                  >
                    {"★★★★★"}
                  </div>
                  <p
                    style={{
                      color: "#374151",
                      fontSize: "0.85rem",
                      lineHeight: 1.7,
                      marginBottom: "14px",
                    }}
                  >
                    "{item.text?.substring(0, 80)}..."
                  </p>
                  <div
                    style={{
                      fontWeight: 800,
                      color: "#111827",
                      fontSize: "0.9rem",
                    }}
                  >
                    {item.name}
                  </div>
                  <div style={{ color: "#6b7280", fontSize: "0.8rem" }}>
                    {item.role}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      );

    case "VideoSection":
      return (
        <div style={previewStyle} onClick={onClick}>
          <section
            style={{
              padding: "2.5rem 2rem",
              background: "#f9fafb",
              margin: "8px",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            {p.title && (
              <h2
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 900,
                  marginBottom: "1.5rem",
                  color: "#111827",
                }}
              >
                {p.title}
              </h2>
            )}
            <div
              style={{
                background: "#000",
                borderRadius: "16px",
                aspectRatio: "16/9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                maxWidth: "700px",
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  background: primary,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    borderLeft: "20px solid #fff",
                    borderTop: "12px solid transparent",
                    borderBottom: "12px solid transparent",
                    marginLeft: "4px",
                  }}
                />
              </div>
            </div>
            {p.caption && (
              <p style={{ color: "#6b7280", marginTop: "1rem" }}>{p.caption}</p>
            )}
          </section>
        </div>
      );

    case "ImageText":
      return (
        <div style={previewStyle} onClick={onClick}>
          <section style={{ padding: "2.5rem 2rem", margin: "8px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2.5rem",
                alignItems: "center",
                direction: p.imagePosition === "left" ? "ltr" : "rtl",
              }}
            >
              <div
                style={{
                  background: "#f3f4f6",
                  borderRadius: "16px",
                  aspectRatio: "4/3",
                  overflow: "hidden",
                }}
              >
                {p.image && (
                  <img
                    src={p.image}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                )}
              </div>
              <div style={{ direction: "rtl" }}>
                <h2
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: 900,
                    color: "#111827",
                    marginBottom: "1rem",
                  }}
                >
                  {p.title}
                </h2>
                <p
                  style={{
                    color: "#6b7280",
                    lineHeight: 1.8,
                    marginBottom: "1.5rem",
                  }}
                >
                  {p.text?.substring(0, 120)}...
                </p>
                {p.btnText && (
                  <div
                    style={{
                      display: "inline-block",
                      padding: "10px 24px",
                      background: primary,
                      color: "#fff",
                      borderRadius: "10px",
                      fontWeight: 700,
                    }}
                  >
                    {p.btnText}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      );

    case "FAQ":
      return (
        <div style={previewStyle} onClick={onClick}>
          <section style={{ padding: "2.5rem 2rem", margin: "8px" }}>
            {p.title && (
              <h2
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 900,
                  textAlign: "center",
                  marginBottom: "2rem",
                  color: "#111827",
                }}
              >
                {p.title}
              </h2>
            )}
            {(p.questions || []).slice(0, 3).map((item, i) => (
              <div
                key={i}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "10px",
                  background: "#fff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h4
                    style={{
                      fontWeight: 800,
                      color: "#111827",
                      fontSize: "1rem",
                    }}
                  >
                    {item.q}
                  </h4>
                  <ChevronDown size={18} color={primary} />
                </div>
                {i === 0 && (
                  <p
                    style={{
                      marginTop: "10px",
                      color: "#6b7280",
                      fontSize: "0.9rem",
                      lineHeight: 1.7,
                    }}
                  >
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </section>
        </div>
      );

    case "CTABanner":
      return (
        <div style={previewStyle} onClick={onClick}>
          <section
            style={{
              padding: "3.5rem 2rem",
              background:
                p.bg || `linear-gradient(135deg,${primary},${secondary})`,
              textAlign: "center",
              borderRadius: "1.5rem",
              margin: "8px",
            }}
          >
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 900,
                color: "#fff",
                marginBottom: "0.8rem",
              }}
            >
              {p.title}
            </h2>
            {p.subtitle && (
              <p
                style={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: "1rem",
                  marginBottom: "2rem",
                }}
              >
                {p.subtitle}
              </p>
            )}
            <div
              style={{
                display: "inline-block",
                padding: "14px 36px",
                background: "#fff",
                color: primary,
                fontWeight: 800,
                borderRadius: "12px",
              }}
            >
              {p.btnText}
            </div>
          </section>
        </div>
      );

    case "Text": {
      const Tag = p.tag || "p";
      const fs =
        p.fontSize ||
        (p.tag === "h1" ? "2.5rem" : p.tag === "h2" ? "1.8rem" : "1.05rem");
      return (
        <div style={previewStyle} onClick={onClick}>
          <div style={{ padding: "1.5rem 2rem", margin: "8px" }}>
            <Tag
              style={{
                textAlign: p.align || "right",
                fontSize: fs,
                fontWeight: p.tag === "p" ? 500 : 900,
                color: p.color || "#111827",
                lineHeight: 1.7,
              }}
            >
              {p.content}
            </Tag>
          </div>
        </div>
      );
    }

    case "Spacer":
      return (
        <div
          style={{
            ...previewStyle,
            padding: "8px 2rem",
            margin: "8px",
            cursor: "pointer",
          }}
          onClick={onClick}
        >
          <div
            style={{
              border: "2px dashed #e5e7eb",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
              fontSize: "0.85rem",
              padding: "12px",
              gap: "8px",
            }}
          >
            ↕️ مسافة فارغة — {p.height}px
          </div>
        </div>
      );

    case "Divider":
      return (
        <div
          style={{
            ...previewStyle,
            padding: "1.5rem 2rem",
            margin: "8px",
            cursor: "pointer",
          }}
          onClick={onClick}
        >
          <hr
            style={{
              border: "none",
              borderTop: `${p.style === "dashed" ? "2px dashed" : p.style === "thick" ? "4px solid" : "1px solid"} ${p.color || "#e5e7eb"}`,
            }}
          />
        </div>
      );

    default:
      return (
        <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
          🧩 {section.type}
        </div>
      );
  }
}

/* ══════════════════════════════════════════════════════════════
   MAIN EDITOR COMPONENT
══════════════════════════════════════════════════════════════ */
export default function OfoqBuilder({
  initialData,
  onSave,
  onCancel,
  theme: initialTheme,
  slug,
}) {
  const [sections, setSections] = useState(initialData?.sections || []);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [activeTab, setActiveTab] = useState("sections"); // sections | settings
  const [theme, setTheme] = useState(
    initialTheme || { primary: "#6366f1", secondary: "#4f46e5", font: "Cairo" },
  );
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  const primary = theme.primary;
  const secondary = theme.secondary;

  const addSection = (type) => {
    const def = SECTION_DEFS[type];
    if (!def) return;
    const newSection = {
      id: `${type}-${Date.now()}`,
      type,
      props: { ...def.defaultProps },
    };
    setSections((prev) => {
      const newArr = [...prev];
      if (selectedIdx !== null) {
        newArr.splice(selectedIdx + 1, 0, newSection);
        setSelectedIdx(selectedIdx + 1);
      } else {
        newArr.push(newSection);
        setSelectedIdx(newArr.length - 1);
      }
      return newArr;
    });
  };

  const updateSection = (idx, updated) => {
    setSections((prev) => prev.map((s, i) => (i === idx ? updated : s)));
  };

  const deleteSection = (idx) => {
    setSections((prev) => prev.filter((_, i) => i !== idx));
    setSelectedIdx(null);
  };

  const duplicateSection = (idx) => {
    const section = sections[idx];
    const clone = {
      ...section,
      id: `${section.type}-${Date.now()}`,
      props: { ...section.props },
    };
    setSections((prev) => {
      const arr = [...prev];
      arr.splice(idx + 1, 0, clone);
      return arr;
    });
    setSelectedIdx(idx + 1);
  };

  const moveSection = (idx, dir) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= sections.length) return;
    setSections((prev) => {
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
    setSelectedIdx(newIdx);
  };

  const handleSave = () => {
    const html = exportToHTML(sections, theme);
    onSave?.({ sections, theme, html });
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const handleExportHTML = () => {
    const html = exportToHTML(sections, theme);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug || "page"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredDefs = Object.entries(SECTION_DEFS).filter(
    ([key, def]) =>
      def.label.includes(searchTerm) ||
      key.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const bg = darkMode ? "#0f172a" : "#f1f5f9";
  const panelBg = darkMode ? "#1e293b" : "#ffffff";
  const textColor = darkMode ? "#e2e8f0" : "#111827";
  const borderColor = darkMode ? "#334155" : "#e5e7eb";

  const selectedSection = selectedIdx !== null ? sections[selectedIdx] : null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        fontFamily: `'${theme.font || "Cairo"}', sans-serif`,
        background: bg,
        overflow: "hidden",
        direction: "rtl",
      }}
    >
      {/* ── GOOGLE FONTS ── */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=${(theme.font || "Cairo").replace(" ", "+")}:wght@300;400;600;700;800;900&display=swap');*{box-sizing:border-box;}::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${primary}40;border-radius:100px}`}</style>

      {/* ── TOP NAV BAR ── */}
      <div
        style={{
          height: "60px",
          background: panelBg,
          borderBottom: `1px solid ${borderColor}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          flexShrink: 0,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              background: `linear-gradient(135deg,${primary},${secondary})`,
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 12px ${primary}40`,
            }}
          >
            <LayoutGrid color="#fff" size={18} />
          </div>
          <div>
            <div
              style={{ fontWeight: 900, color: textColor, fontSize: "16px" }}
            >
              أفق بيلدر <span style={{ color: primary }}>Pro</span>
            </div>
            <div
              style={{
                fontSize: "11px",
                color: darkMode ? "#94a3b8" : "#9ca3af",
                fontWeight: 600,
              }}
            >
              {sections.length} سكشن • {slug || "صفحة جديدة"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={() => setDarkMode((d) => !d)}
            style={{
              padding: "8px",
              background: darkMode ? "#334155" : "#f1f5f9",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              color: textColor,
            }}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={handleExportHTML}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              background: darkMode ? "#334155" : "#f1f5f9",
              border: `1px solid ${borderColor}`,
              color: textColor,
              fontSize: "13px",
              fontWeight: 700,
              borderRadius: "9px",
              cursor: "pointer",
            }}
          >
            <Download size={15} /> تصدير HTML
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                background: darkMode ? "#334155" : "#f9fafb",
                border: `1px solid ${borderColor}`,
                color: darkMode ? "#94a3b8" : "#4b5563",
                fontSize: "13px",
                fontWeight: 700,
                borderRadius: "9px",
                cursor: "pointer",
              }}
            >
              <X size={15} /> إغلاق
            </button>
          )}
          <button
            onClick={handleSave}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 20px",
              background: exportSuccess ? "#10b981" : primary,
              border: "none",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 800,
              borderRadius: "9px",
              cursor: "pointer",
              boxShadow: `0 4px 12px ${exportSuccess ? "#10b981" : primary}50`,
              transition: "all 0.3s",
            }}
          >
            <CheckCircle size={15} />{" "}
            {exportSuccess ? "تم الحفظ! ✓" : "حفظ ونشر"}
          </button>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* ── LEFT PANEL: Component Library / Settings ── */}
        <div
          style={{
            width: "280px",
            background: panelBg,
            borderLeft: `1px solid ${borderColor}`,
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {/* Tab Switcher */}
          <div
            style={{
              display: "flex",
              borderBottom: `1px solid ${borderColor}`,
              flexShrink: 0,
            }}
          >
            {[
              ["sections", "السكاشن", <Layers size={14} />],
              ["settings", "الإعدادات", <Settings size={14} />],
            ].map(([key, label, icon]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  flex: 1,
                  padding: "12px",
                  background:
                    activeTab === key ? `${primary}10` : "transparent",
                  border: "none",
                  borderBottom:
                    activeTab === key
                      ? `2px solid ${primary}`
                      : "2px solid transparent",
                  color:
                    activeTab === key
                      ? primary
                      : darkMode
                        ? "#94a3b8"
                        : "#6b7280",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          {activeTab === "sections" && (
            <div style={{ flex: 1, overflow: "auto", padding: "12px" }}>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="🔍 بحث في السكاشن..."
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: darkMode ? "#0f172a" : "#f9fafb",
                  border: `1.5px solid ${borderColor}`,
                  borderRadius: "10px",
                  fontSize: "13px",
                  color: textColor,
                  outline: "none",
                  fontFamily: "inherit",
                  marginBottom: "12px",
                }}
              />
              {Object.entries(CATEGORIES).map(([catKey, cat]) => {
                const items = filteredDefs.filter(
                  ([, def]) => def.category === catKey,
                );
                if (items.length === 0) return null;
                return (
                  <div key={catKey} style={{ marginBottom: "16px" }}>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        color: cat.color,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <div
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: cat.color,
                        }}
                      />
                      {cat.label}
                    </div>
                    {items.map(([type, def]) => (
                      <button
                        key={type}
                        onClick={() => addSection(type)}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          background: darkMode ? "#0f172a" : "#f9fafb",
                          border: `1px solid ${borderColor}`,
                          color: textColor,
                          fontSize: "13px",
                          fontWeight: 600,
                          borderRadius: "10px",
                          cursor: "pointer",
                          textAlign: "right",
                          marginBottom: "6px",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = `${primary}10`;
                          e.currentTarget.style.borderColor = `${primary}60`;
                          e.currentTarget.style.color = primary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = darkMode
                            ? "#0f172a"
                            : "#f9fafb";
                          e.currentTarget.style.borderColor = borderColor;
                          e.currentTarget.style.color = textColor;
                        }}
                      >
                        <span style={{ fontSize: "1.2rem" }}>{def.icon}</span>
                        {def.label}
                        <Plus
                          size={14}
                          style={{ marginRight: "auto", opacity: 0.5 }}
                        />
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "settings" && (
            <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 800,
                  color: darkMode ? "#94a3b8" : "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "16px",
                }}
              >
                إعدادات الثيم
              </div>
              <FieldRow label="اللون الأساسي">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <input
                    type="color"
                    value={theme.primary}
                    onChange={(e) =>
                      setTheme((t) => ({ ...t, primary: e.target.value }))
                    }
                    style={{
                      width: "36px",
                      height: "36px",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  />
                  <input
                    value={theme.primary}
                    onChange={(e) =>
                      setTheme((t) => ({ ...t, primary: e.target.value }))
                    }
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      background: darkMode ? "#0f172a" : "#f9fafb",
                      border: `1px solid ${borderColor}`,
                      borderRadius: "8px",
                      color: textColor,
                      fontFamily: "inherit",
                      fontSize: "13px",
                    }}
                  />
                </div>
              </FieldRow>
              <FieldRow label="اللون الثانوي">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <input
                    type="color"
                    value={theme.secondary}
                    onChange={(e) =>
                      setTheme((t) => ({ ...t, secondary: e.target.value }))
                    }
                    style={{
                      width: "36px",
                      height: "36px",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  />
                  <input
                    value={theme.secondary}
                    onChange={(e) =>
                      setTheme((t) => ({ ...t, secondary: e.target.value }))
                    }
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      background: darkMode ? "#0f172a" : "#f9fafb",
                      border: `1px solid ${borderColor}`,
                      borderRadius: "8px",
                      color: textColor,
                      fontFamily: "inherit",
                      fontSize: "13px",
                    }}
                  />
                </div>
              </FieldRow>
              <FieldRow label="الخط">
                <Select
                  value={theme.font || "Cairo"}
                  onChange={(v) => setTheme((t) => ({ ...t, font: v }))}
                  options={[
                    { value: "Cairo", label: "Cairo" },
                    { value: "Tajawal", label: "Tajawal" },
                    { value: "Amiri", label: "Amiri" },
                    { value: "IBM Plex Arabic", label: "IBM Plex Arabic" },
                  ]}
                />
              </FieldRow>

              <div
                style={{
                  marginTop: "24px",
                  fontSize: "13px",
                  fontWeight: 800,
                  color: darkMode ? "#94a3b8" : "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "12px",
                }}
              >
                ألوان جاهزة
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "8px",
                }}
              >
                {[
                  { name: "إندجو", primary: "#6366f1", secondary: "#4f46e5" },
                  { name: "أخضر", primary: "#10b981", secondary: "#059669" },
                  { name: "ورديم", primary: "#ec4899", secondary: "#db2777" },
                  { name: "برتقالي", primary: "#f59e0b", secondary: "#d97706" },
                  { name: "أزرق", primary: "#3b82f6", secondary: "#2563eb" },
                  { name: "أحمر", primary: "#ef4444", secondary: "#dc2626" },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() =>
                      setTheme((t) => ({
                        ...t,
                        primary: preset.primary,
                        secondary: preset.secondary,
                      }))
                    }
                    style={{
                      padding: "10px",
                      borderRadius: "10px",
                      border: `2px solid ${theme.primary === preset.primary ? preset.primary : "transparent"}`,
                      cursor: "pointer",
                      background: `linear-gradient(135deg,${preset.primary},${preset.secondary})`,
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── CENTER: Canvas ── */}
        <div style={{ flex: 1, overflow: "auto", padding: "20px" }}>
          {sections.length === 0 ? (
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: darkMode ? "#475569" : "#94a3b8",
              }}
            >
              <div style={{ fontSize: "4rem", marginBottom: "16px" }}>🎨</div>
              <div
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  marginBottom: "8px",
                  color: darkMode ? "#64748b" : "#6b7280",
                }}
              >
                ابدأ بإضافة سكشن
              </div>
              <div style={{ fontSize: "0.9rem" }}>
                اختر من القائمة اليسارية لإضافة أول سكشن
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
              {sections.map((section, idx) => (
                <div
                  key={section.id}
                  style={{ position: "relative", marginBottom: "4px" }}
                  draggable
                  onDragStart={() => setDraggingIdx(idx)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverIdx(idx);
                  }}
                  onDrop={() => {
                    if (draggingIdx === null || draggingIdx === idx) return;
                    setSections((prev) => {
                      const arr = [...prev];
                      const [removed] = arr.splice(draggingIdx, 1);
                      arr.splice(idx, 0, removed);
                      return arr;
                    });
                    setDraggingIdx(null);
                    setDragOverIdx(null);
                    setSelectedIdx(idx);
                  }}
                  onDragEnd={() => {
                    setDraggingIdx(null);
                    setDragOverIdx(null);
                  }}
                >
                  {/* Section Actions Overlay */}
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      left: "10px",
                      zIndex: 5,
                      display: "flex",
                      gap: "4px",
                      opacity: selectedIdx === idx ? 1 : 0,
                      transition: "opacity 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.opacity =
                        selectedIdx === idx ? 1 : 0)
                    }
                  >
                    {[
                      {
                        icon: <Move size={13} />,
                        action: () => {},
                        title: "اسحب",
                        color: "#6b7280",
                      },
                      {
                        icon: (
                          <ChevronDown
                            size={13}
                            style={{ transform: "rotate(180deg)" }}
                          />
                        ),
                        action: () => moveSection(idx, -1),
                        title: "أعلى",
                        color: "#6366f1",
                      },
                      {
                        icon: <ChevronDown size={13} />,
                        action: () => moveSection(idx, 1),
                        title: "أسفل",
                        color: "#6366f1",
                      },
                      {
                        icon: <Copy size={13} />,
                        action: () => duplicateSection(idx),
                        title: "نسخ",
                        color: "#10b981",
                      },
                      {
                        icon: <Trash2 size={13} />,
                        action: () => deleteSection(idx),
                        title: "حذف",
                        color: "#ef4444",
                      },
                    ].map((btn, i) => (
                      <button
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          btn.action();
                        }}
                        title={btn.title}
                        style={{
                          padding: "6px",
                          background: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "7px",
                          cursor: "pointer",
                          color: btn.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                      >
                        {btn.icon}
                      </button>
                    ))}
                  </div>

                  {/* Drop indicator */}
                  {dragOverIdx === idx && draggingIdx !== idx && (
                    <div
                      style={{
                        height: "3px",
                        background: primary,
                        borderRadius: "100px",
                        marginBottom: "4px",
                      }}
                    />
                  )}

                  <SectionPreview
                    section={section}
                    theme={theme}
                    isSelected={selectedIdx === idx}
                    onClick={() => setSelectedIdx(idx)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL: Section Editor ── */}
        <div
          style={{
            width: "300px",
            background: panelBg,
            borderRight: `1px solid ${borderColor}`,
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {selectedSection ? (
            <>
              <div
                style={{
                  padding: "14px 16px",
                  borderBottom: `1px solid ${borderColor}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexShrink: 0,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 800,
                      color: textColor,
                    }}
                  >
                    {SECTION_DEFS[selectedSection.type]?.icon}{" "}
                    {SECTION_DEFS[selectedSection.type]?.label}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: darkMode ? "#475569" : "#94a3b8",
                      marginTop: "2px",
                    }}
                  >
                    تخصيص السكشن
                  </div>
                </div>
                <button
                  onClick={() => setSelectedIdx(null)}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: darkMode ? "#475569" : "#94a3b8",
                    padding: "4px",
                  }}
                >
                  <X size={16} />
                </button>
              </div>
              <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
                <SectionEditor
                  section={selectedSection}
                  onChange={(updated) => updateSection(selectedIdx, updated)}
                  theme={theme}
                />
                <div
                  style={{
                    paddingTop: "20px",
                    borderTop: `1px solid ${borderColor}`,
                    marginTop: "20px",
                    display: "flex",
                    gap: "8px",
                  }}
                >
                  <button
                    onClick={() => duplicateSection(selectedIdx)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      background: darkMode ? "#0f172a" : "#f9fafb",
                      border: `1px solid ${borderColor}`,
                      borderRadius: "9px",
                      color: darkMode ? "#94a3b8" : "#6b7280",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <Copy size={14} /> نسخ
                  </button>
                  <button
                    onClick={() => deleteSection(selectedIdx)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      background: "#fee2e2",
                      border: "1px solid #fca5a5",
                      borderRadius: "9px",
                      color: "#ef4444",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <Trash2 size={14} /> حذف
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: darkMode ? "#475569" : "#94a3b8",
                padding: "24px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>👆</div>
              <div
                style={{
                  fontWeight: 800,
                  color: darkMode ? "#64748b" : "#6b7280",
                  marginBottom: "6px",
                }}
              >
                اضغط على سكشن
              </div>
              <div style={{ fontSize: "0.85rem", lineHeight: 1.6 }}>
                اضغط على أي سكشن في الكانفاس لتخصيصه
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
