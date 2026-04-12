import request from '@/utils/request'
import type { PageResult } from '@/types'

export interface Role {
  id: number
  code: string
  name: string
  pagePath?: string
}

export interface User {
  id: number
  username: string
  nick: string
  teacherId?: number
  teacherName?: string
  cardNumber?: string
  roleId: number
  roleName?: string
  status?: number
}

export interface UserQueryParams {
  pageNum?: number
  pageSize?: number
  roleId?: number
  username?: string
  nick?: string
  status?: number
  teacherKeyword?: string
}

export const systemApi = {
  getAllRoles: (): Promise<Role[]> => {
    return request.get('/system/roles')
  },
  getStaffRoles: (): Promise<Role[]> => {
    return request.get('/system/roles/staff')
  },
  getUsers: (params?: UserQueryParams): Promise<PageResult<User>> => {
    return request.get('/system/users', { params })
  },
}
