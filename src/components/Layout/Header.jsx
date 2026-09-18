import { useAuth } from '../../contexts/AuthContext.jsx'
import Logo from './Logo.jsx'
import Button from '../common/Button.jsx'
import './Header.css'

export default function Header({ onToggleSidebar }) {
  const { user, signOut } = useAuth()

  return (
    <header className="lumina-header">
      <div className="lumina-header__left">
        <button
          className="lumina-header__menu"
          onClick={onToggleSidebar}
          aria-label="Abrir menú"
        >
          ☰
        </button>
        <Logo size={36} />
      </div>
      <div className="lumina-header__right">
        <span className="lumina-header__user">{user?.email}</span>
        <Button variant="ghost" onClick={signOut}>Cerrar sesión</Button>
      </div>
    </header>
  )
}
