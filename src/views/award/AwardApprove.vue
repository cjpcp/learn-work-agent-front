<template>
  <a-card title="待审批奖助申请">
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="pagination"
      row-key="id"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'applicationType'">
          <a-tag v-if="record.applicationType === 'SCHOLARSHIP'" color="gold">奖学金</a-tag>
          <a-tag v-else-if="record.applicationType === 'GRANT'" color="green">助学金</a-tag>
          <a-tag v-else-if="record.applicationType === 'SUBSIDY'" color="blue">困难补助</a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-button type="link" @click="handleApprove(record, 'APPROVED')">批准</a-button>
          <a-button type="link" danger @click="handleApprove(record, 'REJECTED')">拒绝</a-button>
          <a-button type="link" @click="handleView(record)">查看详情</a-button>
        </template>
      </template>
    </a-table>

    <a-modal v-model:open="approveVisible" title="审批" @ok="handleConfirmApprove">
      <a-form :model="approveForm" layout="vertical">
        <a-form-item label="审批意见">
          <a-textarea
            v-model:value="approveForm.approvalComment"
            :rows="4"
            placeholder="请输入审批意见（可选）"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:open="viewVisible" title="奖助详情" width="800px" :footer="null">
      <a-descriptions v-if="currentRecord" :column="2" bordered>
        <a-descriptions-item label="申请类型">
          <a-tag v-if="currentRecord.applicationType === 'SCHOLARSHIP'" color="gold">奖学金</a-tag>
          <a-tag v-else-if="currentRecord.applicationType === 'GRANT'" color="green">助学金</a-tag>
          <a-tag v-else-if="currentRecord.applicationType === 'SUBSIDY'" color="blue">
            困难补助
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag v-if="currentRecord.status === 'PENDING'" color="processing">待审批</a-tag>
          <a-tag v-else-if="currentRecord.status === 'APPROVED'" color="success">已批准</a-tag>
          <a-tag v-else-if="currentRecord.status === 'REJECTED'" color="error">已拒绝</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="申请名称">
          {{ currentRecord.awardName }}
        </a-descriptions-item>
        <a-descriptions-item v-if="currentRecord.amount" label="申请金额">
          ¥{{ currentRecord.amount }}
        </a-descriptions-item>
        <a-descriptions-item label="申请原因" :span="2">
          {{ currentRecord.reason || '无' }}
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">
          {{ currentRecord.createTime }}
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </a-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { awardApi } from '@/api'
import type { AwardApplication, PageRequest, ApprovalRequest } from '@/types'

const route = useRoute()
const loading = ref(false)
const dataSource = ref<AwardApplication[]>([])
const approveVisible = ref(false)
const viewVisible = ref(false)
const currentRecord = ref<AwardApplication | null>(null)
const currentApproveStatus = ref<'APPROVED' | 'REJECTED'>('APPROVED')

const approveForm = reactive<ApprovalRequest>({
  approvalStatus: 'APPROVED',
  approvalComment: '',
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const columns = [
  {
    title: '申请类型',
    dataIndex: 'applicationType',
    key: 'applicationType',
    width: 120,
  },
  {
    title: '申请名称',
    dataIndex: 'awardName',
    key: 'awardName',
  },
  {
    title: '申请金额',
    dataIndex: 'amount',
    key: 'amount',
    width: 120,
  },
  {
    title: '申请原因',
    dataIndex: 'reason',
    key: 'reason',
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

const loadData = async () => {
  loading.value = true
  try {
    const params: PageRequest = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
    }
    const response = await awardApi.getPendingApplications(params)
    const pageResult = (response as any).data ?? response
    dataSource.value = pageResult.records ?? (Array.isArray(pageResult) ? pageResult : [])
    pagination.total = pageResult.total ?? dataSource.value.length
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

const handleApprove = (record: AwardApplication, status: 'APPROVED' | 'REJECTED') => {
  currentRecord.value = record
  currentApproveStatus.value = status
  approveForm.approvalStatus = status
  approveForm.approvalComment = ''
  approveVisible.value = true
}

const handleConfirmApprove = async () => {
  if (!currentRecord.value) return

  try {
    await awardApi.approveApplication(
      currentRecord.value.id!,
      approveForm.approvalStatus === 'APPROVED',
      approveForm.approvalComment,
    )
    message.success('审批成功')
    approveVisible.value = false
    loadData()
  } catch (error: any) {
    message.error('审批失败')
  }
}

const handleView = async (record: AwardApplication) => {
  try {
    const response = await awardApi.getApplication(record.id!)
    currentRecord.value = (response as any).data ?? response
    viewVisible.value = true
  } catch (error: any) {
    message.error('获取详情失败')
  }
}

onMounted(() => {
  loadData()
  // 检查 URL 中是否有 applicationId 参数，如果有则自动打开详情
  const applicationId = route.query.applicationId
  if (applicationId) {
    const id = parseInt(applicationId as string, 10)
    if (!isNaN(id)) {
      // 延迟一点执行，确保列表数据已加载
      setTimeout(() => {
        const record = dataSource.value.find((item) => item.id === id)
        if (record) {
          handleView(record)
        } else {
          // 如果列表中没找到，直接通过 API 获取详情
          awardApi
            .getApplication(id)
            .then((response) => {
              if (response.data) {
                currentRecord.value = response.data
                viewVisible.value = true
              }
            })
            .catch(() => {
              message.error('获取详情失败')
            })
        }
      }, 300)
    }
  }
})
</script>
