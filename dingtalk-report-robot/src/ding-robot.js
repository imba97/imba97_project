const _ = require('lodash')
const ChatBot = require('dingtalk-robot-sender')
const cron = require('node-cron')

const config = require('./config')
const { getLog } = require('./util')

// 定时任务 （秒 分 时 天 月 星期）
// 目前时 每天 18时 0分 0秒 执行
cron.schedule('00 00 18 * * *', () => {
  sendReport()
})

function sendReport() {
  // 直接使用 webhook
  const robot = new ChatBot({
    webhook: `https://oapi.dingtalk.com/robot/send?access_token=${config.ding_talk_robot.token}`,
    accessToken: config.ding_talk_robot.token,
    secret: config.ding_talk_robot.secret
  })

  _.forEach(config.users_info, (user, index) => {
    setTimeout(() => {
      const at =
        _.has(user, 'phone') && /\d{11}/.test(user.phone) ? [user.phone] : null
      if (at !== null) {
        robot.text(`${user.name} 的日报：`, {
          atMobiles: at,
          isAtAll: false
        })
      } else {
        robot.text(`${user.name} 的日报：`)
      }

      let result = ''

      _.forEach(config.projects_path, (path, project_name) => {
        result += getLog(project_name, path, user)
      })

      setTimeout(() => {
        robot.text(result)
      }, 500)
    }, 1000 * index)
  })
}
