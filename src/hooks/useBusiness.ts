'use client'

import { useState, useEffect, useCallback } from "react"
import { businessApi } from "@/lib/api-client"

interface Business {
    id: string
    user_id: string
    nama_usaha: string
    jenis_usaha: string
    deskripsi?: string
    modal_awal?: number
    pendapatan_bulanan?: number
    pengeluaran_bulanan?: number
    jumlah_karyawan?: number
    lokasi?: string
    tantangan?: string[]
    created_at: string
    updated_at: string
}

interface Pagination {
    page: number
    limit: number
    total: number
    totalPages: number
}

export function useBusinessList() {
    const [businesses, setBusinesses] = useState<Business[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const fetchBusinesses = useCallback(async (page = 1) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await businessApi.list(page)
      setBusinesses(response.data. businesses)
      setPagination(response. data.pagination)
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Gagal mengambil data bisnis')
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  useEffect(() => {
    fetchBusinesses()
  }, [fetchBusinesses])
  
  const addBusiness = useCallback((business: Business) => {
    setBusinesses((prev) => [business, ...prev])
  }, [])
  
  const updateBusiness = useCallback((id: string, updates: Partial<Business>) => {
    setBusinesses((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    )
  }, [])
  
  const removeBusiness = useCallback((id: string) => {
    setBusinesses((prev) => prev.filter((b) => b. id !== id))
  }, [])
  
  return {
    businesses,
    pagination,
    isLoading,
    error,
    fetchBusinesses,
    addBusiness,
    updateBusiness,
    removeBusiness,
  }
}

export function useBusiness(id: string) {
  const [business, setBusiness] = useState<Business | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchBusiness = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await businessApi.get(id)
        setBusiness(response.data)
      } catch (err: unknown) {
        const error = err as { message?: string }
        setError(error. message || 'Gagal mengambil data bisnis')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (id) {
      fetchBusiness()
    }
  }, [id])
  
  return { business, isLoading, error, setBusiness }
}