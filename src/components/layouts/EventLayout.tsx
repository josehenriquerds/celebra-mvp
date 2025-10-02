'use client'

import {
  LayoutDashboard,
  Users,
  CheckSquare,
  TableProperties,
  Store,
  BarChart3,
  Clock,
  Filter,
  Settings,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type ReactNode, useState } from 'react'
import { Button } from '@/components/ui/button'

interface EventLayoutProps {
  children: ReactNode
  eventId: string
  eventName: string
}

const navigation = [
  { name: 'Dashboard', href: '', icon: LayoutDashboard },
  { name: 'Convidados', href: '/guests', icon: Users },
  { name: 'Tarefas', href: '/tasks', icon: CheckSquare },
  { name: 'Mesas', href: '/tables', icon: TableProperties },
  { name: 'Fornecedores', href: '/vendors', icon: Store },
  { name: 'Relatórios', href: '/reports', icon: BarChart3 },
  { name: 'Timeline', href: '/timeline', icon: Clock },
  { name: 'Segmentos', href: '/segments', icon: Filter },
  { name: 'Configurações', href: '/settings', icon: Settings },
]

const mobileNavigation = [
  { name: 'Visão', href: '', icon: LayoutDashboard },
  { name: 'Convidados', href: '/guests', icon: Users },
  { name: 'Tarefas', href: '/tasks', icon: CheckSquare },
  { name: 'Mais', href: '/more', icon: Menu },
]

export function EventLayout({ children, eventId, eventName }: EventLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    const fullPath = `/events/${eventId}${href}`
    return pathname === fullPath
  }

  return (
    <div className="min-h-screen bg-[#FAF7F4]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex grow flex-col border-r border-neutral-200 bg-white">
          {/* Logo/Header */}
          <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-6">
            <Link href="/events" className="flex items-center gap-2">
              <ChevronLeft className="size-5 text-neutral-600" />
              <span className="text-sm font-medium text-neutral-600">Eventos</span>
            </Link>
          </div>

          {/* Event Name */}
          <div className="border-b border-neutral-200 px-6 py-4">
            <h2 className="truncate text-lg font-semibold text-neutral-900">{eventName}</h2>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navigation.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={`/events/${eventId}${item.href}`}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    active
                      ? 'bg-[#863F44] text-white shadow-md'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <item.icon className="size-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transition-transform duration-300 md:hidden${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-6">
            <h2 className="text-lg font-semibold text-neutral-900">Menu</h2>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="size-5" />
            </Button>
          </div>

          {/* Event Name */}
          <div className="border-b border-neutral-200 px-6 py-4">
            <h3 className="text-sm font-medium text-neutral-600">Evento atual</h3>
            <p className="mt-1 truncate text-lg font-semibold text-neutral-900">{eventName}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navigation.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={`/events/${eventId}${item.href}`}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    active
                      ? 'bg-[#863F44] text-white shadow-md'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <item.icon className="size-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 md:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="size-5" />
          </Button>

          <div className="ml-auto flex items-center gap-4">
            {/* User Avatar */}
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-[#863F44] text-sm font-medium text-white">
                U
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-8">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white md:hidden">
        <div className="grid grid-cols-4">
          {mobileNavigation.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.name}
                href={`/events/${eventId}${item.href}`}
                className={`flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                  active ? 'text-[#863F44]' : 'text-neutral-600'
                }`}
              >
                <item.icon className="size-6" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
