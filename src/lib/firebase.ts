import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app'
import { Auth, getAuth } from 'firebase/auth'
import { Firestore, getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const missingConfigKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key)

const hasFirebaseConfig = missingConfigKeys.length === 0

let firebaseConfigurationError: Error | null = null
let firebaseApp: FirebaseApp | null = null
let auth: Auth | null = null
let firestore: Firestore | null = null

if (hasFirebaseConfig) {
  try {
    firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
    auth = getAuth(firebaseApp)
    firestore = getFirestore(firebaseApp)
  } catch (error) {
    firebaseConfigurationError = error instanceof Error ? error : new Error('Unknown Firebase initialization error')
    console.error('Firebase initialization failed. The app will continue in anonymous mode.', firebaseConfigurationError)
  }
} else {
  firebaseConfigurationError = new Error(
    `Firebase is not configured. Missing env vars: ${missingConfigKeys.join(', ')}`,
  )
  console.warn(firebaseConfigurationError.message)
}

const isFirebaseConfigured = hasFirebaseConfig && auth !== null

export {
  auth,
  firebaseApp,
  firebaseConfigurationError,
  firestore,
  isFirebaseConfigured,
}
