import { useCallback, useEffect, useState } from 'react'
import { ChatService } from '../services/chat.service.js'
import { useAuth } from '../contexts/AuthContext.jsx'

export function useConversations() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const list = await ChatService.listConversations(user.id)
      setConversations(list)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { refresh() }, [refresh])

  const create = useCallback(async (seed) => {
    if (!user) return null
    const conv = await ChatService.createConversation(user.id, seed)
    setConversations((prev) => [conv, ...prev])
    return conv
  }, [user])

  const rename = useCallback(async (id, title) => {
    await ChatService.renameConversation(id, title)
    setConversations((prev) => prev.map((c) => c.id === id ? { ...c, title } : c))
  }, [])

  const remove = useCallback(async (id) => {
    await ChatService.deleteConversation(id)
    setConversations((prev) => prev.filter((c) => c.id !== id))
  }, [])

  return { conversations, loading, refresh, create, rename, remove }
}
