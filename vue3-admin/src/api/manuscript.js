import request from '@/utils/request'

/**
 * 分页查询稿件上传记录
 * @param {number} current - 当前页码
 * @param {number} size - 每页记录数
 * @param {string} keyword - 搜索关键词
 * @param {number} status - 审核状态
 * @param {string} userId - 用户ID
 * @returns {Promise}
 */
export function getManuscriptList(current = 1, size = 20, keyword = '', status = '', userId = '') {
  return request({
    url: '/manuscript-upload/list',
    method: 'get',
    params: {
      current,
      size,
      keyword,
      status,
      userId
    }
  })
}

/**
 * 根据ID查询稿件上传记录详情
 * @param {number} id - 上传记录ID
 * @returns {Promise}
 */
export function getManuscriptUploadDetail(id) {
  return request({
    url: '/manuscript-upload/detail',
    method: 'get',
    params: { id }
  })
}

/**
 * 根据审核状态查询稿件
 * @param {number} status - 审核状态
 * @param {number} current - 当前页码
 * @param {number} size - 每页记录数
 * @returns {Promise}
 */
export function getManuscriptsByStatus(status, current = 1, size = 20) {
  return request({
    url: '/manuscript-upload/status',
    method: 'get',
    params: {
      status,
      current,
      size
    }
  })
}

/**
 * 按关键词搜索稿件上传记录
 * @param {string} keyword - 搜索关键词
 * @param {number} current - 当前页码
 * @param {number} size - 每页记录数
 * @returns {Promise}
 */
export function searchManuscripts(keyword, current = 1, size = 20) {
  return request({
    url: '/manuscript-upload/search',
    method: 'get',
    params: {
      keyword,
      current,
      size
    }
  })
}

/**
 * 根据ID查询稿件详情
 * @param {string} id - 稿件ID
 * @returns {Promise}
 */
export function getManuscriptPostDetail(id) {
  return request({
    url: '/manuscript-post/detail',
    method: 'get',
    params: { id }
  })
}

/**
 * 审核稿件
 * @param {number} uploadId - 稿件上传ID
 * @param {boolean} approved - 是否通过
 * @param {string} auditUserId - 审核人ID
 * @param {string} auditComment - 审核意见/拒绝原因
 * @returns {Promise}
 */
export function auditManuscript(uploadId, approved, auditUserId, auditComment = '') {
  return request({
    url: '/manuscript-upload/audit',
    method: 'post',
    params: {
      uploadId,
      approved,
      auditUserId,
      auditComment
    }
  })
}

// 可以保留这两个函数作为包装函数，方便调用
export function approveManuscript(id, auditUserId) {
  return auditManuscript(id, true, auditUserId, '')
}

export function rejectManuscript(id, reason, auditUserId) {
  return auditManuscript(id, false, auditUserId, reason)
}

/**
 * 删除稿件
 * @param {number} id - 稿件上传ID
 * @returns {Promise}
 */
export function deleteManuscript(id) {
  return request({
    url: '/manuscript-upload/delete',
    method: 'post',
    data: { id }
  })
}

/**
 * 更新稿件分类
 * @param {number} id - 稿件上传ID 
 * @param {number} categoryId - 分类ID
 * @returns {Promise}
 */
export function updateManuscriptCategory(id, categoryId) {
  return request({
    url: '/manuscript-upload/update-category',
    method: 'post',
    data: {
      id,
      categoryId
    }
  })
}

/**
 * 视频预上传，获取视频ID和初始化分片信息
 * @param {string} userId - 用户ID
 * @param {string} fileName - 文件名
 * @param {number} totalChunks - 总分片数
 * @param {number} totalSize - 总文件大小（字节）
 * @returns {Promise}
 */
export function preUploadVideo(userId, fileName, totalChunks, totalSize) {
  return request({
    url: '/manuscript-video/pre-upload',
    method: 'get',
    params: {
      userId,
      fileName,
      totalChunks,
      totalSize
    }
  })
}

/**
 * 上传视频分片
 * @param {File} file - 分片文件
 * @param {string} videoId - 视频ID
 * @param {number} chunkNumber - 分片序号
 * @returns {Promise}
 */
export function uploadVideoChunk(file, videoId, chunkNumber) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('videoId', videoId)
  formData.append('chunkNumber', chunkNumber)
  
  return request({
    url: '/manuscript-video/upload-chunk',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 上传视频封面
 * @param {File} file - 封面图片文件
 * @returns {Promise}
 */
export function uploadVideoCover(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  return request({
    url: '/manuscript-video/upload-cover',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 提交视频信息
 * @param {Object} data - 视频信息
 * @returns {Promise}
 */
export function submitVideo(data) {
  const formData = new FormData()
  
  // 将所有数据添加到 FormData 对象
  Object.keys(data).forEach(key => {
    // 特殊处理 tags 字段，确保是 JSON 字符串
    if (key === 'tags' && typeof data[key] !== 'string') {
      formData.append(key, JSON.stringify(data[key]))
    } else {
      formData.append(key, data[key])
    }
  })
  
  return request({
    url: '/manuscript-video/submit',
    method: 'post',
    data: formData,  // 使用 data 而不是 params
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取视频上传状态
 * @param {string} videoId - 视频ID
 * @returns {Promise}
 */
export function getVideoUploadStatus(videoId) {
  return request({
    url: '/manuscript-video/status',
    method: 'get',
    params: {
      videoId
    }
  })
} 