'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { businessApi } from '@/lib/api-client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToastContext } from '@/providers/ToastProvider'
import { Loading } from '@/components/ui/Loading'
import { Business } from '@/types'

export default function BusinessDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { success, error: toastError } = useToastContext()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [data, setData] = useState<Business | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await businessApi.get(id)
        setData(res.data)
      } catch (err) {
        toastError('Gagal memuat bisnis')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [id, toastError])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setData((prev) => (prev ? { ...prev, [name]: value } as Business : prev))
  }

  const handleSave = async () => {
    if (!data) return
    setIsSaving(true)
    try {
      await businessApi.update(data.id, {
        namaUsaha: data.nama_usaha,
        jenisUsaha: data.jenis_usaha,
        deskripsi: data.deskripsi || undefined,
        modalAwal: data.modal_awal ? Number(data.modal_awal) : undefined,
        pendapatanBulanan: data.pendapatan_bulanan ? Number(data.pendapatan_bulanan) : undefined,
        pengeluaranBulanan: data.pengeluaran_bulanan ? Number(data.pengeluaran_bulanan) : undefined,
        jumlahKaryawan: data.jumlah_karyawan ? Number(data.jumlah_karyawan) : undefined,
        lokasi: data.lokasi || undefined,
        tantangan: data.tantangan || undefined,
      })
      success('Perubahan disimpan')
    } catch (err) {
      toastError('Gagal menyimpan perubahan')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!data) return
    if (!confirm('Yakin hapus bisnis ini?')) return
    try {
      await businessApi.delete(data.id)
      success('Bisnis dihapus')
      router.push('/dashboard/business')
    } catch (err) {
      toastError('Gagal menghapus bisnis')
    }
  }

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loading text="Memuat data..." />
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detail Bisnis</h1>
          <p className="text-gray-500">{data.nama_usaha}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => router.back()}>
            Kembali
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Hapus
          </Button>
          <Button onClick={handleSave} isLoading={isSaving}>
            Simpan
          </Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
        <Input label="Nama Usaha" name="nama_usaha" value={data.nama_usaha} onChange={handleChange} />
        <Input label="Jenis Usaha" name="jenis_usaha" value={data.jenis_usaha} onChange={handleChange} />
        <div>
          <label className="form-label">Deskripsi</label>
          <textarea
            name="deskripsi"
            value={data.deskripsi || ''}
            onChange={handleChange}
            rows={3}
            className="form-input"
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Modal Awal (Rp)" name="modal_awal" value={data.modal_awal || ''} onChange={handleChange} type="number" />
          <Input label="Pendapatan Bulanan (Rp)" name="pendapatan_bulanan" value={data.pendapatan_bulanan || ''} onChange={handleChange} type="number" />
          <Input label="Pengeluaran Bulanan (Rp)" name="pengeluaran_bulanan" value={data.pengeluaran_bulanan || ''} onChange={handleChange} type="number" />
          <Input label="Jumlah Karyawan" name="jumlah_karyawan" value={data.jumlah_karyawan || ''} onChange={handleChange} type="number" />
        </div>
        <Input label="Lokasi" name="lokasi" value={data.lokasi || ''} onChange={handleChange} />
      </div>
    </div>
  )
}