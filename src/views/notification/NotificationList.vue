<template>
  <div class="notification-list-page">
    <div class="page-header">
      <h2>通知中心</h2>
    </div>

    <a-card :bordered="false" class="notification-card">
      <a-tabs v-model:active-key="activeTab" @change="handleTabChange">
        <a-tab-pane key="all" tab="全部通知" />
        <a-tab-pane key="unread" tab="未读通知" />
      </a-tabs>

      <a-spin :spinning="loading">
        <div v-if="notifications.length === 0" class="empty-state">
          <a-empty description="暂无通知" />
        </div>
        <div v-else class="notification-list">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            :class="['notification-item', { unread: !notification.isRead }]"
          >
            <div class="notification-item-header">
              <div class="notification-item-title">
                <a-tag v-if="!notification.isRead" color="blue">未读</a-tag>
                <span>{{ notification.title }}</span>
              </div>
              <div class="notification-item-actions">
                <span class="notification-item-time">{{
                  formatTime(notification.createTime)
                }}</span>
              </div>
            </div>
            <div class="notification-item-content">{{ notification.content }}</div>
            <div class="notification-item-footer">
              <a-button
                v-if="!notification.isRead"
                type="link"
                size="small"
                @click="handleMarkAsRead(notification)"
              >
                标记已读
              </a-button>
              <a-button
                v-if="notification.businessId && notification.businessType"
                type="link"
                size="small"
                @click="goToDetail(notification)"
              >
                查看详情
              </a-button>
            </div>
          </div>
        </div>

        <div v-if="total > pageSize" class="pagination-wrapper">
          <a-pagination
            v-model:current="pageNum"
            :total="total"
            :page-size="pageSize"
            show-quick-jumper
            @change="handlePageChange"
          />
        </div>
      </a-spin>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { notificationApi } from '@/api'
import type { Notification } from '@/types'

const router = useRouter()

const activeTab = ref('all')
const loading = ref(false)
const notifications = ref<Notification[]>([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const unreadCount = ref(0)

const fetchNotifications = async () => {
  loading.value = true
  try {
    const page = await notificationApi.getNotifications({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    })
    const records = page.records
    if (activeTab.value === 'unread') {
      notifications.value = records.filter((n: Notification) => !n.isRead)
    } else {
      notifications.value = records
    }
    total.value = page.total
  } catch (error) {
    console.error('获取通知列表失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchUnreadCount = async () => {
  try {
    unreadCount.value = await notificationApi.getUnreadCount()
  } catch (error) {
    console.error('获取未读数量失败:', error)
  }
}

const handleTabChange = () => {
  pageNum.value = 1
  fetchNotifications()
}

const handlePageChange = (page: number) => {
  pageNum.value = page
  fetchNotifications()
}

const handleMarkAsRead = async (notification: Notification) => {
  if (!notification.id) return
  try {
    await notificationApi.markAsRead(notification.id)
    notification.isRead = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
    message.success('已标记为已读')
  } catch (error) {
    message.error('操作失败')
  }
}

const goToDetail = (notification: Notification) => {
  // 跳转到对应列表页面
  if (notification.businessType === 'AWARD_APPLICATION') {
    router.push('/award')
  } else if (notification.businessType === 'LEAVE_APPLICATION') {
    router.push('/leave')
  }
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

onMounted(() => {
  fetchNotifications()
  fetchUnreadCount()
})
</script>

<style scoped>
.notification-list-page {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.notification-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.empty-state {
  padding: 60px 0;
}

.notification-list {
  min-height: 300px;
}

.notification-item {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  background: #fafafa;
  transition: all 0.3s ease;
}

.notification-item:hover {
  background: #f0f0f0;
}

.notification-item.unread {
  background: #e6f7ff;
  border-left: 3px solid #1890ff;
}

.notification-item.unread:hover {
  background: #d6f0ff;
}

.notification-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.notification-item-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.notification-item-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notification-item-time {
  font-size: 13px;
  color: #999;
}

.notification-item-content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 8px;
}

.notification-item-footer {
  display: flex;
  gap: 12px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>
