import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Loading from './Loading'

export default function ProtectedRoute({ requireRole }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" replace />
  if (!profile) return <Loading text="Memuat profil..." />

  // Member wajib isi WA dulu sebelum bisa akses halaman lain
  if (profile.role === 'member' && !profile.whatsapp) {
    return <Navigate to="/isi-whatsapp" replace />
  }

  if (requireRole && profile.role !== requireRole) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}a
