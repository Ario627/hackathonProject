'use client'

import { useState, useCallback } from 'react'

interface UseApiState<T> {
  data: T | null
  error: string | null
  isLoading: boolean
  fieldErrors: { field: string; message: string }[] | null
}

interface UseApiReturn<T, P extends unknown[]> extends UseApiState<T> {
  execute: (...args: P) => Promise<T | null>
  reset: () => void
}

export function useApi<T, P extends unknown[] = []>(
  apiFunction: (...args: P) => Promise<{ success: boolean; data: T; message?: string }>
): UseApiReturn<T, P> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
    fieldErrors: null,
  })
  
  const execute = useCallback(
    async (...args: P): Promise<T | null> => {
      setState((prev) => ({ ... prev, isLoading: true, error: null, fieldErrors: null }))
      
      try {
        const response = await apiFunction(... args)
        setState({ data: response.data, error: null, isLoading: false, fieldErrors: null })
        return response. data
      } catch (err: unknown) {
        const error = err as { message?: string; errors?: { field: string; message: string }[] }
        setState({
          data: null,
          error: error.message || 'Terjadi kesalahan',
          isLoading: false,
          fieldErrors: error.errors || null,
        })
        return null
      }
    },
    [apiFunction]
  )
  
  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false, fieldErrors: null })
  }, [])
  
  return { ... state, execute, reset }
}