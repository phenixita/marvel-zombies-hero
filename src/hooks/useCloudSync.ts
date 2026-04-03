import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from './useAuth'
import { useUserPreferences } from './useUserPreferences'
import { createGameSessionId, GameState, normalizeGameState } from '@/lib/GameState'
import {
  CloudGameState,
  loadCloudGameState,
  saveCloudGameState,
  subscribeCloudGameState,
} from '@/lib/gameStateService'

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error' | 'conflict'

const DEBOUNCE_MS = 2000
const LOCAL_SYNC_META_KEY = 'marvel-zombies-game-sync-meta-v1'
const LEGACY_TIMESTAMP_KEY = 'marvel-zombies-game-lastModified'

interface LocalSyncMeta {
  baseCloudRevision: number
  lastSeenCloudRevision: number
  localDirtySince: number
  lastLocalModified: number
}

const INITIAL_SYNC_META: LocalSyncMeta = {
  baseCloudRevision: 0,
  lastSeenCloudRevision: 0,
  localDirtySince: 0,
  lastLocalModified: 0,
}

function createClientSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `session-${Date.now()}`
}

function getLegacyLocalTimestamp(): number {
  try {
    const raw = localStorage.getItem(LEGACY_TIMESTAMP_KEY)
    return raw ? Number(raw) : 0
  } catch {
    return 0
  }
}

function readLocalSyncMeta(): LocalSyncMeta {
  try {
    const raw = localStorage.getItem(LOCAL_SYNC_META_KEY)
    if (!raw) {
      return {
        ...INITIAL_SYNC_META,
        lastLocalModified: getLegacyLocalTimestamp(),
      }
    }

    const parsed = JSON.parse(raw) as Partial<LocalSyncMeta>
    return {
      baseCloudRevision:
        typeof parsed.baseCloudRevision === 'number' ? parsed.baseCloudRevision : 0,
      lastSeenCloudRevision:
        typeof parsed.lastSeenCloudRevision === 'number' ? parsed.lastSeenCloudRevision : 0,
      localDirtySince: typeof parsed.localDirtySince === 'number' ? parsed.localDirtySince : 0,
      lastLocalModified:
        typeof parsed.lastLocalModified === 'number'
          ? parsed.lastLocalModified
          : getLegacyLocalTimestamp(),
    }
  } catch {
    return {
      ...INITIAL_SYNC_META,
      lastLocalModified: getLegacyLocalTimestamp(),
    }
  }
}

function writeLocalSyncMeta(meta: LocalSyncMeta) {
  localStorage.setItem(LOCAL_SYNC_META_KEY, JSON.stringify(meta))
  localStorage.setItem(LEGACY_TIMESTAMP_KEY, String(meta.lastLocalModified))
}

export interface ConflictInfo {
  localState: GameState
  localRevision: number
  cloudState: GameState
  cloudRevision: number
  localTimestamp: number
  cloudTimestamp: number
  cloudSnapshot: CloudGameState
}

export type ConflictChoice = 'local' | 'cloud' | 'fresh'

interface UseCloudSyncOptions {
  gameState: GameState
  setGameState: (state: GameState) => void
}

export function useCloudSync({ gameState, setGameState }: UseCloudSyncOptions) {
  const { user } = useAuth()
  const { preferences } = useUserPreferences()
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [conflict, setConflict] = useState<ConflictInfo | null>(null)
  const [syncTrigger, setSyncTrigger] = useState(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevUidRef = useRef<string | null>(null)
  const isSyncingRef = useRef(false)
  const skipNextSyncRef = useRef(false)
  const currentStateRef = useRef(gameState)
  const syncMetaRef = useRef<LocalSyncMeta>(readLocalSyncMeta())
  const clientSessionIdRef = useRef(createClientSessionId())

  const isSyncEnabled = !!user && preferences.cloudSyncEnabled

  useEffect(() => {
    currentStateRef.current = gameState
  }, [gameState])

  const updateSyncMeta = useCallback((patch: Partial<LocalSyncMeta>) => {
    const next = {
      ...syncMetaRef.current,
      ...patch,
    }
    syncMetaRef.current = next
    writeLocalSyncMeta(next)
  }, [])

  const getPreparedLocalState = useCallback(
    (state: GameState) => normalizeGameState(state, currentStateRef.current.gameSessionId ?? createGameSessionId()),
    [],
  )

  const applyCloudAsCurrent = useCallback(
    (cloud: CloudGameState) => {
      skipNextSyncRef.current = true
      const normalizedCloudState = normalizeGameState(cloud.state)
      setGameState(normalizedCloudState)
      updateSyncMeta({
        baseCloudRevision: cloud.revision,
        lastSeenCloudRevision: cloud.revision,
        localDirtySince: 0,
        lastLocalModified: cloud.lastModified,
      })
    },
    [setGameState, updateSyncMeta],
  )

  const markLocalDirty = useCallback(() => {
    const now = Date.now()
    updateSyncMeta({
      localDirtySince: syncMetaRef.current.localDirtySince || now,
      lastLocalModified: now,
    })
  }, [updateSyncMeta])

  const clearDebounce = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
  }, [])

  const openConflict = useCallback(
    (cloud: CloudGameState, localState: GameState) => {
      clearDebounce()
      setConflict({
        localState,
        localRevision: syncMetaRef.current.baseCloudRevision,
        cloudState: cloud.state,
        cloudRevision: cloud.revision,
        localTimestamp: syncMetaRef.current.lastLocalModified,
        cloudTimestamp: cloud.lastModified,
        cloudSnapshot: cloud,
      })
      setSyncStatus('conflict')
    },
    [clearDebounce],
  )

  const attemptCloudSave = useCallback(
    async (stateToSave: GameState) => {
      if (!user || isSyncingRef.current) return

      isSyncingRef.current = true
      setSyncStatus('syncing')

      try {
        const preparedState = getPreparedLocalState(stateToSave)
        const result = await saveCloudGameState(user.uid, {
          state: preparedState,
          expectedRevision: syncMetaRef.current.baseCloudRevision,
          clientSessionId: clientSessionIdRef.current,
        })

        if (result.status === 'saved') {
          const cloud = result.cloud
          currentStateRef.current = preparedState
          updateSyncMeta({
            baseCloudRevision: cloud.revision,
            lastSeenCloudRevision: cloud.revision,
            localDirtySince: 0,
            lastLocalModified: cloud.lastModified,
          })
          setConflict(null)
          setSyncStatus('synced')
          return
        }

        if (!result.cloud) {
          setSyncStatus('error')
          return
        }

        openConflict(result.cloud, preparedState)
      } catch (err) {
        console.error('Cloud sync: failed to save game state', err)
        setSyncStatus(navigator.onLine ? 'error' : 'offline')
      } finally {
        isSyncingRef.current = false
      }
    },
    [openConflict, updateSyncMeta, user],
  )

  // Load cloud state on login and detect conflicts
  useEffect(() => {
    const uid = user?.uid ?? null

    if (uid && uid !== prevUidRef.current) {
      setConflict(null)
      setSyncStatus('syncing')
      loadCloudGameState(uid)
        .then((cloud) => {
          const localState = currentStateRef.current

          if (!cloud) {
            const shouldPushLocal = hasHeroes(localState)
            updateSyncMeta({
              baseCloudRevision: 0,
              lastSeenCloudRevision: 0,
              localDirtySince: shouldPushLocal ? Date.now() : 0,
            })

            if (shouldPushLocal) {
              setSyncTrigger((value) => value + 1)
            }

            setSyncStatus('synced')
            return
          }

          const localTs = Math.max(syncMetaRef.current.lastLocalModified, getLegacyLocalTimestamp())
          const cloudTs = cloud.lastModified
          const hasLocal = hasHeroes(localState)
          const hasCloud = hasHeroes(cloud.state)

          updateSyncMeta({
            lastSeenCloudRevision: cloud.revision,
          })

          if (hasCloud && !hasLocal) {
            applyCloudAsCurrent(cloud)
            setSyncStatus('synced')
            return
          }

          if (!hasCloud && hasLocal) {
            updateSyncMeta({
              baseCloudRevision: cloud.revision,
              localDirtySince: Date.now(),
            })
            setSyncTrigger((value) => value + 1)
            setSyncStatus('synced')
            return
          }

          if (hasCloud && hasLocal && cloudTs > localTs) {
            openConflict(cloud, localState)
            return
          }

          updateSyncMeta({
            baseCloudRevision: cloud.revision,
            localDirtySince: hasLocal ? Date.now() : 0,
          })
          if (hasLocal) {
            setSyncTrigger((value) => value + 1)
          }
          setSyncStatus('synced')
        })
        .catch((err) => {
          console.error('Cloud sync: failed to load cloud state', err)
          setSyncStatus('offline')
        })
    }

    if (!uid) {
      clearDebounce()
      setConflict(null)
      setSyncStatus('idle')
    }

    prevUidRef.current = uid
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyCloudAsCurrent, clearDebounce, openConflict, updateSyncMeta, user?.uid])

  // Realtime cloud updates from other tabs/devices
  useEffect(() => {
    if (!isSyncEnabled || !user) return

    return subscribeCloudGameState(
      user.uid,
      (cloud) => {
        if (!cloud) return

        if (cloud.revision <= syncMetaRef.current.lastSeenCloudRevision) {
          return
        }

        updateSyncMeta({ lastSeenCloudRevision: cloud.revision })

        // Ignore own writes echoed back by Firestore.
        if (cloud.clientSessionId === clientSessionIdRef.current) {
          return
        }

        if (syncMetaRef.current.localDirtySince > 0 && hasHeroes(currentStateRef.current)) {
          openConflict(cloud, currentStateRef.current)
          return
        }

        applyCloudAsCurrent(cloud)
        setSyncStatus('synced')
      },
      (error) => {
        console.error('Cloud sync: realtime listener failed', error)
        setSyncStatus(navigator.onLine ? 'error' : 'offline')
      },
    )
  }, [applyCloudAsCurrent, isSyncEnabled, openConflict, updateSyncMeta, user])

  // Debounced sync on game state changes
  useEffect(() => {
    if (!isSyncEnabled) return
    if (conflict) return
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false
      return
    }
    if (!hasHeroes(gameState)) return

    markLocalDirty()
    clearDebounce()

    debounceRef.current = setTimeout(() => {
      attemptCloudSave(currentStateRef.current)
    }, DEBOUNCE_MS)

    return () => {
      clearDebounce()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptCloudSave, clearDebounce, conflict, gameState, isSyncEnabled, markLocalDirty, syncTrigger, user?.uid])

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

  const resolveConflict = useCallback((choice: ConflictChoice) => {
    if (!conflict) return

    if (choice === 'cloud') {
      applyCloudAsCurrent(conflict.cloudSnapshot)
      setConflict(null)
      setSyncStatus('synced')
      return
    }

    if (choice === 'fresh') {
      skipNextSyncRef.current = true
      const normalizedCurrent = normalizeGameState(currentStateRef.current)
      setGameState({
        gameSessionId: createGameSessionId(),
        heroes: [],
        isAutomaticMode: normalizedCurrent.isAutomaticMode ?? false,
        gameHistory: normalizedCurrent.gameHistory ?? [],
      })
      updateSyncMeta({
        baseCloudRevision: conflict.cloudRevision,
        lastSeenCloudRevision: conflict.cloudRevision,
        localDirtySince: 0,
        lastLocalModified: Date.now(),
      })
      setConflict(null)
      setSyncStatus('synced')
      return
    }

    // Keep local and intentionally overwrite cloud using the latest revision base.
    const localState = getPreparedLocalState(currentStateRef.current)
    currentStateRef.current = localState
    updateSyncMeta({
      baseCloudRevision: conflict.cloudRevision,
      lastSeenCloudRevision: conflict.cloudRevision,
      localDirtySince: Date.now(),
      lastLocalModified: Date.now(),
    })
    setConflict(null)
    setSyncStatus('syncing')
    void attemptCloudSave(localState)
  }, [applyCloudAsCurrent, attemptCloudSave, conflict, getPreparedLocalState, setGameState, updateSyncMeta])

  return { syncStatus, conflict, resolveConflict }
}

function hasHeroes(state: GameState): boolean {
  return state.heroes.length > 0
}
