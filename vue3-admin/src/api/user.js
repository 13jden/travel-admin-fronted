import request from '@/utils/request'

/**
 * 获取用户列表（分页）
 */
export function getUserList(current = 1, size = 10, keyword = '') {
  return request({
    url: '/user/list',
    method: 'get',
    params: { current, size, keyword }
  })
}

/**
 * 获取用户详情
 */
export function getUserDetail(id) {
  return request({
    url: `/user/detail`,
    method: 'get',
    params: { id }
  })
}

/**
 * 更新用户信息
 */
export function updateUser(data) {
  return request({
    url: '/user/update',
    method: 'post',
    data
  })
}

/**
 * 更新用户头像
 */
export function updateAvatar(userId, avatar) {
  const formData = new FormData()
  formData.append('userId', userId)
  formData.append('avatar', avatar)
  
  return request({
    url: '/user/updateAvatar',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 修改用户状态（启用/禁用）
 */
export function updateUserStatus(userId, status) {
  return request({
    url: '/user/updateStatus',
    method: 'post',
    params: { userId, status }
  })
}

/**
 * 重置用户密码
 */
export function resetPassword(userId, newPassword) {
  return request({
    url: '/user/resetPassword',
    method: 'post',
    params: { userId, newPassword }
  })
}

/**
 * 删除用户
 */
export function deleteUser(id) {
  return request({
    url: `/user/delete/${id}`,
    method: 'post'
  })
}

export function getOfficialAccount() {
  return request({
    url: '/user/getOfficialAccount',
    method: 'get'
  })
}


/**
 * 注册用户（创建官方账号）
 */
export function registerUser(data) {
  const formData = new FormData()
  formData.append('email', data.email)
  formData.append('password', data.password)
  formData.append('nickName', data.nickName)
  formData.append('avatar', data.avatar)
  
  if (data.personIntruduction) {
    formData.append('personIntruduction', data.personIntruduction)
  }
  
  if (data.isOfficial !== undefined) {
    formData.append('isOfficial', data.isOfficial)
  }
  
  return request({
    url: '/user/register',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
} 