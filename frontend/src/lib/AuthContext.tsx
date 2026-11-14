import React, { createContext, useContext, useState, useEffect } from 'react'
import type { User, Role } from '@/types'
import { authApi } from '@/api/auth'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  loginWithPassword: (identifier: string, pass: string) => Promise<User>
  loginWithOtp: (phone: string, code: string) => Promise<User>
  registerCustomer: (data: { name: string; phone?: string; email?: string; password: string }) => Promise<User>
  logout: () => Promise<void>
  hasRole: (...roles: Role[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('vinnyx_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('vinnyx_token'))
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true

    const verifySession = async () => {
      const storedToken = localStorage.getItem('vinnyx_token')
      if (storedToken) {
        try {
          const verifiedUser = await authApi.getMe()
          if (isMounted) {
            setUser(verifiedUser)
            localStorage.setItem('vinnyx_user', JSON.stringify(verifiedUser))
          }
        } catch {
          // Token is invalid/revoked or verification failed
          if (isMounted) {
            localStorage.removeItem('vinnyx_token')
            localStorage.removeItem('vinnyx_user')
            setUser(null)
            setToken(null)
          }
        }
      } else {
        if (isMounted) {
          setUser(null)
        }
      }
      if (isMounted) {
        setIsLoading(false)
      }
    }

    verifySession()

    const handleUnauthorized = () => {
      setUser(null)
      setToken(null)
    }

    window.addEventListener('vinnyx:unauthorized', handleUnauthorized)
    return () => {
      isMounted = false
      window.removeEventListener('vinnyx:unauthorized', handleUnauthorized)
    }
  }, [])

  const loginWithPassword = async (identifier: string, pass: string) => {
    const res = await authApi.loginPassword(identifier, pass)
    setUser(res.user)
    setToken(res.token)
    localStorage.setItem('vinnyx_token', res.token)
    localStorage.setItem('vinnyx_user', JSON.stringify(res.user))
    return res.user
  }

  const loginWithOtp = async (phone: string, code: string) => {
    const res = await authApi.verifyOtp(phone, code)
    setUser(res.user)
    setToken(res.token)
    localStorage.setItem('vinnyx_token', res.token)
    localStorage.setItem('vinnyx_user', JSON.stringify(res.user))
    return res.user
  }

  const registerCustomer = async (data: { name: string; phone?: string; email?: string; password: string }) => {
    const res = await authApi.register(data)
    setUser(res.user)
    setToken(res.token)
    localStorage.setItem('vinnyx_token', res.token)
    localStorage.setItem('vinnyx_user', JSON.stringify(res.user))
    return res.user
  }

  const logout = async () => {
    await authApi.logout()
    setUser(null)
    setToken(null)
  }

  const hasRole = (...roles: Role[]) => {
    if (!user) return false
    return roles.includes(user.role)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        loginWithPassword,
        loginWithOtp,
        registerCustomer,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
