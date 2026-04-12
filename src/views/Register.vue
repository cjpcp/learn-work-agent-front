<template>
  <div class="register-container">
    <div class="register-background"></div>
    <a-card class="register-card" :bordered="false">
      <template #title>
        <div class="register-title">
          <h2>用户注册</h2>
          <p>{{ form.teacher ? '创建系统登录账号并绑定教师信息' : '创建系统登录账号' }}</p>
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
          <a-form-item name="nick" label="昵称">
            <a-input
              v-model:value="form.nick"
              placeholder="请输入昵称"
              size="large"
              class="register-input"
            />
          </a-form-item>
          <a-form-item name="roleId" label="角色">
            <a-select
              v-model:value="form.roleId"
              placeholder="请选择角色"
              size="large"
              :loading="loadingRoles"
            >
              <a-select-option v-for="role in roles" :key="role.id" :value="role.id">
                {{ role.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </div>

        <a-form-item name="teacher" label="是否为教师">
          <a-radio-group v-model:value="form.teacher" @change="handleTeacherChange">
            <a-radio :value="true">是</a-radio>
            <a-radio :value="false">否</a-radio>
          </a-radio-group>
        </a-form-item>

        <template v-if="form.teacher">
          <div class="form-row">
            <a-form-item name="teacherName" label="教师姓名">
              <a-input
                v-model:value="form.teacherName"
                placeholder="请输入教师姓名"
                size="large"
                class="register-input"
              />
            </a-form-item>
            <a-form-item name="cardNumber" label="学工号">
              <a-input
                v-model:value="form.cardNumber"
                placeholder="请输入学工号"
                size="large"
                class="register-input"
              />
            </a-form-item>
          </div>

          <div class="form-row">
            <a-form-item name="phone" label="联系电话">
              <a-input
                v-model:value="form.phone"
                placeholder="请输入联系电话"
                size="large"
                class="register-input"
              />
            </a-form-item>
          </div>
        </template>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            :loading="loading"
            class="register-button"
            >注册</a-button
          >
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { authApi, systemApi } from '@/api'
import type { Rule } from 'ant-design-vue/es/form'

const router = useRouter()
const loading = ref(false)
const loadingRoles = ref(false)
const roles = ref<{ id: number; code: string; name: string }[]>([])

const form = reactive({
  username: '',
  password: '',
  nick: '',
  teacher: undefined as boolean | undefined,
  teacherName: '',
  cardNumber: '',
  phone: '',
  roleId: undefined as number | undefined,
})

const rules: Record<string, Rule[]> = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    {
      validator: async (_rule: Rule, value: string) => {
        if (!value || !value.trim()) return Promise.resolve()
        const exists = await authApi.checkUsername(value.trim())
        if (exists) return Promise.reject(new Error('用户名已存在'))
        return Promise.resolve()
      },
      trigger: 'blur',
    },
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  nick: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  teacher: [{ required: true, message: '请选择是否为教师', trigger: 'change', type: 'boolean' }],
  teacherName: [
    {
      validator: async (_rule: Rule, value: string) => {
        if (!form.teacher || (value && value.trim())) return Promise.resolve()
        return Promise.reject(new Error('请输入教师姓名'))
      },
      trigger: 'blur',
    },
  ],
  cardNumber: [
    {
      validator: async (_rule: Rule, value: string) => {
        if (!form.teacher || (value && value.trim())) return Promise.resolve()
        return Promise.reject(new Error('请输入学工号'))
      },
      trigger: 'blur',
    },
  ],
  phone: [
    {
      validator: async (_rule: Rule, value: string) => {
        if (!form.teacher || (value && value.trim())) return Promise.resolve()
        return Promise.reject(new Error('请输入联系电话'))
      },
      trigger: 'blur',
    },
  ],
  roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

const loadRoles = async () => {
  loadingRoles.value = true
  try {
    roles.value = await systemApi.getAllRoles()
  } catch (error) {
    message.error('获取角色列表失败: ' + (error instanceof Error ? error.message : '未知错误'))
  } finally {
    loadingRoles.value = false
  }
}

const handleTeacherChange = () => {
  if (!form.teacher) {
    form.teacherName = ''
    form.cardNumber = ''
    form.phone = ''
  }
}

const handleRegister = async () => {
  loading.value = true
  try {
    const payload = {
      username: form.username,
      password: form.password,
      nick: form.nick,
      roleId: Number(form.roleId),
      teacher: Boolean(form.teacher),
      teacherName: form.teacher ? form.teacherName : undefined,
      cardNumber: form.teacher ? form.cardNumber : undefined,
      phone: form.teacher ? form.phone : undefined,
    }
    await authApi.register(payload)
    message.success('注册成功，请登录')
    router.push({
      path: '/login',
      query: {
        username: form.username,
        password: form.password,
      },
    })
  } catch (error) {
    message.error(error instanceof Error ? error.message : '注册失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRoles()
})
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
  background:
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 115, 0.3) 0%, transparent 50%),
    linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  z-index: -1;
}

.register-card {
  width: 650px;
  max-width: 100%;
  padding: 36px;
  border-radius: 32px;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(24px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.register-card:hover {
  box-shadow:
    0 30px 60px -15px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.3);
  transform: translateY(-4px) scale(1.01);
}

.register-title {
  text-align: center;
  margin-bottom: 36px;
}

.register-title h2 {
  font-size: 30px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.register-title p {
  font-size: 16px;
  color: #8c92a4;
  margin-top: 8px;
  font-weight: 500;
}
.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-row > .ant-form-item {
  flex: 1;
  margin-bottom: 0;
}

.register-input {
  border-radius: 12px;
  height: 48px;
  border: 2px solid #e8ecf4;
  transition: all 0.3s ease;
}

.register-input:hover,
.register-input:focus,
.register-input:focus-within {
  border-color: #667eea;
  box-shadow:
    0 0 0 3px rgba(102, 126, 234, 0.1),
    0 4px 12px rgba(102, 126, 234, 0.15);
}

.register-button {
  border-radius: 16px;
  height: 52px;
  margin-top: 20px;
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

.register-button:hover {
  transform: translateY(-2px);
  box-shadow:
    0 12px 28px rgba(102, 126, 234, 0.45),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1),
    inset 0 2px 4px rgba(255, 255, 255, 0.2);
}
.login-link {
  text-align: center;
  margin-top: 16px;
}
@media (max-width: 768px) {
  .register-card {
    width: 90%;
    padding: 24px;
  }
  .form-row {
    flex-direction: column;
  }
}
</style>
