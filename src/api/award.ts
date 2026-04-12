import type { AwardApplication, AwardApplicationRequest, PageResult } from '@/types'
import request from '@/utils/request'

export const awardApi = {
  submitApplication: (data: AwardApplicationRequest): Promise<AwardApplication> =>
    request.post('/award/applications', data),
  getMyApplications: (params?: object): Promise<PageResult<AwardApplication>> =>
    request.get('/award/applications/my', { params }),
  getApplication: (id: number): Promise<AwardApplication> =>
    request.get(`/award/applications/${id}`),
  approveApplication: (id: number, approved: boolean, comment?: string): Promise<void> => {
    return request.post(`/award/applications/${id}/approve`, { approved, comment })
  },
  getPendingApplications: (): Promise<PageResult<AwardApplication>> =>
    request.get('/award/applications/pending'),
  cancelApplication: (id: number): Promise<void> =>
    request.delete(`/award/applications/${id}`),
}
