import { motion } from 'framer-motion'
import { type ReactNode } from 'react'

interface QuickActionButtonProps {
  icon: ReactNode
  children: ReactNode
  onClick?: () => void
}

export default function QuickActionButton({ icon, children, onClick }: QuickActionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="flex items-center gap-2 rounded-full bg-[#FFF9F9] px-4 py-2 font-medium text-[#863F44] shadow-sm transition-colors hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#F3F0FF]"
    >
      {icon}
      {children}
    </motion.button>
  )
}
