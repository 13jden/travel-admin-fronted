<template>
  <div class="chat-page">
    <header class="chat-header">
      <h1>AI 智能助手</h1>
    </header>

    <div class="chat-messages" ref="chatContainer">
      <div class="message-column">
        <div v-if="messages.length === 0" class="empty-chat">
          <el-empty description="开始与AI助手对话吧" />
        </div>
        
        <template v-else>
          <div 
            v-for="(msg, index) in messages" 
            :key="index" 
            :class="['message-wrapper', msg.role === 'user' ? 'user-message' : 'ai-message']"
          >
              <el-avatar v-if="msg.role === 'assistant'" :size="32" :icon="Service" class="ai-avatar" />
              <div class="message-content">
                <div class="message-text" v-html="formatMessage(msg.content)"></div>
                <div v-if="msg.role === 'assistant' && !loading" class="message-actions">
                  <el-button :icon="CopyDocument" link size="small" />
                  <el-button :icon="Refresh" link size="small" />
                </div>
              </div>
          </div>
        </template>
        
        <div v-if="loading" class="message-wrapper ai-message">
          <el-avatar :size="32" :icon="Service" class="ai-avatar" />
          <div class="message-content">
             <div class="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <footer class="chat-footer">
      <div class="chat-input-container">
        <el-input
          v-model="userInput"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 5 }"
          placeholder="向我提问..."
          resize="none"
          @keyup.enter.exact.prevent="sendMessage"
          class="chat-input"
        />
        <el-button 
          type="primary" 
          :icon="Promotion" 
          circle 
          class="send-button" 
          :disabled="!userInput.trim() || loading"
          @click="sendMessage"
        />
      </div>
       <div class="footer-note">智能助手可能提供不准确的信息。</div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { Service, Promotion, CopyDocument, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { marked } from 'marked'

// 聊天消息列表
const messages = ref([])
const userInput = ref('')
const loading = ref(false)
const chatContainer = ref(null)

// 配置 marked
marked.setOptions({
  gfm: true, // 启用 GitHub Flavored Markdown
  breaks: true, // 将换行符渲染为 <br>
})

// 示例问答对
const exampleResponses = {
  '村里有什么景点': `龙潭村有多处值得一游的景点：
  1.  **龙潭瀑布**：村里最著名的自然景观，水流湍急，景色壮观。
  2.  **古树林**：拥有超过500年历史的古树，其中"神树"是村子的象征。
  3.  **传统民居群**：保存完好的明清建筑，展示了当地特色建筑风格。
  4.  **山顶观景台**：可以俯瞰整个村庄和周围的群山。
  
  \`\`\`bash
  # 推荐游览路线
  村口 -> 龙潭瀑布 -> 古树林 -> 山顶观景台
  \`\`\``,
  
  '有什么当地美食': `龙潭村的特色美食非常丰富：
*   **竹筒饭**：将米饭放入新鲜的竹筒中蒸煮，香气四溢。
*   **烤全羊**：采用传统工艺烤制，肉质鲜嫩多汁。
*   **野菜煎饼**：采用当地野生蔬菜制作，营养丰富。
*   **农家豆腐**：手工制作，口感细腻。
*   **山泉鱼**：使用清澈的山泉水养殖的鱼，肉质鲜美。`
}

onMounted(() => {
  addMessage('assistant', '您好！我是龙潭村的智能导游助手，有什么可以帮您的吗？')
})

// 发送消息
const sendMessage = () => {
  if (!userInput.value.trim() || loading.value) return
  
  const userQuestion = userInput.value.trim()
  addMessage('user', userQuestion)
  userInput.value = ''
  
  loading.value = true
  
  setTimeout(() => {
    let response = ''
    if (userQuestion.includes('景点')) {
      response = exampleResponses['村里有什么景点']
    } else if (userQuestion.includes('美食') || userQuestion.includes('吃')) {
      response = exampleResponses['有什么当地美食']
    } else {
      response = '感谢您的提问，不过我目前的知识有限。随着知识库的更新，我将能回答更多问题。您可以询问关于景点或美食的问题试试。'
    }
    
    addMessage('assistant', response)
    loading.value = false
  }, 1000)
}

// 添加消息到列表
const addMessage = (role, content) => {
  messages.value.push({
    role,
    content,
    time: new Date().toLocaleTimeString() // 虽然设计稿没显示时间，但保留数据
  })
  
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

// 格式化消息内容，将换行符转为<br>以在v-html中生效
const formatMessage = (text) => {
  if (!text) return ''
  return marked.parse(text);
}

// 清空聊天记录
const clearChat = () => {
  messages.value = []
  addMessage('assistant', '您好！我是龙潭村的智能导游助手，有什么可以帮您的吗？')
  ElMessage.success('对话已清空')
}
</script>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 84px); /* 减去外层布局可能存在的头部高度 */
  background-color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
}

.chat-header {
  text-align: center;
  padding: 16px;
  border-bottom: 1px solid #e5e5e5;
  flex-shrink: 0;
}

.chat-header h1 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 24px 16px;
}

.message-column {
  max-width: 768px;
  margin: 0 auto;
}

.empty-chat {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-wrapper {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

/* AI message styling */
.ai-message {
  justify-content: flex-start;
}

.ai-avatar {
  flex-shrink: 0;
  background-color: #f0f2f5;
  color: #555;
}

.message-content {
  padding: 0;
  border-radius: 8px;
  word-break: break-word;
  color: #333;
  line-height: 1.7;
}

.message-text {
  white-space: pre-wrap;
}

.message-actions {
  margin-top: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.ai-message:hover .message-actions {
  opacity: 1;
}

.message-actions .el-button {
  color: #666;
}

.message-actions .el-button:hover {
  color: #333;
}

/* User message styling */
.user-message {
  justify-content: flex-end;
}

.user-message .message-content {
  background-color: #f0f2f5;
  padding: 12px 16px;
}

/* Footer and Input */
.chat-footer {
  padding: 16px;
  flex-shrink: 0;
  background-color: #fff;
  border-top: 1px solid #e5e5e5;
}

.chat-input-container {
  max-width: 768px;
  margin: 0 auto;
  position: relative;
}

.chat-input :deep(.el-textarea__inner) {
  padding: 12px 50px 12px 16px !important; /* Make space for send button */
  border-radius: 24px !important;
  border: 1px solid #dcdfe6 !important;
  background-color: #fff !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05) !important;
  line-height: 1.6;
  color: #333;
}

.send-button {
  position: absolute;
  right: 8px;
  bottom: 8px;
  background-color: #1c64f2;
}

.send-button:hover {
  background-color: #1a5ac4;
}

.send-button:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.footer-note {
  max-width: 768px;
  margin: 8px auto 0;
  text-align: center;
  font-size: 12px;
  color: #999;
}

/* Loading animation */
.loading-dots {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 0;
}
.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #999;
  animation: bounce 1.4s infinite ease-in-out both;
}
.loading-dots span:nth-of-type(1) { animation-delay: -0.32s; }
.loading-dots span:nth-of-type(2) { animation-delay: -0.16s; }
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1.0); }
}

.message-content :deep(p) {
  margin: 0;
}

.message-content :deep(ol),
.message-content :deep(ul) {
  padding-inline-start: 24px;
  margin-block-start: 0.5em;
  margin-block-end: 0.5em;
}

.message-content :deep(pre) {
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 6px;
  margin: 8px 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.message-content :deep(code) {
  font-family: 'Courier New', Courier, monospace;
  background-color: #f5f5f5;
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 0.9em;
}

.message-content :deep(pre > code) {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
  font-size: 1em;
}
</style> 