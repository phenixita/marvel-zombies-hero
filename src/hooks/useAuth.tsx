import { auth, firebaseConfigurationError, isFirebaseConfigured } from '@/lib/firebase'
import { signInWithGoogle, signOut, handleRedirectResult } from '@/lib/auth'
import { User } from 'firebase/auth'
import { useAuthState } from 'react-firebase-hooks/auth'
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'

interface AuthContextValue {
  user: User | null
  loading: boolean
  error: Error | null
  isFirebaseConfigured: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, loading, authError] = auth ? useAuthState(auth) : [null, false, undefined]
  const [actionError, setActionError] = useState<Error | null>(null)

  // Handle redirect result on initial load (for popup-blocked fallback)
  useEffect(() => {
    handleRedirectResult().catch(() => {
      // Redirect errors are non-critical; user stays anonymous
    })
  }, [])

  const handleSignIn = useCallback(async () => {
    setActionError(null)
    try {
      await signInWithGoogle()
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Sign-in failed')
      setActionError(err)
    }
  }, [])

  const handleSignOut = useCallback(async () => {
    setActionError(null)
    try {
      await signOut()
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Sign-out failed')
      setActionError(err)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: user ?? null,
      loading,
      error: actionError ?? (authError as Error | undefined) ?? firebaseConfigurationError,
      isFirebaseConfigured,
      signIn: handleSignIn,
      signOut: handleSignOut,
    }),
    [actionError, authError, handleSignIn, handleSignOut, loading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
