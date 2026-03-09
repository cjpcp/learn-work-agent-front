<template>
  <div class="leave-apply-container">
    <div class="page-header">
      <a-page-header title="申请请假" sub-title="请填写请假申请信息" @back="$router.back()">
        <template #extra>
          <a-button type="primary" @click="$router.push('/leave')"> 申请记录 </a-button>
        </template>
      </a-page-header>
    </div>
    <a-card class="apply-card">
      <a-form :model="form" :rules="rules" layout="vertical" @finish="handleSubmit">
        <a-row :gutter="24">
          <a-col :span="24">
            <a-form-item name="leaveType" label="请假类型">
              <a-radio-group v-model:value="form.leaveType">
                <a-radio value="SICK">病假</a-radio>
                <a-radio value="PERSONAL">事假</a-radio>
                <a-radio value="OFFICIAL">公假</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="startDate" label="开始日期">
              <a-date-picker
                v-model:value="form.startDate"
                style="width: 100%"
                format="YYYY-MM-DD"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="endDate" label="结束日期">
              <a-date-picker v-model:value="form.endDate" style="width: 100%" format="YYYY-MM-DD" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="24">
            <a-form-item name="reason" label="请假原因">
              <a-textarea v-model:value="form.reason" :rows="4" placeholder="请输入请假原因" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="24">
            <a-form-item name="attachmentUrl" label="附件">
              <a-upload
                v-model:file-list="fileList"
                :before-upload="beforeUpload"
                :max-count="5"
                multiple
              >
                <a-button>
                  <UploadOutlined />
                  上传附件
                </a-button>
                <template #tip>
                  <div class="ant-upload-hint">最多上传5个文件，支持PDF、Word等格式</div>
                </template>
              </a-upload>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit" :loading="loading"> 提交申请 </a-button>
            <a-button @click="$router.back()"> 取消 </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { leaveApi } from '@/api'
import type { LeaveApplicationRequest } from '@/types'
import type { Rule } from 'ant-design-vue/es/form'
import type { UploadFile } from 'ant-design-vue'

const router = useRouter()
const loading = ref(false)
const fileList = ref<UploadFile[]>([])

const form = reactive<{
  leaveType: string
  startDate: Dayjs | null
  endDate: Dayjs | null
  reason: string
  attachmentUrls?: string[]
}>({
  leaveType: 'PERSONAL',
  startDate: null,
  endDate: null,
  reason: '',
  attachmentUrls: [],
})

const rules: Record<string, Rule[]> = {
  leaveType: [{ required: true, message: '请选择请假类型', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
}

const beforeUpload = (file: File) => {
  return false
}

const handleSubmit = async () => {
  if (!form.startDate || !form.endDate) {
    message.warning('请选择开始和结束日期')
    return
  }

  if (form.endDate.isBefore(form.startDate)) {
    message.warning('结束日期不能早于开始日期')
    return
  }

  loading.value = true
  try {
    // 从fileList中提取URL
    form.attachmentUrls = fileList.value.map((file) => file.thumbUrl || '')
    const request: any = {
      leaveType: form.leaveType as any,
      startDate: form.startDate.format('YYYY-MM-DD'),
      endDate: form.endDate.format('YYYY-MM-DD'),
      reason: form.reason,
      attachmentUrls: form.attachmentUrls,
    }
    await leaveApi.submitApplication(request)
    message.success('申请提交成功')
    router.push('/leave')
  } catch (error: any) {
    message.error(error.message || '申请提交失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.leave-apply-container {
  padding: 24px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 64px);
}

.page-header {
  margin-bottom: 16px;
}

.apply-card {
  max-width: 1000px;
  margin: 0 auto;
}
</style>
