import type { ReactNode, ElementType } from 'react'

export type SidebarItem = {
  name: string
  href: string
  icon: ElementType
}

export interface SidebarTheme {
  accent: string
  accentStrong: string
  primary: string
  surface: string
  ink: string
}

export interface SidebarState {
  expanded: boolean
  railWidth: number
  theme: SidebarTheme
  onTogglePinned: () => void
  onHoverChange: (value: boolean) => void
}

export interface DesktopRailProps {
  items: SidebarItem[]
  eventId: string
  initials: string
  isActive: (href: string) => boolean
  state: SidebarState
}

export interface MobileNavProps {
  items: SidebarItem[]
  eventId: string
  isActive: (href: string) => boolean
  open: boolean
  setOpen: (value: boolean) => void
}

export interface MobileBottomNavProps {
  items: SidebarItem[]
  eventId: string
  isActive: (href: string) => boolean
}
