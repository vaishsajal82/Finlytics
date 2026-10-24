export interface UserAccount {
  id: string
  email: string
  name: string
  passwordHash: string
  role?: string
  organisation?: string
  createdAt: string
  lastLoginAt?: string
}

export interface AuthSession {
  user: UserAccount
  token: string
  expiresAt: number
}
