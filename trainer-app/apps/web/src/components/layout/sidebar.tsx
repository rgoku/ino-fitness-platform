'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Leaf,
  ClipboardCheck,
  MessageSquare,
  BarChart3,
  Settings,
  ChevronsLeft,
  ChevronsRight,
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
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 flex h-screen flex-col bg-[var(--color-surface-secondary)] transition-all duration-200 ease-in-out',
          isCollapsed ? 'w-[52px]' : 'w-[240px]',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 lg:static'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex h-11 items-center px-3 shrink-0',
          isCollapsed ? 'justify-center' : 'gap-2'
        )}>
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[5px] bg-[var(--color-text-primary)] text-[var(--color-surface)]">
            <span className="text-xs font-bold">I</span>
          </div>
          {!isCollapsed && (
            <span className="text-sm font-semibold text-[var(--color-text-primary)] tracking-tight">
              INO Coach
            </span>
          )}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto rounded-sm p-0.5 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-hover)] lg:hidden"
          >
            <X size={16} />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto px-1.5 py-1">
          <div className="space-y-[2px]">
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
                    'group flex items-center gap-2.5 rounded-[5px] px-2 py-[5px] text-sm transition-colors duration-75',
                    isActive
                      ? 'bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] font-medium'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]',
                    isCollapsed && 'justify-center px-0'
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon size={18} strokeWidth={1.8} className="shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="px-1.5 pb-1 space-y-[2px]">
          {bottomItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'group flex items-center gap-2.5 rounded-[5px] px-2 py-[5px] text-sm transition-colors duration-75',
                  isActive
                    ? 'bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] font-medium'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]',
                  isCollapsed && 'justify-center px-0'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon size={18} strokeWidth={1.8} className="shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}

          {/* Collapse toggle */}
          <button
            onClick={toggle}
            className={cn(
              'hidden w-full items-center gap-2.5 rounded-[5px] px-2 py-[5px] text-sm text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-secondary)] transition-colors duration-75 lg:flex',
              isCollapsed && 'justify-center px-0'
            )}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? (
              <ChevronsRight size={18} strokeWidth={1.8} />
            ) : (
              <>
                <ChevronsLeft size={18} strokeWidth={1.8} className="shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>

        {/* User */}
        <div className={cn(
          'border-t border-[var(--color-border)] px-2 py-2',
          isCollapsed && 'px-1'
        )}>
          <div className={cn(
            'flex items-center gap-2.5 rounded-[5px] px-1.5 py-1.5',
            'hover:bg-[var(--color-surface-hover)] transition-colors duration-75 cursor-pointer',
            isCollapsed && 'justify-center px-0'
          )}>
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-[10px] font-semibold text-white">
              {user ? getInitials(user.name) : '?'}
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm text-[var(--color-text-primary)] leading-tight">
                    {user?.name ?? 'Coach'}
                  </p>
                </div>
                <button
                  className="rounded-sm p-0.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                  title="Log out"
                >
                  <LogOut size={14} strokeWidth={1.8} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
