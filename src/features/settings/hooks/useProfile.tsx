import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { loadProfile, saveProfile } from '../services/settingsService'
import type { Profile } from '../types'

interface ProfileCtx {
  profile: Profile
  update: (p: Profile) => void
}
const Ctx = createContext<ProfileCtx | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(loadProfile)
  const update = useCallback((p: Profile) => {
    saveProfile(p)
    setProfile(p)
  }, [])

  const value = useMemo<ProfileCtx>(
    () => ({
      profile,
      update,
    }),
    [profile, update],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useProfile(): ProfileCtx {
  const c = useContext(Ctx)
  if (!c) throw new Error('useProfile must be used inside ProfileProvider')
  return c
}
