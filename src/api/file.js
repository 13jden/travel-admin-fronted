import request from '@/utils/request'

// 上传文件 - 匹配后端 /file/upload 接口
export function uploadFile(file, options = {}) {
  const formData = new FormData()
  formData.append('file', file)
  
  // 后端接口不需要folder参数，但保留以防需要
  if (options.folder) {
    formData.append('folder', options.folder)
  }
  
  return request({
    url: '/file/upload',
    method: 'post',
    data: formData,
    // 不设置Content-Type，让axios自动处理multipart请求
    onUploadProgress: options.onUploadProgress
  })
}

// 获取文件详情 - 根据ID获取文件信息
export function getFileById(id) {
  return request({
    url: `/file/${id}`,
    method: 'get'
  })
}

// 获取文件详情 - 根据UUID获取文件信息（不下载，只获取信息）
export function getFileByUuid(uuid) {
  return request({
    url: `/file/download/${uuid}`,
    method: 'get'
    // 不设置responseType，获取JSON数据而不是blob
  })
}

// 下载文件 - 根据UUID下载文件
export function downloadFile(uuid) {
  return request({
    url: `/file/download/${uuid}`,
    method: 'get',
    responseType: 'blob' // 下载文件需要设置响应类型为blob
  })
}

// 预览文件 - 根据UUID预览文件
export function viewFile(uuid) {
  return request({
    url: `/file/view/${uuid}`,
    method: 'get',
    responseType: 'blob'
  })
}

// 删除文件 - 根据ID删除文件
export function deleteFileById(id) {
  return request({
    url: `/file/${id}`,
    method: 'delete'
  })
}

// 上传景点图片
export function uploadAttractionImage(file) {
  return uploadFile(file, { folder: 'attractions' })
}

// 获取文件URL - 根据UUID生成文件访问URL
export function getFileUrl(uuid) {
  return `${import.meta.env.VITE_API_BASE_URL || '/api'}/file/view/${uuid}`
}

// 获取文件下载URL - 根据UUID生成文件下载URL
export function getFileDownloadUrl(uuid) {
  return `${import.meta.env.VITE_API_BASE_URL || '/api'}/file/download/${uuid}`
}
