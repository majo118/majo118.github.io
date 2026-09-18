import { useCallback, useEffect, useState } from 'react'
import { ChatService } from '../services/chat.service.js'
import { AIService } from '../services/ai.service.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { ROLE_USER, ROLE_ASSISTANT, HISTORY_CONTEXT_TURNS } from '../utils/constants.js'
import { sanitizeUserInput } from '../utils/security.js'

export function useChat(conversationId) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  // Cargar historial cuando cambia la conversación
  useEffect(() => {
    let cancel = false
    async function load() {
      if (!conversationId) { setMessages([]); return }
      setLoading(true)
      setError(null)
      try {
        const list = await ChatService.listMessages(conversationId)
        if (!cancel) setMessages(list)
      } catch (e) {
        if (!cancel) setError(e.message)
      } finally {
        if (!cancel) setLoading(false)
      }
    }
    load()
    return () => { cancel = true }
  }, [conversationId])

  const send = useCallback(async (raw) => {
    if (!user || !conversationId) return
    const content = sanitizeUserInput(raw)
    if (!content) return

    setSending(true)
    setError(null)

    // Mensaje del usuario (optimista + persistir)
    const optimistic = {
      id: `tmp-${Date.now()}`,
      role: ROLE_USER,
      content,
      created_at: new Date().toISOString(),
    }
    setMessages((m) => [...m, optimistic])

    try {
      const savedUser = await ChatService.addMessage({
        conversationId,
        userId: user.id,
        role: ROLE_USER,
        content,
      })
      setMessages((m) => m.map((x) => x.id === optimistic.id ? savedUser : x))

      // Contexto para el agente (últimos N turnos + el nuevo)
      const history = [...messages, savedUser].slice(-HISTORY_CONTEXT_TURNS)

      // Llamar a n8n vía Edge Function
      const reply = await AIService.sendMessage({
        conversationId,
        message: content,
        history,
      })

      const savedAssistant = await ChatService.addMessage({
        conversationId,
        userId: user.id,
        role: ROLE_ASSISTANT,
        content: reply || '(sin respuesta)',
      })
      setMessages((m) => [...m, savedAssistant])
    } catch (e) {
      setError(e.message)
      // dejamos el mensaje del usuario aunque falle la IA
    } finally {
      setSending(false)
    }
  }, [user, conversationId, messages])

  return { messages, loading, sending, error, send }
}
