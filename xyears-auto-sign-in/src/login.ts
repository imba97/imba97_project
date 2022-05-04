import _ from 'lodash'
import crypto from 'crypto'
import request, { axiosInstance } from './request'
import { findSetHeader } from './utils'
import { getCookies } from './cookie'

export default class Login {
  static async getLoginCookie() {
    const res = await axiosInstance({
      url: 'user-login.htm',
      method: 'GET'
    })

    return {
      bbs_sid: findSetHeader(res, 'bbs_sid'),
      cookie_test: findSetHeader(res, 'cookie_test')
    }
  }

  static async doLogin(email: string, password: string, vcode: string) {
    password = crypto.createHash('md5').update(password).digest('hex')

    const cookie = await getCookies()

    return axiosInstance({
      url: 'user-login.htm',
      method: 'POST',
      headers: {
        cookie,
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'x-requested-with': 'XMLHttpRequest'
      },
      data: new URLSearchParams({
        email,
        password,
        vcode
      })
    })
  }
}
