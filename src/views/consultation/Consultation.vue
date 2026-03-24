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
            <span style="margin-right:4px">🎤</span>
            <span class="file-name">{{ pendingVoiceFile.name }}（语音）</span>
            <button class="remove-file-btn" @click="pendingVoiceFile = null">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </div>
        <div class="input-container">
          <input
            v-model="questionText"
            type="text"
            class="question-input"
            :placeholder="pendingVoiceFile ? '语音已就绪，可补充文字说明（可选）...' : '请输入您的问题...'"
            @keyup.enter="handleSubmit"
          />
          <input
            ref="chatFileInput"
            type="file"
            class="chat-file-input"
            multiple
            accept="image/jpeg,image/png,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            @change="handleChatFileUpload"
          />
          <a-tooltip placement="top">
            <template #title>
              <div class="upload-tooltip">
                <div>📎 附件支持：.jpg .png .gif .pdf .doc .docx .xls .xlsx</div>
                <div>（单文件最大 10MB）</div>
              </div>
            </template>
            <button class="input-button" @click="triggerChatFileUpload">
              <svg
                class="button-icon-svg"
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
            <button class="input-button" :class="{ recording: isRecording }" @click="toggleVoice">
              <span class="button-icon">{{ isRecording ? '⏹️' : '🎤' }}</span>
            </button>
          </a-tooltip>
          <button class="send-button" @click="handleSubmit">
            <span class="send-icon">➤</span>
          </button>
        </div>
        <div class="input-hint">
          <span class="format-hint">📎 附件：jpg/png/gif/pdf/doc/xls（≤10MB）&nbsp;&nbsp;🎤 语音：最长2分钟</span>
          <span class="hint-divider">｜</span>
          <a href="#" @click.prevent="showManualForm">申请人工帮助</a>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import { message } from 'ant-design-vue'

import { consultationApi } from '@/api'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

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
const selectedFile = ref<File | null>(null)

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

  currentQuestion.value = questionText.value.trim() || '语音问题'
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
  questionText.value = ''

  // 使用 multipart 接口：文件和问题文本一起提交
  const formData = new FormData()
  formData.append('questionText', currentQuestion.value)
  formData.append('sessionId', sessionId.value)
  uploadedFiles.value.forEach((f) => formData.append('files', f.file))
  // 附加语音文件（如有）
  if (pendingVoiceFile.value) {
    formData.append('files', pendingVoiceFile.value)
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

  try {
    const response = await fetch(
      `${baseUrl}/api/v1/consultation/questions/stream/multipart`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    )

    if (!response.ok) {
      throw new Error(`请求失败: ${response.status} ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    if (!reader) throw new Error('无法获取响应流')

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let eventEndIndex
      while ((eventEndIndex = buffer.indexOf('\n\n')) !== -1) {
        const event = buffer.substring(0, eventEndIndex)
        buffer = buffer.substring(eventEndIndex + 2)
        for (const line of event.split('\n')) {
          if (line.startsWith('data:')) {
            const jsonStr = line.substring(5).trim()
            if (jsonStr && jsonStr !== '[DONE]') {
              try {
                const parsed = JSON.parse(jsonStr)
                if (parsed.answer) aiAnswer.value += parsed.answer
              } catch {
                aiAnswer.value += jsonStr
              }
            }
          }
        }
      }
    }
    isStreaming.value = false
    uploadedFiles.value = []
    pendingVoiceFile.value = null
  } catch (error: any) {
    console.error('咨询请求失败:', error)
    message.error('咨询请求失败: ' + (error.message || '未知错误'))
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
    let attachmentUrl: string | undefined = undefined

    // 上传文件（如果有）
    // 注意：request.ts 响应拦截器已解包，返回的直接是 string URL（不是 Result<string>）
    if (selectedFile.value) {
      const fileUrl = await consultationApi.uploadFile(selectedFile.value) as unknown as string
      if (fileUrl) {
        attachmentUrl = fileUrl
      } else {
        message.error('文件上传失败，请重试')
        return
      }
    }

    // 创建问题（响应拦截器已解包，直接是 ConsultationQuestion 对象）
    const question = await consultationApi.submitQuestion({
      questionText: manualForm.questionDescription,
      questionType: 'TEXT',
      category: manualForm.questionType,
      sessionId: sessionId.value,
      files: attachmentUrl
        ? [
            {
              transferMethod: 'remote_url',
              url: attachmentUrl,
              type: selectedFile.value?.type.startsWith('image/') ? 'image' : 'document',
            },
          ]
        : undefined,
    })

    const questionId = (question as any)?.id
    if (!questionId) {
      message.error('创建问题失败，请重试')
      return
    }

    // 转移给人工处理，只传真实原因，历史对话通过 questionId 在后端查询
    await consultationApi.transferToHuman(questionId, {
      reason: `问题类型: ${manualForm.questionType}\n问题描述: ${manualForm.questionDescription}${attachmentUrl ? '\n附件: ' + attachmentUrl : ''}`,
    })

    message.success('申请提交成功，我们将尽快为您处理')
    cancelManual()
  } catch (error: any) {
    console.error('提交人工帮助申请失败:', error)
    message.error('提交申请失败: ' + (error.message || '未知错误'))
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
  background-color: #ffffff;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 主要内容区 */
.main-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: calc(100vh - 60px);
}

/* 顶部操作栏 */
.top-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;
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
}

.quick-consultation {
  margin-top: 60px;
}

.quick-title {
  font-size: 18px;
  color: #666;
  margin-bottom: 24px;
}

.quick-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.quick-button {
  padding: 16px 24px;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.3s;
}

.quick-button:hover {
  background-color: #2196f3;
  color: white;
  border-color: #2196f3;
}

/* 聊天区域 */
.chat-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.conversation-item {
  margin-bottom: 24px;
}

.conversation-item.current {
  margin-bottom: 32px;
}

/* 问题显示 */
.question-display {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.question-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  max-width: 80%;
  margin-left: auto;
}

.question-content {
  background-color: #2196f3;
  color: white;
  padding: 12px 16px;
  border-radius: 12px;
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
  margin-bottom: 16px;
}

.ai-message {
  display: flex;
  align-items: flex-start;
  gap: 12px;
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
  margin-top: 24px;
}

.transfer-message {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  max-width: 80%;
}

.transfer-text {
  flex: 1;
  background-color: #fff3e0;
  color: #e65100;
  padding: 12px 16px;
  border-radius: 12px;
  border-bottom-left-radius: 4px;
  font-size: 14px;
  line-height: 1.6;
}

.transfer-buttons {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  margin-left: 44px;
}

.no-button,
.yes-button {
  padding: 8px 24px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.no-button {
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #e0e0e0;
}

.no-button:hover {
  background-color: #e0e0e0;
}

.yes-button {
  background-color: #2196f3;
  color: white;
  border: none;
}

.yes-button:hover {
  background-color: #1976d2;
}

/* 申请人工帮助 */
.manual-section {
  background-color: #f9f9f9;
  padding: 32px;
  border-radius: 12px;
  margin-top: 24px;
}

.section-title {
  font-size: 20px;
  color: #333;
  margin-bottom: 24px;
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
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.3s;
}

.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #2196f3;
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
  border: 1px dashed #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.3s;
}

.file-upload:hover {
  border-color: #2196f3;
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
  padding: 10px 32px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-button {
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #e0e0e0;
}

.cancel-button:hover {
  background-color: #e0e0e0;
}

.submit-button {
  background-color: #2196f3;
  color: white;
  border: none;
}

.submit-button:hover {
  background-color: #1976d2;
}

/* 输入区域 */
.input-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  padding: 16px 20px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

/* 已上传文件列表 */
.uploaded-files-container {
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

.input-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.question-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.question-input:focus {
  outline: none;
  border-color: #2196f3;
}

.input-button,
.send-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background-color: #f5f5f5;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.input-button:hover {
  background-color: #e0e0e0;
}

.input-button.recording {
  background-color: #ff4757;
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

.send-button {
  background-color: #2196f3;
  color: white;
}

.send-button:hover {
  background-color: #1976d2;
}

.button-icon,
.send-icon {
  font-size: 18px;
}

.button-icon-svg {
  width: 20px;
  height: 20px;
  color: #666;
}

.chat-file-input {
  display: none;
}

.input-hint {
  text-align: center;
  margin-top: 8px;
}

.input-hint a {
  color: #2196f3;
  text-decoration: none;
  font-size: 12px;
}

.input-hint a:hover {
  text-decoration: underline;
}

.format-hint {
  font-size: 11px;
  color: #aaa;
}

.hint-divider {
  font-size: 11px;
  color: #ccc;
  margin: 0 4px;
}

.upload-tooltip div {
  font-size: 12px;
  line-height: 1.6;
}
</style>
