'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { businessApi } from '@/lib/api-client'
import { Card, CardContent } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'
import { Business } from '@/types'

export default function DashboardPage() {
  const { user } = useAuth()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, pendapatan: 0, profit: 0 })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await businessApi.list()
        const list = res.data.businesses || []
        setBusinesses(list)
        const pendapatan = list.reduce((s, b) => s + (Number(b.pendapatan_bulanan) || 0), 0)
        const pengeluaran = list.reduce((s, b) => s + (Number(b.pengeluaran_bulanan) || 0), 0)
        setStats({ total: list.length, pendapatan, profit: pendapatan - pengeluaran })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const formatIDR = (v: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" text="Memuat dashboard..." />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="bg-linear-to-r from-[#0f1115] via-[#111827] to-[#0b0d11] rounded-2xl p-8 text-white border border-amber-500/15 shadow-lg shadow-amber-500/10">
        <h1 className="text-2xl font-bold mb-2">Halo, {user?.nama}! 👋</h1>
        <p className="text-amber-100/80">Ayo lanjutkan pertumbuhan bisnismu hari ini.</p>
        <div className="mt-4 flex gap-3">
          <Link href="/dashboard/chat" className="btn-primary px-4 py-2 rounded-lg shadow-lg shadow-amber-500/20">
            Konsultasi AI
          </Link>
          <Link href="/dashboard/business/new" className="btn-secondary px-4 py-2 rounded-lg border border-amber-500/30">
            Tambah Bisnis
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Bisnis" value={stats.total.toString()} icon="🏢" />
        <StatCard label="Total Pendapatan" value={formatIDR(stats.pendapatan)} icon="💰" />
        <StatCard label="Total Profit" value={formatIDR(stats.profit)} icon={stats.profit >= 0 ? '📈' : '📉'} positive={stats.profit >= 0} />
      </div>

      <Card variant="bordered">
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Bisnis Anda</h3>
            <Link href="/dashboard/business" className="text-amber-700 text-sm hover:text-amber-800">
              Lihat Semua
            </Link>
          </div>

          {businesses.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              Belum ada bisnis. <Link href="/dashboard/business/new" className="text-amber-700 font-medium">Tambah sekarang</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {businesses.slice(0, 3).map((b) => (
                <Link
                  key={b.id}
                  href={`/dashboard/business/${b.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-amber-100 hover:border-amber-300 hover:bg-amber-50/60 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{b.nama_usaha}</p>
                    <p className="text-sm text-gray-500">{b.jenis_usaha}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatIDR(Number(b.pendapatan_bulanan) || 0)}</p>
                    <p className="text-xs text-gray-500">/ bulan</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ label, value, icon, positive = true }: { label: string; value: string; icon: string; positive?: boolean }) {
  return (
    <div className="stat-card">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${positive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          <span className="text-xl">{icon}</span>
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}