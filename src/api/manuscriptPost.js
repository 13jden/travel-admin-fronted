import request from '@/utils/request'

/**
 * 设置稿件为推荐
 * @param {string} manuscriptId - 稿件ID
 * @returns {Promise}
 */
export function recommendManuscript(manuscriptId) {
  return request({
    url: '/manuscript-post/recommend',
    method: 'post',
    params: {
      manuscriptId
    }
  })
}

/**
 * 取消稿件推荐
 * @param {string} manuscriptId - 稿件ID
 * @returns {Promise}
 */
export function cancelRecommendManuscript(manuscriptId) {
  return request({
    url: '/manuscript-post/cancelRecommend',
    method: 'post',
    params: {
      manuscriptId
    }
  })
}

/**
 * 获取热度排行前5的视频
 * @returns {Promise}
 */
export function getHotTop5Videos() {
  return request({
    url: '/manuscript-post/hot-top5',
    method: 'get'
  })
} 