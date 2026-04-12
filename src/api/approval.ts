import request from '@/utils/request'

export interface ApprovalTask {
  id: number
  businessId: string | number
  businessType: string
  status: string
}

export interface ApprovalStep {
  stepName: string
  status: string
  approverName: string
  approvalTime: string
  comment?: string
}

export interface ApprovalInstance {
  status: string
  steps?: ApprovalStep[]
}

export const approvalApi = {
  getPendingTasks: (): Promise<ApprovalTask[]> => request.get('/approval/tasks/pending'),
  processTask: (id: number, data: object): Promise<void> =>
    request.post(`/approval/tasks/${id}/process`, data),
  getApprovalInstance: (businessType: string, businessId: number): Promise<ApprovalInstance> => {
    return request.get(`/approval/instances/${businessType}/${businessId}`)
  },
}

export interface ApprovalProcess {
  id: number
  processName: string
  processType: string
  description: string
  enabled: boolean
  version: number
}

export interface ApprovalStepConfig {
  id?: number
  stepName: string
  stepOrder: number
  approvalType: string
  approverRole?: string
  approverUserId?: number
  mustPass: boolean
  assignMode?: 'USER' | 'ROLE'
  roleId?: string
}

export const approvalConfigApi = {
  getProcesses: (): Promise<ApprovalProcess[]> => request.get('/approval/config/processes'),
  createProcess: (data: object): Promise<ApprovalProcess> =>
    request.post('/approval/config/processes', data),
  updateProcess: (id: number, data: object): Promise<ApprovalProcess> =>
    request.put(`/approval/config/processes/${id}`, data),
  deleteProcess: (id: number): Promise<void> => request.delete(`/approval/config/processes/${id}`),
  getSteps: (processId: number): Promise<ApprovalStepConfig[]> =>
    request.get(`/approval/config/processes/${processId}/steps`),
  addStep: (data: object): Promise<ApprovalStepConfig> =>
    request.post('/approval/config/steps', data),
  updateStep: (id: number, data: object): Promise<ApprovalStepConfig> =>
    request.put(`/approval/config/steps/${id}`, data),
  deleteStep: (id: number): Promise<void> => request.delete(`/approval/config/steps/${id}`),
  enableProcess: (id: number): Promise<void> =>
    request.post(`/approval/config/processes/${id}/enable`),
  disableProcess: (id: number): Promise<void> =>
    request.post(`/approval/config/processes/${id}/disable`),
}
