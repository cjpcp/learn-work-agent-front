<template>
  <a-card title="转人工记录">
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="pagination"
      row-key="id"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-tag v-if="record.status === 'PENDING'">待处理</a-tag>
          <a-tag v-else-if="record.status === 'PROCESSING'" color="processing">处理中</a-tag>
          <a-tag v-else-if="record.status === 'COMPLETED'" color="success">已完成</a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-button type="link" @click="handleView(record)">查看详情</a-button>
        </template>
      </template>
    </a-table>

    <a-modal v-model:open="visible" title="转人工记录详情" width="800px" :footer="null">
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="问题ID" :span="2">
          {{ currentTransfer?.questionId }}
        </a-descriptions-item>
        <a-descriptions-item label="转接类型">
          {{ currentTransfer?.transferType === 'MANUAL' ? '手动申请' : '自动转接' }}
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag v-if="currentTransfer?.status === 'PENDING'">待处理</a-tag>
          <a-tag v-else-if="currentTransfer?.status === 'PROCESSING'" color="processing">处理中</a-tag>
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
  </a-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { consultationApi } from '@/api'
import type { PageRequest } from '@/types'

const loading = ref(false)
const dataSource = ref<any[]>([])
const visible = ref(false)
const currentTransfer = ref<any>(null)

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

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

const columns = [
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
    customRender: (text: string) => text === 'MANUAL' ? '手动申请' : '自动转接',
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
    customRender: (text: string) => formatTransferReason(text),
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
    width: 100,
  },
]

const loadData = async () => {
  loading.value = true
  try {
    const params: PageRequest = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
    }
    const response = await consultationApi.getUserTransfers(params)
    if (response.data) {
      dataSource.value = response.data.records
      pagination.total = response.data.total
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

const handleView = async (record: any) => {
  try {
    const response = await consultationApi.getTransferDetail(record.id)
    if (response.data) {
      currentTransfer.value = response.data
      visible.value = true
    }
  } catch (error: any) {
    console.error('获取转人工记录详情失败', error)
  }
}

onMounted(() => {
  loadData()
})
</script>
