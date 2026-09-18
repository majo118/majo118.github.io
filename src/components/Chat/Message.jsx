import { renderMarkdownSafe } from '../../utils/security.js'
import { ROLE_ASSISTANT } from '../../utils/constants.js'
import './Message.css'

export default function Message({ message }) {
  const isAssistant = message.role === ROLE_ASSISTANT
  const html = renderMarkdownSafe(message.content)

  return (
    <div className={`lumina-msg ${isAssistant ? 'lumina-msg--ai' : 'lumina-msg--me'}`}>
      <div className="lumina-msg__avatar" aria-hidden>
        {isAssistant ? '✦' : '•'}
      </div>
      <div className="lumina-msg__bubble">
        {/* Contenido HTML sanitizado con DOMPurify */}
        <div
          className="lumina-msg__content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  )
}
