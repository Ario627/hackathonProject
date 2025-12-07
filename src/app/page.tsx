import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-[#0f1115] via-[#111827] to-[#0b0d11] text-slate-100">
      <nav className="container-app py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-600/30">
            <span className="text-white text-xl font-bold">U</span>
          </div>
          <div>
            <span className="text-xl font-bold text-white">UMKM</span>
            <p className="text-xs text-amber-200/80">Konsultan Bisnis Cerdas</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-slate-200 hover:text-white transition-colors">Masuk</Link>
          <Link href="/register" className="btn-primary px-4 py-2 shadow-lg shadow-amber-500/25">Daftar Gratis</Link>
        </div>
      </nav>

      <section className="container-app py-16 text-center">
        <div className="max-w-3xl mx-auto space-y-7">
          <span className="px-4 py-1.5 bg-amber-500/15 text-amber-200 rounded-full text-sm font-medium border border-amber-500/30">
            🚀 Gratis untuk UMKM Indonesia
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Konsultan Bisnis AI untuk <span className="text-gradient">UMKM</span>
          </h1>
          <p className="text-lg text-slate-300">
            Tanya apa saja tentang bisnismu, pantau angka penting, dapatkan saran instan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="btn-primary px-6 py-3 text-lg shadow-lg shadow-amber-500/25">Mulai Sekarang</Link>
            <Link href="/login" className="btn-secondary px-6 py-3 text-lg border border-amber-500/30">Sudah Punya Akun</Link>
          </div>
        </div>
      </section>
    </div>
  )
}