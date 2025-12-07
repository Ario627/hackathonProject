'use client'

import { useState } from 'react'

export default function CurrencyInput({
  label,
  value,
  onChange,
  placeholder = '',
  name,
}: {
  label: string
  value: number | undefined
  onChange: (v: number) => void
  placeholder?: string
  name: string
}) {
  const [raw, setRaw] = useState(value?.toString() || '')

  const formatNumber = (num: string) => {
    const n = Number(num.replace(/\D/g, ''))
    return n.toLocaleString('id-ID')
  }

  // konversi angka → kalimat
  const terbilang = (angka: number): string => {
    const satuan = [
      '',
      'Satu',
      'Dua',
      'Tiga',
      'Empat',
      'Lima',
      'Enam',
      'Tujuh',
      'Delapan',
      'Sembilan',
      'Sepuluh',
      'Sebelas',
    ]
    if (angka < 12) return satuan[angka]
    if (angka < 20) return terbilang(angka - 10) + ' Belas'
    if (angka < 100) return terbilang(Math.floor(angka / 10)) + ' Puluh ' + terbilang(angka % 10)
    if (angka < 200) return 'Seratus ' + terbilang(angka - 100)
    if (angka < 1000) return terbilang(Math.floor(angka / 100)) + ' Ratus ' + terbilang(angka % 100)
    if (angka < 2000) return 'Seribu ' + terbilang(angka - 1000)
    if (angka < 1000000) return terbilang(Math.floor(angka / 1000)) + ' Ribu ' + terbilang(angka % 1000)
    if (angka < 1000000000)
      return terbilang(Math.floor(angka / 1000000)) + ' Juta ' + terbilang(angka % 1000000)
    return angka.toString()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, '')
    setRaw(clean)

    const numberValue = Number(clean)
    onChange(numberValue)
  }

  const formatted = raw ? formatNumber(raw) : ''

  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>

      <input
        name={name}
        value={formatted}
        onChange={handleChange}
        placeholder={placeholder}
        inputMode="numeric"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
      />

      {raw && (
        <p className="text-xs text-gray-500 mt-1 italic">
          ({terbilang(Number(raw))} Rupiah)
        </p>
      )}
    </div>
  )
}
