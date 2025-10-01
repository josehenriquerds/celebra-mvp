'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface EventLayoutProps {
  children: React.ReactNode;
  params: { id: string };
}

const navigation = [
  { name: 'Visão Geral', href: '', icon: Home },
  { name: 'Convidados', href: '/guests', icon: Users },
  { name: 'Tarefas', href: '/tasks', icon: CheckSquare },
  { name: 'Fornecedores', href: '/vendors', icon: UserCog },
  { name: 'Mesas', href: '/tables', icon: Utensils },
  { name: 'Relatórios', href: '/reports', icon: TrendingUp },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

export default function EventLayout({ children, params }: EventLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const eventId = params.id;

  const isActive = (href: string) => {
    const fullPath = `/events/${eventId}${href}`;
    if (href === '') {
      return pathname === fullPath;
    }
    return pathname?.startsWith(fullPath);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F4]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-border px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-2xl font-bold text-primary">Celebre</h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              {navigation.map((item) => {
                const href = `/events/${eventId}${item.href}`;
                const active = isActive(item.href);
                return (
                  <li key={item.name}>
                    <Link
                      href={href}
                      className={cn(
                        'group flex gap-x-3 rounded-2xl p-3 text-sm font-semibold leading-6 transition-colors',
                        active
                          ? 'bg-primary text-white'
                          : 'text-muted-foreground hover:bg-[#FAF7F4] hover:text-foreground'
                      )}
                    >
                      <item.icon
                        className={cn('h-5 w-5 shrink-0', active && 'text-white')}
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white border-b border-border px-4 py-3 shadow-sm lg:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-foreground lg:hidden"
          onClick={() => setMobileMenuOpen(true)}
        >
          <span className="sr-only">Abrir menu</span>
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex-1 text-sm font-semibold leading-6 text-foreground">
          Celebre
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="relative z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-full overflow-y-auto bg-white px-6 pb-6 sm:max-w-sm sm:ring-1 sm:ring-border">
            <div className="flex items-center justify-between py-4">
              <h1 className="text-2xl font-bold text-primary">Celebre</h1>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Fechar menu</span>
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="mt-6">
              <ul role="list" className="space-y-2">
                {navigation.map((item) => {
                  const href = `/events/${eventId}${item.href}`;
                  const active = isActive(item.href);
                  return (
                    <li key={item.name}>
                      <Link
                        href={href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'group flex gap-x-3 rounded-2xl p-3 text-sm font-semibold leading-6 transition-colors',
                          active
                            ? 'bg-primary text-white'
                            : 'text-muted-foreground hover:bg-[#FAF7F4] hover:text-foreground'
                        )}
                      >
                        <item.icon
                          className={cn('h-5 w-5 shrink-0', active && 'text-white')}
                        />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="lg:pl-72">
        <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>

      {/* Mobile bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border lg:hidden">
        <nav className="flex justify-around">
          {navigation.slice(0, 4).map((item) => {
            const href = `/events/${eventId}${item.href}`;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className={cn('h-5 w-5', active && 'text-primary')} />
                <span>{item.name.split(' ')[0]}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
