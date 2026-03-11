import type {
  AwardApplication,
  ConsultationQuestion,
  PageRequest,
  PageResult,
  Result,
} from '@/types'
import request from '@/utils/request'
import { encrypt } from '@/utils/crypto'
import type { AxiosProgressEvent } from 'axios'

export interface ConsultationRequest {
  questionText: string
  questionType: 'TEXT' | 'IMAGE' | 'VOICE'
  category?: string
  imageUrl?: string
  voiceUrl?: string
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
  realName: string
  studentNo: string
  email: string
  phone: string
  role?: string
  department?: string
  grade?: string
  className?: string
  workDepartment?: string
  position?: string
}

// 认证相关API
export const authApi = {
  // 登录
  login: (
    data: LoginRequest
  ): Promise<
    {
      token: string
      userId: number
      username: string
      realName: string
      role: string
      department?: string
      grade?: string
      className?: string
      workDepartment?: string
      position?: string
    }
  > => {
    // 加密密码后再发送
    const encryptedData = {
      username: data.username,
      password: encrypt(data.password),
    }
    return request.post('/auth/login', encryptedData)
  },

  // 注册
  register: (data: RegisterRequest): Promise<void> => {
    // 加密密码后再发送
    const encryptedData = {
      ...data,
      password: encrypt(data.password),
    }
    return request.post('/auth/register', encryptedData)
  },

  // 检查学号/工号是否存在
  checkStudentNo: (studentNo: string): Promise<boolean> => {
    return request.get('/auth/check-student-no', { params: { studentNo } })
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
    try {
      console.log('开始流式请求，数据:', data)

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

          // 处理SSE数据：寻找以\n\n结尾的完整事件
          let eventEndIndex
          while ((eventEndIndex = buffer.indexOf('\n\n')) !== -1) {
            const event = buffer.substring(0, eventEndIndex)
            buffer = buffer.substring(eventEndIndex + 2)

            // 解析SSE事件中的data字段
            const lines = event.split('\n')
            for (const line of lines) {
              if (line.startsWith('data:')) {
                const jsonStr = line.substring(5).trim()
                if (jsonStr && jsonStr !== '[DONE]') {
                  try {
                    const data = JSON.parse(jsonStr)
                    if (data.answer) {
                      console.log('收到数据块:', data.answer)
                      onChunk(data.answer)
                    }
                  } catch (e) {
                    // 如果不是JSON格式，直接返回原始内容
                    console.log('收到非JSON数据块:', jsonStr)
                    onChunk(jsonStr)
                  }
                }
              }
            }
          }
        }

        // 处理剩余的数据
        if (buffer.trim()) {
          const lines = buffer.split('\n')
          for (const line of lines) {
            if (line.startsWith('data:')) {
              const jsonStr = line.substring(5).trim()
              if (jsonStr && jsonStr !== '[DONE]') {
                try {
                  const data = JSON.parse(jsonStr)
                  if (data.answer) {
                    console.log('收到最后数据块:', data.answer)
                    onChunk(data.answer)
                  }
                } catch (e) {
                  console.log('收到最后非JSON数据块:', jsonStr)
                  onChunk(jsonStr)
                }
              }
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
  uploadFile: (file: File | Blob, filename?: string): Promise<Result<string>> => {
    const formData = new FormData()
    formData.append('file', file, filename || 'file')
    return request.post('/consultation/upload/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  getUserTransfers: (params: PageRequest): Promise<Result<PageResult<any>>> => {
    return request.get('/consultation/transfers', { params })
  },
  getTransferDetail: (id: number): Promise<Result<any>> => {
    return request.get(`/consultation/transfers/${id}`)
  },
  assignStaff: (id: number, staffId: number): Promise<Result<void>> => {
    return request.post(`/consultation/transfers/${id}/assign`, null, {
      params: { staffId },
    })
  },
  replyToTransfer: (id: number, reply: string): Promise<Result<void>> => {
    return request.post(`/consultation/transfers/${id}/reply`, null, {
      params: { reply },
    })
  },
  processTransfer: (id: number, reply: string): Promise<Result<void>> => {
    return request.post(`/consultation/transfers/${id}/process`, null, {
      params: { reply },
    })
  },
  getStaffTransfers: (params: PageRequest): Promise<Result<PageResult<any>>> => {
    return request.get('/consultation/transfers/staff', { params })
  },
  getCompletedTransfers: (params: PageRequest): Promise<Result<PageResult<any>>> => {
    return request.get('/consultation/transfers/completed', { params })
  },
}

// 奖助申请相关API
export const awardApi = {
  // 提交奖助申请
  submitApplication: (data: any): Promise<Result<void>> => {
    return request.post('/award/applications', data)
  },

  // 获取申请列表
  getApplications: (): Promise<Result<AwardApplication[]>> => {
    return request.get('/award/applications/my')
  },

  // 获取我的申请列表（别名，兼容旧代码）
  getMyApplications: (params?: any): Promise<Result<AwardApplication[]>> => {
    return request.get('/award/applications/my', { params })
  },

  // 获取申请详情
  getApplicationDetail: (id: number): Promise<Result<AwardApplication>> => {
    return request.get(`/award/applications/${id}`)
  },

  // 获取申请详情（别名，兼容旧代码）
  getApplication: (id: number): Promise<Result<AwardApplication>> => {
    return request.get(`/award/applications/${id}`)
  },

  // 审批申请（教师/管理员）
  approveApplication: (id: number, approved: boolean, comment?: string): Promise<Result<void>> => {
    return request.post(`/award/applications/${id}/approve`, { approved, comment })
  },

  // 获取待审批列表（教师/管理员）
  getPendingApplications: (): Promise<Result<AwardApplication[]>> => {
    return request.get('/award/applications/pending')
  },
}

// 请假申请相关API
export const leaveApi = {
  // 提交请假申请
  submitApplication: (data: any): Promise<Result<void>> => {
    return request.post('/leave/applications', data)
  },

  // 获取申请列表
  getApplications: (params?: any): Promise<Result<any>> => {
    return request.get('/leave/applications/my', { params })
  },

  // 获取我的申请列表（别名，兼容旧代码）
  getMyApplications: (params?: any): Promise<Result<any>> => {
    return request.get('/leave/applications/my', { params })
  },

  // 获取申请详情
  getApplication: (id: number): Promise<Result<any>> => {
    return request.get(`/leave/applications/${id}`)
  },

  // 审批申请（教师/管理员）
  approveApplication: (id: number, data: any): Promise<Result<void>> => {
    return request.post(`/leave/applications/${id}/approve`, data)
  },

  // 获取待审批列表（教师/管理员）
  getPendingApplications: (params?: any): Promise<Result<any>> => {
    return request.get('/leave/applications/pending', { params })
  },

  // 下载请假条
  downloadLeaveSlip: (id: number): void => {
    window.open(`/api/v1/leave/applications/${id}/download-slip`)
  },

  // 销假
  cancelLeave: (id: number): Promise<Result<void>> => {
    return request.post(`/leave/applications/${id}/cancel`)
  },

  // 生成请假条
  generateLeaveSlip: (id: number): Promise<Result<void>> => {
    return request.post(`/leave/applications/${id}/generate-slip`)
  },
}

// 审批相关API
export const approvalApi = {
  // 获取我的待审批任务
  getPendingTasks: (): Promise<Result<any>> => {
    return request.get('/approval/tasks/pending')
  },

  // 处理审批任务
  processTask: (id: number, data: any): Promise<Result<any>> => {
    return request.post(`/approval/tasks/${id}/process`, data)
  },

  // 获取审批详情
  getApprovalInstance: (businessType: string, businessId: number): Promise<Result<any>> => {
    return request.get(`/approval/instances/${businessType}/${businessId}`)
  },
}

// 审批流程配置相关API
export const approvalConfigApi = {
  // 获取所有审批流程
  getProcesses: (): Promise<Result<any>> => {
    return request.get('/approval/config/processes')
  },

  // 创建审批流程
  createProcess: (data: any): Promise<Result<any>> => {
    return request.post('/approval/config/processes', data)
  },

  // 更新审批流程
  updateProcess: (id: number, data: any): Promise<Result<any>> => {
    return request.put(`/approval/config/processes/${id}`, data)
  },

  // 删除审批流程
  deleteProcess: (id: number): Promise<Result<any>> => {
    return request.delete(`/approval/config/processes/${id}`)
  },

  // 获取流程的审批步骤
  getSteps: (processId: number): Promise<Result<any>> => {
    return request.get(`/approval/config/processes/${processId}/steps`)
  },

  // 添加审批步骤
  addStep: (data: any): Promise<Result<any>> => {
    return request.post('/approval/config/steps', data)
  },

  // 更新审批步骤
  updateStep: (id: number, data: any): Promise<Result<any>> => {
    return request.put(`/approval/config/steps/${id}`, data)
  },

  // 删除审批步骤
  deleteStep: (id: number): Promise<Result<any>> => {
    return request.delete(`/approval/config/steps/${id}`)
  },

  // 启用流程
  enableProcess: (id: number): Promise<Result<any>> => {
    return request.post(`/approval/config/processes/${id}/enable`)
  },

  // 禁用流程
  disableProcess: (id: number): Promise<Result<any>> => {
    return request.post(`/approval/config/processes/${id}/disable`)
  },
}

// 流程服务相关API
export const processApi = {
  // 获取流程列表（包含待办和已办）
  getProcessList: (): Promise<Result<any>> => {
    return request.get('/process/list')
  },

  // 获取流程详情
  getProcessDetail: (id: string, type: string): Promise<Result<any>> => {
    return request.get(`/process/${id}`, { params: { type } })
  },
}

// 文件上传API
export const fileApi = {
  // 上传文件
  upload: (
    file: File,
    type: 'image' | 'document' | 'voice',
    onProgress?: (progress: number) => void
  ): Promise<Result<string>> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    return request.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })
  },
}

// 通知相关API
export const notificationApi = {
  // 获取通知列表
  getNotifications: (params?: any): Promise<Result<any>> => {
    return request.get('/notifications', { params })
  },
  // 标记通知为已读
  markAsRead: (id: number): Promise<Result<void>> => {
    return request.post(`/notifications/${id}/read`)
  },
  // 获取未读通知数量
  getUnreadCount: (): Promise<Result<{ count: number }>> => {
    return request.get('/notifications/unread-count')
  },
}

// 系统相关API
export const systemApi = {
  // 获取学工角色列表
  getStaffRoles: (): Promise<Result<{ code: string; name: string }[]>> => {
    return request.get('/system/roles/staff')
  },
  // 获取所有角色列表
  getAllRoles: (): Promise<Result<{ code: string; name: string }[]>> => {
    return request.get('/system/roles')
  },
  // 获取部门列表
  getDepartments: (): Promise<Result<{ id: number; code: string; name: string; description: string }[]>> => {
    return request.get('/system/departments')
  },
  // 获取学院列表
  getColleges: (): Promise<Result<{ id: number; code: string; name: string; description: string }[]>> => {
    return request.get('/system/colleges')
  },
  // 获取用户列表
  getUsers: (departmentId?: number): Promise<Result<{ id: number; name: string; username: string; role: string }[]>> => {
    return request.get('/system/users', { params: departmentId ? { departmentId } : {} })
  },
}
