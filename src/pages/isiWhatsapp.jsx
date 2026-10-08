import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Phone, MapPin, CheckCircle2 } from 'lucide-react'
import Swal from 'sweetalert2'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { normalizePhone } from '../lib/whatsapp'

export default function IsiWhatsapp() {
  const { user, refreshProfile } = useAuth()
  const [wa, setWa] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    const normalized = normalizePhone(wa)

    if (normalized.length < 10 || normalized.length > 15) {
      Swal.fire({
        icon: 'error',
        title: 'Nomor tidak valid',
        text: 'Masukkan nomor WhatsApp yang benar (contoh: 08123456789)',
      })
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ whatsapp: normalized })
        .eq('id', user.id)

      if (error) throw error

      await refreshProfile()

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Nomor WhatsApp tersimpan 🎉',
        timer: 1500,
        showConfirmButton: false,
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal menyimpan',
        text: err.message || 'Coba lagi',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-brand-300/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-sunny-400/30 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-white shadow-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-sunny-500 flex items-center justify-center shadow-xl">
              <Phone className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-center text-slate-800 mb-1">
            Selamat Datang!
          </h1>
          <p className="text-center text-slate-500 text-sm mb-8">
            Sebelum mulai, isi nomor WhatsApp kamu dulu ya.<br />
            Nomor ini dipakai admin untuk mengirim reminder.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nomor WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  value={wa}
                  onChange={(e) => setWa(e.target.value)}
                  placeholder="08123456789"
                  required
                  className="input pl-11"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                Boleh format 08xxx atau 628xxx
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Simpan & Lanjut
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
