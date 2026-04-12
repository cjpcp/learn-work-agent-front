<template>
  <div class="consultation-page">
    <!-- 主要内容区 -->
    <main class="main-content">
      <!-- 顶部操作栏 -->
      <div class="top-actions">
        <a-button type="primary" @click="navigateToHistory">咨询历史</a-button>
      </div>
      <!-- 初始状态 - 欢迎界面 -->
      <div v-if="state === 'welcome'" class="welcome-section">
        <div class="ai-avatar">
          <img
            src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=friendly%20female%20AI%20assistant%20avatar%2C%20professional%2C%20cartoon%20style%2C%20pink%20clothing%2C%20glasses&image_size=square"
            alt="学工AI智能体助手"
            class="avatar-image"
          />
        </div>
        <h1 class="main-title">学工AI智能体助手</h1>

        <!-- 快捷咨询 -->
        <div class="quick-consultation">
          <h3 class="quick-title">快捷咨询</h3>
          <div class="quick-buttons">
            <button class="quick-button" @click="handleQuickQuestion('奖学金怎么申请？')">
              奖学金怎么申请？
            </button>
            <button class="quick-button" @click="handleQuickQuestion('宿舍调寝找那个部门？')">
              宿舍调寝找那个部门？
            </button>
            <button class="quick-button" @click="handleQuickQuestion('违纪申诉需要做什么？')">
              违纪申诉需要做什么？
            </button>
            <button class="quick-button" @click="handleQuickQuestion('心理健康问题怎么解决？')">
              心理健康问题怎么解决？
            </button>
          </div>
        </div>
      </div>

      <!-- 聊天状态 -->
      <div v-else class="chat-section">
        <!-- 历史对话列表 -->
        <div
          v-for="(conversation, index) in conversationHistory"
          :key="index"
          class="conversation-item"
        >
          <!-- 问题显示 -->
          <div class="question-display">
            <div class="question-item">
              <div class="question-content">{{ conversation.question }}</div>
              <div class="question-avatar">
                <img
                  src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20avatar%2C%20simple%20cartoon%20style&image_size=square"
                  alt="用户"
                  class="small-avatar"
                />
              </div>
            </div>
          </div>

          <!-- AI回答 -->
          <div class="ai-response">
            <div class="ai-message">
              <div class="ai-avatar-small">
                <img
                  src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=friendly%20female%20AI%20assistant%20avatar%2C%20professional%2C%20cartoon%20style%2C%20pink%20clothing%2C%20glasses&image_size=square"
                  alt="学工AI智能体助手"
                  class="small-avatar"
                />
              </div>
              <div class="ai-content-plain">{{ conversation.answer }}</div>
            </div>
          </div>
        </div>

        <!-- 当前对话 -->
        <div v-if="currentQuestion" class="conversation-item current">
          <!-- 问题显示 -->
          <div class="question-display">
            <div class="question-item">
              <div class="question-content">{{ currentQuestion }}</div>
              <div class="question-avatar">
                <img
                  src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20avatar%2C%20simple%20cartoon%20style&image_size=square"
                  alt="用户"
                  class="small-avatar"
                />
              </div>
            </div>
          </div>

          <!-- AI回答 -->
          <div class="ai-response">
            <div class="ai-message">
              <div class="ai-avatar-small">
                <img
                  src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=friendly%20female%20AI%20assistant%20avatar%2C%20professional%2C%20cartoon%20style%2C%20pink%20clothing%2C%20glasses&image_size=square"
                  alt="学工AI智能体助手"
                  class="small-avatar"
                />
              </div>
              <div class="ai-content-plain">{{ aiAnswer }}</div>
            </div>
          </div>
        </div>

        <!-- 转人工确认 -->
        <div v-if="state === 'transfer'" class="transfer-section">
          <div class="transfer-message">
            <div class="ai-avatar-small">
              <img
                src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=friendly%20female%20AI%20assistant%20avatar%2C%20professional%2C%20cartoon%20style%2C%20pink%20clothing%2C%20glasses&image_size=square"
                alt="学工AI智能体助手"
                class="small-avatar"
              />
            </div>
            <div class="transfer-text">
              未找到您要了解的问题答案，可申请转人工为您解答，请问需要吗？
            </div>
            <div class="transfer-buttons">
              <button class="no-button" @click="cancelTransfer">不需要</button>
              <button class="yes-button" @click="confirmTransfer">需要</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 申请人工帮助 -->
      <div v-if="state === 'manual'" class="manual-section">
        <h2 class="section-title">申请人工帮助</h2>
        <form class="manual-form">
          <div class="form-group">
            <label class="form-label">问题类型</label>
            <select v-model="manualForm.questionType" class="form-select">
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
            <textarea
              v-model="manualForm.questionDescription"
              class="form-textarea"
              placeholder="请详细描述您的问题..."
            ></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">文件上传</label>
            <div class="file-upload" @click="$refs.manualFileInput?.click()">
              <input ref="manualFileInput" type="file" class="file-input" multiple @change="handleFileUpload" />
              <span class="file-icon">📎</span>
              <span v-if="selectedFiles.length === 0" class="file-placeholder">点击上传文件</span>
            </div>
            <div v-if="selectedFiles.length > 0" class="selected-files-list">
              <div v-for="(file, index) in selectedFiles" :key="index" class="selected-file-item">
                <span class="file-name">{{ file.name }}</span>
                <button class="remove-file-btn" @click.stop="removeSelectedFile(index)">×</button>
              </div>
            </div>
            <p class="file-hint">支持上传 word、excel、pdf、jpg、png 等通用格式（可多选）</p>
          </div>
          <div class="form-buttons">
            <button type="button" class="cancel-button" @click="cancelManual">取消</button>
            <button type="button" class="submit-button" @click="submitManual">提交</button>
          </div>
        </form>
      </div>

      <!-- 输入区域 (除了申请人工帮助页面外都显示) -->
      <div v-if="state !== 'manual'" class="input-section">
        <!-- 已上传文件列表 -->
        <div v-if="uploadedFiles.length > 0" class="uploaded-files-container">
          <div v-for="(file, index) in uploadedFiles" :key="index" class="uploaded-file-item">
            <svg
              class="file-icon-small"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V9L13 2Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M13 2V9H20"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span class="file-name">{{ file.name }}</span>
            <button class="remove-file-btn" @click="removeUploadedFile(index)">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
        <!-- 语音暂存提示 -->
        <div v-if="pendingVoiceFile" class="uploaded-files-list">
          <div class="uploaded-file-item">
            <span style="margin-right: 4px">🎤</span>
            <span class="file-name">{{ pendingVoiceFile.name }}（语音）</span>
            <button class="remove-file-btn" @click="pendingVoiceFile = null">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
        <div class="input-container-new">
          <textarea
            v-model="questionText"
            class="question-textarea"
            :placeholder="
              pendingVoiceFile ? '语音已就绪，可补充文字说明（可选）...' : '请输入您的问题...'
            "
            rows="1"
            @keyup.enter.exact="handleSubmit"
          ></textarea>
          <input
            ref="chatFileInput"
            type="file"
            class="chat-file-input"
            multiple
            accept="image/jpeg,image/png,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            @change="handleChatFileUpload"
          />
          <div class="input-actions">
            <div class="left-actions">
              <a-tooltip placement="top">
                <template #title>
                  <div class="upload-tooltip">
                    <div>📎 附件支持：.jpg .png .gif .pdf .doc .docx .xls .xlsx</div>
                    <div>（单文件最大 10MB）</div>
                  </div>
                </template>
                <button class="action-button" @click="triggerChatFileUpload">
                  <svg
                    class="action-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21.1525 10.8995L12.1369 19.9151C10.0866 21.9653 6.7625 21.9653 4.71225 19.9151C2.662 17.8648 2.662 14.5407 4.71225 12.4904L13.7279 3.47483C15.0947 2.108 17.2198 2.108 18.5866 3.47483C19.9534 4.84167 19.9534 6.96675 18.5866 8.33358L10.3797 16.5405C9.69633 17.2238 8.59637 17.2238 7.91304 16.5405C7.22971 15.8572 7.22971 14.7572 7.91304 14.0739L14.914 7.07295"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </a-tooltip>
              <a-tooltip placement="top">
                <template #title>
                  <div class="upload-tooltip">
                    <div>🎤 语音录制，最长 2 分钟</div>
                    <div>录制完成后自动上传（支持 webm/wav）</div>
                  </div>
                </template>
                <button
                  class="action-button"
                  :class="{ recording: isRecording }"
                  @click="toggleVoice"
                >
                  <span class="action-icon">{{ isRecording ? '⏹️' : '🎤' }}</span>
                </button>
              </a-tooltip>
            </div>
            <button class="send-button-new" @click="handleSubmit">
              <svg
                class="send-icon-svg"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
        <div class="input-footer">
          <a href="#" class="manual-help-link" @click.prevent="showManualForm">申请人工帮助</a>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { consultationApi } from '@/api'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import type { ConsultationQuestion } from '@/types'

interface Conversation {
  question: string
  answer: string
}

// 状态管理
const state = ref('welcome') // welcome, chat, transfer, manual
const questionText = ref('')
const currentQuestion = ref('')
const aiAnswer = ref('')
const isStreaming = ref(false) // 是否正在流式接收
const conversationHistory = ref<Conversation[]>([])
const router = useRouter()

// 会话ID：每次页面加载生成一个新的会话ID，标识本次连续对话
const sessionId = ref(`session-${Date.now()}-${Math.random().toString(36).slice(2)}`)

// 导航到咨询历史页面
const navigateToHistory = () => {
  router.push('/consultation/history')
}

// 人工帮助表单
const manualForm = reactive({
  questionType: '',
  questionDescription: '',
})
const selectedFiles = ref<File[]>([])

// 已选择文件列表（暂存在前端，提交时一起上传）
interface UploadedFile {
  name: string
  file: File
}
const uploadedFiles = ref<UploadedFile[]>([])

// 录音暂存：录制完成后存为 File，不立即提交
const pendingVoiceFile = ref<File | null>(null)

// 快捷问题处理
const handleQuickQuestion = (question: string) => {
  questionText.value = question
  handleSubmit()
}

// 提交问题
const handleSubmit = async () => {
  if (!questionText.value.trim() && !pendingVoiceFile.value) {
    message.warning('请输入问题或录制语音')
    return
  }

  // 如果有当前对话，先保存到历史记录
  if (currentQuestion.value && aiAnswer.value) {
    conversationHistory.value.push({
      question: currentQuestion.value,
      answer: aiAnswer.value,
    })
  }

  currentQuestion.value = questionText.value.trim() || (pendingVoiceFile.value ? '🎤 语音消息' : '')
  state.value = 'chat'
  aiAnswer.value = '' // 清空之前的回答
  isStreaming.value = true // 开始流式接收

  const userStore = useUserStore()
  const token = userStore.token

  if (!token) {
    message.error('请先登录')
    return
  }

  // 立即清空文本框
  const textToSend = questionText.value.trim()
  questionText.value = ''

  // 使用 multipart 接口：文件和问题文本一起提交
  const formData = new FormData()
  // 仅当有文本时才发送 questionText，纯语音时发送空字符串
  formData.append('questionText', textToSend)
  formData.append('sessionId', sessionId.value)
  uploadedFiles.value.forEach((f) => formData.append('files', f.file))
  // 语音文件单独作为 voice 类型附加（后端按 content-type 区分）
  if (pendingVoiceFile.value) {
    formData.append('files', pendingVoiceFile.value)
  }

  try {
    await consultationApi.submitQuestionStreamMultipart(
      formData,
      (chunk) => {
        aiAnswer.value += chunk
      },
      token
    )
    isStreaming.value = false
    uploadedFiles.value = []
    pendingVoiceFile.value = null
  } catch (error) {
    console.error('咨询请求失败:', error)
    message.error('咨询请求失败: ' + (error instanceof Error ? error.message : '未知错误'))
    // 如果失败，显示转人工选项
    state.value = 'transfer'
  }
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
  if (target.files && target.files.length > 0) {
    const newFiles = Array.from(target.files)
    selectedFiles.value.push(...newFiles)
  }
}

const removeSelectedFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

const cancelManual = () => {
  state.value = 'welcome'
  // 重置表单
  manualForm.questionType = ''
  manualForm.questionDescription = ''
  selectedFiles.value = []
}

const submitManual = async () => {
  if (!manualForm.questionType) {
    message.warning('请选择问题类型')
    return
  }
  if (!manualForm.questionDescription.trim()) {
    message.warning('请填写问题说明')
    return
  }

  const userStore = useUserStore()
  const token = userStore.token

  if (!token) {
    message.error('请先登录')
    return
  }

  try {
    const attachmentUrls: { transferMethod: string; url: string; type: string }[] = []

    // 上传所有文件（如果有）
    // 注意：request.ts 响应拦截器已解包，返回的直接是 string URL（不是 Result<string>）
    if (selectedFiles.value.length > 0) {
      for (const file of selectedFiles.value) {
        const result = await consultationApi.uploadFile(file)
        const fileUrl = result
        if (fileUrl) {
          attachmentUrls.push({
            transferMethod: 'remote_url',
            url: fileUrl,
            type: file.type.startsWith('image/') ? 'image' : 'document',
          })
        } else {
          message.error(`文件 ${file.name} 上传失败，请重试`)
          return
        }
      }
    }

    // 创建问题（响应拦截器已解包，直接是 ConsultationQuestion 对象）
    const question = await consultationApi.submitQuestion({
      questionText: manualForm.questionDescription,
      questionType: 'TEXT',
      category: manualForm.questionType,
      sessionId: sessionId.value,
      files: attachmentUrls.length > 0 ? attachmentUrls : undefined,
    })

    const questionId = (question as unknown as ConsultationQuestion)?.id
    if (!questionId) {
      message.error('创建问题失败，请重试')
      return
    }

    // 转移给人工处理，只传真实原因，历史对话通过 questionId 在后端查询
    const attachmentInfo = attachmentUrls.length > 0
      ? '\n附件: ' + attachmentUrls.map(a => a.url.split('/').pop()).join(', ')
      : ''
    await consultationApi.transferToHuman(questionId, {
      reason: `问题类型: ${manualForm.questionType}\n问题描述: ${manualForm.questionDescription}${attachmentInfo}`,
    })

    message.success('申请提交成功，我们将尽快为您处理')
    cancelManual()
  } catch (error) {
    console.error('提交人工帮助申请失败:', error)
    message.error('提交申请失败: ' + (error instanceof Error ? error.message : '未知错误'))
  }
}

// 语音功能
const isRecording = ref(false)
const mediaRecorder = ref<MediaRecorder | null>(null)
const audioChunks = ref<Blob[]>([])
const recordingTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const MAX_RECORDING_SECONDS = 120 // 最长录制2分钟

// 检测浏览器支持的音频格式
const getSupportedMimeType = (): string => {
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/wav']
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type
  }
  return ''
}

const toggleVoice = async () => {
  if (isRecording.value) {
    // 停止录音
    stopRecording()
  } else {
    // 开始录音
    await startRecording()
  }
}

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mimeType = getSupportedMimeType()
    const recorderOptions = mimeType ? { mimeType } : {}
    const recorder = new MediaRecorder(stream, recorderOptions)

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.value.push(event.data)
      }
    }

    recorder.onstop = () => {
      // 停止所有音轨，释放麦克风
      stream.getTracks().forEach((track) => track.stop())
      processRecording()
    }

    recorder.start()
    mediaRecorder.value = recorder
    isRecording.value = true
    message.info('开始录音，最长 2 分钟...')

    // 超时自动停止
    recordingTimer.value = setTimeout(() => {
      if (isRecording.value) {
        message.warning('已达到最长录制时间（2分钟），自动停止')
        stopRecording()
      }
    }, MAX_RECORDING_SECONDS * 1000)
  } catch (error) {
    console.error('录音失败:', error)
    message.error('录音失败，请检查麦克风权限')
  }
}

const stopRecording = () => {
  if (recordingTimer.value) {
    clearTimeout(recordingTimer.value)
    recordingTimer.value = null
  }
  if (mediaRecorder.value && mediaRecorder.value.state !== 'inactive') {
    mediaRecorder.value.stop()
    isRecording.value = false
    message.info('录音完成，点击发送按钮提交')
  }
}

const processRecording = async () => {
  if (audioChunks.value.length === 0) {
    message.warning('录音内容为空')
    return
  }

  const actualMimeType = mediaRecorder.value?.mimeType || getSupportedMimeType() || 'audio/webm'
  const audioBlob = new Blob(audioChunks.value, { type: actualMimeType })
  audioChunks.value = []

  try {
    message.loading({ content: '正在转换为MP3格式...', key: 'mp3convert' })

    // 用 AudioContext 解码原始音频为 PCM
    const arrayBuffer = await audioBlob.arrayBuffer()
    const audioContext = new AudioContext()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    await audioContext.close()

    // 取左声道 PCM 数据（lamejs 编码单声道）
    const sampleRate = audioBuffer.sampleRate
    const pcmData = audioBuffer.getChannelData(0)

    // 使用封装好的 mp3Encoder 工具转换（通过 lame.all.js 全局脚本避免 MPEGMode 问题）
    const { encodePcmToMp3 } = await import('@/utils/mp3Encoder')
    const mp3Blob = await encodePcmToMp3(pcmData, sampleRate)
    const mp3File = new File([mp3Blob], 'audio.mp3', { type: 'audio/mp3' })

    message.success({ content: '语音已就绪，可继续添加附件或直接发送', key: 'mp3convert' })
    pendingVoiceFile.value = mp3File
  } catch (err) {
    console.error('MP3转换失败:', err)
    message.error({ content: 'MP3转换失败，请重试', key: 'mp3convert' })
  }
}

// 聊天区域文件上传
const chatFileInput = ref<HTMLInputElement | null>(null)

const triggerChatFileUpload = () => {
  chatFileInput.value?.click()
}

const handleChatFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ]
  const maxSize = 10 * 1024 * 1024 // 10MB

  for (let i = 0; i < target.files.length; i++) {
    const file = target.files[i]
    if (!allowedTypes.includes(file.type)) {
      message.warning(`文件 ${file.name} 类型不支持`)
      continue
    }
    if (file.size > maxSize) {
      message.warning(`文件 ${file.name} 大小超过10MB限制`)
      continue
    }
    uploadedFiles.value.push({ name: file.name, file })
    message.success(`文件 ${file.name} 已添加`)
  }

  // 清空input，允许重复选择同一文件
  if (chatFileInput.value) chatFileInput.value.value = ''
}

const removeUploadedFile = (index: number) => {
  uploadedFiles.value.splice(index, 1)
}
</script>

<style scoped>
/* 页面容器 */
.consultation-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 主要内容区 */
.main-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 60px 40px 200px;
  min-height: calc(100vh - 64px);
}

/* 顶部操作栏 */
.top-actions {
  display: none;
}

/* 欢迎界面 */
.welcome-section {
  text-align: center;
  padding: 20px 0;
}

.ai-avatar {
  margin-bottom: 24px;
}

.avatar-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.main-title {
  font-size: 26px;
  color: #1890ff;
  margin-bottom: 48px;
  font-weight: 600;
}

.quick-consultation {
  margin-top: 48px;
}

.quick-title {
  font-size: 16px;
  color: #333;
  margin-bottom: 24px;
  font-weight: 500;
}

.quick-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px 32px;
  max-width: 640px;
  margin: 0 auto;
}

.quick-button {
  padding: 14px 20px;
  background-color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  color: #555;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
}

.quick-button:hover {
  background-color: #e6f7ff;
  color: #1890ff;
}

/* 聊天区域 */
.chat-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.conversation-item {
  margin-bottom: 20px;
}

.conversation-item.current {
  margin-bottom: 28px;
}

/* 问题显示 */
.question-display {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.question-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  max-width: 80%;
  margin-left: auto;
}

.question-content {
  background-color: #1890ff;
  color: white;
  padding: 10px 14px;
  border-radius: 10px;
  border-bottom-right-radius: 4px;
  font-size: 14px;
  line-height: 1.6;
  word-wrap: break-word;
}

.question-avatar {
  flex-shrink: 0;
}

.small-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

/* AI回答 */
.ai-response {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 12px;
}

.ai-message {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  max-width: 80%;
}

.ai-avatar-small {
  flex-shrink: 0;
}

.ai-content-plain {
  flex: 1;
  font-size: 14px;
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 转人工确认 */
.transfer-section {
  margin-top: 20px;
}

.transfer-message {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  max-width: 80%;
}

.transfer-text {
  flex: 1;
  background-color: #fff7e6;
  color: #d46b08;
  padding: 10px 14px;
  border-radius: 10px;
  border-bottom-left-radius: 4px;
  font-size: 14px;
  line-height: 1.6;
}

.transfer-buttons {
  display: flex;
  gap: 12px;
  margin-top: 10px;
  margin-left: 42px;
}

.no-button,
.yes-button {
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.no-button {
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #d9d9d9;
}

.no-button:hover {
  background-color: #e0e0e0;
}

.yes-button {
  background-color: #1890ff;
  color: white;
  border: none;
}

.yes-button:hover {
  background-color: #096dd9;
}

/* 申请人工帮助 */
.manual-section {
  background-color: #fafafa;
  padding: 28px;
  border-radius: 12px;
  margin-top: 20px;
}

.section-title {
  font-size: 18px;
  color: #333;
  margin-bottom: 20px;
}

.manual-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.form-select,
.form-textarea {
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.3s;
}

.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #1890ff;
}

.form-textarea {
  min-height: 120px;
  resize: vertical;
}

.file-upload {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.3s;
}

.file-upload:hover {
  border-color: #1890ff;
}

.file-input {
  display: none;
}

.file-icon {
  font-size: 20px;
}

.file-name {
  font-size: 14px;
  color: #333;
}

.file-placeholder {
  font-size: 14px;
  color: #999;
}

.selected-files-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.selected-file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background-color: #f0f5ff;
  border-radius: 16px;
  font-size: 13px;
  color: #333;
}

.remove-file-btn {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: none;
  background: #d9d9d9;
  color: #666;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-file-btn:hover {
  background: #ff4d4f;
  color: #fff;
}

.file-hint {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.form-buttons {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.cancel-button,
.submit-button {
  padding: 10px 28px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-button {
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #d9d9d9;
}

.cancel-button:hover {
  background-color: #e0e0e0;
}

.submit-button {
  background-color: #1890ff;
  color: white;
  border: none;
}

.submit-button:hover {
  background-color: #096dd9;
}

/* 输入区域 */
.input-section {
  position: fixed;
  bottom: 40px;
  left: 0;
  right: 0;
  background-color: transparent;
  padding: 16px 20px 8px;
  z-index: 100;
}

/* 已上传文件列表 */
.uploaded-files-container,
.uploaded-files-list {
  max-width: 800px;
  margin: 0 auto 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.uploaded-file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background-color: #f5f5f5;
  border-radius: 16px;
  font-size: 13px;
  color: #333;
}

.file-icon-small {
  width: 16px;
  height: 16px;
  color: #666;
}

.file-name {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-file-btn {
  width: 18px;
  height: 18px;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  transition: color 0.3s;
}

.remove-file-btn:hover {
  color: #666;
}

.remove-file-btn svg {
  width: 14px;
  height: 14px;
}

/* 新的输入容器样式 - 按照用户提供的图片设计 */
.input-container-new {
  max-width: 800px;
  margin: 0 auto;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  padding: 12px 16px;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  transition:
    border-color 0.3s,
    box-shadow 0.3s;
}

.input-container-new:focus-within {
  border-color: #1890ff;
  background-color: #fff;
}

.question-textarea {
  width: 100%;
  min-height: 40px;
  max-height: 120px;
  padding: 2px 0;
  border: none;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
  font-family: inherit;
  color: #333;
  background: transparent;
}

.question-textarea::placeholder {
  color: #aaa;
}

.input-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.left-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-button {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background-color: #f5f5f5;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  color: #666;
}

.action-button:hover {
  background-color: #e6f7ff;
  color: #1890ff;
}

.action-button.recording {
  background-color: #ff4757;
  border-color: #ff4757;
  color: white;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 71, 87, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 71, 87, 0);
  }
}

.action-icon {
  font-size: 16px;
  width: 20px;
  height: 20px;
}

.send-button-new {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  color: white;
}

.send-button-new:hover {
  transform: scale(1.08);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
}

.send-button-new:active {
  transform: scale(0.95);
}

.send-icon-svg {
  width: 20px;
  height: 20px;
  margin-left: 2px;
  margin-top: 2px;
}

.chat-file-input {
  display: none;
}

/* 输入框底部提示文字 */
.input-footer {
  text-align: center;
  margin-top: 12px;
}

.manual-help-link {
  color: #1890ff;
  text-decoration: none;
  font-size: 13px;
  transition: all 0.3s;
  display: inline-block;
}

.manual-help-link:hover {
  color: #096dd9;
  text-decoration: underline;
}
</style>
