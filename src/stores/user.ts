import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LoginResponse } from '@/types'
import { authApi } from '@/api'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const adminId = ref<number | null>(null)
  const username = ref<string>('')
  const nick = ref<string>('')
  const teacherId = ref<number | null>(null)
  const teacherName = ref<string>('')
  const roleId = ref<number | null>(null)
  const roleName = ref<string>('')
  const status = ref<number | null>(null)

  const applyUserInfo = (userData: LoginResponse) => {
    token.value = userData.token
    adminId.value = userData.adminId
    username.value = userData.username
    nick.value = userData.nick
    teacherId.value = userData.teacherId
    teacherName.value = userData.teacherName
    roleId.value = userData.roleId
    roleName.value = userData.roleName
    status.value = userData.status
    localStorage.setItem('token', userData.token)
    localStorage.setItem('userInfo', JSON.stringify(userData))
  }

  const login = async (loginUsername: string, loginPassword: string) => {
    const userData = await authApi.login({ username: loginUsername, password: loginPassword })
    if (!userData?.token) {
      throw new Error('登录失败，未返回用户信息')
    }
    applyUserInfo(userData)
    return userData
  }

  const logout = () => {
    token.value = ''
    adminId.value = null
    username.value = ''
    nick.value = ''
    teacherId.value = null
    teacherName.value = ''
    roleId.value = null
    roleName.value = ''
    status.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    router.push('/login')
  }

  const initUserInfo = () => {
    const userInfoStr = localStorage.getItem('userInfo')
    if (!userInfoStr) return
    try {
      const userInfo: LoginResponse = JSON.parse(userInfoStr)
      applyUserInfo(userInfo)
    } catch (e) {
      console.error('解析用户信息失败', e)
    }
  }

  const isTokenExpired = () => {
    if (!token.value) return true
    try {
      const tokenParts = token.value.split('.')
      if (tokenParts.length !== 3) return true
      const base64Url = tokenParts[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const paddedBase64 = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=')
      const payload = JSON.parse(decodeURIComponent(escape(atob(paddedBase64))))
      return Date.now() >= payload.exp * 1000
    } catch (e) {
      console.error('Token解析失败:', e)
      return true
    }
  }

  const isLoggedIn = () => !!token.value && !isTokenExpired()
  const isAdmin = () => roleName.value === 'ADMIN'
  const isCounselor = () => roleName.value === 'COUNSELOR'
  const isCollegeLeader = () => roleName.value === 'COLLEGE_LEADER'
  const isDepartmentLeader = () => roleName.value === 'DEPARTMENT_LEADER'

  return {
    token,
    adminId,
    username,
    nick,
    teacherId,
    teacherName,
    roleId,
    roleName,
    status,
    login,
    logout,
    initUserInfo,
    isLoggedIn,
    isTokenExpired,
    isAdmin,
    isCounselor,
    isCollegeLeader,
    isDepartmentLeader,
  }
})
