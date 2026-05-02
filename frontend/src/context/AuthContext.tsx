import { createContext, useMemo, useState, type ReactNode } from 'react'
import { clearAuthSession, getStoredToken, getStoredUser, storeAuthSession } from '../lib/auth'
import type { User } from '../types'

interface AuthContextValue {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => getStoredToken())
  const [user, setUser] = useState<User | null>(() => getStoredUser())

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      login(nextToken, nextUser) {
        storeAuthSession(nextToken, nextUser)
        setToken(nextToken)
        setUser(nextUser)
      },
      logout() {
        clearAuthSession()
        setToken(null)
        setUser(null)
      },
    }),
    [token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
