'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  ClipboardCheck,
  MessageSquare,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/sidebar-store';
import { useAuthStore } from '@/stores/auth-store';
import { getInitials } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Clients', href: '/clients', icon: Users },
  { label: 'Programs', href: '/programs', icon: Dumbbell },
  { label: 'Check-ins', href: '/check-ins', icon: ClipboardCheck },
  { label: 'Messages', href: '/messages', icon: MessageSquare },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, toggle, setMobileOpen } = useSidebarStore();
  const user = useAuthStore((s) => s.user);

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 flex h-screen flex-col border-r border-border bg-surface transition-all duration-200',
          isCollapsed ? 'w-16' : 'w-60',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 lg:static'
        )}
      >
        {/* Header */}
        <div className={cn('flex h-14 items-center border-b border-border px-4', isCollapsed && 'justify-center px-2')}>
          {!isCollapsed && (
            <span className="text-lg font-bold tracking-tight text-brand-500">
              INO
            </span>
          )}
          {isCollapsed && (
            <span className="text-lg font-bold text-brand-500">I</span>
          )}

          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto rounded-md p-1 text-[var(--color-text-secondary)] hover:bg-surface-secondary lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-500/10 text-brand-500'
                    : 'text-[var(--color-text-secondary)] hover:bg-surface-secondary hover:text-[var(--color-text-primary)]',
                  isCollapsed && 'justify-center px-2'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon size={20} className="shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={toggle}
          className="hidden items-center justify-center border-t border-border py-3 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] lg:flex"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* User section */}
        <div className={cn('border-t border-border p-3', isCollapsed && 'p-2')}>
          <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs font-semibold text-brand-500">
              {user ? getInitials(user.name) : '?'}
            </div>
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                  {user?.name}
                </p>
                <p className="truncate text-xs text-[var(--color-text-tertiary)]">
                  {user?.email}
                </p>
              </div>
            )}
            {!isCollapsed && (
              <button className="rounded-md p-1 text-[var(--color-text-tertiary)] hover:text-red-500">
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
