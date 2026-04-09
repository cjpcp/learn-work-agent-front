import type { AwardApplication, Result } from '@/types'
import request from '@/utils/request'

export const awardApi = {
  submitApplication: (data: never): Promise<Result<void>> =>
    request.post('/award/applications', data),
  getMyApplications: (params?: any): Promise<AwardApplication[]> =>
    request.get('/award/applications/my', { params }),
  getApplication: (id: number): Promise<AwardApplication> =>
    request.get(`/award/applications/${id}`),
  approveApplication: (id: number, approved: boolean, comment?: string): Promise<void> => {
    return request.post(`/award/applications/${id}/approve`, { approved, comment })
  },
  getPendingApplications: (): Promise<AwardApplication[]> =>
    request.get('/award/applications/pending'),
}