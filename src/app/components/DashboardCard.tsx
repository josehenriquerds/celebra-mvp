'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FiClipboard, FiUsers, FiDollarSign, FiMessageCircle } from 'react-icons/fi'

interface Props {
  title: string
  value?: string
  description: string
  color: 'peach' | 'mint' | 'coral' | 'neutral'
  href: string
  icon?: 'task' | 'guest' | 'budget' | 'chat'
}

const colors = {
  peach: 'bg-[#FBECE5] text-[#C67C5A]',
  mint: 'bg-[#E8F5E9] text-[#6E9277]',
  coral: 'bg-[#FDECE0] text-[#D88462]',
  neutral: 'bg-[#F4F1EE] text-[#6B5E57]',
}

const icons = {
  task: <FiClipboard />,
  guest: <FiUsers />,
  budget: <FiDollarSign />,
  chat: <FiMessageCircle />,
}

export default function DashboardCard({ title, value, description, color, href, icon = 'task' }: Props) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.03 }}
        className={`p-6 rounded-2xl shadow-sm transition-all cursor-pointer ${colors[color]}`}
      >
        <div className="flex items-center gap-4 mb-3 text-2xl">
          <div>{icons[icon]}</div>
          <h3 className="font-serif font-semibold">{title}</h3>
        </div>
        {value && <p className="text-3xl font-bold mb-1">{value}</p>}
        <p className="text-sm">{description}</p>
      </motion.div>
    </Link>
  )
}
