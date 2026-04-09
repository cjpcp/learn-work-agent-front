import type { LeaveApplication, PageResult, Result } from '@/types'
import request from '@/utils/request'

export const leaveApi = {
  submitApplication: (data: any): Promise<Result<void>> =>
    request.post('/leave/applications', data),
  getMyApplications: (params?: any): Promise<PageResult<LeaveApplication>> => {
    return request.get('/leave/applications/my', { params })
  },
  getApplication: (id: number): Promise<LeaveApplication> =>
    request.get(`/leave/applications/${id}`),
  downloadLeaveSlip: (id: number): void => {
    window.open(`/api/v1/leave/applications/${id}/download-slip`)
  },
  cancelLeave: (id: number): Promise<void> => request.post(`/leave/applications/${id}/cancel`),
  approveCancelRequest: (id: number, status: string, comment: string): Promise<void> =>
    request.post(`/leave/applications/${id}/approve-cancel`, {
      approvalStatus: status,
      approvalComment: comment,
    }),
  getPendingCancelRequests: (params?: any): Promise<any> =>
    request.get('/leave/applications/pending-cancel', { params }),
  generateLeaveSlip: (id: number): Promise<void> =>
    request.post(`/leave/applications/${id}/generate-slip`),
}