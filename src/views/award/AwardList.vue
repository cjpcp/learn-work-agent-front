<template>
  <div class="award-list-container">
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
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </template>
          <template v-else-if="column.key === 'applicationType'">
            {{ getApplicationTypeName(record.applicationType) }}
          </template>
          <template v-else-if="column.key === 'createTime'">
            {{ formatDateTime(record.createTime) }}
          </template>
          <template v-else-if="column.key === 'content'">
            <span class="content-text">{{ getContentText(record) }}</span>
          </template>
          <template v-else-if="column.key === 'approvalStatus'">
            <span :class="['status-text', getStatusClass(record.approvalStatus)]">
              {{ getStatusText(record.approvalStatus) }}
            </span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button
                v-if="record.approvalStatus === 'PENDING'"
                type="link"
                size="small"
                class="cancel-link"
                @click="handleCancel(record)"
              >
                撤销
              </a-button>
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

    <a-modal v-model:open="visible" title="奖助详情" width="800px" :footer="null">
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="申请类型">
          <a-tag v-if="currentRecord?.applicationType === 'SCHOLARSHIP'" color="gold">奖学金</a-tag>
          <a-tag v-else-if="currentRecord?.applicationType === 'GRANT'" color="green">助学金</a-tag>
          <a-tag v-else-if="currentRecord?.applicationType === 'SUBSIDY'" color="blue">困难补助</a-tag>
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
        </a-descriptions-item>
        <a-descriptions-item label="院系">{{ currentRecord?.departmentName || '-' }}</a-descriptions-item>
        <a-descriptions-item label="年级">{{ currentRecord?.grade || '-' }}</a-descriptions-item>
        <a-descriptions-item label="班级">{{ currentRecord?.className || '-' }}</a-descriptions-item>
        <a-descriptions-item label="姓名">{{ currentRecord?.studentName }}</a-descriptions-item>
        <a-descriptions-item label="申请名称">
          {{ currentRecord?.awardName }}
        </a-descriptions-item>
        <a-descriptions-item v-if="currentRecord?.amount" label="申请金额">
          ¥{{ currentRecord.amount }}
        </a-descriptions-item>
        <a-descriptions-item label="申请原因" :span="2">
          {{ currentRecord?.reason || '无' }}
        </a-descriptions-item>
        <a-descriptions-item v-if="currentRecord?.approvalComment" label="审批意见" :span="2">
          {{ currentRecord.approvalComment }}
        </a-descriptions-item>
        <a-descriptions-item v-if="currentRecord?.approvalTime" label="审批时间">
          {{ currentRecord.approvalTime }}
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">
          {{ currentRecord?.createTime }}
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { awardApi } from '@/api'
import type { AwardApplication, PageRequest } from '@/types'

const loading = ref(false)
const dataSource = ref<AwardApplication[]>([])
const visible = ref(false)
const currentRecord = ref<AwardApplication | null>(null)

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
    dataIndex: 'applicationType',
    key: 'applicationType',
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
    dataIndex: 'approvalStatus',
    key: 'approvalStatus',
    width: 100,
  },
  {
    title: '操作',
    key: 'action',
    width: 140,
  },
]

const getApplicationTypeName = (type: string) => {
  const map: Record<string, string> = {
    SCHOLARSHIP: '奖学金',
    GRANT: '助学金',
    SUBSIDY: '困难补助',
  }
  return map[type] || type
}

const getStatusText = (status?: string) => {
  const map: Record<string, string> = {
    PENDING: '审批中',
    APPROVED: '已通过',
    REJECTED: '已驳回',
  }
  return map[status] || status || '-'
}

const getStatusClass = (status?: string) => {
  const map: Record<string, string> = {
    PENDING: 'status-pending',
    APPROVED: 'status-approved',
    REJECTED: 'status-rejected',
  }
  return map[status] || ''
}

const formatDateTime = (time?: string) => {
  if (!time) return '-'
  return time.replace('T', ' ')
}

const getContentText = (record: AwardApplication) => {
  const typeName = getApplicationTypeName(record.applicationType)
  const reason = record.reason ? `申请理由为：${record.reason.slice(0, 15)}...` : ''
  return `申请${typeName}${record.awardName}，${reason}`
}

const loadData = async () => {
  loading.value = true
  try {
    const params: PageRequest = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
    }
    const response = await awardApi.getMyApplications(params)
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

const handleView = async (record: AwardApplication) => {
  try {
    const response = await awardApi.getApplication(record.id!)
    currentRecord.value = response
    visible.value = true
  } catch (error) {
    console.error('获取详情失败', error)
  }
}

const handleCancel = (record: AwardApplication) => {
  Modal.confirm({
    title: '确认撤销',
    content: '确定要撤销该申请吗？撤销后无法恢复。',
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      try {
        await awardApi.cancelApplication(record.id!)
        message.success('撤销成功')
        loadData()
      } catch (error) {
        message.error(error instanceof Error ? error.message : '撤销失败')
      }
    },
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.award-list-container {
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
</style>
