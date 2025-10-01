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
    <aside className="fixed h-screen w-64 border-r border-border bg-[var(--celebre-bg)] px-6 py-8">
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
                  className="absolute bottom-0 left-0 top-0 w-1 rounded bg-primary"
                />
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
