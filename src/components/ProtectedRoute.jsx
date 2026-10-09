import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Loading from './Loading'

export default function ProtectedRoute({ requireRole }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" replace />
  if (!profile) return <Loading text="Memuat profil..." />

  // Member wajib isi WA, kecuali sedang di halaman isi-whatsapp
  if (
    profile.role === 'member' &&
    !profile.whatsapp &&
    location.pathname !== '/isi-whatsapp'
  ) {
    return <Navigate to="/isi-whatsapp" replace />
  }

  if (requireRole && profile.role !== requireRole) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
