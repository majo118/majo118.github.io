import { supabase } from './supabase.js'
import { deriveTitle } from '../utils/security.js'

export const ChatService = {
  async listConversations(userId) {
    const { data, error } = await supabase
      .from('conversations')
      .select('id, title, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async createConversation(userId, seedMessage) {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        title: deriveTitle(seedMessage || 'Nueva conversación'),
      })
      .select('id, title, updated_at')
      .single()
    if (error) throw error
    return data
  },

  async renameConversation(id, title) {
    const { error } = await supabase
      .from('conversations')
      .update({ title })
      .eq('id', id)
    if (error) throw error
  },

  async deleteConversation(id) {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  async listMessages(conversationId) {
    const { data, error } = await supabase
      .from('messages')
      .select('id, role, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  async addMessage({ conversationId, userId, role, content }) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        user_id: userId,
        role,
        content,
      })
      .select('id, role, content, created_at')
      .single()
    if (error) throw error
    return data
  },
}
