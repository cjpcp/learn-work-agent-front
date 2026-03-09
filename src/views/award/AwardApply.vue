<template>
  <div class="award-apply-container">
    <div class="page-header">
      <a-page-header title="申请奖助" sub-title="请填写奖助申请信息" @back="$router.back()">
        <template #extra>
          <a-button type="primary" @click="$router.push('/award')"> 申请记录 </a-button>
        </template>
      </a-page-header>
    </div>
    <a-card class="apply-card">
      <a-form :model="form" :rules="rules" layout="vertical" @finish="handleSubmit">
        <a-row :gutter="24">
          <a-col :span="24">
            <a-form-item name="applicationType" label="申请类型">
              <a-select v-model:value="form.applicationType" style="width: 100%">
                <a-select-option value="SCHOLARSHIP">奖学金</a-select-option>
                <a-select-option value="GRANT">助学金</a-select-option>
                <a-select-option value="SUBSIDY">困难补助</a-select-option>
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
            <a-form-item name="awardName" label="申请名称">
              <a-input v-model:value="form.awardName" placeholder="请输入申请名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="amount" label="申请金额">
              <a-input-number
                v-model:value="form.amount"
                :min="0"
                :precision="2"
                style="width: 100%"
                placeholder="请输入申请金额"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="24">
            <a-form-item name="reason" label="申请原因">
              <a-textarea v-model:value="form.reason" :rows="4" placeholder="请输入申请原因" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="24">
            <a-form-item name="attachmentUrls" label="附件">
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
import { awardApi } from '@/api'
import type { AwardApplicationRequest } from '@/types'
import type { Rule } from 'ant-design-vue/es/form'
import type { UploadFile } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const loading = ref(false)
const fileList = ref<UploadFile[]>([])
const userStore = useUserStore()

const form = reactive<AwardApplicationRequest>({
  applicationType: 'SCHOLARSHIP',
  awardName: '',
  amount: undefined,
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
  applicationType: [{ required: true, message: '请选择申请类型', trigger: 'change' }],
  department: [{ required: true, message: '请选择院系', trigger: 'change' }],
  grade: [{ required: true, message: '请选择年级', trigger: 'change' }],
  className: [{ required: true, message: '请输入班级', trigger: 'blur' }],
  studentName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  awardName: [{ required: true, message: '请输入申请名称', trigger: 'blur' }],
}

const beforeUpload = (file: File) => {
  return false
}

const handleSubmit = async () => {
  loading.value = true
  try {
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
