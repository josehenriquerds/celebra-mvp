import { memo } from "react"

export const SidebarRailDecor = memo(function SidebarRailDecor() {
  return (
    <>
      <div className="absolute inset-0 rounded-[48px] bg-[var(--sidebar-accent)] shadow-[0_24px_80px_rgba(200,136,120,0.35)]" />
      <div className="absolute inset-4 rounded-[44px] bg-white shadow-[0_24px_60px_rgba(20,16,10,0.08)]" />
      <div className="bg-[var(--sidebar-accent)]/90 absolute left-0 top-36 h-24 w-10 -translate-x-1/2 rounded-r-[40px]" />
      <div className="bg-[var(--sidebar-accent)]/90 absolute bottom-36 left-0 h-24 w-10 -translate-x-1/2 rounded-r-[40px]" />
    </>
  )
})
