<template>
  <div class="consultation-page">
    <!-- 主要内容区 -->
    <main class="main-content">
      <!-- 初始状态 - 欢迎界面 -->
      <div v-if="state === 'welcome'" class="welcome-section">
        <div class="ai-avatar">
          <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=friendly%20female%20AI%20assistant%20avatar%2C%20professional%2C%20cartoon%20style%2C%20pink%20clothing%2C%20glasses&image_size=square" alt="学工AI智能体助手" class="avatar-image" />
        </div>
        <h1 class="main-title">学工AI智能体助手</h1>
        
        <!-- 快捷咨询 -->
        <div class="quick-consultation">
          <h3 class="quick-title">快捷咨询</h3>
          <div class="quick-buttons">
            <button class="quick-button" @click="handleQuickQuestion('奖学金怎么申请？')">奖学金怎么申请？</button>
            <button class="quick-button" @click="handleQuickQuestion('宿舍调寝找那个部门？')">宿舍调寝找那个部门？</button>
            <button class="quick-button" @click="handleQuickQuestion('违纪申诉需要做什么？')">违纪申诉需要做什么？</button>
            <button class="quick-button" @click="handleQuickQuestion('心理健康问题怎么解决？')">心理健康问题怎么解决？</button>
          </div>
        </div>
      </div>

      <!-- 聊天状态 -->
      <div v-else-if="state === 'chat'" class="chat-section">
        <!-- 问题显示 -->
        <div class="question-display">
          <div class="question-item">
            <div class="question-content">{{ currentQuestion }}</div>
            <div class="question-avatar">
              <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20avatar%2C%20simple%20cartoon%20style&image_size=square" alt="用户" class="small-avatar" />
            </div>
          </div>
        </div>

        <!-- AI回答 -->
        <div class="ai-response">
          <div class="ai-message">
            <div class="ai-avatar-small">
              <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=friendly%20female%20AI%20assistant%20avatar%2C%20professional%2C%20cartoon%20style%2C%20pink%20clothing%2C%20glasses&image_size=square" alt="学工AI智能体助手" class="small-avatar" />
            </div>
            <div class="ai-content" v-html="renderMarkdown(aiAnswer)"></div>
          </div>
        </div>
      </div>

      <!-- 转人工确认 -->
      <div v-else-if="state === 'transfer'" class="transfer-section">
        <!-- 问题显示 -->
        <div class="question-display">
          <div class="question-item">
            <div class="question-content">{{ currentQuestion }}</div>
            <div class="question-avatar">
              <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20avatar%2C%20simple%20cartoon%20style&image_size=square" alt="用户" class="small-avatar" />
            </div>
          </div>
        </div>

        <!-- 转人工确认 -->
        <div class="transfer-message">
          <div class="ai-avatar-small">
            <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=friendly%20female%20AI%20assistant%20avatar%2C%20professional%2C%20cartoon%20style%2C%20pink%20clothing%2C%20glasses&image_size=square" alt="学工AI智能体助手" class="small-avatar" />
          </div>
          <div class="transfer-text">未找到您要了解的问题答案，可申请转人工为您解答，请问需要吗？</div>
          <div class="transfer-buttons">
            <button class="no-button" @click="cancelTransfer">不需要</button>
            <button class="yes-button" @click="confirmTransfer">需要</button>
          </div>
        </div>
      </div>

      <!-- 申请人工帮助 -->
      <div v-else-if="state === 'manual'" class="manual-section">
        <h2 class="section-title">申请人工帮助</h2>
        <form class="manual-form">
          <div class="form-group">
            <label class="form-label">问题类型</label>
            <select class="form-select" v-model="manualForm.questionType">
              <option value="">请选择问题类型</option>
              <option value="scholarship">奖助勤贷</option>
              <option value="dormitory">宿舍管理</option>
              <option value="discipline">违纪申诉</option>
              <option value="mental">心理健康</option>
              <option value="employment">就业指导</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">问题说明</label>
            <textarea class="form-textarea" v-model="manualForm.questionDescription" placeholder="请详细描述您的问题..."></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">文件上传</label>
            <div class="file-upload">
              <input type="file" class="file-input" @change="handleFileUpload" />
              <span class="file-icon">📎</span>
              <span v-if="selectedFile" class="file-name">{{ selectedFile.name }}</span>
              <span v-else class="file-placeholder">点击上传文件</span>
            </div>
            <p class="file-hint">支持上传 word、excel、pdf、jpg、png 等通用格式</p>
          </div>
          <div class="form-buttons">
            <button type="button" class="cancel-button" @click="cancelManual">取消</button>
            <button type="button" class="submit-button" @click="submitManual">提交</button>
          </div>
        </form>
      </div>

      <!-- 输入区域 (除了申请人工帮助页面外都显示) -->
      <div v-if="state !== 'manual'" class="input-section">
        <div class="input-container">
          <input type="text" v-model="questionText" class="question-input" placeholder="请输入您的问题..." @keyup.enter="handleSubmit" />
          <button class="input-button" @click="handleSubmit">
            <span class="button-icon">📎</span>
          </button>
          <button class="input-button" @click="toggleVoice">
            <span class="button-icon">🎤</span>
          </button>
          <button class="send-button" @click="handleSubmit">
            <span class="send-icon">➤</span>
          </button>
        </div>
        <div class="input-hint">
          <a href="#" @click.prevent="showManualForm">申请人工帮助</a>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { marked } from 'marked'

// 状态管理
const state = ref('welcome') // welcome, chat, transfer, manual
const questionText = ref('')
const currentQuestion = ref('')
const aiAnswer = ref('')

// 人工帮助表单
const manualForm = reactive({
  questionType: '',
  questionDescription: ''
})
const selectedFile = ref<File | null>(null)

// 快捷问题处理
const handleQuickQuestion = (question: string) => {
  questionText.value = question
  handleSubmit()
}

// 提交问题
const handleSubmit = async () => {
  if (!questionText.value.trim()) {
    message.warning('请输入问题')
    return
  }

  currentQuestion.value = questionText.value
  state.value = 'chat'

  // 模拟AI回答
  setTimeout(() => {
    aiAnswer.value = `# 奖学金申请全攻略（从入门到获批）

奖学金申请核心逻辑："明确类型→对照条件→准备材料→按时申请→参与评审→等待公示→发放到账"，全程遵循"公开、公平、公正、择优"原则。

## 一、奖学金类型速览（不同类型申请侧重点不同）

| 奖学金类型 | 适用对象 | 核心条件 | 奖励标准 | 申请关键 |
| --- | --- | --- | --- | --- |
| **国家奖学金** | 高校二年级及以上优秀学生 | 成绩综测前10%，突出成果 | 10000元/年 | 科研/竞赛/社会实践加分 |
| **国家励志奖学金** | 家庭经济困难且优秀学生 | 贫困认定+成绩前30% | 5000元/年 | 贫困证明必备 |
| **校级奖学金** | 全体在校生 | 按学校规定（成绩综测为主） | 几百-几千元不等 | 关注校内通知 |
| **企业奖学金** | 特定专业方向学生（企业定制标准） | 专业排名 | 因企业而异 | 了解企业要求 |
| **专项奖学金** | 特定条件学生（如科研/文体） | 专项领域突出表现 | 因项目而异 | 成果证明材料 |

## 二、通用申请条件（基础门槛）

1. **"身份要求"**：具有中华人民共和国国籍（国际奖学金除外）
2. **"政治表现"**：热爱祖国，拥护中国共产党领导，遵守宪法法律
3. **"品德要求"**：诚实守信，品行优良，无违纪记录
4. **"学业要求"**：学习成绩优秀，符合对应奖学金的绩点/排名要求`
  }, 1000)

  questionText.value = ''
}

// 渲染Markdown
const renderMarkdown = (text: string) => {
  return marked.parse(text)
}

// 转人工相关
const cancelTransfer = () => {
  state.value = 'chat'
}

const confirmTransfer = () => {
  state.value = 'manual'
}

const showManualForm = () => {
  state.value = 'manual'
}

// 人工帮助表单相关
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
  }
}

const cancelManual = () => {
  state.value = 'welcome'
  // 重置表单
  manualForm.questionType = ''
  manualForm.questionDescription = ''
  selectedFile.value = null
}

const submitManual = () => {
  if (!manualForm.questionType) {
    message.warning('请选择问题类型')
    return
  }
  if (!manualForm.questionDescription.trim()) {
    message.warning('请填写问题说明')
    return
  }

  message.success('申请提交成功，我们将尽快为您处理')
  cancelManual()
}

// 语音功能（暂时占位）
const toggleVoice = () => {
  message.info('语音功能开发中')
}
</script>

<style scoped>
/* 页面容器 */
.consultation-page {
  min-height: 100vh;
  background-color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 主要内容区 */
.main-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: calc(100vh - 60px);
}

/* 欢迎界面 */
.welcome-section {
  text-align: center;
  padding: 40px 0;
}

.ai-avatar {
  margin-bottom: 32px;
}

.avatar-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
}

.main-title {
  font-size: 28px;
  color: #2196f3;
  margin-bottom: 40px;
  font-weight: 600;
}

/* 快捷咨询 */
.quick-consultation {
  margin-top: 40px;
}

.quick-title {
  font-size: 16px;
  color: #333;
  margin-bottom: 16px;
  font-weight: 500;
}

.quick-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  max-width: 500px;
  margin: 0 auto;
}

.quick-button {
  padding: 12px 16px;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.quick-button:hover {
  background-color: #e3f2fd;
  border-color: #bbdefb;
}

/* 聊天界面 */
.chat-section {
  padding: 20px 0;
}

.question-display {
  margin-bottom: 32px;
  text-align: right;
}

.question-item {
  display: inline-flex;
  align-items: flex-start;
  gap: 12px;
  background-color: #f5f5f5;
  padding: 12px 16px;
  border-radius: 16px 16px 0 16px;
  max-width: 80%;
}

.question-content {
  font-size: 14px;
  line-height: 1.5;
  color: #333;
}

.question-avatar {
  margin-top: 2px;
}

.small-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.ai-response {
  margin-bottom: 40px;
}

.ai-message {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  max-width: 80%;
}

.ai-avatar-small {
  margin-top: 2px;
}

.ai-content {
  flex: 1;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

/* Markdown样式 */
.ai-content :deep(h1),
.ai-content :deep(h2),
.ai-content :deep(h3) {
  margin: 20px 0 12px 0;
  font-weight: 600;
  color: #333;
}

.ai-content :deep(h1) {
  font-size: 20px;
  border-bottom: 2px solid #2196f3;
  padding-bottom: 8px;
}

.ai-content :deep(h2) {
  font-size: 18px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 6px;
}

.ai-content :deep(h3) {
  font-size: 16px;
}

.ai-content :deep(p) {
  margin: 12px 0;
  line-height: 1.6;
}

.ai-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  font-size: 13px;
}

.ai-content :deep(th),
.ai-content :deep(td) {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  text-align: left;
}

.ai-content :deep(th) {
  background-color: #f5f5f5;
  font-weight: 600;
}

.ai-content :deep(ul),
.ai-content :deep(ol) {
  margin: 12px 0;
  padding-left: 24px;
}

.ai-content :deep(li) {
  margin: 6px 0;
  line-height: 1.5;
}

/* 转人工确认 */
.transfer-section {
  padding: 20px 0;
}

.transfer-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin: 40px 0;
  text-align: center;
}

.transfer-text {
  font-size: 16px;
  color: #333;
  max-width: 600px;
  line-height: 1.6;
}

.transfer-buttons {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.no-button {
  padding: 10px 24px;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
}

.no-button:hover {
  background-color: #e0e0e0;
}

.yes-button {
  padding: 10px 24px;
  background-color: #4caf50;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.yes-button:hover {
  background-color: #45a049;
}

/* 申请人工帮助 */
.manual-section {
  padding: 20px 0;
}

.section-title {
  font-size: 20px;
  color: #333;
  margin-bottom: 32px;
  font-weight: 600;
}

.manual-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background-color: white;
}

.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background-color: white;
  resize: vertical;
  min-height: 120px;
}

.file-upload {
  position: relative;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.file-upload:hover {
  border-color: #2196f3;
  background-color: #f8f9fa;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.file-icon {
  font-size: 24px;
  margin-bottom: 8px;
  display: block;
}

.file-name {
  font-size: 14px;
  color: #333;
  margin-top: 8px;
}

.file-placeholder {
  font-size: 14px;
  color: #999;
  margin-top: 8px;
}

.file-hint {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
  text-align: center;
}

.form-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
}

.cancel-button {
  padding: 10px 32px;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-button:hover {
  background-color: #e0e0e0;
}

.submit-button {
  padding: 10px 32px;
  background-color: #2196f3;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-button:hover {
  background-color: #1976d2;
}

/* 输入区域 */
.input-section {
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

.input-container {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 600px;
  margin: 0 auto;
}

.question-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  font-size: 14px;
  color: #333;
  background-color: white;
  outline: none;
  transition: all 0.3s ease;
}

.question-input:focus {
  border-color: #2196f3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
}

.input-button {
  width: 36px;
  height: 36px;
  border: 1px solid #e0e0e0;
  border-radius: 50%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.input-button:hover {
  border-color: #2196f3;
  background-color: #f8f9fa;
}

.button-icon {
  font-size: 16px;
  color: #666;
}

.send-button {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background-color: #2196f3;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.send-button:hover {
  background-color: #1976d2;
  transform: scale(1.05);
}

.send-icon {
  font-size: 16px;
  color: white;
  font-weight: bold;
}

.input-hint {
  text-align: center;
  margin-top: 12px;
  font-size: 12px;
}

.input-hint a {
  color: #2196f3;
  text-decoration: none;
  transition: color 0.3s ease;
}

.input-hint a:hover {
  color: #1976d2;
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar-container {
    padding: 12px 16px;
  }

  .nav-menu {
    gap: 16px;
  }

  .nav-item {
    font-size: 13px;
  }

  .main-content {
    padding: 20px 16px;
  }

  .quick-buttons {
    grid-template-columns: 1fr;
  }

  .question-item,
  .ai-message {
    max-width: 90%;
  }

  .input-container {
    max-width: 100%;
  }

  .transfer-buttons {
    flex-direction: column;
    align-items: center;
  }

  .no-button,
  .yes-button {
    width: 200px;
  }

  .form-buttons {
    flex-direction: column;
    align-items: center;
  }

  .cancel-button,
  .submit-button {
    width: 200px;
  }
}
</style>