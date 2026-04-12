import request from '@/utils/request'
import { encrypt } from '@/utils/crypto'

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  nick: string
  roleId: number
  teacher: boolean
  teacherName?: string
  phone?: string
  cardNumber?: string
}

export interface LoginResponse {
  token: string
  adminId: number
  username: string
  nick: string
  teacherId: number
  teacherName: string
  roleId: number
  roleName: string
  status: number
}

export const authApi = {
  login: (data: LoginRequest): Promise<LoginResponse> => {
    const encryptedData = {
      username: data.username,
      password: encrypt(data.password),
    }
    return request.post('/auth/login', encryptedData)
  },

  register: (data: RegisterRequest): Promise<LoginResponse> => {
    const encryptedData = {
      ...data,
      password: encrypt(data.password),
    }
    return request.post('/auth/register', encryptedData)
  },

  checkUsername: (username: string): Promise<boolean> => {
    return request.get('/auth/check-username', { params: { username } })
  },
}
