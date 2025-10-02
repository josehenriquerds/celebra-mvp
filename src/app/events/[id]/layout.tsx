'use client'
import * as React from 'react'
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
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'



// ⚠️ Corrige o import do shadcn (normalmente é este caminho)
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface EventLayoutProps {
  children: React.ReactNode
  params: { id: string }
}

type Item = { name: string; href: string; icon: React.ElementType }

const navigation: Item[] = [
  { name: 'Visão Geral', href: '', icon: Home },
  { name: 'Calendário', href: '/calendar', icon: Calendar },
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
  const prefersReducedMotion = useReducedMotion()

  // Drawer mobile
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  // Rail desktop
  const [pinned, setPinned] = React.useState(false)   // fixa expandida
  const [hovering, setHovering] = React.useState(false)

  const isActive = React.useCallback(
    (href: string) => {
      const full = `/events/${eventId}${href}`
      return href === '' ? pathname === full : pathname?.startsWith(full)
    },
    [pathname, eventId]
  )

  // Colapsa por padrão; expande ao hover ou se “fixar”
  const collapsed = !(pinned || hovering)
  const width = collapsed ? 80 : 268

  const layoutStyle = {
    '--rail-width': `${width}px`,
  } as React.CSSProperties

  return (
    <TooltipProvider delayDuration={120}>
      <div
        className={cn(
          'min-h-dvh',
          // Fundo sem “faixa branca”; use um tom suave pastel de base do produto
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
          {/* Glow pastel atrás do rail (sem bloco branco) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-10 -left-6 w-24 rounded-3xl bg-pastel-peach-200/60 blur-[2px]"
          />

          <motion.div
            layout
            style={{ width }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 380, damping: 32 }
            }
            className={cn(
              'relative my-6 mr-4 h-[calc(100dvh-3rem)]',
              'rounded-3xl border border-black/5',
              // Vidro suave (sem placa branca sólida)
              'bg-white/60 shadow-glass backdrop-blur-lg supports-[backdrop-filter]:bg-white/45'
            )}
          >
            {/* Header do rail */}
            <div className="flex items-center justify-between px-3 pb-2 pt-3">
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
                    <span className="mt-0.5 text-xs text-muted-foreground">Gestão de Eventos</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                onClick={() => setPinned(!pinned)}
                aria-pressed={pinned}
                aria-expanded={!collapsed}
                aria-label={pinned ? 'Retrair menu' : 'Expandir e fixar menu'}
                className={cn(
                  'rounded-xl p-2 text-xs font-medium transition-all',
                  'border border-black/5 bg-white/70 shadow-sm hover:bg-white',
                  'hover:shadow-md active:scale-95'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
              >
                {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
              </motion.button>
            </div>

            {/* Navegação */}
            <nav
              aria-label="Navegação Principal"
              className="custom-scrollbar mt-1 h-[calc(100%-7.25rem)] overflow-y-auto overflow-x-hidden px-2 pb-16"
            >
              <ul className="space-y-0.5">
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

            {/* Usuário (rodapé) */}
            <div className="absolute inset-x-0 bottom-3 px-3">
              <motion.div
                className={cn(
                  'group flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5',
                  'border border-black/5 bg-gradient-to-br from-white/80 to-pastel-mint-50/80',
                  'shadow-[0_6px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.10)]'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex size-9 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/20">
                  <span className="text-sm font-bold text-primary">JH</span>
                </div>

                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.div
                      key="user-info"
                      className="min-w-0 flex-1"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
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
                              'group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium',
                              active
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground'
                            )}
                          >
                            <item.icon className={cn('h-5 w-5', active && 'text-primary-foreground')} />
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
          <div className="px-4 pb-20 pt-6 sm:px-6 lg:px-8 lg:pb-8">{children}</div>
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
                    'relative flex flex-col items-center gap-1 px-2 py-2.5 text-[10px] font-medium transition-all',
                    active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="mobile-indicator"
                      className="absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon
                    className={cn(
                      'h-5 w-5 transition-transform',
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

/* ======= SUBCOMPONENTES ======= */

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
          ? 'font-semibold text-foreground'
          : 'text-foreground/70 hover:text-foreground'
      )}
    >
      {/* Pílula do item ativo, acompanhando o tema */}
      <AnimatePresence>
        {active && (
          <motion.span
            layoutId="sb-pill"
            className="absolute inset-0 rounded-xl bg-primary/10 ring-1 ring-primary/15"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          />
        )}
      </AnimatePresence>

      {/* Ícone com “bolha” que muda de cor conforme o tema */}
      <motion.div
        whileHover={{ scale: 1.06, rotate: active ? 0 : 3 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 420, damping: 18 }}
        className="relative z-10"
      >
        <span
          className={cn(
            'inline-grid size-8 place-items-center rounded-lg',
            active
              ? 'bg-primary/15 text-primary ring-1 ring-primary/20'
              : 'bg-transparent text-foreground/80 group-hover:bg-primary/10 group-hover:text-primary'
          )}
        >
          <Icon className="size-[18px]" />
        </span>
      </motion.div>

      {/* Label visível só quando expandida */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            key="label"
            className="relative z-10 truncate text-sm"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
          >
            {item.name}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  )

  return (
    <li>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent
            side="right"
            className="bg-foreground text-background"
          >
            {item.name}
          </TooltipContent>
        </Tooltip>
      ) : (
        link
      )}
    </li>
  )
}
