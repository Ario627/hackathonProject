'use client'

import Link from 'next/link'
import { useBusinessList } from '@/hooks/useBusiness'
import { Loading } from '@/components/ui/Loading'
import { Button } from '@/components/ui/Button'

export default function BusinessListPage() {
  const { businesses, isLoading, error } = useBusinessList()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loading text="Memuat bisnis..." />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-600">Gagal memuat: {error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bisnis Saya</h1>
          <p className="text-gray-500">Kelola semua bisnis yang telah ditambahkan.</p>
        </div>
        <Link href="/dashboard/business/new">
          <Button>Tambah Bisnis</Button>
        </Link>
      </div>

      {businesses.length === 0 ? (
        <div className="text-center text-gray-500 py-12 bg-white border border-dashed rounded-xl">
          Belum ada bisnis. <Link className="text-blue-600" href="/dashboard/business/new">Tambah sekarang</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {businesses.map((b) => (
            <Link
              key={b.id}
              href={`/dashboard/business/${b.id}`}
              className="p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-200 hover:shadow-sm transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{b.nama_usaha}</p>
                  <p className="text-sm text-gray-500">{b.jenis_usaha}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">Aktif</span>
              </div>
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">{b.deskripsi || 'Tidak ada deskripsi'}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}