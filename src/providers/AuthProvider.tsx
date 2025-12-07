'use client'

import {
    createContext,
    useContext,
    useState,
    ReactNode,
    useCallback,
    useEffect,
} from 'react'
import { useRouter } from 'next/navigation'
import { boolean, email } from 'zod'

interface User {
    id: string
    email: string
    nama: string
}

interface AuthContextType {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    login: (email: string, password: string) => Promise<void>
    register: (email: string, password: string, nama: string, confirmPassword: string) => Promise<void>
    logout: () => Promise<void>
    refreshToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType |  undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const router = useRouter()

    useEffect(() => {
        checkAuth()
    }, [])

    useEffect(() => {
        if(!user) return

        const interval = setInterval(() => {
            refreshToken()
        }, 14 * 60 * 1000)
        return () => clearInterval(interval)
     }, [user])

     const checkAuth = async () => {
        try {
            const response = await fetch('/api/auth/me', {
                credentials: 'include'
            })
            if(response.ok) {
                const data = await response.json()
                setUser(data.data.user)
            } else {
                const refreshed = await refreshToken()
                if(!refreshed){
                    setUser(null)
                }
            }
        } catch {
            setUser(null)
        } finally {
            setIsLoading(false)
        }
     }

     const refreshToken = useCallback(async(): Promise<boolean> => {
        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                credentials: 'include',
            })

            if(response.ok) {
                await checkAuth()
                return true
            }
            return false
        } catch {
            return false
        }
     }, [])

    const login = async(email: string, password: string) => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({email, password})
        })

        const data = await response.json()

        if(!response.ok) {
            throw new Error(data.error || 'Login gagal');
        }
        setUser(data.data.user)
        router.push('/dashboard')
    }

    const register = async (
    email: string,
    password: string,
    nama: string,
    confirmPassword: string
    ) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, nama, confirmPassword }),
    })
    
    const data = await response. json()
    
    if (!response. ok) {
      throw new Error(data.error || 'Registrasi gagal')
    }
    
    setUser(data.data.user)
    router.push('/dashboard')
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      setUser(null)
      router.push('/login')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}