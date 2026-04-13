<template>
  <div class="process-service-container">
    <a-page-header title="流程代办服务" sub-title="查看和管理您的代办流程" @back="$router.back()" />
    <a-card class="process-card">
      <a-tabs v-model:active-key="activeTab" class="process-tabs">
        <!-- 流程代办标签页 -->
        <a-tab-pane key="process" tab="流程代办">
          <a-tabs
            v-model:active-key="processActiveTab"
            class="sub-tabs"
            @change="handleProcessTabChange"
          >
            <a-tab-pane key="pending" tab="待办流程">
              <div class="process-toolbar">
                <a-select
                  v-model:value="pendingFilter"
                  style="width: 160px"
                  @change="handlePendingFilterChange"
                >
                  <a-select-option value="all">全部类型</a-select-option>
                  <a-select-option value="leave">请假申请</a-select-option>
                  <a-select-option value="award">奖助申请</a-select-option>
                  <a-select-option value="leave_cancel">销假申请</a-select-option>
                </a-select>
              </div>
              <a-spin :spinning="pendingLoading">
                <div v-if="pendingProcesses.length === 0" class="empty-state">
                  <a-empty description="暂无待办流程" />
                </div>
                <a-list v-else :data-source="pendingProcesses" class="process-list">
                  <template #renderItem="{ item }">
                    <a-list-item class="process-item">
                      <a-list-item-meta>
                        <template #title>
                          <div class="process-title">
                            <span>{{ item.name }}</span>
                          </div>
                        </template>
                        <template #description>
                          <div class="process-info">
                            <div>{{ item.description }}</div>
                            <div class="process-time">创建时间: {{ item.createTime }}</div>
                          </div>
                        </template>
                      </a-list-item-meta>
                      <template #actions>
                        <a-tag
                          :color="item.status === 'pending' ? 'blue' : 'green'"
                          class="process-status"
                          style="margin-right: 8px"
                        >
                          {{ item.status === 'pending' ? '待处理' : '已处理' }}
                        </a-tag>
                        <a-button
                          v-if="item.allowAction"
                          type="primary"
                          size="small"
                          style="margin-right: 4px"
                          @click="handleGoApprove(item)"
                        >
                          去审批
                        </a-button>
                        <a-button type="default" size="small" @click="handleViewProcess(item)">
                          查看详情
                        </a-button>
                      </template>
                    </a-list-item>
                  </template>
                </a-list>
                <div v-if="pendingProcesses.length > 0" class="pagination-wrapper">
                  <a-pagination
                    v-model:current="pendingPagination.current"
                    v-model:page-size="pendingPagination.pageSize"
                    :total="pendingPagination.total"
                    :show-size-changer="true"
                    :page-size-options="['5', '10', '20', '50']"
                    :show-total="(total: number) => `共 ${total} 条`"
                    :show-quick-jumper="true"
                    :hide-on-single-page="false"
                    @change="handlePendingPageChange"
                    @show-size-change="handlePendingPageChange"
                  />
                </div>
              </a-spin>
            </a-tab-pane>
            <a-tab-pane key="completed" tab="已办理流程">
              <div class="process-toolbar">
                <a-select
                  v-model:value="completedFilter"
                  style="width: 160px"
                  @change="handleCompletedFilterChange"
                >
                  <a-select-option value="all">全部类型</a-select-option>
                  <a-select-option value="leave">请假申请</a-select-option>
                  <a-select-option value="award">奖助申请</a-select-option>
                  <a-select-option value="leave_cancel">销假申请</a-select-option>
                </a-select>
              </div>
              <a-spin :spinning="completedLoading">
                <div v-if="completedProcesses.length === 0" class="empty-state">
                  <a-empty description="暂无已办理流程" />
                </div>
                <a-list v-else :data-source="completedProcesses" class="process-list">
                  <template #renderItem="{ item }">
                    <a-list-item class="process-item">
                      <a-list-item-meta>
                        <template #title>
                          <div class="process-title">
                            <span>{{ item.name }}</span>
                          </div>
                        </template>
                        <template #description>
                          <div class="process-info">
                            <div>{{ item.description }}</div>
                            <div class="process-time">创建时间: {{ item.createTime }}</div>
                          </div>
                        </template>
                      </a-list-item-meta>
                      <template #actions>
                        <a-tag
                          :color="item.status === 'pending' ? 'blue' : 'green'"
                          class="process-status"
                          style="margin-right: 8px"
                        >
                          {{ item.status === 'pending' ? '待处理' : '已处理' }}
                        </a-tag>
                        <a-button type="primary" size="small" @click="handleViewProcess(item)">
                          查看详情
                        </a-button>
                      </template>
                    </a-list-item>
                  </template>
                </a-list>
                <div v-if="completedProcesses.length > 0" class="pagination-wrapper">
                  <a-pagination
                    v-model:current="completedPagination.current"
                    v-model:page-size="completedPagination.pageSize"
                    :total="completedPagination.total"
                    :show-size-changer="true"
                    :page-size-options="['5', '10', '20', '50']"
                    :show-total="(total: number) => `共 ${total} 条`"
                    :show-quick-jumper="true"
                    :hide-on-single-page="false"
                    @change="handleCompletedPageChange"
                    @show-size-change="handleCompletedPageChange"
                  />
                </div>
              </a-spin>
            </a-tab-pane>
          </a-tabs>
        </a-tab-pane>

        <!-- 人工处理中心标签页 -->
        <a-tab-pane v-if="showHumanCenter" key="human" tab="人工处理中心">
          <a-tabs v-model:active-key="humanActiveTab" class="sub-tabs">
            <a-tab-pane key="pending" tab="待完成">
              <a-table
                :columns="humanProcessColumns"
                :data-source="humanProcessData"
                :loading="humanProcessLoading"
                :pagination="humanProcessPagination"
                row-key="id"
                @change="handleHumanProcessTableChange"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'status'">
                    <a-tag v-if="record.status === 'PENDING'">待处理</a-tag>
                    <a-tag v-else-if="record.status === 'PROCESSING'" color="processing"
                      >处理中</a-tag
                    >
                    <a-tag v-else-if="record.status === 'COMPLETED'" color="success">已完成</a-tag>
                  </template>
                  <template v-else-if="column.key === 'transferType'">
                    {{ record.transferType === 'MANUAL' ? '手动申请' : '自动转接' }}
                  </template>
                  <template v-else-if="column.key === 'transferReason'">
                    {{ formatTransferReason(record.transferReason) }}
                  </template>
                  <template v-else-if="column.key === 'action'">
                    <a-button
                      v-if="record.status === 'PENDING'"
                      type="primary"
                      size="small"
                      @click="handleProcess(record)"
                      >处理</a-button
                    >
                    <a-button
                      v-else-if="record.status === 'PROCESSING'"
                      type="primary"
                      size="small"
                      @click="handleReply(record)"
                      >回复</a-button
                    >
                    <a-button type="link" size="small" @click="handleViewTransfer(record)"
                      >查看</a-button
                    >
                  </template>
                </template>
              </a-table>
            </a-tab-pane>
            <a-tab-pane key="completed" tab="我完成的">
              <a-table
                :columns="completedProcessColumns"
                :data-source="completedProcessData"
                :loading="completedProcessLoading"
                :pagination="completedProcessPagination"
                row-key="id"
                @change="handleCompletedProcessTableChange"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'status'">
                    <a-tag v-if="record.status === 'PENDING'">待处理</a-tag>
                    <a-tag v-else-if="record.status === 'PROCESSING'" color="processing"
                      >处理中</a-tag
                    >
                    <a-tag v-else-if="record.status === 'COMPLETED'" color="success">已完成</a-tag>
                  </template>
                  <template v-else-if="column.key === 'transferType'">
                    {{ record.transferType === 'MANUAL' ? '手动申请' : '自动转接' }}
                  </template>
                  <template v-else-if="column.key === 'transferReason'">
                    {{ formatTransferReason(record.transferReason) }}
                  </template>
                  <template v-else-if="column.key === 'staffReply'">
                    {{ record.staffReply || '无' }}
                  </template>
                  <template v-else-if="column.key === 'action'">
                    <a-button type="link" size="small" @click="handleViewTransfer(record)"
                      >查看</a-button
                    >
                  </template>
                </template>
              </a-table>
            </a-tab-pane>
          </a-tabs>
        </a-tab-pane>

        <!-- 我的转人工记录标签页 -->
        <a-tab-pane key="transfers" tab="我的转人工记录">
          <a-table
            :columns="transferColumns"
            :data-source="transferData"
            :loading="transferLoading"
            :pagination="transferPagination"
            row-key="id"
            @change="handleTransferTableChange"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag v-if="record.status === 'PENDING'">待处理</a-tag>
                <a-tag v-else-if="record.status === 'PROCESSING'" color="processing">处理中</a-tag>
                <a-tag v-else-if="record.status === 'COMPLETED'" color="success">已完成</a-tag>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-button type="link" size="small" @click="handleViewTransferDetail(record)"
                  >查看详情</a-button
                >
              </template>
            </template>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- 流程详情弹窗 -->
    <a-modal
      v-model:open="detailVisible"
      :title="
        currentType === 'leave' ? '请假详情' : currentType === 'award' ? '奖助详情' : '销假详情'
      "
      width="700px"
      :footer="null"
      @cancel="handleCloseDetail"
    >
      <a-spin :spinning="loadingDetail">
        <!-- 请假详情 -->
        <a-descriptions v-if="currentType === 'leave' && leaveDetail" :column="2" bordered>
          <a-descriptions-item label="请假类型">
            <a-tag v-if="leaveDetail?.leaveType === 'PERSONAL'" color="orange">事假</a-tag>
            <a-tag v-else-if="leaveDetail?.leaveType === 'OFFICIAL'" color="blue">公假</a-tag>
            <span v-else>{{ leaveDetail?.leaveType }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="审批状态">
            <a-tag v-if="leaveDetail?.approvalStatus === 'PENDING'" color="processing"
              >待审批</a-tag
            >
            <a-tag v-else-if="leaveDetail?.approvalStatus === 'APPROVED'" color="success"
              >已批准</a-tag
            >
            <a-tag v-else-if="leaveDetail?.approvalStatus === 'REJECTED'" color="error"
              >已拒绝</a-tag
            >
            <span v-else>{{ leaveDetail?.approvalStatus }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="开始日期">
            {{ leaveDetail?.startDate }}
          </a-descriptions-item>
          <a-descriptions-item label="结束日期">
            {{ leaveDetail?.endDate }}
          </a-descriptions-item>
          <a-descriptions-item label="请假天数"> {{ leaveDetail?.days }} 天 </a-descriptions-item>
          <a-descriptions-item label="申请人ID">
            {{ leaveDetail?.applicantId }}
          </a-descriptions-item>
          <a-descriptions-item label="请假原因" :span="2">
            {{ leaveDetail?.reason || '无' }}
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">
            {{ leaveDetail?.createTime }}
          </a-descriptions-item>
          <a-descriptions-item v-if="leaveDetail?.approvalTime" label="审批时间">
            {{ leaveDetail?.approvalTime }}
          </a-descriptions-item>
          <a-descriptions-item v-if="leaveDetail?.approvalComment" label="审批意见" :span="2">
            {{ leaveDetail?.approvalComment }}
          </a-descriptions-item>
          <a-descriptions-item v-if="leaveDetail?.attachmentUrl" label="附件" :span="2">
            <template
              v-for="(url, idx) in (leaveDetail?.attachmentUrl || '').split(',').filter(Boolean)"
              :key="idx"
            >
              <a :href="url" target="_blank" rel="noopener" download>
                <PaperClipOutlined /> {{ idx + 1 }}. {{ url.split('/').pop() || '下载附件' }}
              </a>
              <br
                v-if="
                  idx < (leaveDetail?.attachmentUrl || '').split(',').filter(Boolean).length - 1
                "
              />
            </template>
          </a-descriptions-item>
        </a-descriptions>

        <!-- 审批流程状态 -->
        <div v-if="approvalProcess" class="approval-process-section" style="margin-top: 20px">
          <h3 style="margin-bottom: 12px">审批流程</h3>
          <a-timeline>
            <a-timeline-item
              v-for="(step, index) in approvalProcess.steps"
              :key="index"
              :color="
                step.status === 'APPROVED' ? 'green' : step.status === 'REJECTED' ? 'red' : 'blue'
              "
            >
              <div>
                <strong>{{ step.name }}</strong>
                <span v-if="step.approver" style="margin-left: 8px; color: #666"
                  >({{ step.approver }})</span
                >
              </div>
              <div
                v-if="step.status === 'APPROVED' || step.status === 'REJECTED'"
                style="margin-top: 4px; font-size: 12px; color: #999"
              >
                {{ step.status === 'APPROVED' ? '已批准' : '已拒绝' }} - {{ step.time || 'N/A' }}
              </div>
              <div v-if="step.comment" style="margin-top: 4px; font-size: 12px; color: #666">
                意见: {{ step.comment }}
              </div>
            </a-timeline-item>
          </a-timeline>
        </div>

        <!-- 奖助详情 -->
        <a-descriptions v-if="currentType === 'award' && awardDetail" :column="2" bordered>
          <a-descriptions-item label="申请类型">
            <a-tag v-if="awardDetail?.applicationType === 'SCHOLARSHIP'" color="gold">奖学金</a-tag>
            <a-tag v-else-if="awardDetail?.applicationType === 'GRANT'" color="green">助学金</a-tag>
            <a-tag v-else-if="awardDetail?.applicationType === 'SUBSIDY'" color="blue"
              >困难补助</a-tag
            >
            <span v-else>{{ awardDetail?.applicationType }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="审批状态">
            <a-tag v-if="awardDetail?.approvalStatus === 'PENDING'" color="processing"
              >待审批</a-tag
            >
            <a-tag v-else-if="awardDetail?.approvalStatus === 'APPROVED'" color="success"
              >已批准</a-tag
            >
            <a-tag v-else-if="awardDetail?.approvalStatus === 'REJECTED'" color="error"
              >已拒绝</a-tag
            >
            <span v-else>{{ awardDetail?.approvalStatus }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="申请名称" :span="2">
            {{ awardDetail?.awardName }}
          </a-descriptions-item>
          <a-descriptions-item v-if="awardDetail?.amount" label="申请金额">
            ¥{{ awardDetail?.amount }}
          </a-descriptions-item>
          <a-descriptions-item label="申请人ID">
            {{ awardDetail?.userId }}
          </a-descriptions-item>
          <a-descriptions-item label="申请原因" :span="2">
            {{ awardDetail?.reason || '无' }}
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">
            {{ awardDetail?.createTime }}
          </a-descriptions-item>
        </a-descriptions>

        <!-- 销假详情 -->
        <a-descriptions
          v-if="currentType === 'leave' && leaveDetail?.cancelRequested"
          :column="2"
          bordered
        >
          <a-descriptions-item label="销假状态" :span="2">
            <a-tag v-if="leaveDetail?.cancelApprovalStatus === 'PENDING'" color="processing"
              >待审批</a-tag
            >
            <a-tag v-else-if="leaveDetail?.cancelApprovalStatus === 'APPROVED'" color="success"
              >已批准</a-tag
            >
            <a-tag v-else-if="leaveDetail?.cancelApprovalStatus === 'REJECTED'" color="error"
              >已拒绝</a-tag
            >
            <span v-else>{{ leaveDetail?.cancelApprovalStatus }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="销假审批意见" :span="2">
            {{ leaveDetail?.cancelApprovalComment || '无' }}
          </a-descriptions-item>
          <a-descriptions-item v-if="leaveDetail?.cancelTime" label="销假时间">
            {{ leaveDetail?.cancelTime }}
          </a-descriptions-item>
        </a-descriptions>
      </a-spin>
      <div class="modal-footer">
        <a-button @click="handleCloseDetail">关闭</a-button>
        <a-button v-if="canApprove()" type="primary" @click="handleOpenApproveModal">
          审批
        </a-button>
      </div>
    </a-modal>

    <!-- 回复模态框 -->
    <a-modal v-model:open="replyVisible" title="回复问题" width="800px" :footer="null">
      <a-form :model="replyForm" layout="vertical">
        <a-form-item label="问题内容">
          <a-textarea v-model:value="replyForm.questionText" disabled rows="4" />
        </a-form-item>
        <!-- 历史对话上下文 -->
        <div v-if="transferHistory.length > 0" style="margin-bottom: 16px">
          <p style="font-weight: 600; margin-bottom: 8px">咨询历史对话：</p>
          <div
            v-for="(item, idx) in transferHistory"
            :key="idx"
            style="
              margin-bottom: 10px;
              border: 1px solid #f0f0f0;
              border-radius: 6px;
              padding: 10px;
              background: #fafafa;
            "
          >
            <a-tag color="blue" style="margin-bottom: 6px">第 {{ idx + 1 }} 轮</a-tag>
            <div style="margin-bottom: 4px">
              <span style="font-weight: 600; color: #1890ff">用户：</span>{{ item.questionText }}
            </div>
            <div v-if="item.aiAnswer">
              <span style="font-weight: 600; color: #52c41a">AI：</span
              ><span style="color: #555">{{ item.aiAnswer }}</span>
            </div>
          </div>
        </div>
        <a-form-item label="回复内容">
          <a-textarea v-model:value="replyForm.reply" placeholder="请输入回复内容" rows="6" />
        </a-form-item>
      </a-form>
      <div class="modal-footer">
        <a-button @click="replyVisible = false">取消</a-button>
        <a-button type="primary" @click="submitReply">确定</a-button>
      </div>
    </a-modal>

    <!-- 审批弹窗 -->
    <a-modal v-model:open="approveVisible" title="审批处理" width="700px" :footer="null">
      <a-spin :spinning="approveModalLoading">
        <!-- 请假申请详情 -->
        <template v-if="currentType === 'leave' && approveLeaveDetail">
          <a-divider orientation="left">请假申请信息</a-divider>
          <a-descriptions :column="2" bordered size="small" style="margin-bottom: 16px">
            <a-descriptions-item label="请假类型">
              <a-tag v-if="approveLeaveDetail?.leaveType === 'PERSONAL'" color="orange">事假</a-tag>
              <a-tag v-else-if="approveLeaveDetail?.leaveType === 'OFFICIAL'" color="blue"
                >公假</a-tag
              >
              <span v-else>{{ approveLeaveDetail?.leaveType }}</span>
            </a-descriptions-item>
            <a-descriptions-item label="请假天数"
              >{{ approveLeaveDetail?.days }} 天</a-descriptions-item
            >
            <a-descriptions-item label="开始日期">{{
              approveLeaveDetail?.startDate
            }}</a-descriptions-item>
            <a-descriptions-item label="结束日期">{{
              approveLeaveDetail?.endDate
            }}</a-descriptions-item>
            <a-descriptions-item label="申请人ID">{{
              approveLeaveDetail?.applicantId
            }}</a-descriptions-item>
            <a-descriptions-item label="创建时间">{{
              approveLeaveDetail?.createTime
            }}</a-descriptions-item>
            <a-descriptions-item label="请假原因" :span="2">{{
              approveLeaveDetail?.reason || '无'
            }}</a-descriptions-item>
            <a-descriptions-item v-if="approveLeaveDetail?.attachmentUrl" label="附件" :span="2">
              <template
                v-for="(url, idx) in (approveLeaveDetail?.attachmentUrl || '')
                  .split(',')
                  .filter(Boolean)"
                :key="idx"
              >
                <a :href="url" target="_blank" rel="noopener" download>
                  <PaperClipOutlined /> {{ idx + 1 }}. {{ url.split('/').pop() || '下载附件' }}
                </a>
                <br
                  v-if="
                    idx <
                    (approveLeaveDetail?.attachmentUrl || '').split(',').filter(Boolean).length - 1
                  "
                />
              </template>
            </a-descriptions-item>
          </a-descriptions>
        </template>

        <!-- 奖助申请详情 -->
        <template v-if="currentType === 'award' && approveAwardDetail">
          <a-divider orientation="left">奖助申请信息</a-divider>
          <a-descriptions :column="2" bordered size="small" style="margin-bottom: 16px">
            <a-descriptions-item label="申请类型">
              <a-tag v-if="approveAwardDetail?.applicationType === 'SCHOLARSHIP'" color="gold"
                >奖学金</a-tag
              >
              <a-tag v-else-if="approveAwardDetail?.applicationType === 'GRANT'" color="green"
                >助学金</a-tag
              >
              <a-tag v-else-if="approveAwardDetail?.applicationType === 'SUBSIDY'" color="blue"
                >困难补助</a-tag
              >
              <span v-else>{{ approveAwardDetail?.applicationType }}</span>
            </a-descriptions-item>
            <a-descriptions-item v-if="approveAwardDetail?.amount" label="申请金额"
              >¥{{ approveAwardDetail?.amount }}</a-descriptions-item
            >
            <a-descriptions-item label="申请名称" :span="2">{{
              approveAwardDetail?.awardName
            }}</a-descriptions-item>
            <a-descriptions-item label="申请人ID">{{
              approveAwardDetail?.userId
            }}</a-descriptions-item>
            <a-descriptions-item label="创建时间">{{
              approveAwardDetail?.createTime
            }}</a-descriptions-item>
            <a-descriptions-item label="申请原因" :span="2">{{
              approveAwardDetail?.reason || '无'
            }}</a-descriptions-item>
            <a-descriptions-item v-if="approveAwardDetail?.attachmentUrls" label="附件" :span="2">
              <template v-for="(url, idx) in approveAwardDetail?.attachmentUrls || []" :key="idx">
                <a :href="url" target="_blank" rel="noopener" download>
                  <PaperClipOutlined /> {{ idx + 1 }}. {{ url.split('/').pop() || '下载附件' }}
                </a>
                <br
                  v-if="idx < (approveAwardDetail?.attachmentUrls || []).filter(Boolean).length - 1"
                />
              </template>
            </a-descriptions-item>
          </a-descriptions>
        </template>

        <a-divider orientation="left">审批操作</a-divider>
        <a-form :model="approveForm" layout="vertical">
          <a-form-item label="审批结果">
            <a-radio-group v-model:value="approveForm.approvalStatus">
              <a-radio value="APPROVED">批准</a-radio>
              <a-radio value="REJECTED">拒绝</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="审批意见">
            <a-textarea
              v-model:value="approveForm.approvalComment"
              placeholder="请输入审批意见（选填）"
              rows="4"
            />
          </a-form-item>
        </a-form>
      </a-spin>
      <div class="modal-footer">
        <a-button @click="approveVisible = false">取消</a-button>
        <a-button
          type="primary"
          :loading="approving"
          :disabled="approveModalLoading"
          @click="submitApproval"
        >
          确定
        </a-button>
      </div>
    </a-modal>

    <!-- 转人工记录详情模态框 -->
    <a-modal
      v-model:open="transferDetailVisible"
      title="转人工记录详情"
      width="800px"
      :footer="null"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="问题ID" :span="2">
          {{ currentTransfer?.questionId }}
        </a-descriptions-item>
        <a-descriptions-item label="转接类型">
          {{ currentTransfer?.transferType === 'MANUAL' ? '手动申请' : '自动转接' }}
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag v-if="currentTransfer?.status === 'PENDING'">待处理</a-tag>
          <a-tag v-else-if="currentTransfer?.status === 'PROCESSING'" color="processing"
            >处理中</a-tag
          >
          <a-tag v-else-if="currentTransfer?.status === 'COMPLETED'" color="success">已完成</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="转接原因" :span="2">
          {{ formatTransferReason(currentTransfer?.transferReason) }}
        </a-descriptions-item>
        <a-descriptions-item v-if="currentTransfer?.staffId" label="处理人员ID">
          {{ currentTransfer?.staffId }}
        </a-descriptions-item>
        <a-descriptions-item v-if="currentTransfer?.staffReply" label="处理回复" :span="2">
          {{ currentTransfer?.staffReply }}
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">
          {{ currentTransfer?.createTime }}
        </a-descriptions-item>
        <a-descriptions-item v-if="currentTransfer?.processTime" label="处理时间">
          {{ currentTransfer?.processTime }}
        </a-descriptions-item>
      </a-descriptions>

      <!-- 历史对话上下文 -->
      <div v-if="transferHistory.length > 0" style="margin-top: 20px">
        <a-divider orientation="left">咨询历史对话</a-divider>
        <div
          v-for="(item, idx) in transferHistory"
          :key="idx"
          style="
            margin-bottom: 16px;
            border: 1px solid #f0f0f0;
            border-radius: 6px;
            padding: 12px;
            background: #fafafa;
          "
        >
          <div style="margin-bottom: 8px">
            <a-tag color="blue" style="margin-right: 6px">第 {{ idx + 1 }} 轮</a-tag>
          </div>
          <div style="margin-bottom: 6px">
            <span style="font-weight: 600; color: #1890ff">用户：</span>
            <span style="white-space: pre-wrap">{{ item.questionText }}</span>
          </div>
          <div v-if="item.aiAnswer">
            <span style="font-weight: 600; color: #52c41a">AI：</span>
            <span style="white-space: pre-wrap; color: #555">{{ item.aiAnswer }}</span>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import { PaperClipOutlined } from '@ant-design/icons-vue'
import { processApi, leaveApi, awardApi, consultationApi, approvalApi } from '@/api'
import type { HumanTransfer } from '@/api/consultation'
import type { ProcessItem } from '@/api/process'
import { useUserStore } from '@/stores/user'
import type {
  LeaveApplication,
  AwardApplication,
  PageRequest,
  PageResult,
  TablePagination,
} from '@/types'

interface TransferHistoryItem {
  questionText: string
  aiAnswer?: string
  time?: string
}

interface ApprovalStepDisplay {
  name: string
  status: string
  approver: string
  time: string
  comment?: string
}

interface ApprovalProcessDisplay {
  status: string
  steps: ApprovalStepDisplay[]
}

const userStore = useUserStore()
const activeTab = ref('process')
const showHumanCenter = ref(false)
const humanActiveTab = ref('pending')
const processActiveTab = ref('pending')

// 流程代办相关
const pendingProcesses = ref<ProcessItem[]>([])
const completedProcesses = ref<ProcessItem[]>([])
const detailVisible = ref(false)
const approveVisible = ref(false)
const currentType = ref<'leave' | 'award' | ''>('')
const leaveDetail = ref<LeaveApplication | null>(null)
const awardDetail = ref<AwardApplication | null>(null)
const loadingDetail = ref(false)
const currentProcessId = ref<number>(0)
const approvalProcess = ref<ApprovalProcessDisplay | null>(null)

// 待办流程分页和筛选
const pendingPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})
const pendingFilter = ref<'all' | 'leave' | 'award' | 'leave_cancel'>('all')
const pendingLoading = ref(false)

// 已办理流程分页和筛选
const completedPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})
const completedFilter = ref<'all' | 'leave' | 'award' | 'leave_cancel'>('all')
const completedLoading = ref(false)

// 当前待审批任务ID
const currentTaskId = ref<number | null>(null)
const approving = ref(false)
const approvingCancelRequest = ref(false)
const approveModalLoading = ref(false)
const approveLeaveDetail = ref<LeaveApplication | null>(null)
const approveAwardDetail = ref<AwardApplication | null>(null)
const approveForm = reactive({
  approvalStatus: 'APPROVED',
  approvalComment: '',
})

// 人工处理中心相关
const humanProcessLoading = ref(false)
const humanProcessData = ref<HumanTransfer[]>([])
const humanProcessPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})
const replyVisible = ref(false)
const currentTransfer = ref<HumanTransfer | null>(null)
const currentTransferId = ref<number>(0)
const replyForm = reactive({
  questionText: '',
  transferReason: '',
  reply: '',
})

// 已完成记录相关
const completedProcessLoading = ref(false)
const completedProcessData = ref<HumanTransfer[]>([])
const completedProcessPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const humanProcessColumns = [
  {
    title: '问题ID',
    dataIndex: 'questionId',
    key: 'questionId',
  },
  {
    title: '转接类型',
    dataIndex: 'transferType',
    key: 'transferType',
    width: 120,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: '转接原因',
    dataIndex: 'transferReason',
    key: 'transferReason',
    ellipsis: true,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180,
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
  },
]

const completedProcessColumns = [
  {
    title: '问题ID',
    dataIndex: 'questionId',
    key: 'questionId',
  },
  {
    title: '转接类型',
    dataIndex: 'transferType',
    key: 'transferType',
    width: 120,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: '转接原因',
    dataIndex: 'transferReason',
    key: 'transferReason',
    ellipsis: true,
  },
  {
    title: '回复内容',
    dataIndex: 'staffReply',
    key: 'staffReply',
    ellipsis: true,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180,
  },
  {
    title: '处理时间',
    dataIndex: 'processTime',
    key: 'processTime',
    width: 180,
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
  },
]

// 转人工记录相关
const transferLoading = ref(false)
const transferData = ref<HumanTransfer[]>([])
const transferDetailVisible = ref(false)
const transferHistory = ref<TransferHistoryItem[]>([])
const transferPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const transferColumns = [
  {
    title: '问题ID',
    dataIndex: 'questionId',
    key: 'questionId',
  },
  {
    title: '转接类型',
    dataIndex: 'transferType',
    key: 'transferType',
    width: 120,
    customRender: ({ text }: { text: string }) => (text === 'MANUAL' ? '手动申请' : '自动转接'),
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180,
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
  },
]

const getCategoryName = (category?: string) => {
  const map: Record<string, string> = {
    scholarship: '奖助勤贷',
    dormitory: '宿舍管理',
    discipline: '违纪申诉',
    mental: '心理健康',
    employment: '就业指导',
    AWARD: '奖助勤贷',
    DORM: '宿舍管理',
    DISCIPLINE: '违纪申诉',
    MENTAL: '心理健康',
    EMPLOYMENT: '就业指导',
  }
  return map[category || ''] || '未分类'
}

const formatTransferReason = (reason?: string) => {
  if (!reason) return ''
  return reason.replace(/问题类型: (\w+)/g, (_match, category) => {
    return `问题类型: ${getCategoryName(category)}`
  })
}

// 加载流程数据
const loadProcesses = async () => {
  pendingLoading.value = true
  completedLoading.value = true
  try {
    const pendingParams = {
      pageNum: pendingPagination.current,
      pageSize: pendingPagination.pageSize,
    }
    let pendingResponse: PageResult<ProcessItem>
    switch (pendingFilter.value) {
      case 'award':
        pendingResponse = await processApi.getPendingAward(pendingParams)
        break
      case 'leave':
        pendingResponse = await processApi.getPendingLeave(pendingParams)
        break
      case 'leave_cancel':
        pendingResponse = await processApi.getPendingLeaveCancel(pendingParams)
        break
      default:
        pendingResponse = await processApi.getPendingAll(pendingParams)
    }
    pendingProcesses.value = pendingResponse.records || []
    pendingPagination.total = pendingResponse.total || 0

    const completedParams = {
      pageNum: completedPagination.current,
      pageSize: completedPagination.pageSize,
    }
    let completedResponse: PageResult<ProcessItem>
    switch (completedFilter.value) {
      case 'award':
        completedResponse = await processApi.getCompletedAward(completedParams)
        break
      case 'leave':
        completedResponse = await processApi.getCompletedLeave(completedParams)
        break
      case 'leave_cancel':
        completedResponse = await processApi.getCompletedLeaveCancel(completedParams)
        break
      default:
        completedResponse = await processApi.getCompletedAll(completedParams)
    }
    completedProcesses.value = completedResponse.records || []
    completedPagination.total = completedResponse.total || 0
  } catch (error) {
    message.error('获取流程数据失败')
    console.error('获取流程数据失败:', error)
  } finally {
    pendingLoading.value = false
    completedLoading.value = false
  }
}

// 加载人工处理中心数据
const loadHumanProcessData = async () => {
  humanProcessLoading.value = true
  try {
    const params: PageRequest = {
      pageNum: humanProcessPagination.current,
      pageSize: humanProcessPagination.pageSize,
    }
    const response = await consultationApi.getStaffTransfers(params)
    humanProcessData.value = response.records
    humanProcessPagination.total = response.total
  } catch (error) {
    console.error('加载人工处理数据失败', error)
    message.error('加载数据失败: ' + (error instanceof Error ? error.message : '未知错误'))
  } finally {
    humanProcessLoading.value = false
  }
}

// 加载已完成记录数据
const loadCompletedProcessData = async () => {
  completedProcessLoading.value = true
  try {
    const params: PageRequest = {
      pageNum: completedProcessPagination.current,
      pageSize: completedProcessPagination.pageSize,
    }
    const response = await consultationApi.getCompletedTransfers(params)
    completedProcessData.value = response.records
    completedProcessPagination.total = response.total
  } catch (error) {
    console.error('加载已完成记录失败', error)
    message.error('加载数据失败: ' + (error instanceof Error ? error.message : '未知错误'))
  } finally {
    completedProcessLoading.value = false
  }
}

// 加载转人工记录数据
const loadTransferData = async () => {
  transferLoading.value = true
  try {
    const params: PageRequest = {
      pageNum: transferPagination.current,
      pageSize: transferPagination.pageSize,
    }
    const response = await consultationApi.getUserTransfers(params)
    transferData.value = response.records
    transferPagination.total = response.total
  } catch (error) {
    console.error('加载转人工记录失败', error)
    message.error('加载数据失败: ' + (error instanceof Error ? error.message : '未知错误'))
  } finally {
    transferLoading.value = false
  }
}

const handleGoApprove = async (item: ProcessItem) => {
  currentType.value = item.type === 'leave_cancel' ? 'leave' : (item.type as 'leave' | 'award')
  currentProcessId.value = Number(item.id)
  currentTaskId.value = null
  approveLeaveDetail.value = null
  approveAwardDetail.value = null
  approveForm.approvalStatus = 'APPROVED'
  approveForm.approvalComment = ''

  // 先打开弹窗，再加载数据
  approveVisible.value = true
  approveModalLoading.value = true

  try {
    // 如果是销假申请，不需要查找审批任务
    if (item.type === 'leave_cancel') {
      approvingCancelRequest.value = true
      const detailPromise = leaveApi.getApplication(Number(item.id)).then((data) => {
        approveLeaveDetail.value = data
      })
      await detailPromise
    } else {
      // 普通请假或奖助申请，需要查找审批任务
      approvingCancelRequest.value = false
      const detailPromise =
        item.type === 'leave'
          ? leaveApi.getApplication(Number(item.id)).then((data) => {
              approveLeaveDetail.value = data
            })
          : awardApi.getApplication(Number(item.id)).then((data) => {
              approveAwardDetail.value = data
            })

      const taskPromise = approvalApi.getPendingTasks().then((pendingTasks) => {
        const tasks = Array.isArray(pendingTasks) ? pendingTasks : []
        const matchedTask = tasks.find((t) => String(t.businessId) === String(item.id))
        if (matchedTask) {
          currentTaskId.value = matchedTask.id
        } else {
          throw new Error('未找到对应的审批任务，您可能已处理或无权限审批')
        }
      })

      await Promise.all([detailPromise, taskPromise])
    }
  } catch (e) {
    message.error(e instanceof Error ? e.message : '加载审批信息失败')
    approveVisible.value = false
  } finally {
    approveModalLoading.value = false
  }
}

const handleViewProcess = async (item: ProcessItem) => {
  currentType.value = item.type === 'leave_cancel' ? 'leave' : (item.type as 'leave' | 'award')
  currentProcessId.value = Number(item.id)
  currentTaskId.value = null // 重置：打开详情时先清空，防止上次残留值导致误判
  loadingDetail.value = true
  detailVisible.value = true
  approvalProcess.value = null

  try {
    if (item.type === 'leave') {
      leaveDetail.value = await leaveApi.getApplication(Number(item.id))
    } else if (item.type === 'award') {
      awardDetail.value = await awardApi.getApplication(Number(item.id))
    } else if (item.type === 'leave_cancel') {
      leaveDetail.value = await leaveApi.getApplication(Number(item.id))
    }

    // 加载审批流程状态（销假申请不需要加载审批流程）
    if (item.type !== 'leave_cancel') {
      const businessType = item.type === 'leave' ? 'LEAVE' : 'AWARD'
      const instance = await approvalApi.getApprovalInstance(businessType, Number(item.id))
      if (instance.steps) {
        approvalProcess.value = {
          status: instance.status,
          steps: instance.steps.map((step) => ({
            name: step.stepName,
            status: step.status,
            approver: step.approverName,
            time: step.approvalTime,
            comment: step.comment,
          })),
        }
      }
    }

    // 查找当前用户对应的待处理审批任务ID
    try {
      const pendingTasks = await approvalApi.getPendingTasks()
      const tasks = Array.isArray(pendingTasks) ? pendingTasks : []
      const matchedTask = tasks.find((t) => String(t.businessId) === String(item.id))
      if (matchedTask) {
        currentTaskId.value = matchedTask.id
      }
    } catch (e) {
      // 找不到任务ID时不阻断展示
    }
  } catch (error) {
    message.error('获取详情失败')
    console.error('获取详情失败:', error)
  } finally {
    loadingDetail.value = false
  }
}

const canApprove = () => {
  const role = userStore.roleName
  const isApprover =
    role === 'COUNSELOR' ||
    role === 'COLLEGE_LEADER' ||
    role === 'DEPARTMENT_LEADER' ||
    role === 'ADMIN'
  if (!isApprover) {
    return false
  }
  // 必须存在当前用户对应的待处理审批任务才允许显示审批按钮
  // 避免已完成审批的节点在查看历史详情时错误显示审批按钮
  return currentTaskId.value !== null
}

const handleOpenApproveModal = () => {
  approveVisible.value = true
  approveForm.approvalStatus = 'APPROVED'
  approveForm.approvalComment = ''
}

const submitApproval = async () => {
  if (!currentProcessId.value) {
    message.error('缺少申请ID')
    return
  }

  approving.value = true
  try {
    // 如果是销假审批
    if (approvingCancelRequest.value) {
      await leaveApi.approveCancelRequest(
        currentProcessId.value,
        approveForm.approvalStatus,
        approveForm.approvalComment
      )
      message.success('销假审批成功')
      approveVisible.value = false
      approveLeaveDetail.value = null
      detailVisible.value = false
      loadProcesses()
      approvingCancelRequest.value = false
    } else {
      // 普通请假审批
      if (!currentTaskId.value) {
        message.error('未找到对应的审批任务，请确认您有权限审批此申请')
        return
      }
      await approvalApi.processTask(currentTaskId.value, {
        status: approveForm.approvalStatus,
        comment: approveForm.approvalComment,
      })
      message.success('审批成功')
      approveVisible.value = false
      approveLeaveDetail.value = null
      approveAwardDetail.value = null
      detailVisible.value = false
      loadProcesses()
    }
  } catch (error) {
    console.error('审批失败', error)
    message.error('审批失败: ' + (error instanceof Error ? error.message : '未知错误'))
  } finally {
    approving.value = false
  }
}

const handleCloseDetail = () => {
  detailVisible.value = false
  leaveDetail.value = null
  awardDetail.value = null
  approvalProcess.value = null
  currentType.value = ''
  currentTaskId.value = null // 关闭时重置，防止残留
}

// 人工处理中心操作
const handleHumanProcessTableChange = (pag: TablePagination) => {
  humanProcessPagination.current = pag.current ?? 1
  humanProcessPagination.pageSize = pag.pageSize ?? 10
  loadHumanProcessData()
}

const handleCompletedProcessTableChange = (pag: TablePagination) => {
  completedProcessPagination.current = pag.current ?? 1
  completedProcessPagination.pageSize = pag.pageSize ?? 10
  loadCompletedProcessData()
}

const handleProcess = async (record: HumanTransfer) => {
  currentTransferId.value = record.id
  replyForm.questionText =
    record.transferReason?.split('\n问题描述: ')[1]?.split('\n\n===历史对话===')[0] || ''
  replyForm.transferReason = record.transferReason || ''
  replyForm.reply = ''
  // 加载历史对话
  try {
    const response = await consultationApi.getTransferDetail(record.id)
    transferHistory.value = response.history.map((h) => ({
      questionText: h.questionText || '',
      aiAnswer: h.answer,
      time: h.createTime,
    }))
  } catch {
    transferHistory.value = []
  }
  replyVisible.value = true
}

const handleReply = async (record: HumanTransfer) => {
  currentTransferId.value = record.id
  replyForm.questionText =
    record.transferReason?.split('\n问题描述: ')[1]?.split('\n\n===历史对话===')[0] || ''
  replyForm.transferReason = record.transferReason || ''
  replyForm.reply = ''
  // 加载历史对话
  try {
    const response = await consultationApi.getTransferDetail(record.id)
    transferHistory.value = response.history.map((h) => ({
      questionText: h.questionText || '',
      aiAnswer: h.answer,
      time: h.createTime,
    }))
  } catch {
    transferHistory.value = []
  }
  replyVisible.value = true
}

const submitReply = async () => {
  if (!replyForm.reply.trim()) {
    message.warning('请输入回复内容')
    return
  }

  try {
    // 如果是PENDING状态，先分配给当前用户，然后直接完成处理
    const record = humanProcessData.value.find((item) => item.id === currentTransferId.value)
    if (record && record.status === 'PENDING') {
      await consultationApi.processTransfer(currentTransferId.value, replyForm.reply)
    } else {
      await consultationApi.replyToTransfer(currentTransferId.value, replyForm.reply)
    }
    message.success('回复成功')
    replyVisible.value = false
    loadHumanProcessData() // 重新加载待完成数据
    if (humanActiveTab.value === 'completed') {
      loadCompletedProcessData() // 如果当前在已完成标签页，也重新加载
    }
  } catch (error) {
    console.error('回复失败', error)
    message.error('回复失败: ' + (error instanceof Error ? error.message : '未知错误'))
  }
}

const handleViewTransfer = async (record: HumanTransfer) => {
  try {
    const response = await consultationApi.getTransferDetail(record.id)
    currentTransfer.value = response.transfer
    transferHistory.value = response.history.map((h) => ({
      questionText: h.questionText || '',
      aiAnswer: h.answer,
      time: h.createTime,
    }))
    transferDetailVisible.value = true
  } catch (error) {
    console.error('获取转人工记录详情失败', error)
    message.error('获取详情失败: ' + (error instanceof Error ? error.message : '未知错误'))
  }
}

// 转人工记录操作
const handleTransferTableChange = (pag: TablePagination) => {
  transferPagination.current = pag.current ?? 1
  transferPagination.pageSize = pag.pageSize ?? 10
  loadTransferData()
}

const handleViewTransferDetail = async (record: HumanTransfer) => {
  try {
    const response = await consultationApi.getTransferDetail(record.id)
    currentTransfer.value = response.transfer
    transferHistory.value = response.history.map((h) => ({
      questionText: h.questionText || '',
      aiAnswer: h.answer,
      time: h.createTime,
    }))
    transferDetailVisible.value = true
  } catch (error) {
    console.error('获取转人工记录详情失败', error)
    message.error('获取详情失败: ' + (error instanceof Error ? error.message : '未知错误'))
  }
}

// 转人工记录操作
onMounted(async () => {
  loadProcesses()
  if (humanActiveTab.value === 'pending') {
    loadHumanProcessData()
  } else {
    loadCompletedProcessData()
  }
  loadTransferData()

  try {
    const hasPermission = await consultationApi.checkTransferConfigPermission()
    showHumanCenter.value = hasPermission
  } catch (error) {
    console.error('检查人工处理中心权限失败:', error)
    showHumanCenter.value = false
  }
})

// 监听人工处理中心标签页变化
watch(humanActiveTab, (newTab) => {
  if (newTab === 'pending') {
    loadHumanProcessData()
  } else if (newTab === 'completed') {
    loadCompletedProcessData()
  }
})

// 处理流程代办标签页变化
const handleProcessTabChange = () => {
  loadProcesses()
}

const handlePendingPageChange = () => {
  loadProcesses()
}

const handlePendingFilterChange = () => {
  pendingPagination.current = 1
  loadProcesses()
}

const handleCompletedPageChange = () => {
  loadProcesses()
}

const handleCompletedFilterChange = () => {
  completedPagination.current = 1
  loadProcesses()
}
</script>

<style scoped>
.process-service-container {
  padding: 20px;
  min-height: 80vh;
}

.process-card {
  margin-top: 20px;
}

.process-tabs {
  margin-bottom: 20px;
}

.sub-tabs {
  margin-top: 16px;
}

.process-toolbar {
  margin-bottom: 12px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 12px;
  padding: 10px 0;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}

.process-list {
  max-height: calc(100vh - 280px);
  overflow-y: auto;
}

.process-item {
  border-bottom: 1px solid #f0f0f0;
  padding: 10px 0;
}

.process-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.process-info {
  margin-top: 6px;
  color: #666;
}

.process-time {
  margin-top: 2px;
  font-size: 12px;
  color: #999;
}

.process-status {
  margin-left: 8px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>
