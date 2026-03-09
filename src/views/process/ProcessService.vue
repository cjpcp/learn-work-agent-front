<template>
  <div class="process-service-container">
    <a-page-header title="流程代办服务" sub-title="查看和管理您的代办流程" @back="$router.back()" />
    <a-card class="process-card">
      <a-tabs default-active-key="pending" class="process-tabs">
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
    </a-card>

    <!-- 详情弹窗 -->
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { processApi, leaveApi, awardApi } from '@/api'
import type { ProcessItem, LeaveApplication, AwardApplication } from '@/types'

const pendingProcesses = ref<ProcessItem[]>([])
const completedProcesses = ref<ProcessItem[]>([])

// 弹窗相关
const detailVisible = ref(false)
const currentType = ref<'leave' | 'award' | ''>('')
const leaveDetail = ref<LeaveApplication | null>(null)
const awardDetail = ref<AwardApplication | null>(null)
const loadingDetail = ref(false)

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

onMounted(() => {
  loadProcesses()
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
</style>
