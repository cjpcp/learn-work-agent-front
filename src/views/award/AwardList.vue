<template>
  <a-card title="我的奖助申请">
    <template #extra>
      <a-button type="primary" @click="$router.push('/award/apply')">
        <PlusOutlined />
        申请奖助
      </a-button>
      <a-button
        v-if="userStore.isCounselor() || userStore.isAdmin()"
        style="margin-left: 8px"
        @click="$router.push('/award/approve')"
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
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'applicationType'">
          <a-tag v-if="record.applicationType === 'SCHOLARSHIP'" color="gold">奖学金</a-tag>
          <a-tag v-else-if="record.applicationType === 'GRANT'" color="green">助学金</a-tag>
          <a-tag v-else-if="record.applicationType === 'SUBSIDY'" color="blue">困难补助</a-tag>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag v-if="record.status === 'PENDING'" color="processing">待审批</a-tag>
          <a-tag v-else-if="record.status === 'APPROVED'" color="success">已批准</a-tag>
          <a-tag v-else-if="record.status === 'REJECTED'" color="error">已拒绝</a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-button type="link" @click="handleView(record)">查看详情</a-button>
        </template>
      </template>
    </a-table>

    <a-modal v-model:open="visible" title="奖助详情" width="800px" :footer="null">
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="申请类型">
          <a-tag v-if="currentRecord?.applicationType === 'SCHOLARSHIP'" color="gold">奖学金</a-tag>
          <a-tag v-else-if="currentRecord?.applicationType === 'GRANT'" color="green">助学金</a-tag>
          <a-tag v-else-if="currentRecord?.applicationType === 'SUBSIDY'" color="blue">
            困难补助
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag v-if="currentRecord?.status === 'PENDING'" color="processing">待审批</a-tag>
          <a-tag v-else-if="currentRecord?.status === 'APPROVED'" color="success">已批准</a-tag>
          <a-tag v-else-if="currentRecord?.status === 'REJECTED'" color="error">已拒绝</a-tag>
        </a-descriptions-item>
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
  </a-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { awardApi } from '@/api'
import { useUserStore } from '@/stores/user'
import type { AwardApplication, PageRequest } from '@/types'

const userStore = useUserStore()
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
    const response = await awardApi.getMyApplications(params)
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

const handleView = async (record: AwardApplication) => {
  try {
    const response = await awardApi.getApplication(record.id!)
    if (response.data) {
      currentRecord.value = response.data
      visible.value = true
    }
  } catch (error: any) {
    console.error('获取详情失败', error)
  }
}

onMounted(() => {
  loadData()
})
</script>
