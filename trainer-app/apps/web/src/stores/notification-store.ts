'use client';

import { create } from 'zustand';
import { mockNotifications, type MockNotification } from '@/lib/mock-data';

interface NotificationState {
  notifications: MockNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: mockNotifications,
  unreadCount: mockNotifications.filter((n) => !n.read).length,
  markAsRead: (id) =>
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return { notifications, unreadCount: notifications.filter((n) => !n.read).length };
    }),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));
