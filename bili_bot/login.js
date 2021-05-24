import axios from 'axios'
import _ from 'lodash'

import { setCookie, getCookie } from './cookie.js'

export function checkIsLogout() {{
  return axios.get('http://api.bilibili.com/nav', {
    headers: {
      Cookie: getCookie()
    }
  })
  .then(res => {
    if(res.data.code === -101) {
      setCookie('')
      return true
    }
    return false
  })
}}

export function doLogin() {

  return new Promise((resolve, reject) => {
    // 获取扫码登陆 URL
    axios.get('http://passport.bilibili.com/qrcode/getLoginUrl')
    .then(res => {
      // qrTerm.generate(res.data.data.url, { small: true }, function(qrcode) {
      //   // 生成二维码
      //   console.log(qrcode)
      // })
      console.log('请手动打开以下链接扫描二维码登陆')
      console.log(`https://wechaty.js.org/qrcode/${encodeURIComponent(res.data.data.url)}`)
      console.log('如果没有出现二维码，请复制以下链接，将其转换成二维码')
      console.log(res.data.data.url)

      // 检测状态
      const timer = setInterval(function() {

        const data = new URLSearchParams()
        data.append('oauthKey', res.data.data.oauthKey)

        axios.post('http://passport.bilibili.com/qrcode/getLoginInfo', data, {
          headers: {
            'content-type': 'application/x-www-form-urlencoded'
          }
        })
        .then(loginInfoRes => {
          if(typeof loginInfoRes.data.data === 'number') {
            // console.log(loginStatus(loginInfoRes.data.data))
            return
          }

          clearInterval(timer)

          // 设置 cookie
          let cookie = ''

          _.forEach(loginInfoRes.headers['set-cookie'], (item) => {
            const reg = /^(.*?=.*?; )/.exec(item)
            if(reg !== null) cookie += reg[1]
          })
          console.log('登陆成功')
          setCookie(cookie)
          resolve(cookie)
        })
      }, 2000)

    })
  })

}

function loginStatus(status) {
  switch(status) {
    case -1: return '密钥错误'
    case -2: return '密钥超时'
    case -4: return '未扫描'
    case -5: return '未确认'
  }
}