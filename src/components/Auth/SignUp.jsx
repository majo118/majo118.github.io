import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import AuthLayout from './AuthLayout.jsx'
import Button from '../common/Button.jsx'
import { MIN_PASSWORD_LEN } from '../../utils/constants.js'

export default function SignUp() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError(null); setInfo(null)

    if (password.length < MIN_PASSWORD_LEN) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD_LEN} caracteres`)
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    try {
      const data = await signUp({ email: email.trim(), password })
      if (data?.session) {
        navigate('/chat', { replace: true })
      } else {
        // Supabase pide confirmación por email
        setInfo('Cuenta creada. Revisa tu correo para confirmar antes de iniciar sesión.')
      }
    } catch (err) {
      setError(err.message || 'No se pudo crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Acceso al asistente clínico Lumina"
      footer={<>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></>}
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
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LEN}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="pw2">Confirmar contraseña</label>
          <input
            id="pw2"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        {error && <div className="lumina-auth__error">{error}</div>}
        {info  && <div className="lumina-auth__error" style={{ background: '#eafaf1', color: '#1f6b45', borderColor: '#bde5cf' }}>{info}</div>}
        <Button type="submit" loading={loading} style={{ marginTop: '0.5rem' }}>
          Crear cuenta
        </Button>
      </form>
    </AuthLayout>
  )
}
