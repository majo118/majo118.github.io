import { useState } from 'react'

export default function ConversationItem({ conv, active, onSelect, onRename, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(conv.title)

  function commit() {
    const t = title.trim()
    if (t && t !== conv.title) onRename(conv.id, t)
    setEditing(false)
  }

  return (
    <div
      className={`lumina-conv ${active ? 'lumina-conv--active' : ''}`}
      onClick={() => !editing && onSelect(conv.id)}
    >
      {editing ? (
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && commit()}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="lumina-conv__title" title={conv.title}>
          {conv.title || 'Sin título'}
        </span>
      )}
      <div className="lumina-conv__actions" onClick={(e) => e.stopPropagation()}>
        <button title="Renombrar" onClick={() => setEditing(true)}>✎</button>
        <button title="Eliminar" onClick={() => onDelete(conv.id)}>🗑</button>
      </div>
    </div>
  )
}
