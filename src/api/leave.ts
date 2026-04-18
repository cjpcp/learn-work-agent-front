import type { LeaveApplication, LeaveApplicationRequest, PageResult } from '@/types'
import request from '@/utils/request'
import axios from 'axios'
import { useUserStore } from '@/stores/user'

export const leaveApi = {
  submitApplication: (data: LeaveApplicationRequest): Promise<LeaveApplication> =>
    request.post('/leave/applications', data),
  getMyApplications: (params?: object): Promise<PageResult<LeaveApplication>> => {
    return request.get('/leave/applications/my', { params })
  },
  getApplication: (id: number): Promise<LeaveApplication> =>
    request.get(`/leave/applications/${id}`),
  downloadLeaveSlip: (id: number): void => {
    window.open(`/api/v1/leave/applications/${id}/download-slip`)
  },
  cancelLeave: (id: number): Promise<void> => request.post(`/leave/applications/${id}/cancel`),
  withdrawApplication: (id: number): Promise<void> =>
    request.delete(`/leave/applications/${id}`),
  approveCancelRequest: (id: number, status: string, comment: string): Promise<void> =>
    request.post(`/leave/applications/${id}/approve-cancel`, {
      approvalStatus: status,
      approvalComment: comment,
    }),
  getPendingCancelRequests: (params?: object): Promise<PageResult<LeaveApplication>> =>
    request.get('/leave/applications/pending-cancel', { params }),
  generateLeaveSlip: (id: number): Promise<void> =>
    request.post(`/leave/applications/${id}/generate-slip`),
  previewLeaveSlip: async (data: object): Promise<void> => {
    const userStore = useUserStore()
    const response = await axios.post('/api/v1/leave/slip-preview', data, {
      headers: {
        'Content-Type': 'application/json',
        ...(userStore.token ? { Authorization: `Bearer ${userStore.token}` } : {}),
      },
      responseType: 'blob',
    })
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `请假条_${Date.now()}.docx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },
}
