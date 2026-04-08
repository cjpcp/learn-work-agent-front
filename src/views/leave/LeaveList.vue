<template>
  <a-card title="我的请假申请">
    <template #extra>
      <a-button type="primary" @click="$router.push('/leave/apply')">
        <PlusOutlined />
        申请请假
      </a-button>
      <a-button
        v-if="userStore.isCounselor() || userStore.isAdmin()"
        style="margin-left: 8px"
        @click="$router.push('/leave/approve')"
      >
        待审批列表
      </a-button>
    </template>
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="pagination"
      row-key="id"
      :row-class-name="(record: LeaveApplication) => (record.cancelled ? 'cancelled-record' : '')"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'leaveType'">
          <a-tag v-if="record.leaveType === 'PERSONAL'" color="orange">事假</a-tag>
          <a-tag v-else-if="record.leaveType === 'OFFICIAL'" color="blue">公假</a-tag>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag v-if="record.approvalStatus === 'PENDING'" color="processing">待审批</a-tag>
          <a-tag
            v-else-if="record.approvalStatus === 'APPROVED' && record.cancelled"
            color="default"
            >已销假</a-tag
          >
          <a-tag
            v-else-if="
              record.approvalStatus === 'APPROVED' &&
              record.cancelRequested &&
              record.cancelApprovalStatus === 'PENDING'
            "
            color="warning"
            >销假审批中</a-tag
          >
          <a-tag
            v-else-if="record.approvalStatus === 'APPROVED' && !record.cancelled"
            color="success"
            >已批准</a-tag
          >
          <a-tag v-else-if="record.approvalStatus === 'REJECTED'" color="error">已拒绝</a-tag>
          <a-tag v-else-if="record.cancelApprovalStatus === 'REJECTED'" color="error"
            >销假已拒绝</a-tag
          >
        </template>
        <template v-else-if="column.key === 'createTime'">
          {{ formatDateTime(record.createTime) }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-button type="link" @click="handleView(record)">查看详情</a-button>
          <a-button v-if="!record.cancelled" type="link" @click="handleDownload(record)">
            下载请假条
          </a-button>
          <a-button
            v-if="
              record.approvalStatus === 'APPROVED' && !record.cancelled && !record.cancelRequested
            "
            type="link"
            danger
            @click="handleCancel(record)"
          >
            申请销假
          </a-button>
          <a-tag
            v-else-if="record.cancelRequested && record.cancelApprovalStatus === 'PENDING'"
            color="warning"
            >销假审批中</a-tag
          >
        </template>
      </template>
    </a-table>

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
          <a-tag v-else-if="currentRecord?.approvalStatus === 'APPROVED'" color="success"
            >已批准</a-tag
          >
          <a-tag v-else-if="currentRecord?.approvalStatus === 'REJECTED'" color="error"
            >已拒绝</a-tag
          >
          <a-tag v-else-if="currentRecord?.cancelled" color="default">已销假</a-tag>
        </a-descriptions-item>
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
  </a-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { leaveApi } from '@/api'
import { useUserStore } from '@/stores/user'
import { formatDateTime } from '@/utils/format'
import type { LeaveApplication, PageRequest } from '@/types'

const userStore = useUserStore()
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
    title: '请假类型',
    dataIndex: 'leaveType',
    key: 'leaveType',
    width: 100,
  },
  {
    title: '开始日期',
    dataIndex: 'startDate',
    key: 'startDate',
    width: 120,
  },
  {
    title: '结束日期',
    dataIndex: 'endDate',
    key: 'endDate',
    width: 120,
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
    width: 200,
  },
]

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
  } catch (error: any) {
    console.error('加载数据失败', error)
  } finally {
    loading.value = false
  }
}

const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

const handleView = async (record: LeaveApplication) => {
  try {
    const response = await leaveApi.getApplication(record.id!)
    if (response) {
      currentRecord.value = response
      visible.value = true
    }
  } catch (error: any) {
    message.error('获取详情失败')
  }
}

const handleDownload = async (record: LeaveApplication) => {
  try {
    // 先生成请假条
    await leaveApi.generateLeaveSlip(record.id!)
    // 然后下载请假条
    leaveApi.downloadLeaveSlip(record.id!)
  } catch (error: any) {
    message.error(error.message || '生成请假条失败')
  }
}

const handleCancel = (record: LeaveApplication) => {
  Modal.confirm({
    title: '确认申请销假',
    content: '确定要申请销假吗？审批通过后将完成销假。',
    onOk: async () => {
      try {
        await leaveApi.cancelLeave(record.id!)
        message.success('销假申请已提交')
        loadData()
      } catch (error: any) {
        message.error(error.message || '销假申请失败')
      }
    },
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* 已销假记录的样式 */
.cancelled-record {
  background-color: #f5f5f5 !important;
  opacity: 0.8;
}

.cancelled-record td {
  color: #999 !important;
}
</style>
