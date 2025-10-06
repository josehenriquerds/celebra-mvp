/**
 * Notifications Service
 * Handles all notification API calls
 */

import { api } from '@/lib/api-client'
import type { Notification } from '@/types/api'

export interface GetNotificationsParams {
  unreadOnly?: boolean
}

export const notificationsService = {
  /**
   * Get all notifications for current user
   */
  getNotifications: (params?: GetNotificationsParams) =>
    api.get<Notification[]>('/notifications', { params }),

  /**
   * Mark notification as read
   */
  markAsRead: (notificationId: string) =>
    api.patch<{ success: boolean }>(`/notifications/${notificationId}/read`),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: () =>
    api.patch<{ success: boolean }>('/notifications/read-all'),

  /**
   * Delete notification
   */
  deleteNotification: (notificationId: string) =>
    api.delete<void>(`/notifications/${notificationId}`),
}
