'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  TableProperties,
  Store,
  BarChart3,
  Clock,
  Filter,
  Settings,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EventLayoutProps {
  children: ReactNode;
  eventId: string;
  eventName: string;
}

const navigation = [
  { name: 'Dashboard', href: '', icon: LayoutDashboard },
  { name: 'Convidados', href: '/guests', icon: Users },
  { name: 'Tarefas', href: '/tasks', icon: CheckSquare },
  { name: 'Mesas', href: '/tables', icon: TableProperties },
  { name: 'Fornecedores', href: '/vendors', icon: Store },
  { name: 'Relatórios', href: '/reports', icon: BarChart3 },
  { name: 'Timeline', href: '/timeline', icon: Clock },
  { name: 'Segmentos', href: '/segments', icon: Filter },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

const mobileNavigation = [
  { name: 'Visão', href: '', icon: LayoutDashboard },
  { name: 'Convidados', href: '/guests', icon: Users },
  { name: 'Tarefas', href: '/tasks', icon: CheckSquare },
  { name: 'Mais', href: '/more', icon: Menu },
];

export function EventLayout({ children, eventId, eventName }: EventLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    const fullPath = `/events/${eventId}${href}`;
    return pathname === fullPath;
  };

  return (
    <div className="min-h-screen bg-[#FAF7F4]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-neutral-200">
          {/* Logo/Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-neutral-200">
            <Link href="/events" className="flex items-center gap-2">
              <ChevronLeft className="w-5 h-5 text-neutral-600" />
              <span className="text-sm font-medium text-neutral-600">Eventos</span>
            </Link>
          </div>

          {/* Event Name */}
          <div className="px-6 py-4 border-b border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900 truncate">
              {eventName}
            </h2>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={`/events/${eventId}${item.href}`}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    active
                      ? 'bg-[#863F44] text-white shadow-md'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900">Menu</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Event Name */}
          <div className="px-6 py-4 border-b border-neutral-200">
            <h3 className="text-sm font-medium text-neutral-600">Evento atual</h3>
            <p className="mt-1 text-lg font-semibold text-neutral-900 truncate">
              {eventName}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={`/events/${eventId}${item.href}`}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    active
                      ? 'bg-[#863F44] text-white shadow-md'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white border-b border-neutral-200 md:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-4 ml-auto">
            {/* User Avatar */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#863F44] rounded-full flex items-center justify-center text-white text-sm font-medium">
                U
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-8">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-neutral-200 md:hidden">
        <div className="grid grid-cols-4">
          {mobileNavigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={`/events/${eventId}${item.href}`}
                className={`flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                  active ? 'text-[#863F44]' : 'text-neutral-600'
                }`}
              >
                <item.icon className="w-6 h-6" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
