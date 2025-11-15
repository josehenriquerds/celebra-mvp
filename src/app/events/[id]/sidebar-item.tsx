'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { ElementType } from 'react'

export type SidebarNavItem = {
  name: string
  icon: ElementType
}

interface SidebarItemProps {
  item: SidebarNavItem
  href: string
  active: boolean
  collapsed: boolean
  gradientClass: string
  glowClass: string
}

export default function SidebarItem({
  item,
  href,
  active,
  collapsed,
  gradientClass,
  glowClass,
}: SidebarItemProps) {
  const Icon = item.icon

  const link = (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex items-center gap-2 rounded-2xl px-5 py-1.5 text-sm font-medium transition-all duration-150',
        active ? 'text-white' : 'text-foreground/70 hover:text-foreground'
      )}
    >
      <AnimatePresence>
        {active && (
          <motion.span
            layoutId="sb-pill"
            className={cn(
              'absolute inset-0 rounded-2xl bg-gradient-to-r',
              gradientClass,
              glowClass,
              'ring-1 ring-white/50'
            )}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ type: 'spring', stiffness: 560, damping: 32 }}
          />
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.07, rotate: active ? 0 : 2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 520, damping: 20 }}
        className="relative z-10 shrink-0"
      >
        <span
          className={cn(
            'inline-grid size-10 place-items-center rounded-2xl transition-colors duration-150',
            active
              ? 'bg-white/15 text-white ring-1 ring-white/60'
              : 'bg-[#fcb8d8] text-[#fff] ring-1 ring-white/70 group-hover:bg-[#ffdced] group-hover:text-[#ff2f78]'
          )}
        >
          <Icon className="size-[22px]" />
        </span>
      </motion.div>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            key="label"
            className="relative z-10 truncate text-sm"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
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
          <TooltipContent side="right" className="bg-foreground text-background">
            {item.name}
          </TooltipContent>
        </Tooltip>
      ) : (
        link
      )}
    </li>
  )
}

