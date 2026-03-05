import request from '@/utils/request'
import { useUserStore } from '@/stores/user'
import type {
  Result,
  PageRequest,
  PageResult,
  LoginRequest,
  LoginResponse,
  User,
  ConsultationRequest,
  ConsultationQuestion,
  TransferToHumanRequest,
  LeaveApplicationRequest,
  LeaveApplication,
  ApprovalRequest,
  AwardApplicationRequest,
  AwardApplication,
  Notification,
  UnreadCountResponse,
} from '@/types'

// 认证相关API
export const authApi = {
  login: (data: LoginRequest): Promise<Result<LoginResponse>> => {
    return request.post('/auth/login', data)
  },
  register: (data: User): Promise<Result<User>> => {
    return request.post('/auth/register', data)
  },
}

// 咨询相关API
export const consultationApi = {
  submitQuestion: (data: ConsultationRequest): Promise<Result<ConsultationQuestion>> => {
    return request.post('/consultation/questions', data)
  },
  submitQuestionStream: async (
    data: ConsultationRequest,
    onChunk: (chunk: string) => void,
    token: string
  ): Promise<void> => {
    console.log('开始流式请求，数据:', data)

    if (!token) {
      throw new Error('Token is required for streaming request')
    }

    const url = '/api/v1/consultation/questions/stream'

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('请求失败，状态码:', response.status, '错误信息:', errorText)
        throw new Error(`请求失败: ${response.status} ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder('utf-8')
      let buffer = ''

      if (!reader) {
        throw new Error('无法获取响应流')
      }

      try {
        while (true) {
          const { done, value } = await reader.read()

          if (done) {
            console.log('流式读取完成')
            break
          }

          buffer += decoder.decode(value, { stream: true })

          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmedLine = line.trim()
            if (trimmedLine.startsWith('data:')) {
              const chunkData = trimmedLine.substring(5).trim()
              if (chunkData) {
                console.log('收到数据块:', chunkData)
                onChunk(chunkData)
              }
            }
          }
        }

        if (buffer.trim()) {
          const trimmedBuffer = buffer.trim()
          if (trimmedBuffer.startsWith('data:')) {
            const chunkData = trimmedBuffer.substring(5).trim()
            if (chunkData) {
              console.log('收到数据块:', chunkData)
              onChunk(chunkData)
            }
          }
        }
      } catch (readError) {
        console.error('读取流数据失败:', readError)
        throw readError
      }

      console.log('流式请求完成')
    } catch (error) {
      console.error('流式请求异常:', error)
      throw error
    }
  },
  getQuestion: (id: number): Promise<Result<ConsultationQuestion>> => {
    return request.get(`/consultation/questions/${id}`)
  },
  getMyQuestions: (params: PageRequest): Promise<Result<PageResult<ConsultationQuestion>>> => {
    return request.get('/consultation/questions/my', { params })
  },
  getAllQuestions: (
    params: PageRequest & { status?: string; category?: string }
  ): Promise<Result<PageResult<ConsultationQuestion>>> => {
    return request.get('/consultation/questions', { params })
  },
  rateQuestion: (id: number, satisfactionScore: number): Promise<Result<void>> => {
    return request.post(`/consultation/questions/${id}/rate`, null, {
      params: { satisfactionScore },
    })
  },
  transferToHuman: (id: number, data: TransferToHumanRequest): Promise<Result<void>> => {
    return request.post(`/consultation/questions/${id}/transfer`, data)
  },
  uploadImage: (file: File): Promise<Result<string>> => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/consultation/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  uploadVoice: (file: File): Promise<Result<string>> => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/consultation/upload/voice', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  submitQuestionDify: async (
    data: any,
    onChunk: (chunk: string) => void,
    token: string
  ): Promise<void> => {
    console.log('开始Dify流式请求，数据:', data)

    if (!token) {
      throw new Error('Token is required for streaming request')
    }

    const url = '/api/v1/consultation/dify/chat'

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('请求失败，状态码:', response.status, '错误信息:', errorText)
        throw new Error(`请求失败: ${response.status} ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder('utf-8')
      let buffer = ''

      if (!reader) {
        throw new Error('无法获取响应流')
      }

      try {
        while (true) {
          const { done, value } = await reader.read()

          if (done) {
            console.log('Dify流式读取完成')
            break
          }

          buffer += decoder.decode(value, { stream: true })

          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmedLine = line.trim()
            if (trimmedLine.startsWith('data:')) {
              const chunkData = trimmedLine.substring(5).trim()
              if (chunkData) {
                console.log('收到Dify数据块:', chunkData)
                onChunk(chunkData)
              }
            }
          }
        }

        if (buffer.trim()) {
          const trimmedBuffer = buffer.trim()
          if (trimmedBuffer.startsWith('data:')) {
            const chunkData = trimmedBuffer.substring(5).trim()
            if (chunkData) {
              console.log('收到Dify数据块:', chunkData)
              onChunk(chunkData)
            }
          }
        }
      } catch (readError) {
        console.error('读取Dify流数据失败:', readError)
        throw readError
      }

      console.log('Dify流式请求完成')
    } catch (error) {
      console.error('Dify流式请求异常:', error)
      throw error
    }
  },
}

// 请假相关API
export const leaveApi = {
  submitApplication: (data: LeaveApplicationRequest): Promise<Result<LeaveApplication>> => {
    return request.post('/leave/applications', data)
  },
  getApplication: (id: number): Promise<Result<LeaveApplication>> => {
    return request.get(`/leave/applications/${id}`)
  },
  getMyApplications: (params: PageRequest): Promise<Result<PageResult<LeaveApplication>>> => {
    return request.get('/leave/applications/my', { params })
  },
  getPendingApplications: (params: PageRequest): Promise<Result<PageResult<LeaveApplication>>> => {
    return request.get('/leave/applications/pending', { params })
  },
  approveApplication: (id: number, data: ApprovalRequest): Promise<Result<void>> => {
    return request.post(`/leave/applications/${id}/approve`, data)
  },
  generateLeaveSlip: (id: number): Promise<Result<void>> => {
    return request.post(`/leave/applications/${id}/generate-slip`)
  },
  downloadLeaveSlip: (id: number): void => {
    window.open(`/api/v1/leave/applications/${id}/download-slip`, '_blank')
  },
  cancelLeave: (id: number): Promise<Result<void>> => {
    return request.post(`/leave/applications/${id}/cancel`)
  },
}

// 奖助相关API
export const awardApi = {
  submitApplication: (data: AwardApplicationRequest): Promise<Result<AwardApplication>> => {
    return request.post('/award/applications', data)
  },
  getApplication: (id: number): Promise<Result<AwardApplication>> => {
    return request.get(`/award/applications/${id}`)
  },
  getMyApplications: (params: PageRequest): Promise<Result<PageResult<AwardApplication>>> => {
    return request.get('/award/applications/my', { params })
  },
  getPendingApplications: (params: PageRequest): Promise<Result<PageResult<AwardApplication>>> => {
    return request.get('/award/applications/pending', { params })
  },
  approveApplication: (id: number, data: ApprovalRequest): Promise<Result<void>> => {
    return request.post(`/award/applications/${id}/approve`, data)
  },
}

// 通知相关API
export const notificationApi = {
  getNotifications: (params: PageRequest): Promise<Result<PageResult<Notification>>> => {
    return request.get('/notifications', { params })
  },
  getUnreadNotifications: (): Promise<Result<Notification[]>> => {
    return request.get('/notifications/unread')
  },
  getUnreadCount: (): Promise<Result<UnreadCountResponse>> => {
    return request.get('/notifications/unread/count')
  },
  markAsRead: (id: number): Promise<Result<void>> => {
    return request.put(`/notifications/${id}/read`)
  },
  markAllAsRead: (): Promise<Result<void>> => {
    return request.put('/notifications/read-all')
  },
  deleteNotification: (id: number): Promise<Result<void>> => {
    return request.delete(`/notifications/${id}`)
  },
}
