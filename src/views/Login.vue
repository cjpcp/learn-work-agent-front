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
                {{ loading ? '登录中...' : '登录' }}
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
  } catch (error) {
    message.error(error instanceof Error ? error.message : '登录失败')
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 115, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(74, 144, 226, 0.3) 0%, transparent 50%);
}

.background-shapes {
  position: relative;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  animation: float 8s ease-in-out infinite;
}

.shape-1 {
  width: 400px;
  height: 400px;
  top: -200px;
  right: -100px;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 60px rgba(255, 255, 255, 0.1);
  animation-delay: 0s;
}

.shape-2 {
  width: 300px;
  height: 300px;
  bottom: -150px;
  left: -100px;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 40px rgba(255, 255, 255, 0.08);
  animation-delay: 2s;
}

.shape-3 {
  width: 200px;
  height: 200px;
  top: 30%;
  right: 15%;
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.06);
  animation-delay: 4s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 1;
  }
  33% {
    transform: translateY(-25px) rotate(5deg);
    opacity: 0.9;
  }
  66% {
    transform: translateY(15px) rotate(-5deg);
    opacity: 1;
  }
}
.login-container {
  position: relative;
  z-index: 1;
  padding: 24px;
  width: 100%;
  max-width: 480px;
}

.login-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(24px);
  border-radius: 32px;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  overflow: hidden;
  animation: card-float 10s ease-in-out infinite;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.login-card:hover {
  box-shadow:
    0 30px 60px -15px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  transform: translateY(-4px) scale(1.01);
}

@keyframes card-float {
  0%,
  100% {
    transform: translateY(0px);
    box-shadow:
      0 25px 50px -12px rgba(0, 0, 0, 0.25),
      0 0 0 1px rgba(255, 255, 255, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.5);
  }
  50% {
    transform: translateY(-8px);
    box-shadow:
      0 30px 55px -10px rgba(0, 0, 0, 0.28),
      0 0 0 1px rgba(255, 255, 255, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.6);
  }
}
.card-header,
.card-body,
.card-footer {
  padding: 32px 36px;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 18px;
}

.logo-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 32px;
  box-shadow:
    0 8px 16px rgba(102, 126, 234, 0.4),
    inset 0 -3px 6px rgba(0, 0, 0, 0.1),
    inset 0 3px 6px rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.logo-icon:hover {
  transform: rotate(-5deg) scale(1.05);
  box-shadow:
    0 12px 24px rgba(102, 126, 234, 0.5),
    inset 0 -3px 6px rgba(0, 0, 0, 0.1),
    inset 0 3px 6px rgba(255, 255, 255, 0.25);
}

.logo-text h1 {
  margin: 0;
  font-size: 30px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-text p,
.login-subtitle,
.copyright {
  margin: 0;
  color: #8c92a4;
  font-weight: 500;
}

.login-title {
  margin-bottom: 10px;
  font-size: 26px;
  font-weight: 700;
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.form-footer,
.register-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.forgot-password {
  color: #667eea;
  font-weight: 500;
  transition: all 0.3s ease;
}

.forgot-password:hover {
  color: #764ba2;
  text-decoration: underline;
}

.login-button {
  height: 52px;
  border-radius: 16px;
  font-size: 17px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow:
    0 8px 20px rgba(102, 126, 234, 0.35),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1),
    inset 0 2px 4px rgba(255, 255, 255, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 1px;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow:
    0 12px 28px rgba(102, 126, 234, 0.45),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1),
    inset 0 2px 4px rgba(255, 255, 255, 0.2);
  background: linear-gradient(135deg, #5a6fd6 0%, #6a42a0 100%);
}

.login-button:active {
  transform: translateY(0);
  box-shadow:
    0 6px 16px rgba(102, 126, 234, 0.3),
    inset 0 -1px 2px rgba(0, 0, 0, 0.1),
    inset 0 1px 2px rgba(255, 255, 255, 0.15);
}

.login-input {
  height: 48px;
  border-radius: 12px;
  border: 2px solid #e8ecf4;
  transition: all 0.3s ease;
}

.login-input:hover,
.login-input:focus,
.login-input:focus-within {
  border-color: #667eea;
  box-shadow:
    0 0 0 3px rgba(102, 126, 234, 0.1),
    0 4px 12px rgba(102, 126, 234, 0.15);
}

.form-item {
  margin-bottom: 20px;
}

.register-section span {
  color: #8c92a4;
  font-weight: 500;
}

.register-button {
  color: #667eea !important;
  font-weight: 600;
  padding-left: 0;
  transition: all 0.3s ease;
}

.register-button:hover {
  color: #764ba2 !important;
  transform: translateX(3px);
}

.copyright {
  text-align: center;
  font-size: 13px;
  line-height: 1.5;
  opacity: 0.9;
}
</style>
