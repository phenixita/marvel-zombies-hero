import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from './useAuth'
import { useUserPreferences } from './useUserPreferences'
import { GameState } from '@/lib/GameState'
import { CloudGameState, loadCloudGameState, saveCloudGameState } from '@/lib/gameStateService'

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error'

const DEBOUNCE_MS = 2000
const LOCAL_TIMESTAMP_KEY = 'marvel-zombies-game-lastModified'

function getLocalTimestamp(): number {
  try {
    const raw = localStorage.getItem(LOCAL_TIMESTAMP_KEY)
    return raw ? Number(raw) : 0
  } catch {
    return 0
  }
}

function setLocalTimestamp(ts: number) {
  localStorage.setItem(LOCAL_TIMESTAMP_KEY, String(ts))
}

export interface ConflictInfo {
  localState: GameState
  cloudState: GameState
  localTimestamp: number
  cloudTimestamp: number
}

interface UseCloudSyncOptions {
  gameState: GameState
  setGameState: (state: GameState) => void
}

export function useCloudSync({ gameState, setGameState }: UseCloudSyncOptions) {
  const { user } = useAuth()
  const { preferences } = useUserPreferences()
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [conflict, setConflict] = useState<ConflictInfo | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevUidRef = useRef<string | null>(null)
  const isSyncingRef = useRef(false)
  const skipNextSyncRef = useRef(false)

  const isSyncEnabled = !!user && preferences.cloudSyncEnabled

  // Load cloud state on login and detect conflicts
  useEffect(() => {
    const uid = user?.uid ?? null

    if (uid && uid !== prevUidRef.current) {
      setSyncStatus('syncing')
      loadCloudGameState(uid)
        .then((cloud) => {
          if (!cloud) {
            // No cloud data — will sync current local state up
            setSyncStatus('synced')
            return
          }

          const localTs = getLocalTimestamp()
          const cloudTs = cloud.lastModified

          if (cloudTs > localTs && hasHeroes(cloud.state) && hasHeroes(gameState)) {
            // Cloud is newer and both have data — ask user
            setConflict({
              localState: gameState,
              cloudState: cloud.state,
              localTimestamp: localTs,
              cloudTimestamp: cloudTs,
            })
            setSyncStatus('idle')
          } else if (cloudTs > localTs && hasHeroes(cloud.state) && !hasHeroes(gameState)) {
            // Cloud is newer and local is empty — auto-load cloud
            setGameState(cloud.state)
            setLocalTimestamp(cloudTs)
            skipNextSyncRef.current = true
            setSyncStatus('synced')
          } else {
            // Local is newer or equal — keep local, cloud will be updated on next change
            setSyncStatus('synced')
          }
        })
        .catch((err) => {
          console.error('Cloud sync: failed to load cloud state', err)
          setSyncStatus('offline')
        })
    }

    if (!uid) {
      setSyncStatus('idle')
    }

    prevUidRef.current = uid
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid])

  // Debounced sync on game state changes
  useEffect(() => {
    if (!isSyncEnabled) return
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false
      return
    }
    if (!hasHeroes(gameState)) return

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      if (isSyncingRef.current) return
      isSyncingRef.current = true
      setSyncStatus('syncing')

      const now = Date.now()
      saveCloudGameState(user!.uid, gameState)
        .then(() => {
          setLocalTimestamp(now)
          setSyncStatus('synced')
        })
        .catch((err) => {
          console.error('Cloud sync: failed to save game state', err)
          setSyncStatus(navigator.onLine ? 'error' : 'offline')
        })
        .finally(() => {
          isSyncingRef.current = false
        })
    }, DEBOUNCE_MS)

    // Update local timestamp immediately
    setLocalTimestamp(Date.now())

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, isSyncEnabled, user?.uid])

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      if (isSyncEnabled && syncStatus === 'offline') {
        setSyncStatus('idle')
      }
    }
    const handleOffline = () => {
      if (isSyncEnabled) setSyncStatus('offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isSyncEnabled, syncStatus])

  const resolveConflict = useCallback((choice: 'local' | 'cloud') => {
    if (!conflict) return

    if (choice === 'cloud') {
      setGameState(conflict.cloudState)
      setLocalTimestamp(conflict.cloudTimestamp)
      skipNextSyncRef.current = true
    } else {
      // Keep local, will sync to cloud on next change
      setLocalTimestamp(Date.now())
    }

    setConflict(null)
    setSyncStatus('synced')
  }, [conflict, setGameState])

  return { syncStatus, conflict, resolveConflict }
}

function hasHeroes(state: GameState): boolean {
  return state.heroes.length > 0
}
