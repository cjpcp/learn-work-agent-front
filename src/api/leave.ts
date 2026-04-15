import type { LeaveApplication, LeaveApplicationRequest, PageResult } from '@/types'
import request from '@/utils/request'
import { apiConfig } from '@/utils/request'

export const leaveApi = {
  submitApplication: (data: LeaveApplicationRequest): Promise<LeaveApplication> =>
    request.post('/leave/applications', data),
  getMyApplications: (params?: object): Promise<PageResult<LeaveApplication>> => {
    return request.get('/leave/applications/my', { params })
  },
  getApplication: (id: number): Promise<LeaveApplication> =>
    request.get(`/leave/applications/${id}`),
  downloadLeaveSlip: (id: number): void => {
    window.open(apiConfig.getFullUrl(`/leave/applications/${id}/download-slip`))
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
}
