import request from '@/utils/request'
import type { PageRequest } from '@/types'

export interface PendingParams extends PageRequest {
  processType?: string
}

export interface CompletedParams extends PageRequest {
  processType?: string
}

export const processApi = {
  getPendingAward: (params: PageRequest) => {
    return request.get('/process/pending/award', { params })
  },
  getPendingLeave: (params: PageRequest) => {
    return request.get('/process/pending/leave', { params })
  },
  getPendingLeaveCancel: (params: PageRequest) => {
    return request.get('/process/pending/leave-cancel', { params })
  },
  getPendingAll: (params: PageRequest) => {
    return request.get('/process/pending/all', { params })
  },
  getCompletedAward: (params: PageRequest) => {
    return request.get('/process/completed/award', { params })
  },
  getCompletedLeave: (params: PageRequest) => {
    return request.get('/process/completed/leave', { params })
  },
  getCompletedLeaveCancel: (params: PageRequest) => {
    return request.get('/process/completed/leave-cancel', { params })
  },
  getCompletedAll: (params: PageRequest) => {
    return request.get('/process/completed/all', { params })
  },
}