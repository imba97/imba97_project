// 登录命令

import { writeFileSync } from 'fs'
import _ from 'lodash'
import { setCookies } from './cookie'
import Login from './login'
import { axiosInstance } from './request'
import { findSetHeader } from './utils'
;(async () => {
  const email = _.get(process.argv, '2', null)
  const password = _.get(process.argv, '3', null)
  const vcode = _.get(process.argv, '4', null)

  // 有验证码执行登录
  if (email) {
    const res = await Login.doLogin(email, password, vcode)
    // 保存 bbs_token，获取 bbs_token 排除等于 deleted 的值
    const bbs_token = findSetHeader(res, 'bbs_token', 'deleted')

    if (!bbs_token?.value) {
      console.error('登录失败')
      return
    }

    // 写入 cookie
    setCookies({
      bbs_token: bbs_token.value
    })
  } else {
    // 获取 bbs_sid
    const loginCookie = await Login.getLoginCookie()
    if (!loginCookie?.bbs_sid?.value || !loginCookie?.cookie_test?.value) {
      console.error('loginCookie 获取失败')
      return
    }

    // 保存 cookie
    setCookies({
      bbs_sid: loginCookie.bbs_sid.value,
      cookie_test: loginCookie.cookie_test?.value
    })

    // 获取验证码图片
    const vcodeImage = await axiosInstance({
      url: 'vcode.htm',
      headers: {
        cookie: `${loginCookie.bbs_sid.cookie} ${loginCookie.cookie_test.cookie}`,
        'content-type': 'image/jpeg'
      },
      responseType: 'arraybuffer'
    }).then((res) => res.data)

    // 保存
    writeFileSync('vcode.jpg', vcodeImage)
  }
})()
