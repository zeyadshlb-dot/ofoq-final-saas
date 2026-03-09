"use client";

import React from "react";

const DAYS = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

const HOURS = Array.from({ length: 24 }, (_, i) => `${i}:00`);

export default function StudentHeatmap({ progressData, dark, primaryColor }) {
  const pc = primaryColor || "#f43f5e";
  const d = dark;

  if (!progressData || progressData.length === 0) {
    return (
      <div className="py-10 text-center bg-white dark:bg-white/5 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
        <p className="text-gray-500 font-bold">
          لا توجد سجلات تقدم كافية لعرض الخريطة الحرارية
        </p>
      </div>
    );
  }

  // Process data for heatmap
  const activityMap = {};
  progressData.forEach((p) => {
    const timestamp = p.updated_at || p.UpdatedAt;
    if (!timestamp) return;
    const date = new Date(timestamp);
    const day = date.getDay();
    const hour = date.getHours();
    const key = `${day}-${hour}`;
    activityMap[key] = (activityMap[key] || 0) + 1;
  });

  const formattedHeatmap = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      formattedHeatmap.push({
        day,
        hour,
        value: activityMap[`${day}-${hour}`] || 0,
      });
    }
  }

  const maxVal = Math.max(...formattedHeatmap.map((h) => h.value), 1);

  return (
    <div
      className={`rounded-3xl p-6 ${d ? "bg-[#16181f] border border-white/[0.06]" : "bg-white border border-gray-100 shadow-sm"}`}
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white">
            نمط نشاطك التعليمي
          </h3>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
            تحليل الأوقات التي تذاكر فيها عادةً
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black opacity-40 uppercase tracking-widest hidden sm:inline">
            كثافة المذاكرة
          </span>
          <div className="flex gap-1">
            {[0.1, 0.3, 0.6, 0.9].map((op, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-sm"
                style={{ backgroundColor: pc, opacity: op }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto pb-4 scrollbar-hide">
        <div className="min-w-[800px] flex gap-2">
          {/* Day Labels */}
          <div className="w-16 pt-10">
            {DAYS.map((day, i) => (
              <div
                key={i}
                className="h-10 flex items-center justify-end pr-4 text-[10px] font-bold text-gray-400"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-24 gap-1.5 mb-2">
              {HOURS.map((h, i) => (
                <div
                  key={i}
                  className="text-center text-[10px] font-bold text-gray-400 rotate-45 h-10 flex items-end justify-center"
                >
                  {h}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-1.5">
              {DAYS.map((_, dIdx) => (
                <div key={dIdx} className="grid grid-cols-24 gap-1.5 h-10">
                  {Array.from({ length: 24 }).map((_, hIdx) => {
                    const val = activityMap[`${dIdx}-${hIdx}`] || 0;
                    const opacity =
                      val === 0 ? 0.05 : (val / maxVal) * 0.9 + 0.1;
                    return (
                      <div
                        key={hIdx}
                        className="rounded-md transition-all group relative cursor-pointer hover:ring-2 hover:ring-primary/50"
                        style={{
                          backgroundColor:
                            val > 0 ? pc : d ? "#ffffff10" : "#00000005",
                          opacity: opacity,
                        }}
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[9px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 font-bold">
                          {val} تفاعل في هذا الوقت
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/[0.06] grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-black text-sm text-gray-700 dark:text-gray-300">
            💡 وصف تفصيلي لنشاطك:
          </h4>
          <p className="text-xs font-medium leading-relaxed text-gray-500 dark:text-gray-400">
            • تظهر الخريطة أعلاه الأيام والساعات التي تكون فيها أكثر نشاطاً في
            مشاهدة الدروس. الألوان الداكنة تدل على فترات التركيز العالي لديك.
          </p>
          <p className="text-xs font-medium leading-relaxed text-gray-500 dark:text-gray-400">
            • استفد من معرفة أوقات ذروة نشاطك لجدولة الدروس الصعبة في تلك
            الفترات لضمان أقصى درجات التحصيل.
          </p>
        </div>
        <div className={`p-4 rounded-2xl ${d ? "bg-white/5" : "bg-gray-50"}`}>
          <h4 className="font-black text-sm mb-3">إحصائيات التقدم:</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">
                إجمالي السجلات
              </p>
              <p className="text-lg font-black">{progressData.length}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">
                الدروس المكتملة
              </p>
              <p className="text-lg font-black text-emerald-500">
                {
                  progressData.filter((p) => p.is_completed || p.IsCompleted)
                    .length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .grid-cols-24 {
          grid-template-columns: repeat(24, minmax(0, 1fr));
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
