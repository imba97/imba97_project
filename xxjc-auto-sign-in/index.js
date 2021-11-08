import axios from 'axios'
import _ from 'lodash'
import cron from 'node-cron'

const email = ''
const password = ''
const baseUrl = 'https://xxjc.vip'

// 定时任务 （秒 分 时 天 月 星期）
// 目前时 每天 0时 0分 5秒 执行
cron.schedule('5 0 0 * * *', () => {
  doSignin()
})

async function doSignin() {
  const data = new URLSearchParams()
  data.append('email', email)
  data.append('passwd', password)
  data.append('code', '')

  axios
    .post(`${baseUrl}/auth/login`, data, {
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    .then((res) => {
      let cookies = ''
      _.forEach(res.headers['set-cookie'], (cookie) => {
        const cookieSplit = cookie.split(' ')
        if (cookieSplit.length > 0) {
          cookies += cookieSplit[0]
        }
      })

      axios
        .post(
          `${baseUrl}/user/checkin`,
          {},
          {
            headers: {
              cookie: cookies,
              'user-agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          }
        )
        .then((checkinRes) => {
          console.log(checkinRes.data.msg)
        })
    })
}
