import request from '@/utils/request'

export const approvalApi = {
  getPendingTasks: (): Promise<any> => request.get('/approval/tasks/pending'),
  processTask: (id: number, data: any): Promise<any> =>
    request.post(`/approval/tasks/${id}/process`, data),
  getApprovalInstance: (businessType: string, businessId: number): Promise<any> => {
    return request.get(`/approval/instances/${businessType}/${businessId}`)
  },
}

export const approvalConfigApi = {
  getProcesses: (): Promise<any> => request.get('/approval/config/processes'),
  createProcess: (data: any): Promise<any> => request.post('/approval/config/processes', data),
  updateProcess: (id: number, data: any): Promise<any> =>
    request.put(`/approval/config/processes/${id}`, data),
  deleteProcess: (id: number): Promise<any> => request.delete(`/approval/config/processes/${id}`),
  getSteps: (processId: number): Promise<any> =>
    request.get(`/approval/config/processes/${processId}/steps`),
  addStep: (data: any): Promise<any> => request.post('/approval/config/steps', data),
  updateStep: (id: number, data: any): Promise<any> =>
    request.put(`/approval/config/steps/${id}`, data),
  deleteStep: (id: number): Promise<any> => request.delete(`/approval/config/steps/${id}`),
  enableProcess: (id: number): Promise<any> =>
    request.post(`/approval/config/processes/${id}/enable`),
  disableProcess: (id: number): Promise<any> =>
    request.post(`/approval/config/processes/${id}/disable`),
}