export const SYSTEM_PROMPT = `Kamu adalah Konsultan Bisnis AI yang ramah dan mudah dipahami, khusus untuk membantu pelaku UMKM di Indonesia. 

KARAKTERISTIK:
- Gunakan bahasa Indonesia yang sederhana dan mudah dipahami
- Hindari istilah teknis yang rumit, kalau harus pakai jelaskan dengan contoh
- Berikan saran yang praktis dan bisa langsung diterapkan
- Selalu supportif dan memotivasi
- Gunakan emoji secukupnya untuk membuat percakapan lebih friendly

KEMAMPUAN:
1. Memberikan saran strategi bisnis (marketing, operasional, keuangan)
2. Membantu menghitung keuangan sederhana (profit, margin, dll)
3.  Memberikan tips marketing untuk UMKM (online & offline)
4.  Membantu problem solving masalah bisnis sehari-hari
5. Memberikan insight dari data bisnis jika tersedia
6. Membantu merencanakan pengembangan bisnis

FORMAT JAWABAN:
- Gunakan bullet points atau numbering untuk poin-poin penting
- Berikan contoh konkret jika memungkinkan
- Akhiri dengan pertanyaan atau ajakan untuk follow-up jika relevan

BATASAN:
- Jangan memberikan saran hukum atau pajak yang spesifik, sarankan konsultasi ke ahli
- Fokus pada UMKM dan bisnis kecil menengah
- Selalu remind untuk verifikasi info penting ke sumber terpercaya
- Jangan memberikan saran investasi finansial yang berisiko tinggi

Jika user memberikan data bisnis mereka, gunakan data tersebut untuk memberikan saran yang lebih personal dan relevan.`

export const ANALYTICS_PROMPT = `Kamu adalah analis bisnis AI yang membantu UMKM Indonesia memahami kondisi bisnisnya. 

Berdasarkan data bisnis berikut, berikan analisis yang mudah dipahami:

DATA BISNIS:
{businessData}

TUGAS:
Berikan analisis dalam format berikut (gunakan bahasa Indonesia yang sederhana):

## 📊 Ringkasan Kesehatan Bisnis
(1-2 kalimat singkat tentang kondisi bisnis secara keseluruhan)

## 💰 Analisis Keuangan
- **Profit Margin**: [nilai]% - [penjelasan singkat artinya]
- **Burn Rate**: Rp [nilai] - [penjelasan]
- **Runway**: [nilai] bulan - [penjelasan]

## ✅ 3 Kelebihan Bisnis Ini
1. [Kelebihan 1]
2. [Kelebihan 2]
3. [Kelebihan 3]

## ⚠️ 3 Area yang Perlu Diperbaiki
1.  [Area 1 + alasan singkat]
2.  [Area 2 + alasan singkat]
3. [Area 3 + alasan singkat]

## 🎯 3 Saran Aksi Minggu Ini
1. [Aksi konkret 1 yang bisa langsung dilakukan]
2.  [Aksi konkret 2 yang bisa langsung dilakukan]
3.  [Aksi konkret 3 yang bisa langsung dilakukan]

## 💡 Tips Tambahan
[1 tips atau insight tambahan yang relevan]

CATATAN PENTING:
- Gunakan bahasa yang mudah dipahami orang awam
- Berikan angka yang jelas dan mudah dimengerti
- Fokus pada saran yang praktis dan bisa langsung diterapkan
- Jika data kurang lengkap, sebutkan dan berikan saran berdasarkan data yang ada`

export const WELCOME_MESSAGE = `Halo!  👋 Saya adalah Konsultan Bisnis AI yang siap membantu Anda. 

Saya bisa membantu Anda dengan:
• 💼 Strategi pengembangan bisnis
• 📈 Analisis keuangan sederhana
• 🎯 Tips marketing online & offline
• 🔧 Problem solving masalah bisnis
• 📊 Insight dari data bisnis Anda

Silakan ceritakan tentang bisnis Anda atau langsung tanyakan apa yang ingin Anda ketahui! `

//Error template
export const ERROR_MESSAGES = {
  AI_UNAVAILABLE: 'Maaf, saya sedang tidak bisa menjawab saat ini. Silakan coba lagi dalam beberapa saat.  🙏',
  RATE_LIMIT: 'Anda sudah terlalu banyak bertanya dalam waktu singkat. Istirahat sebentar ya, nanti coba lagi.  ⏰',
  INVALID_INPUT: 'Hmm, saya tidak mengerti pertanyaan Anda. Bisa dijelaskan lebih detail? 🤔',
  BUSINESS_NOT_FOUND: 'Data bisnis tidak ditemukan.  Pastikan Anda sudah menambahkan bisnis terlebih dahulu.',
  GENERAL_ERROR: 'Terjadi kesalahan. Silakan coba lagi atau hubungi support jika masalah berlanjut.',
}

export const PROMPT_TEMPLATES = {
  // Template analisis kompetitor
  COMPETITOR_ANALYSIS: `Bantu saya menganalisis kompetitor untuk bisnis {businessType} di {location}. 
  
Berikan insight tentang:
1. Siapa saja kompetitor utama yang mungkin ada
2.  Apa yang biasanya menjadi keunggulan kompetitor
3. Bagaimana cara bersaing dengan mereka
4. Celah pasar yang bisa dimanfaatkan`,

  // Template strategi marketing
  MARKETING_STRATEGY: `Berikan strategi marketing untuk bisnis {businessType} dengan budget {budget}. 

Target: {targetMarket}
Tantangan saat ini: {challenges}

Fokus pada:
1. Strategi online (sosmed, marketplace, dll)
2.  Strategi offline (jika relevan)
3.  Quick wins yang bisa langsung diterapkan
4.  Rencana jangka menengah`,

  // Template analisis harga
  PRICING_ANALYSIS: `Bantu saya menentukan harga yang tepat untuk produk/jasa:

Produk/Jasa: {product}
Biaya produksi/modal: Rp {cost}
Target pasar: {targetMarket}
Harga kompetitor (jika tahu): {competitorPrice}

Berikan rekomendasi:
1. Range harga yang disarankan
2.  Strategi pricing (premium, competitive, dll)
3. Cara menaikkan perceived value`,

  // Template problem solving
  PROBLEM_SOLVING: `Saya punya masalah bisnis:

Masalah: {problem}
Sudah dicoba: {attemptedSolutions}
Kendala: {constraints}

Bantu saya dengan:
1.  Analisis akar masalah
2. 3-5 solusi alternatif
3.  Rekomendasi solusi terbaik
4. Langkah-langkah implementasi`,
}

//Industry prompts
export const INDUSTRY_PROMPTS: Record<string, string> = {
  'Makanan & Minuman': `Untuk bisnis F&B, pertimbangkan juga:
- Konsistensi rasa dan kualitas
- Food safety dan higienitas
- Trend makanan terkini
- Strategi delivery dan packaging`,

  'Fashion': `Untuk bisnis fashion, pertimbangkan juga:
- Trend fashion terkini
- Inventory management (size, warna)
- Visual merchandising dan foto produk
- Return policy yang jelas`,

  'Jasa': `Untuk bisnis jasa, pertimbangkan juga:
- Service level dan SLA
- Customer experience
- Testimonial dan portfolio
- Pricing berbasis value`,

  'Retail': `Untuk bisnis retail, pertimbangkan juga:
- Inventory turnover
- Display dan layout toko
- Loyalty program
- Omnichannel strategy`,

  'Online Shop': `Untuk online shop, pertimbangkan juga:
- Platform yang digunakan (marketplace vs website sendiri)
- Foto produk dan deskripsi
- Shipping dan packaging
- Customer service response time`,
}

//Helper
export function generateBusinessContext(business: {
  nama_usaha: string
  jenis_usaha: string
  deskripsi?: string | null
  modal_awal?: number | null
  pendapatan_bulanan?: number | null
  pengeluaran_bulanan?: number | null
  jumlah_karyawan?: number | null
  lokasi?: string | null
  tantangan?: string[] | null
}): string {
  const formatCurrency = (value: number | null | undefined): string => {
    if (! value) return 'Tidak diketahui'
    return `Rp ${value.toLocaleString('id-ID')}`
  }

  return `
KONTEKS BISNIS USER:
- Nama Usaha: ${business.nama_usaha}
- Jenis Usaha: ${business.jenis_usaha}
- Deskripsi: ${business. deskripsi || 'Tidak ada'}
- Modal Awal: ${formatCurrency(business.modal_awal)}
- Pendapatan Bulanan: ${formatCurrency(business.pendapatan_bulanan)}
- Pengeluaran Bulanan: ${formatCurrency(business.pengeluaran_bulanan)}
- Jumlah Karyawan: ${business.jumlah_karyawan || 'Tidak diketahui'}
- Lokasi: ${business. lokasi || 'Tidak diketahui'}
- Tantangan: ${business.tantangan?. join(', ') || 'Tidak disebutkan'}

Gunakan informasi ini untuk memberikan saran yang lebih personal dan relevan.`
}

/**
 * Generate analytics data string untuk prompt
 */
export function generateAnalyticsDataString(business: {
  nama_usaha: string
  jenis_usaha: string
  deskripsi?: string | null
  modal_awal?: number | null
  pendapatan_bulanan?: number | null
  pengeluaran_bulanan?: number | null
  jumlah_karyawan?: number | null
  lokasi?: string | null
  tantangan?: string[] | null
}): string {
  const pendapatan = business. pendapatan_bulanan || 0
  const pengeluaran = business.pengeluaran_bulanan || 0
  const profit = pendapatan - pengeluaran
  const profitMargin = pendapatan > 0 ? (profit / pendapatan) * 100 : 0
  const modalAwal = business.modal_awal || 0

  return `
Nama Usaha: ${business.nama_usaha}
Jenis Usaha: ${business.jenis_usaha}
Deskripsi: ${business. deskripsi || 'Tidak ada'}
Modal Awal: Rp ${modalAwal.toLocaleString('id-ID')}
Pendapatan Bulanan: Rp ${pendapatan.toLocaleString('id-ID')}
Pengeluaran Bulanan: Rp ${pengeluaran.toLocaleString('id-ID')}
Profit Bulanan: Rp ${profit. toLocaleString('id-ID')}
Profit Margin: ${profitMargin.toFixed(1)}%
Jumlah Karyawan: ${business. jumlah_karyawan || 'Tidak diketahui'}
Lokasi: ${business. lokasi || 'Tidak diketahui'}
Tantangan: ${business. tantangan?.join(', ') || 'Tidak disebutkan'}
`
}

/**
 * Get industry-specific prompt addition
 */
export function getIndustryPrompt(jenisUsaha: string): string {
  // Cari kecocokan dengan industri yang ada
  for (const [industry, prompt] of Object.entries(INDUSTRY_PROMPTS)) {
    if (jenisUsaha.toLowerCase(). includes(industry.toLowerCase())) {
      return `\n\n${prompt}`
    }
  }
  return ''
}