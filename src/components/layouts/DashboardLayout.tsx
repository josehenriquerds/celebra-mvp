'use client'

import {
  Home,
  Users,
  Gift,
  MessageCircle,
  Settings,
  Calendar,
  Heart,
  ClipboardList,
} from 'lucide-react'
import { NavigationRail } from '@/components/ui/navigation-rail'
import { Topbar } from '@/components/ui/topbar'

const navSections = [
  {
    id: 'main',
    label: 'Principal',
    items: [
      { icon: Home, label: 'Dashboard', href: '/dashboard' },
      { icon: Users, label: 'Convidados', href: '/convidados' },
      { icon: Gift, label: 'Presentes', href: '/presentes' },
      { icon: MessageCircle, label: 'Mensagens', href: '/mensagens' },
    ],
  },
  {
    id: 'config',
    label: 'Configurações',
    items: [{ icon: Settings, label: 'Configurações', href: '/configuracoes' }],
  },
]

interface DashboardLayoutProps {
  children: React.ReactNode
  searchPlaceholder?: string
  userName?: string
  userEmail?: string
  notificationCount?: number
}

export function DashboardLayout({
  children,
  searchPlaceholder = 'Buscar...',
  userName = 'Maria Silva',
  userEmail = 'maria@celebre.app',
  notificationCount = 0,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen">
      {/* Navigation Rail */}
      <NavigationRail sections={navSections} />

      {/* Main Content */}
      <div className="ml-20 transition-all duration-300 lg:ml-[260px]">
        {/* Topbar */}
        <Topbar
          searchPlaceholder={searchPlaceholder}
          userName={userName}
          userEmail={userEmail}
          notificationCount={notificationCount}
        />

        {/* Content Area */}
        <main className="container-8pt py-8">{children}</main>
      </div>
    </div>
  )
}
