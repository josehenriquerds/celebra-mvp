import { AnimatePresence, motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { NavItem } from "./NavItem"
import { SidebarRailDecor } from "./SidebarRailDecor"
import type { DesktopRailProps } from "./types"

export function DesktopRail({ items, eventId, initials, isActive, state }: DesktopRailProps) {
  const { expanded, railWidth, theme, onTogglePinned, onHoverChange } = state

  return (
    <aside className="pointer-events-none fixed inset-y-0 left-0 z-50 hidden lg:flex">
      <motion.div
        layout
        style={{ width: railWidth }}
        className="pointer-events-auto relative mx-3 my-6 flex h-[calc(100dvh-3rem)]"
        onMouseEnter={() => onHoverChange(true)}
        onMouseLeave={() => onHoverChange(false)}
      >
        <SidebarRailDecor />
        <div className="relative z-10 flex w-full flex-col px-4 py-5">
          <div className="justify_between flex items-center pb-6">
            <AnimatePresence initial={false}>
              {expanded ? (
                <motion.div
                  key="brand"
                  className="mr-auto flex flex-col"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <span className="font-heading text-lg font-semibold" style={{ color: theme.primary }}>
                    Celebre
                  </span>
                  <span className="text-xs" style={{ color: `${theme.ink}99` }}>
                    Planejamento de eventos
                  </span>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <motion.button
              type="button"
              aria-pressed={expanded}
              aria-label={expanded ? "Recolher menu" : "Expandir menu"}
              onClick={onTogglePinned}
              className="ml-auto flex size-9 items-center justify-center rounded-full border border-black/10 bg-white/90 text-[var(--sidebar-ink)] shadow-sm transition hover:bg-white hover:shadow-md"
              whileTap={{ scale: 0.92 }}
            >
              {expanded ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
            </motion.button>
          </div>

          <nav className="flex-1 overflow-y-auto">
            <ul className="flex flex-col gap-2">
              {items.map((item) => {
                const href = `/events/${eventId}${item.href}`
                return (
                  <NavItem
                    key={item.href || item.name}
                    item={item}
                    href={href}
                    active={isActive(item.href)}
                    expanded={expanded}
                  />
                )
              })}
            </ul>
          </nav>

          <div className="mt-6">
            <Link
              href={`/events/${eventId}/settings`}
              className="group flex items-center gap-3 rounded-3xl border border-white/40 bg-white/80 p-3 shadow-sm transition hover:border-white hover:bg-white"
            >
              <div
                className="flex size-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ background: theme.primary }}
              >
                {initials}
              </div>
              <AnimatePresence initial={false}>
                {expanded ? (
                  <motion.div
                    key="footerCopy"
                    className="leading-tight"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-xs" style={{ color: `${theme.ink}99` }}>
                      Tema e personaliza��o
                    </p>
                    <p className="text-sm font-semibold" style={{ color: theme.ink }}>
                      Ajustar experi�ncia
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </Link>
          </div>
        </div>
      </motion.div>
    </aside>
  )
}
