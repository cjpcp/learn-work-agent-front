import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LoginResponse} from '@/types'
import { authApi } from '@/api'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userId = ref<number | null>(null)
  const username = ref<string>('')
  const realName = ref<string>('')
  const role = ref<string>('')
  const department = ref<string>('')
  const departmentId = ref<number | null>(null)
  const grade = ref<string>('')
  const className = ref<string>('')
  const workDepartment = ref<string>('')
  const workDepartmentId = ref<number | null>(null)
  const position = ref<string>('')

  // 登录
  const login = async (loginStudentNo: string, loginPassword: string) => {
    try {
      const userData = await authApi.login({ studentNo: loginStudentNo, password: loginPassword })
      // 检查响应结构
      if (userData && userData.token) {
        token.value = userData.token
        userId.value = userData.userId
        username.value = userData.username
        realName.value = userData.realName
        role.value = userData.role
        department.value = userData.department || ''
        departmentId.value = userData.departmentId || null
        grade.value = userData.grade || ''
        className.value = userData.className || ''
        workDepartment.value = userData.workDepartment || ''
        workDepartmentId.value = userData.workDepartmentId || null
        position.value = userData.position || ''
        localStorage.setItem('token', userData.token)
        localStorage.setItem('userInfo', JSON.stringify(userData))
        return userData
      } else {
        throw new Error('登录失败，未返回用户信息')
      }
    } catch (error: any) {
      console.error('登录请求失败:', error)
      throw error
    }
  }

  // 登出
  const logout = () => {
    token.value = ''
    userId.value = null
    username.value = ''
    realName.value = ''
    role.value = ''
    department.value = ''
    departmentId.value = null
    grade.value = ''
    className.value = ''
    workDepartment.value = ''
    workDepartmentId.value = null
    position.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    router.push('/login')
  }

  // 初始化用户信息
  const initUserInfo = () => {
    const userInfoStr = localStorage.getItem('userInfo')
    if (userInfoStr) {
      try {
        const userInfo: LoginResponse = JSON.parse(userInfoStr)
        token.value = userInfo.token
        userId.value = userInfo.userId
        username.value = userInfo.username
        realName.value = userInfo.realName
        role.value = userInfo.role
        department.value = userInfo.department || ''
        departmentId.value = userInfo.departmentId || null
        grade.value = userInfo.grade || ''
        className.value = userInfo.className || ''
        workDepartment.value = userInfo.workDepartment || ''
        workDepartmentId.value = (userInfo as any).workDepartmentId || null
        position.value = userInfo.position || ''
      } catch (e) {
        console.error('解析用户信息失败', e)
      }
    }
  }

  // 检查token是否过期
  const isTokenExpired = () => {
    if (!token.value) {
      return true
    }
    try {
      const tokenParts = token.value.split('.')
      if (tokenParts.length !== 3) {
        return true
      }
      // JWT使用Base64 URL编码，需要先转换为标准Base64
      const base64Url = tokenParts[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const paddedBase64 = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=')
      const payload = JSON.parse(decodeURIComponent(escape(atob(paddedBase64))))
      const exp = payload.exp
      return Date.now() >= exp * 1000
    } catch (e) {
      console.error('Token解析失败:', e)
      return true
    }
  }

  // 检查是否已登录
  const isLoggedIn = () => {
    return !!token.value && !isTokenExpired()
  }

  // 检查是否为管理员
  const isAdmin = () => {
    return role.value === 'ADMIN'
  }

  // 检查是否为辅导员
  const isCounselor = () => {
    return role.value === 'COUNSELOR'
  }

  // 检查是否为学生
  const isStudent = () => {
    return role.value === 'STUDENT'
  }

  return {
    token,
    userId,
    username,
    realName,
    role,
    department,
    departmentId,
    grade,
    className,
    workDepartment,
    workDepartmentId,
    position,
    login,
    logout,
    initUserInfo,
    isLoggedIn,
    isTokenExpired,
    isAdmin,
    isCounselor,
    isStudent,
  }
})
