import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { MobileNavProps } from "./types"

export function MobileNav({ items, eventId, isActive, open, setOpen }: MobileNavProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <motion.div
            className="absolute left-0 top-0 h-full w-4/5 max-w-xs bg-white/95 shadow-2xl"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
          >
            <div className="flex items-center justify-between border-b border-black/10 p-4">
              <span className="font-heading text-base font-semibold text-[var(--sidebar-primary)]">
                Navega��o
              </span>
              <button
                type="button"
                aria-label="Fechar menu"
                onClick={() => setOpen(false)}
                className="rounded-full border border-black/10 bg-white p-2"
              >
                <X className="size-4" />
              </button>
            </div>
            <nav className="space-y-1 px-3 py-4">
              {items.map((item) => {
                const href = `/events/${eventId}${item.href}`
                const active = isActive(item.href)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href || item.name}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition",
                      active
                        ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-primary)]"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="size-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
