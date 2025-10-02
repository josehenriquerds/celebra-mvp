import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { SidebarItem } from "./types"

interface NavItemProps {
  item: SidebarItem
  href: string
  active: boolean
  expanded: boolean
}

export function NavItem({ item, href, active, expanded }: NavItemProps) {
  const Icon = item.icon
  const content = (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 overflow-hidden rounded-2xl px-3 py-2 transition-all duration-200",
        active
          ? "text-[var(--sidebar-primary)]"
          : "text-[color:var(--sidebar-ink)/0.6] hover:text-[var(--sidebar-ink)]"
      )}
    >
      <AnimatePresence initial={false}>
        {active ? (
          <motion.span
            key="active-pill"
            layoutId="sidebarActiveRow"
            className="bg-[var(--sidebar-accent)]/80 absolute inset-0 rounded-2xl shadow-[0_18px_40px_rgba(167,121,106,0.32)]"
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
          />
        ) : null}
      </AnimatePresence>

      <motion.span
        layout
        className={cn(
          "relative z-10 flex h-11 w-11 items-center justify-center rounded-2xl transition-colors duration-200",
          active
            ? "bg-white text-[var(--sidebar-primary)] shadow-sm"
            : "bg-white/55 text-[color:var(--sidebar-ink)/0.45] group-hover:bg-white/80 group-hover:text-[var(--sidebar-primary)]"
        )}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <Icon className="size-5" />
      </motion.span>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.span
            key="label"
            className="relative z-10 truncate text-sm font-medium"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {item.name}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </Link>
  )

  if (expanded) {
    return <li>{content}</li>
  }

  return (
    <li>
      <Tooltip delayDuration={120}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          {item.name}
        </TooltipContent>
      </Tooltip>
    </li>
  )
}
