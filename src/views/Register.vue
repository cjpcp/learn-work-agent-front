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
            <a-input v-model:value="form.username" placeholder="请输入用户名" size="large" class="register-input" />
          </a-form-item>
          <a-form-item name="password" label="密码">
            <a-input-password v-model:value="form.password" placeholder="请输入密码" size="large" class="register-input" />
          </a-form-item>
        </div>

        <div class="form-row">
          <a-form-item name="nick" label="昵称">
            <a-input v-model:value="form.nick" placeholder="请输入昵称" size="large" class="register-input" />
          </a-form-item>
          <a-form-item name="roleId" label="角色">
            <a-select v-model:value="form.roleId" placeholder="请选择角色" size="large" :loading="loadingRoles">
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
              <a-input v-model:value="form.teacherName" placeholder="请输入教师姓名" size="large" class="register-input" />
            </a-form-item>
            <a-form-item name="cardNumber" label="学工号">
              <a-input v-model:value="form.cardNumber" placeholder="请输入学工号" size="large" class="register-input" />
            </a-form-item>
          </div>

          <div class="form-row">
            <a-form-item name="phone" label="联系电话">
              <a-input v-model:value="form.phone" placeholder="请输入联系电话" size="large" class="register-input" />
            </a-form-item>
          </div>
        </template>

        <a-form-item>
          <a-button type="primary" html-type="submit" size="large" block :loading="loading" class="register-button">注册</a-button>
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
  } catch (error: any) {
    message.error('获取角色列表失败: ' + (error.message || '未知错误'))
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
  } catch (error: any) {
    message.error(error.message || '注册失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRoles()
})
</script>

<style scoped>
.register-container { position: relative; display: flex; justify-content: center; align-items: center; min-height: 100vh; overflow: hidden; padding: 20px; }
.register-background { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #764ba2 0%, #667eea 100%); z-index: -1; }
.register-card { width: 600px; max-width: 100%; padding: 32px; border-radius: 16px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); }
.register-title { text-align: center; margin-bottom: 32px; }
.register-title h2 { font-size: 28px; font-weight: 700; color: #333; margin-bottom: 8px; }
.register-title p { font-size: 16px; color: #666; margin-top: 8px; }
.form-row { display: flex; gap: 16px; margin-bottom: 16px; }
.form-row > .ant-form-item { flex: 1; margin-bottom: 0; }
.register-input,.register-button { border-radius: 12px; }
.register-button { height: 48px; margin-top: 16px; }
.login-link { text-align: center; margin-top: 16px; }
@media (max-width: 768px) { .register-card { width: 90%; padding: 24px; } .form-row { flex-direction: column; } }
</style>
