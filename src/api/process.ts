import request from '@/utils/request'
import type { PageRequest, PageResult } from '@/types'

export interface PendingParams extends PageRequest {
  processType?: string
}

export interface CompletedParams extends PageRequest {
  processType?: string
}

export interface ProcessItem {
  id: string
  processType: string
  title: string
  content: string
  status: string
  createTime: string
  updateTime: string
  [key: string]: unknown
}

export const processApi = {
  getPendingAward: (params: PageRequest): Promise<PageResult<ProcessItem>> => {
    return request.get('/process/pending/award', { params })
  },
  getPendingLeave: (params: PageRequest): Promise<PageResult<ProcessItem>> => {
    return request.get('/process/pending/leave', { params })
  },
  getPendingLeaveCancel: (params: PageRequest): Promise<PageResult<ProcessItem>> => {
    return request.get('/process/pending/leave-cancel', { params })
  },
  getPendingAll: (params: PageRequest): Promise<PageResult<ProcessItem>> => {
    return request.get('/process/pending/all', { params })
  },
  getCompletedAward: (params: PageRequest): Promise<PageResult<ProcessItem>> => {
    return request.get('/process/completed/award', { params })
  },
  getCompletedLeave: (params: PageRequest): Promise<PageResult<ProcessItem>> => {
    return request.get('/process/completed/leave', { params })
  },
  getCompletedLeaveCancel: (params: PageRequest): Promise<PageResult<ProcessItem>> => {
    return request.get('/process/completed/leave-cancel', { params })
  },
  getCompletedAll: (params: PageRequest): Promise<PageResult<ProcessItem>> => {
    return request.get('/process/completed/all', { params })
  },
}
