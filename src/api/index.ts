import type {
  AwardApplication,
  ConsultationQuestion,
  LeaveApplication,
  PageRequest,
  PageResult,
  Result,
} from '@/types'
import request from '@/utils/request'
import { encrypt } from '@/utils/crypto'
import type { AxiosProgressEvent } from 'axios'

export interface ConsultationRequest {
  questionText?: string
  questionType: 'TEXT' | 'IMAGE' | 'VOICE'
  category?: string
  voiceUrl?: string
  sessionId?: string
  files?: { transferMethod: string; url: string; type: string }[]
}

export interface TransferToHumanRequest {
  reason?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  nick: string
  roleId: number
  teacher: boolean
  teacherName?: string
  phone?: string
  cardNumber?: string
}

export const authApi = {
  login: (
    data: LoginRequest
  ): Promise<{
    token: string
    adminId: number
    username: string
    nick: string
    teacherId: number
    teacherName: string
    roleId: number
    roleName: string
    status: number
  }> => {
    const encryptedData = {
      username: data.username,
      password: encrypt(data.password),
    }
    return request.post('/auth/login', encryptedData)
  },

  register: (data: RegisterRequest): Promise<any> => {
    const encryptedData = {
      ...data,
      password: encrypt(data.password),
    }
    return request.post('/auth/register', encryptedData)
  },

  checkUsername: (username: string): Promise<boolean> => {
    return request.get('/auth/check-username', { params: { username } })
  },
}

export const consultationApi = {
  submitQuestion: (data: ConsultationRequest): Promise<Result<ConsultationQuestion>> => {
    return request.post('/consultation/questions', data)
  },
  submitQuestionStream: async (
    data: ConsultationRequest,
    onChunk: (chunk: string) => void,
    token: string
  ): Promise<void> => {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/v1/consultation/questions/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    )

    if (!response.ok) {
      throw new Error(`请求失败: ${response.status} ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    if (!reader) {
      throw new Error('无法获取响应流')
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let eventEndIndex
      while ((eventEndIndex = buffer.indexOf('\n\n')) !== -1) {
        const event = buffer.substring(0, eventEndIndex)
        buffer = buffer.substring(eventEndIndex + 2)
        const lines = event.split('\n')
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const jsonStr = line.substring(5).trim()
            if (jsonStr && jsonStr !== '[DONE]') {
              try {
                const payload = JSON.parse(jsonStr)
                if (payload.answer) onChunk(payload.answer)
              } catch {
                onChunk(jsonStr)
              }
            }
          }
        }
      }
    }
  },
  getMyQuestions: (params: PageRequest): Promise<PageResult<ConsultationQuestion>> => {
    return request.get('/consultation/questions/my', { params })
  },
  getQuestionHistory: (id: number): Promise<any[]> => {
    return request.get(`/consultation/questions/${id}/history`)
  },
  transferToHuman: (id: number, data: TransferToHumanRequest): Promise<Result<void>> => {
    return request.post(`/consultation/questions/${id}/transfer`, data)
  },
  uploadVoice: (file: File): Promise<Result<string>> => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/consultation/upload/voice', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  uploadFile: (file: File | Blob, filename?: string): Promise<Result<string>> => {
    const formData = new FormData()
    formData.append('file', file, filename || 'file')
    return request.post('/consultation/upload/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  getUserTransfers: (params: PageRequest): Promise<PageResult<any>> => {
    return request.get('/consultation/transfers', { params })
  },
  getTransferDetail: (id: number): Promise<any> => request.get(`/consultation/transfers/${id}`),
  assignStaff: (id: number, staffId: number): Promise<void> => {
    return request.post(`/consultation/transfers/${id}/assign`, null, { params: { staffId } })
  },
  replyToTransfer: (id: number, reply: string): Promise<void> => {
    return request.post(`/consultation/transfers/${id}/reply`, null, { params: { reply } })
  },
  processTransfer: (id: number, reply: string): Promise<void> => {
    return request.post(`/consultation/transfers/${id}/process`, null, { params: { reply } })
  },
  getStaffTransfers: (params: PageRequest): Promise<PageResult<any>> => {
    return request.get('/consultation/transfers/staff', { params })
  },
  getCompletedTransfers: (params: PageRequest): Promise<PageResult<any>> => {
    return request.get('/consultation/transfers/completed', { params })
  },
}

export const awardApi = {
  submitApplication: (data: never): Promise<Result<void>> => request.post('/award/applications', data),
  getMyApplications: (params?: any): Promise<AwardApplication[]> => request.get('/award/applications/my', { params }),
  getApplicationDetail: (id: number): Promise<AwardApplication> => request.get(`/award/applications/${id}`),
  getApplication: (id: number): Promise<AwardApplication> => request.get(`/award/applications/${id}`),
  approveApplication: (id: number, approved: boolean, comment?: string): Promise<void> => {
    return request.post(`/award/applications/${id}/approve`, { approved, comment })
  },
  getPendingApplications: (): Promise<AwardApplication[]> => request.get('/award/applications/pending'),
}

export const leaveApi = {
  submitApplication: (data: any): Promise<Result<void>> => request.post('/leave/applications', data),
  getMyApplications: (params?: any): Promise<PageResult<LeaveApplication>> => {
    return request.get('/leave/applications/my', { params })
  },
  getApplication: (id: number): Promise<LeaveApplication> => request.get(`/leave/applications/${id}`),
  downloadLeaveSlip: (id: number): void => {
    window.open(`/api/v1/leave/applications/${id}/download-slip`)
  },
  cancelLeave: (id: number): Promise<void> => request.post(`/leave/applications/${id}/cancel`),
  generateLeaveSlip: (id: number): Promise<void> => request.post(`/leave/applications/${id}/generate-slip`),
}

export const approvalApi = {
  getPendingTasks: (): Promise<any> => request.get('/approval/tasks/pending'),
  processTask: (id: number, data: any): Promise<any> => request.post(`/approval/tasks/${id}/process`, data),
  getApprovalInstance: (businessType: string, businessId: number): Promise<any> => {
    return request.get(`/approval/instances/${businessType}/${businessId}`)
  },
}

export const approvalConfigApi = {
  getProcesses: (): Promise<any> => request.get('/approval/config/processes'),
  createProcess: (data: any): Promise<any> => request.post('/approval/config/processes', data),
  updateProcess: (id: number, data: any): Promise<any> => request.put(`/approval/config/processes/${id}`, data),
  deleteProcess: (id: number): Promise<any> => request.delete(`/approval/config/processes/${id}`),
  getSteps: (processId: number): Promise<any> => request.get(`/approval/config/processes/${processId}/steps`),
  addStep: (data: any): Promise<any> => request.post('/approval/config/steps', data),
  updateStep: (id: number, data: any): Promise<any> => request.put(`/approval/config/steps/${id}`, data),
  deleteStep: (id: number): Promise<any> => request.delete(`/approval/config/steps/${id}`),
  enableProcess: (id: number): Promise<any> => request.post(`/approval/config/processes/${id}/enable`),
  disableProcess: (id: number): Promise<any> => request.post(`/approval/config/processes/${id}/disable`),
}

export const transferConfigApi = {
  list: (): Promise<any[]> => request.get('/consultation/transfer-config'),
  create: (data: any): Promise<any> => request.post('/consultation/transfer-config', data),
  update: (id: number, data: any): Promise<any> => request.put(`/consultation/transfer-config/${id}`, data),
  delete: (id: number): Promise<void> => request.delete(`/consultation/transfer-config/${id}`),
}

export const processApi = {
  getProcessList: (): Promise<any> => request.get('/process/list'),
  getCompletedProcesses: (): Promise<any> => request.get('/process/completed'),
  getProcessDetail: (id: string, type: string): Promise<any> => request.get(`/process/${id}`, { params: { type } }),
}

export const fileApi = {
  upload: (
    file: File,
    type: 'image' | 'document' | 'voice',
    onProgress?: (progress: number) => void
  ): Promise<Result<string>> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    return request.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })
  },
}

export const notificationApi = {
  getNotifications: (params?: any): Promise<Result<any>> => request.get('/notifications', { params }),
  markAsRead: (id: number): Promise<Result<void>> => request.post(`/notifications/${id}/read`),
  getUnreadCount: (): Promise<Result<{ count: number }>> => request.get('/notifications/unread-count'),
}

export const systemApi = {
  getStaffRoles: (): Promise<{ id: number; code: string; name: string; pagePath: string }[]> => {
    return request.get('/system/roles/staff')
  },
  getAllRoles: (): Promise<{ id: number; code: string; name: string; pagePath: string }[]> => {
    return request.get('/system/roles')
  },
  getUsers: (params?: { pageNum?: number; pageSize?: number; roleId?: number; teacherKeyword?: string; username?: string; nick?: string; status?: number }): Promise<PageResult<{
    id: number
    username: string
    nick: string
    teacherId: number
    teacherName: string
    cardNumber: string
    roleId: number
    roleName: string
    status: number
    name: string
  }>> => {
    return request.get('/system/users', { params: params || {} })
  },
}
