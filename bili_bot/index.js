import axios from 'axios'
import { tempDir, getCommonHeaders } from './config.js'
import {
  imageHandle,
  getUserIsSend,
  setUserIsSend,
  getCodeMessage
} from './image.js'
import _ from 'lodash'

import { getCookie } from './cookie.js'
import { doLogin, checkIsLogout } from './login.js'

let cookie = ''
let sender_uid = ''
let csrf = ''
let commonHeaders
let checkInterval = 5000

// 登陆逻辑
if (cookie === '') {
  cookie = getCookie()
  if (cookie === '') {
    cookie = await doLogin()
  }

  sender_uid = parseInt(/DedeUserID=(\d+)/.exec(cookie)[1])
  csrf = /bili_jct=([a-z0-9]+)/.exec(cookie)[1]
  commonHeaders = getCommonHeaders()
}

const mainTimer = setInterval(async function () {
  // 获取消息数
  axios
    .get(
      'http://api.vc.bilibili.com/session_svr/v1/session_svr/single_unread',
      {
        headers: commonHeaders
      }
    )
    .then((singleUnreadRes) => {
      if (
        singleUnreadRes.data.code !== 0 ||
        singleUnreadRes.data.data.unfollow_unread +
          singleUnreadRes.data.data.follow_unread ===
          0
      )
        return

      // 获取消息
      axios
        .get(
          `https://api.vc.bilibili.com/session_svr/v1/session_svr/new_sessions?begin_ts=${
            new Date().getTime() - checkInterval
          }000&build=0&mobi_app=web`,
          {
            headers: commonHeaders
          }
        )
        .then((res) => {
          if (
            res.data.code !== 0 ||
            typeof res.data.data.session_list === 'undefined'
          )
            return

          _.forEach(res.data.data.session_list, (item) => {
            if (item.last_msg.sender_uid === sender_uid) return

            const type = item.last_msg.msg_type
            const getMessage = JSON.parse(item.last_msg.content)

            const msg = type === 1 ? getMessage.content : getMessage.url
            console.log('[接收]', msg)

            const codeMessage = getCodeMessage(msg)
            if (codeMessage !== false) {
              // 回复提示
              sendMsg(item.talker_id, codeMessage)
              // 设置为已发送关键词
              setUserIsSend(item.talker_id, msg, 1)
              readed(item)
              return
            }

            // 如果是图片
            if (type === 2) {
              imageHandle(item.talker_id, msg)

              readed(item)

              return
            }

            if (/梗百科 (.*)/.test(msg)) {
              const reg = /梗百科 (.*)/.exec(msg)
              if (!reg || !reg[1]) return

              axios
                .get(
                  `https://bili.imba97.cn/ji.php?kw=${encodeURIComponent(
                    reg[1]
                  )}`
                )
                .then((jiRes) => {
                  sendMsg(
                    item.talker_id,
                    jiRes.data.data.replace(/\\n\\n/, '\n')
                  )
                  readed(item)
                  return
                })
            }
          })
        })
    })
}, checkInterval)

function readed(item) {
  axios
    .get(
      `https://api.vc.bilibili.com/session_svr/v1/session_svr/update_ack?talker_id=${item.talker_id}&session_type=${item.session_type}&ack_seqno=${item.last_msg.msg_seqno}&build=0&mobi_app=web&csrf_token=${csrf}&csrf=${csrf}`,
      {
        headers: commonHeaders
      }
    )
    .then((updateRes) => {
      console.log(updateRes.data.code === 0 ? '已读成功' : '已读失败')
    })
}

export function sendMsg(uid, content, type = 1) {
  const sendMessageUrl = 'https://api.vc.bilibili.com/web_im/v1/web_im/send_msg'
  const config = {
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      ...commonHeaders
    }
  }

  /**
   * 来自 https://github.com/andywang425/BLTH/blob/45fe93e31754ca8bf07059d46266398e787dbf45/B%E7%AB%99%E7%9B%B4%E6%92%AD%E9%97%B4%E6%8C%82%E6%9C%BA%E5%8A%A9%E6%89%8B.js#L6618
   */
  const deviceid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    function (name) {
      let randomInt = (16 * Math.random()) | 0
      return ('x' === name ? randomInt : (3 & randomInt) | 8)
        .toString(16)
        .toUpperCase()
    }
  )

  const formData = new URLSearchParams()
  formData.append('msg[sender_uid]', sender_uid)
  formData.append('msg[receiver_id]', uid)
  formData.append('msg[receiver_type]', 1)
  formData.append('msg[msg_type]', type)
  formData.append('msg[msg_status]', 0)
  formData.append(
    'msg[content]',
    type === 1 ? `{"content":"${content}"}` : content
  )
  formData.append('msg[timestamp]', parseInt(new Date().getTime() / 1000))
  formData.append('msg[new_face_version]', 0)
  formData.append('msg[dev_id]', deviceid)
  formData.append('build', 0)
  formData.append('mobi_app', 'web')
  formData.append('csrf_token', csrf)
  formData.append('csrf', csrf)

  axios.post(sendMessageUrl, formData, config).then((sendMessageRes) => {
    console.log('[回复]', content)
  })
}

const checkIsLogoutTimer = setInterval(function () {
  checkIsLogout().then((isLogout) => {
    if (isLogout) {
      clearInterval(mainTimer)
      clearInterval(checkIsLogoutTimer)
      console.error('账号登陆状态失效')
    }
  })
}, 86400000)
