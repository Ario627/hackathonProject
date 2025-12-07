'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'
import { ProtectedRoute } from '@/components/ProtectedRoute'

const nav = [
  { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
  { name: 'Konsultasi AI', href: '/dashboard/chat', icon: '💬' },
  { name: 'Bisnis Saya', href: '/dashboard/business', icon: '🏢' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: '📊' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const initials = user?.nama?.charAt(0)?.toUpperCase() ?? 'U'

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        {/* SIDEBAR */}
        <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
          {/* Logo */}
          <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <span className="text-xl font-bold text-white">U</span>
            </div>
            <span className="text-xl font-bold text-gray-900">UMKM</span>
          </div>

          {/* Menu */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {nav.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User di bawah */}
          <div className="border-t border-gray-100 p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <span className="font-semibold text-blue-600">{initials}</span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">{user?.nama}</p>
                <p className="truncate text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <span>🚪</span>
              <span>Keluar</span>
            </button>
          </div>
        </aside>

        {/* MAIN AREA */}
        <div className="flex flex-1 flex-col">
          {/* Header atas */}
          <header className="border-b border-gray-200 bg-white px-4 py-3 lg:px-8">
            <div className="flex items-center justify-between">
              {/* Tombol menu bisa diisi nanti kalau mau mobile, sekarang biarin kosong */}
              <div />
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Selamat datang,</span>
                <span className="font-semibold text-gray-800">{user?.nama}</span>
              </div>
            </div>
          </header>

          {/* Konten: langsung di bawah header */}
          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
