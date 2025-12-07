'use client'

import { useState, useCallback } from 'react'
import { analyticsApi } from '@/lib/api-client'

interface AnalyticsData {
  profit_margin: number
  burn_rate: number
  runway_months: number
  growth_potential: string
  roi?: number
  modal_awal?: number
  pendapatan_bulanan?: number
  pengeluaran_bulanan?: number
  profit_bulanan?: number
}

interface AnalyticsResponse {
  analytics: AnalyticsData
  insights: string
  business: {
    nama: string
    jenis: string
  }
}

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fetchAnalytics = useCallback(async (businessId: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await analyticsApi.get(businessId)
      setData(response.data)
      return response.data
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Gagal mengambil analytics')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  const reset = useCallback(() => {
    setData(null)
    setError(null)
  }, [])
  
  return { data, isLoading, error, fetchAnalytics, reset }
}