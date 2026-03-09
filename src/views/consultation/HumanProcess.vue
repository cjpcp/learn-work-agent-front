<template>
  <a-card title="人工处理中心">
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
        <template v-else-if="column.key === 'transferType'">
          {{ record.transferType === 'MANUAL' ? '手动申请' : '自动转接' }}
        </template>
        <template v-else-if="column.key === 'transferReason'">
          {{ formatTransferReason(record.transferReason) }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-button v-if="record.status === 'PENDING'" type="primary" @click="handleAssign(record)">分配</a-button>
          <a-button v-else-if="record.status === 'PROCESSING'" type="primary" @click="handleReply(record)">回复</a-button>
          <a-button type="link" @click="handleView(record)">查看</a-button>
        </template>
      </template>
    </a-table>

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

    <!-- 查看详情模态框 -->
    <a-modal v-model:open="viewVisible" title="转人工记录详情" width="800px" :footer="null">
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
import { message } from 'ant-design-vue'
import type { PageRequest } from '@/types'

const loading = ref(false)
const dataSource = ref<any[]>([])
const assignVisible = ref(false)
const replyVisible = ref(false)
const viewVisible = ref(false)
const currentTransfer = ref<any>(null)
const currentTransferId = ref<number>(0)

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const assignForm = reactive({
  staffId: '',
})

const replyForm = reactive({
  questionText: '',
  reply: '',
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

const loadData = async () => {
  loading.value = true
  try {
    const params: PageRequest = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
    }
    const response = await consultationApi.getStaffTransfers(params)
    if (response.data) {
      dataSource.value = response.data.records
      pagination.total = response.data.total
    }
  } catch (error: any) {
    console.error('加载数据失败', error)
    message.error('加载数据失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
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
    loadData()
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
    loadData()
  } catch (error: any) {
    console.error('回复失败', error)
    message.error('回复失败: ' + (error.message || '未知错误'))
  }
}

const handleView = async (record: any) => {
  try {
    const response = await consultationApi.getTransferDetail(record.id)
    if (response.data) {
      currentTransfer.value = response.data
      viewVisible.value = true
    }
  } catch (error: any) {
    console.error('获取转人工记录详情失败', error)
    message.error('获取详情失败: ' + (error.message || '未知错误'))
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>
