import { motion } from 'framer-motion'

export default function Loading({ text = 'Memuat...' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full"
      />
      <p className="text-slate-500 font-medium">{text}</p>
    </div>
  )
}
