import ConversationItem from './ConversationItem.jsx'

export default function ConversationList({
  conversations, activeId, onSelect, onRename, onDelete,
}) {
  if (!conversations.length) {
    return (
      <p style={{ color: 'var(--lumina-text-muted)', padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}>
        Aún no tienes conversaciones.
      </p>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {conversations.map((c) => (
        <ConversationItem
          key={c.id}
          conv={c}
          active={c.id === activeId}
          onSelect={onSelect}
          onRename={onRename}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
