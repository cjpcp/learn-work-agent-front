<template>
  <div class="process-service-container">
    <a-page-header title="流程代办服务" sub-title="查看和管理您的代办流程" @back="$router.back()" />
    <a-card class="process-card">
      <a-tabs v-model:active-key="activeTab" class="process-tabs">
        <!-- 流程代办标签页 -->
        <a-tab-pane key="process" tab="流程代办">
          <a-tabs default-active-key="pending" class="sub-tabs">
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
                <a-tag v-else-if="record.status === 'PROCESSING'" color="processing">处理中</a-tag>
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
                  @click="handleAssign(record)"
                  >分配</a-button
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

        <!-- 我的转人工记录标签页 -->
        <a-tab-pane key="transfers" tab="我的转人工记录">
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
    </a-modal>

    <!-- 分配工作人员模态框 -->
    <a-modal v-model:open="assignVisible" title="分配工作人员" :footer="null">
      <a-form :model="assignForm" layout="vertical">
        <a-form-item label="工作人员ID">
          <a-input v-model:value="assignForm.staffId" placeholder="请输入工作人员ID" />
        </a-form-item>
      </a-form>
      <div class="modal-footer">
        <a-button @click="assignVisible = false">取消</a-button>
        <a-button type="primary" @click="submitAssign">确定</a-button>
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
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { processApi, leaveApi, awardApi, consultationApi } from '@/api'
import { useUserStore } from '@/stores/user'
import type { ProcessItem, LeaveApplication, AwardApplication, PageRequest } from '@/types'

const userStore = useUserStore()
const activeTab = ref('process')

// 流程代办相关
const pendingProcesses = ref<ProcessItem[]>([])
const completedProcesses = ref<ProcessItem[]>([])
const detailVisible = ref(false)
const currentType = ref<'leave' | 'award' | ''>('')
const leaveDetail = ref<LeaveApplication | null>(null)
const awardDetail = ref<AwardApplication | null>(null)
const loadingDetail = ref(false)

// 人工处理中心相关
const humanProcessLoading = ref(false)
const humanProcessData = ref<any[]>([])
const humanProcessPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})
const assignVisible = ref(false)
const replyVisible = ref(false)
const currentTransfer = ref<any>(null)
const currentTransferId = ref<number>(0)
const assignForm = reactive({
  staffId: '',
})
const replyForm = reactive({
  questionText: '',
  reply: '',
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
    const response = await processApi.getProcessList()
    if (response.code === 200) {
      pendingProcesses.value = response.data.pending
      completedProcesses.value = response.data.completed
    } else {
      message.error('获取流程数据失败: ' + response.message)
    }
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
    if (response.data) {
      humanProcessData.value = response.data.records
      humanProcessPagination.total = response.data.total
    }
  } catch (error: any) {
    console.error('加载人工处理数据失败', error)
    message.error('加载数据失败: ' + (error.message || '未知错误'))
  } finally {
    humanProcessLoading.value = false
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
    if (response.data) {
      transferData.value = response.data.records
      transferPagination.total = response.data.total
    }
  } catch (error: any) {
    console.error('加载转人工记录失败', error)
    message.error('加载数据失败: ' + (error.message || '未知错误'))
  } finally {
    transferLoading.value = false
  }
}

const handleViewProcess = async (item: ProcessItem) => {
  currentType.value = item.type as 'leave' | 'award'
  loadingDetail.value = true
  detailVisible.value = true

  try {
    if (item.type === 'leave') {
      const response = await leaveApi.getApplication(Number(item.id))
      if (response.data) {
        leaveDetail.value = response.data
      }
    } else if (item.type === 'award') {
      const response = await awardApi.getApplicationDetail(Number(item.id))
      if (response.data) {
        awardDetail.value = response.data
      }
    }
  } catch (error) {
    message.error('获取详情失败')
    console.error('获取详情失败:', error)
  } finally {
    loadingDetail.value = false
  }
}

const handleCloseDetail = () => {
  detailVisible.value = false
  leaveDetail.value = null
  awardDetail.value = null
  currentType.value = ''
}

// 人工处理中心操作
const handleHumanProcessTableChange = (pag: any) => {
  humanProcessPagination.current = pag.current
  humanProcessPagination.pageSize = pag.pageSize
  loadHumanProcessData()
}

const handleAssign = (record: any) => {
  currentTransferId.value = record.id
  assignForm.staffId = ''
  assignVisible.value = true
}

const submitAssign = async () => {
  if (!assignForm.staffId) {
    message.warning('请输入工作人员ID')
    return
  }

  try {
    await consultationApi.assignStaff(currentTransferId.value, parseInt(assignForm.staffId))
    message.success('分配成功')
    assignVisible.value = false
    loadHumanProcessData()
  } catch (error: any) {
    console.error('分配失败', error)
    message.error('分配失败: ' + (error.message || '未知错误'))
  }
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
    await consultationApi.replyToTransfer(currentTransferId.value, replyForm.reply)
    message.success('回复成功')
    replyVisible.value = false
    loadHumanProcessData()
  } catch (error: any) {
    console.error('回复失败', error)
    message.error('回复失败: ' + (error.message || '未知错误'))
  }
}

const handleViewTransfer = async (record: any) => {
  try {
    const response = await consultationApi.getTransferDetail(record.id)
    if (response.data) {
      currentTransfer.value = response.data
      transferDetailVisible.value = true
    }
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
    const response = await consultationApi.getTransferDetail(record.id)
    if (response.data) {
      currentTransfer.value = response.data
      transferDetailVisible.value = true
    }
  } catch (error: any) {
    console.error('获取转人工记录详情失败', error)
    message.error('获取详情失败: ' + (error.message || '未知错误'))
  }
}

onMounted(() => {
  loadProcesses()
  loadHumanProcessData()
  loadTransferData()
})
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
