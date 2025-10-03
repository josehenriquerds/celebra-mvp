import { motion } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { MobileBottomNavProps } from "./types"

export function MobileBottomNav({ items, eventId, isActive }: MobileBottomNavProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/95 shadow-lg backdrop-blur-xl lg:hidden">
      <nav className="grid grid-cols-5">
        {items.map((item) => {
          const href = `/events/${eventId}${item.href}`
          const active = isActive(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={href}
              className={cn(
                "relative flex flex-col items-center gap-1 px-2 py-2.5 text-[10px] font-medium transition",
                active ? "text-[var(--sidebar-primary)]" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active ? (
                <motion.span
                  layoutId="mobileActive"
                  className="absolute left-1/2 top-0 h-1 w-8 -translate-x-1/2 rounded-full bg-[var(--sidebar-primary)]"
                />
              ) : null}
              <Icon className={cn("h-5 w-5", active && "scale-110")} />
              <span className="truncate">{item.name.split(" ")[0]}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
