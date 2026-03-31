import { auth, firebaseConfigurationError, isFirebaseConfigured } from '@/lib/firebase'
import { User } from 'firebase/auth'
import { useAuthState } from 'react-firebase-hooks/auth'
import { createContext, ReactNode, useContext, useMemo } from 'react'

interface AuthContextValue {
  user: User | null
  loading: boolean
  error: Error | null
  isFirebaseConfigured: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, loading, authError] = auth ? useAuthState(auth) : [null, false, undefined]

  const value = useMemo<AuthContextValue>(
    () => ({
      user: user ?? null,
      loading,
      error: (authError as Error | undefined) ?? firebaseConfigurationError,
      isFirebaseConfigured,
    }),
    [authError, loading, user],
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
