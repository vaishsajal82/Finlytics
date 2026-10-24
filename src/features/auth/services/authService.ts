import { uid } from '@/lib/utils'
import type { AuthSession, UserAccount } from '../types'

const USERS_STORAGE_KEY = 'finlytics.users.v1'
const SESSION_STORAGE_KEY = 'finlytics.auth.v1'

export class AuthError extends Error {
  code: 'user_not_found' | 'user_already_exists' | 'invalid_password' | 'invalid_input'
  constructor(code: 'user_not_found' | 'user_already_exists' | 'invalid_password' | 'invalid_input', message: string) {
    super(message)
    this.name = 'AuthError'
    this.code = code
  }
}

export const authService = {
  getUsers(): UserAccount[] {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as UserAccount[]
        if (Array.isArray(parsed)) return parsed
      }
    } catch {
      /* ignore */
    }
    return []
  },

  getUserById(idOrEmail: string): UserAccount | undefined {
    const clean = idOrEmail.trim().toLowerCase()
    return this.getUsers().find(
      (u) => u.id.toLowerCase() === clean || u.email.toLowerCase() === clean,
    )
  },

  register(input: {
    id: string
    email?: string
    name: string
    password: string
    role?: string
    organisation?: string
  }): UserAccount {
    const cleanId = input.id.trim()
    const cleanEmail = (input.email ?? input.id).trim()
    const cleanName = input.name.trim()

    if (!cleanId) throw new AuthError('invalid_input', 'Please enter a valid Account ID or Email.')
    if (!cleanName) throw new AuthError('invalid_input', 'Please enter your full name.')
    if (!input.password || input.password.length < 4) {
      throw new AuthError('invalid_input', 'Password must be at least 4 characters long.')
    }

    const existing = this.getUserById(cleanId)
    if (existing) {
      throw new AuthError('user_already_exists', `An account with ID "${cleanId}" already exists. Please sign in instead.`)
    }

    const newUser: UserAccount = {
      id: cleanId,
      email: cleanEmail,
      name: cleanName,
      passwordHash: input.password,
      role: input.role?.trim() || 'Credit Underwriter',
      organisation: input.organisation?.trim() || 'Finlytics Workspace',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    }

    const all = this.getUsers()
    all.unshift(newUser)
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(all))

    // Set active session immediately on registration
    this.createSession(newUser)

    return newUser
  },

  login(idOrEmail: string, password: string): AuthSession {
    const cleanId = idOrEmail.trim()
    if (!cleanId) throw new AuthError('invalid_input', 'Please enter your Account ID or Email.')

    const user = this.getUserById(cleanId)
    if (!user) {
      throw new AuthError('user_not_found', `No account found with ID "${cleanId}". You can register a new account below.`)
    }

    if (user.passwordHash && user.passwordHash !== password) {
      throw new AuthError('invalid_password', 'Incorrect password. Please verify and try again.')
    }

    // Update last login
    user.lastLoginAt = new Date().toISOString()
    const all = this.getUsers().map((u) => (u.id === user.id ? user : u))
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(all))

    return this.createSession(user)
  },

  createSession(user: UserAccount): AuthSession {
    const session: AuthSession = {
      user,
      token: uid('session'),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    }
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
    return session
  },

  getSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY)
      if (raw) {
        const s = JSON.parse(raw) as AuthSession
        if (s.user && s.expiresAt > Date.now()) {
          return s
        }
      }
    } catch {
      /* ignore */
    }

    return null
  },

  logout(): void {
    localStorage.removeItem(SESSION_STORAGE_KEY)
  },
}
