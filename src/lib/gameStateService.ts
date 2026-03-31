import {
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { firestore } from './firebase'
import { ensureGameSessionId, GameState } from './GameState'

function gameStateDocRef(uid: string) {
  if (!firestore) throw new Error('Firestore is not configured')
  return doc(firestore, 'users', uid, 'profile', 'gameState')
}

export interface CloudGameState {
  state: GameState
  lastModified: number
  revision: number
  sessionId: string | null
  clientSessionId: string | null
  serverLastModified: number
}

interface SaveCloudGameStateInput {
  state: GameState
  expectedRevision: number
  clientSessionId: string
}

export type SaveCloudGameStateResult =
  | { status: 'saved'; cloud: CloudGameState }
  | { status: 'conflict'; cloud: CloudGameState | null }

type RawCloudGameState = {
  state?: unknown
  lastModified?: unknown
  revision?: unknown
  sessionId?: unknown
  clientSessionId?: unknown
  _serverTimestamp?: unknown
}

export async function loadCloudGameState(uid: string): Promise<CloudGameState | null> {
  const snap = await getDoc(gameStateDocRef(uid))
  if (!snap.exists()) return null

  return toCloudGameState(snap.data() as RawCloudGameState)
}

/**
 * Strips undefined values that Firestore rejects.
 */
function sanitize<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T
}

export async function saveCloudGameState(
  uid: string,
  input: SaveCloudGameStateInput,
): Promise<SaveCloudGameStateResult> {
  const docRef = gameStateDocRef(uid)
  const stateToSave = ensureGameSessionId(input.state)

  return runTransaction(firestore!, async (tx) => {
    const snap = await tx.get(docRef)
    const now = Date.now()

    if (!snap.exists()) {
      if (input.expectedRevision !== 0) {
        return { status: 'conflict', cloud: null }
      }

      const firstRevision = 1
      tx.set(docRef, {
        state: sanitize(stateToSave),
        lastModified: now,
        revision: firstRevision,
        sessionId: stateToSave.gameSessionId ?? null,
        clientSessionId: input.clientSessionId,
        _serverTimestamp: serverTimestamp(),
      })

      return {
        status: 'saved',
        cloud: {
          state: sanitize(stateToSave),
          lastModified: now,
          revision: firstRevision,
          sessionId: stateToSave.gameSessionId ?? null,
          clientSessionId: input.clientSessionId,
          serverLastModified: now,
        },
      }
    }

    const current = toCloudGameState(snap.data() as RawCloudGameState)
    if (!current || current.revision !== input.expectedRevision) {
      return { status: 'conflict', cloud: current }
    }

    const nextRevision = current.revision + 1
    tx.set(docRef, {
      state: sanitize(stateToSave),
      lastModified: now,
      revision: nextRevision,
      sessionId: stateToSave.gameSessionId ?? null,
      clientSessionId: input.clientSessionId,
      _serverTimestamp: serverTimestamp(),
    })

    return {
      status: 'saved',
      cloud: {
        state: sanitize(stateToSave),
        lastModified: now,
        revision: nextRevision,
        sessionId: stateToSave.gameSessionId ?? null,
        clientSessionId: input.clientSessionId,
        serverLastModified: now,
      },
    }
  })
}

export function subscribeCloudGameState(
  uid: string,
  onChange: (cloud: CloudGameState | null) => void,
  onError?: (error: unknown) => void,
) {
  return onSnapshot(
    gameStateDocRef(uid),
    (snap) => {
      if (!snap.exists()) {
        onChange(null)
        return
      }

      onChange(toCloudGameState(snap.data() as RawCloudGameState))
    },
    (error) => {
      onError?.(error)
    },
  )
}

export async function deleteCloudGameState(uid: string): Promise<void> {
  await deleteDoc(gameStateDocRef(uid))
}

function toCloudGameState(data: RawCloudGameState): CloudGameState | null {
  if (!data || typeof data !== 'object') return null

  const serverTimestampRaw = data._serverTimestamp
  const serverLastModified =
    serverTimestampRaw instanceof Timestamp ? serverTimestampRaw.toMillis() : 0

  return {
    state: ensureGameSessionId((data.state as GameState) ?? { heroes: [] }, typeof data.sessionId === 'string' ? data.sessionId : undefined),
    lastModified: typeof data.lastModified === 'number' ? data.lastModified : 0,
    revision: typeof data.revision === 'number' ? data.revision : 0,
    sessionId: typeof data.sessionId === 'string' ? data.sessionId : null,
    clientSessionId: typeof data.clientSessionId === 'string' ? data.clientSessionId : null,
    serverLastModified,
  }
}
