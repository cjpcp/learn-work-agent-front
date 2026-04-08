<template>
  <div class="leave-apply-container">
    <div class="page-header">
      <a-page-header title="请假申请" sub-title="请填写请假申请信息" @back="$router.back()">
        <template #extra>
          <a-button type="primary" @click="$router.push('/leave')">申请列表</a-button>
        </template>
      </a-page-header>
    </div>
    <a-card class="apply-card" :bordered="false">
      <a-form
        :model="form"
        :rules="rules"
        layout="horizontal"
        :label-col="{ style: { width: '100px' } }"
        :wrapper-col="{ style: { flex: 1 } }"
        @finish="handleSubmit"
      >
        <a-row :gutter="[32, 0]">
          <a-col :span="12">
            <a-form-item name="leaveType" label="申请类型">
              <a-select v-model:value="form.leaveType" placeholder="请选择" size="large">
                <a-select-option value="PERSONAL">事假</a-select-option>
                <a-select-option value="OFFICIAL">公假</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="studentName" label="姓名">
              <a-input v-model:value="form.studentName" placeholder="请输入姓名" size="large" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="[32, 0]">
          <a-col :span="12">
            <a-form-item name="departmentName" label="院系">
              <a-input
                v-model:value="form.departmentName"
                placeholder="请输入院系，如：计算机学院"
                size="large"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="grade" label="年级">
              <a-input v-model:value="form.grade" placeholder="请输入年级，如：2022" size="large" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="[32, 0]">
          <a-col :span="12">
            <a-form-item name="className" label="班级">
              <a-input
                v-model:value="form.className"
                placeholder="请输入班级，如2025级计算机1班"
                size="large"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="dateRange" label="时间">
              <a-range-picker
                v-model:value="dateRange"
                style="width: 100%"
                format="YYYY-MM-DD HH:mm:ss"
                show-time
                size="large"
                :placeholder="['开始时间', '结束时间']"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row>
          <a-col :span="24">
            <a-form-item name="reason" label="问题说明">
              <div class="reason-wrapper">
                <a-textarea
                  v-model:value="form.reason"
                  :rows="4"
                  placeholder="输入请假说明"
                  size="large"
                  class="reason-textarea"
                />
              </div>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row>
          <a-col :span="24">
            <div class="generate-btn-wrapper">
              <a-button
                type="primary"
                html-type="button"
                class="generate-btn"
                :loading="generating"
                @click="handleGenerateSlip"
                >生成请假条</a-button
              >
            </div>
          </a-col>
        </a-row>

        <a-row>
          <a-col :span="24">
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
                <span class="upload-hint">点击上传附件，支持PDF、Word、图片等格式</span>
              </div>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row>
          <a-col :span="24">
            <a-form-item :wrapper-col="{ span: 24 }">
              <div class="submit-btn-wrapper">
                <a-space :size="16">
                  <a-button
                    type="primary"
                    html-type="submit"
                    :loading="loading"
                    size="large"
                    style="min-width: 120px"
                    >提交申请</a-button
                  >
                  <a-button size="large" style="min-width: 80px" @click="$router.back()"
                    >取消</a-button
                  >
                </a-space>
              </div>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PaperClipOutlined } from '@ant-design/icons-vue'
import type { Dayjs } from 'dayjs'
import { leaveApi, consultationApi } from '@/api'
import type { Rule } from 'ant-design-vue/es/form'
import type { UploadFile } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const loading = ref(false)
const generating = ref(false)
const fileList = ref<UploadFile[]>([])
const dateRange = ref<[Dayjs | null, Dayjs | null]>([null, null])
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
  console.log('beforeUpload 被调用, file:', file.name)
  try {
    console.log('开始上传文件:', file.name)
    const url: any = await consultationApi.uploadFile(file, file.name)
    console.log('文件上传响应:', url)
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
    } else {
      message.warning(`${file.name} 上传返回地址为空`)
    }
  } catch (error: any) {
    message.error(`${file.name} 上传失败`)
    console.error('上传文件失败:', error)
  }
  return false
}

const handleGenerateSlip = async () => {
  if (!dateRange.value[0] || !dateRange.value[1]) {
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
      startDate: dateRange.value[0]?.format('YYYY-MM-DD'),
      endDate: dateRange.value[1]?.format('YYYY-MM-DD'),
      reason: form.reason,
      attachmentUrl: fileList.value.map((file) => file.thumbUrl || '').join(','),
      studentName: form.studentName,
      departmentName: form.departmentName,
      grade: form.grade,
      className: form.className,
    }
    const result = (await leaveApi.submitApplication(request)) as any
    if (result && result.id) {
      message.loading({ content: '正在生成请假条...', key: 'generateSlip' })
      try {
        await leaveApi.generateLeaveSlip(result.id)
        message.success({ content: '请假条生成成功，正在下载...', key: 'generateSlip' })
        leaveApi.downloadLeaveSlip(result.id)
      } catch {
        message.warning({ content: '请假条生成失败，请稍后在申请详情中重试', key: 'generateSlip' })
      }
    } else {
      message.error('申请提交失败')
    }
  } catch (error: any) {
    message.error(error.message || '申请提交失败')
  } finally {
    generating.value = false
  }
}

const handleSubmit = async () => {
  if (!dateRange.value[0] || !dateRange.value[1]) {
    message.warning('请选择开始和结束时间')
    return
  }
  loading.value = true
  try {
    const request = {
      leaveType: form.leaveType as 'PERSONAL' | 'OFFICIAL',
      startDate: dateRange.value[0]?.format('YYYY-MM-DD'),
      endDate: dateRange.value[1]?.format('YYYY-MM-DD'),
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
  background-color: #f5f7fa;
  min-height: calc(100vh - 64px);
}

.page-header {
  margin-bottom: 28px;
}

.apply-card {
  max-width: 960px;
  margin: 0 auto;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  background: #fff;
}

.apply-card :deep(.ant-card-body) {
  padding: 40px 50px;
}

.apply-card :deep(.ant-form-item) {
  margin-bottom: 28px;
}

.apply-card :deep(.ant-form-item-label > label) {
  color: #444;
  font-weight: 500;
  font-size: 15px;
}

.reason-wrapper {
  position: relative;
  width: 100%;
}

.reason-textarea {
  width: 100%;
}

.generate-btn-wrapper {
  margin-top: -8px;
  margin-bottom: 28px;
  padding-left: 100px;
}

.generate-btn {
  border-radius: 6px;
  padding: 6px 24px;
  height: 40px;
  font-size: 14px;
}

.submit-btn-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.file-upload-wrapper {
  display: flex;
  align-items: center;
  gap: 14px;
}

.upload-icon-btn {
  width: 52px;
  height: 52px;
  border: 2px dashed #c0c0c0;
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
  color: #999;
  font-size: 13px;
}
</style>
