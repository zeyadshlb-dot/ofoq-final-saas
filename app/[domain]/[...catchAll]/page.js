import { notFound } from "next/navigation";

export default function CatchAllNotFound() {
  // هذه الصفحة تعتبر "مصيدة" لأي رابط غير موجود داخل الدومين
  // بمجرد ما الرابط يدخل هنا، بنجبر Next.js إنه يرمي الخطأ ويشغل ملف not-found.js بتاعنا
  notFound();
}
