'use client'

import { useState } from 'react'
import { useBusinessList } from '@/hooks/useBusiness'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'

export default function AnalyticsPage() {
  const { businesses, isLoading: loadingBiz } = useBusinessList()
  const { data, isLoading, error, fetchAnalytics, reset } = useAnalytics()
  const [selected, setSelected] = useState('')

  const handleFetch = async () => {
    if (!selected) return
    await fetchAnalytics(selected)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500">Pilih bisnis untuk melihat insight.</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Pilih bisnis</option>
            {loadingBiz ? (
              <option>Memuat...</option>
            ) : (
              businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nama_usaha}
                </option>
              ))
            )}
          </select>
          <Button onClick={handleFetch} isLoading={isLoading} disabled={!selected}>
            Lihat
          </Button>
          {data && (
            <Button variant="ghost" onClick={reset}>
              Reset
            </Button>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loading text="Menghitung analytics..." />
        </div>
      )}

      {error && <div className="text-red-600">{error}</div>}

      {data && !isLoading && (
        <div className="space-y-4">
          <div className="stat-card grid grid-cols-2 md:grid-cols-3 gap-4">
            <Stat label="Pendapatan" value={formatIDR(data.analytics.pendapatan_bulanan ?? 0)} />
            <Stat label="Pengeluaran" value={formatIDR(data.analytics.pengeluaran_bulanan ?? 0)} />
            <Stat label="Profit" value={formatIDR(data.analytics.profit_bulanan ?? 0)} emphasis />
            <Stat label="Margin" value={`${data.analytics.profit_margin ?? 0}%`} />
            <Stat label="Burn Rate" value={formatIDR(data.analytics.burn_rate ?? 0)} />
            <Stat label="Runway" value={`${data.analytics.runway_months ?? 0} bln`} />
            <Stat label="ROI Tahunan" value={`${data.analytics.roi ?? 0}%`} />
            <Stat label="Growth Potential" value={data.analytics.growth_potential} badge />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
            <div className="text-gray-700 whitespace-pre-line text-sm">{data.insights}</div>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, emphasis = false, badge = false }: { label: string; value: string; emphasis?: boolean; badge?: boolean }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      {badge ? (
        <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 mt-1">{value}</span>
      ) : (
        <p className={`text-lg font-bold ${emphasis ? 'text-gray-900' : 'text-gray-800'}`}>{value}</p>
      )}
    </div>
  )
}

function formatIDR(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)
}