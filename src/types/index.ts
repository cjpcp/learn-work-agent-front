// 统一响应结果
export interface Result<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

export interface PageRequest {
  pageNum?: number
  pageSize?: number
  orderBy?: string
  orderDirection?: 'ASC' | 'DESC'
}

export interface PageResult<T> {
  records: T[]
  total: number
  pageNum: number
  pageSize: number
  totalPages: number
}

export interface User {
  id?: number
  username: string
  nick: string
  teacherId?: number
  teacherName?: string
  phone?: string
  cardNumber?: string
  roleId?: number
  roleName?: string
  status?: number
  createTime?: string
  updateTime?: string
}

export interface LoginRequest {
  username: string
  password: string
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

export interface FileInput {
  transferMethod: string
  url: string
  type: string
}

export interface ConsultationRequest {
  questionText: string
  questionType: 'TEXT' | 'VOICE' | 'IMAGE'
  category?: 'AWARD' | 'DORM' | 'DISCIPLINE' | 'MENTAL' | 'EMPLOYMENT'
  imageUrl?: string
  voiceUrl?: string
  files?: FileInput[]
  sessionId?: string
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

export interface LeaveApplicationRequest {
  leaveType: 'SICK' | 'PERSONAL' | 'PUBLIC'
  startDate: string
  endDate: string
  reason?: string
  attachmentUrl?: string
  studentName?: string
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
  studentName?: string
  createTime?: string
  updateTime?: string
}

export interface ApprovalRequest {
  approvalStatus: 'APPROVED' | 'REJECTED'
  approvalComment?: string
}

export interface AwardApplicationRequest {
  applicationType: 'SCHOLARSHIP' | 'GRANT' | 'SUBSIDY'
  awardName: string
  amount?: number
  reason?: string
  attachmentUrls?: string[]
  studentName?: string
}

export interface AwardApplication {
  id?: number
  applicantId?: number
  userId?: number
  applicationType: string
  awardName: string
  amount?: number
  reason?: string
  attachmentUrls?: string[]
  materialStatus?: 'PENDING' | 'PASSED' | 'FAILED'
  materialComment?: string
  materialReviewTime?: string
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED'
  approverId?: number
  approvalComment?: string
  approvalTime?: string
  studentName?: string
  createTime?: string
  updateTime?: string
}

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

export interface ProcessItem {
  id: string
  name: string
  type: string
  createTime: string
  status: string
  description: string
}

export interface ProcessListResponse {
  pending: ProcessItem[]
  completed: ProcessItem[]
}
