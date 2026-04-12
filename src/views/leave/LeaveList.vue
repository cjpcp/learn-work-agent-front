<template>
  <div class="leave-list-container">
    <div class="page-header">
      <h2 class="page-title">申请记录</h2>
      <a-button type="primary" class="back-btn" @click="$router.back()">返回</a-button>
    </div>

    <a-card class="list-card" :bordered="false">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="false"
        row-key="id"
        :row-class-name="(record: LeaveApplication) => (record.cancelled ? 'cancelled-record' : '')"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </template>
          <template v-else-if="column.key === 'leaveType'">请假</template>
          <template v-else-if="column.key === 'createTime'">
            {{ formatDateTime(record.createTime) }}
          </template>
          <template v-else-if="column.key === 'content'">
            <span class="content-text">{{ getContentText(record) }}</span>
          </template>
          <template v-else-if="column.key === 'status'">
            <span :class="['status-text', getStatusClass(record)]">{{ getStatusText(record) }}</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button
                v-if="canCancelApplication(record)"
                type="link"
                size="small"
                class="cancel-link"
                @click="handleWithdraw(record)"
              >
                撤销
              </a-button>
              <a-button
                v-if="
                  record.approvalStatus === 'APPROVED' &&
                  !record.cancelled &&
                  !record.cancelRequested
                "
                type="link"
                size="small"
                class="cancel-link"
                danger
                @click="handleCancel(record)"
              >
                销假
              </a-button>
              <a-tag
                v-else-if="record.cancelRequested && record.cancelApprovalStatus === 'PENDING'"
                color="warning"
                style="font-size: 12px"
                >销假审批中</a-tag
              >
              <a-button type="link" size="small" class="view-link" @click="handleView(record)">
                查看
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>

      <div class="pagination-wrapper">
        <span class="total-text">共 {{ pagination.total }} 条记录</span>
        <a-pagination
          v-model:current="pagination.current"
          v-model:pageSize="pagination.pageSize"
          :total="pagination.total"
          show-size-changer
          show-quick-jumper
          :show-total="(total: number) => `共 ${total} 条`"
          :page-size-options="['10', '20', '50']"
          @change="handlePageChange"
        />
      </div>
    </a-card>

    <a-modal v-model:open="visible" title="请假详情" width="800px" :footer="null">
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="请假类型">
          <a-tag v-if="currentRecord?.leaveType === 'PERSONAL'" color="orange">事假</a-tag>
          <a-tag v-else-if="currentRecord?.leaveType === 'OFFICIAL'" color="blue">公假</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag v-if="currentRecord?.approvalStatus === 'PENDING'" color="processing"
            >待审批</a-tag
          >
          <a-tag
            v-else-if="currentRecord?.approvalStatus === 'APPROVED' && currentRecord?.cancelled"
            color="default"
            >已销假</a-tag
          >
          <a-tag
            v-else-if="
              currentRecord?.approvalStatus === 'APPROVED' &&
              currentRecord?.cancelRequested &&
              currentRecord?.cancelApprovalStatus === 'PENDING'
            "
            color="warning"
            >销假审批中</a-tag
          >
          <a-tag
            v-else-if="currentRecord?.approvalStatus === 'APPROVED' && !currentRecord?.cancelled"
            color="success"
            >已批准</a-tag
          >
          <a-tag v-else-if="currentRecord?.approvalStatus === 'REJECTED'" color="error"
            >已拒绝</a-tag
          >
          <a-tag v-else-if="currentRecord?.cancelApprovalStatus === 'REJECTED'" color="error"
            >销假已拒绝</a-tag
          >
        </a-descriptions-item>
        <a-descriptions-item label="院系">{{ currentRecord?.departmentName || '-' }}</a-descriptions-item>
        <a-descriptions-item label="年级">{{ currentRecord?.grade || '-' }}</a-descriptions-item>
        <a-descriptions-item label="班级">{{ currentRecord?.className || '-' }}</a-descriptions-item>
        <a-descriptions-item label="姓名">{{ currentRecord?.studentName }}</a-descriptions-item>
        <a-descriptions-item label="开始日期">
          {{ currentRecord?.startDate }}
        </a-descriptions-item>
        <a-descriptions-item label="结束日期">
          {{ currentRecord?.endDate }}
        </a-descriptions-item>
        <a-descriptions-item label="请假原因" :span="2">
          {{ currentRecord?.reason || '无' }}
        </a-descriptions-item>
        <a-descriptions-item v-if="currentRecord?.approvalComment" label="审批意见" :span="2">
          {{ currentRecord.approvalComment }}
        </a-descriptions-item>
        <a-descriptions-item v-if="currentRecord?.approvalTime" label="审批时间">
          {{ formatDateTime(currentRecord.approvalTime) }}
        </a-descriptions-item>
        <a-descriptions-item
          v-if="currentRecord?.cancelled && currentRecord?.cancelTime"
          label="销假时间"
        >
          {{ formatDateTime(currentRecord.cancelTime) }}
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">
          {{ formatDateTime(currentRecord?.createTime) }}
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { leaveApi } from '@/api'
import { formatDateTime } from '@/utils/format'
import type { LeaveApplication, PageRequest } from '@/types'

const loading = ref(false)
const dataSource = ref<LeaveApplication[]>([])
const visible = ref(false)
const currentRecord = ref<LeaveApplication | null>(null)

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const columns = [
  {
    title: '序号',
    key: 'index',
    width: 70,
    align: 'center',
  },
  {
    title: '申请类型',
    dataIndex: 'leaveType',
    key: 'leaveType',
    width: 120,
  },
  {
    title: '申请时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180,
  },
  {
    title: '申请内容',
    key: 'content',
    ellipsis: true,
  },
  {
    title: '当前结果',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: '操作',
    key: 'action',
    width: 180,
  },
]

const canCancelApplication = (record: LeaveApplication) => {
  return record.approvalStatus === 'PENDING'
}

const getStatusText = (record: LeaveApplication) => {
  if (record.approvalStatus === 'PENDING') return '审批中'
  if (record.approvalStatus === 'APPROVED') {
    if (record.cancelled) return '已销假'
    if (record.cancelRequested && record.cancelApprovalStatus === 'PENDING') return '销假审批中'
    return '已通过'
  }
  if (record.approvalStatus === 'REJECTED') return '已反驳'
  if (record.cancelApprovalStatus === 'REJECTED') return '销假已拒绝'
  return '-'
}

const getStatusClass = (record: LeaveApplication) => {
  if (record.approvalStatus === 'PENDING') return 'status-pending'
  if (record.approvalStatus === 'APPROVED') {
    if (record.cancelled) return 'status-cancelled'
    if (record.cancelRequested && record.cancelApprovalStatus === 'PENDING') return 'status-processing'
    return 'status-approved'
  }
  if (record.approvalStatus === 'REJECTED') return 'status-rejected'
  return ''
}

const getContentText = (record: LeaveApplication) => {
  const reason = record.reason ? `，${record.reason.slice(0, 10)}...` : ''
  const days = calculateDays(record.startDate, record.endDate)
  return `申请请假${days}天${reason}`
}

const calculateDays = (start?: string, end?: string) => {
  if (!start || !end) return 0
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const loadData = async () => {
  loading.value = true
  try {
    const params: PageRequest = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
    }
    const response = await leaveApi.getMyApplications(params)
    if (response) {
      dataSource.value = response.records
      pagination.total = response.total
    }
  } catch (error) {
    console.error('加载数据失败', error)
  } finally {
    loading.value = false
  }
}

const handlePageChange = () => {
  loadData()
}

const handleView = async (record: LeaveApplication) => {
  try {
    const response = await leaveApi.getApplication(record.id!)
    if (response) {
      currentRecord.value = response
      visible.value = true
    }
  } catch (error) {
    message.error('获取详情失败')
  }
}

const handleWithdraw = (record: LeaveApplication) => {
  Modal.confirm({
    title: '确认撤销',
    content: '确定要撤销该申请吗？撤销后无法恢复。',
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      try {
        await leaveApi.withdrawApplication(record.id!)
        message.success('撤销成功')
        loadData()
      } catch (error) {
        message.error(error instanceof Error ? error.message : '撤销失败')
      }
    },
  })
}

const handleCancel = (record: LeaveApplication) => {
  Modal.confirm({
    title: '确认申请销假',
    content: '确定要申请销假吗？审批通过后将完成销假。',
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      try {
        await leaveApi.cancelLeave(record.id!)
        message.success('销假申请已提交')
        loadData()
      } catch (error) {
        message.error(error instanceof Error ? error.message : '销假申请失败')
      }
    },
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.leave-list-container {
  padding: 24px 40px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 64px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 8px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.back-btn {
  border-radius: 6px;
  height: 36px;
  padding: 0 24px;
}

.list-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  background: #fff;
}

.list-card :deep(.ant-table-thead > tr > th) {
  background-color: #fafafa;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.list-card :deep(.ant-table-tbody > tr > td) {
  font-size: 14px;
  color: #666;
}

.content-text {
  color: #333;
}

.status-text {
  font-weight: 500;
}

.status-pending {
  color: #1890ff;
}

.status-approved {
  color: #52c41a;
}

.status-rejected {
  color: #ff4d4f;
}

.status-cancelled {
  color: #999;
}

.status-processing {
  color: #faad14;
}

.cancel-link {
  color: #1890ff;
  padding: 0 4px;
}

.cancel-link:hover {
  color: #40a9ff;
}

.view-link {
  color: #1890ff;
  padding: 0 4px;
}

.view-link:hover {
  color: #40a9ff;
}

.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.total-text {
  color: #999;
  font-size: 13px;
}

.cancelled-record {
  background-color: #f5f5f5 !important;
  opacity: 0.8;
}

.cancelled-record td {
  color: #999 !important;
}
</style>
