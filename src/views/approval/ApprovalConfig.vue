<template>
  <div class="approval-config-container">
    <a-page-header title="审批流程配置" sub-title="管理审批流程和步骤配置" @back="$router.back()" />
    <a-card class="config-card">
      <a-tabs v-model:active-key="activeTab" class="config-tabs">
        <a-tab-pane key="processes" tab="流程管理">
          <div class="process-section">
            <div class="process-header">
              <h3>审批流程列表</h3>
              <a-button type="primary" @click="handleAddProcess">添加流程</a-button>
            </div>
            <a-table
              :columns="processColumns"
              :data-source="processes"
              :loading="loadingProcesses"
              row-key="id"
              @change="handleProcessTableChange"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <a-tag v-if="record.enabled" color="green">启用</a-tag>
                  <a-tag v-else color="default">禁用</a-tag>
                </template>
                <template v-else-if="column.key === 'action'">
                  <a-button
                    type="link"
                    size="small"
                    @click="handleViewSteps(record)"
                    >查看步骤</a-button
                  >
                  <a-button
                    type="link"
                    size="small"
                    @click="handleEditProcess(record)"
                    >编辑</a-button
                  >
                  <a-button
                    v-if="record.enabled"
                    type="link"
                    size="small"
                    @click="handleDisableProcess(record)"
                    >禁用</a-button
                  >
                  <a-button
                    v-else
                    type="link"
                    size="small"
                    @click="handleEnableProcess(record)"
                    >启用</a-button
                  >
                  <a-button
                    type="link"
                    size="small"
                    @click="handleDeleteProcess(record)"
                    danger
                    >删除</a-button
                  >
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>

        <a-tab-pane key="steps" tab="步骤配置">
          <div v-if="!currentProcess" class="empty-state">
            <a-empty description="请先选择一个流程" />
          </div>
          <div v-else class="steps-section">
            <div class="steps-header">
              <h3>{{ currentProcess.processName }} - 审批步骤</h3>
              <a-button type="primary" @click="handleAddStep">添加步骤</a-button>
            </div>
            <a-table
              :columns="stepColumns"
              :data-source="steps"
              :loading="loadingSteps"
              row-key="id"
              @change="handleStepTableChange"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'approvalType'">
                  {{ record.approvalType === 'SINGLE' ? '单人审批' : '多人审批' }}
                </template>
                <template v-else-if="column.key === 'approverRole'">
                  {{ getRoleName(record.approverRole) }}
                </template>
                <template v-else-if="column.key === 'mustPass'">
                  <a-switch v-model:checked="record.mustPass" disabled />
                </template>
                <template v-else-if="column.key === 'action'">
                  <a-button
                    type="link"
                    size="small"
                    @click="handleEditStep(record)"
                    >编辑</a-button
                  >
                  <a-button
                    type="link"
                    size="small"
                    @click="handleDeleteStep(record)"
                    danger
                    >删除</a-button
                  >
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- 流程编辑弹窗 -->
    <a-modal
      v-model:open="processModalVisible"
      :title="editingProcess ? '编辑流程' : '添加流程'"
      width="600px"
      @ok="handleSaveProcess"
      @cancel="handleCancelProcess"
    >
      <a-form :model="processForm" layout="vertical">
        <a-form-item label="流程名称" :rules="[{ required: true, message: '请输入流程名称' }]">
          <a-input v-model:value="processForm.processName" placeholder="请输入流程名称" />
        </a-form-item>
        <a-form-item label="流程类型" :rules="[{ required: true, message: '请选择流程类型' }]">
          <a-select v-model:value="processForm.processType" placeholder="请选择流程类型">
            <a-select-option value="LEAVE">请假</a-select-option>
            <a-select-option value="AWARD">奖助</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea v-model:value="processForm.description" placeholder="请输入流程描述" rows="3" />
        </a-form-item>
        <a-form-item label="状态">
          <a-switch v-model:checked="processForm.enabled" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 步骤编辑弹窗 -->
    <a-modal
      v-model:open="stepModalVisible"
      :title="editingStep ? '编辑步骤' : '添加步骤'"
      width="800px"
      @ok="handleSaveStep"
      @cancel="handleCancelStep"
    >
      <a-form :model="stepForm" layout="vertical">
        <a-form-item label="步骤名称" :rules="[{ required: true, message: '请输入步骤名称' }]">
          <a-input v-model:value="stepForm.stepName" placeholder="请输入步骤名称" />
        </a-form-item>
        <a-form-item label="步骤顺序" :rules="[{ required: true, message: '请输入步骤顺序' }]">
          <a-input-number v-model:value="stepForm.stepOrder" min="1" />
        </a-form-item>
        <a-form-item label="审批类型" :rules="[{ required: true, message: '请选择审批类型' }]">
          <a-select v-model:value="stepForm.approvalType" placeholder="请选择审批类型">
            <a-select-option value="SINGLE">单人审批</a-select-option>
            <a-select-option value="MULTIPLE">多人审批</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="审批人角色" :rules="[{ required: true, message: '请选择审批人角色' }]">
          <a-select v-model:value="stepForm.approverRole" placeholder="请选择审批人角色" :loading="loadingRoles" :get-popup-container="(triggerNode: any) => triggerNode.parentNode" @change="handleRoleChange">
            <a-select-option v-for="role in approverRoles" :key="role.code" :value="role.code">
              {{ role.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-if="stepForm.approverRole === 'ADMIN'" label="部门" :rules="[{ required: true, message: '请选择部门' }]">
          <a-select v-model:value="stepForm.department" placeholder="请选择部门" :loading="loadingDepartments" :get-popup-container="(triggerNode: any) => triggerNode.parentNode" @change="handleDepartmentChange">
            <a-select-option v-for="dept in departments" :key="dept.code" :value="dept.id">
              {{ dept.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-if="stepForm.approverRole === 'ADMIN'" label="具体审批人" :rules="[{ required: true, message: '请选择具体审批人' }]">
          <a-select v-model:value="stepForm.approverUserId" placeholder="请选择具体审批人" :loading="loadingUsers" :get-popup-container="(triggerNode: any) => triggerNode.parentNode">
            <a-select-option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="必须通过">
          <a-switch v-model:checked="stepForm.mustPass" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { approvalConfigApi, systemApi } from '@/api'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const activeTab = ref('processes')

// 流程相关
const processes = ref<any[]>([])
const loadingProcesses = ref(false)
const processModalVisible = ref(false)
const editingProcess = ref<any>(null)
const processForm = reactive({
  processName: '',
  processType: '',
  description: '',
  enabled: true,
  version: 1,
})

// 步骤相关
const currentProcess = ref<any>(null)
const steps = ref<any[]>([])
const loadingSteps = ref(false)
const stepModalVisible = ref(false)
const editingStep = ref<any>(null)
const stepForm = reactive({
  stepName: '',
  stepOrder: 1,
  approvalType: 'SINGLE',
  approverRole: '',
  department: '',
  approverUserId: '',
  mustPass: true,
})

// 用户列表相关
const users = ref<{ id: number; name: string }[]>([])
const loadingUsers = ref(false)

// 部门列表相关
const departments = ref<{ id: number; code: string; name: string }[]>([])
const loadingDepartments = ref(false)

// 用户选择相关
const approverRoles = ref<{ code: string; name: string }[]>([])
const loadingRoles = ref(false)

const processColumns = [
  {
    title: '流程名称',
    dataIndex: 'processName',
    key: 'processName',
  },
  {
    title: '流程类型',
    dataIndex: 'processType',
    key: 'processType',
    customRender: ({ text }: { text: string }) => {
      return text === 'LEAVE' ? '请假' : '奖助'
    },
  },
  {
    title: '版本',
    dataIndex: 'version',
    key: 'version',
  },
  {
    title: '状态',
    dataIndex: 'enabled',
    key: 'status',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]

const stepColumns = [
  {
    title: '步骤名称',
    dataIndex: 'stepName',
    key: 'stepName',
  },
  {
    title: '步骤顺序',
    dataIndex: 'stepOrder',
    key: 'stepOrder',
  },
  {
    title: '审批类型',
    dataIndex: 'approvalType',
    key: 'approvalType',
  },
  {
    title: '审批人角色',
    dataIndex: 'approverRole',
    key: 'approverRole',
  },
  {
    title: '必须通过',
    dataIndex: 'mustPass',
    key: 'mustPass',
  },
  {
    title: '操作',
    key: 'action',
  },
]

const getRoleName = (role: string) => {
  const foundRole = approverRoles.value.find(r => r.code === role)
  return foundRole ? foundRole.name : role
}

// 加载审批人角色列表
const loadApproverRoles = async () => {
  loadingRoles.value = true
  try {
    const response = await systemApi.getStaffRoles()
    if (response.code === 200) {
      approverRoles.value = response.data
    } else {
      message.error('获取角色列表失败: ' + response.message)
    }
  } catch (error: any) {
    message.error('获取角色列表失败: ' + (error.message || '未知错误'))
  } finally {
    loadingRoles.value = false
  }
}

// 加载用户列表
const loadUsers = async (departmentId?: number) => {
  loadingUsers.value = true
  try {
    const response = await systemApi.getUsers(departmentId)
    if (response.code === 200) {
      users.value = response.data
    } else {
      message.error('获取用户列表失败: ' + response.message)
    }
  } catch (error: any) {
    message.error('获取用户列表失败: ' + (error.message || '未知错误'))
  } finally {
    loadingUsers.value = false
  }
}

// 加载部门列表
const loadDepartments = async () => {
  loadingDepartments.value = true
  try {
    const response = await systemApi.getDepartments()
    if (response.code === 200) {
      departments.value = response.data
    } else {
      message.error('获取部门列表失败: ' + response.message)
    }
  } catch (error: any) {
    message.error('获取部门列表失败: ' + (error.message || '未知错误'))
  } finally {
    loadingDepartments.value = false
  }
}

// 处理角色变化
const handleRoleChange = (roleCode: string) => {
  stepForm.department = ''
  stepForm.approverUserId = ''
  if (roleCode === 'ADMIN') {
    loadDepartments()
  }
}

// 处理部门变化
const handleDepartmentChange = (departmentId: string) => {
  stepForm.approverUserId = ''
  if (departmentId) {
    loadUsers(Number(departmentId))
  }
}

// 加载流程列表
const loadProcesses = async () => {
  loadingProcesses.value = true
  try {
    const response = await approvalConfigApi.getProcesses()
    if (response.code === 200) {
      processes.value = response.data
    } else {
      message.error('获取流程列表失败: ' + response.message)
    }
  } catch (error: any) {
    message.error('获取流程列表失败: ' + (error.message || '未知错误'))
  } finally {
    loadingProcesses.value = false
  }
}

// 加载步骤列表
const loadSteps = async (processId: number) => {
  loadingSteps.value = true
  try {
    const response = await approvalConfigApi.getSteps(processId)
    if (response.code === 200) {
      steps.value = response.data
    } else {
      message.error('获取步骤列表失败: ' + response.message)
    }
  } catch (error: any) {
    message.error('获取步骤列表失败: ' + (error.message || '未知错误'))
  } finally {
    loadingSteps.value = false
  }
}

// 处理流程表格变化
const handleProcessTableChange = () => {
  loadProcesses()
}

// 处理步骤表格变化
const handleStepTableChange = () => {
  if (currentProcess.value) {
    loadSteps(currentProcess.value.id)
  }
}

// 添加流程
const handleAddProcess = () => {
  editingProcess.value = null
  Object.assign(processForm, {
    processName: '',
    processType: '',
    description: '',
    enabled: true,
    version: 1,
  })
  processModalVisible.value = true
}

// 编辑流程
const handleEditProcess = (record: any) => {
  editingProcess.value = record
  Object.assign(processForm, {
    processName: record.processName,
    processType: record.processType,
    description: record.description,
    enabled: record.enabled,
    version: record.version,
  })
  processModalVisible.value = true
}

// 保存流程
const handleSaveProcess = async () => {
  try {
    let response
    if (editingProcess.value) {
      response = await approvalConfigApi.updateProcess(editingProcess.value.id, processForm)
    } else {
      response = await approvalConfigApi.createProcess(processForm)
    }
    if (response.code === 200) {
      message.success('保存成功')
      processModalVisible.value = false
      loadProcesses()
    } else {
      message.error('保存失败: ' + response.message)
    }
  } catch (error: any) {
    message.error('保存失败: ' + (error.message || '未知错误'))
  }
}

// 取消流程编辑
const handleCancelProcess = () => {
  processModalVisible.value = false
  editingProcess.value = null
}

// 删除流程
const handleDeleteProcess = (record: any) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除流程 "${record.processName}" 吗？`,
    onOk: async () => {
      try {
        const response = await approvalConfigApi.deleteProcess(record.id)
        if (response.code === 200) {
          message.success('删除成功')
          loadProcesses()
        } else {
          message.error('删除失败: ' + response.message)
        }
      } catch (error: any) {
        message.error('删除失败: ' + (error.message || '未知错误'))
      }
    },
  })
}

// 启用流程
const handleEnableProcess = async (record: any) => {
  try {
    const response = await approvalConfigApi.enableProcess(record.id)
    if (response.code === 200) {
      message.success('启用成功')
      loadProcesses()
    } else {
      message.error('启用失败: ' + response.message)
    }
  } catch (error: any) {
    message.error('启用失败: ' + (error.message || '未知错误'))
  }
}

// 禁用流程
const handleDisableProcess = async (record: any) => {
  try {
    const response = await approvalConfigApi.disableProcess(record.id)
    if (response.code === 200) {
      message.success('禁用成功')
      loadProcesses()
    } else {
      message.error('禁用失败: ' + response.message)
    }
  } catch (error: any) {
    message.error('禁用失败: ' + (error.message || '未知错误'))
  }
}

// 查看步骤
const handleViewSteps = (record: any) => {
  currentProcess.value = record
  activeTab.value = 'steps'
  loadSteps(record.id)
}

// 添加步骤
const handleAddStep = () => {
  if (!currentProcess.value) {
    message.warning('请先选择一个流程')
    return
  }
  editingStep.value = null
  Object.assign(stepForm, {
    stepName: '',
    stepOrder: steps.value.length + 1,
    approvalType: 'SINGLE',
    approverRole: '',
    department: '',
    approverUserId: '',
    mustPass: true,
  })
  stepModalVisible.value = true
}

// 编辑步骤
const handleEditStep = (record: any) => {
  editingStep.value = record
  Object.assign(stepForm, {
    stepName: record.stepName,
    stepOrder: record.stepOrder,
    approvalType: record.approvalType,
    approverRole: record.approverRole,
    department: record.department || '',
    approverUserId: record.approverUserId || '',
    mustPass: record.mustPass,
  })
  
  // 如果是部门领导，加载部门列表
  if (record.approverRole === 'ADMIN') {
    loadDepartments()
    if (record.department) {
      loadUsers(record.department)
    }
  }
  
  stepModalVisible.value = true
}

// 保存步骤
const handleSaveStep = async () => {
  if (!currentProcess.value) {
    message.warning('请先选择一个流程')
    return
  }

  try {
    const stepData = {
      stepName: stepForm.stepName,
      stepOrder: stepForm.stepOrder,
      approvalType: stepForm.approvalType,
      approverRole: stepForm.approverRole,
      department: stepForm.department,
      approverUserId: stepForm.approverUserId,
      mustPass: stepForm.mustPass,
      process: { id: currentProcess.value.id },
    }

    let response
    if (editingStep.value) {
      response = await approvalConfigApi.updateStep(editingStep.value.id, stepData)
    } else {
      response = await approvalConfigApi.addStep(stepData)
    }
    if (response.code === 200) {
      message.success('保存成功')
      stepModalVisible.value = false
      loadSteps(currentProcess.value.id)
    } else {
      message.error('保存失败: ' + response.message)
    }
  } catch (error: any) {
    message.error('保存失败: ' + (error.message || '未知错误'))
  }
}

// 取消步骤编辑
const handleCancelStep = () => {
  stepModalVisible.value = false
  editingStep.value = null
}

// 删除步骤
const handleDeleteStep = (record: any) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除步骤 "${record.stepName}" 吗？`,
    onOk: async () => {
      try {
        const response = await approvalConfigApi.deleteStep(record.id)
        if (response.code === 200) {
          message.success('删除成功')
          if (currentProcess.value) {
            loadSteps(currentProcess.value.id)
          }
        } else {
          message.error('删除失败: ' + response.message)
        }
      } catch (error: any) {
        message.error('删除失败: ' + (error.message || '未知错误'))
      }
    },
  })
}

onMounted(() => {
  loadProcesses()
  loadApproverRoles()
})
</script>

<style scoped>
.approval-config-container {
  padding: 20px;
  min-height: 80vh;
}

.config-card {
  margin-top: 20px;
}

.config-tabs {
  margin-bottom: 20px;
}

.process-section,
.steps-section {
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
}

.process-header,
.steps-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.process-header h3,
.steps-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.empty-state {
  padding: 60px 0;
  text-align: center;
}
</style>
