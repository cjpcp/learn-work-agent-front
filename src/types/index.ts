// 统一响应结果
export interface Result<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

// 分页请求
export interface PageRequest {
  pageNum?: number
  pageSize?: number
  orderBy?: string
  orderDirection?: 'ASC' | 'DESC'
}

// 分页结果
export interface PageResult<T> {
  records: T[]
  total: number
  pageNum: number
  pageSize: number
  totalPages: number
}

// 用户相关
export interface User {
  id?: number
  username: string
  realName?: string
  studentNo?: string
  phone?: string
  email?: string
  role: 'STUDENT' | 'COUNSELOR' | 'ADMIN'
  status?: 'ACTIVE' | 'INACTIVE'
  createTime?: string
  updateTime?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  userId: number
  username: string
  realName: string
  role: string
}

// 咨询相关
export interface ConsultationRequest {
  questionText: string
  questionType: 'TEXT' | 'VOICE' | 'IMAGE'
  category?: 'AWARD' | 'DORM' | 'DISCIPLINE' | 'MENTAL' | 'EMPLOYMENT'
  imageUrl?: string
  voiceUrl?: string
}

export interface ConsultationQuestion {
  id?: number
  userId: number
  questionText: string
  questionType: string
  category?: string
  imageUrl?: string
  voiceUrl?: string
  answerText?: string
  status?: 'PENDING' | 'ANSWERED' | 'TRANSFERRED'
  satisfactionScore?: number
  createTime?: string
  updateTime?: string
}

export interface TransferToHumanRequest {
  reason?: string
}

// 请假相关
export interface LeaveApplicationRequest {
  leaveType: 'SICK' | 'PERSONAL' | 'PUBLIC'
  startDate: string
  endDate: string
  reason?: string
  attachmentUrl?: string
}

export interface LeaveApplication {
  id?: number
  applicantId?: number
  leaveType: string
  startDate: string
  endDate: string
  days?: number
  reason?: string
  attachmentUrl?: string
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED'
  approverId?: number
  approvalComment?: string
  approvalTime?: string
  leaveSlipStatus?: string
  leaveSlipUrl?: string
  cancelled?: boolean
  cancelTime?: string
  createTime?: string
  updateTime?: string
}

export interface ApprovalRequest {
  approvalStatus: 'APPROVED' | 'REJECTED'
  approvalComment?: string
}

// 奖助相关
export interface AwardApplicationRequest {
  applicationType: 'SCHOLARSHIP' | 'GRANT' | 'SUBSIDY'
  awardName: string
  amount?: number
  reason?: string
  attachmentUrls?: string[]
}

export interface AwardApplication {
  id?: number
  userId: number
  applicationType: string
  awardName: string
  amount?: number
  reason?: string
  attachmentUrls?: string[]
  status?: 'PENDING' | 'APPROVED' | 'REJECTED'
  approverId?: number
  approvalComment?: string
  approvalTime?: string
  createTime?: string
  updateTime?: string
}

// 通知相关
export interface Notification {
  id?: number
  userId: number
  type: string
  title: string
  content: string
  isRead?: boolean
  readTime?: string
  businessId?: number
  businessType?: string
  createTime?: string
}

export interface UnreadCountResponse {
  count: number
}
