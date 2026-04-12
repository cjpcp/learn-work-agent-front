import request from '@/utils/request'
import type { Notification, PageRequest, PageResult } from '@/types'

export { Notification }

export const notificationApi = {
  getNotifications: (params?: PageRequest): Promise<PageResult<Notification>> => {
    return request.get('/notifications', { params })
  },
  getUnreadCount: async (): Promise<number> => {
    const res = await request.get<{ count: number }>('/notifications/unread-count')
    return (res as unknown as { count: number }).count
  },
  markAsRead: (id: number): Promise<void> => {
    return request.post(`/notifications/${id}/read`)
  },
}
