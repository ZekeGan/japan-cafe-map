'use client'

import { Favorite, Report, User } from '@prisma/client'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'

type UserData = Omit<User, 'password'> & {
  favorites: Favorite[]
  reports: Report[]
}

interface AuthContextType {
  user: UserData | null
  isLoading: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (err) {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// 建立一個方便使用的 Hook
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
