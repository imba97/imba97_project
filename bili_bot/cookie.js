import fs from 'fs'

/**
 * cookie 储存文件
 */
export const cookieFile = './cookie.txt'

// 没有则创建
if(!fs.existsSync(cookieFile)) fs.writeFileSync(cookieFile, '', {
  'encoding': 'utf8'
})
// 获取 cookie
export const getCookie = () => fs.readFileSync(cookieFile).toString('utf8')

export const setCookie = (cookie) => {
  fs.writeFileSync(cookieFile, cookie)
}

export const getCsrf = () => {
  if(getCookie() !== '') return /bili_jct=([a-z0-9]+)/.test(cookie) ? /bili_jct=([a-z0-9]+)/.exec(cookie)[1] : null
}

export const getSender = () => {
  if(getCookie() !== '') return /DedeUserID=(\d+)/.test(cookie) ? /DedeUserID=(\d+)/.exec(cookie)[1] : null
}