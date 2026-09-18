import { useEffect, useRef } from 'react'
import Message from './Message.jsx'
import TypingIndicator from './TypingIndicator.jsx'

export default function MessageList({ messages, sending, emptyState }) {
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  if (!messages.length && !sending) {
    return emptyState
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      {messages.map((m) => <Message key={m.id} message={m} />)}
      {sending && <TypingIndicator />}
      <div ref={endRef} />
    </div>
  )
}
