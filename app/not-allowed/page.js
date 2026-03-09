import { ShieldAlert } from "lucide-react";

export default function NotAllowed() {
  return (
    <div
      className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans text-neutral-100 selection:bg-red-500/30"
      dir="rtl"
    >
      {/* Background glowing effects */}
      <div className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[600px] md:h-[600px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-2xl w-full text-center space-y-10">
        <div className="mx-auto w-32 h-32 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 shadow-[0_0_40px_-10px_rgba(239,68,68,0.3)] mb-8 animate-pulse">
          <ShieldAlert className="w-16 h-16 text-red-500" />
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 tracking-tight drop-shadow-sm">
          توقف هنا!
        </h1>

        <div className="space-y-6 text-xl md:text-2xl text-neutral-300 max-w-xl mx-auto leading-relaxed">
          <p className="font-bold text-white bg-white/5 inline-block px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-sm">
            هذه الصفحة غير مخصص الدخول ليها
          </p>
          <p className="opacity-80">مش هتلاقي حاجة هنا خالص يا معلم!</p>
        </div>

        <div className="pt-12 mt-12 border-t border-white/10">
          <p className="text-lg font-bold tracking-widest text-neutral-500 flex items-center justify-center gap-2">
            تحياتي، <span className="text-white">تيم أفق</span>
          </p>
        </div>
      </div>
    </div>
  );
}
