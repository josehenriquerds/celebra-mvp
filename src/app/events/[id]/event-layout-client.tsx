'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
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
  Calendar,
  LayoutGrid,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as React from 'react'
import {
  TooltipProvider,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { SidebarNavItem } from './sidebar-item'

type Item = SidebarNavItem & { href: string }

const livelyGradient = 'from-[#fcb3c1] via-[#fcb3c1] to-[#fcb3c1]'
const livelyGlow = 'shadow-[0_22px_55px_rgba(7, 7, 7, 0.25)]'
const livelyAccent = 'bg-[#fa96cb]'

const EventSwitcher = dynamic(
  () => import('@/components/auth/EventSwitcher').then((mod) => mod.EventSwitcher),
  {
    loading: () => (
      <div
        className="h-12 w-full animate-pulse rounded-2xl bg-white/60"
        role="status"
        aria-label="Carregando eventos"
      />
    ),
    ssr: false,
  }
)

const SidebarItem = dynamic(() => import('./sidebar-item'), {
  ssr: false,
  loading: () => <li className="h-14 w-full animate-pulse rounded-2xl bg-white/40" />,
})

const navigation: Item[] = [
  { name: 'Visão Geral', href: '', icon: Home },
  { name: 'Calendário', href: '/calendar', icon: Calendar },
  { name: 'Convidados', href: '/guests', icon: Users },
  { name: 'Tarefas', href: '/tasks', icon: CheckSquare },
  { name: 'Fornecedores', href: '/vendors', icon: UserCog },
  { name: 'Mesas', href: '/tables', icon: Utensils },
  { name: 'Presentes', href: '/gifts', icon: Gift },
  { name: 'Check-in', href: '/checkin', icon: ClipboardCheck },
  { name: 'Gerar Cartelas', href: '/bingo', icon: LayoutGrid },
  { name: 'Relatórios', href: '/reports', icon: TrendingUp },
  { name: 'Exportações', href: '/exports', icon: FileBarChart },
  { name: 'Timeline', href: '/timeline', icon: Clock },
  { name: 'Segmentos', href: '/segments', icon: Filter },
  { name: 'Configurações', href: '/settings', icon: Settings },
]

export function EventLayoutClient({ children, eventId }: { children: React.ReactNode; eventId: string }) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()

  // Drawer mobile
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  // Rail desktop
  const [pinned, setPinned] = React.useState(false)   // fixa expandida
  const [hovering, setHovering] = React.useState(false)
  const [viewportWidth, setViewportWidth] = React.useState(0)

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const handleResize = () => setViewportWidth(window.innerWidth)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isActive = React.useCallback(
    (href: string) => {
      const full = `/events/${eventId}${href}`
      return href === '' ? pathname === full : pathname?.startsWith(full)
    },
    [pathname, eventId]
  )

  // Colapsa por padrão; expande ao hover ou se "fixar"
  const collapsed = !(pinned || hovering)
  const expandedWidth = React.useMemo(() => {
    if (viewportWidth >= 1536) return 320
    if (viewportWidth >= 1280) return 292
    if (viewportWidth >= 1024) return 272
    return 248
  }, [viewportWidth])
  const collapsedWidth = React.useMemo(() => (viewportWidth >= 1536 ? 96 : 80), [viewportWidth])
  const width = collapsed ? collapsedWidth : expandedWidth

  const layoutStyle = {
    '--rail-width': `${width}px`,
  } as React.CSSProperties

  return (
    <TooltipProvider delayDuration={120}>
      <div
        className={cn(
          'min-h-dvh',
          // Fundo sem "faixa branca"; use um tom suave pastel de base do produto
          'bg-[hsl(var(--background))]'
        )}
        style={layoutStyle}
      >
        {/* === SIDEBAR DESKTOP (FIXED, tela toda) === */}
        <aside
          className="fixed inset-y-0 left-0 z-50 hidden lg:block"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          aria-label="Barra lateral"
        >
          <motion.div
            layout
            style={{ width }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 520, damping: 28, mass: 0.9 }
            }
            className={cn(
              'relative mr-4 flex h-dvh flex-col overflow-hidden',
              'rounded-r-[36px] rounded-l-none border border-white/40',
              'bg-white/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/60',
              'pb-5 pt-4',
              livelyGlow
            )}
          >
            {/* Header do rail */}
            <div className="flex items-center justify-center rounded-2xl px-1.5 pb-1 pt-1.5">
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.div
                    key="brand"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="flex min-w-0 flex-1 flex-col"
                  >
                    <h1 className="truncate text-xl font-bold text-foreground">Celebre</h1>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                onClick={() => setPinned(!pinned)}
                aria-pressed={pinned}
                aria-expanded={!collapsed}
                aria-label={pinned ? 'Retrair menu' : 'Expandir e fixar menu'}
                className={cn(
                  'rounded-2xl p-2 text-xs font-semibold transition-all',
                  'border border-white/60 bg-white/80 text-[#ff4f8d]',
                  'shadow-[0_6px_18px_rgba(15,23,42,0.08)] hover:bg-white active:scale-95'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
              >
                {collapsed ? <ChevronRight className="size-5" /> : <ChevronLeft className="size-5" />}
              </motion.button>
            </div>

            {/* Navegação */}
            <div className="mt-4 flex-1">
              <nav
                aria-label="Navegação principal"
                className="flex h-full flex-col px-1"
              >
                <ul className="flex flex-col gap-1">
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
                      gradientClass={livelyGradient}
                      glowClass={livelyGlow}
                    />
                  )
                })}
              </ul>
            </nav>
            </div>

            {/* Usuário */}
            <div className="mt-3 px-1.5">
              <motion.div
                className={cn(
                  'group flex cursor-pointer items-center gap-3 rounded-2xl border border-white/60 px-3.5 py-3',
                  'bg-gradient-to-r from-white via-[#fff5fb] to-[#fff1f8]',
                  'shadow-[0_12px_32px_rgba(15,23,42,0.08)] hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)]'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex size-10 items-center justify-center rounded-2xl bg-[#ffe1ee] ring-1 ring-white/70">
                  <span className="text-base font-bold text-[#ff4f8d]">JH</span>
                </div>

                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.div
                      key="user-info"
                      className="min-w-0 flex-1"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.14, ease: 'easeOut' }}
                    >
                      <p className="truncate text-sm font-semibold leading-none text-foreground">
                        José Henrique
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">Organizador</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.div>
        </aside>

        {/* === TOPBAR MOBILE === */}
        <div className="sticky top-0 z-40 flex items-center gap-x-6 border-b border-border bg-background/95 px-4 py-3 shadow-elevation-1 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
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

        {/* === DRAWER MOBILE === */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                key="scrim"
                className="fixed inset-0 z-50 bg-black/50 lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                key="drawer"
                className="fixed inset-y-0 left-0 z-50 w-full max-w-sm bg-background px-6 pb-6 pt-4 shadow-elevation-4 lg:hidden"
                initial={{ x: -24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -24, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                role="dialog"
                aria-modal="true"
                aria-label="Menu"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-foreground">Menu</span>
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
                              'group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-150',
                              active
                                ? cn('bg-gradient-to-r text-white', livelyGradient, 'shadow-[0_14px_32px_rgba(255,95,143,0.35)]')
                                : 'text-foreground/70 hover:bg-white/70 hover:text-foreground'
                            )}
                          >
                            <item.icon
                              className={cn(
                                'size-5 transition-transform',
                                active ? 'text-white' : 'text-[#ff4f8d] group-hover:text-[#ff2f78]'
                              )}
                            />
                            {item.name}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* === CONTEÚDO === */}
        <main
          className={cn(
            'transition-[padding] duration-300 ease-smooth',
            'pl-0 lg:pl-[calc(var(--rail-width)+1rem)]'
          )}
        >
          <div className="px-4 pb-20 pt-6 sm:px-6 lg:px-8 lg:pb-8">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <EventSwitcher className="w-full lg:max-w-sm" />
            </div>
            {children}
          </div>
        </main>

        {/* === BOTTOM NAV MOBILE (atalhos) === */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 shadow-elevation-2 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
          <nav className="grid grid-cols-5 px-2">
            {navigation.slice(0, 5).map((item) => {
              const href = `/events/${eventId}${item.href}`
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={href}
                  className={cn(
                    'group relative flex flex-col items-center gap-1 px-2 py-2.5 text-[10px] font-semibold transition-all',
                    active ? 'text-[#ff4f8d]' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="mobile-indicator"
                      className={cn(
                        'absolute left-1/2 top-0 h-1 w-10 -translate-x-1/2 rounded-full',
                        livelyAccent
                      )}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon
                    className={cn(
                      'h-5 w-5 transition-transform text-current',
                      active ? 'scale-110' : 'group-hover:scale-105'
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
