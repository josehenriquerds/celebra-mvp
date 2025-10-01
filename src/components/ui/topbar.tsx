'use client'

import * as React from 'react'
import { Search, Bell, Settings, User } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu'

interface TopbarProps extends React.HTMLAttributes<HTMLElement> {
  searchPlaceholder?: string
  userName?: string
  userEmail?: string
  userAvatar?: string
  notificationCount?: number
}

const Topbar = React.forwardRef<HTMLElement, TopbarProps>(
  ({
    className,
    searchPlaceholder = 'Buscar...',
    userName = 'Usuário',
    userEmail = 'usuario@email.com',
    userAvatar,
    notificationCount = 0,
    ...props
  }, ref) => {
    return (
      <motion.header
        ref={ref}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'sticky top-4 z-30 mx-4',
          'glass rounded-3xl shadow-elevation-2',
          'px-6 py-3',
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Busca */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-celebre-muted" />
              <input
                type="search"
                placeholder={searchPlaceholder}
                className={cn(
                  'w-full h-10 pl-11 pr-4 rounded-2xl',
                  'bg-white/60 border border-pastel-lavender-100',
                  'text-sm text-celebre-ink placeholder:text-celebre-muted',
                  'transition-smooth focus-ring',
                  'focus:bg-white'
                )}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Notificações */}
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-2xl"
              aria-label="Notificações"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-pastel-coral-400 text-xs font-semibold text-white">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Button>

            {/* Configurações */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-2xl"
              aria-label="Configurações"
            >
              <Settings className="h-5 w-5" />
            </Button>

            {/* Perfil */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    'flex items-center gap-3 rounded-2xl px-3 py-2',
                    'bg-white/60 hover:bg-white transition-smooth focus-ring',
                    'border border-pastel-lavender-100'
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pastel-lavender-400 to-pastel-lavender-500 text-white font-semibold text-sm">
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt={userName}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-celebre-ink">
                    {userName}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{userName}</p>
                    <p className="text-xs text-celebre-muted">{userEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Perfil</DropdownMenuItem>
                <DropdownMenuItem>Configurações</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-pastel-coral-600">
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.header>
    )
  }
)
Topbar.displayName = 'Topbar'

export { Topbar }
