import { PROFILE_STORAGE_KEY } from '@/lib/constants'
import { http } from '@/services/api/client'
import { endpoints } from '@/services/api/endpoints'
import type { HealthResponse } from '@/types/api'
import type { Profile } from '../types'

export const DEFAULT_PROFILE: Profile = { name: 'Analyst', role: 'Credit analyst', organisation: '' }

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY)
    if (raw) return { ...DEFAULT_PROFILE, ...(JSON.parse(raw) as Partial<Profile>) }
  } catch {
    /* ignore */
  }
  return DEFAULT_PROFILE
}

export function saveProfile(p: Profile) {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(p))
  } catch {
    /* ignore */
  }
}

/** Always hits the real API, regardless of data mode, so the connection can be checked. */
export const checkHealth = () => http.get<HealthResponse>(endpoints.health)
