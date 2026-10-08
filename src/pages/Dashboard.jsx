import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { Calendar, Camera, Link2, TrendingUp } from 'lucide-react'

const stats = [
  { label: 'Jadwal Minggu Ini', value: '—', icon: Calendar, color: 'from-blue-500 to-blue-600' },
  { label: 'Absensi Bulan Ini', value: '—', icon: Camera, color: 'from-emerald-500 to-emerald-600' },
  { label: 'Link Terupload', value: '—', icon: Link2, color: 'from-amber-500 to-orange-600' },
  { label: 'Kepatuhan', value: '—', icon: TrendingUp, color: 'from-purple-500 to-pink-600' },
]

export default function Dashboard() {
  const { profile, isAdmin } = useAuth()

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-br from-brand-500 to-brand-700 text-white border-none"
      >
        <h1 className="text-2xl font-extrabold mb-1">
          Selamat datang, {profile?.full_name}!
        </h1>
        <p className="text-brand-100 text-sm">
          {isAdmin
            ? 'Kelola anggota, jadwal sebar, dan pantau laporan di sini.'
            : 'Jangan lupa lengkapi absensi & upload 3 link hari ini ya!'}
        </p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-md`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs text-slate-400 font-medium">{s.label}</p>
              <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{s.value}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="card">
        <h2 className="font-bold text-slate-800 mb-2">🚧 Coming Soon</h2>
        <p className="text-sm text-slate-500">
          Fitur lengkap akan diisi di tahap berikutnya.
        </p>
      </div>
    </div>
  )
}
