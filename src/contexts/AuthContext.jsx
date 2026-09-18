import { createContext, useContext, useEffect, useState } from 'react'
import { AuthService } from '../services/auth.service.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    AuthService.getSession()
      .then((s) => { if (mounted) setSession(s) })
      .catch(() => { /* sin sesión: ok */ })
      .finally(() => { if (mounted) setLoading(false) })

    const unsubscribe = AuthService.onAuthStateChange((s) => {
      setSession(s)
    })

    return () => { mounted = false; unsubscribe() }
  }, [])

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    signIn:  (credentials) => AuthService.signIn(credentials),
    signUp:  (credentials) => AuthService.signUp(credentials),
    signOut: () => AuthService.signOut(),
    resetPassword: (email) => AuthService.resetPassword(email),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
