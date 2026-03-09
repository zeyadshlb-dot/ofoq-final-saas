import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh]" dir="rtl">
        <h2>404 - غير موجود</h2>
        <Link href="/">العودة للرئيسية</Link>
    </div>
  )
}
