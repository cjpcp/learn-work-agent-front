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
              :loading="checkingStudentNo"
            >
              <template #suffix>
                <a-spin v-if="checkingStudentNo" size="small" />
              </template>
            </a-input>
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
        <a-form-item name="userType" label="注册类型">
          <a-select
            v-model:value="form.userType"
            placeholder="请选择注册类型"
            size="large"
            class="register-select"
            @change="handleUserTypeChange"
          >
            <a-select-option value="STUDENT">学生</a-select-option>
            <a-select-option value="STAFF">学工</a-select-option>
          </a-select>
        </a-form-item>

        <!-- 学生相关字段 -->
        <div v-if="form.userType === 'STUDENT'">
          <div class="form-row">
            <a-form-item name="department" label="院系">
              <a-select
                v-model:value="form.departmentId"
                placeholder="请选择院系"
                size="large"
                class="register-select"
                :loading="loadingColleges"
                @change="handleCollegeChange"
              >
                <a-select-option
                  v-for="college in colleges"
                  :key="college.id"
                  :value="college.id"
                >
                  {{ college.name }}
                </a-select-option>
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

        <!-- 学工相关字段 -->
        <div v-else>
          <div class="form-row">
            <a-form-item name="role" label="角色">
              <a-select
                v-model:value="form.role"
                placeholder="请选择角色"
                size="large"
                class="register-select"
                :loading="loadingRoles"
                @change="handleRoleChange"
              >
                <a-select-option
                  v-for="role in staffRoles"
                  :key="role.code"
                  :value="role.code"
                >
                  {{ role.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item name="workDepartment" label="所属部门">
              <a-select
                v-model:value="form.workDepartmentId"
                placeholder="请选择所属部门"
                size="large"
                class="register-select"
                :loading="loadingDepartments"
                @change="handleDepartmentChange"
              >
                <a-select-option
                  v-for="dept in departmentOptions"
                  :key="dept.code"
                  :value="dept.id"
                >
                  {{ dept.name }}
                </a-select-option>
              </a-select>
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { authApi, systemApi } from '@/api'
import type { Rule } from 'ant-design-vue/es/form'

const router = useRouter()

const loading = ref(false)
const loadingRoles = ref(false)
const checkingStudentNo = ref(false)
const loadingDepartments = ref(false)
const loadingColleges = ref(false)
const staffRoles = ref<{ code: string; name: string }[]>([])
const departments = ref<{ id: number; code: string; name: string; description: string }[]>([])
const colleges = ref<{ id: number; code: string; name: string; description: string }[]>([])
const departmentOptions = ref<{ id: number; code: string; name: string }[]>([])

const form = reactive({
  username: '',
  password: '',
  realName: '',
  studentNo: '',
  phone: '',
  email: '',
  userType: 'STUDENT',
  role: 'STUDENT',
  department: '',
  departmentId: null as number | null,
  grade: '',
  className: '',
  workDepartment: '',
  workDepartmentId: null as number | null,
  position: '',
})

const rules: Record<string, Rule[]> = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  studentNo: [
    { required: true, message: '请输入学号/工号', trigger: 'blur' },
    {
      validator: async (_rule: Rule, value: string) => {
        if (!value || !value.trim()) {
          return Promise.resolve()
        }
        try {
          checkingStudentNo.value = true
          const response = await authApi.checkStudentNo(value.trim())
          if (response === true) {
            return Promise.reject(new Error('学号/工号已存在'))
          }
          return Promise.resolve()
        } catch (error: any) {
          return Promise.reject(new Error('验证学号/工号失败'))
        } finally {
          checkingStudentNo.value = false
        }
      },
      trigger: 'blur',
    },
  ],
  userType: [{ required: true, message: '请选择注册类型', trigger: 'change' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

// 获取学工角色列表
const loadStaffRoles = async () => {
  loadingRoles.value = true
  try {
    const data = await systemApi.getStaffRoles()
    staffRoles.value = data
  } catch (error: any) {
    message.error('获取角色列表失败: ' + (error.message || '未知错误'))
  } finally {
    loadingRoles.value = false
  }
}

// 获取部门列表
const loadDepartments = async () => {
  loadingDepartments.value = true
  try {
    const data = await systemApi.getDepartments()
    departments.value = data
  } catch (error: any) {
    message.error('获取部门列表失败: ' + (error.message || '未知错误'))
  } finally {
    loadingDepartments.value = false
  }
}

// 获取学院列表
const loadColleges = async () => {
  loadingColleges.value = true
  try {
    const data = await systemApi.getColleges()
    colleges.value = data
  } catch (error: any) {
    message.error('获取学院列表失败: ' + (error.message || '未知错误'))
  } finally {
    loadingColleges.value = false
  }
}

// 处理注册类型切换
const handleUserTypeChange = (value: string) => {
  if (value === 'STUDENT') {
    form.role = 'STUDENT'
    // 清空学工相关字段
    form.workDepartment = ''
    form.workDepartmentId = null
    // 加载学院列表
    loadColleges()
  } else {
    form.role = ''
    // 清空学生相关字段
    form.department = ''
    form.departmentId = null
    form.grade = ''
    form.className = ''
    // 加载学工角色列表
    loadStaffRoles()
    // 清空部门选项
    departmentOptions.value = []
  }
}

// 处理学院选择变化
const handleCollegeChange = (collegeId: number) => {
  form.departmentId = collegeId
  const selectedCollege = colleges.value.find(college => college.id === collegeId)
  if (selectedCollege) {
    form.department = selectedCollege.name
  }
}

// 处理角色切换
const handleRoleChange = async (value: string) => {
  form.workDepartment = ''
  form.workDepartmentId = null
  loadingDepartments.value = true
  try {
    if (value === 'COUNSELOR' || value === 'DEAN') {
      // 加载学院列表
      const data = await systemApi.getColleges()
      departmentOptions.value = data
    } else if (value === 'ADMIN') {
      // 加载部门列表
      const data = await systemApi.getDepartments()
      departmentOptions.value = data
    } else {
      departmentOptions.value = []
    }
  } catch (error: any) {
    message.error('获取部门/学院列表失败: ' + (error.message || '未知错误'))
  } finally {
    loadingDepartments.value = false
  }
}

const handleDepartmentChange = (departmentId: number) => {
  // 保存部门ID
  form.workDepartmentId = departmentId
  // 根据部门ID找到对应的部门名称
  const selectedDept = departmentOptions.value.find(dept => dept.id === departmentId)
  if (selectedDept) {
    form.workDepartment = selectedDept.name
  } else {
    form.workDepartment = ''
  }
}

const handleRegister = async () => {
  loading.value = true
  try {
    // 构建注册数据
    const registerData = {
      username: form.username,
      password: form.password,
      realName: form.realName,
      studentNo: form.studentNo,
      phone: form.phone,
      email: form.email,
      role: form.role,
      department: form.department,
      departmentId: form.departmentId ?? undefined,
      grade: form.grade,
      className: form.className,
      workDepartment: form.workDepartment,
      workDepartmentId: form.workDepartmentId ?? undefined,
      position: form.position,
    }
    await authApi.register(registerData)
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

// 页面加载时初始化学院列表
onMounted(() => {
  if (form.userType === 'STUDENT') {
    loadColleges()
  }
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
