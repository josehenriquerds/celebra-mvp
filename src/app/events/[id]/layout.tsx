'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Users,
  CheckSquare,
  UserCog,
  Utensils,
  TrendingUp,
  Settings,
  Menu,
  X,
  Gift,
  ClipboardCheck,
  FileBarChart,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as React from 'react'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/app/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface EventLayoutProps {
  children: React.ReactNode
  params: { id: string }
}

type Item = { name: string; href: string; icon: React.ElementType }

const navigation: Item[] = [
  { name: 'Visão Geral', href: '', icon: Home },
  { name: 'Convidados', href: '/guests', icon: Users },
  { name: 'Tarefas', href: '/tasks', icon: CheckSquare },
  { name: 'Fornecedores', href: '/vendors', icon: UserCog },
  { name: 'Mesas', href: '/tables', icon: Utensils },
  { name: 'Presentes', href: '/gifts', icon: Gift },
  { name: 'Check-in', href: '/checkin', icon: ClipboardCheck },
  { name: 'Relatórios', href: '/reports', icon: TrendingUp },
  { name: 'Exportações', href: '/exports', icon: FileBarChart },
  { name: 'Timeline', href: '/timeline', icon: Clock },
  { name: 'Segmentos', href: '/segments', icon: Filter },
  { name: 'Configurações', href: '/settings', icon: Settings },
]

export default function EventLayout({ children, params }: EventLayoutProps) {
  const pathname = usePathname()
  const eventId = params.id

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [pinned, setPinned] = React.useState(false) // “fixar” a sidebar expandida no desktop
  const [hovering, setHovering] = React.useState(false)

  const isActive = React.useCallback(
    (href: string) => {
      const full = `/events/${eventId}${href}`
      return href === '' ? pathname === full : pathname?.startsWith(full)
    },
    [pathname, eventId]
  )

  const collapsed = !(pinned || hovering) // colapsa por padrão; expande ao hover ou se “fixar”
  const width = collapsed ? 80 : 264

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-dvh bg-[#FAF7F4] text-[var(--ink)]">
        {/* --- Desktop Sidebar (rail pastel + pill) --- */}
        <aside
          className="fixed inset-y-0 left-0 z-50 hidden lg:block"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          {/* camada de fundo (coral/peach) que remete às referências */}
          <div className="absolute inset-y-6 -left-6 w-24 rounded-3xl bg-pastel-peach-200/70 blur-[1px]" />
          <motion.div
            layout
            style={{ width }}
            className={cn(
              'relative my-6 mr-4 h-[calc(100dvh-3rem)] rounded-3xl',
              'border border-black/5 bg-white/80 shadow-elevation-2 backdrop-blur-sm'
            )}
          >
            {/* header do rail */}
            <div className="flex items-center justify-between px-3 pb-2 pt-3">
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1"
                >
                  <h1 className="font-heading text-celebre-brand text-xl font-bold">Celebre</h1>
                  <p className="mt-0.5 text-xs text-celebre-muted">Gestão de Eventos</p>
                </motion.div>
              )}
              <motion.button
                onClick={() => setPinned(!pinned)}
                aria-pressed={pinned}
                aria-label={pinned ? 'Retrair menu' : 'Expandir menu'}
                className={cn(
                  'rounded-xl p-2 text-xs font-medium transition-all',
                  'border border-black/5 bg-white/70 shadow-sm hover:bg-white',
                  'hover:shadow-md active:scale-95'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {collapsed ? (
                  <ChevronRight className="size-4" />
                ) : (
                  <ChevronLeft className="size-4" />
                )}
              </motion.button>
            </div>

            {/* nav */}
            <nav
              aria-label="Navegação Principal"
              className="custom-scrollbar mt-2 h-[calc(100vh-12rem)] overflow-y-auto overflow-x-hidden"
            >
              <ul className="space-y-0.5 px-2">
                {navigation.map((item) => {
                  const href = `/events/${eventId}${item.href}`
                  const active = isActive(item.href)
                  return (
                    <SidebarItem
                      key={item.name}
                      item={item}
                      href={href}
                      active={!!active}
                      collapsed={collapsed}
                    />
                  )
                })}
              </ul>
            </nav>

            {/* rodapé utilitário */}
            <div className="absolute inset-x-0 bottom-3 px-3">
              <motion.div
                className={cn(
                  'rounded-2xl border border-black/5 bg-gradient-to-br from-white to-pastel-mint-50',
                  'shadow-[0_6px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)]',
                  'flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-all'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-pastel-mint-200 to-pastel-mint-300">
                  <span className="text-celebre-brand text-sm font-bold">J</span>
                </div>
                {!collapsed && (
                  <motion.div
                    className="min-w-0 flex-1 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <p className="truncate font-semibold leading-none text-celebre-ink">Jack</p>
                    <p className="mt-0.5 text-xs text-celebre-muted">Organizador</p>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </aside>

        {/* --- Mobile header --- */}
        <div className="sticky top-0 z-40 flex items-center gap-x-6 border-b border-border bg-white px-4 py-3 shadow-sm lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-foreground"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="size-6" />
          </button>
          <div className="flex-1 text-sm font-semibold leading-6">Celebre</div>
        </div>

        {/* --- Mobile Drawer --- */}
        {mobileMenuOpen && (
          <div className="relative z-50 lg:hidden" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-white px-6 pb-6 pt-4 shadow-elevation-4">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-primary">Menu</span>
                <button
                  className="-m-2.5 rounded-md p-2.5"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Fechar menu"
                >
                  <X className="size-6" />
                </button>
              </div>
              <nav className="mt-6">
                <ul className="space-y-2">
                  {navigation.map((item) => {
                    const href = `/events/${eventId}${item.href}`
                    const active = isActive(item.href)
                    return (
                      <li key={item.name}>
                        <Link
                          href={href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium',
                            active
                              ? 'bg-primary text-white'
                              : 'text-muted-foreground hover:bg-[#FAF7F4] hover:text-foreground'
                          )}
                        >
                          <item.icon className={cn('h-5 w-5', active && 'text-white')} />
                          {item.name}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </nav>
            </div>
          </div>
        )}

        {/* --- Main content --- */}
        <main className="lg:pl-[264px]">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>

        {/* --- Mobile bottom navigation --- */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 shadow-elevation-2 backdrop-blur-lg supports-[backdrop-filter]:bg-white/80 lg:hidden">
          <nav className="grid grid-cols-5 px-2">
            {navigation.slice(0, 5).map((item) => {
              const href = `/events/${eventId}${item.href}`
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={href}
                  className={cn(
                    'relative flex flex-col items-center gap-1 px-2 py-2.5 text-[10px] font-medium transition-all',
                    active ? 'text-celebre-brand' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="mobile-indicator"
                      className="bg-celebre-brand absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon
                    className={cn(
                      'h-5 w-5 transition-transform',
                      active && 'text-celebre-brand scale-110'
                    )}
                  />
                  <span className="w-full truncate text-center">{item.name.split(' ')[0]}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </TooltipProvider>
  )
}

/* ---------- Subcomponentes ---------- */

function SidebarItem({
  item,
  href,
  active,
  collapsed,
}: {
  item: Item
  href: string
  active: boolean
  collapsed: boolean
}) {
  const Icon = item.icon

  const link = (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl px-3 py-2 transition-all duration-200',
        active
          ? 'text-celebre-brand font-semibold'
          : 'text-[var(--ink)]/60 hover:bg-white/50 hover:text-[var(--ink)]'
      )}
    >
      {/* pill animada do item ativo */}
      <AnimatePresence>
        {active && (
          <motion.span
            layoutId="sb-pill"
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-pastel-peach-200 to-pastel-peach-100 shadow-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.1, rotate: active ? 0 : 5 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      >
        <Icon
          className={cn(
            'relative z-10 size-5 shrink-0 transition-colors',
            active && 'text-celebre-brand'
          )}
        />
      </motion.div>

      {!collapsed && (
        <motion.span
          className="relative z-10 truncate text-sm"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          {item.name}
        </motion.span>
      )}
    </Link>
  )

  return (
    <li>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right">{item.name}</TooltipContent>
        </Tooltip>
      ) : (
        link
      )}
    </li>
  )
}
