import MessageList from './MessageList.jsx'
import MessageInput from './MessageInput.jsx'
import LoadingSpinner from '../common/LoadingSpinner.jsx'
import './ChatWindow.css'

export default function ChatWindow({
  messages, loading, sending, error, onSend, conversationId,
}) {
  const emptyState = (
    <div className="lumina-empty">
      <h2>¿En qué te ayudo hoy?</h2>
      <p>Pregunta sobre guías de práctica clínica obstétricas y te respondo con la referencia correspondiente.</p>
      <div className="lumina-empty__hints">
        <span>Ej: Manejo de preeclampsia severa</span>
        <span>Ej: Criterios de cesárea programada</span>
        <span>Ej: Tamizaje diabetes gestacional</span>
      </div>
    </div>
  )

  return (
    <section className="lumina-chat">
      <div className="lumina-chat__scroll">
        <div className="lumina-chat__inner">
          {loading
            ? <div style={{ display: 'grid', placeItems: 'center', height: 200 }}><LoadingSpinner /></div>
            : <MessageList messages={messages} sending={sending} emptyState={emptyState} />}
          {error && <div className="lumina-chat__error">⚠ {error}</div>}
        </div>
      </div>
      <div className="lumina-chat__composer">
        <div className="lumina-chat__inner">
          <MessageInput onSend={onSend} disabled={!conversationId || sending} />
          <p className="lumina-chat__disclaimer">
            Lumina puede cometer errores. Verifica siempre con la guía original.
          </p>
        </div>
      </div>
    </section>
  )
}
