import { doc, getDoc, setDoc } from 'firebase/firestore'
import { firestore } from './firebase'
import { DEFAULT_USER_PREFERENCES, UserPreferences } from './UserPreferences'

function preferencesDocRef(uid: string) {
  if (!firestore) throw new Error('Firestore is not configured')
  return doc(firestore, 'users', uid, 'profile', 'preferences')
}

export async function loadUserPreferences(uid: string): Promise<UserPreferences> {
  const snap = await getDoc(preferencesDocRef(uid))
  if (!snap.exists()) return { ...DEFAULT_USER_PREFERENCES }

  const data = snap.data()
  return {
    cloudSyncEnabled: typeof data.cloudSyncEnabled === 'boolean' ? data.cloudSyncEnabled : DEFAULT_USER_PREFERENCES.cloudSyncEnabled,
    defaultAutomaticMode: typeof data.defaultAutomaticMode === 'boolean' ? data.defaultAutomaticMode : DEFAULT_USER_PREFERENCES.defaultAutomaticMode,
  }
}

export async function saveUserPreferences(uid: string, prefs: UserPreferences): Promise<void> {
  await setDoc(preferencesDocRef(uid), prefs)
}
