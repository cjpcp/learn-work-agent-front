<template>
  <div class="leave-apply-container">
    <div class="leave-apply-header">
      <h2 class="leave-apply-title">申请请假</h2>
      <p class="leave-apply-subtitle">请填写以下信息提交请假申请</p>
    </div>
    <div class="leave-apply-card">
      <a-form :model="form" :rules="rules" layout="vertical" @finish="handleSubmit">
        <a-form-item name="leaveType" label="请假类型">
          <div class="radio-group-container">
            <a-radio-group v-model:value="form.leaveType">
              <a-radio value="SICK" class="radio-item">
                <div class="radio-content">
                  <MedicineBoxOutlined />
                  <span>病假</span>
                </div>
              </a-radio>
              <a-radio value="PERSONAL" class="radio-item">
                <div class="radio-content">
                  <UserOutlined />
                  <span>事假</span>
                </div>
              </a-radio>
              <a-radio value="OFFICIAL" class="radio-item">
                <div class="radio-content">
                  <StarOutlined />
                  <span>公假</span>
                </div>
              </a-radio>
            </a-radio-group>
          </div>
        </a-form-item>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="startDate" label="开始日期">
              <a-date-picker
                v-model:value="form.startDate"
                style="width: 100%"
                format="YYYY-MM-DD"
                class="date-picker"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="endDate" label="结束日期">
              <a-date-picker
                v-model:value="form.endDate"
                style="width: 100%"
                format="YYYY-MM-DD"
                class="date-picker"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item name="reason" label="请假原因">
          <a-textarea
            v-model:value="form.reason"
            :rows="4"
            placeholder="请详细描述请假原因"
            class="reason-textarea"
          />
        </a-form-item>
        <a-form-item name="attachmentUrl" label="附件">
          <div class="upload-section">
            <a-upload
              v-model:file-list="fileList"
              :before-upload="beforeUpload"
              :max-count="1"
              :class="{ 'upload-active': fileList.length > 0 }"
            >
              <div class="upload-button">
                <UploadOutlined />
                <span>上传附件</span>
                <p class="upload-hint">支持PDF、Word等格式</p>
              </div>
            </a-upload>
            <div v-if="fileList.length > 0" class="file-info">
              <FileOutlined />
              <span>{{ fileList[0].name }}</span>
              <button class="remove-file" @click="fileList = []">
                <CloseOutlined />
              </button>
            </div>
          </div>
        </a-form-item>
        <a-form-item>
          <div class="form-actions">
            <a-button type="primary" html-type="submit" :loading="loading" class="submit-button">
              提交申请
            </a-button>
            <a-button class="cancel-button" @click="$router.back()"> 取消 </a-button>
          </div>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  UploadOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  StarOutlined,
  FileOutlined,
  CloseOutlined,
} from '@ant-design/icons-vue'
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
  attachmentUrl?: string
}>({
  leaveType: 'PERSONAL',
  startDate: null,
  endDate: null,
  reason: '',
  attachmentUrl: '',
})

const rules: Record<string, Rule[]> = {
  leaveType: [{ required: true, message: '请选择请假类型', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
}

const beforeUpload = (file: File) => {
  // 这里应该上传到服务器获取URL
  // 暂时返回false阻止自动上传
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
    const request: LeaveApplicationRequest = {
      leaveType: form.leaveType as any,
      startDate: form.startDate.format('YYYY-MM-DD'),
      endDate: form.endDate.format('YYYY-MM-DD'),
      reason: form.reason,
      attachmentUrl: form.attachmentUrl,
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
  padding: 32px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: calc(100vh - 64px);
}

.leave-apply-header {
  text-align: center;
  margin-bottom: 40px;
}

.leave-apply-title {
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.leave-apply-subtitle {
  font-size: 16px;
  color: #666;
  margin-top: 8px;
}

.leave-apply-card {
  max-width: 800px;
  margin: 0 auto;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background: #fff;
  padding: 40px;
}

/* 增加表单元素之间的间距 */
.a-form-item {
  margin-bottom: 24px !important;
}

/* 优化标签样式 */
.a-form-item-label {
  font-weight: 600 !important;
  font-size: 14px !important;
  color: #333 !important;
}

.radio-group-container {
  display: flex;
  gap: 24px;
  margin-top: 8px;
}

.radio-item {
  flex: 1;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.radio-item:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.1);
}

.radio-item .ant-radio-checked .ant-radio-inner {
  border-color: #667eea;
  background-color: #667eea;
}

.radio-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.radio-content svg {
  font-size: 24px;
  color: #667eea;
}

.date-picker {
  border-radius: 8px !important;
  border: 2px solid #f0f0f0 !important;
  transition: all 0.3s ease !important;
  height: 48px !important;
}

.date-picker:hover {
  border-color: #667eea !important;
}

.date-picker:focus {
  border-color: #764ba2 !important;
  box-shadow: 0 0 0 2px rgba(118, 75, 162, 0.2) !important;
}

.reason-textarea {
  border-radius: 8px !important;
  border: 2px solid #f0f0f0 !important;
  transition: all 0.3s ease !important;
  resize: vertical !important;
  min-height: 120px !important;
  padding: 12px !important;
}

.reason-textarea:hover {
  border-color: #667eea !important;
}

.reason-textarea:focus {
  border-color: #764ba2 !important;
  box-shadow: 0 0 0 2px rgba(118, 75, 162, 0.2) !important;
}

.upload-section {
  margin-top: 8px;
}

.upload-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px;
  border: 2px dashed #d9d9d9;
  border-radius: 12px;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-button:hover {
  border-color: #667eea;
  background: #f0f2ff;
}

.upload-active .upload-button {
  border-color: #667eea;
}

.upload-hint {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f0f2ff;
  border-radius: 12px;
  margin-top: 16px;
  font-size: 14px;
  color: #667eea;
}

.remove-file {
  background: none;
  border: none;
  cursor: pointer;
  color: #ff4d4f;
  font-size: 16px;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.remove-file:hover {
  background: rgba(255, 77, 79, 0.1);
  transform: rotate(90deg);
}

.form-actions {
  display: flex;
  gap: 16px;
  margin-top: 32px;
}

.submit-button {
  flex: 1;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  transition: all 0.3s ease;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.cancel-button {
  flex: 1;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  border: 2px solid #d9d9d9;
  transition: all 0.3s ease;
}

.cancel-button:hover {
  border-color: #667eea;
  color: #667eea;
}

@media (max-width: 768px) {
  .leave-apply-container {
    padding: 16px;
  }

  .leave-apply-title {
    font-size: 24px;
  }

  .radio-group-container {
    flex-direction: column;
    gap: 12px;
  }

  .form-actions {
    flex-direction: column;
  }

  .submit-button,
  .cancel-button {
    width: 100%;
  }
}
</style>
