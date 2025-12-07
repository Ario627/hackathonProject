'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { businessApi } from '@/lib/api-client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToastContext } from '@/providers/ToastProvider'
import CurrencyInput from '@/components/ui/CurrencyInput'


export default function BusinessNewPage() {
  const router = useRouter()
  const { success, error: toastError } = useToastContext()
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({
    namaUsaha: '',
    jenisUsaha: '',
    deskripsi: '',
    modalAwal: '',
    pendapatanBulanan: '',
    pengeluaranBulanan: '',
    jumlahKaryawan: '',
    lokasi: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.namaUsaha || !form.jenisUsaha) {
      toastError('Nama usaha dan jenis usaha wajib diisi')
      return
    }
    setIsLoading(true)
    try {
      await businessApi.create({
        namaUsaha: form.namaUsaha,
        jenisUsaha: form.jenisUsaha,
        deskripsi: form.deskripsi || undefined,
        modalAwal: form.modalAwal ? Number(form.modalAwal) : undefined,
        pendapatanBulanan: form.pendapatanBulanan ? Number(form.pendapatanBulanan) : undefined,
        pengeluaranBulanan: form.pengeluaranBulanan ? Number(form.pengeluaranBulanan) : undefined,
        jumlahKaryawan: form.jumlahKaryawan ? Number(form.jumlahKaryawan) : undefined,
        lokasi: form.lokasi || undefined,
      })
      success('Bisnis berhasil ditambahkan')
      router.push('/dashboard/business')
    } catch (err) {
      const msg = (err as any)?.message || 'Gagal menambahkan bisnis'
      toastError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tambah Bisnis</h1>
        <p className="text-gray-500">Isi data singkat untuk mendapat saran yang relevan.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl border border-gray-200">
        <Input label="Nama Usaha" name="namaUsaha" value={form.namaUsaha} onChange={handleChange} required />
        <Input label="Jenis Usaha" name="jenisUsaha" value={form.jenisUsaha} onChange={handleChange} required />
        <div>
          <label className="form-label">Deskripsi (opsional)</label>
          <textarea
            name="deskripsi"
            value={form.deskripsi}
            onChange={handleChange}
            rows={3}
            className="form-input"
            placeholder="Ceritakan singkat tentang bisnismu"
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <CurrencyInput label="Modal Awal (Rp)" 
          name="modalAwal" 
          value={form.modalAwal ? Number(form.modalAwal) : 0} 
          onChange={(value) => setForm((prev) => ({ ...prev, modalAwal: value.toString() }))} />
          <CurrencyInput label="Pendapatan Bulanan (Rp)" 
          name="pendapatanBulanan" 
          value={form.pendapatanBulanan ? Number(form.pendapatanBulanan) : 0} 
          onChange={(value) => setForm((prev) => ({ ...prev, pendapatanBulanan: value.toString() }))} />
          <CurrencyInput label="Pengeluaran Bulanan (Rp)" 
          name="pengeluaranBulanan" 
          value={form.pengeluaranBulanan ? Number(form.pengeluaranBulanan) : 0} 
          onChange={(value) => setForm((prev) => ({ ...prev, pengeluaranBulanan: value.toString() }))} />
          <Input label="Jumlah Karyawan" name="jumlahKaryawan" value={form.jumlahKaryawan} onChange={handleChange} type="number" min="0" />
        </div>
        <Input label="Lokasi (opsional)" name="lokasi" value={form.lokasi} onChange={handleChange} />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Batal
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Simpan
          </Button>
        </div>
      </form>
    </div>
  )
}