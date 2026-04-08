<template>
  <div class="login-page">
    <div class="login-background">
      <div class="background-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
    </div>

    <div class="login-container">
      <div class="login-card">
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

            <div class="form-footer">
              <a class="forgot-password" href="#">忘记密码？</a>
            </div>

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

            <div class="register-section">
              <span>还没有账号？</span>
              <a-button type="link" class="register-button" @click="$router.push('/register')"
                >立即注册</a-button
              >
            </div>
          </a-form>
        </div>

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

onMounted(() => {
  if (route.query.username) form.username = route.query.username as string
  if (route.query.password) form.password = route.query.password as string
})

const handleLogin = async () => {
  loading.value = true
  try {
    await userStore.login(form.username, form.password)
    message.success('登录成功')
    setTimeout(() => {
      router.push('/')
    }, 500)
  } catch (error: any) {
    message.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
}
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
.login-container {
  position: relative;
  z-index: 1;
  padding: 24px;
  width: 100%;
  max-width: 520px;
}
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
    transform: translateY(-6px);
  }
}
.card-header,
.card-body,
.card-footer {
  padding: 24px 32px;
}
.logo-container {
  display: flex;
  align-items: center;
  gap: 16px;
}
.logo-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: linear-gradient(135deg, #1677ff, #69b1ff);
  color: #fff;
  font-size: 28px;
}
.logo-text h1 {
  margin: 0;
  font-size: 28px;
}
.logo-text p,
.login-subtitle,
.copyright {
  margin: 0;
  color: #666;
}
.login-title {
  margin-bottom: 8px;
}
.form-footer,
.register-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.login-button {
  height: 46px;
  border-radius: 12px;
}
</style>
