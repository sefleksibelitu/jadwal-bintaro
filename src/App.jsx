import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import IsiWhatsapp from './pages/isiWhatsapp'

// Placeholder untuk halaman yang belum dibuat
const Placeholder = ({ title }) => (
  <div className="card">
    <h2 className="text-xl font-bold text-slate-800">🚧 {title}</h2>
    <p className="text-slate-500 text-sm mt-1">Halaman ini akan dibuat di tahap berikutnya.</p>
  </div>
)

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/jadwal-bintaro">
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Halaman isi WA (perlu login, tapi tidak perlu Layout) */}
          <Route
            path="/isi-whatsapp"
            element={
              <ProtectedRoute>
                <IsiWhatsapp />
              </ProtectedRoute>
            }
          />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Member */}
              <Route path="/jadwal-saya" element={<Placeholder title="Jadwal Saya" />} />
              <Route path="/absensi" element={<Placeholder title="Absensi" />} />
              <Route path="/upload-link" element={<Placeholder title="Upload Link" />} />

              {/* Admin */}
              <Route element={<ProtectedRoute requireRole="admin" />}>
                <Route path="/admin/members" element={<Placeholder title="Kelola Anggota" />} />
                <Route path="/admin/schedule" element={<Placeholder title="Generate Jadwal" />} />
                <Route path="/admin/reports" element={<Placeholder title="Laporan" />} />
              </Route>
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
