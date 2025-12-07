import { NextRequest } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { getAuthUser } from "@/lib/auth"
import {
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  notFoundResponse,
  internalErrorResponse,
} from "@/lib/api-response"
import { uuidSchema } from "@/lib/validation"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorizedResponse()

    const businessId = request.nextUrl.searchParams.get("businessId") || ""
    const idValidation = uuidSchema.safeParse(businessId)
    if (!idValidation.success) return validationErrorResponse(idValidation.error)

    // Pastikan bisnis milik user
    const { data: business, error } = await (supabaseAdmin
      .from("businesses") as any)
      .select(
        "id, user_id, nama_usaha, jenis_usaha, modal_awal, pendapatan_bulanan, pengeluaran_bulanan, jumlah_karyawan"
      )
      .eq("id", businessId)
      .eq("user_id", user.userId)
      .single()

    if (error || !business) {
      return notFoundResponse("Bisnis tidak ditemukan atau bukan milik Anda")
    }

    const pendapatan = Number(business.pendapatan_bulanan) || 0
    const pengeluaran = Number(business.pengeluaran_bulanan) || 0
    const modalAwal = Number(business.modal_awal) || 0

    const profitBulanan = pendapatan - pengeluaran
    const profitMargin = pendapatan > 0 ? (profitBulanan / pendapatan) * 100 : 0
    const burnRate = Math.max(pengeluaran - pendapatan, 0)
    const runwayMonths = burnRate > 0 ? Math.max(modalAwal / burnRate, 0) : null
    const opexRatio = pendapatan > 0 ? (pengeluaran / pendapatan) * 100 : 0
    const revenuePerEmployee = business.jumlah_karyawan && business.jumlah_karyawan > 0
      ? pendapatan / business.jumlah_karyawan
      : null

    const growthPotential = (() => {
      if (profitMargin > 25 && profitBulanan > 0) return "tinggi"
      if (profitMargin > 10) return "menengah"
      return "rendah"
    })()

    const riskFlags: string[] = []
    if (burnRate > 0 && (runwayMonths ?? 0) < 6) riskFlags.push("Runway < 6 bulan")
    if (profitMargin < 5 && pendapatan > 0) riskFlags.push("Margin tipis (<5%)")
    if (opexRatio > 80) riskFlags.push("OPEX > 80% revenue")

    const insights = [
      `Profit bulanan: ${profitBulanan >= 0 ? "positif" : "negatif"}.` ,
      `Profit margin: ${profitMargin.toFixed(1)}%.`,
      burnRate > 0
        ? `Burn rate: ${burnRate.toLocaleString("id-ID")}/bln, runway ${runwayMonths ? runwayMonths.toFixed(1) : "-"} bulan.`
        : "Burn rate aman (pengeluaran <= pendapatan).",
      `OPEX ratio: ${opexRatio.toFixed(1)}%.`,
      revenuePerEmployee ? `Revenue/karyawan: Rp ${Math.round(revenuePerEmployee).toLocaleString("id-ID")}` : "Belum ada data karyawan",
    ]

    const recommendations = [
      profitBulanan < 0 ? "Tinjau ulang struktur biaya untuk menekan burn rate." : "Pertahankan profit, eksplor channel akuisisi baru yang terukur.",
      opexRatio > 80 ? "Turunkan OPEX (sewa, overhead, marketing) di bawah 70% dari revenue." : "Jaga efisiensi operasional agar OPEX tetap ramping.",
      revenuePerEmployee && revenuePerEmployee < 10000000
        ? "Naikkan produktivitas per karyawan (otomasi, pelatihan, tools)."
        : "Skalakan tim secara hati-hati dengan KPI produktivitas per karyawan.",
      (runwayMonths ?? 12) < 6 ? "Segera amankan pendanaan atau kurangi burn untuk memperpanjang runway." : "Runway aman, fokus ke pertumbuhan berkualitas.",
    ]

    return successResponse({
      analytics: {
        profit_margin: Number(profitMargin.toFixed(2)),
        burn_rate: burnRate,
        runway_months: runwayMonths ?? 0,
        growth_potential: growthPotential,
        profit_bulanan: profitBulanan,
        pendapatan_bulanan: pendapatan,
        pengeluaran_bulanan: pengeluaran,
        modal_awal: modalAwal,
        opex_ratio: Number(opexRatio.toFixed(2)),
        revenue_per_employee: revenuePerEmployee ?? 0,
      },
      insights,
      risk_flags: riskFlags,
      recommendations,
      business: {
        nama: business.nama_usaha,
        jenis: business.jenis_usaha,
      },
    })
  } catch (error) {
    console.error("Analytics Error:", error)
    return internalErrorResponse()
  }
}
