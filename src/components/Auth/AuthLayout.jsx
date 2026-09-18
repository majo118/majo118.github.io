import Logo from '../Layout/Logo.jsx'
import './AuthLayout.css'

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="lumina-auth">
      <div className="lumina-auth__card">
        <div className="lumina-auth__brand">
          <Logo size={72} showText />
        </div>
        <h1 className="lumina-auth__title">{title}</h1>
        {subtitle && <p className="lumina-auth__subtitle">{subtitle}</p>}
        <div className="lumina-auth__form">{children}</div>
        {footer && <div className="lumina-auth__footer">{footer}</div>}
      </div>
      <p className="lumina-auth__legal">
        Esta plataforma maneja datos sensibles. Sólo úsala en dispositivos de confianza.
      </p>
    </div>
  )
}
