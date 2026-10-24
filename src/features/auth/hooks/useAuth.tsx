import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { authService, AuthError } from '../services/authService'
import type { AuthSession, UserAccount } from '../types'
import { useProfile } from '@/features/settings/hooks/useProfile'

interface AuthContextValue {
  user: UserAccount | null
  session: AuthSession | null
  isAuthenticated: boolean
  login: (id: string, pass: string) => UserAccount
  register: (input: {
    id: string
    email?: string
    name: string
    password: string
    role?: string
    organisation?: string
  }) => UserAccount
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => authService.getSession())
  const { profile, update } = useProfile()

  useEffect(() => {
    if (session?.user) {
      const targetName = session.user.name
      const targetRole = session.user.role ?? 'Credit Underwriter'
      const targetOrg = session.user.organisation ?? ''
      if (
        profile.name !== targetName ||
        profile.role !== targetRole ||
        profile.organisation !== targetOrg
      ) {
        update({
          name: targetName,
          role: targetRole,
          organisation: targetOrg,
        })
      }
    }
  }, [session?.user, profile, update])

  const login = (id: string, pass: string): UserAccount => {
    const newSession = authService.login(id, pass)
    setSession(newSession)
    update({
      name: newSession.user.name,
      role: newSession.user.role ?? 'Credit Underwriter',
      organisation: newSession.user.organisation ?? '',
    })
    return newSession.user
  }

  const registerUser = (input: {
    id: string
    email?: string
    name: string
    password: string
    role?: string
    organisation?: string
  }): UserAccount => {
    const newUser = authService.register(input)
    const newSession = authService.getSession()
    setSession(newSession)
    update({
      name: newUser.name,
      role: newUser.role ?? 'Credit Underwriter',
      organisation: newUser.organisation ?? '',
    })
    return newUser
  }

  const logout = () => {
    authService.logout()
    setSession(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session,
        isAuthenticated: session !== null,
        login,
        register: registerUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}

export { AuthError }
