import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import VerifyResetCodePage from './pages/VerifyResetCodePage'
import DashboardPage from './pages/DashboardPage'
import CollegesPage from './pages/CollegesPage'
import CanteensPage from './pages/CanteensPage'
import UsersPage from './pages/UsersPage'
import OrdersPage from './pages/OrdersPage'
import AnalyticsPage from './pages/AnalyticsPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />} />
      <Route path="/verify-reset-code" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <VerifyResetCodePage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout><DashboardPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/colleges" element={
        <ProtectedRoute>
          <Layout><CollegesPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/canteens" element={
        <ProtectedRoute>
          <Layout><CanteensPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute>
          <Layout><UsersPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute>
          <Layout><OrdersPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute>
          <Layout><AnalyticsPage /></Layout>
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App
