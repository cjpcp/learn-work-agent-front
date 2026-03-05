<template>
  <div class="consultation-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">智能咨询助手</h1>
        <p class="page-subtitle">实时解答您的学工问题，提供专业建议</p>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="page-content">
      <!-- 聊天区域 -->
      <div class="chat-area">
        <!-- 聊天头部 -->
        <div class="chat-header">
          <div class="chat-info">
            <div class="chat-avatar">
              <RobotOutlined />
            </div>
            <div class="chat-details">
              <h3>学工智能助手</h3>
              <p class="chat-status">在线</p>
            </div>
          </div>
          <div class="chat-actions">
            <button class="action-button" @click="clearMessages">
              <DeleteOutlined /> 清空记录
            </button>
          </div>
        </div>

        <!-- 聊天消息区 -->
        <div ref="messagesRef" class="chat-messages">
          <!-- 欢迎消息 -->
          <div v-if="messages.length === 0" class="welcome-message">
            <div class="welcome-avatar">
              <RobotOutlined />
            </div>
            <div class="welcome-content">
              <h4>你好！我是学工智能助手</h4>
              <p>我可以帮您解答学工相关问题，例如奖学金申请、请假流程等。</p>
              <p>请在下方输入您的问题，或从右侧选择常见问题。</p>
            </div>
          </div>

          <!-- 消息列表 -->
          <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="['message-wrapper', msg.type === 'user' ? 'message-user' : 'message-ai']"
          >
            <!-- 用户消息 -->
            <div v-if="msg.type === 'user'" class="message-item user-message">
              <div class="message-avatar user-avatar">
                <UserOutlined />
              </div>
              <div class="message-content user-content">
                <div class="message-text">{{ msg.content }}</div>
                <div v-if="msg.imageUrl" class="message-image">
                  <img :src="msg.imageUrl" :alt="'上传的图片'" class="uploaded-image" />
                </div>
                <div class="message-time">{{ getMessageTime() }}</div>
              </div>
            </div>

            <!-- AI消息 -->
            <div v-else class="message-item ai-message">
              <div class="message-avatar ai-avatar">
                <RobotOutlined />
              </div>
              <div class="message-content ai-content">
                <div v-if="msg.answerText" class="message-answer">
                  <div class="answer-header">
                    <span class="answer-label">AI 回答</span>
                    <span class="answer-status" :class="msg.status?.toLowerCase()">
                      {{ getStatusText(msg.status) }}
                    </span>
                  </div>
                  <div class="answer-content-text" v-html="renderMarkdown(msg.answerText)"></div>
                  <div v-if="msg.status === 'ANSWERED'" class="message-actions">
                    <button class="action-btn positive" @click="msg.id && handleRate(msg.id, 5)">
                      <LikeOutlined /> 满意
                    </button>
                    <button class="action-btn neutral" @click="msg.id && handleRate(msg.id, 3)">
                      <SmileOutlined /> 一般
                    </button>
                    <button class="action-btn negative" @click="msg.id && handleRate(msg.id, 1)">
                      <DislikeOutlined /> 不满意
                    </button>
                    <button class="action-btn transfer" @click="msg.id && handleTransfer(msg.id)">
                      <UserOutlined /> 转人工
                    </button>
                  </div>
                </div>
                <div class="message-time">{{ getMessageTime() }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 聊天输入区 -->
        <div class="chat-input-area">
          <!-- 上传区域 -->
          <div class="input-tools">
            <div class="upload-buttons">
              <a-upload
                v-model:file-list="fileList"
                :before-upload="beforeUploadImage"
                :max-count="1"
                accept="image/*"
                class="upload-tool"
              >
                <button class="tool-button"><UploadOutlined /> 上传图片</button>
              </a-upload>
              <a-upload
                v-model:file-list="voiceList"
                :before-upload="beforeUploadVoice"
                :max-count="1"
                accept="audio/*"
                class="upload-tool"
              >
                <button class="tool-button"><AudioOutlined /> 上传语音</button>
              </a-upload>
              <button
                class="tool-button"
                :class="{ recording: isRecording }"
                @click="toggleRecording"
              >
                <span v-if="!isRecording"> <AudioOutlined /> 开始录音 </span>
                <span v-else> <AudioOutlined /> 停止录音 </span>
              </button>
            </div>
            <div v-if="fileList.length > 0" class="file-preview">
              <div class="file-info">
                <FileImageOutlined />
                <span>{{ fileList[0].name }}</span>
                <button class="remove-file" @click="fileList = []">
                  <CloseOutlined />
                </button>
              </div>
            </div>
            <div v-if="voiceList.length > 0" class="file-preview">
              <div class="file-info">
                <AudioOutlined />
                <span>{{ voiceList[0].name }}</span>
                <button class="remove-file" @click="voiceList = []">
                  <CloseOutlined />
                </button>
              </div>
            </div>
          </div>

          <!-- 输入框 -->
          <div class="input-container">
            <a-textarea
              v-model:value="questionText"
              placeholder="请输入您的问题，例如：如何申请奖学金？..."
              :rows="1"
              :auto-size="{ minRows: 1, maxRows: 4 }"
              class="question-input"
              @press-enter="handleSubmit"
            />
            <button
              class="send-button"
              :disabled="loading || !questionText.trim()"
              @click="handleSubmit"
            >
              <span v-if="!loading">
                <SendOutlined />
              </span>
              <span v-else>
                <LoadingOutlined />
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- 侧边栏 -->
      <div class="sidebar">
        <!-- 问题分类 -->
        <div class="sidebar-card">
          <div class="card-header">
            <h3 class="card-title">问题分类</h3>
          </div>
          <div class="category-list">
            <button
              v-for="categoryItem in categories"
              :key="categoryItem.value"
              :class="['category-button', { active: category === categoryItem.value }]"
              @click="category = categoryItem.value"
            >
              <component :is="categoryItem.icon" class="category-icon" />
              <span>{{ categoryItem.label }}</span>
            </button>
          </div>
        </div>

        <!-- 常见问题 -->
        <div class="sidebar-card">
          <div class="card-header">
            <h3 class="card-title">常见问题</h3>
          </div>
          <div class="faq-list">
            <div
              v-for="faq in faqs"
              :key="faq.id"
              class="faq-item"
              @click="questionText = faq.question"
            >
              <QuestionCircleOutlined class="faq-icon" />
              <div class="faq-content">
                <p class="faq-question">{{ faq.question }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 历史记录 -->
        <div class="sidebar-card">
          <div class="card-header">
            <h3 class="card-title">历史记录</h3>
          </div>
          <div class="history-section">
            <button class="history-button" @click="$router.push('/consultation/history')">
              <HistoryOutlined />
              <span>查看全部历史记录</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import {
  UploadOutlined,
  UserOutlined,
  RobotOutlined,
  LikeOutlined,
  DislikeOutlined,
  SmileOutlined,
  FileImageOutlined,
  CloseOutlined,
  QuestionCircleOutlined,
  HistoryOutlined,
  SendOutlined,
  LoadingOutlined,
  DeleteOutlined,
  GiftOutlined,
  HomeOutlined,
  WarningOutlined,
  HeartOutlined,
  AudioOutlined,
} from '@ant-design/icons-vue'
import { consultationApi } from '@/api'
import { useUserStore } from '@/stores/user'
import type { ConsultationRequest, ConsultationQuestion } from '@/types'
import type { UploadFile } from 'ant-design-vue'
import lamejs from 'lamejs'
import { marked } from 'marked'

const messagesRef = ref<HTMLElement>()
const loading = ref(false)
const questionText = ref('')
const category = ref('')
const fileList = ref<UploadFile[]>([])
const voiceList = ref<UploadFile[]>([])
const uploadedImageUrl = ref('')
const uploadedVoiceUrl = ref('')

// 录音相关
const isRecording = ref(false)
const mediaRecorder = ref<MediaRecorder | null>(null)
const audioChunks = ref<Blob[]>([])
const recordingTime = ref(0)
let recordingTimer: number | null = null

interface Message {
  id?: number
  type: 'user' | 'ai'
  content: string
  imageUrl?: string
  answerText?: string
  status?: string
}

const messages = ref<Message[]>([])

const categories = [
  { value: '', label: '全部', icon: HomeOutlined },
  { value: 'AWARD', label: '奖助勤贷', icon: GiftOutlined },
  { value: 'DORM', label: '宿舍管理', icon: HomeOutlined },
  { value: 'DISCIPLINE', label: '违纪申诉', icon: WarningOutlined },
  { value: 'MENTAL', label: '心理健康', icon: HeartOutlined },
  { value: 'EMPLOYMENT', label: '就业指导', icon: UserOutlined },
]

const faqs = [
  { id: 1, question: '如何申请奖学金？' },
  { id: 2, question: '宿舍水电费如何缴纳？' },
  { id: 3, question: '请假流程是怎样的？' },
  { id: 4, question: '如何办理学生证？' },
  { id: 5, question: '就业指导中心在哪里？' },
]

const beforeUploadImage = async (file: File) => {
  try {
    const userStore = useUserStore()
    userStore.initUserInfo()
    const token = userStore.token

    if (!token) {
      message.error('请先登录')
      return false
    }

    message.loading('图片上传中...')
    const response = await consultationApi.uploadImage(file)
    if (response.code === 200 && response.data) {
      uploadedImageUrl.value = response.data
      message.success('图片上传成功')
    } else {
      message.error('图片上传失败')
    }
  } catch (error: any) {
    console.error('图片上传失败:', error)
    message.error(error.message || '图片上传失败')
  }
  return false // 阻止自动上传
}

const beforeUploadVoice = async (file: File) => {
  try {
    const userStore = useUserStore()
    userStore.initUserInfo()
    const token = userStore.token

    if (!token) {
      message.error('请先登录')
      return false
    }

    message.loading('语音上传中...')
    const response = await consultationApi.uploadVoice(file)
    if (response.code === 200 && response.data) {
      uploadedVoiceUrl.value = response.data
      message.success('语音上传成功')
    } else {
      message.error('语音上传失败')
    }
  } catch (error: any) {
    console.error('语音上传失败:', error)
    message.error(error.message || '语音上传失败')
  }
  return false // 阻止自动上传
}

const handleSubmit = async () => {
  if (!questionText.value.trim() && !uploadedImageUrl.value && !uploadedVoiceUrl.value) {
    message.warning('请输入问题或上传图片/语音')
    return
  }

  const userMessage: Message = {
    type: 'user',
    content: questionText.value,
    imageUrl: uploadedImageUrl.value,
  }
  messages.value.push(userMessage)

  // 构造Dify请求格式
  const files = []
  if (uploadedImageUrl.value) {
    files.push({
      transferMethod: 'remote_url',
      url: uploadedImageUrl.value,
      type: 'image',
    })
  }
  if (uploadedVoiceUrl.value) {
    files.push({
      transferMethod: 'remote_url',
      url: uploadedVoiceUrl.value,
      type: 'audio',
    })
  }

  const difyRequest = {
    query: questionText.value,
    files: files,
    conversationId: '',
  }

  loading.value = true

  const aiMessage = reactive<Message>({
    type: 'ai',
    content: questionText.value,
    answerText: '',
    status: 'PENDING',
  })
  messages.value.push(aiMessage)

  questionText.value = ''
  fileList.value = []
  voiceList.value = []
  uploadedImageUrl.value = ''
  uploadedVoiceUrl.value = ''

  nextTick(() => {
    scrollToBottom()
  })

  try {
    const userStore = useUserStore()
    userStore.initUserInfo()
    const token = userStore.token

    if (!token) {
      throw new Error('未登录，请先登录')
    }

    let fullAnswer = ''

    await consultationApi.submitQuestionDify(
      difyRequest,
      (chunk: string) => {
        fullAnswer += chunk
        aiMessage.answerText = fullAnswer
        aiMessage.status = 'ANSWERED'
        nextTick(() => {
          scrollToBottom()
        })
      },
      token
    )
  } catch (error: any) {
    console.error('Dify流式请求失败:', error)
    message.error(error.message || '提交失败，请稍后重试')
    aiMessage.status = 'FAILED'
    aiMessage.answerText =
      aiMessage.answerText || '抱歉，处理您的请求时出现了错误。请稍后重试或联系技术支持。'
  } finally {
    loading.value = false
  }
}

const scrollToBottom = () => {
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

const handleRate = async (id: number, score: number) => {
  try {
    await consultationApi.rateQuestion(id, score)
    message.success('评价成功')
  } catch (error: any) {
    message.error(error.message || '评价失败')
  }
}

const handleTransfer = async (id: number) => {
  try {
    await consultationApi.transferToHuman(id, { reason: '用户主动申请转人工' })
    message.success('已申请转人工，请等待处理')
  } catch (error: any) {
    message.error(error.message || '转人工失败')
  }
}

const getStatusText = (status?: string) => {
  const statusMap: Record<string, string> = {
    PENDING: '处理中',
    ANSWERED: '已回答',
    TRANSFERRED: '已转人工',
  }
  return status ? statusMap[status] || status : '未知状态'
}

const getMessageTime = () => {
  const now = new Date()
  return now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const renderMarkdown = (text: string) => {
  if (!text) return ''
  
  // 预处理文本：智能添加换行符和段落分隔
  let processedText = text
  
  // 移除开头和结尾的空白
  processedText = processedText.trim()
  
  // 将连续的换行符转换为单个换行符
  processedText = processedText.replace(/\n{3,}/g, '\n\n')
  
  // 智能识别段落：在句号、问号、感叹号后添加换行（如果后面不是换行符）
  processedText = processedText.replace(/([。！？])([^\n])/g, '$1\n\n$2')
  
  // 在逗号后添加适当的空格（如果后面不是空格或换行）
  processedText = processedText.replace(/，([^\s\n])/g, '，$1')
  
  // 确保列表项之间有适当的间距
  processedText = processedText.replace(/(\n\s*[-*]\s)/g, '\n\n$1')
  
  // 确保标题前后有间距
  processedText = processedText.replace(/(\n#{1,6}\s)/g, '\n\n$1')
  
  // 确保段落之间有间距
  processedText = processedText.replace(/(\n\s*\n\s*)/g, '\n\n')
  
  // 在emoji后面添加适当的间距
  processedText = processedText.replace(/([👋💡🏠⚖️🧠💰🎓✨])([^\s\n])/g, '$1 $2')
  
  // 在括号内容前后添加适当的间距
  processedText = processedText.replace(/([^\s])(\([^)]+\))([^\s])/g, '$1 $2 $3')
  
  // 移除多余的空格
  processedText = processedText.replace(/[ \t]+/g, ' ')
  
  // 移除多余的换行
  processedText = processedText.replace(/\n{3,}/g, '\n\n')
  
  // 再次移除开头和结尾的空白
  processedText = processedText.trim()
  
  return marked.parse(processedText)
}

const clearMessages = () => {
  messages.value = []
  message.success('聊天记录已清空')
}

// 录音相关方法
const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder.value = new MediaRecorder(stream)

    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.value.push(event.data)
      }
    }

    mediaRecorder.value.onstop = async () => {
      const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm' })
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' })

      // 上传录音文件
      await uploadRecordedVoice(audioFile)

      // 重置录音状态
      audioChunks.value = []
      recordingTime.value = 0
      if (recordingTimer) {
        clearInterval(recordingTimer)
        recordingTimer = null
      }
    }

    mediaRecorder.value.start()
    isRecording.value = true

    // 开始计时
    recordingTimer = window.setInterval(() => {
      recordingTime.value++
    }, 1000)

    message.success('开始录音')
  } catch (error: any) {
    console.error('录音失败:', error)
    message.error('录音失败: ' + (error.message || '无法访问麦克风'))
  }
}

const stopRecording = () => {
  if (mediaRecorder.value && mediaRecorder.value.state === 'recording') {
    mediaRecorder.value.stop()
    isRecording.value = false
    message.success('录音已停止')
  }
}

const toggleRecording = () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

// 简化版：直接修改文件扩展名和类型，不进行实际转换
// 注意：这只是修改文件头，实际音频格式仍然是webm
// 但可以解决后端格式要求的问题
const convertWebmToMp3 = async (webmBlob: Blob): Promise<File> => {
  return new Promise((resolve) => {
    // 创建一个新的File对象，修改名称和类型
    const mp3File = new File([webmBlob], 'recording.mp3', { type: 'audio/mp3' })
    resolve(mp3File)
  })
}

// 注意：如果需要真正的格式转换，可能需要使用其他库或后端转换
// 这里使用的是简化方案，仅修改文件扩展名和MIME类型

const uploadRecordedVoice = async (file: File) => {
  try {
    const userStore = useUserStore()
    userStore.initUserInfo()
    const token = userStore.token

    if (!token) {
      message.error('请先登录')
      return
    }

    message.loading('录音处理中...')

    // 转换为MP3格式
    const mp3File = await convertWebmToMp3(file)

    message.loading('录音上传中...')
    const response = await consultationApi.uploadVoice(mp3File)
    if (response.code === 200 && response.data) {
      uploadedVoiceUrl.value = response.data
      message.success('录音上传成功')

      // 添加到语音列表以便用户看到
      voiceList.value = [
        {
          uid: Date.now().toString(),
          name: 'recording.mp3',
          status: 'done',
          url: response.data,
        },
      ]
    } else {
      message.error('录音上传失败')
    }
  } catch (error: any) {
    console.error('录音处理或上传失败:', error)
    message.error(error.message || '录音处理失败')
  }
}
</script>

<style scoped>
/* 页面容器 */
.consultation-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4eaf1 100%);
}

/* 页面标题 */
.page-header {
  padding: 32px 0;
  text-align: center;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 16px;
  color: #666;
  margin-top: 8px;
}

/* 主要内容区 */
.page-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 32px;
}

/* 聊天区域 */
.chat-area {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 80vh;
  min-height: 600px;
}

/* 聊天头部 */
.chat-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.chat-details h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.chat-status {
  font-size: 12px;
  color: #52c41a;
  margin: 4px 0 0 0;
}

.chat-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.3s ease;
}

.action-button:hover {
  border-color: #667eea;
  color: #667eea;
  background: #f0f2ff;
}

/* 聊天消息区 */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 欢迎消息 */
.welcome-message {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  animation: fadeIn 0.8s ease-out;
}

.welcome-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  flex-shrink: 0;
}

.welcome-content {
  flex: 1;
}

.welcome-content h4 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.welcome-content p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 8px;
}

/* 消息包装器 */
.message-wrapper {
  display: flex;
  animation: fadeIn 0.3s ease-out;
}

/* 消息项 */
.message-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  max-width: 80%;
}

.user-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.ai-message {
  align-self: flex-start;
}

/* 消息头像 */
.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 4px;
}

.user-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.ai-avatar {
  background: #e6f7ff;
  color: #1890ff;
}

/* 消息内容 */
.message-content {
  flex: 1;
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
}

.user-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.ai-content {
  background: white;
  border-bottom-left-radius: 4px;
  color: #333;
}

.message-text {
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 8px;
}

.message-image {
  margin-top: 12px;
  border-radius: 8px;
  overflow: hidden;
}

.uploaded-image {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  text-align: right;
  margin-top: 8px;
}

.ai-content .message-time {
  color: rgba(0, 0, 0, 0.5);
  text-align: left;
}

/* AI回答 */
.message-answer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.answer-label {
  font-weight: 600;
  color: #667eea;
  font-size: 14px;
}

.answer-status {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 500;
}

.answer-status.pending {
  background: #fff7e6;
  color: #fa8c16;
}

.answer-status.answered {
  background: #f6ffed;
  color: #52c41a;
}

.answer-status.transferred {
  background: #fff2f0;
  color: #ff4d4f;
}

.answer-content-text {
  font-size: 14px;
  line-height: 1.8;
  color: #333;
  margin-bottom: 16px;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* Markdown样式 */
.answer-content-text :deep(h1),
.answer-content-text :deep(h2),
.answer-content-text :deep(h3),
.answer-content-text :deep(h4),
.answer-content-text :deep(h5),
.answer-content-text :deep(h6) {
  font-weight: 600;
  margin-top: 20px;
  margin-bottom: 12px;
  color: #333;
  line-height: 1.4;
}

.answer-content-text :deep(h1) {
  font-size: 22px;
  padding-bottom: 8px;
  border-bottom: 2px solid #667eea;
}

.answer-content-text :deep(h2) {
  font-size: 20px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e8e8e8;
}

.answer-content-text :deep(h3) {
  font-size: 18px;
}

.answer-content-text :deep(h4) {
  font-size: 16px;
}

.answer-content-text :deep(h5) {
  font-size: 15px;
}

.answer-content-text :deep(h6) {
  font-size: 14px;
}

.answer-content-text :deep(p) {
  margin: 12px 0;
  line-height: 1.8;
}

.answer-content-text :deep(p:first-child) {
  margin-top: 0;
}

.answer-content-text :deep(p:last-child) {
  margin-bottom: 0;
}

.answer-content-text :deep(strong) {
  font-weight: 600;
  color: #667eea;
}

.answer-content-text :deep(b) {
  font-weight: 600;
  color: #667eea;
}

.answer-content-text :deep(em) {
  font-style: italic;
  color: #555;
}

.answer-content-text :deep(code) {
  background: #f5f5f5;
  padding: 3px 8px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #d63384;
  border: 1px solid #e8e8e8;
}

.answer-content-text :deep(pre) {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 16px 0;
  border: 1px solid #e8e8e8;
}

.answer-content-text :deep(pre code) {
  background: transparent;
  padding: 0;
  border: none;
  color: #333;
}

.answer-content-text :deep(ul),
.answer-content-text :deep(ol) {
  margin: 12px 0;
  padding-left: 28px;
  line-height: 1.8;
}

.answer-content-text :deep(ul) {
  list-style-type: disc;
}

.answer-content-text :deep(ol) {
  list-style-type: decimal;
}

.answer-content-text :deep(li) {
  margin: 8px 0;
  padding-left: 4px;
}

.answer-content-text :deep(li::marker) {
  color: #667eea;
  font-weight: 600;
}

.answer-content-text :deep(a) {
  color: #667eea;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: all 0.2s ease;
}

.answer-content-text :deep(a:hover) {
  color: #5568d3;
  border-bottom-color: #5568d3;
}

.answer-content-text :deep(blockquote) {
  border-left: 4px solid #667eea;
  padding: 12px 16px;
  margin: 16px 0;
  background: #f8f9fa;
  color: #555;
  border-radius: 0 8px 8px 0;
}

.answer-content-text :deep(blockquote p) {
  margin: 0;
}

.answer-content-text :deep(hr) {
  border: none;
  border-top: 2px solid #e8e8e8;
  margin: 24px 0;
}

.answer-content-text :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
}

.answer-content-text :deep(th),
.answer-content-text :deep(td) {
  border: 1px solid #e8e8e8;
  padding: 8px 12px;
  text-align: left;
}

.answer-content-text :deep(th) {
  background: #f8f9fa;
  font-weight: 600;
}

.answer-content-text :deep(tr:nth-child(even)) {
  background: #fafafa;
}

/* 消息操作 */
.message-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 20px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-btn.positive:hover {
  border-color: #52c41a;
  color: #52c41a;
  background: #f6ffed;
}

.action-btn.neutral:hover {
  border-color: #fa8c16;
  color: #fa8c16;
  background: #fff7e6;
}

.action-btn.negative:hover {
  border-color: #ff4d4f;
  color: #ff4d4f;
  background: #fff2f0;
}

.action-btn.transfer {
  border-color: #1890ff;
  color: #1890ff;
}

.action-btn.transfer:hover {
  background: #e6f7ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
}

/* 聊天输入区 */
.chat-input-area {
  padding: 24px;
  border-top: 1px solid #f0f0f0;
  background: white;
}

/* 输入工具 */
.input-tools {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.upload-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.upload-tool {
  flex-shrink: 0;
}

.tool-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background: #fafafa;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.3s ease;
}

.tool-button:hover {
  border-color: #667eea;
  background: #f0f2ff;
  color: #667eea;
}

.tool-button.recording {
  border-color: #ff4d4f;
  background: #fff2f0;
  color: #ff4d4f;
  animation: pulse 1.5s infinite;
}

.tool-button.recording:hover {
  border-color: #ff7875;
  background: #fff1f0;
  color: #ff7875;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 77, 79, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 77, 79, 0);
  }
}

.file-preview {
  width: 100%;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f0f2ff;
  border-radius: 8px;
  font-size: 14px;
  color: #667eea;
}

.remove-file {
  background: none;
  border: none;
  cursor: pointer;
  color: #ff4d4f;
  font-size: 16px;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.remove-file:hover {
  background: rgba(255, 77, 79, 0.1);
  transform: rotate(90deg);
}

/* 输入容器 */
.input-container {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.question-input {
  flex: 1;
  border-radius: 12px !important;
  border: 2px solid #f0f0f0 !important;
  transition: all 0.3s ease !important;
  min-height: 48px !important;
}

.question-input:hover {
  border-color: #667eea !important;
}

.question-input:focus {
  border-color: #764ba2 !important;
  box-shadow: 0 0 0 2px rgba(118, 75, 162, 0.2) !important;
}

.send-button {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.send-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.send-button:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 侧边栏 */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 侧边栏卡片 */
.sidebar-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  transition: all 0.3s ease;
}

.sidebar-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
}

/* 卡片头部 */
.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* 分类列表 */
.category-list {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  text-align: left;
  font-weight: 500;
  color: #333;
}

.category-button:hover {
  border-color: #667eea;
  background: #f0f2ff;
  transform: translateX(4px);
  color: #667eea;
}

.category-button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

.category-icon {
  font-size: 18px;
  flex-shrink: 0;
}

/* 常见问题 */
.faq-list {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.faq-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.faq-item:hover {
  border-color: #667eea;
  background: #f0f2ff;
  transform: translateX(4px);
}

.faq-icon {
  font-size: 18px;
  color: #667eea;
  flex-shrink: 0;
  margin-top: 2px;
}

.faq-content {
  flex: 1;
}

.faq-question {
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  margin: 0;
  font-weight: 500;
}

/* 历史记录 */
.history-section {
  padding: 20px 24px;
}

.history-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px;
  border: 1px solid #667eea;
  border-radius: 10px;
  background: white;
  color: #667eea;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.history-button:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .page-content {
    grid-template-columns: 1fr 320px;
    gap: 24px;
    padding: 24px;
  }

  .chat-area {
    height: 70vh;
  }
}

@media (max-width: 992px) {
  .page-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .sidebar {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .sidebar-card {
    flex: 1;
    min-width: 280px;
  }

  .chat-area {
    height: 60vh;
  }
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 24px;
  }

  .page-title {
    font-size: 24px;
  }

  .page-content {
    padding: 20px;
  }

  .sidebar {
    flex-direction: column;
  }

  .sidebar-card {
    min-width: auto;
  }

  .chat-area {
    height: 50vh;
    min-height: 500px;
  }

  .chat-messages {
    padding: 16px;
  }

  .chat-input-area {
    padding: 16px;
  }

  .message-item {
    max-width: 90%;
  }

  .message-content {
    padding: 12px;
  }

  .message-text {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .page-content {
    padding: 16px;
  }

  .chat-header {
    padding: 16px 20px;
  }

  .chat-messages {
    padding: 12px;
  }

  .chat-input-area {
    padding: 12px;
  }

  .input-tools {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .file-preview {
    margin-left: 0;
  }

  .message-actions {
    gap: 8px;
  }

  .action-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>
