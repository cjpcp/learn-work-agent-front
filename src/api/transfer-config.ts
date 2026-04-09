import request from '@/utils/request'

export const transferConfigApi = {
  list: (): Promise<any[]> => request.get('/consultation/transfer-config'),
  create: (data: any): Promise<any> => request.post('/consultation/transfer-config', data),
  update: (id: number, data: any): Promise<any> =>
    request.put(`/consultation/transfer-config/${id}`, data),
  delete: (id: number): Promise<void> => request.delete(`/consultation/transfer-config/${id}`),
}