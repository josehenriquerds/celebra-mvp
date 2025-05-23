'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiClipboard, FiGift, FiHome, FiSettings, FiUsers } from 'react-icons/fi'

const navItems = [
  { name: 'Início', icon: <FiHome />, href: '/dashboard' },
  { name: 'Tarefas', icon: <FiClipboard />, href: '/dashboard/tarefas' },
  { name: 'Convidados', icon: <FiUsers />, href: '/dashboard/convidados' },
  { name: 'Presentes', icon: <FiGift />, href: '/dashboard/presentes' },
  { name: 'Configurações', icon: <FiSettings />, href: '/dashboard/configuracoes' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="bg-[#FAF5F0] w-64 h-screen px-6 py-8 border-r border-[#EDE6DE] fixed">
      <h1 className="text-2xl font-serif text-[#2D1F1A] mb-10">Celebre</h1>
      <nav className="space-y-4">
        {navItems.map(({ name, icon, href }) => {
          const isActive = pathname === href
          return (
            <Link key={href} href={href} className="block group relative">
              <div className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all
                ${isActive ? 'bg-[#E9D8C7] text-[#2D1F1A]' : 'text-[#6B5E57] hover:bg-[#F3EDE7]'}`}>
                <span className="text-lg">{icon}</span>
                <span className="text-sm font-medium">{name}</span>
              </div>
              {isActive && (
                <motion.div
                  layoutId="activeSidebar"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-[#C67C5A] rounded"
                />
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
