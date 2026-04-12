import request from '@/utils/request'

export interface TransferConfig {
  id: number
  businessType: string
  assignMode: string
  roleId?: number
  roleName?: string
  priority: number
  enabled: boolean
  remark?: string
  userIds?: number[]
  userNames?: string[]
}

export const transferConfigApi = {
  list: (): Promise<TransferConfig[]> => request.get('/consultation/transfer-config'),
  create: (data: object): Promise<TransferConfig> =>
    request.post('/consultation/transfer-config', data),
  update: (id: number, data: object): Promise<TransferConfig> =>
    request.put(`/consultation/transfer-config/${id}`, data),
  delete: (id: number): Promise<void> => request.delete(`/consultation/transfer-config/${id}`),
}
