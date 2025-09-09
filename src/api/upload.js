import request from '@/utils/request'

// 上传消息文件（图片/视频等）
export function uploadMessageFile(data) {
  return request({
    url: '/upload/messageFile',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
} 