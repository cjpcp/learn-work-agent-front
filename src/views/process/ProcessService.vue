<template>
  <div class="process-service-container">
    <a-page-header title="流程代办服务" sub-title="查看和管理您的代办流程" @back="$router.back()" />
    <a-card class="process-card">
      <a-tabs v-model:active-key="activeTab" class="process-tabs">
        <!-- 流程代办标签页 -->
        <a-tab-pane key="process" tab="流程代办">
          <a-tabs v-model:active-key="processActiveTab" class="sub-tabs" @change="handleProcessTabChange">
            <a-tab-pane key="pending" tab="待办流程">
              <div v-if="pendingProcesses.length === 0" class="empty-state">
                <a-empty description="暂无待办流程" />
              </div>
              <a-list v-else :data-source="pendingProcesses" class="process-list">
                <template #renderItem="{ item }">
                  <a-list-item class="process-item">
                    <a-list-item-meta>
                      <template #title>
                        <div class="process-title">
                          <span>{{ item.name }}</span>
                        </div>
                      </template>
                      <template #description>
                        <div class="process-info">
                          <div>{{ item.description }}</div>
                          <div class="process-time">创建时间: {{ item.createTime }}</div>
                        </div>
                      </template>
                    </a-list-item-meta>
                    <template #actions>
                      <a-tag
                        :color="item.status === 'pending' ? 'blue' : 'green'"
                        class="process-status"
                        style="margin-right: 8px"
                      >
                        {{ item.status === 'pending' ? '待处理' : '已处理' }}
                      </a-tag>
                      <a-button type="primary" size="small" @click="handleViewProcess(item)">
                        查看详情
                      </a-button>
                    </template>
                  </a-list-item>
                </template>
              </a-list>
            </a-tab-pane>
            <a-tab-pane key="completed" tab="已办理流程">
              <div v-if="completedProcesses.length === 0" class="empty-state">
                <a-empty description="暂无已办理流程" />
              </div>
              <a-list v-else :data-source="completedProcesses" class="process-list">
                <template #renderItem="{ item }">
                  <a-list-item class="process-item">
                    <a-list-item-meta>
                      <template #title>
                        <div class="process-title">
                          <span>{{ item.name }}</span>
                        </div>
                      </template>
                      <template #description>
                        <div class="process-info">
                          <div>{{ item.description }}</div>
                          <div class="process-time">创建时间: {{ item.createTime }}</div>
                        </div>
                      </template>
                    </a-list-item-meta>
                    <template #actions>
                      <a-tag
                        :color="item.status === 'pending' ? 'blue' : 'green'"
                        class="process-status"
                        style="margin-right: 8px"
                      >
                        {{ item.status === 'pending' ? '待处理' : '已处理' }}
                      </a-tag>
                      <a-button type="primary" size="small" @click="handleViewProcess(item)">
                        查看详情
                      </a-button>
                    </template>
                  </a-list-item>
                </template>
              </a-list>
            </a-tab-pane>
          </a-tabs>
        </a-tab-pane>

        <!-- 人工处理中心标签页（仅辅导员和管理员可见） -->
        <a-tab-pane
          v-if="userStore.isCounselor() || userStore.isAdmin()"
          key="human"
          tab="人工处理中心"
        >
          <a-tabs v-model:active-key="humanActiveTab" class="sub-tabs">
            <a-tab-pane key="pending" tab="待完成">
              <a-table
                :columns="humanProcessColumns"
                :data-source="humanProcessData"
                :loading="humanProcessLoading"
                :pagination="humanProcessPagination"
                row-key="id"
                @change="handleHumanProcessTableChange"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'status'">
                    <a-tag v-if="record.status === 'PENDING'">待处理</a-tag>
                    <a-tag v-else-if="record.status === 'PROCESSING'" color="processing"
                      >处理中</a-tag
                    >
                    <a-tag v-else-if="record.status === 'COMPLETED'" color="success">已完成</a-tag>
                  </template>
                  <template v-else-if="column.key === 'transferType'">
                    {{ record.transferType === 'MANUAL' ? '手动申请' : '自动转接' }}
                  </template>
                  <template v-else-if="column.key === 'transferReason'">
                    {{ formatTransferReason(record.transferReason) }}
                  </template>
                  <template v-else-if="column.key === 'action'">
                    <a-button
                      v-if="record.status === 'PENDING'"
                      type="primary"
                      size="small"
                      @click="handleProcess(record)"
                      >处理</a-button
                    >
                    <a-button
                      v-else-if="record.status === 'PROCESSING'"
                      type="primary"
                      size="small"
                      @click="handleReply(record)"
                      >回复</a-button
                    >
                    <a-button type="link" size="small" @click="handleViewTransfer(record)"
                      >查看</a-button
                    >
                  </template>
                </template>
              </a-table>
            </a-tab-pane>
            <a-tab-pane key="completed" tab="我完成的">
              <a-table
                :columns="completedProcessColumns"
                :data-source="completedProcessData"
                :loading="completedProcessLoading"
                :pagination="completedProcessPagination"
                row-key="id"
                @change="handleCompletedProcessTableChange"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'status'">
                    <a-tag v-if="record.status === 'PENDING'">待处理</a-tag>
                    <a-tag v-else-if="record.status === 'PROCESSING'" color="processing"
                      >处理中</a-tag
                    >
                    <a-tag v-else-if="record.status === 'COMPLETED'" color="success">已完成</a-tag>
                  </template>
                  <template v-else-if="column.key === 'transferType'">
                    {{ record.transferType === 'MANUAL' ? '手动申请' : '自动转接' }}
                  </template>
                  <template v-else-if="column.key === 'transferReason'">
                    {{ formatTransferReason(record.transferReason) }}
                  </template>
                  <template v-else-if="column.key === 'staffReply'">
                    {{ record.staffReply || '无' }}
                  </template>
                  <template v-else-if="column.key === 'action'">
                    <a-button type="link" size="small" @click="handleViewTransfer(record)"
                      >查看</a-button
                    >
                  </template>
                </template>
              </a-table>
            </a-tab-pane>
          </a-tabs>
        </a-tab-pane>

        <!-- 我的转人工记录标签页（仅非辅导员和非管理员可见） -->
        <a-tab-pane
          v-if="!userStore.isCounselor() && !userStore.isAdmin()"
          key="transfers"
          tab="我的转人工记录"
        >
          <a-table
            :columns="transferColumns"
            :data-source="transferData"
            :loading="transferLoading"
            :pagination="transferPagination"
            row-key="id"
            @change="handleTransferTableChange"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag v-if="record.status === 'PENDING'">待处理</a-tag>
                <a-tag v-else-if="record.status === 'PROCESSING'" color="processing">处理中</a-tag>
                <a-tag v-else-if="record.status === 'COMPLETED'" color="success">已完成</a-tag>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-button type="link" size="small" @click="handleViewTransferDetail(record)"
                  >查看详情</a-button
                >
              </template>
            </template>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- 流程详情弹窗 -->
    <a-modal
      v-model:open="detailVisible"
      :title="currentType === 'leave' ? '请假详情' : '奖助详情'"
      width="700px"
      :footer="null"
      @cancel="handleCloseDetail"
    >
      <a-spin :spinning="loadingDetail">
        <!-- 请假详情 -->
        <a-descriptions v-if="currentType === 'leave' && leaveDetail" :column="2" bordered>
          <a-descriptions-item label="请假类型">
            <a-tag v-if="leaveDetail.leaveType === 'SICK'" color="red">病假</a-tag>
            <a-tag v-else-if="leaveDetail.leaveType === 'PERSONAL'" color="orange">事假</a-tag>
            <a-tag v-else-if="leaveDetail.leaveType === 'PUBLIC'" color="blue">公假</a-tag>
            <span v-else>{{ leaveDetail.leaveType }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="审批状态">
            <a-tag v-if="leaveDetail.approvalStatus === 'PENDING'" color="processing">待审批</a-tag>
            <a-tag v-else-if="leaveDetail.approvalStatus === 'APPROVED'" color="success"
              >已批准</a-tag
            >
            <a-tag v-else-if="leaveDetail.approvalStatus === 'REJECTED'" color="error"
              >已拒绝</a-tag
            >
            <span v-else>{{ leaveDetail.approvalStatus }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="开始日期">
            {{ leaveDetail.startDate }}
          </a-descriptions-item>
          <a-descriptions-item label="结束日期">
            {{ leaveDetail.endDate }}
          </a-descriptions-item>
          <a-descriptions-item label="请假天数"> {{ leaveDetail.days }} 天 </a-descriptions-item>
          <a-descriptions-item label="申请人ID">
            {{ leaveDetail.applicantId }}
          </a-descriptions-item>
          <a-descriptions-item label="请假原因" :span="2">
            {{ leaveDetail.reason || '无' }}
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">
            {{ leaveDetail.createTime }}
          </a-descriptions-item>
          <a-descriptions-item v-if="leaveDetail.approvalTime" label="审批时间">
            {{ leaveDetail.approvalTime }}
          </a-descriptions-item>
          <a-descriptions-item v-if="leaveDetail.approvalComment" label="审批意见" :span="2">
            {{ leaveDetail.approvalComment }}
          </a-descriptions-item>
        </a-descriptions>

        <!-- 审批流程状态 -->
        <div v-if="approvalProcess" class="approval-process-section" style="margin-top: 20px;">
          <h3 style="margin-bottom: 12px;">审批流程</h3>
          <a-timeline>
            <a-timeline-item 
              v-for="(step, index) in approvalProcess.steps" 
              :key="index"
              :color="step.status === 'APPROVED' ? 'green' : step.status === 'REJECTED' ? 'red' : 'blue'"
              :dot="step.status === 'APPROVED' ? 'success' : step.status === 'REJECTED' ? 'error' : 'processing'"
            >
              <div>
                <strong>{{ step.name }}</strong>
                <span v-if="step.approver" style="margin-left: 8px; color: #666;">({{ step.approver }})</span>
              </div>
              <div v-if="step.status === 'APPROVED' || step.status === 'REJECTED'" style="margin-top: 4px; font-size: 12px; color: #999;">
                {{ step.status === 'APPROVED' ? '已批准' : '已拒绝' }} - {{ step.time || 'N/A' }}
              </div>
              <div v-if="step.comment" style="margin-top: 4px; font-size: 12px; color: #666;">
                意见: {{ step.comment }}
              </div>
            </a-timeline-item>
          </a-timeline>
        </div>

        <!-- 奖助详情 -->
        <a-descriptions v-if="currentType === 'award' && awardDetail" :column="2" bordered>
          <a-descriptions-item label="申请类型">
            <a-tag v-if="awardDetail.applicationType === 'SCHOLARSHIP'" color="gold">奖学金</a-tag>
            <a-tag v-else-if="awardDetail.applicationType === 'GRANT'" color="green">助学金</a-tag>
            <a-tag v-else-if="awardDetail.applicationType === 'SUBSIDY'" color="blue"
              >困难补助</a-tag
            >
            <span v-else>{{ awardDetail.applicationType }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="审批状态">
            <a-tag v-if="awardDetail.status === 'PENDING'" color="processing">待审批</a-tag>
            <a-tag v-else-if="awardDetail.status === 'APPROVED'" color="success">已批准</a-tag>
            <a-tag v-else-if="awardDetail.status === 'REJECTED'" color="error">已拒绝</a-tag>
            <span v-else>{{ awardDetail.status }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="申请名称" :span="2">
            {{ awardDetail.awardName }}
          </a-descriptions-item>
          <a-descriptions-item v-if="awardDetail.amount" label="申请金额">
            ¥{{ awardDetail.amount }}
          </a-descriptions-item>
          <a-descriptions-item label="申请人ID">
            {{ awardDetail.userId }}
          </a-descriptions-item>
          <a-descriptions-item label="申请原因" :span="2">
            {{ awardDetail.reason || '无' }}
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">
            {{ awardDetail.createTime }}
          </a-descriptions-item>
        </a-descriptions>
      </a-spin>
      <div class="modal-footer">
        <a-button @click="handleCloseDetail">关闭</a-button>
        <a-button v-if="canApprove()" type="primary" @click="handleOpenApproveModal">
          审批
        </a-button>
      </div>
    </a-modal>

    <!-- 回复模态框 -->
    <a-modal v-model:open="replyVisible" title="回复问题" width="800px" :footer="null">
      <a-form :model="replyForm" layout="vertical">
        <a-form-item label="问题内容">
          <a-textarea v-model:value="replyForm.questionText" disabled rows="4" />
        </a-form-item>
        <a-form-item label="回复内容">
          <a-textarea v-model:value="replyForm.reply" placeholder="请输入回复内容" rows="6" />
        </a-form-item>
      </a-form>
      <div class="modal-footer">
        <a-button @click="replyVisible = false">取消</a-button>
        <a-button type="primary" @click="submitReply">确定</a-button>
      </div>
    </a-modal>

    <!-- 审批弹窗 -->
    <a-modal v-model:open="approveVisible" title="审批申请" width="600px" :footer="null">
      <a-form :model="approveForm" layout="vertical">
        <a-form-item label="审批结果">
          <a-radio-group v-model:value="approveForm.approvalStatus">
            <a-radio value="APPROVED">批准</a-radio>
            <a-radio value="REJECTED">拒绝</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="审批意见">
          <a-textarea
            v-model:value="approveForm.approvalComment"
            placeholder="请输入审批意见（选填）"
            rows="4"
          />
        </a-form-item>
      </a-form>
      <div class="modal-footer">
        <a-button @click="approveVisible = false">取消</a-button>
        <a-button type="primary" :loading="approving" @click="submitApproval"> 确定 </a-button>
      </div>
    </a-modal>

    <!-- 转人工记录详情模态框 -->
    <a-modal
      v-model:open="transferDetailVisible"
      title="转人工记录详情"
      width="800px"
      :footer="null"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="问题ID" :span="2">
          {{ currentTransfer?.questionId }}
        </a-descriptions-item>
        <a-descriptions-item label="转接类型">
          {{ currentTransfer?.transferType === 'MANUAL' ? '手动申请' : '自动转接' }}
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag v-if="currentTransfer?.status === 'PENDING'">待处理</a-tag>
          <a-tag v-else-if="currentTransfer?.status === 'PROCESSING'" color="processing"
            >处理中</a-tag
          >
          <a-tag v-else-if="currentTransfer?.status === 'COMPLETED'" color="success">已完成</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="转接原因" :span="2">
          {{ formatTransferReason(currentTransfer?.transferReason) }}
        </a-descriptions-item>
        <a-descriptions-item v-if="currentTransfer?.staffId" label="处理人员ID">
          {{ currentTransfer.staffId }}
        </a-descriptions-item>
        <a-descriptions-item v-if="currentTransfer?.staffReply" label="处理回复" :span="2">
          {{ currentTransfer.staffReply }}
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">
          {{ currentTransfer?.createTime }}
        </a-descriptions-item>
        <a-descriptions-item v-if="currentTransfer?.processTime" label="处理时间">
          {{ currentTransfer.processTime }}
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import { processApi, leaveApi, awardApi, consultationApi, approvalApi } from '@/api'
import { useUserStore } from '@/stores/user'
import type { ProcessItem, LeaveApplication, AwardApplication, PageRequest } from '@/types'

const userStore = useUserStore()
const activeTab = ref('process')
const humanActiveTab = ref('pending')
const processActiveTab = ref('pending')

// 流程代办相关
const pendingProcesses = ref<ProcessItem[]>([])
const completedProcesses = ref<ProcessItem[]>([])
const detailVisible = ref(false)
const currentType = ref<'leave' | 'award' | ''>('')
const leaveDetail = ref<LeaveApplication | null>(null)
const awardDetail = ref<AwardApplication | null>(null)
const loadingDetail = ref(false)
const currentProcessId = ref<number>(0)
const approvalProcess = ref<any>(null)

// 审批相关
const approveVisible = ref(false)
const approving = ref(false)
const approveForm = reactive({
  approvalStatus: 'APPROVED',
  approvalComment: '',
})

// 人工处理中心相关
const humanProcessLoading = ref(false)
const humanProcessData = ref<any[]>([])
const humanProcessPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})
const replyVisible = ref(false)
const currentTransfer = ref<any>(null)
const currentTransferId = ref<number>(0)
const replyForm = reactive({
  questionText: '',
  reply: '',
})

// 已完成记录相关
const completedProcessLoading = ref(false)
const completedProcessData = ref<any[]>([])
const completedProcessPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const humanProcessColumns = [
  {
    title: '问题ID',
    dataIndex: 'questionId',
    key: 'questionId',
  },
  {
    title: '转接类型',
    dataIndex: 'transferType',
    key: 'transferType',
    width: 120,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: '转接原因',
    dataIndex: 'transferReason',
    key: 'transferReason',
    ellipsis: true,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180,
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
  },
]

const completedProcessColumns = [
  {
    title: '问题ID',
    dataIndex: 'questionId',
    key: 'questionId',
  },
  {
    title: '转接类型',
    dataIndex: 'transferType',
    key: 'transferType',
    width: 120,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: '转接原因',
    dataIndex: 'transferReason',
    key: 'transferReason',
    ellipsis: true,
  },
  {
    title: '回复内容',
    dataIndex: 'staffReply',
    key: 'staffReply',
    ellipsis: true,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180,
  },
  {
    title: '处理时间',
    dataIndex: 'processTime',
    key: 'processTime',
    width: 180,
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
  },
]

// 转人工记录相关
const transferLoading = ref(false)
const transferData = ref<any[]>([])
const transferDetailVisible = ref(false)
const transferPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const transferColumns = [
  {
    title: '问题ID',
    dataIndex: 'questionId',
    key: 'questionId',
  },
  {
    title: '转接类型',
    dataIndex: 'transferType',
    key: 'transferType',
    width: 120,
    customRender: ({ text }: { text: string }) => (text === 'MANUAL' ? '手动申请' : '自动转接'),
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180,
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
  },
]

const getCategoryName = (category?: string) => {
  const map: Record<string, string> = {
    scholarship: '奖助勤贷',
    dormitory: '宿舍管理',
    discipline: '违纪申诉',
    mental: '心理健康',
    employment: '就业指导',
    AWARD: '奖助勤贷',
    DORM: '宿舍管理',
    DISCIPLINE: '违纪申诉',
    MENTAL: '心理健康',
    EMPLOYMENT: '就业指导',
  }
  return map[category || ''] || '未分类'
}

const formatTransferReason = (reason?: string) => {
  if (!reason) return ''
  return reason.replace(/问题类型: (\w+)/g, (match, category) => {
    return `问题类型: ${getCategoryName(category)}`
  })
}

// 加载流程数据
const loadProcesses = async () => {
  try {
    // 获取待办流程
    const pendingResponse = await processApi.getProcessList()
    pendingProcesses.value = pendingResponse.pending
    
    // 获取已办理流程
    const completedResponse = await processApi.getCompletedProcesses()
    completedProcesses.value = completedResponse
  } catch (error) {
    message.error('获取流程数据失败')
    console.error('获取流程数据失败:', error)
  }
}

// 加载人工处理中心数据
const loadHumanProcessData = async () => {
  if (!(userStore.isCounselor() || userStore.isAdmin())) return

  humanProcessLoading.value = true
  try {
    const params: PageRequest = {
      pageNum: humanProcessPagination.current,
      pageSize: humanProcessPagination.pageSize,
    }
    const response = await consultationApi.getStaffTransfers(params)
    humanProcessData.value = response.records
    humanProcessPagination.total = response.total
  } catch (error: any) {
    console.error('加载人工处理数据失败', error)
    message.error('加载数据失败: ' + (error.message || '未知错误'))
  } finally {
    humanProcessLoading.value = false
  }
}

// 加载已完成记录数据
const loadCompletedProcessData = async () => {
  if (!(userStore.isCounselor() || userStore.isAdmin())) return

  completedProcessLoading.value = true
  try {
    const params: PageRequest = {
      pageNum: completedProcessPagination.current,
      pageSize: completedProcessPagination.pageSize,
    }
    const response = await consultationApi.getCompletedTransfers(params)
    completedProcessData.value = response.records
    completedProcessPagination.total = response.total
  } catch (error: any) {
    console.error('加载已完成记录失败', error)
    message.error('加载数据失败: ' + (error.message || '未知错误'))
  } finally {
    completedProcessLoading.value = false
  }
}

// 加载转人工记录数据
const loadTransferData = async () => {
  transferLoading.value = true
  try {
    const params: PageRequest = {
      pageNum: transferPagination.current,
      pageSize: transferPagination.pageSize,
    }
    const response = await consultationApi.getUserTransfers(params)
    transferData.value = response.records
    transferPagination.total = response.total
  } catch (error: any) {
    console.error('加载转人工记录失败', error)
    message.error('加载数据失败: ' + (error.message || '未知错误'))
  } finally {
    transferLoading.value = false
  }
}

const handleViewProcess = async (item: ProcessItem) => {
  currentType.value = item.type as 'leave' | 'award'
  currentProcessId.value = Number(item.id)
  loadingDetail.value = true
  detailVisible.value = true
  approvalProcess.value = null

  try {
    if (item.type === 'leave') {
      leaveDetail.value = await leaveApi.getApplication(Number(item.id))
    } else if (item.type === 'award') {
      awardDetail.value = await awardApi.getApplicationDetail(Number(item.id))
    }

    // 加载审批流程状态
    const businessType = item.type === 'leave' ? 'LEAVE' : 'AWARD'
    const instance = await approvalApi.getApprovalInstance(businessType, Number(item.id))
    if (instance.steps) {
      approvalProcess.value = {
        status: instance.status,
        steps: instance.steps.map((step: any) => ({
          name: step.stepName,
          status: step.status,
          approver: step.approverName,
          time: step.approvalTime,
          comment: step.comment
        }))
      }
    }
  } catch (error) {
    message.error('获取详情失败')
    console.error('获取详情失败:', error)
  } finally {
    loadingDetail.value = false
  }
}

const canApprove = () => {
  if (!userStore.isCounselor() && !userStore.isAdmin()) {
    return false
  }
  if (currentType.value === 'leave' && leaveDetail.value) {
    return leaveDetail.value.approvalStatus === 'PENDING'
  }
  if (currentType.value === 'award' && awardDetail.value) {
    return awardDetail.value.status === 'PENDING'
  }
  return false
}

const handleOpenApproveModal = () => {
  approveVisible.value = true
  approveForm.approvalStatus = 'APPROVED'
  approveForm.approvalComment = ''
}

const submitApproval = async () => {
  if (!currentProcessId.value) {
    message.error('缺少申请ID')
    return
  }

  approving.value = true
  try {
    if (currentType.value === 'leave') {
      await leaveApi.approveApplication(currentProcessId.value, {
        approvalStatus: approveForm.approvalStatus,
        approvalComment: approveForm.approvalComment,
      })
    } else if (currentType.value === 'award') {
      await awardApi.approveApplication(
        currentProcessId.value,
        approveForm.approvalStatus === 'APPROVED',
        approveForm.approvalComment
      )
    }
    message.success('审批成功')
    approveVisible.value = false
    detailVisible.value = false
    loadProcesses()
  } catch (error: any) {
    console.error('审批失败', error)
    message.error('审批失败: ' + (error.message || '未知错误'))
  } finally {
    approving.value = false
  }
}

const handleCloseDetail = () => {
  detailVisible.value = false
  leaveDetail.value = null
  awardDetail.value = null
  approvalProcess.value = null
  currentType.value = ''
}

// 人工处理中心操作
const handleHumanProcessTableChange = (pag: any) => {
  humanProcessPagination.current = pag.current
  humanProcessPagination.pageSize = pag.pageSize
  loadHumanProcessData()
}

const handleCompletedProcessTableChange = (pag: any) => {
  completedProcessPagination.current = pag.current
  completedProcessPagination.pageSize = pag.pageSize
  loadCompletedProcessData()
}

const handleProcess = (record: any) => {
  currentTransferId.value = record.id
  replyForm.questionText = record.transferReason?.split('\n问题描述: ')[1] || ''
  replyForm.reply = ''
  replyVisible.value = true
}

const handleReply = (record: any) => {
  currentTransferId.value = record.id
  replyForm.questionText = record.transferReason?.split('\n问题描述: ')[1] || ''
  replyForm.reply = ''
  replyVisible.value = true
}

const submitReply = async () => {
  if (!replyForm.reply.trim()) {
    message.warning('请输入回复内容')
    return
  }

  try {
    // 如果是PENDING状态，先分配给当前用户，然后直接完成处理
    const record = humanProcessData.value.find((item) => item.id === currentTransferId.value)
    if (record && record.status === 'PENDING') {
      await consultationApi.processTransfer(currentTransferId.value, replyForm.reply)
    } else {
      await consultationApi.replyToTransfer(currentTransferId.value, replyForm.reply)
    }
    message.success('回复成功')
    replyVisible.value = false
    loadHumanProcessData() // 重新加载待完成数据
    if (humanActiveTab.value === 'completed') {
      loadCompletedProcessData() // 如果当前在已完成标签页，也重新加载
    }
  } catch (error: any) {
    console.error('回复失败', error)
    message.error('回复失败: ' + (error.message || '未知错误'))
  }
}

const handleViewTransfer = async (record: any) => {
  try {
    currentTransfer.value = await consultationApi.getTransferDetail(record.id)
    transferDetailVisible.value = true
  } catch (error: any) {
    console.error('获取转人工记录详情失败', error)
    message.error('获取详情失败: ' + (error.message || '未知错误'))
  }
}

// 转人工记录操作
const handleTransferTableChange = (pag: any) => {
  transferPagination.current = pag.current
  transferPagination.pageSize = pag.pageSize
  loadTransferData()
}

const handleViewTransferDetail = async (record: any) => {
  try {
    currentTransfer.value = await consultationApi.getTransferDetail(record.id)
    transferDetailVisible.value = true
  } catch (error: any) {
    console.error('获取转人工记录详情失败', error)
    message.error('获取详情失败: ' + (error.message || '未知错误'))
  }
}

onMounted(() => {
  loadProcesses()
  if (userStore.isCounselor() || userStore.isAdmin()) {
    if (humanActiveTab.value === 'pending') {
      loadHumanProcessData()
    } else {
      loadCompletedProcessData()
    }
  }
  // 只有非辅导员和非管理员用户才加载转人工记录
  if (!userStore.isCounselor() && !userStore.isAdmin()) {
    loadTransferData()
  }
})

// 监听人工处理中心标签页变化
watch(humanActiveTab, (newTab) => {
  if (userStore.isCounselor() || userStore.isAdmin()) {
    if (newTab === 'pending') {
      loadHumanProcessData()
    } else if (newTab === 'completed') {
      loadCompletedProcessData()
    }
  }
})

// 处理流程代办标签页变化
const handleProcessTabChange = (key: string) => {
  loadProcesses()
}
</script>

<style scoped>
.process-service-container {
  padding: 20px;
  min-height: 80vh;
}

.process-card {
  margin-top: 20px;
}

.process-tabs {
  margin-bottom: 20px;
}

.sub-tabs {
  margin-top: 16px;
}

.empty-state {
  padding: 60px 0;
  text-align: center;
}

.process-list {
  max-height: 600px;
  overflow-y: auto;
}

.process-item {
  border-bottom: 1px solid #f0f0f0;
  padding: 16px 0;
}

.process-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.process-info {
  margin-top: 8px;
  color: #666;
}

.process-time {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}

.process-status {
  margin-left: 8px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>
