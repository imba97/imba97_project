import { writeFileSync } from 'fs'
import request from './request'
import { getCookies } from './cookie'

export default class Sign {
  /**
   * 签到
   *
   * 返回值
   * ```
   * { code: '0', message: '请登录后再签到!' }
   * { code: '-1', message: '今天已经签过啦！' }
   * ```
   */
  static async doSign(cookies: string) {
    return request({
      url: 'sg_sign.htm',
      method: 'POST',
      headers: {
        cookie: cookies,
        'x-requested-with': 'XMLHttpRequest'
      }
    })
  }
}
