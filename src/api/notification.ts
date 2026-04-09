import request from '@/utils/request'
import type { Notification, PageRequest, PageResult } from '@/types'

export { Notification }

export const notificationApi = {
  getNotifications: (params?: PageRequest): Promise<PageResult<Notification>> => {
    return request.get('/notifications', { params })
  },
  getUnreadCount: (): Promise<number> => {
    return request.get('/notifications/unread-count')
  },
  markAsRead: (id: number): Promise<void> => {
    return request.post(`/notifications/${id}/read`)
  },
}