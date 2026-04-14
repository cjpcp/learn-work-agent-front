<template>
  <div class="transfer-config-container">
    <a-page-header
      title="人工转接配置中心"
      sub-title="配置不同问题类型的人工转接处理人"
      @back="$router.back()"
    />
    <a-card class="config-card">
      <div class="toolbar">
        <div>
          <h3>转接规则列表</h3>
          <p>支持按角色分配或分页筛选后勾选多个具体处理人，未命中时可配置 DEFAULT 兜底规则。</p>
        </div>
        <a-button type="primary" @click="handleAdd">新增规则</a-button>
      </div>

      <a-table :columns="columns" :data-source="configs" :loading="loading" row-key="id">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'assignMode'">
            <a-tag :color="record.assignMode === 'USER' ? 'blue' : 'purple'">
              {{ record.assignMode === 'USER' ? '指定用户' : '按角色池分配' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'businessType'">
            <a-tag>{{ record.businessType }}</a-tag>
          </template>
          <template v-else-if="column.key === 'target'">
            <span v-if="record.assignMode === 'USER'">{{
              (record.userNames || []).join('、') || '-'
            }}</span>
            <span v-else>{{ record.roleName || '-' }}</span>
          </template>
          <template v-else-if="column.key === 'enabled'">
            <a-tag :color="record.enabled ? 'green' : 'default'">{{
              record.enabled ? '启用' : '禁用'
            }}</a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
            <a-button type="link" size="small" danger @click="handleDelete(record)">删除</a-button>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="modalVisible"
      :title="editingRecord ? '编辑转接规则' : '新增转接规则'"
      width="960px"
      @ok="handleSave"
      @cancel="handleCancel"
    >
      <a-form :model="form" layout="vertical">
        <div class="form-row">
          <a-form-item label="问题类型">
            <a-select v-model:value="form.businessType" placeholder="请选择问题类型或兜底规则">
              <a-select-option value="SCHOLARSHIP">SCHOLARSHIP（奖助勤贷）</a-select-option>
              <a-select-option value="DORMITORY">DORMITORY（宿舍管理）</a-select-option>
              <a-select-option value="DISCIPLINE">DISCIPLINE（违纪申诉）</a-select-option>
              <a-select-option value="MENTAL">MENTAL（心理健康）</a-select-option>
              <a-select-option value="DEFAULT">DEFAULT（兜底）</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="优先级">
            <a-input-number v-model:value="form.priority" :min="1" style="width: 100%" />
          </a-form-item>
        </div>

        <div class="form-row">
          <a-form-item label="分配模式">
            <a-radio-group v-model:value="form.assignMode" @change="handleModeChange">
              <a-radio value="USER">指定用户</a-radio>
              <a-radio value="ROLE">按角色池分配</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="是否启用">
            <a-switch v-model:checked="form.enabled" />
          </a-form-item>
        </div>

        <a-form-item v-if="form.assignMode === 'ROLE'" label="目标角色">
          <a-select v-model:value="form.roleId" placeholder="请选择角色" :loading="loadingRoles">
            <a-select-option v-for="role in roles" :key="role.id" :value="role.id">{{
              role.name
            }}</a-select-option>
          </a-select>
        </a-form-item>

        <template v-if="form.assignMode === 'USER'">
          <div class="filter-grid">
            <a-form-item label="角色筛选">
              <a-select
                v-model:value="filters.roleId"
                placeholder="选择角色后仅列举该角色用户"
                allow-clear
                :loading="loadingRoles"
              >
                <a-select-option v-for="role in roles" :key="role.id" :value="role.id">{{
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
              <a-select v-model:value="filters.status" placeholder="全部状态" allow-clear>
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

        <a-form-item label="备注">
          <a-textarea
            v-model:value="form.remark"
            :rows="3"
            placeholder="例如：请假类默认优先转接辅导员"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { systemApi, transferConfigApi } from '@/api'
import type { TransferConfig } from '@/api/transfer-config'
import type { User } from '@/api/system'
import type { TablePagination } from '@/types'

const configs = ref<TransferConfig[]>([])
const loading = ref(false)
const roles = ref<{ id: number; code: string; name: string }[]>([])
const loadingRoles = ref(false)
const users = ref<User[]>([])
const loadingUsers = ref(false)
const modalVisible = ref(false)
const editingRecord = ref<TransferConfig | null>(null)
const selectedRowKeys = ref<number[]>([])

const form = reactive({
  businessType: 'DEFAULT',
  assignMode: 'USER',
  roleId: undefined as number | undefined,
  priority: 1,
  enabled: true,
  remark: '',
})

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

const columns = [
  { title: '问题类型', dataIndex: 'businessType', key: 'businessType' },
  { title: '分配模式', dataIndex: 'assignMode', key: 'assignMode' },
  { title: '目标对象', key: 'target' },
  { title: '优先级', dataIndex: 'priority', key: 'priority' },
  { title: '状态', dataIndex: 'enabled', key: 'enabled' },
  { title: '备注', dataIndex: 'remark', key: 'remark' },
  { title: '操作', key: 'action' },
]

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

const loadConfigs = async () => {
  loading.value = true
  try {
    configs.value = (await transferConfigApi.list()) || []
  } catch (error) {
    message.error('获取人工转接配置失败: ' + (error instanceof Error ? error.message : '未知错误'))
  } finally {
    loading.value = false
  }
}

const loadRoles = async () => {
  loadingRoles.value = true
  try {
    roles.value = (await systemApi.getAllRoles()) || []
  } catch (error) {
    message.error('获取角色列表失败: ' + (error instanceof Error ? error.message : '未知错误'))
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
  } catch (error) {
    message.error('获取用户列表失败: ' + (error instanceof Error ? error.message : '未知错误'))
  } finally {
    loadingUsers.value = false
  }
}

const resetForm = () => {
  Object.assign(form, {
    businessType: 'DEFAULT',
    assignMode: 'USER',
    roleId: undefined,
    priority: 1,
    enabled: true,
    remark: '',
  })
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
  users.value = []
  userPagination.current = 1
  userPagination.pageSize = 10
  userPagination.total = 0
}

const handleAdd = async () => {
  editingRecord.value = null
  resetForm()
  modalVisible.value = true
  await loadUsers()
}

const handleEdit = async (record: TransferConfig) => {
  editingRecord.value = record
  Object.assign(form, {
    businessType: record.businessType,
    assignMode: record.assignMode,
    roleId: record.roleId,
    priority: record.priority,
    enabled: record.enabled,
    remark: record.remark || '',
  })
  Object.assign(filters, {
    roleId: undefined,
    username: '',
    nick: '',
    status: undefined,
    teacherKeyword: '',
    pageNum: 1,
    pageSize: 10,
  })
  selectedRowKeys.value = (record.userIds || []).map((id: number) => Number(id))
  modalVisible.value = true
  await loadUsers()
}

const handleModeChange = async () => {
  form.roleId = undefined
  selectedRowKeys.value = []
  Object.assign(filters, {
    roleId: undefined,
    username: '',
    nick: '',
    status: undefined,
    teacherKeyword: '',
    pageNum: 1,
    pageSize: 10,
  })
  await loadUsers()
}

const handleSearch = async () => {
  filters.pageNum = 1
  await loadUsers()
}

const handleResetFilters = async () => {
  Object.assign(filters, {
    roleId: undefined,
    username: '',
    nick: '',
    status: undefined,
    teacherKeyword: '',
    pageNum: 1,
    pageSize: 10,
  })
  await loadUsers()
}

const handleUserTableChange = async (pagination: TablePagination) => {
  filters.pageNum = pagination.current ?? 1
  filters.pageSize = pagination.pageSize ?? 10
  await loadUsers()
}

const handleSave = async () => {
  try {
    const payload = {
      businessType: form.businessType,
      assignMode: form.assignMode,
      roleId: form.assignMode === 'ROLE' ? form.roleId : undefined,
      userIds: form.assignMode === 'USER' ? selectedRowKeys.value : undefined,
      priority: form.priority,
      enabled: form.enabled,
      remark: form.remark,
    }
    if (editingRecord.value) {
      await transferConfigApi.update(editingRecord.value.id, payload)
    } else {
      await transferConfigApi.create(payload)
    }
    message.success('保存成功')
    modalVisible.value = false
    loadConfigs()
  } catch (error) {
    message.error('保存失败: ' + (error instanceof Error ? error.message : '未知错误'))
  }
}

const handleCancel = () => {
  modalVisible.value = false
  editingRecord.value = null
}

const handleDelete = (record: TransferConfig) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除规则“${record.businessType}”吗？`,
    onOk: async () => {
      await transferConfigApi.delete(record.id)
      message.success('删除成功')
      loadConfigs()
    },
  })
}

onMounted(() => {
  loadConfigs()
  loadRoles()
})
</script>

<style scoped>
.transfer-config-container {
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
  gap: 16px;
}
.toolbar h3 {
  margin: 0;
}
.toolbar p {
  margin: 4px 0 0;
  color: #666;
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
