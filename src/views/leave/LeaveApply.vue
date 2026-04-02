<template>
  <div class="leave-apply-container">
    <div class="page-header">
      <a-page-header title="申请请假" sub-title="请填写请假申请信息" @back="$router.back()">
        <template #extra>
          <a-button type="primary" @click="$router.push('/leave')">申请记录</a-button>
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
                <a-select-option value="PUBLIC">公假</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="studentName" label="姓名">
              <a-input v-model:value="form.studentName" placeholder="请输入姓名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="startDate" label="时间">
              <a-range-picker v-model:value="dateRange" style="width: 100%" format="YYYY-MM-DD HH:mm" show-time />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="24">
            <a-form-item name="reason" label="问题说明">
              <div style="position: relative">
                <a-textarea v-model:value="form.reason" :rows="6" placeholder="输入请假说明" />
                <a-button type="primary" style="position: absolute; top: -40px; right: 0" @click="handleGenerateSlip">生成请假条</a-button>
              </div>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="24">
            <a-form-item name="attachmentUrl" label="附件">
              <a-upload v-model:file-list="fileList" :before-upload="beforeUpload" :max-count="5" multiple>
                <a-button><UploadOutlined />上传附件</a-button>
                <template #tip><div class="ant-upload-hint">最多上传5个文件，支持PDF、Word等格式</div></template>
              </a-upload>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit" :loading="loading">提交申请</a-button>
            <a-button @click="$router.back()">取消</a-button>
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
import type { Dayjs } from 'dayjs'
import { leaveApi } from '@/api'
import type { Rule } from 'ant-design-vue/es/form'
import type { UploadFile } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const loading = ref(false)
const fileList = ref<UploadFile[]>([])
const dateRange = ref<[Dayjs | null, Dayjs | null]>([null, null])
const userStore = useUserStore()

const form = reactive({
  leaveType: 'PERSONAL',
  reason: '',
  attachmentUrl: '',
  studentName: '',
})

onMounted(() => {
  form.studentName = userStore.teacherName || userStore.nick
})

const rules: Record<string, Rule[]> = {
  leaveType: [{ required: true, message: '请选择请假类型', trigger: 'change' }],
  studentName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
}

const beforeUpload = (_file: File) => false

const handleGenerateSlip = () => {
  message.info('请先提交请假申请，待审批通过后在申请详情中生成请假条')
}

const handleSubmit = async () => {
  if (!dateRange.value[0] || !dateRange.value[1]) {
    message.warning('请选择开始和结束时间')
    return
  }
  loading.value = true
  try {
    const request = {
      leaveType: form.leaveType as 'SICK' | 'PERSONAL' | 'PUBLIC',
      startDate: dateRange.value[0]?.format('YYYY-MM-DD'),
      endDate: dateRange.value[1]?.format('YYYY-MM-DD'),
      reason: form.reason,
      attachmentUrl: fileList.value.map(file => file.thumbUrl || '').join(','),
      studentName: form.studentName,
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
.leave-apply-container { padding: 24px; background-color: #f0f2f5; min-height: calc(100vh - 64px); }
.page-header { margin-bottom: 16px; }
.apply-card { max-width: 1000px; margin: 0 auto; }
</style>
