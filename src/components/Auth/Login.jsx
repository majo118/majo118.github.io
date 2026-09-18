import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import AuthLayout from './AuthLayout.jsx'
import Button from '../common/Button.jsx'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signIn({ email: email.trim(), password })
      navigate('/chat', { replace: true })
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Bienvenido"
      subtitle="Inicia sesión para consultar guías clínicas"
      footer={<>¿Sin cuenta? <Link to="/signup">Crear una</Link></>}
    >
      <form onSubmit={onSubmit} noValidate>
        <div>
          <label htmlFor="email">Correo</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="pw">Contraseña</label>
          <input
            id="pw"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <div className="lumina-auth__error">{error}</div>}
        <Button type="submit" loading={loading} style={{ marginTop: '0.5rem' }}>
          Entrar
        </Button>
      </form>
    </AuthLayout>
  )
}
