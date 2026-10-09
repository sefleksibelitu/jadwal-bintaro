import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import IsiWhatsapp from './pages/isiWhatsapp'
import { JadwalSaya, Absensi, UploadLink, KelolaAnggota, GenerateJadwal, Laporan } from './pages/Features'

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
              <Route path="/jadwal-saya" element={<JadwalSaya />} />
              <Route path="/absensi" element={<Absensi />} />
              <Route path="/upload-link" element={<UploadLink />} />

              {/* Admin */}
              <Route element={<ProtectedRoute requireRole="admin" />}>
                <Route path="/admin/members" element={<KelolaAnggota />} />
                <Route path="/admin/schedule" element={<GenerateJadwal />} />
                <Route path="/admin/reports" element={<Laporan />} />
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
