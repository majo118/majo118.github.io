import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import SignUp from '../components/Auth/SignUp.jsx'
import LoadingSpinner from '../components/common/LoadingSpinner.jsx'

export default function SignUpPage() {
  const { session, loading } = useAuth()
  if (loading) return <LoadingSpinner fullscreen />
  if (session) return <Navigate to="/chat" replace />
  return <SignUp />
}
