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

    <a-modal v-model:open="visible" title="对话详情" width="700px" :footer="null">
      <div class="conversation-container">
        <a-spin v-if="historyLoading" />
        <template v-else>
          <div v-if="conversationHistory.length === 0" class="no-history">
            暂无对话历史
          </div>
          <div v-else class="conversation-list">
            <div
              v-for="(msg, index) in conversationHistory"
              :key="index"
              class="conversation-item"
            >
              <div class="user-message">
                <div class="message-label">我的问题</div>
                <div class="message-content">{{ msg.query }}</div>
              </div>
              <div class="ai-message">
                <div class="message-label">智能助手回答</div>
                <div class="message-content">{{ msg.answer || '正在处理中...' }}</div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </a-modal>
  </a-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { consultationApi } from '@/api'
import type { ConsultationQuestion, PageRequest } from '@/types'

interface ConversationMessage {
  id: string
  query: string
  answer: string
  createdAt: string
}

const loading = ref(false)
const historyLoading = ref(false)
const dataSource = ref<ConsultationQuestion[]>([])
const visible = ref(false)
const currentQuestion = ref<ConsultationQuestion | null>(null)
const conversationHistory = ref<ConversationMessage[]>([])

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

const loadConversationHistory = async (questionId: number) => {
  historyLoading.value = true
  try {
    const response = await consultationApi.getQuestionHistory(questionId)
    if (response) {
      conversationHistory.value = response
    }
  } catch (error: any) {
    console.error('加载对话历史失败', error)
    conversationHistory.value = []
  } finally {
    historyLoading.value = false
  }
}

const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

const handleView = (record: ConsultationQuestion) => {
  currentQuestion.value = record
  conversationHistory.value = []
  visible.value = true
  loadConversationHistory(record.id)
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

<style scoped>
.conversation-container {
  max-height: 500px;
  overflow-y: auto;
  padding: 8px;
}

.no-history {
  text-align: center;
  color: #999;
  padding: 40px;
}

.conversation-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.conversation-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-message,
.ai-message {
  padding: 12px;
  border-radius: 8px;
}

.user-message {
  background-color: #e6f4ff;
  border: 1px solid #91caff;
}

.ai-message {
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
}

.message-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.message-content {
  color: #333;
  line-height: 1.6;
  white-space: pre-wrap;
}
</style>
