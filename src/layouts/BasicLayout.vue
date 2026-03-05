<template>
  <div class="app-container">
    <!-- 导航栏 -->
    <header class="navbar">
      <div class="navbar-content">
        <!-- 品牌标志 -->
        <div class="brand">
          <div class="brand-icon">
            <BookOutlined />
          </div>
          <div class="brand-text">
            <h1>学工智能体系统</h1>
          </div>
        </div>

        <!-- 主导航 -->
        <nav class="main-nav">
          <ul class="nav-menu">
            <li
              v-for="item in navItems"
              :key="item.key"
              :class="['nav-item', { active: isActive(item.key) }]"
              @click="navigateTo(item.path)"
            >
              <div class="nav-item-content">
                <component :is="item.icon" class="nav-icon" />
                <span class="nav-text">{{ item.label }}</span>
              </div>
            </li>
          </ul>
        </nav>

        <!-- 用户信息 -->
        <div class="user-profile">
          <!-- 通知图标 -->
          <a-popover
            v-model:open="notificationVisible"
            trigger="click"
            placement="bottomRight"
            :overlay-style="{ width: '380px' }"
          >
            <template #content>
              <div class="notification-panel">
                <div class="notification-header">
                  <span class="notification-title">通知中心</span>
                  <a-button
                    type="link"
                    size="small"
                    :disabled="unreadCount === 0"
                    @click="handleMarkAllRead"
                  >
                    全部已读
                  </a-button>
                </div>
                <a-spin :spinning="notificationLoading">
                  <div class="notification-list">
                    <div v-if="notifications.length === 0" class="notification-empty">
                      <a-empty description="暂无通知" :image-style="{ height: '60px' }" />
                    </div>
                    <div
                      v-for="notification in notifications"
                      :key="notification.id"
                      :class="['notification-item', { unread: !notification.isRead }]"
                      @click="handleNotificationClick(notification)"
                    >
                      <div class="notification-item-header">
                        <span class="notification-item-title">{{ notification.title }}</span>
                        <span class="notification-item-time">{{
                          formatTime(notification.createTime)
                        }}</span>
                      </div>
                      <div class="notification-item-content">{{ notification.content }}</div>
                    </div>
                  </div>
                </a-spin>
                <div v-if="notifications.length > 0" class="notification-footer">
                  <a-button type="link" size="small" @click="goToNotificationList">
                    查看全部通知
                  </a-button>
                </div>
              </div>
            </template>
            <a-badge
              :count="unreadCount"
              :overflow-count="99"
              :offset="[-5, 5]"
              :number-style="{ backgroundColor: '#f5222d' }"
            >
              <div class="notification-icon">
                <BellOutlined />
              </div>
            </a-badge>
          </a-popover>

          <a-dropdown placement="bottomRight">
            <div class="user-info" @click.prevent>
              <div class="user-avatar">
                <UserOutlined />
              </div>
              <div class="user-details">
                <div class="user-name">{{ userStore.realName || userStore.username }}</div>
                <div class="user-role">{{ getUserRoleText() }}</div>
              </div>
              <DownOutlined class="dropdown-icon" />
            </div>
            <template #overlay>
              <a-menu class="user-menu">
                <a-menu-item class="menu-item" @click="handleLogout">
                  <LogoutOutlined class="menu-icon" />
                  <span>退出登录</span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-content">
        <p class="footer-text">© 2026 学工智能体系统 | 为学生提供智能、高效的学工服务</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  MessageOutlined,
  CalendarOutlined,
  TrophyOutlined,
  UserOutlined,
  DownOutlined,
  LogoutOutlined,
  BookOutlined,
  BellOutlined,
} from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import { notificationApi } from '@/api'
import type { Notification } from '@/types'
import { message } from 'ant-design-vue'
import { websocketService } from '@/services/websocket'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const notificationVisible = ref(false)
const notificationLoading = ref(false)
const notifications = ref<Notification[]>([])
const unreadCount = ref(0)

// 导航项配置
const navItems = [
  {
    key: 'consultation',
    label: '智能咨询',
    path: '/consultation',
    icon: MessageOutlined,
  },
  {
    key: 'leave',
    label: '请假管理',
    path: '/leave',
    icon: CalendarOutlined,
  },
  {
    key: 'award',
    label: '奖助管理',
    path: '/award',
    icon: TrophyOutlined,
  },
]

// 检查导航项是否激活
const isActive = (key: string) => {
  const currentPath = route.path
  return currentPath.startsWith(`/${key}`)
}

// 导航到指定路径
const navigateTo = (path: string) => {
  router.push(path)
}

// 获取用户角色文本
const getUserRoleText = () => {
  const roleMap: Record<string, string> = {
    STUDENT: '学生',
    COUNSELOR: '辅导员',
    ADMIN: '管理员',
  }
  // 假设userStore中有role字段
  return roleMap[userStore.role as string] || '用户'
}

// 退出登录
const handleLogout = () => {
  userStore.logout()
}

const fetchUnreadCount = async () => {
  try {
    const res = await notificationApi.getUnreadCount()
    if (res.code === 200) {
      unreadCount.value = res.data.count
    }
  } catch (error) {
    console.error('获取未读数量失败:', error)
  }
}

const fetchNotifications = async () => {
  notificationLoading.value = true
  try {
    // 获取最近5条通知（包括已读和未读）
    const res = await notificationApi.getNotifications({
      pageNum: 1,
      pageSize: 5,
    })
    if (res.code === 200) {
      notifications.value = res.data.records
    }
  } catch (error) {
    console.error('获取通知列表失败:', error)
  } finally {
    notificationLoading.value = false
  }
}

const handleNotificationClick = async (notification: Notification) => {
  notificationVisible.value = false

  // 先执行跳转
  if (notification.businessType === 'AWARD_APPLICATION') {
    router.push('/award')
  } else if (notification.businessType === 'LEAVE_APPLICATION') {
    router.push('/leave')
  } else {
    // 没有业务类型，跳转到通知列表
    router.push('/notifications')
  }

  // 然后标记为已读
  if (!notification.isRead && notification.id) {
    try {
      await notificationApi.markAsRead(notification.id)
      notification.isRead = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }
}

const handleMarkAllRead = async () => {
  try {
    await notificationApi.markAllAsRead()
    notifications.value.forEach((n) => (n.isRead = true))
    unreadCount.value = 0
    message.success('已全部标记为已读')
  } catch (error) {
    message.error('操作失败')
  }
}

const goToNotificationList = () => {
  notificationVisible.value = false
  router.push('/notifications')
}

const formatTime = (time?: string) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString()
}

watch(notificationVisible, (visible) => {
  if (visible) {
    fetchNotifications()
  }
})

onMounted(() => {
  fetchUnreadCount()
  // 连接WebSocket
  websocketService.connect()

  // 注册通知回调
  websocketService.onNotification((notification: Notification) => {
    console.log('BasicLayout收到通知回调:', notification)
    // 新通知到达，更新列表
    notifications.value.unshift(notification)
    // 限制只显示最近5条
    if (notifications.value.length > 5) {
      notifications.value = notifications.value.slice(0, 5)
    }
  })

  // 注册未读数量回调
  websocketService.onUnreadCount((count: number) => {
    console.log('BasicLayout收到未读数量回调, count:', count, '当前值:', unreadCount.value)
    unreadCount.value = count
    console.log('更新后unreadCount:', unreadCount.value)
  })
})
</script>

<style scoped>
/* 全局容器 */
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4eaf1 100%);
}

/* 导航栏 */
.navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;
}

.navbar-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 品牌标志 */
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.brand-text h1 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* 主导航 */
.main-nav {
  flex: 1;
  margin: 0 60px;
}

.nav-menu {
  display: flex;
  gap: 8px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  flex: 1;
  min-width: 120px;
  height: 48px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-item:hover {
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.nav-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.nav-item-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
}

.nav-icon {
  font-size: 18px;
  color: #666;
  transition: color 0.3s ease;
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  transition: color 0.3s ease;
}

.nav-item.active .nav-icon,
.nav-item.active .nav-text {
  color: white;
}

/* 用户信息 */
.user-profile {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(240, 242, 245, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 18px;
  color: #666;
}

.notification-icon:hover {
  background: rgba(230, 232, 235, 1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.notification-panel {
  max-height: 400px;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 12px;
}

.notification-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.notification-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification-empty {
  padding: 20px 0;
}

.notification-item {
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 8px;
}

.notification-item:hover {
  background: #f5f5f5;
}

.notification-item.unread {
  background: #e6f7ff;
}

.notification-item.unread:hover {
  background: #d6f0ff;
}

.notification-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.notification-item-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.notification-item-time {
  font-size: 12px;
  color: #999;
}

.notification-item-content {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.notification-footer {
  text-align: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  margin-top: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(240, 242, 245, 0.8);
}

.user-info:hover {
  background: rgba(230, 232, 235, 1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-icon {
  font-size: 12px;
  color: #666;
  transition: transform 0.3s ease;
}

.user-info:hover .dropdown-icon {
  transform: rotate(180deg);
}

/* 用户菜单 */
.user-menu {
  border-radius: 8px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
  overflow: hidden !important;
}

.menu-item {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  padding: 12px 16px !important;
  transition: all 0.3s ease !important;
}

.menu-item:hover {
  background: rgba(102, 126, 234, 0.1) !important;
}

.menu-icon {
  font-size: 16px !important;
}

/* 主内容区 */
.main-content {
  flex: 1;
  padding: 32px;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

/* 页脚 */
.footer {
  background: white;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
  padding: 24px 0;
  margin-top: auto;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
  text-align: center;
}

.footer-text {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* 页面过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .navbar-content {
    padding: 0 24px;
  }

  .main-nav {
    margin: 0 40px;
  }

  .nav-item {
    min-width: 100px;
  }

  .nav-text {
    font-size: 13px;
  }

  .main-content {
    padding: 24px;
  }
}

@media (max-width: 768px) {
  .navbar-content {
    flex-wrap: wrap;
    height: auto;
    padding: 16px 20px;
    gap: 16px;
  }

  .brand {
    flex: 1 1 100%;
    justify-content: center;
  }

  .main-nav {
    flex: 1 1 100%;
    margin: 0;
  }

  .nav-menu {
    justify-content: space-between;
  }

  .nav-item {
    flex: 1;
    min-width: auto;
  }

  .nav-text {
    font-size: 12px;
  }

  .user-profile {
    position: absolute;
    top: 16px;
    right: 20px;
  }

  .user-details {
    display: none;
  }

  .main-content {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .brand-text h1 {
    font-size: 16px;
  }

  .nav-item-content {
    flex-direction: column;
    gap: 4px;
    padding: 0 8px;
  }

  .nav-icon {
    font-size: 16px;
  }

  .nav-text {
    font-size: 11px;
  }

  .main-content {
    padding: 16px;
  }
}
</style>
