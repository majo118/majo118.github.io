import { supabase } from './supabase.js'

/**
 * Toda la interacción con Supabase Auth vive acá.
 * Los componentes no llaman a supabase.auth directamente.
 */
export const AuthService = {
  async signUp({ email, password }) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  },

  async signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  },

  onAuthStateChange(callback) {
    const { data } = supabase.auth.onAuthStateChange((_evt, session) => callback(session))
    return () => data.subscription.unsubscribe()
  },

  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  },
}
