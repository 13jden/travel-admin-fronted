import request from '@/utils/request'

// 获取景点列表
export function getAttractions(params = {}) {
  return request({
    url: '/attraction/search',
    method: 'get',
    params
  })
}

// 获取景点详情
export function getAttractionById(id) {
  return request({
    url: `/attraction/${id}`,
    method: 'get'
  })
}

// 新增景点
export function createAttraction(data) {
  return request({
    url: '/attraction',
    method: 'post',
    data
  })
}

// 更新景点
export function updateAttraction(id, data) {
  return request({
    url: `/attraction/${id}`,
    method: 'put',
    data
  })
}

// 删除景点
export function deleteAttraction(id) {
  return request({
    url: `/attraction/${id}`,
    method: 'delete'
  })
}

// 批量删除景点
export function batchDeleteAttractions(ids) {
  return request({
    url: '/attractions/batch',
    method: 'delete',
    data: { ids }
  })
}

// 获取景点统计数据
export function getAttractionStats() {
  return request({
    url: '/attractions/stats',
    method: 'get'
  })
}

// 搜索景点
export function searchAttractions(keyword, filters = {}) {
  return request({
    url: '/attraction/search',
    method: 'get',
    params: {
      keyword,
      ...filters
    }
  })
}
