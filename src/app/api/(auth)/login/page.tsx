'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToastContext } from '@/providers/ToastProvider'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const { error: toastError, success } = useToastContext()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const expired = searchParams.get('expired')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await login(email, password)
      success('Login berhasil')
      router.push(redirect)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login gagal'
      setError(msg)
      toastError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">U</span>
            </div>
            <span className="text-xl font-bold text-gray-900">UMKM AI</span>
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Selamat Datang! 👋</h1>
          <p className="text-gray-600 mb-6">Masuk untuk mulai konsultasi & analytics.</p>

          {expired && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4">
              Sesi berakhir, silakan login ulang.
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-600">Ingat saya</span>
              </label>
              <span className="text-sm text-gray-400">Lupa password? (segera)</span>
            </div>
            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Masuk
            </Button>
          </form>

          <p className="text-center text-gray-600 mt-8">
            Belum punya akun?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Daftar gratis
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-linear-to-br from-[#0f1115] via-[#111827] to-[#0b0d11] items-center justify-center p-8">
        <div className="max-w-md text-center text-white">
          <div className="text-6xl mb-6">💼</div>
          <h2 className="text-2xl font-bold mb-4">Kelola Bisnis Lebih Mudah</h2>
          <p className="text-blue-100">Insight dan saran real-time untuk UMKM Anda.</p>
        </div>
      </div>
    </div>
  )
}