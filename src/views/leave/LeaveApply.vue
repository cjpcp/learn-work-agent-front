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
            <a-form-item name="leaveType" label="申请类型">
              <a-select v-model:value="form.leaveType" style="width: 100%">
                <a-select-option value="SICK">病假</a-select-option>
                <a-select-option value="PERSONAL">事假</a-select-option>
                <a-select-option value="OFFICIAL">公假</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="department" label="院系">
              <a-select v-model:value="form.department" style="width: 100%" placeholder="请选择院系">
                <a-select-option value="体育学院">体育学院</a-select-option>
                <a-select-option value="文学院">文学院</a-select-option>
                <a-select-option value="理学院">理学院</a-select-option>
                <a-select-option value="工学院">工学院</a-select-option>
                <a-select-option value="商学院">商学院</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="grade" label="年级">
              <a-select v-model:value="form.grade" style="width: 100%" placeholder="请选择年级">
                <a-select-option value="2021">2021</a-select-option>
                <a-select-option value="2022">2022</a-select-option>
                <a-select-option value="2023">2023</a-select-option>
                <a-select-option value="2024">2024</a-select-option>
                <a-select-option value="2025">2025</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="className" label="班级">
              <a-input v-model:value="form.className" placeholder="请输入班级" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="studentName" label="姓名">
              <a-input v-model:value="form.studentName" placeholder="请输入姓名" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="startDate" label="时间">
              <a-range-picker
                v-model:value="dateRange"
                style="width: 100%"
                format="YYYY-MM-DD HH:mm"
                show-time
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="24">
            <a-form-item name="reason" label="问题说明">
              <div style="position: relative;">
                <a-textarea v-model:value="form.reason" :rows="6" placeholder="输入请假说明" />
                <a-button type="primary" style="position: absolute; top: -40px; right: 0;">生成请假条</a-button>
              </div>
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { leaveApi } from '@/api'
import type { LeaveApplicationRequest } from '@/types'
import type { Rule } from 'ant-design-vue/es/form'
import type { UploadFile } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const loading = ref(false)
const fileList = ref<UploadFile[]>([])
const dateRange = ref<[Dayjs | null, Dayjs | null]>([null, null])
const userStore = useUserStore()

const form = reactive<{
  leaveType: string
  startDate: Dayjs | null
  endDate: Dayjs | null
  reason: string
  attachmentUrls?: string[]
  studentName?: string
  department?: string
  grade?: string
  className?: string
}>({
  leaveType: 'PERSONAL',
  startDate: null,
  endDate: null,
  reason: '',
  attachmentUrls: [],
  studentName: '',
  department: '',
  grade: '',
  className: '',
})

// 初始化表单数据
onMounted(() => {
  // 从用户信息中获取数据
  form.studentName = userStore.realName
  form.department = userStore.department
  form.grade = userStore.grade
  form.className = userStore.className
})

const rules: Record<string, Rule[]> = {
  leaveType: [{ required: true, message: '请选择请假类型', trigger: 'change' }],
  department: [{ required: true, message: '请选择院系', trigger: 'change' }],
  grade: [{ required: true, message: '请选择年级', trigger: 'change' }],
  className: [{ required: true, message: '请输入班级', trigger: 'blur' }],
  studentName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
}

const beforeUpload = (file: File) => {
  return false
}

const handleSubmit = async () => {
  if (!dateRange.value[0] || !dateRange.value[1]) {
    message.warning('请选择开始和结束时间')
    return
  }

  loading.value = true
  try {
    // 从fileList中提取URL
    form.attachmentUrls = fileList.value.map((file) => file.thumbUrl || '')
    const request: any = {
      leaveType: form.leaveType as any,
      startDate: dateRange.value[0]?.format('YYYY-MM-DD'),
      endDate: dateRange.value[1]?.format('YYYY-MM-DD'),
      reason: form.reason,
      attachmentUrl: form.attachmentUrls?.join(','),
      studentName: form.studentName,
      department: form.department,
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
