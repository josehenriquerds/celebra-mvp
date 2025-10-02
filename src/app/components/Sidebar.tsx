'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
    <aside
      className="w-full border-b border-border bg-[var(--celebre-bg)] px-4 py-6 md:sticky md:top-0 md:h-screen md:w-64 md:border-b-0 md:border-r md:px-6 md:py-8"
    >
      <h1 className="font-heading mb-10 text-2xl text-[var(--celebre-ink)]">Celebre</h1>
      <nav className="space-y-4">
        {navItems.map(({ name, icon, href }) => {
          const isActive = pathname === href
          return (
            <Link key={href} href={href} className="group relative block">
              <div
                className={`flex items-center gap-3 rounded-xl px-4 py-2 transition-all ${isActive ? 'bg-accent text-[var(--celebre-ink)]' : 'text-muted-foreground hover:bg-muted'}`}
              >
                <span className="text-lg">{icon}</span>
                <span className="text-sm font-medium">{name}</span>
              </div>
              {isActive && (
                <motion.div
                  layoutId="activeSidebar"
                  className="absolute inset-y-0 left-0 w-1 rounded bg-primary"
                />
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
