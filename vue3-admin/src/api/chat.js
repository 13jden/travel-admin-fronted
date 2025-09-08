import request from '@/utils/request'

// 流式聊天接口
export function streamChat(message) {
  return new Promise((resolve, reject) => {
    const url = `/api/chat/stream?message=${encodeURIComponent(message)}`
    
    // 使用 EventSource 处理 SSE 流
    const eventSource = new EventSource(url)
    let fullResponse = ''
    
    const onMessage = (event) => {
      if (event.data === '[DONE]') {
        eventSource.close()
        resolve(fullResponse)
        return
      }
      
      try {
        fullResponse += event.data
        // 如果需要实时更新UI，可以通过回调函数处理
        if (onMessage.callback) {
          onMessage.callback(event.data, fullResponse)
        }
      } catch (error) {
        console.error('解析流数据错误:', error)
      }
    }
    
    const onError = (error) => {
      console.error('流连接错误:', error)
      eventSource.close()
      reject(error)
    }
    
    eventSource.onmessage = onMessage
    eventSource.onerror = onError
    
    // 返回 eventSource 以便外部控制
    return eventSource
  })
}

// 简化版聊天接口（如果后端也支持非流式）
export function chat(message) {
  return request({
    url: '/chat/stream',
    method: 'get',
    params: {
      message: message
    }
  })
}
