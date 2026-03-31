import { deleteCloudGameState } from './gameStateService'
import { deleteUserStats } from './statsService'
import { doc, deleteDoc } from 'firebase/firestore'
import { firestore } from './firebase'

/**
 * Deletes all cloud data for a user: preferences, game state, and stats.
 * Local data is NOT affected.
 */
export async function deleteAllCloudData(uid: string): Promise<void> {
  if (!firestore) throw new Error('Firestore is not configured')

  const preferencesRef = doc(firestore, 'users', uid, 'profile', 'preferences')

  await Promise.all([
    deleteDoc(preferencesRef),
    deleteCloudGameState(uid),
    deleteUserStats(uid),
  ])
}
