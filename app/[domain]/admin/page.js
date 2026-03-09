import { redirect } from "next/navigation";

export default function AdminRoot() {
  // بمجرد الدخول إلى الرابط الأساسي للإدارة، نوجه المعلم لصفحة تسجيل الدخول مباشرةً
  redirect("/login");
}
