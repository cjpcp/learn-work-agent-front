<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="login-background">
      <div class="background-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
    </div>

    <!-- 登录卡片 -->
    <div class="login-container">
      <div class="login-card">
        <!-- 卡片头部 -->
        <div class="card-header">
          <div class="logo-container">
            <div class="logo-icon">
              <BookOutlined />
            </div>
            <div class="logo-text">
              <h1>学工智能体系统</h1>
              <p>智慧学工，便捷服务</p>
            </div>
          </div>
        </div>

        <!-- 登录表单 -->
        <div class="card-body">
          <h2 class="login-title">用户登录</h2>
          <p class="login-subtitle">请输入您的账号信息以登录系统</p>

          <a-form
            :model="form"
            :rules="rules"
            layout="vertical"
            class="login-form"
            @finish="handleLogin"
          >
            <!-- 用户名输入 -->
            <a-form-item name="username" class="form-item">
              <a-input
                v-model:value="form.username"
                placeholder="请输入用户名"
                size="large"
                class="login-input"
              >
                <template #prefix>
                  <UserOutlined />
                </template>
              </a-input>
            </a-form-item>

            <!-- 密码输入 -->
            <a-form-item name="password" class="form-item">
              <a-input-password
                v-model:value="form.password"
                placeholder="请输入密码"
                size="large"
                class="login-input"
              >
                <template #prefix>
                  <LockOutlined />
                </template>
              </a-input-password>
            </a-form-item>

            <!-- 表单底部 -->
            <div class="form-footer">
              <a class="forgot-password" href="#">忘记密码？</a>
            </div>

            <!-- 登录按钮 -->
            <a-form-item class="form-item">
              <a-button
                type="primary"
                html-type="submit"
                size="large"
                block
                :loading="loading"
                class="login-button"
              >
                <span v-if="!loading">登录</span>
                <template v-else>
                  <div class="loading-spinner"></div>
                  <span>登录中...</span>
                </template>
              </a-button>
            </a-form-item>

            <!-- 注册链接 -->
            <div class="register-section">
              <span>还没有账号？</span>
              <a-button type="link" class="register-button" @click="$router.push('/register')">
                立即注册
              </a-button>
            </div>
          </a-form>
        </div>

        <!-- 卡片底部 -->
        <div class="card-footer">
          <p class="copyright">© 2026 学工智能体系统 | 为学生提供智能、高效的学工服务</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined, BookOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import type { Rule } from 'ant-design-vue/es/form'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const form = reactive({
  username: '',
  password: '',
})

const rules: Record<string, Rule[]> = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

// 组件加载时检查路由参数，自动填充用户名和密码
onMounted(() => {
  if (route.query.username) {
    form.username = route.query.username as string
  }
  if (route.query.password) {
    form.password = route.query.password as string
  }
})

const handleLogin = async () => {
  loading.value = true
  try {
    await userStore.login(form.username, form.password)
    message.success('登录成功')
    // 确保登录成功后再跳转
    setTimeout(() => {
      router.push('/')
    }, 500)
  } catch (error: any) {
    console.error('登录失败:', error)
    message.error(error.message || '登录失败')
    // 只在需要时调用logout
    // 避免在网络错误等情况下清除用户状态
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 登录页面容器 */
.login-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
}

/* 背景装饰 */
.login-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.background-shapes {
  position: relative;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  right: -150px;
  animation-delay: 0s;
}

.shape-2 {
  width: 200px;
  height: 200px;
  bottom: -100px;
  left: -100px;
  animation-delay: 2s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 4s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* 登录容器 */
.login-container {
  position: relative;
  z-index: 1;
  padding: 24px;
  width: 100%;
  max-width: 520px;
}

/* 登录卡片 */
.login-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(24px);
  border-radius: 28px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  animation: card-float 8s ease-in-out infinite;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.login-card:hover {
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

@keyframes card-float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 卡片头部 */
.card-header {
  padding: 48px 48px 0;
  text-align: center;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
}

.logo-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
  box-shadow: 0 8px 24px rgba(24, 144, 255, 0.3);
  animation: logo-pulse 2s ease-in-out infinite;
}

@keyframes logo-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.logo-text h1 {
  font-size: 28px;
  font-weight: 700;
  color: #262626;
  margin: 0;
  letter-spacing: -0.3px;
  line-height: 1.2;
}

.logo-text p {
  font-size: 14px;
  color: #8c8c8c;
  margin: 6px 0 0;
  line-height: 1.4;
  font-weight: 400;
}

/* 卡片主体 */
.card-body {
  padding: 48px;
}

.login-title {
  font-size: 32px;
  font-weight: 700;
  color: #262626;
  margin: 0 0 12px;
  text-align: center;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.login-subtitle {
  font-size: 16px;
  color: #8c8c8c;
  margin: 0 0 36px;
  text-align: center;
  line-height: 1.4;
  font-weight: 400;
}

/* 登录表单 */
.login-form {
  width: 100%;
}

.form-item {
  margin-bottom: 24px;
}

/* 登录输入框 */
.login-input {
  height: 58px !important;
  font-size: 16px !important;
  font-weight: 400;
  letter-spacing: 0.5px;
  border-radius: 14px !important;
  border: 2px solid #f0f0f0 !important;
  transition: all 0.3s ease !important;
}

.login-input:hover {
  border-color: #1890ff !important;
  box-shadow: 0 0 0 4px rgba(24, 144, 255, 0.1) !important;
}

.login-input:focus {
  border-color: #40a9ff !important;
  box-shadow: 0 0 0 4px rgba(64, 169, 255, 0.2) !important;
}

.login-input::placeholder {
  color: #bfbfbf !important;
  font-weight: 400;
  letter-spacing: 0.3px;
}

/* 表单底部 */
.form-footer {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 32px;
}

.forgot-password {
  color: #1890ff;
  font-size: 14px;
  text-decoration: none;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: #40a9ff;
  text-decoration: underline;
}

/* 登录按钮 */
.login-button {
  height: 58px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 14px;
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  border: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition:
    width 0.6s ease,
    height 0.6s ease;
}

.login-button:active:not(:disabled)::before {
  width: 300px;
  height: 300px;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(24, 144, 255, 0.45);
  background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 8px 20px rgba(24, 144, 255, 0.35);
}

.login-button:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  text-shadow: none;
}

/* 登录按钮加载动画 */
.login-button .loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 注册部分 */
.register-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
  font-size: 14px;
  color: #666;
}

.register-button {
  color: #1890ff !important;
  font-weight: 600 !important;
  font-size: 14px !important;
  transition: color 0.3s ease !important;
}

.register-button:hover {
  color: #40a9ff !important;
}

/* 卡片底部 */
.card-footer {
  padding: 0 48px 48px;
  text-align: center;
}

.copyright {
  font-size: 12px;
  color: #999;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-container {
    padding: 16px;
  }

  .login-card {
    border-radius: 20px;
  }

  .card-header {
    padding: 32px 32px 0;
  }

  .logo-icon {
    width: 50px;
    height: 50px;
    font-size: 24px;
  }

  .logo-text h1 {
    font-size: 20px;
  }

  .card-body {
    padding: 32px;
  }

  .login-title {
    font-size: 24px;
  }

  .login-subtitle {
    font-size: 14px;
    margin-bottom: 24px;
  }

  .form-item {
    margin-bottom: 20px;
  }

  .login-input {
    height: 54px !important;
    font-size: 14px !important;
  }

  .login-button {
    height: 54px;
    font-size: 16px;
  }

  .card-footer {
    padding: 0 32px 32px;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 12px;
  }

  .card-header {
    padding: 24px 24px 0;
  }

  .logo-container {
    flex-direction: column;
    gap: 12px;
  }

  .logo-icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }

  .card-body {
    padding: 24px;
  }

  .login-title {
    font-size: 22px;
  }

  .form-item {
    margin-bottom: 16px;
  }

  .input-icon {
    padding: 0 12px;
    font-size: 16px;
  }

  .login-input {
    height: 48px !important;
  }

  .login-button {
    height: 48px;
  }

  .card-footer {
    padding: 0 24px 24px;
  }
}
</style>
