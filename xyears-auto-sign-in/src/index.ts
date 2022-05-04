import Sign from './sign'
import { getCookies } from './cookie'
import cron from 'node-cron'

// 定时任务 （秒 分 时 天 月 星期）
// 目前时 每天 0时 0分 5秒 执行
cron.schedule('5 0 0 * * *', () => {
  doSignin()
})

async function doSignin() {
  const cookies = getCookies()

  // 没 cookie 提示登录
  if (!cookies) {
    console.error('请先执行 npm run login 登录')
    return
  }

  const signResponse = await Sign.doSign(cookies)

  console.log(signResponse)
}
