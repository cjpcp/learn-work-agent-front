<template>
  <div class="register-container">
    <div class="register-background"></div>
    <a-card class="register-card" :bordered="false">
      <template #title>
        <div class="register-title">
          <h2>用户注册</h2>
          <p>创建您的学工智能体系统账号</p>
        </div>
      </template>
      <a-form :model="form" :rules="rules" layout="vertical" @finish="handleRegister">
        <div class="form-row">
          <a-form-item name="username" label="用户名">
            <a-input
              v-model:value="form.username"
              placeholder="请输入用户名"
              size="large"
              class="register-input"
            />
          </a-form-item>
          <a-form-item name="password" label="密码">
            <a-input-password
              v-model:value="form.password"
              placeholder="请输入密码"
              size="large"
              class="register-input"
            />
          </a-form-item>
        </div>
        <div class="form-row">
          <a-form-item name="realName" label="真实姓名">
            <a-input
              v-model:value="form.realName"
              placeholder="请输入真实姓名"
              size="large"
              class="register-input"
            />
          </a-form-item>
          <a-form-item name="studentNo" label="学号/工号">
            <a-input
              v-model:value="form.studentNo"
              placeholder="请输入学号或工号"
              size="large"
              class="register-input"
            />
          </a-form-item>
        </div>
        <div class="form-row">
          <a-form-item name="phone" label="手机号">
            <a-input
              v-model:value="form.phone"
              placeholder="请输入手机号"
              size="large"
              class="register-input"
            />
          </a-form-item>
          <a-form-item name="email" label="邮箱">
            <a-input
              v-model:value="form.email"
              placeholder="请输入邮箱"
              size="large"
              class="register-input"
            />
          </a-form-item>
        </div>
        <a-form-item name="role" label="角色">
          <a-select
            v-model:value="form.role"
            placeholder="请选择角色"
            size="large"
            class="register-select"
          >
            <a-select-option value="STUDENT">学生</a-select-option>
            <a-select-option value="COUNSELOR">辅导员</a-select-option>
            <a-select-option value="ADMIN">管理员</a-select-option>
          </a-select>
        </a-form-item>

        <!-- 学生相关字段 -->
        <div v-if="form.role === 'STUDENT'">
          <div class="form-row">
            <a-form-item name="department" label="院系">
              <a-select
                v-model:value="form.department"
                placeholder="请选择院系"
                size="large"
                class="register-select"
              >
                <a-select-option value="体育学院">体育学院</a-select-option>
                <a-select-option value="文学院">文学院</a-select-option>
                <a-select-option value="理学院">理学院</a-select-option>
                <a-select-option value="工学院">工学院</a-select-option>
                <a-select-option value="商学院">商学院</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item name="grade" label="年级">
              <a-select
                v-model:value="form.grade"
                placeholder="请选择年级"
                size="large"
                class="register-select"
              >
                <a-select-option value="2021">2021</a-select-option>
                <a-select-option value="2022">2022</a-select-option>
                <a-select-option value="2023">2023</a-select-option>
                <a-select-option value="2024">2024</a-select-option>
                <a-select-option value="2025">2025</a-select-option>
              </a-select>
            </a-form-item>
          </div>
          <div class="form-row">
            <a-form-item name="className" label="班级">
              <a-input
                v-model:value="form.className"
                placeholder="请输入班级"
                size="large"
                class="register-input"
              />
            </a-form-item>
          </div>
        </div>

        <!-- 辅导员/管理员相关字段 -->
        <div v-else>
          <div class="form-row">
            <a-form-item name="workDepartment" label="所属部门">
              <a-input
                v-model:value="form.workDepartment"
                placeholder="请输入所属部门"
                size="large"
                class="register-input"
              />
            </a-form-item>
            <a-form-item name="position" label="职位">
              <a-input
                v-model:value="form.position"
                placeholder="请输入职位"
                size="large"
                class="register-input"
              />
            </a-form-item>
          </div>
        </div>
        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            :loading="loading"
            class="register-button"
          >
            注册
          </a-button>
        </a-form-item>
        <a-form-item>
          <div class="login-link">
            <a-button type="link" @click="$router.push('/login')">已有账号？立即登录</a-button>
          </div>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { authApi } from '@/api'
import type { Rule } from 'ant-design-vue/es/form'

const router = useRouter()

const loading = ref(false)
const form = reactive({
  username: '',
  password: '',
  realName: '',
  studentNo: '',
  phone: '',
  email: '',
  role: 'STUDENT',
  department: '',
  grade: '',
  className: '',
  workDepartment: '',
  position: '',
})

const rules: Record<string, Rule[]> = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

const handleRegister = async () => {
  loading.value = true
  try {
    await authApi.register(form)
    message.success('注册成功，请登录')
    // 跳转到登录页面并传递注册信息
    router.push({
      path: '/login',
      query: {
        username: form.username,
        password: form.password,
        realName: form.realName,
      },
    })
  } catch (error: any) {
    message.error(error.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  overflow: hidden;
  padding: 20px;
}

.register-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  z-index: -1;
  animation: gradient-shift 15s ease infinite;
}

@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.register-card {
  width: 600px;
  max-width: 100%;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  animation: card-fade-in 0.8s ease-out;
}

@keyframes card-fade-in {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.register-title {
  text-align: center;
  margin-bottom: 32px;
}

.register-title h2 {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #764ba2, #667eea);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.register-title p {
  font-size: 16px;
  color: #666;
  margin-top: 8px;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.form-row > .ant-form-item {
  flex: 1;
  margin-bottom: 0;
}

.form-item-focused {
  animation: form-item-focus 0.3s ease;
}

@keyframes form-item-focus {
  from {
    transform: scale(0.98);
  }
  to {
    transform: scale(1);
  }
}

.register-input {
  border-radius: 12px;
  border: 2px solid #f0f0f0;
  transition: all 0.3s ease;
}

.register-input:hover {
  border-color: #764ba2;
}

.register-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.register-select {
  border-radius: 12px;
  border: 2px solid #f0f0f0;
  transition: all 0.3s ease;
}

.register-select:hover {
  border-color: #764ba2;
}

.register-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.register-button {
  border-radius: 12px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #764ba2, #667eea);
  border: none;
  transition: all 0.3s ease;
  margin-top: 16px;
}

.register-button:hover {
  box-shadow: 0 4px 16px rgba(118, 75, 162, 0.4);
  transform: translateY(-2px);
}

.register-button:active {
  transform: translateY(0);
}

.login-link {
  text-align: center;
  margin-top: 16px;
}

.login-link .ant-btn-link {
  color: #764ba2;
  font-size: 14px;
  transition: color 0.3s ease;
}

.login-link .ant-btn-link:hover {
  color: #667eea;
}

@media (max-width: 768px) {
  .register-card {
    width: 90%;
    padding: 24px;
  }

  .register-title h2 {
    font-size: 24px;
  }

  .form-row {
    flex-direction: column;
  }
}
</style>
