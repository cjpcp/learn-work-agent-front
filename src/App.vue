<template>
  <ConfigProvider :locale="locale">
    <router-view />
  </ConfigProvider>
</template>

<script setup lang="ts">
import { ConfigProvider } from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'

dayjs.locale('zh-cn')
const locale = zhCN

// 定时检查token过期
let tokenCheckInterval: number | null = null

onMounted(() => {
  const userStore = useUserStore()

  // 每5分钟检查一次token是否过期
  tokenCheckInterval = window.setInterval(
    () => {
      if (userStore.token && userStore.isTokenExpired()) {
        userStore.logout()
      }
    },
    5 * 60 * 1000
  )
})

onUnmounted(() => {
  if (tokenCheckInterval) {
    clearInterval(tokenCheckInterval)
  }
})
</script>
