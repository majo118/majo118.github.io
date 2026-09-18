import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignUpPage from './pages/SignUpPage.jsx'
import ChatPage from './pages/ChatPage.jsx'

// Usamos HashRouter para no depender del servidor: GitHub Pages
// no reescribe rutas y una BrowserRouter da 404 en refresh.
export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route
            path="/chat/:conversationId?"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="*" element={<Navigate to="/chat" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}
