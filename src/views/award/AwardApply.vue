<template>
  <div class="award-apply-container">
    <div class="award-apply-header">
      <h2 class="award-apply-title">申请奖助</h2>
      <p class="award-apply-subtitle">请填写以下信息提交奖助申请</p>
    </div>
    <div class="award-apply-card">
      <a-form :model="form" :rules="rules" layout="vertical" @finish="handleSubmit">
        <a-form-item name="applicationType" label="申请类型">
          <div class="radio-group-container">
            <a-radio-group v-model:value="form.applicationType">
              <a-radio value="SCHOLARSHIP" class="radio-item">
                <div class="radio-content">
                  <TrophyOutlined />
                  <span>奖学金</span>
                </div>
              </a-radio>
              <a-radio value="GRANT" class="radio-item">
                <div class="radio-content">
                  <FundOutlined />
                  <span>助学金</span>
                </div>
              </a-radio>
              <a-radio value="SUBSIDY" class="radio-item">
                <div class="radio-content">
                  <HeartOutlined />
                  <span>困难补助</span>
                </div>
              </a-radio>
            </a-radio-group>
          </div>
        </a-form-item>
        <a-form-item name="awardName" label="申请名称">
          <a-input v-model:value="form.awardName" placeholder="请输入申请名称" class="form-input" />
        </a-form-item>
        <a-form-item name="amount" label="申请金额">
          <a-input-number
            v-model:value="form.amount"
            :min="0"
            :precision="2"
            style="width: 100%"
            placeholder="请输入申请金额"
            class="amount-input"
          />
        </a-form-item>
        <a-form-item name="reason" label="申请原因">
          <a-textarea
            v-model:value="form.reason"
            :rows="4"
            placeholder="请详细描述申请原因"
            class="reason-textarea"
          />
        </a-form-item>
        <a-form-item name="attachmentUrls" label="附件">
          <div class="upload-section">
            <a-upload
              v-model:file-list="fileList"
              :before-upload="beforeUpload"
              :max-count="5"
              multiple
              :class="{ 'upload-active': fileList.length > 0 }"
            >
              <div class="upload-button">
                <UploadOutlined />
                <span>上传附件</span>
                <p class="upload-hint">最多上传5个文件，支持PDF、Word等格式</p>
              </div>
            </a-upload>
            <div v-if="fileList.length > 0" class="file-list">
              <div v-for="(file, index) in fileList" :key="index" class="file-item">
                <FileOutlined />
                <span class="file-name">{{ file.name }}</span>
                <button class="remove-file" @click="fileList.splice(index, 1)">
                  <CloseOutlined />
                </button>
              </div>
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
  TrophyOutlined,
  FundOutlined,
  HeartOutlined,
  FileOutlined,
  CloseOutlined,
} from '@ant-design/icons-vue'
import { awardApi } from '@/api'
import type { AwardApplicationRequest } from '@/types'
import type { Rule } from 'ant-design-vue/es/form'
import type { UploadFile } from 'ant-design-vue'

const router = useRouter()
const loading = ref(false)
const fileList = ref<UploadFile[]>([])

const form = reactive<AwardApplicationRequest>({
  applicationType: 'SCHOLARSHIP',
  awardName: '',
  amount: undefined,
  reason: '',
  attachmentUrls: [],
})

const rules: Record<string, Rule[]> = {
  applicationType: [{ required: true, message: '请选择申请类型', trigger: 'change' }],
  awardName: [{ required: true, message: '请输入申请名称', trigger: 'blur' }],
}

const beforeUpload = (file: File) => {
  // 这里应该上传到服务器获取URL
  // 暂时返回false阻止自动上传
  return false
}

const handleSubmit = async () => {
  loading.value = true
  try {
    // 从fileList中提取URL（实际应该从上传API获取）
    form.attachmentUrls = fileList.value.map((file) => file.thumbUrl || '')
    await awardApi.submitApplication(form)
    message.success('申请提交成功')
    router.push('/award')
  } catch (error: any) {
    message.error(error.message || '申请提交失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.award-apply-container {
  padding: 32px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: calc(100vh - 64px);
}

.award-apply-header {
  text-align: center;
  margin-bottom: 40px;
}

.award-apply-title {
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.award-apply-subtitle {
  font-size: 16px;
  color: #666;
  margin-top: 8px;
}

.award-apply-card {
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

.form-input {
  border-radius: 8px !important;
  border: 2px solid #f0f0f0 !important;
  transition: all 0.3s ease !important;
  height: 48px !important;
}

.form-input:hover {
  border-color: #667eea !important;
}

.form-input:focus {
  border-color: #764ba2 !important;
  box-shadow: 0 0 0 2px rgba(118, 75, 162, 0.2) !important;
}

.amount-input {
  border-radius: 8px !important;
  border: 2px solid #f0f0f0 !important;
  transition: all 0.3s ease !important;
  height: 48px !important;
}

.amount-input:hover {
  border-color: #667eea !important;
}

.amount-input:focus {
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

.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f0f2ff;
  border-radius: 8px;
  font-size: 14px;
  color: #667eea;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  .award-apply-container {
    padding: 16px;
  }

  .award-apply-title {
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
