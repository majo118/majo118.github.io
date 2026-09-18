import ConversationList from './ConversationList.jsx'
import Button from '../common/Button.jsx'
import './Sidebar.css'

export default function Sidebar({
  open,
  conversations,
  activeId,
  onNew,
  onSelect,
  onRename,
  onDelete,
  onClose,
}) {
  return (
    <>
      {open && <div className="lumina-sidebar__backdrop" onClick={onClose} />}
      <aside className={`lumina-sidebar ${open ? 'is-open' : ''}`}>
        <div className="lumina-sidebar__header">
          <Button onClick={onNew} style={{ width: '100%' }}>+ Nueva conversación</Button>
        </div>
        <div className="lumina-sidebar__list">
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            onSelect={(id) => { onSelect(id); onClose?.() }}
            onRename={onRename}
            onDelete={onDelete}
          />
        </div>
      </aside>
    </>
  )
}
