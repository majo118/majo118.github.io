import { supabase } from './supabase.js'

const CHAT_PROXY_URL = import.meta.env.VITE_CHAT_PROXY_URL

/**
 * Envía un mensaje al agente n8n a través del Edge Function.
 * Adjunta el JWT del usuario para que el Edge Function pueda
 * autenticar la sesión y aplicar RLS.
 */
export const AIService = {
  async sendMessage({ conversationId, message, history }) {
    if (!CHAT_PROXY_URL) {
      throw new Error('VITE_CHAT_PROXY_URL no está configurado')
    }

    const { data: sessionData, error: sessErr } = await supabase.auth.getSession()
    if (sessErr) throw sessErr
    const token = sessionData?.session?.access_token
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(CHAT_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        conversationId,
        message,
        history: history?.map(({ role, content }) => ({ role, content })) ?? [],
      }),
    })

    if (!res.ok) {
      let detail = ''
      try { detail = (await res.json())?.error ?? '' } catch (_e) { /* ignore */ }
      throw new Error(`Agente falló (${res.status}) ${detail}`)
    }

    const data = await res.json()
    return data.reply ?? ''
  },
}
