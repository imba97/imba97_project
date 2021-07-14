import { getCookie } from './cookie.js'

/**
 * 缓存目录
 */
export const tempDir = './temp'

export const getCommonHeaders = () => {
  return {
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
    Cookie: getCookie()
  }
}
