<template>
  <div class="award-apply-container">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">奖助申请办理在线申请办理</h2>
      </div>
      <div class="header-right">
        <a-button type="link" class="record-btn" @click="$router.push('/award')">
          <FileTextOutlined />
          申请记录
        </a-button>
      </div>
    </div>

    <a-card class="apply-card" :bordered="false">
      <a-form
        :model="form"
        :rules="rules"
        layout="horizontal"
        :label-col="{ style: { width: '80px' } }"
        :wrapper-col="{ style: { flex: 1 } }"
        @finish="handleSubmit"
      >
        <a-form-item name="applicationType" label="申请类型">
          <a-select v-model:value="form.applicationType" placeholder="请选择" size="large">
            <a-select-option value="SCHOLARSHIP">奖学金</a-select-option>
            <a-select-option value="GRANT">助学金</a-select-option>
            <a-select-option value="SUBSIDY">困难补助</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item name="departmentName" label="院系">
          <a-input
            v-model:value="form.departmentName"
            placeholder="请输入院系，如：计算机学院"
            size="large"
          />
        </a-form-item>

        <a-form-item name="grade" label="年级">
          <a-input v-model:value="form.grade" placeholder="请输入年级，如：2023" size="large" />
        </a-form-item>

        <a-form-item name="className" label="班级">
          <a-input
            v-model:value="form.className"
            placeholder="请输入班级，如2025级计算机1班"
            size="large"
          />
        </a-form-item>

        <a-form-item name="awardName" label="奖助名称">
          <a-input
            v-model:value="form.awardName"
            placeholder="请输入奖助名称，如：国家奖学金"
            size="large"
          />
        </a-form-item>

        <a-form-item name="studentName" label="姓名">
          <a-input v-model:value="form.studentName" placeholder="输入姓名" size="large" />
        </a-form-item>

        <a-form-item name="reason" label="申请理由">
          <a-textarea
            v-model:value="form.reason"
            :rows="5"
            placeholder="输入申请理由"
            size="large"
            class="reason-textarea"
          />
        </a-form-item>

        <a-form-item label="文件上传">
          <div class="file-upload-wrapper">
            <a-upload
              :file-list="fileList"
              :before-upload="beforeUpload"
              :max-count="5"
              multiple
              list-type="text"
              @remove="handleRemove"
            >
              <a-button shape="round" class="upload-icon-btn">
                <PaperClipOutlined style="font-size: 20px" />
              </a-button>
            </a-upload>
            <span class="upload-hint">支持上传 word/xlsx/pdf/jpg/png等通用格式</span>
          </div>
        </a-form-item>

        <a-form-item :wrapper-col="{ span: 24 }">
          <div class="submit-btn-wrapper">
            <a-space :size="16">
              <a-button size="large" class="cancel-btn" @click="$router.back()">取消</a-button>
              <a-button
                type="primary"
                :loading="loading"
                :disabled="hasUploadingFiles"
                size="large"
                class="submit-btn"
                @click="handleSubmit"
              >
                {{ hasUploadingFiles ? '文件上传中...' : '提交' }}
              </a-button>
            </a-space>
          </div>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PaperClipOutlined, FileTextOutlined } from '@ant-design/icons-vue'
import { awardApi, consultationApi } from '@/api'
import type { Rule } from 'ant-design-vue/es/form'
import type { UploadFile } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const loading = ref(false)
const fileList = ref<UploadFile[]>([])
const uploadingCount = ref(0)
const userStore = useUserStore()

const hasUploadingFiles = computed(() => uploadingCount.value > 0)

const form = reactive({
  applicationType: 'SCHOLARSHIP' as 'SCHOLARSHIP' | 'GRANT' | 'SUBSIDY',
  awardName: '',
  amount: undefined as number | undefined,
  reason: '',
  attachmentUrls: '',
  studentName: '',
  departmentName: '',
  grade: '',
  className: '',
})

onMounted(() => {
  form.studentName = userStore.teacherName || userStore.nick
})

const rules: Record<string, Rule[]> = {
  applicationType: [{ required: true, message: '请选择申请类型', trigger: 'change' }],
  awardName: [{ required: true, message: '请输入奖助名称', trigger: 'blur' }],
  studentName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  departmentName: [{ required: true, message: '请输入院系', trigger: 'blur' }],
  grade: [{ required: true, message: '请输入年级', trigger: 'blur' }],
  className: [{ required: true, message: '请输入班级', trigger: 'blur' }],
}

const handleRemove = (file: UploadFile) => {
  fileList.value = fileList.value.filter((item) => item.uid !== file.uid)
}

const beforeUpload = async (file: File) => {
  uploadingCount.value++
  try {
    const result = await consultationApi.uploadFile(file, file.name)
    const url: string | undefined = result
    if (url) {
      const uploadedFile: UploadFile = {
        uid: String(Date.now()),
        name: file.name,
        status: 'done',
        url: url,
        thumbUrl: url,
      }
      fileList.value = [...fileList.value, uploadedFile]
      message.success(`${file.name} 上传成功`)
    }
  } catch (error) {
    message.error(`${file.name} 上传失败`)
  } finally {
    uploadingCount.value--
  }
  return false
}

const handleSubmit = async () => {
  if (hasUploadingFiles.value) {
    message.warning('文件正在上传中，请等待上传完成后再提交')
    return
  }
  loading.value = true
  try {
    form.attachmentUrls = fileList.value
      .map((file) => file.url || file.thumbUrl || '')
      .filter(Boolean)
      .join(',')
    await awardApi.submitApplication(form)
    message.success('申请提交成功')
    router.push('/award')
  } catch (error) {
    message.error(error instanceof Error ? error.message : '申请提交失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.award-apply-container {
  padding: 24px 40px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 64px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 8px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.record-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #1890ff;
  font-size: 14px;
  padding: 4px 12px;
  height: auto;
}

.record-btn:hover {
  color: #40a9ff;
}

.apply-card {
  max-width: 800px;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  background: #fff;
}

.apply-card :deep(.ant-card-body) {
  padding: 32px 48px;
}

.apply-card :deep(.ant-form-item) {
  margin-bottom: 22px;
}

.apply-card :deep(.ant-form-item-label > label) {
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.apply-card :deep(.ant-input),
.apply-card :deep(.ant-select-selector) {
  border-radius: 6px;
}

.reason-textarea {
  width: 100%;
  border-radius: 6px;
}

.file-upload-wrapper {
  display: flex;
  align-items: center;
  gap: 14px;
}

.upload-icon-btn {
  width: 44px;
  height: 44px;
  border: 1.5px dashed #d9d9d9;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #999;
  transition: all 0.3s;
  background: transparent;
}

.upload-icon-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
  background: rgba(24, 144, 255, 0.04);
}

.upload-hint {
  color: #bbb;
  font-size: 13px;
}

.submit-btn-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.cancel-btn {
  min-width: 80px;
  border-radius: 6px;
  height: 40px;
}

.submit-btn {
  min-width: 80px;
  border-radius: 6px;
  height: 40px;
}
</style>
