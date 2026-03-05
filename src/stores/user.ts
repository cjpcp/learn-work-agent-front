import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LoginResponse, User } from '@/types'
import { authApi } from '@/api'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userId = ref<number | null>(null)
  const username = ref<string>('')
  const realName = ref<string>('')
  const role = ref<string>('')

  // 登录
  const login = async (loginUsername: string, loginPassword: string) => {
    const response = await authApi.login({ username: loginUsername, password: loginPassword })
    if (response.data) {
      const data = response.data
      token.value = data.token
      userId.value = data.userId
      username.value = data.username
      realName.value = data.realName
      role.value = data.role
      localStorage.setItem('token', data.token)
      localStorage.setItem('userInfo', JSON.stringify(data))
      return data
    }
  }

  // 登出
  const logout = () => {
    token.value = ''
    userId.value = null
    username.value = ''
    realName.value = ''
    role.value = ''
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
      const payload = JSON.parse(atob(tokenParts[1]))
      const exp = payload.exp
      return Date.now() >= exp * 1000
    } catch (e) {
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
