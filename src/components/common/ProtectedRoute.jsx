import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import LoadingSpinner from './LoadingSpinner.jsx'

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <LoadingSpinner fullscreen />
  if (!session) return <Navigate to="/login" replace />
  return children
}
