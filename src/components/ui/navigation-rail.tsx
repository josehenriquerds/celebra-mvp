'use client'

import { type LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as React from 'react'
import { cn } from '@/lib/utils'

export interface NavItem {
  icon: LucideIcon
  label: string
  href: string
  badge?: number
}

export interface NavSection {
  id: string
  label: string
  items: NavItem[]
}

interface NavigationRailProps {
  sections: NavSection[]
  className?: string
}

const NavigationRail = React.forwardRef<HTMLElement, NavigationRailProps>(
  ({ sections, className }, ref) => {
    const pathname = usePathname()
    const [activeSection, setActiveSection] = React.useState(sections[0]?.id)

    return (
      <aside
        ref={ref}
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen',
          'transition-all duration-300',
          className
        )}
      >
        {/* Rail principal (ícones) */}
        <div className="flex w-20 flex-col items-center gap-4 border-r border-pastel-lavender-100 bg-white/80 py-6 shadow-elevation-2 backdrop-blur-xl">
          {sections.map((section) => {
            const isActive = activeSection === section.id
            const Icon = section.items[0].icon

            return (
              <motion.button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'transition-smooth relative flex h-12 w-12 items-center justify-center rounded-2xl',
                  isActive
                    ? 'bg-gradient-to-br from-pastel-lavender-400 to-pastel-lavender-500 text-white shadow-elevation-2'
                    : 'text-celebre-muted hover:bg-pastel-lavender-50 hover:text-pastel-lavender-600'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                aria-label={section.label}
              >
                <Icon className="size-5" />
              </motion.button>
            )
          })}
        </div>

        {/* Sub-menu conectado */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{
            width: activeSection ? 240 : 0,
            opacity: activeSection ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden border-r border-pastel-lavender-50 bg-white/90 shadow-elevation-1 backdrop-blur-xl"
        >
          <div className="flex h-full flex-col px-4 py-6">
            {sections.map((section) => {
              if (section.id !== activeSection) return null

              return (
                <div key={section.id} className="space-y-2">
                  <p className="mb-4 px-4 text-xs font-semibold uppercase tracking-wider text-celebre-muted">
                    {section.label}
                  </p>
                  {section.items.map((item) => {
                    const isItemActive = pathname === item.href
                    const ItemIcon = item.icon

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'transition-smooth focus-ring flex items-center gap-3 rounded-2xl px-4 py-3',
                          isItemActive
                            ? 'bg-pastel-lavender-100 font-medium text-pastel-lavender-700 shadow-elevation-1'
                            : 'text-celebre-muted hover:bg-pastel-lavender-50 hover:text-celebre-ink'
                        )}
                      >
                        <ItemIcon className="size-5 shrink-0" />
                        <span className="text-sm">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-pastel-coral-400 px-1.5 text-xs font-semibold text-white">
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </motion.div>
      </aside>
    )
  }
)
NavigationRail.displayName = 'NavigationRail'

export { NavigationRail }
