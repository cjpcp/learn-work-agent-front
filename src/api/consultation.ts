import type { ConsultationQuestion, ConversationMessage, PageRequest, PageResult } from '@/types'
import request from '@/utils/request'

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
  questionType?: string
  questionText?: string
  files?: { url: string; type: string; name: string }[]
}

export interface TransferDetail {
  transfer: HumanTransfer
  history: {
    id?: number
    questionText?: string
    answer?: string
    questionType?: string
    createTime?: string
  }[]
}

export interface HumanTransfer {
  id: number
  questionId?: number
  questionType?: string
  questionText?: string
  transferReason?: string
  transferType?: string
  status?: string
  staffId?: number
  staffName?: string
  staffReply?: string
  fileUrls?: string
  createTime?: string
  processTime?: string
}

export interface UserMessagePayload {
  questionText: string
  messageType: string
  files?: { url: string; type: string; name: string }[]
}

export const consultationApi = {
  submitQuestion: (data: ConsultationRequest): Promise<ConsultationQuestion> => {
    return request.post('/consultation/questions', data)
  },
  submitQuestionStream: async (
    data: ConsultationRequest,
    onChunk: (chunk: string) => void,
    token: string
  ): Promise<void> => {
    const response = await fetch(
      '/api/v1/consultation/questions/stream',
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
  submitQuestionStreamMultipart: async (
    formData: FormData,
    onChunk: (chunk: string) => void,
    token: string,
    onUserMessage?: (msg: UserMessagePayload) => void
  ): Promise<void> => {
    const response = await fetch(
      '/api/v1/consultation/questions/stream/multipart',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
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

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        let eventEndIndex
        while ((eventEndIndex = buffer.indexOf('\n\n')) !== -1) {
          const event = buffer.substring(0, eventEndIndex)
          buffer = buffer.substring(eventEndIndex + 2)
          for (const line of event.split('\n')) {
            if (line.startsWith('data:')) {
              const jsonStr = line.substring(5).trim()
              if (jsonStr && jsonStr !== '[DONE]') {
                try {
                  const parsed = JSON.parse(jsonStr)
                  if (parsed.error) {
                    throw new Error(parsed.error)
                  }
                  if ((parsed.messageType === 'user' || parsed.messageType === 'init') && onUserMessage) {
                    onUserMessage(parsed as UserMessagePayload)
                  } else if (parsed.answer) {
                    onChunk(parsed.answer)
                  }
                } catch (parseError) {
                  if (parseError instanceof Error && parseError.message.startsWith('请求失败')) {
                    throw parseError
                  }
                  if (jsonStr.startsWith('{') && !jsonStr.includes('"answer"')) {
                    try { onUserMessage?.(JSON.parse(jsonStr) as UserMessagePayload) } catch { /* empty */ }
                  } else {
                    onChunk(jsonStr)
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TypeError')) {
        return
      }
      throw error
    }
  },
  getMyQuestions: (params: PageRequest): Promise<PageResult<ConsultationQuestion>> => {
    return request.get('/consultation/questions/my', { params })
  },
  getQuestionHistory: (id: number): Promise<ConversationMessage[]> => {
    return request.get(`/consultation/questions/${id}/history`)
  },
  transferToHuman: (id: number, data: TransferToHumanRequest): Promise<void> => {
    return request.post(`/consultation/questions/${id}/transfer`, data)
  },
  directTransferToHuman: (data: TransferToHumanRequest): Promise<void> => {
    return request.post('/consultation/transfer', data)
  },
  uploadVoice: (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/consultation/upload/voice', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  uploadFile: (file: File | Blob, filename?: string): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file, filename || 'file')
    return request.post('/consultation/upload/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  getUserTransfers: (params: PageRequest): Promise<PageResult<HumanTransfer>> => {
    return request.get('/consultation/transfers', { params })
  },
  getTransferDetail: (id: number): Promise<TransferDetail> =>
    request.get(`/consultation/transfers/${id}`),
  assignStaff: (id: number, staffId: number): Promise<void> => {
    return request.post(`/consultation/transfers/${id}/assign`, null, { params: { staffId } })
  },
  replyToTransfer: (id: number, reply: string): Promise<void> => {
    return request.post(`/consultation/transfers/${id}/reply`, null, { params: { reply } })
  },
  processTransfer: (id: number, reply: string): Promise<void> => {
    return request.post(`/consultation/transfers/${id}/process`, null, { params: { reply } })
  },
  getStaffTransfers: (params: PageRequest): Promise<PageResult<HumanTransfer>> => {
    return request.get('/consultation/transfers/staff', { params })
  },
  getCompletedTransfers: (params: PageRequest): Promise<PageResult<HumanTransfer>> => {
    return request.get('/consultation/transfers/completed', { params })
  },
  checkTransferConfigPermission: (): Promise<boolean> => {
    return request.get('/consultation/transfer-config/permission')
  },
}
