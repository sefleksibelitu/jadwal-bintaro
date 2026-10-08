export function normalizePhone(phone) {
  if (!phone) return ''
  let p = String(phone).replace(/\D/g, '')
  if (p.startsWith('0')) p = '62' + p.slice(1)
  if (p.startsWith('8')) p = '62' + p
  return p
}

export function buildWhatsAppLink(phone, message = '') {
  const normalized = normalizePhone(phone)
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${normalized}${message ? `?text=${encoded}` : ''}`
}

export function buildReminderMessage({ nama, persentase, tanggal }) {
  return `Halo ${nama}, 👋

Reminder dari Tim Bintaro:
Kamu belum melengkapi laporan hari ${tanggal}.
Persentase kepatuhan kamu saat ini: ${persentase}%.

Mohon segera lengkapi:
✅ Absensi sebar
✅ Upload 3 link konten (TikTok/FB/OLX/IG/Threads)

Terima kasih 🙏`
}w
