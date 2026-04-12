<template>
  <div class="leave-apply-container">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">请假在线申请</h2>
      </div>
      <div class="header-right">
        <a-button type="link" class="record-btn" @click="$router.push('/leave')">
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
        <a-form-item name="leaveType" label="申请类型">
          <a-select v-model:value="form.leaveType" placeholder="请选择" size="large">
            <a-select-option value="PERSONAL">事假</a-select-option>
            <a-select-option value="OFFICIAL">公假</a-select-option>
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

        <a-form-item name="studentName" label="姓名">
          <a-input v-model:value="form.studentName" placeholder="输入姓名" size="large" />
        </a-form-item>

        <a-form-item name="dateRange" label="时间">
          <div class="date-range-wrapper">
            <a-date-picker
              v-model:value="startDate"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              size="large"
              placeholder="开始时间"
              style="width: 200px"
            />
            <span class="date-separator">至</span>
            <a-date-picker
              v-model:value="endDate"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              size="large"
              placeholder="结束时间"
              style="width: 200px"
            />
          </div>
        </a-form-item>

        <a-form-item name="reason" label="问题说明">
          <div class="reason-wrapper">
            <div class="reason-header">
              <span class="ai-generate-btn" @click="handleGenerateSlip">
                <ThunderboltOutlined /> 生成请条单
              </span>
            </div>
            <a-textarea
              v-model:value="form.reason"
              :rows="5"
              placeholder="输入请假说明"
              size="large"
              class="reason-textarea"
            />
          </div>
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
              <a-button type="primary" html-type="submit" :loading="loading" size="large" class="submit-btn">
                提交
              </a-button>
            </a-space>
          </div>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PaperClipOutlined, FileTextOutlined, ThunderboltOutlined } from '@ant-design/icons-vue'
import type { Dayjs } from 'dayjs'
import { leaveApi, consultationApi } from '@/api'
import type { Rule } from 'ant-design-vue/es/form'
import type { UploadFile } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const loading = ref(false)
const generating = ref(false)
const fileList = ref<UploadFile[]>([])
const startDate = ref<Dayjs | null>(null)
const endDate = ref<Dayjs | null>(null)
const userStore = useUserStore()

const form = reactive({
  leaveType: 'PERSONAL',
  reason: '',
  attachmentUrl: '',
  studentName: '',
  departmentName: '',
  grade: '',
  className: '',
})

onMounted(() => {
  form.studentName = userStore.teacherName || userStore.nick
})

const rules: Record<string, Rule[]> = {
  leaveType: [{ required: true, message: '请选择请假类型', trigger: 'change' }],
  studentName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  departmentName: [{ required: true, message: '请输入院系', trigger: 'blur' }],
  grade: [{ required: true, message: '请输入年级', trigger: 'blur' }],
  className: [{ required: true, message: '请输入班级', trigger: 'blur' }],
}

const handleRemove = (file: UploadFile) => {
  fileList.value = fileList.value.filter((item) => item.uid !== file.uid)
}

const beforeUpload = async (file: File) => {
  try {
    const result = await consultationApi.uploadFile(file, file.name)
    const url = result
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
  }
  return false
}

const handleGenerateSlip = async () => {
  if (!startDate.value || !endDate.value) {
    message.warning('请选择开始和结束时间')
    return
  }
  if (!form.studentName) {
    message.warning('请输入姓名')
    return
  }
  if (!form.departmentName) {
    message.warning('请输入院系')
    return
  }
  if (!form.grade) {
    message.warning('请选择年级')
    return
  }
  if (!form.className) {
    message.warning('请输入班级')
    return
  }

  generating.value = true
  try {
    const request = {
      leaveType: form.leaveType as 'PERSONAL' | 'OFFICIAL',
      startDate: startDate.value?.format('YYYY-MM-DD'),
      endDate: endDate.value?.format('YYYY-MM-DD'),
      reason: form.reason,
      attachmentUrl: fileList.value.map((file) => file.thumbUrl || '').join(','),
      studentName: form.studentName,
      departmentName: form.departmentName,
      grade: form.grade,
      className: form.className,
    }
    const application = await leaveApi.submitApplication(request)
    if (application && application.id !== undefined) {
      message.loading({ content: '正在生成请假条...', key: 'generateSlip' })
      try {
        await leaveApi.generateLeaveSlip(application.id)
        message.success({ content: '请假条生成成功，正在下载...', key: 'generateSlip' })
        leaveApi.downloadLeaveSlip(application.id)
      } catch {
        message.warning({ content: '请假条生成失败，请稍后在申请详情中重试', key: 'generateSlip' })
      }
    } else {
      message.error('申请提交失败')
    }
  } catch (error) {
    message.error(error instanceof Error ? error.message : '申请提交失败')
  } finally {
    generating.value = false
  }
}

const handleSubmit = async () => {
  if (!startDate.value || !endDate.value) {
    message.warning('请选择开始和结束时间')
    return
  }
  loading.value = true
  try {
    const request = {
      leaveType: form.leaveType as 'PERSONAL' | 'OFFICIAL',
      startDate: startDate.value?.format('YYYY-MM-DD'),
      endDate: endDate.value?.format('YYYY-MM-DD'),
      reason: form.reason,
      attachmentUrl: fileList.value.map((file) => file.thumbUrl || '').join(','),
      studentName: form.studentName,
      departmentName: form.departmentName,
      grade: form.grade,
      className: form.className,
    }
    await leaveApi.submitApplication(request)
    message.success('申请提交成功')
    router.push('/leave')
  } catch (error) {
    message.error(error instanceof Error ? error.message : '申请提交失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.leave-apply-container {
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
.apply-card :deep(.ant-select-selector),
.apply-card :deep(.ant-picker) {
  border-radius: 6px;
}

.date-range-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date-separator {
  color: #999;
  font-size: 14px;
}

.reason-wrapper {
  position: relative;
  width: 100%;
}

.reason-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 4px;
}

.ai-generate-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 14px;
  background-color: #1890ff;
  color: #fff;
  border-radius: 14px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.ai-generate-btn:hover {
  background-color: #40a9ff;
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
