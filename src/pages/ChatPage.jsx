import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Layout/Header.jsx'
import Sidebar from '../components/Sidebar/Sidebar.jsx'
import ChatWindow from '../components/Chat/ChatWindow.jsx'
import { useConversations } from '../hooks/useConversations.js'
import { useChat } from '../hooks/useChat.js'
import './ChatPage.css'

export default function ChatPage() {
  const navigate = useNavigate()
  const { conversationId } = useParams()

  const {
    conversations, loading: convLoading,
    create, rename, remove,
  } = useConversations()

  const {
    messages, loading, sending, error, send,
  } = useChat(conversationId)

  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Si no hay conversación activa y ya cargó la lista, entra a la más reciente
  // o crea una nueva vacía en el primer envío.
  useEffect(() => {
    if (!conversationId && !convLoading && conversations.length) {
      navigate(`/chat/${conversations[0].id}`, { replace: true })
    }
  }, [conversationId, convLoading, conversations, navigate])

  async function handleSend(text) {
    let convId = conversationId
    if (!convId) {
      const conv = await create(text)
      if (!conv) return
      convId = conv.id
      navigate(`/chat/${convId}`, { replace: true })
      // pequeño defer para que useChat cargue el nuevo id antes de enviar
      setTimeout(() => send(text), 0)
      return
    }
    send(text)
  }

  async function handleNew() {
    // Creamos la conversación al primer envío para no dejar vacías huérfanas.
    navigate('/chat')
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta conversación y todos sus mensajes?')) return
    await remove(id)
    if (id === conversationId) navigate('/chat', { replace: true })
  }

  return (
    <div className="lumina-page">
      <Header onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <div className="lumina-page__body">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          conversations={conversations}
          activeId={conversationId}
          onNew={handleNew}
          onSelect={(id) => navigate(`/chat/${id}`)}
          onRename={rename}
          onDelete={handleDelete}
        />
        <main className="lumina-page__main">
          <ChatWindow
            messages={messages}
            loading={loading}
            sending={sending}
            error={error}
            onSend={handleSend}
            conversationId={conversationId ?? 'new'}
          />
        </main>
      </div>
    </div>
  )
}
