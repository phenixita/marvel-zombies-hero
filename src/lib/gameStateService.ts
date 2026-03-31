import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { firestore } from './firebase'
import { GameState } from './GameState'

function gameStateDocRef(uid: string) {
  if (!firestore) throw new Error('Firestore is not configured')
  return doc(firestore, 'users', uid, 'profile', 'gameState')
}

export interface CloudGameState {
  state: GameState
  lastModified: number
}

export async function loadCloudGameState(uid: string): Promise<CloudGameState | null> {
  const snap = await getDoc(gameStateDocRef(uid))
  if (!snap.exists()) return null

  const data = snap.data()
  return {
    state: data.state as GameState,
    lastModified: typeof data.lastModified === 'number' ? data.lastModified : 0,
  }
}

/**
 * Strips undefined values that Firestore rejects.
 */
function sanitize<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T
}

export async function saveCloudGameState(uid: string, state: GameState): Promise<void> {
  await setDoc(gameStateDocRef(uid), {
    state: sanitize(state),
    lastModified: Date.now(),
    _serverTimestamp: serverTimestamp(),
  })
}

export async function deleteCloudGameState(uid: string): Promise<void> {
  await deleteDoc(gameStateDocRef(uid))
}
