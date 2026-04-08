<template>
  <div class="app-container">
    <!-- 顶部导航栏 - 与原型图一致 -->
    <header class="navbar">
      <div class="navbar-container">
        <div class="logo">
          <span class="logo-icon">🔍</span>
          <span class="logo-text">AI智能平台</span>
        </div>
        <nav class="nav-menu">
          <a-dropdown placement="bottom">
            <a class="nav-item" @click.prevent> 首页 </a>
            <template #overlay>
              <a-menu>
                <a-menu-item key="1" @click="$router.push('/consultation')">首页</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
          <a-dropdown placement="bottom">
            <a class="nav-item active" @click.prevent>
              学工AI
              <span class="dropdown-arrow">▼</span>
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item key="1" @click="$router.push('/consultation')"
                  >智能咨询助手</a-menu-item
                >
                <a-menu-item key="2" @click="$router.push('/process')">流程代办服务</a-menu-item>
                <a-menu-item key="3" @click="$router.push('/leave/apply')">请假办理</a-menu-item>
                <a-menu-item key="4" @click="$router.push('/award/apply')"
                  >奖助申请办理</a-menu-item
                >
                <a-menu-item v-if="userStore.isAdmin()" key="5" @click="$router.push('/consultation/transfer-config')">人工转接配置</a-menu-item>
                <a-menu-item v-if="userStore.isAdmin()" key="6" @click="$router.push('/approval/config')">审批流程配置</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
          <a-dropdown placement="bottom">
            <a class="nav-item" @click.prevent>
              教务AI
              <span class="dropdown-arrow">▼</span>
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item key="1">课程与成绩服务</a-menu-item>
                <a-menu-item key="2">排课与选课辅助</a-menu-item>
                <a-menu-item key="3">教务咨询助手</a-menu-item>
                <a-menu-item key="4">教学质量分析</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
          <a-dropdown placement="bottom">
            <a class="nav-item" @click.prevent>
              迎新AI
              <span class="dropdown-arrow">▼</span>
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item key="1">入学个性化提醒</a-menu-item>
                <a-menu-item key="2">前置服务阶段</a-menu-item>
                <a-menu-item key="3">报到服务阶段</a-menu-item>
                <a-menu-item key="4">入学适应阶段</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
          <a-dropdown placement="bottom">
            <a class="nav-item" @click.prevent>
              后勤AI
              <span class="dropdown-arrow">▼</span>
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item key="1">AI保修</a-menu-item>
                <a-menu-item key="2">生活咨询与服务</a-menu-item>
                <a-menu-item key="3">资源预约服务</a-menu-item>
                <a-menu-item key="4">投诉与反馈处理</a-menu-item>
                <a-menu-item key="5">后勤数据看板</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
          <a-dropdown placement="bottom">
            <a class="nav-item" @click.prevent>
              校级智能体
              <span class="dropdown-arrow">▼</span>
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item key="1">校园通用AI助手</a-menu-item>
                <a-menu-item key="2">招生查询推荐</a-menu-item>
                <a-menu-item key="3">热门问题统计分析</a-menu-item>
                <a-menu-item key="4">知识库动态管理</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
          <a-dropdown placement="bottom">
            <a class="nav-item" @click.prevent>
              系统
              <span class="dropdown-arrow">▼</span>
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item key="1" @click="$router.push('/notifications')">通知中心</a-menu-item>
                <a-menu-item key="2">系统设置</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </nav>
        <div class="user-info">
          <a-dropdown placement="bottomRight">
            <div class="user-profile">
              <img
                src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20avatar%2C%20simple%20cartoon%20style&image_size=square"
                alt="用户头像"
                class="user-avatar"
              />
              <span class="user-name">{{ userStore.teacherName || userStore.nick || '用户' }}</span>
            </div>
            <template #overlay>
              <a-menu>
                <a-menu-item key="logout" @click="handleLogout"> 退出登录 </a-menu-item>
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
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { message } from 'ant-design-vue'

const router = useRouter()
const userStore = useUserStore()

const handleLogout = () => {
  userStore.logout()
  message.success('退出登录成功')
  router.push('/login')
}

onMounted(() => {})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: #ffffff;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 - 与原型图一致 */
.navbar {
  background-color: #0a2463;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
}

.logo-icon {
  font-size: 20px;
  color: #3498db;
}

.nav-menu {
  display: flex;
  gap: 8px;
}

.nav-item {
  color: white;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-item:hover {
  color: #3498db;
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  color: #3498db;
  font-weight: 500;
}

.dropdown-arrow {
  font-size: 10px;
  opacity: 0.8;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.user-profile:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  color: white;
}

.main-content {
  flex: 1;
  padding: 24px;
  background-color: #f5f5f5;
}

.footer {
  background-color: #ffffff;
  border-top: 1px solid #e8e8e8;
  padding: 20px 0;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.footer-text {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
