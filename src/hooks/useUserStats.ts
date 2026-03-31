import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from './useAuth'
import { DEFAULT_USER_STATS, UserStats } from '@/lib/UserStats'
import { loadUserStats, saveUserStats } from '@/lib/statsService'

export function useUserStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState<UserStats>({ ...DEFAULT_USER_STATS })
  const [loading, setLoading] = useState(false)
  const prevUidRef = useRef<string | null>(null)

  useEffect(() => {
    const uid = user?.uid ?? null

    if (uid && uid !== prevUidRef.current) {
      setLoading(true)
      loadUserStats(uid)
        .then(setStats)
        .catch(() => {
          // Cloud load failed — keep defaults
        })
        .finally(() => setLoading(false))
    }

    if (!uid) {
      setStats({ ...DEFAULT_USER_STATS })
    }

    prevUidRef.current = uid
  }, [user?.uid])

  const incrementStat = useCallback(
    (field: keyof UserStats, amount = 1) => {
      setStats((prev) => {
        const next = { ...prev, [field]: prev[field] + amount }

        if (user) {
          saveUserStats(user.uid, next).catch(() => {
            // Silently fail — stats are best-effort
          })
        }

        return next
      })
    },
    [user],
  )

  return { stats, loading, incrementStat }
}
