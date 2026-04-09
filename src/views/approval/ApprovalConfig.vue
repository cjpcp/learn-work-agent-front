<template>
  <div class="approval-config-container">
    <a-page-header title="审批流程配置" sub-title="管理审批流程和步骤配置" @back="$router.back()" />
    <a-card class="config-card">
      <a-tabs v-model:active-key="activeTab">
        <a-tab-pane key="processes" tab="流程管理">
          <div class="toolbar">
            <h3>审批流程列表</h3>
            <a-button type="primary" @click="handleAddProcess">添加流程</a-button>
          </div>
          <a-table
            :columns="processColumns"
            :data-source="processes"
            :loading="loadingProcesses"
            row-key="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'"
                ><a-tag :color="record.enabled ? 'green' : 'default'">{{
                  record.enabled ? '启用' : '禁用'
                }}</a-tag></template
              >
              <template v-else-if="column.key === 'action'">
                <a-button type="link" size="small" @click="handleViewSteps(record)"
                  >查看步骤</a-button
                >
                <a-button type="link" size="small" @click="handleEditProcess(record)"
                  >编辑</a-button
                >
                <a-button
                  type="link"
                  size="small"
                  @click="
                    record.enabled ? handleDisableProcess(record) : handleEnableProcess(record)
                  "
                  >{{ record.enabled ? '禁用' : '启用' }}</a-button
                >
                <a-button type="link" size="small" danger @click="handleDeleteProcess(record)"
                  >删除</a-button
                >
              </template>
            </template>
          </a-table>
        </a-tab-pane>
        <a-tab-pane key="steps" tab="步骤配置">
          <div v-if="!currentProcess"><a-empty description="请先选择一个流程" /></div>
          <template v-else>
            <div class="toolbar">
              <h3>{{ currentProcess.processName }} - 审批步骤</h3>
              <a-button type="primary" @click="handleAddStep">添加步骤</a-button>
            </div>
            <a-table
              :columns="stepColumns"
              :data-source="steps"
              :loading="loadingSteps"
              row-key="id"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'approvalType'">{{
                  record.approvalType === 'SINGLE' ? '单人审批' : '多人审批'
                }}</template>
                <template v-else-if="column.key === 'approverRole'">{{
                  getRoleName(record.approverRole)
                }}</template>
                <template v-else-if="column.key === 'target'">
                  <span v-if="record.assignMode === 'ROLE'">{{ getTargetLabel(record) }}</span>
                  <span v-else>{{ getUserLabel(record.approverUserId) }}</span>
                </template>
                <template v-else-if="column.key === 'mustPass'"
                  ><a-switch v-model:checked="record.mustPass" disabled
                /></template>
                <template v-else-if="column.key === 'action'">
                  <a-button type="link" size="small" @click="handleEditStep(record)">编辑</a-button>
                  <a-button type="link" size="small" danger @click="handleDeleteStep(record)"
                    >删除</a-button
                  >
                </template>
              </template>
            </a-table>
          </template>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <a-modal
      v-model:open="processModalVisible"
      :title="editingProcess ? '编辑流程' : '添加流程'"
      @ok="handleSaveProcess"
      @cancel="handleCancelProcess"
    >
      <a-form :model="processForm" layout="vertical">
        <a-form-item label="流程名称"
          ><a-input v-model:value="processForm.processName"
        /></a-form-item>
        <a-form-item label="流程类型"
          ><a-select v-model:value="processForm.processType"
            ><a-select-option value="LEAVE">请假</a-select-option
            ><a-select-option value="AWARD">奖助</a-select-option></a-select
          ></a-form-item
        >
        <a-form-item label="描述"
          ><a-textarea v-model:value="processForm.description" rows="3"
        /></a-form-item>
        <a-form-item label="状态"><a-switch v-model:checked="processForm.enabled" /></a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="stepModalVisible"
      :title="editingStep ? '编辑步骤' : '添加步骤'"
      width="960px"
      :destroy-on-close="true"
      @ok="handleSaveStep"
      @cancel="handleCancelStep"
    >
      <a-form :model="stepForm" layout="vertical">
        <div class="form-row">
          <a-form-item label="步骤名称"><a-input v-model:value="stepForm.stepName" /></a-form-item>
          <a-form-item label="步骤顺序"
            ><a-input-number v-model:value="stepForm.stepOrder" min="1"
          /></a-form-item>
        </div>
        <div class="form-row">
          <a-form-item label="审批类型"
            ><a-select
              v-model:value="stepForm.approvalType"
              :get-popup-container="(trigger: HTMLElement) => trigger.parentNode"
              ><a-select-option value="SINGLE">单人审批</a-select-option
              ><a-select-option value="MULTIPLE">多人审批</a-select-option></a-select
            ></a-form-item
          >
          <a-form-item label="分配模式">
            <a-radio-group v-model:value="stepForm.assignMode" @change="handleModeChange">
              <a-radio value="USER">指定用户</a-radio>
              <a-radio value="ROLE">按角色池分配</a-radio>
            </a-radio-group>
          </a-form-item>
        </div>
        <div class="form-row">
          <a-form-item label="审批角色"
            ><a-select
              v-model:value="stepForm.approverRole"
              :loading="loadingRoles"
              :get-popup-container="(trigger: HTMLElement) => trigger.parentNode"
              @change="handleRoleChange"
              ><a-select-option v-for="role in approverRoles" :key="role.code" :value="role.code">{{
                role.name
              }}</a-select-option></a-select
            ></a-form-item
          >
          <a-form-item label="是否必须通过"
            ><a-switch v-model:checked="stepForm.mustPass"
          /></a-form-item>
        </div>

        <a-form-item v-if="stepForm.assignMode === 'ROLE'" label="目标角色">
          <a-select
            v-model:value="stepForm.roleId"
            placeholder="请选择角色"
            :loading="loadingRoles"
            :get-popup-container="(trigger: HTMLElement) => trigger.parentNode"
          >
            <a-select-option v-for="role in approverRoles" :key="role.code" :value="role.code">{{
              role.name
            }}</a-select-option>
          </a-select>
        </a-form-item>

        <template v-if="stepForm.assignMode === 'USER'">
          <div class="filter-grid">
            <a-form-item label="角色筛选">
              <a-select
                v-model:value="filters.roleId"
                placeholder="选择角色后仅列举该角色用户"
                allow-clear
                :loading="loadingRoles"
                :get-popup-container="(trigger: HTMLElement) => trigger.parentNode"
              >
                <a-select-option v-for="role in approverRoles" :key="role.id" :value="role.id">{{
                  role.name
                }}</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="用户名">
              <a-input v-model:value="filters.username" placeholder="模糊匹配用户名" />
            </a-form-item>
            <a-form-item label="昵称">
              <a-input v-model:value="filters.nick" placeholder="模糊匹配昵称" />
            </a-form-item>
            <a-form-item label="账号状态">
              <a-select
                v-model:value="filters.status"
                placeholder="全部状态"
                allow-clear
                :get-popup-container="(trigger: HTMLElement) => trigger.parentNode"
              >
                <a-select-option :value="1">启用</a-select-option>
                <a-select-option :value="0">禁用</a-select-option>
              </a-select>
            </a-form-item>
          </div>
          <div class="filter-actions">
            <a-input
              v-model:value="filters.teacherKeyword"
              placeholder="教师姓名 / 学工号 / 用户名模糊匹配"
            />
            <a-button type="primary" @click="handleSearch">查询</a-button>
            <a-button @click="handleResetFilters">重置</a-button>
          </div>
          <div class="selected-summary">已勾选 {{ selectedRowKeys.length }} 位用户</div>
          <a-table
            size="small"
            :columns="userColumns"
            :data-source="users"
            :loading="loadingUsers"
            :pagination="userPagination"
            :row-selection="rowSelection"
            row-key="id"
            @change="handleUserTableChange"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="record.status === 1 ? 'green' : 'default'">{{
                  record.status === 1 ? '启用' : '禁用'
                }}</a-tag>
              </template>
            </template>
          </a-table>
        </template>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { approvalConfigApi, systemApi } from '@/api'

const activeTab = ref('processes')
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
  approverUserId: undefined as number | undefined,
  mustPass: true,
  assignMode: 'USER',
  roleId: undefined as string | undefined,
})

const approverRoles = ref<{ id: number; code: string; name: string }[]>([])
const loadingRoles = ref(false)
const users = ref<any[]>([])
const loadingUsers = ref(false)
const selectedRowKeys = ref<number[]>([])

const filters = reactive({
  roleId: undefined as number | undefined,
  username: '',
  nick: '',
  status: undefined as number | undefined,
  teacherKeyword: '',
  pageNum: 1,
  pageSize: 10,
})

const userPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`,
})

const userColumns = [
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '昵称', dataIndex: 'nick', key: 'nick' },
  { title: '教师姓名', dataIndex: 'teacherName', key: 'teacherName' },
  { title: '学工号', dataIndex: 'cardNumber', key: 'cardNumber' },
  { title: '角色', dataIndex: 'roleName', key: 'roleName' },
  { title: '状态', dataIndex: 'status', key: 'status' },
]

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: (string | number)[]) => {
    selectedRowKeys.value = keys.map((key) => Number(key))
  },
}))

const processColumns = [
  { title: '流程名称', dataIndex: 'processName', key: 'processName' },
  { title: '流程类型', dataIndex: 'processType', key: 'processType' },
  { title: '版本', dataIndex: 'version', key: 'version' },
  { title: '状态', dataIndex: 'enabled', key: 'status' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
  { title: '操作', key: 'action' },
]
const stepColumns = [
  { title: '步骤名称', dataIndex: 'stepName', key: 'stepName' },
  { title: '步骤顺序', dataIndex: 'stepOrder', key: 'stepOrder' },
  { title: '审批类型', dataIndex: 'approvalType', key: 'approvalType' },
  { title: '审批角色', dataIndex: 'approverRole', key: 'approverRole' },
  { title: '目标对象', key: 'target' },
  { title: '必须通过', dataIndex: 'mustPass', key: 'mustPass' },
  { title: '操作', key: 'action' },
]

const getRoleName = (role: string) => approverRoles.value.find((r) => r.code === role)?.name || role
const getUserLabel = (userId?: number) =>
  users.value.find((u) => u.id === userId)?.teacherName || '-'

const getTargetLabel = (record: any) => {
  if (record.assignMode === 'ROLE') {
    return approverRoles.value.find((r) => r.code === record.roleId)?.name || record.roleId || '-'
  }
  return '-'
}

const loadApproverRoles = async () => {
  loadingRoles.value = true
  try {
    approverRoles.value = (await systemApi.getStaffRoles()) || []
  } catch (error: any) {
    message.error('获取角色列表失败: ' + (error.message || '未知错误'))
  } finally {
    loadingRoles.value = false
  }
}
const loadUsers = async () => {
  loadingUsers.value = true
  try {
    const page = await systemApi.getUsers({
      pageNum: filters.pageNum,
      pageSize: filters.pageSize,
      roleId: filters.roleId,
      username: filters.username || undefined,
      nick: filters.nick || undefined,
      status: filters.status,
      teacherKeyword: filters.teacherKeyword || undefined,
    })
    users.value = page.records || []
    userPagination.current = page.pageNum
    userPagination.pageSize = page.pageSize
    userPagination.total = page.total
  } catch (error: any) {
    message.error('获取用户列表失败: ' + (error.message || '未知错误'))
  } finally {
    loadingUsers.value = false
  }
}

const resetFilters = () => {
  Object.assign(filters, {
    roleId: undefined,
    username: '',
    nick: '',
    status: undefined,
    teacherKeyword: '',
    pageNum: 1,
    pageSize: 10,
  })
  selectedRowKeys.value = []
  userPagination.current = 1
  userPagination.pageSize = 10
  userPagination.total = 0
}

const handleModeChange = async () => {
  stepForm.roleId = undefined
  stepForm.approverUserId = undefined
  resetFilters()
  await loadUsers()
}

const handleRoleChange = () => {
  stepForm.approverUserId = undefined
}

const handleSearch = async () => {
  filters.pageNum = 1
  await loadUsers()
}

const handleResetFilters = async () => {
  resetFilters()
  await loadUsers()
}

const handleUserTableChange = async (pagination: any) => {
  filters.pageNum = pagination.current
  filters.pageSize = pagination.pageSize
  await loadUsers()
}

const loadProcesses = async () => {
  loadingProcesses.value = true
  try {
    processes.value = (await approvalConfigApi.getProcesses()) || []
  } catch (error: any) {
    message.error('获取流程列表失败: ' + (error.message || '未知错误'))
  } finally {
    loadingProcesses.value = false
  }
}
const loadSteps = async (processId: number) => {
  loadingSteps.value = true
  try {
    steps.value = (await approvalConfigApi.getSteps(processId)) || []
    if (users.value.length === 0) await loadUsers()
  } catch (error: any) {
    message.error('获取步骤列表失败: ' + (error.message || '未知错误'))
  } finally {
    loadingSteps.value = false
  }
}

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
const handleSaveProcess = async () => {
  try {
    editingProcess.value
      ? await approvalConfigApi.updateProcess(editingProcess.value.id, processForm)
      : await approvalConfigApi.createProcess(processForm)
    message.success('保存成功')
    processModalVisible.value = false
    loadProcesses()
  } catch (error: any) {
    message.error('保存失败: ' + (error.message || '未知错误'))
  }
}
const handleCancelProcess = () => {
  processModalVisible.value = false
  editingProcess.value = null
}
const handleDeleteProcess = (record: any) =>
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除流程 "${record.processName}" 吗？`,
    onOk: async () => {
      await approvalConfigApi.deleteProcess(record.id)
      message.success('删除成功')
      loadProcesses()
    },
  })
const handleEnableProcess = async (record: any) => {
  await approvalConfigApi.enableProcess(record.id)
  message.success('启用成功')
  loadProcesses()
}
const handleDisableProcess = async (record: any) => {
  await approvalConfigApi.disableProcess(record.id)
  message.success('禁用成功')
  loadProcesses()
}
const handleViewSteps = (record: any) => {
  currentProcess.value = record
  activeTab.value = 'steps'
  loadSteps(record.id)
}

const handleAddStep = () => {
  if (!currentProcess.value) return message.warning('请先选择一个流程')
  editingStep.value = null
  Object.assign(stepForm, {
    stepName: '',
    stepOrder: steps.value.length + 1,
    approvalType: 'SINGLE',
    approverRole: '',
    approverUserId: undefined,
    mustPass: true,
    assignMode: 'USER',
    roleId: undefined,
  })
  resetFilters()
  stepModalVisible.value = true
  loadUsers()
}
const handleEditStep = async (record: any) => {
  editingStep.value = record
  Object.assign(stepForm, {
    stepName: record.stepName,
    stepOrder: record.stepOrder,
    approvalType: record.approvalType,
    approverRole: record.approverRole,
    approverUserId: record.approverUserId,
    mustPass: record.mustPass,
    assignMode: record.assignMode || 'USER',
    roleId: record.roleId,
  })
  selectedRowKeys.value = record.approverUserId ? [record.approverUserId] : []
  resetFilters()
  stepModalVisible.value = true
  await loadUsers()
}
const handleSaveStep = async () => {
  if (!currentProcess.value) return message.warning('请先选择一个流程')
  try {
    const stepData = {
      stepName: stepForm.stepName,
      stepOrder: stepForm.stepOrder,
      approvalType: stepForm.approvalType,
      approverRole: stepForm.approverRole,
      approverUserId:
        stepForm.assignMode === 'USER'
          ? selectedRowKeys.value.length > 0
            ? selectedRowKeys.value[0]
            : undefined
          : undefined,
      mustPass: stepForm.mustPass,
      assignMode: stepForm.assignMode,
      roleId: stepForm.assignMode === 'ROLE' ? stepForm.roleId : undefined,
      processId: currentProcess.value.id,
    }
    editingStep.value
      ? await approvalConfigApi.updateStep(editingStep.value.id, stepData)
      : await approvalConfigApi.addStep(stepData)
    message.success('保存成功')
    stepModalVisible.value = false
    loadSteps(currentProcess.value.id)
  } catch (error: any) {
    message.error('保存失败: ' + (error.message || '未知错误'))
  }
}
const handleCancelStep = () => {
  stepModalVisible.value = false
  editingStep.value = null
}
const handleDeleteStep = (record: any) =>
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除步骤 "${record.stepName}" 吗？`,
    onOk: async () => {
      await approvalConfigApi.deleteStep(record.id)
      message.success('删除成功')
      if (currentProcess.value) loadSteps(currentProcess.value.id)
    },
  })

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
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.toolbar h3 {
  margin: 0;
}
.form-row {
  display: flex;
  gap: 16px;
}
.form-row > .ant-form-item {
  flex: 1;
}
.filter-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.filter-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.filter-actions .ant-input {
  flex: 1;
}
.selected-summary {
  margin-bottom: 12px;
  color: #666;
}
@media (max-width: 768px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }
  .filter-actions {
    flex-direction: column;
  }
}
</style>
