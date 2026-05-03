import { createContext, useMemo, useState, type ReactNode } from 'react'
import type { AuthUser } from '../types/models'

type RegisterPayload = {
  name: string
  email: string
  password: string
}

type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
}

const AUTH_USER_KEY = 'slf_auth_user'
const AUTH_TOKEN_KEY = 'auth_token'

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function readStoredUser() {
  try {
    if (typeof localStorage === 'undefined' || typeof localStorage.getItem !== 'function') {
      return null
    }

    const storedUser = localStorage.getItem(AUTH_USER_KEY)

    if (!storedUser) return null

    return JSON.parse(storedUser) as AuthUser
  } catch (err) {
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.removeItem === 'function') {
        localStorage.removeItem(AUTH_USER_KEY)
      }
    } catch {}
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser())

  async function login(email: string, password: string) {
    if (!email || !password) {
      throw new Error('Email and password are required.')
    }

    const nextUser: AuthUser = {
      id: 1,
      name: email.split('@')[0] ?? 'Student',
      email,
    }

    localStorage.setItem(AUTH_TOKEN_KEY, 'mock-token')
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
  }

  async function register(payload: RegisterPayload) {
    if (!payload.name || !payload.email || !payload.password) {
      throw new Error('Name, email, and password are required.')
    }

    const nextUser: AuthUser = {
      id: 2,
      name: payload.name,
      email: payload.email,
    }

    localStorage.setItem(AUTH_TOKEN_KEY, 'mock-token')
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
  }

  function logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
