import { createContext, useMemo, useState, type ReactNode } from 'react'
import { getApiErrorMessage } from '../lib/api'
import { loginRequest, logoutRequest, registerRequest, type RegisterPayload } from '../lib/apiData'
import type { AuthUser } from '../types/models'

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

    try {
      const auth = await loginRequest(email, password)

      localStorage.setItem(AUTH_TOKEN_KEY, auth.token)
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(auth.user))
      setUser(auth.user)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to sign in'))
    }
  }

  async function register(payload: RegisterPayload) {
    if (!payload.name || !payload.email || !payload.studentId || !payload.password) {
      throw new Error('Name, email, student ID, and password are required.')
    }

    try {
      const auth = await registerRequest(payload)

      localStorage.setItem(AUTH_TOKEN_KEY, auth.token)
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(auth.user))
      setUser(auth.user)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to register'))
    }
  }

  function logout() {
    void logoutRequest().catch(() => {})
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
