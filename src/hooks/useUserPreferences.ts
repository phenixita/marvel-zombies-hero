import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from './useAuth'
import { DEFAULT_USER_PREFERENCES, UserPreferences } from '@/lib/UserPreferences'
import { loadUserPreferences, saveUserPreferences } from '@/lib/preferencesService'
import { toast } from 'sonner'

const LOCAL_PREFS_KEY = 'marvel-zombies-user-preferences'

function readLocalPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(LOCAL_PREFS_KEY)
    if (!raw) return { ...DEFAULT_USER_PREFERENCES }
    return { ...DEFAULT_USER_PREFERENCES, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_USER_PREFERENCES }
  }
}

function writeLocalPreferences(prefs: UserPreferences) {
  localStorage.setItem(LOCAL_PREFS_KEY, JSON.stringify(prefs))
}

export function useUserPreferences() {
  const { user } = useAuth()
  const [preferences, setPreferencesState] = useState<UserPreferences>(readLocalPreferences)
  const [loading, setLoading] = useState(false)
  const prevUidRef = useRef<string | null>(null)

  // Load preferences from cloud on login
  useEffect(() => {
    const uid = user?.uid ?? null

    // Only load when transitioning to a new authenticated user
    if (uid && uid !== prevUidRef.current) {
      setLoading(true)
      loadUserPreferences(uid)
        .then((cloudPrefs) => {
          // Background settings are local-only; preserve them across the cloud merge
          setPreferencesState((prev) => {
            const merged = { ...cloudPrefs, backgroundMode: prev.backgroundMode, backgroundImage: prev.backgroundImage }
            writeLocalPreferences(merged)
            return merged
          })
        })
        .catch(() => {
          // Cloud load failed — keep local prefs
        })
        .finally(() => setLoading(false))
    }

    prevUidRef.current = uid
  }, [user?.uid])

  const updatePreferences = useCallback(
    (patch: Partial<UserPreferences>) => {
      setPreferencesState((prev) => {
        const next = { ...prev, ...patch }
        writeLocalPreferences(next)

        // Persist to cloud if authenticated and cloud sync is enabled
        if (user && next.cloudSyncEnabled) {
          saveUserPreferences(user.uid, next).catch(() => {
            toast.error('Failed to save preferences to cloud')
          })
        }

        return next
      })
    },
    [user],
  )

  return { preferences, updatePreferences, loading } as const
}
