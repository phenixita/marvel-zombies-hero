import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'
import { firestore } from './firebase'
import { DEFAULT_USER_STATS, UserStats } from './UserStats'

function statsDocRef(uid: string) {
  if (!firestore) throw new Error('Firestore is not configured')
  return doc(firestore, 'users', uid, 'profile', 'stats')
}

export async function loadUserStats(uid: string): Promise<UserStats> {
  const snap = await getDoc(statsDocRef(uid))
  if (!snap.exists()) return { ...DEFAULT_USER_STATS }

  const data = snap.data()
  return {
    gamesPlayed: typeof data.gamesPlayed === 'number' ? data.gamesPlayed : 0,
    heroesCreated: typeof data.heroesCreated === 'number' ? data.heroesCreated : 0,
    devourRolls: typeof data.devourRolls === 'number' ? data.devourRolls : 0,
  }
}

export async function saveUserStats(uid: string, stats: UserStats): Promise<void> {
  await setDoc(statsDocRef(uid), stats)
}

export async function incrementStat(uid: string, field: keyof UserStats, amount = 1): Promise<void> {
  const current = await loadUserStats(uid)
  current[field] += amount
  await saveUserStats(uid, current)
}

export async function deleteUserStats(uid: string): Promise<void> {
  await deleteDoc(statsDocRef(uid))
}
