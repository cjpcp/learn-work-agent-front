import { Client, IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client/dist/sockjs.min.js'
import { useUserStore } from '@/stores/user'

export interface Notification {
  id: number
  title: string
  content: string
  isRead: boolean
  createTime: string
}

class WebSocketService {
  private client: Client | null = null
  private reconnectDelay = 3000
  private notificationCallbacks: ((notification: Notification) => void)[] = []
  private unreadCountCallbacks: ((count: number) => void)[] = []

  /**
   * 连接WebSocket
   */
  connect() {
    try {
      const userStore = useUserStore()
      const token = userStore.token

      if (!token) {
        console.warn('未登录，无法连接WebSocket')
        return
      }

      const socket = new SockJS(`/ws?token=${token}`)

      this.client = new Client({
        webSocketFactory: () => socket as unknown as WebSocket,
        reconnectDelay: this.reconnectDelay,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log('WebSocket连接成功')
          this.subscribe()
        },
        onDisconnect: () => {
          console.log('WebSocket连接断开')
        },
        onStompError: (frame) => {
          console.error('STOMP错误:', frame)
        },
      })

      this.client.activate()
    } catch (error) {
      console.error('WebSocket连接失败:', error)
    }
  }

  /**
   * 订阅消息
   */
  private subscribe() {
    if (!this.client) return

    try {
      console.log('开始订阅消息...')

      this.client.subscribe('/user/queue/notifications', (message: IMessage) => {
        try {
          const notification = JSON.parse(message.body)
          console.log('收到新通知:', notification)
          console.log('通知回调数量:', this.notificationCallbacks.length)
          this.notificationCallbacks.forEach((callback) => callback(notification))
        } catch (error) {
          console.error('解析通知消息失败:', error)
        }
      })

      this.client.subscribe('/user/queue/unread-count', (message: IMessage) => {
        try {
          const data = JSON.parse(message.body)
          console.log('收到未读数量更新:', data)
          console.log('未读数量回调数量:', this.unreadCountCallbacks.length)
          this.unreadCountCallbacks.forEach((callback) => callback(data.count))
        } catch (error) {
          console.error('解析未读数量消息失败:', error)
        }
      })

      console.log('消息订阅完成')
    } catch (error) {
      console.error('订阅消息失败:', error)
    }
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.client) {
      this.client.deactivate()
      this.client = null
    }
  }

  /**
   * 注册通知回调
   */
  onNotification(callback: (notification: Notification) => void) {
    this.notificationCallbacks.push(callback)
    return () => {
      const index = this.notificationCallbacks.indexOf(callback)
      if (index > -1) {
        this.notificationCallbacks.splice(index, 1)
      }
    }
  }

  /**
   * 注册未读数量回调
   */
  onUnreadCount(callback: (count: number) => void) {
    this.unreadCountCallbacks.push(callback)
    return () => {
      const index = this.unreadCountCallbacks.indexOf(callback)
      if (index > -1) {
        this.unreadCountCallbacks.splice(index, 1)
      }
    }
  }
}

export const websocketService = new WebSocketService()
