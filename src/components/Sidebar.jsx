import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, CalendarPlus, BarChart3, Calendar,
  Camera, Link2, LogOut, X, MapPin,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const adminMenu = [
  { to: '/dashboard',        label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/admin/members',    label: 'Kelola Anggota',  icon: Users },
  { to: '/admin/schedule',   label: 'Generate Jadwal', icon: CalendarPlus },
  { to: '/admin/reports',    label: 'Laporan',         icon: BarChart3 },
]

const memberMenu = [
  { to: '/dashboard',       label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/jadwal-saya',     label: 'Jadwal Saya',  icon: Calendar },
  { to: '/absensi',         label: 'Absensi',      icon: Camera },
  { to: '/upload-link',     label: 'Upload Link',  icon: Link2 },
]

export default function Sidebar({ isOpen, onClose }) {
  const { profile, isAdmin, signOut } = useAuth()
  const menu = isAdmin ? adminMenu : memberMenu

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`
          fixed top-0 left-0 h-full w-72 z-50
          bg-white border-r border-slate-100 shadow-xl
          flex flex-col
          transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header brand */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-sunny-500 flex items-center justify-center shadow-lg">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-800 leading-tight">Tim Bintaro</h1>
              <p className="text-xs text-slate-400">Absensi & Jadwal Sebar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* User info */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold">
              {profile?.full_name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 truncate">{profile?.full_name}</p>
              <p className="text-xs text-slate-400 truncate">
                {isAdmin ? '👑 Admin' : '👤 Anggota'}
              </p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menu.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.to}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <NavLink
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30'
                        : 'text-slate-600 hover:bg-brand-50 hover:text-brand-700'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              </motion.div>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  )
}
