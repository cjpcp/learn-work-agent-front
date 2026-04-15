import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { message } from 'ant-design-vue'
import { Result } from '@/types'
import { useUserStore } from '@/stores/user'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_PREFIX = '/api/v1'

export const apiConfig = {
  baseURL: API_PREFIX,
  fullBaseURL: API_BASE_URL + API_PREFIX,
  wsURL: API_BASE_URL.replace(/^http/, 'ws') + '/ws',
  getFullUrl: (path: string) => `${API_BASE_URL}${API_PREFIX}${path}`,
}

const service: AxiosInstance = axios.create({
  baseURL: API_PREFIX,
  timeout: 30000,
})

service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<Result>) => {
    const res = response.data

    // 如果返回的状态码不是200，则视为错误
    if (res.code !== 200) {
      message.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }

    // 返回Result对象中的data部分，这样API调用时可以直接使用
    return res.data
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      switch (status) {
        case 401:
          message.error('未授权，请重新登录')
          {
            const userStore = useUserStore()
            userStore.logout()
          }
          break
        case 403:
          message.error('拒绝访问')
          break
        case 404:
          message.error('请求的资源不存在')
          break
        case 500:
          message.error('服务器错误')
          break
        default:
          message.error(data?.message || `请求失败: ${status}`)
      }
    } else {
      message.error('网络错误，请检查网络连接')
    }
    return Promise.reject(error)
  }
)

export default service
