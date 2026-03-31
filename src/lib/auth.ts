import {
  GoogleAuthProvider,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth } from './firebase'

const googleProvider = new GoogleAuthProvider()

/**
 * Sign in with Google using popup, falling back to redirect if popup is blocked.
 * Returns the signed-in user on success, or null if cancelled / Firebase not configured.
 */
export async function signInWithGoogle() {
  if (!auth) {
    console.warn('Firebase Auth is not configured. Cannot sign in.')
    return null
  }

  try {
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
  } catch (error: unknown) {
    const firebaseError = error as { code?: string }

    // User closed the popup — not an error, stay anonymous
    if (firebaseError.code === 'auth/popup-closed-by-user' ||
        firebaseError.code === 'auth/cancelled-popup-request') {
      return null
    }

    // Popup blocked by browser — fall back to redirect
    if (firebaseError.code === 'auth/popup-blocked') {
      await signInWithRedirect(auth, googleProvider)
      // Redirect will navigate away; this line is not reached
      return null
    }

    // Unexpected error — rethrow so callers can handle
    throw error
  }
}

/**
 * Process the result of a redirect-based sign-in (called once on app load).
 * Returns the user if a redirect login just completed, null otherwise.
 */
export async function handleRedirectResult() {
  if (!auth) return null

  try {
    const result = await getRedirectResult(auth)
    return result?.user ?? null
  } catch {
    // Redirect result errors are non-critical; the user stays anonymous
    return null
  }
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  if (!auth) return
  await firebaseSignOut(auth)
}
