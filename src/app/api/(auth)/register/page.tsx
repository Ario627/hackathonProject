'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToastContext } from '@/providers/ToastProvider'

export default function RegisterPage() {
  const [form, setForm] = useState({ nama: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { register } = useAuth()
  const { success, error: toastError } = useToastContext()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const err: Record<string, string> = {}
    if (!form.nama.trim()) err.nama = 'Nama wajib diisi'
    if (!form.email.trim()) err.email = 'Email wajib diisi'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = 'Email tidak valid'
    if (!form.password) err.password = 'Password wajib diisi'
    else if (form.password.length < 8) err.password = 'Minimal 8 karakter'
    else if (!/[A-Z]/.test(form.password)) err.password = 'Harus ada huruf besar'
    else if (!/[a-z]/.test(form.password)) err.password = 'Harus ada huruf kecil'
    else if (!/[0-9]/.test(form.password)) err.password = 'Harus ada angka'
    else if (!/[^A-Za-z0-9]/.test(form.password)) err.password = 'Harus ada simbol'
    if (form.password !== form.confirmPassword) err.confirmPassword = 'Password tidak cocok'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    setIsLoading(true)
    try {
      await register(form.email, form.password, form.nama, form.confirmPassword)
      success('Registrasi berhasil')
      router.push('/dashboard')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registrasi gagal'
      setError(msg)
      toastError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 bg-linear-to-br from-[#0f1115] via-[#111827] to-[#0b0d11] items-center justify-center p-8">
        <div className="max-w-md text-center text-white">
          <div className="text-6xl mb-6">🚀</div>
          <h2 className="text-2xl font-bold mb-4">Mulai Perjalanan Bisnis Anda</h2>
          <p className="text-blue-100">Gratis selamanya, tanpa kartu kredit.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">U</span>
            </div>
            <span className="text-xl font-bold text-gray-900">UMKM AI</span>
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Buat Akun Baru 🎉</h1>
          <p className="text-gray-600 mb-6">Dapatkan konsultasi & analytics bisnis.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Nama Lengkap"
              name="nama"
              value={form.nama}
              onChange={handleChange}
              error={errors.nama}
              required
              autoComplete="name"
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              helperText="Min 8 karakter, huruf besar, kecil, angka, simbol"
              required
              autoComplete="new-password"
            />
            <Input
              label="Konfirmasi Password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
            />
            <div className="flex items-start gap-2">
              <input type="checkbox" required className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-gray-600">
                Saya setuju dengan <span className="text-blue-600">S&K</span> dan <span className="text-blue-600">Privasi</span>.
              </span>
            </div>
            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Daftar Sekarang
            </Button>
          </form>

          <p className="text-center text-gray-600 mt-8">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}