<template>
  <a-card title="咨询历史">
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="pagination"
      row-key="id"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'questionType'">
          <a-tag v-if="record.questionType === 'TEXT'">文本</a-tag>
          <a-tag v-else-if="record.questionType === 'VOICE'">语音</a-tag>
          <a-tag v-else-if="record.questionType === 'IMAGE'">图片</a-tag>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag v-if="record.status === 'PENDING'">待回答</a-tag>
          <a-tag v-else-if="record.status === 'ANSWERED'" color="success">已回答</a-tag>
          <a-tag v-else-if="record.status === 'TRANSFERRED'" color="warning">已转人工</a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-button type="link" @click="handleView(record)">查看详情</a-button>
        </template>
      </template>
    </a-table>

    <a-modal v-model:open="visible" title="问题详情" width="800px" :footer="null">
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="问题内容" :span="2">
          {{ currentQuestion?.questionText }}
        </a-descriptions-item>
        <a-descriptions-item label="问题类型">
          <a-tag v-if="currentQuestion?.questionType === 'TEXT'">文本</a-tag>
          <a-tag v-else-if="currentQuestion?.questionType === 'VOICE'">语音</a-tag>
          <a-tag v-else-if="currentQuestion?.questionType === 'IMAGE'">图片</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="问题分类">
          {{ getCategoryName(currentQuestion?.category) }}
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag v-if="currentQuestion?.status === 'PENDING'">待回答</a-tag>
          <a-tag v-else-if="currentQuestion?.status === 'ANSWERED'" color="success">已回答</a-tag>
          <a-tag v-else-if="currentQuestion?.status === 'TRANSFERRED'" color="warning">
            已转人工
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item v-if="currentQuestion?.answerText" label="回答内容" :span="2">
          {{ currentQuestion.answerText }}
        </a-descriptions-item>
        <a-descriptions-item v-if="currentQuestion?.satisfactionScore" label="满意度评分">
          {{ currentQuestion.satisfactionScore }}
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">
          {{ currentQuestion?.createTime }}
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </a-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { consultationApi } from '@/api'
import type { ConsultationQuestion, PageRequest } from '@/types'

const loading = ref(false)
const dataSource = ref<ConsultationQuestion[]>([])
const visible = ref(false)
const currentQuestion = ref<ConsultationQuestion | null>(null)

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const columns = [
  {
    title: '问题内容',
    dataIndex: 'questionText',
    key: 'questionText',
    ellipsis: true,
  },
  {
    title: '问题类型',
    dataIndex: 'questionType',
    key: 'questionType',
    width: 100,
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
    const response = await consultationApi.getMyQuestions(params)
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

const handleView = (record: ConsultationQuestion) => {
  currentQuestion.value = record
  visible.value = true
}

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

onMounted(() => {
  loadData()
})
</script>
