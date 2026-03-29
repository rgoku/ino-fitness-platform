'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Video,
  Leaf,
  ClipboardCheck,
  MessageSquare,
  BarChart3,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  X,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/sidebar-store';
import { useAuthStore } from '@/stores/auth-store';
import { getInitials } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Clients', href: '/clients', icon: Users },
  { label: 'Programs', href: '/programs', icon: Dumbbell },
  { label: 'Videos', href: '/videos', icon: Video },
  { label: 'Nutrition', href: '/nutrition', icon: Leaf },
  { label: 'Check-ins', href: '/check-ins', icon: ClipboardCheck },
  { label: 'Messages', href: '/messages', icon: MessageSquare },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
];

const bottomItems = [
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, toggle, setMobileOpen } = useSidebarStore();
  const user = useAuthStore((s) => s.user);

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 flex h-screen flex-col border-r border-[var(--color-border-light)] bg-[var(--color-surface-secondary)] transition-all duration-200 ease-out',
          isCollapsed ? 'w-[56px]' : 'w-[248px]',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 lg:static'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex h-14 items-center px-4 shrink-0 border-b border-[var(--color-border-light)]',
          isCollapsed ? 'justify-center px-2' : 'gap-2.5'
        )}>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-white">
            <Sparkles size={14} strokeWidth={2.2} />
          </div>
          {!isCollapsed && (
            <span className="text-sub-md text-[var(--color-text-primary)] tracking-tight">
              INO
            </span>
          )}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto rounded-md p-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-hover)] lg:hidden"
          >
            <X size={16} />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <div className="space-y-0.5">
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
                    'group flex items-center gap-3 rounded-lg px-3 py-2 text-body-sm transition-all duration-100',
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-medium dark:bg-brand-900/20 dark:text-brand-400'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]',
                    isCollapsed && 'justify-center px-0'
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon
                    size={18}
                    strokeWidth={isActive ? 2 : 1.6}
                    className={cn('shrink-0', isActive && 'text-brand-600 dark:text-brand-400')}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="px-2 pb-2 space-y-0.5">
          {bottomItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2 text-body-sm transition-all duration-100',
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-medium dark:bg-brand-900/20 dark:text-brand-400'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]',
                  isCollapsed && 'justify-center px-0'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon size={18} strokeWidth={1.6} className="shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}

          {/* Collapse toggle */}
          <button
            onClick={toggle}
            className={cn(
              'hidden w-full items-center gap-3 rounded-lg px-3 py-2 text-body-sm text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-secondary)] transition-all duration-100 lg:flex',
              isCollapsed && 'justify-center px-0'
            )}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? (
              <ChevronsRight size={18} strokeWidth={1.6} />
            ) : (
              <>
                <ChevronsLeft size={18} strokeWidth={1.6} className="shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>

        {/* User */}
        <div className={cn(
          'border-t border-[var(--color-border-light)] px-2 py-3',
          isCollapsed && 'px-1.5'
        )}>
          <div className={cn(
            'flex items-center gap-3 rounded-lg px-2 py-2',
            'hover:bg-[var(--color-surface-hover)] transition-colors duration-100 cursor-pointer',
            isCollapsed && 'justify-center px-0'
          )}>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-[11px] font-semibold text-white">
              {user ? getInitials(user.name) : '?'}
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-body-sm font-medium text-[var(--color-text-primary)] leading-tight">
                    {user?.name ?? 'Coach'}
                  </p>
                  <p className="truncate text-body-xs text-[var(--color-text-tertiary)] leading-tight">
                    {user?.email ?? 'coach@ino.fit'}
                  </p>
                </div>
                <button
                  className="rounded-md p-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors"
                  title="Log out"
                >
                  <LogOut size={14} strokeWidth={1.6} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
